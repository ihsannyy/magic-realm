# 🪄 Magic Realm

Addon **Minecraft Bedrock** (`.mcaddon`) bertema sihir: mana, tongkat, fireball, portal teleport, arena, dan auto-setup.

> **Status:** F1 MVP — sudah di-build, siap diuji dan dibagikan.
> **Edisi Public:** tanpa experiment sama sekali. Minimal Minecraft **1.20+**.

---

## ✨ Yang sudah ada di F1

| Fitur | Keterangan |
|---|---|
| 💠 **Mana** | Maksimal 100, tampil di actionbar, pulih +1 tiap 2 detik |
| 🪄 **Wand / Fireball** | Tap tongkat → fireball dengan efek api + asap. Biaya 15 mana, cooldown 3 detik |
| 🌀 **Portal** | Tap `lodestone` pakai tongkat → teleport. Portal di tujuan dipakai untuk balik |
| 🏟️ **Arena** | Arena 21×21 di `0, 64, 0`, dibuat otomatis atau lewat `/function magic_arena` |
| 🚀 **Auto-setup** | Player baru otomatis teleport ke arena, dapat tongkat, dan pesan welcome |

---

## 📦 Download

| File | Edisi | Experiment | Tongkat | Catatan |
|---|---|---|---|---|
| **[`magic_realm_v1.0.mcaddon`](builds/magic_realm_v1.0.mcaddon)** | **Public** ⭐ | **Tidak ada** | `minecraft:blaze_rod` | Pakai ini untuk dibagikan ke siapa pun |
| [`magic_realm_dev_v1.0.mcaddon`](builds/magic_realm_dev_v1.0.mcaddon) | Dev / F1 | Tidak ada di MC ≥ 1.21.20 | `magicrealm:wand` (texture custom) | Untuk debugging item kustom |

Detail tiap file ada di [`builds/README.md`](builds/README.md).

---

## 🚀 Mulai Cepat (Edisi Public)

1. Download / import **`builds/magic_realm_v1.0.mcaddon`** ke Minecraft.
2. Buat **world baru**:
   - **Cheats: ON**
   - **Experiment: tidak perlu aktif**
3. Tab **Behavior Packs → My Packs** → aktifkan **Magic Realm Public [BP]**.
4. Tab **Resource Packs → My Packs** → aktifkan **Magic Realm Public [RP]**.
5. Buat world, lalu **restart world** sekali (keluar → masuk lagi).
6. Di chat, ketik:
   ```
   /function setup_spawn
   /function place_portal
   ```
7. Selesai — pegang **blaze rod** (itu tongkatnya) dan mulai main.

> Player baru juga dapat tongkat otomatis saat join. Command di atas dipakai kalau kamu sudah ada di world atau ingin mengulang setup.

---

## 🎮 Cara Main

| Aksi | Hasil |
|---|---|
| Tap **blaze rod** di udara / ke blok | 🔥 Fireball keluar, mana −15 |
| Tap **lodestone** pakai blaze rod | 🌀 Teleport ke arena `10000, ~, 10000` |
| Tap portal di arena tujuan | 🔙 Kembali ke lokasi semula |
| Tunggu 2 detik | 💠 Mana +1 sampai penuh (100) |

Catatan: cooldown fireball **3 detik**. Kalau tap cepat berturut dan tidak keluar, tunggu sebentar atau lihat actionbar.

---

## ⌨️ Daftar Command

Semua command butuh **Cheats ON**. Nama function ditulis **tanpa** `.mcfunction`.

### Umum (Public & Dev)

| Command | Fungsi |
|---|---|
| `/function setup_spawn` | Teleport ke arena, kasih tongkat + regeneration & resistance |
| `/function magic_arena` | Bangun arena 21×21 lengkap dengan altar & portal |
| `/function reset_arena` | Bersihkan area, lalu bangun ulang arena |
| `/function place_portal` | Pasang `minecraft:lodestone` di posisi kamu (portal) |
| `/function magic_tower` | Bangun menara 3 lantai (bonus, file lama) |
| `/give @s minecraft:blaze_rod` | Tongkat manual untuk **edisi Public** |
| `/setblock ~ ~ ~ minecraft:lodestone` | Pasang portal manual (paling aman di semua versi) |
| `/scoreboard objectives setdisplay sidebar mana` | Tampilkan mana di sidebar (debug) |
| `/reload` | Reload **function** setelah edit file |

### Debug lewat Script Event

| Command | Fungsi |
|---|---|
| `/scriptevent magicrealm:cast fireball` | Cast fireball lewat chat (cadangan kalau tap bermasalah) |
| `/scriptevent magicrealm:portal` | Pakai portal dari posisi saat ini |
| `/scriptevent magicrealm:setup` | Ulangi auto-setup player |

### Khusus Build Dev

| Command | Catatan |
|---|---|
| `/give @s magicrealm:wand` | Tongkat dengan texture custom |
| `/setblock ~ ~ ~ magicrealm:aether_portal` | Bisa ditolak di beberapa versi — gunakan `lodestone` kalau error |

---

## 🛠️ Troubleshooting

| Masalah | Solusi |
|---|---|
| `/function` bilang *Unknown command* | Cheats mati, atau BP belum aktif → aktifkan & restart world |
| Script tidak jalan | Cek log `logs/latest.log`, cari `[MagicRealm] F1 initialized` |
| Tap tidak keluar fireball | Pastikan blaze rod dipegang, tunggu cooldown 3 detik, atau pakai `/scriptevent magicrealm:cast fireball` |
| Portal tidak merespons | Harus ditap **pakai tongkat** di tangan, bukan tangan kosong |
| `/setblock magicrealm:aether_portal` error | Itu wajar di build Public — pakai `/function place_portal` |
| Setelah edit file tidak berubah | `/reload` untuk function; **script butuh restart world** |

---

## 🧱 Build dari Source

Butuh `python3`, `node`, dan `zip` (sudah ada di Termux).

```sh
sh build.sh
```

Script ini memvalidasi semua JSON/JS, lalu menulis kedua `.mcaddon` ke folder `builds/`.

---

## 📁 Struktur Repo

```
.
├── behavior_pack/     # manifest, script JS, function, item, block, recipe
├── resource_pack/     # texture, lang, item_texture, terrain_texture
├── builds/            # hasil .mcaddon + README distribusi
├── build.sh           # script build
└── README.md          # dokumentasi ini
```

---

## 📝 Catatan Teknis

- `@minecraft/server` **`1.11.0`** — modul **stable**, jadi **Beta APIs tidak diperlukan**.
- Input memakai `world.beforeEvents.itemUse` + `playerInteractWithBlock`; semua perubahan world ditunda lewat `system.run()` agar bekerja di Bedrock PE / Android.
- Portal memakai blok vanilla `minecraft:lodestone` supaya tidak bergantung pada custom block yang sering ditolak `/setblock`.
- Edisi Public sengaja memakai item vanilla agar bisa dipakai di world mana pun tanpa experiment.
