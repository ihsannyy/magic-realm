# ═══════════════════════════════════════════════
# SETUP SPAWN — teleport ke arena + kasih wand
# Sengaja TIDAK menyebut blok addon supaya function
# tetap jalan walau definisi blok bermasalah.
# ═══════════════════════════════════════════════

tp @s 0 65 0
give @s magicrealm:wand 1
effect @s regeneration 5 1 true
effect @s resistance 5 1 true
say §d✨ Setup selesai: teleport ke arena + wand diberikan.
