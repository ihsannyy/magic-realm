/**
 * File: scripts/main.js
 * Phase: F1.3–F1.6
 * Purpose: Entry point — inisialisasi sistem dan registrasi event
 */

import { world, system, Player } from '@minecraft/server';
import { initManaSystem, showManaBar } from './mana.js';
import { cast as castFireball } from './spells/fireball.js';
import { usePortal, PORTAL_BLOCK_ID } from './portal.js';

const WAND_ID = 'magicrealm:wand';
const SPAWN_POINT = { x: 0, y: 65, z: 0 };

let setupObjective = null;

function identityOf(player) {
  return player.scoreboardIdentity ?? player;
}

function ensureArena() {
  try {
    const overworld = world.getDimension('minecraft:overworld');
    const floor = overworld.getBlock({ x: 0, y: 63, z: 0 });
    if (!floor || floor.typeId === 'minecraft:air') {
      overworld.runCommand('function magic_arena');
    }
  } catch (e) {
    // Function belum terdaftar — arena bisa dibangun manual via /function magic_arena.
  }
}

function setupNewPlayer(player) {
  if (setupObjective.getScore(identityOf(player)) === 1) return;
  setupObjective.setScore(identityOf(player), 1);

  // Tunda 1 tick supaya player selesai di-spawn sebelum teleport & give item.
  system.run(() => {
    ensureArena();
    try {
      player.teleport(SPAWN_POINT, world.getDimension('minecraft:overworld'));
    } catch (e) {
      // Teleport gagal — player tetap dapat wand.
    }
    try {
      player.runCommand(`give @s ${WAND_ID} 1`);
    } catch (e) {
      // Inventory penuh.
    }
    player.sendMessage('§d✨ §fSelamat datang di §dMagic Realm§f!');
    player.sendMessage('§7Klik kanan dengan wand untuk cast §cFireball§7.');
    player.sendMessage('§7Klik portal dengan wand untuk pergi ke §dAether§7.');
    showManaBar(player);
  });
}

function init() {
  initManaSystem();
  setupObjective =
    world.scoreboard.getObjective('mr_setup_done') ??
    world.scoreboard.addObjective('mr_setup_done', 'Magic Realm setup');

  world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    if (!(player instanceof Player)) return;
    if (!event.itemStack || event.itemStack.typeId !== WAND_ID) return;

    // Sneak + klik akan dipakai untuk cycling di F2.5.
    if (player.isSneaking) return;

    castFireball(player);
  });

  world.afterEvents.playerSpawn.subscribe((event) => {
    if (!event.initialSpawn) return;
    setupNewPlayer(event.player);
  });

  world.afterEvents.itemUseOn.subscribe((event) => {
    const player = event.source;
    if (!(player instanceof Player)) return;
    if (!event.itemStack || event.itemStack.typeId !== WAND_ID) return;
    if (!event.block || event.block.typeId !== PORTAL_BLOCK_ID) return;

    usePortal(player);
  });
}

init();
