/**
 * File: scripts/main.js
 * Phase: F1.3–F1.6
 * Purpose: Entry point — inisialisasi sistem dan registrasi event
 */

import { world, system } from '@minecraft/server';
import { initManaSystem, showManaBar } from './mana.js';
import { cast as castFireball } from './spells/fireball.js';
import { usePortal, PORTAL_BLOCK_ID } from './portal.js';

const WAND_ID = 'magicrealm:wand';
const SPAWN_POINT = { x: 0, y: 65, z: 0 };

let setupObjective = null;

function isPlayer(entity) {
  return !!entity && entity.typeId === 'minecraft:player';
}

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
    // Function belum terdaftar — bisa dibangun manual via /function magic_arena.
  }
}

function setupNewPlayer(player) {
  try {
    if (setupObjective && setupObjective.getScore(identityOf(player)) === 1) return;
    if (setupObjective) setupObjective.setScore(identityOf(player), 1);
  } catch (e) {
    // Scoreboard belum siap — tetap lanjut setup.
  }

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
    try {
      player.sendMessage('§d✨ §fSelamat datang di §dMagic Realm§f!');
      player.sendMessage('§7Klik kanan dengan wand untuk cast §cFireball§7.');
      player.sendMessage('§7Klik portal dengan wand untuk pergi ke §dAether§7.');
      showManaBar(player);
    } catch (e) {
      // Player sudah keluar.
    }
  });
}

function registerEvents() {
  world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    if (!isPlayer(player)) return;
    if (!event.itemStack || event.itemStack.typeId !== WAND_ID) return;
    if (player.isSneaking) return; // F2.5: cycling spell
    castFireball(player);
  });

  world.afterEvents.itemUseOn.subscribe((event) => {
    const player = event.source;
    if (!isPlayer(player)) return;
    if (!event.itemStack || event.itemStack.typeId !== WAND_ID) return;
    if (!event.block || event.block.typeId !== PORTAL_BLOCK_ID) return;
    usePortal(player);
  });

  world.afterEvents.playerSpawn.subscribe((event) => {
    if (!isPlayer(event.player)) return;
    if (event.initialSpawn === false) return;
    setupNewPlayer(event.player);
  });
}

// Top-level script berjalan dalam early-execution mode. Tunda inisialisasi
// sampai world ready agar scoreboard & event API tersedia.
system.run(() => {
  try {
    initManaSystem();
  } catch (e) {
    console.warn('[MagicRealm] initManaSystem gagal: ' + e);
  }

  try {
    setupObjective =
      world.scoreboard.getObjective('mr_setup_done') ??
      world.scoreboard.addObjective('mr_setup_done', 'Magic Realm setup');
  } catch (e) {
    console.warn('[MagicRealm] setupObjective gagal: ' + e);
  }

  try {
    registerEvents();
  } catch (e) {
    console.warn('[MagicRealm] registerEvents gagal: ' + e);
  }

  console.log('[MagicRealm] F1 initialized.');
});
