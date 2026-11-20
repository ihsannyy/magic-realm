# ═══════════════════════════════════════════════
# MAGIC TOWER — 3 lantai
# Center: 0, 64, 0. Radius: 8
# ═══════════════════════════════════════════════

# Bersihkan
fill -10 63 -10 10 90 10 air

# ─── Lantai 1: Entrance ───
fill -7 64 -7 7 64 7 deepslate_tiles
# Dinding melingkar (pakai fill bertingkat biar bulat)
fill -7 65 -7 7 70 -7 deepslate_bricks
fill -7 65 7 7 70 7 deepslate_bricks
fill -7 65 -7 -7 70 7 deepslate_bricks
fill 7 65 -7 7 70 7 deepslate_bricks
# Sudut dipotong (opsional biar keliatan bulat)
fill -8 65 -8 8 70 -8 air
fill -8 65 8 8 70 8 air
# Pintu masuk
fill -1 65 -7 1 67 -7 air
# Lampu gantung tengah
setblock 0 70 0 sea_lantern

# ─── Lantai 2: Library ───
fill -6 71 -6 6 71 6 deepslate_tiles
# Border rak buku
fill -6 72 -6 6 72 -6 bookshelf
fill -6 72 6 6 72 6 bookshelf
fill -6 72 -6 -6 72 6 bookshelf
fill 6 72 -6 6 72 6 bookshelf
# Altar kecil
setblock 0 72 0 enchanting_table

# ─── Lantai 3: Sanctum (top) ───
fill -5 73 -5 5 73 5 deepslate_tiles
fill -5 74 -5 5 74 5 air
setblock 0 74 0 amethyst_cluster
# Kubah atap
fill -3 75 -3 3 75 3 deepslate_bricks
fill -1 76 -1 1 76 1 deepslate_bricks

# ─── Tangga spiral (manual disederhanakan) ───
# Lantai 1 → 2
setblock -5 64 -5 stone_brick_stairs
setblock -4 65 -4 stone_brick_stairs
setblock -3 66 -3 stone_brick_stairs
setblock -2 67 -2 stone_brick_stairs
setblock -1 68 -1 stone_brick_stairs
setblock 0 69 0 stone_brick_stairs
setblock 1 70 1 stone_brick_stairs

say §d✨ Magic Tower built!