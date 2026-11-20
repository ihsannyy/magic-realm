# PRD: Magic Realm — Minecraft Bedrock Addon

**Version:** 1.0  
**Status:** Draft  
**Author:** @Shannyie  
**Last Updated:** 2026-11-20  
**Target Platform:** Minecraft Bedrock Edition (Android/iOS/Windows)  
**Development Environment:** Termux (Android), no PC required

---

## 1. Overview

**Magic Realm** adalah addon Minecraft Bedrock yang menambahkan sistem sihir lengkap ke dalam game: dimension baru, sistem mana, spell casting, spell altar, mage mobs, dan boss fight.

**Elevator pitch:** "Spider-Man + Skyrim magic di Minecraft Bedrock, tanpa mod loader, tanpa PC."

**Distribusi:** `.mcaddon` (behavior pack + resource pack), publish di MCPEDL.

---

## 2. Goals

### Primary Goals (harus tercapai)
- [ ] Player bisa cast minimal 5 spell dengan sistem mana yang balance
- [ ] Ada spell altar untuk "belajar" spell (progression)
- [ ] Player bisa teleport ke dimension baru "Aether" via portal
- [ ] Ada minimal 1 boss dengan 3 fase
- [ ] Bisa di-install via `.mcaddon` tanpa compile, tanpa PC

### Secondary Goals (nice to have)
- [ ] 2+ mage mob dengan AI berbeda
- [ ] Custom ambient sound per dimension
- [ ] Progression: spell level up (makin sering dipakai, makin kuat)
- [ ] Publish di MCPEDL dengan landing page

### Non-Goals (JANGAN dikerjakan)
- ❌ Custom 3D models (pakai vanilla entity + texture)
- ❌ Custom shader / rendering effect
- ❌ Multiplayer server backend (semua client-side)
- ❌ Java Edition support (Bedrock only)
- ❌ Custom GUI kompleks (pakai form API standar atau chat command)
- ❌ Marketplace publish (butuh partner program, skip)

---

## 3. Target User

- **Primary:** Minecraft Bedrock player yang suka sihir/magic mod, umur 10-25 tahun
- **Secondary:** Server owner yang mau tambah mechanic baru tanpa mod loader
- **Tertiary:** Konten kreator yang cari addon baru untuk direview

**User pain points yang disolve:**
- Vanilla Bedrock nggak punya sistem sihir
- Addon magic yang ada biasanya Cuma 1-2 spell, dangkal
- Banyak addon butuh PC untuk setup

---

## 4. Tech Stack

| Layer | Tech |
|---|---|
| **Language** | JavaScript (ES2020) untuk script, JSON untuk definisi |
| **API** | `@minecraft/server` v1.11.0 (WAJIB pin version) |
| **Script Runtime** | Bedrock Script Engine (built-in) |
| **Dev Environment** | Termux (nano/vim, zip, python3 untuk validasi) |
| **Test** | Minecraft Bedrock app (Android) |
| **Distribution** | `.mcaddon` file (zip of BP + RP) |

**Wajib aktifkan di world:**
- Experiments → `Beta APIs` ✅
- Experiments → `Holiday Creator Features` ✅
- Experiments → `Upcoming Creator Features` ✅

---

## 5. Constraints

- **No PC:** semua development dari HP/Termux
- **No compile step:** JavaScript & JSON — edit file → `/reload` di game
- **UUID unik:** setiap manifest butuh UUID berbeda (generate di uuidgenerator.net)
- **Experimental API:** dimension API masih beta, bisa break antar versi MC
- **File size:** final `.mcaddon` harus < 5 MB (untuk distribusi ringan)
- **Scripts size:** total JS < 500 KB (Bedrock limit)
- **No external libraries:** hanya API built-in Minecraft

---

## 6. Architecture

### Folder Structure

```

magic_realm/
├── behavior_pack/
│   ├── manifest.json                    # UUIDs: 3 (data, script, header)
│   ├── pack_icon.png                    # 256x256
│   ├── dimensions/
│   │   └── aether.json
│   ├── biomes/
│   │   └── aether_forest.json
│   ├── blocks/
│   │   ├── aether_portal.json
│   │   └── spell_altar.json
│   ├── items/
│   │   ├── wand.json
│   │   ├── spell_scroll.json
│   │   └── mana_crystal.json
│   ├── entities/
│   │   ├── aether_mage.json
│   │   └── aether_lord.json
│   ├── loot_tables/
│   │   └── entities/aether_lord.json
│   ├── functions/
│   │   ├── magic_arena.mcfunction
│   │   ├── setup_spawn.mcfunction
│   │   └── reset_arena.mcfunction
│   ├── recipes/
│   │   ├── wand.json
│   │   └── spell_scroll_fireball.json
│   ├── trading/
│   │   └── mage_trades.json
│   └── scripts/
│       ├── main.js                      # entry point
│       ├── mana.js                      # mana system
│       ├── spells/
│       │   ├── index.js                 # registry
│       │   ├── fireball.js
│       │   ├── heal.js
│       │   ├── shield.js
│       │   ├── teleport.js
│       │   └── freeze.js
│       ├── portal.js
│       ├── altar.js
│       └── utils/
│           ├── cooldown.js
│           └── ui.js
└── resource_pack/
├── manifest.json                    # UUIDs: 2 (resources, header)
├── pack_icon.png
├── textures/
│   ├── blocks/
│   │   ├── aether_portal.png        # 16x16
│   │   └── spell_altar.png          # 16x16
│   ├── items/
│   │   ├── wand.png                 # 16x16
│   │   ├── spell_scroll.png         # 16x16
│   │   └── mana_crystal.png         # 16x16
│   └── entity/
│       ├── aether_mage.png          # 64x64
│       └── aether_lord.png          # 128x128
├── texts/
│   ├── en_US.lang
│   └── id_ID.lang
└── sounds/
└── magic/
├── cast.ogg
├── portal.ogg
└── altar.ogg

```

### System Architecture

```

┌──────────────────────────────────────────────┐
│  main.js (entry point)                       │
│   ├─ initManaSystem()                        │
│   ├─ initSpellRegistry()                     │
│   ├─ initPortal()                            │
│   ├─ initAltar()                             │
│   └─ registerEvents()                        │
└──────────────────────────────────────────────┘
↓            ↓            ↓
┌────────┐  ┌─────────┐  ┌──────────┐
│ mana.js│  │spells/  │  │portal.js │
│        │←─│ index.js│  │altar.js  │
└────────┘  └─────────┘  └──────────┘
↓            ↓            ↓
┌────────────────────────────────────┐
│  Bedrock Script API                │
│  @minecraft/server v1.11.0         │
└────────────────────────────────────┘

```

**Data persistence:** semua state player (mana, spell known, cooldown) disimpan di **scoreboard** (persist via `/reload` dan antar session). Jangan pakai `world.dynamicProperties` karena ribet backup.

---

## 7. Features Breakdown

### FASE 1 — MVP (Target: 7 hari)

**Tujuan:** playable core loop — spawn → dapat wand → cast fireball → masuk portal.

#### F1.1 — Wand Item
- **File:** `items/wand.json`, `textures/items/wand.png`, `recipes/wand.json`
- **Behavior:** durability 1000, damage 2, hand_equipped, cooldown 0.3s
- **Recipe:** blaze rod (B) + stick (S), pattern `[_, B, _], [_, S, _]`
- **Acceptance:** `/give @s magicrealm:wand` → muncul di inventory → bisa klik kanan

#### F1.2 — Mana System
- **File:** `scripts/mana.js`
- **Behavior:**
  - Max mana: 100
  - Regen: +1 per 2 detik (40 tick)
  - Disimpan di scoreboard objective `mana`
  - Display: actionbar dengan visual bar (`████░░░░░░`)
  - Function: `getMana(player)`, `setMana(player, value)`, `useMana(player, amount)`, `showManaBar(player)`
- **Acceptance:** Player baru punya 100 mana, regen saat kosong, actionbar muncul tiap cast

#### F1.3 — Fireball Spell
- **File:** `scripts/spells/fireball.js`
- **Behavior:**
  - Cost: 15 mana
  - Cooldown: 3 detik per player
  - Spawn `minecraft:fireball` di arah view player
  - Particle: `minecraft:basic_flame_particle`
  - Sound: `mob.blaze.shoot`
  - Actionbar: `§c🔥 FIREBALL!`
- **Trigger:** `world.afterEvents.itemUse` dengan wand → cast
- **Acceptance:** Klik kanan pakai wand → fireball meluncur → kena block/mob → explode

#### F1.4 — Portal Block
- **File:** `blocks/aether_portal.json`, `textures/blocks/aether_portal.png`
- **Behavior:** light_emission 15, indestructible, clickable
- **Trigger:** Klik portal dengan wand → teleport ke dimension Aether (atau ke arena kalau dimension gagal)
- **Acceptance:** `/setblock ~ ~ ~ magicrealm:aether_portal` → block muncul → klik pakai wand → teleport

#### F1.5 — Arena Build (mcfunction)
- **File:** `functions/magic_arena.mcfunction`, `functions/setup_spawn.mcfunction`, `functions/reset_arena.mcfunction`
- **Behavior:** build arena 21×21×8 di koordinat 0,63,0
- **Acceptance:** `/function magic_arena` → arena muncul instan

#### F1.6 — Auto-setup on Join
- **File:** `scripts/main.js` (handler `world.afterEvents.playerSpawn`)
- **Behavior:** player pertama join → teleport ke arena, dapat wand, welcome message
- **Acceptance:** Player baru spawn → langsung di arena → dapat wand

---

### FASE 2 — Spell Expansion (Target: 7 hari setelah F1)

#### F2.1 — Spell Registry Pattern
- **File:** `scripts/spells/index.js`
- **Behavior:** registry pattern — tiap spell = object `{ id, name, cost, cooldown, cast(player) }`
- **Acceptance:** tambah spell baru cukup tambah file + registrasi 1 baris

#### F2.2 — 4 Spell Tambahan
Tiap spell wajib punya: cost, cooldown, particle, sound, actionbar feedback.

| Spell | Cost | Cooldown | Efek |
|---|---|---|---|
| **Heal** | 25 | 10s | `effect @s regeneration 5 2` + particle heart |
| **Shield** | 20 | 15s | `effect @s resistance 10 2` + particle barrier |
| **Teleport** | 30 | 8s | Teleport 10 block ke arah view + particle end_rod |
| **Freeze** | 15 | 5s | Raycast 8 block → `effect @e[type=!player] slowness 5 3` + particle snowflake |

**Acceptance:** Semua spell bisa di-cast via wand (rotasi via scroll), feedback visual + audio jelas

#### F2.3 — Spell Scroll Item
- **File:** `items/spell_scroll.json`, `textures/items/spell_scroll.png`
- **Behavior:** Item yang kalau di-`use` → unlock spell di player (`/tag @s add spell_fireball`)
- **Variants:** 1 scroll per spell (5 total), texture sama tapi nama beda
- **Recipe:** paper + amethyst shard + ink sac
- **Acceptance:** Pakai scroll → chat "Unlocked Fireball" → wand sekarang bisa cast fireball

#### F2.4 — Spell Altar
- **File:** `blocks/spell_altar.json`, `textures/blocks/spell_altar.png`, `scripts/altar.js`
- **Behavior:**
  - Block interaktif, klik → buka "menu" via chat form (pakai `player.sendMessage` + command)
  - Menu: list spell yang bisa di-unlock (butuh scroll di inventory)
  - Kalau player punya scroll → consume scroll → unlock spell
- **Acceptance:** Klik altar → muncul daftar spell → pilih → unlock

#### F2.5 — Wand Cycling
- **File:** `scripts/spells/index.js`
- **Behavior:** Sneak + klik kanan = ganti spell (cycle). Actionbar nampilkan spell aktif.
- **Acceptance:** Sneak + klik → nama spell berubah di actionbar

---

### FASE 3 — Dimension Aether (Target: 7 hari setelah F2)

#### F3.1 — Dimension Config
- **File:** `dimensions/aether.json`
- **Behavior:** dimension baru `magicrealm:aether`, generator overworld, sky color `#4a1b6d`
- **⚠️ Risk:** format experimental, cek `bedrock.dev` untuk versi MC user
- **Fallback:** kalau error, **skip dimension**, teleport ke arena besar di Overworld (koordinat 10000, 64, 10000)
- **Acceptance:** Teleport ke dimension → tidak crash → bisa balik ke Overworld

#### F3.2 — Portal Teleport Logic
- **File:** `scripts/portal.js`
- **Behavior:**
  - Klik portal (di Overworld) dengan wand → simpan lokasi Overworld di scoreboard → teleport ke Aether
  - Klik portal (di Aether) dengan wand → teleport balik ke lokasi terakhir di Overworld
- **Acceptance:** PP antar dimension, lokasi return tepat

#### F3.3 — Aether Biome
- **File:** `biomes/aether_forest.json`
- **Behavior:** biome custom dengan grass color ungu, foliage ungu, ambient sound end
- **Acceptance:** Di Aether, rumput berwarna ungu

#### F3.4 — Mage Mob
- **File:** `entities/aether_mage.json`, `textures/entity/aether_mage.png`
- **Behavior:**
  - Base entity: `minecraft:zombie` (inherit AI)
  - Behavior: ranged attack fireball, health 30, damage 4
  - Spawn rule: Aether dimension, light level < 10
  - Drop: 1-2 mana crystal
- **Acceptance:** Spawn di Aether → tembak player dengan fireball → drop mana crystal saat mati

---

### FASE 4 — Boss (Target: 7 hari setelah F3)

#### F4.1 — Aether Lord Boss
- **File:** `entities/aether_lord.json`, `textures/entity/aether_lord.png`, `loot_tables/entities/aether_lord.json`
- **Behavior:**
  - Health: 500
  - 3 fase: normal (500-300 HP) → summon minions (300-100 HP) → enrage (100-0 HP)
  - Attack: melee 10 damage, ranged blast 5 damage AoE
  - Summon: 2-4 mage minions per 10 detik di fase 2
  - Enrage: speed boost + damage boost di fase 3
  - Loot: legendary wand (`magicrealm:wand_legendary`), 5-10 amethyst, 1 netherite ingot
- **Acceptance:** Boss fight selesai dalam 5-10 menit, drop legendary wand

#### F4.2 — Boss Spawn Structure
- **File:** `functions/aether_throne.mcfunction`
- **Behavior:** build throne room di koordinat 0,64,0 di dimension Aether
- **Acceptance:** `/function aether_throne` (di Aether) → structure muncul

#### F4.3 — Boss Summon Ritual
- **File:** `scripts/boss.js`
- **Behavior:** Taruh 1 amethyst cluster di altar tengah → boss spawn dengan cinematic (lightning + sound)
- **Acceptance:** Ritual → boss muncul dengan efek

#### F4.4 — Boss Bar UI
- **File:** `scripts/boss.js`
- **Behavior:** Saat boss aktif, tampilkan health bar di actionbar semua player di Aether
- **Format:** `§c🐲 Aether Lord §f████████░░ §c400/500`
- **Acceptance:** Bar update realtime saat boss kena damage

---

### FASE 5 — Polish & Release (Target: 5 hari setelah F4)

#### F5.1 — Custom Sounds
- **File:** `sounds/magic/*.ogg`, `sounds/sound_definitions.json`
- **Behavior:** 3 sound custom: cast (whoosh), portal (portal travel), altar (bell chime)
- **Acceptance:** Sound play saat trigger

#### F5.2 — Localization
- **File:** `texts/en_US.lang`, `texts/id_ID.lang`
- **Behavior:** Semua nama item, block, entity, spell ada di lang file (ID + EN)
- **Acceptance:** Ganti bahasa MC → teks berubah

#### F5.3 — Balancing Pass
- **Behavior:** Playtest 3-5 jam, sesuaikan:
  - Spell cost & cooldown
  - Boss HP & damage
  - Mana regen rate
  - Mob spawn rate
- **Acceptance:** Difficulty curve naik gradual, tidak terlalu gampang/susah

#### F5.4 — README + Landing Page
- **File:** `README.md`, `docs/` (screenshots)
- **Behavior:** README dengan: fitur, cara install, cara main, credit, changelog
- **Acceptance:** Orang baru bisa install dari README tanpa nanya

#### F5.5 — Publish
- **Behavior:** zip `.mcaddon` → upload MCPEDL + CurseForge
- **Acceptance:** Addon live, bisa di-download publik

---

## 8. Roadmap

| Minggu | Fase | Deliverable | Status |
|---|---|---|---|
| 1 | F1 MVP | Portal, mana, fireball, arena | 🟡 |
| 2 | F2 Spells | 5 spell, altar, scroll | 🔲 |
| 3 | F3 Dimension | Aether, biome, mage mob | 🔲 |
| 4 | F4 Boss | Aether Lord + struktur | 🔲 |
| 5 | F5 Polish | Sound, lang, balancing, publish | 🔲 |

### Subphase Status — F1 (MVP)

- [x] F1.1 — Wand Item (BP item + recipe + RP texture + lang minimal)
- [x] F1.2 — Mana System
- [x] F1.3 — Fireball Spell
- [ ] F1.4 — Portal Block
- [ ] F1.5 — Arena Build (mcfunction)
- [ ] F1.6 — Auto-setup on Join

**Total: 5 minggu.** Kalau ada minggu yang slip, **jangan extend fase** — cut feature. F1 harus selesai minggu 1.

---

## 9. Testing Plan

### Unit-level (setelah tiap file)
- [ ] JSON valid (`python3 -m json.tool file.json`)
- [ ] UUID unik (`grep -r uuid behavior_pack/ resource_pack/`)
- [ ] No syntax error di JS (`/reload` di game, cek log)

### Integration (setelah tiap fase)
- [ ] Import `.mcaddon` ke world baru
- [ ] Aktifkan experiment
- [ ] Test semua spell cast tanpa error
- [ ] Test portal PP
- [ ] Test dimension teleport (kalau F3 done)
- [ ] Test boss fight (kalau F4 done)

### Playtest (sebelum release)
- [ ] 30 menit gameplay tanpa crash
- [ ] 3 player multi-player test (kalau ada teman)
- [ ] Fresh world — bisa main dari nol sampai boss

### Regression (tiap fase baru)
- [ ] Fitur lama masih jalan (spell, mana, portal)
- [ ] Save/load world → state persist
- [ ] Restart MC → mana & spell tetap unlock

---

## 10. Deliverables

- [ ] `magic_realm_v1.0.mcaddon` (< 5 MB)
- [ ] `README.md` (install guide + changelog)
- [ ] `PRD.md` (file ini, update status)
- [ ] 3 screenshot (arena, spell, boss fight)
- [ ] 1 demo GIF (< 2 MB) untuk MCPEDL
- [ ] Publish link MCPEDL
- [ ] Source code di GitHub (public repo, MIT license)

---

## 11. Open Questions (need answer before start)

1. **Dimension vs Overworld fallback:** kalau dimension JSON gagal di versi MC user, fallback ke arena Overworld besar atau skip? **(default: fallback)**
2. **Multiplayer:** tambah logic untuk server (min 2 player) atau single player saja dulu? **(default: single player, tapi code support multi)**
3. **Difficulty:** boss fight target durasi 5 menit (casual) atau 15 menit (hardcore)? **(default: 5-10 menit)**
4. **Monetization:** free di MCPEDL atau premium di Patreon? **(default: free + optional donation)**

---

## 12. Agent Instructions (untuk opencode)

Saat mengerjakan PRD ini:

1. **Baca PRD ini dari atas sampai bawah sebelum mulai.**
2. **Kerjakan per fase.** Jangan loncat ke F3 sebelum F1 selesai & test.
3. **Setiap file baru, tambahkan komentar header**:
   ```js
   /**
    * File: scripts/spells/fireball.js
    * Phase: F1.3
    * Purpose: Fireball spell implementation
    */
```

4. Setiap selesai 1 subfase, update status di Roadmap (🔲 → ✅).
5. Wajib validasi JSON setelah generate file (jangan sampai syntax error).
6. Kalau ada error runtime, cek log via /scriptevent atau file logs/latest.log di MC folder.
7. Ikuti naming convention yang sudah ditetapkan di Architecture (F1.1, F2.3, dst.).
8. Jangan tambah feature di luar scope PRD. Kalau ada ide baru, catat di section "Future Ideas" (tambahkan sendiri di bawah PRD).
9. Kalau ada ambiguity di section 11 (Open Questions), tanya user dulu.
10. Commit per subfase, bukan per fase — biar bisa rollback kalau error.

---

13. Future Ideas (post-v1.0)

☐ Spell leveling system (makin sering dipakai = makin kuat)
☐ Mana crystal crafting (regenerate di inventory)
☐ Custom boss music
☐ Aether portal frame requirement (portal hanya bisa dibuat dengan ritual)
☐ Multiplayer boss fight (raid 4 player)
☐ Aether villages (NPC jual spell)
☐ Spell fusion (2 spell jadi 1 combo)
☐ Legendary armor set (dari boss)

---

