/**
 * File: scripts/main.js
 * Phase: F1.3–F1.6
 * Purpose: Entry point — inisialisasi sistem dan registrasi event
 *
 * Referensi: world.beforeEvents.itemUse / playerInteractWithBlock dapat
 * didaftarkan lebih awal (early-execution), sedangkan perubahan world
 * (spawn entity, teleport, give) WAJIB ditunda lewat system.run().
 */

import { world, system, ItemStack } from '@minecraft/server';
import { initManaSystem, showManaBar } from './mana.js';
import { cast as castFireball } from './spells/fireball.js';
import { usePortal, PORTAL_BLOCK_IDS } from './portal.js';

const WAND_ID = 'magicrealm:wand';
const SPAWN_POINT = { x: 0, y: 65, z: 0 };

let setupObjective = null;

function isPlayer(entity) {
  return !!entity && entity.typeId === 'minecraft:player';
}

function identityOf(player) {
  return player.scoreboardIdentity ?? player;
}

function isWand(itemStack) {
  return !!itemStack && itemStack.typeId === WAND_ID;
}

/** subscribe yang aman kalau API versi lama tidak punya event ini. */
function subscribe(signal, handler, label) {
  try {
    if (signal && typeof signal.subscribe === 'function') {
      signal.subscribe(handler);
      return true;
    }
  } catch (e) {
    console.warn(`[MagicRealm] ${label} gagal: ${e}`);
  }
  return false;
}

/** Cast/teleport selalu dijalankan di tick berikutnya (bukan di before event). */
function castFromEvent(player) {
  system.run(() => {
    try {
      castFireball(player);
    } catch (e) {
      console.warn('[MagicRealm] castFireball gagal: ' + e);
    }
  });
}

function portalFromEvent(player) {
  system.run(() => {
    try {
      usePortal(player);
    } catch (e) {
      console.warn('[MagicRealm] usePortal gagal: ' + e);
    }
  });
}

function giveWand(player) {
  try {
    player.inventory.addItem(new ItemStack(WAND_ID, 1));
    return true;
  } catch (e) {
    try {
      player.runCommand(`give @s ${WAND_ID} 1`);
      return true;
    } catch (inner) {
      return false;
    }
  }
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
  if (!isPlayer(player)) return;

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
    giveWand(player);
    try {
      player.sendMessage('§d✨ §fSelamat datang di §dMagic Realm§f!');
      player.sendMessage('§7Tap wand biasa → §cFireball§7. Tap portal → §dAether§7.');
      showManaBar(player);
    } catch (e) {
      // Player sudah keluar.
    }
  });
}

/** Before-event: didaftarkan SEGERA supaya tap pertama tidak terlewat. */
function registerBeforeEvents() {
  const before = world.beforeEvents;

  subscribe(
    before?.itemUse,
    (event) => {
      const player = event.source;
      if (!isPlayer(player) || !isWand(event.itemStack)) return;
      if (player.isSneaking) return; // F2.5: cycling spell
      event.cancel = true; // matikan aksi vanilla → tap biasa langsung cast
      castFromEvent(player);
    },
    'beforeEvents.itemUse'
  );

  subscribe(
    before?.playerInteractWithBlock,
    (event) => {
      const player = event.player;
      if (!isPlayer(player) || !isWand(event.itemStack)) return;
      const blockId = event.block?.typeId;
      event.cancel = true;
      if (blockId && PORTAL_BLOCK_IDS.includes(blockId)) {
        portalFromEvent(player);
      } else {
        castFromEvent(player);
      }
    },
    'beforeEvents.playerInteractWithBlock'
  );
}

/** After-event + scriptevent: fallback untuk versi API tanpa before-event. */
function registerFallbackEvents() {
  subscribe(
    world.afterEvents?.itemUse,
    (event) => {
      const player = event.source;
      if (!isPlayer(player) || !isWand(event.itemStack)) return;
      if (player.isSneaking) return;
      castFromEvent(player);
    },
    'afterEvents.itemUse'
  );

  subscribe(
    world.afterEvents?.itemUseOn,
    (event) => {
      const player = event.source;
      if (!isPlayer(player) || !isWand(event.itemStack)) return;
      if (event.block && PORTAL_BLOCK_IDS.includes(event.block.typeId)) {
        portalFromEvent(player);
      } else {
        castFromEvent(player);
      }
    },
    'afterEvents.itemUseOn'
  );

  subscribe(
    world.afterEvents?.playerSpawn,
    (event) => {
      if (!isPlayer(event.player)) return;
      if (event.initialSpawn === false) return;
      setupNewPlayer(event.player);
    },
    'afterEvents.playerSpawn'
  );

  subscribe(
    world.afterEvents?.scriptEventReceive,
    (event) => {
      let player = event.sourceEntity;
      if (!isPlayer(player)) {
        const players = world.getPlayers();
        if (players.length === 1) player = players[0];
      }
      if (!isPlayer(player)) return;

      const message = String(event.message ?? '').trim().toLowerCase();
      if (event.id === 'magicrealm:cast') {
        if (message === 'fireball' || message === '') castFromEvent(player);
      } else if (event.id === 'magicrealm:portal') {
        portalFromEvent(player);
      } else if (event.id === 'magicrealm:setup') {
        setupNewPlayer(player);
      }
    },
    'afterEvents.scriptEventReceive'
  );
}

registerBeforeEvents();

// Sisanya ditunda sampai world siap (scoreboard & interval API).
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

  registerFallbackEvents();

  // Script bisa termuat setelah player join → spawn event sudah terlewat.
  try {
    for (const player of world.getPlayers()) setupNewPlayer(player);
  } catch (e) {
    console.warn('[MagicRealm] setup player online gagal: ' + e);
  }

  console.log('[MagicRealm] F1 initialized (beforeEvents + fallback).');
});
