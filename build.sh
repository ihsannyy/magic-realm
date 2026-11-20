#!/bin/sh
# ═══════════════════════════════════════════════════════════════
# Magic Realm — build script
# Hasil: builds/magic_realm_v1.0.mcaddon         (Public, tanpa experiment)
#        builds/magic_realm_dev_v1.0.mcaddon     (Dev/F1, item kustom)
# ═══════════════════════════════════════════════════════════════
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
OUT="$ROOT/builds"
TMP_BASE="${TMPDIR:-/data/data/com.termux/files/home/.tmp/opencode}"
mkdir -p "$OUT" "$TMP_BASE"
STAGE=$(mktemp -d "$TMP_BASE/magicrealm-build.XXXXXX")
trap 'rm -rf "$STAGE"' EXIT INT TERM

echo '[1/5] Validasi JSON...'
for f in $(find "$ROOT/behavior_pack" "$ROOT/resource_pack" -name '*.json'); do
  python3 -m json.tool "$f" >/dev/null
done
echo '      OK'

echo '[2/5] Validasi JS...'
for f in $(find "$ROOT/behavior_pack/scripts" -name '*.js'); do
  cp "$f" "$STAGE/src_$(basename "$f").mjs"
  node --check "$STAGE/src_$(basename "$f").mjs" >/dev/null
done
echo '      OK'

echo '[3/5] Build edisi Dev/F1...'
rm -f "$OUT/magic_realm_dev_v1.0.mcaddon"
( cd "$ROOT" && zip -r -9 -q "$OUT/magic_realm_dev_v1.0.mcaddon" \
    behavior_pack resource_pack -x '*.git*' '*/.DS_Store' )

echo '[4/5] Build edisi Public...'
cp -a "$ROOT/behavior_pack" "$ROOT/resource_pack" "$STAGE"/
python3 - "$STAGE" <<'PY'
import json, os, sys

stage = sys.argv[1]
bp = os.path.join(stage, 'behavior_pack')
rp = os.path.join(stage, 'resource_pack')

# UUID statis: update berikutnya tidak perlu hapus pack lama di game.
BP_HEADER = 'e37f1638-969d-42c4-a250-078136822c62'
BP_DATA = 'b5ddde8c-e59f-43e3-8a87-acc1d1f6c7cb'
BP_SCRIPT = '08f32db5-7f57-4ca6-80ca-2944c6fbbea6'
RP_HEADER = '28cb3a0a-348f-46e0-91be-2ed7a016907d'
RP_RESOURCES = 'a7f6f2bf-2618-4545-b34b-6a3786a3c8ee'

def load(path):
    with open(path, encoding='utf-8') as fh:
        return json.load(fh)

def dump(path, data):
    with open(path, 'w', encoding='utf-8') as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)

p = os.path.join(bp, 'manifest.json')
d = load(p)
d['header']['name'] = 'Magic Realm Public [BP]'
d['header']['description'] = 'Magic Realm — edisi tanpa experiment. Wand = Blaze Rod, portal = Lodestone.'
d['header']['uuid'] = BP_HEADER
d['modules'][0]['uuid'] = BP_DATA
d['modules'][1]['uuid'] = BP_SCRIPT
dump(p, d)

p = os.path.join(rp, 'manifest.json')
d = load(p)
d['header']['name'] = 'Magic Realm Public [RP]'
d['header']['description'] = 'Texture dan localization Magic Realm edisi Public.'
d['header']['uuid'] = RP_HEADER
d['modules'][0]['uuid'] = RP_RESOURCES
d['dependencies'][0]['uuid'] = BP_HEADER
dump(p, d)

# Tanpa konten kustom → tidak butuh Holiday Creator Features di MC lama.
for rel in ('items/wand.json', 'blocks/aether_portal.json', 'recipes/wand.json'):
    path = os.path.join(bp, rel)
    if os.path.exists(path):
        os.remove(path)

def replace(path, old, new):
    with open(path, encoding='utf-8') as fh:
        text = fh.read()
    if old not in text:
        raise SystemExit('Tidak ditemukan di %s: %s' % (path, old))
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(text.replace(old, new))

replace(os.path.join(bp, 'scripts/main.js'),
        "const WAND_ID = 'magicrealm:wand';",
        "const WAND_ID = 'minecraft:blaze_rod';")
replace(os.path.join(bp, 'scripts/portal.js'),
        "export const PORTAL_BLOCK_ID = 'magicrealm:aether_portal';",
        "export const PORTAL_BLOCK_ID = 'minecraft:lodestone';")
replace(os.path.join(bp, 'functions/setup_spawn.mcfunction'),
        'give @s magicrealm:wand 1',
        'give @s minecraft:blaze_rod 1')
PY

for f in $(find "$STAGE/behavior_pack" "$STAGE/resource_pack" -name '*.json'); do
  python3 -m json.tool "$f" >/dev/null
done
for f in $(find "$STAGE/behavior_pack/scripts" -name '*.js'); do
  cp "$f" "$STAGE/pub_$(basename "$f").mjs"
  node --check "$STAGE/pub_$(basename "$f").mjs" >/dev/null
done

rm -f "$OUT/magic_realm_v1.0.mcaddon"
( cd "$STAGE" && zip -r -9 -q "$OUT/magic_realm_v1.0.mcaddon" \
    behavior_pack resource_pack -x '*.git*' '*/.DS_Store' )

echo '[5/5] Cek integritas...'
unzip -t "$OUT/magic_realm_dev_v1.0.mcaddon" | tail -1
unzip -t "$OUT/magic_realm_v1.0.mcaddon" | tail -1
ls -lh "$OUT"/*.mcaddon
echo 'Selesai.'
