# ═══════════════════════════════════════════════
# SETUP SPAWN — teleport player ke arena
# ═══════════════════════════════════════════════

# Teleport ke arena
tp @s 0 65 0

# Beri wand
give @s magicrealm:wand

# Beri portal block (buat testing)
give @s magicrealm:aether_portal 4

# Efek sambutan
effect @s regeneration 5 1 true
effect @s resistance 5 1 true

# Pesan
tellraw @s {"rawtext":[{"text":"§d✨ §fSelamat datang di §dMagic Realm§f!"}]}
tellraw @s {"rawtext":[{"text":"§7Kamu sudah mendapat Wand. Klik kanan untuk cast fireball!"}]}
tellraw @s {"rawtext":[{"text":"§7Ketik §e/function reset_arena §7untuk reset arena"}]}