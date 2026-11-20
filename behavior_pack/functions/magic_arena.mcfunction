# ═══════════════════════════════════════════════
# MAGIC ARENA — Sanctuary Sihir
# Ukuran: 21×21 area, tinggi 8
# Center: 0, 64, 0
# ═══════════════════════════════════════════════

# ─── Bersihkan area dulu ───
fill -12 63 -12 12 75 12 air

# ─── Platform dasar (batu bata deepslate) ───
fill -10 63 -10 10 63 10 deepslate_bricks

# ─── Border luar (chiseled deepslate) ───
fill -10 63 -10 10 63 -10 chiseled_deepslate
fill -10 63 10 10 63 10 chiseled_deepslate
fill -10 63 -10 -10 63 10 chiseled_deepslate
fill 10 63 -10 10 63 10 chiseled_deepslate

# ─── Pola dalam (bulat dekoratif) ───
fill -6 63 -6 6 63 6 polished_deepslate
fill -4 63 -4 4 63 4 deepslate_tiles

# ─── Altar tengah (3×3×2) ───
fill -1 64 -1 1 65 1 polished_blackstone
setblock 0 65 0 lodestone
setblock 0 66 0 amethyst_cluster

# ─── 4 pilar utama ───
# Pilar kiri-depan
fill -8 64 -8 -8 70 -8 deepslate_bricks
setblock -8 71 -8 sea_lantern
# Pilar kanan-depan
fill 8 64 -8 8 70 -8 deepslate_bricks
setblock 8 71 -8 sea_lantern
# Pilar kiri-belakang
fill -8 64 8 -8 70 8 deepslate_bricks
setblock -8 71 8 sea_lantern
# Pilar kanan-belakang
fill 8 64 8 8 70 8 deepslate_bricks
setblock 8 71 8 sea_lantern

# ─── Hiasan pilar (amethyst di tengah) ───
setblock -8 67 -8 amethyst_block
setblock 8 67 -8 amethyst_block
setblock -8 67 8 amethyst_block
setblock 8 67 8 amethyst_block

# ─── Portal (belakang altar) ───
# Frame obsidian 4×5
fill -1 64 5 1 67 5 obsidian
fill 0 64 5 0 67 5 crying_obsidian
# Isi portal (portal block nanti ganti dengan magicrealm:aether_portal)
fill 0 65 5 0 66 5 nether_portal

# ─── Lampu gantung langit-langit ───
setblock -5 74 -5 sea_lantern
setblock 5 74 -5 sea_lantern
setblock -5 74 5 sea_lantern
setblock 5 74 5 sea_lantern
setblock 0 74 0 sea_lantern

# ─── Border bunga / tanaman ───
fill -9 64 -9 -9 64 -9 azure_bluet
fill 9 64 -9 9 64 -9 azure_bluet
fill -9 64 9 -9 64 9 azure_bluet
fill 9 64 9 9 64 9 azure_bluet

# ─── Papan selamat datang (sign) ───
setblock -3 64 -9 oak_sign
# Note: isi sign via command terpisah (lihat bagian bawah)