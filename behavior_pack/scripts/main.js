/**
 * File: scripts/main.js
 * Phase: F1.3
 * Purpose: Entry point — inisialisasi sistem dan registrasi event
 */

import { world, Player } from '@minecraft/server';
import { initManaSystem } from './mana.js';
import { cast as castFireball } from './spells/fireball.js';
import { usePortal, PORTAL_BLOCK_ID } from './portal.js';

const WAND_ID = 'magicrealm:wand';

function init() {
  initManaSystem();

  world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    if (!(player instanceof Player)) return;
    if (!event.itemStack || event.itemStack.typeId !== WAND_ID) return;

    // Sneak + klik akan dipakai untuk cycling di F2.5.
    if (player.isSneaking) return;

    castFireball(player);
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
