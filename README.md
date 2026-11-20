# Magic Realm

Addon Minecraft Bedrock (`.mcaddon`) bertema sihir: mana, tongkat, fireball, portal teleport, arena, dan auto-setup. Saat ini **F1 MVP** sudah di-build dan siap diuji.

## Download

Ambil file dari [`builds/`](builds/):

- **`magic_realm_v1.0.mcaddon`** — edisi **Public**, tanpa experiment. Direkomendasikan untuk dibagikan.
- `magic_realm_dev_v1.0.mcaddon` — edisi Dev/F1 dengan custom item untuk debugging.

Detail lengkap ada di [`builds/README.md`](builds/README.md).

## Mulai main (edisi Public)

1. Import `builds/magic_realm_v1.0.mcaddon`.
2. Buat world baru dengan **Cheats ON**. Experiment **tidak perlu** diaktifkan.
3. Aktifkan `Magic Realm Public [BP]` dan `Magic Realm Public [RP]`, lalu restart world.
4. Di game:
   - `/function setup_spawn` → teleport ke arena dan dapat **blaze rod** (tongkat).
   - `/function place_portal` → pasang **lodestone** sebagai portal.
   - Tap blaze rod → fireball (15 mana, cooldown 3 detik).
   - Tap lodestone pakai blaze rod → teleport; tap portal di tujuan untuk balik.
   - Mana pulih +1 tiap 2 detik sampai 100.

## Bangun ulang dari source

```sh
sh build.sh
```

Script ini memvalidasi semua JSON/JS, lalu menulis kedua `.mcaddon` ke folder `builds/`. Butuh `python3`, `node`, dan `zip` (sudah tersedia di Termux).

## Struktur

```
behavior_pack/   manifest, script JS, function, item, block, recipe
resource_pack/   texture, lang, item_texture, terrain_texture
builds/          hasil .mcaddon + README
build.sh         script build
PRD.md           spesifikasi dan roadmap produk
```

## Catatan teknis

- `@minecraft/server` **`1.11.0`** (stable, bukan beta) → **Beta APIs tidak diperlukan**.
- Input memakai `world.beforeEvents.itemUse` dan `playerInteractWithBlock`, dengan aksi gameplay ditunda lewat `system.run()` agar bekerja di Bedrock PE.
- Portal memakai blok vanilla `minecraft:lodestone` supaya tidak bergantung pada custom block yang sering ditolak `/setblock`.
