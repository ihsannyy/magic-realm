# Magic Realm — Hasil Build

Folder ini berisi file `.mcaddon` siap import. Dibuat dari root repo dengan:

```sh
sh build.sh
```

## File

| File | Edisi | Experiment | Wand | Portal | Catatan |
|---|---|---|---|---|---|
| `magic_realm_v1.0.mcaddon` | **Public** (utama) | **Tidak ada** | `minecraft:blaze_rod` | `minecraft:lodestone` | Dipakai untuk dibagikan ke semua orang. Minimal MC 1.20. |
| `magic_realm_dev_v1.0.mcaddon` | Dev / F1 | Tidak ada di MC ≥ 1.21.20. Di MC lebih lama butuh `Holiday Creator Features` untuk custom item. | `magicrealm:wand` (texture custom) | `minecraft:lodestone` | Versi debugging dengan item kustom. `Beta APIs` **tidak perlu** (API `1.11.0` stabil). |

Keduanya memakai `Cheats: ON` di world untuk `/function`, `/give`, dan `/scriptevent`.

## Cara pakai edisi Public

1. Import `magic_realm_v1.0.mcaddon`.
2. Buat world baru → Cheats ON → **experiment tidak perlu aktif**.
3. Aktifkan `Magic Realm Public [BP]` + `Magic Realm Public [RP]`.
4. Restart world.
5. `/function setup_spawn` → dapat **blaze rod** (wand).
6. `/function place_portal` → pasang lodestone.
7. Tap blaze rod → fireball. Tap lodestone pakai blaze rod → teleport.

## Catatan UUID

Edisi Public punya UUID berbeda dari edisi Dev supaya bisa di-import berdampingan. UUID disimpan tetap di `build.sh` agar update berikutnya tidak perlu menghapus pack lama.
