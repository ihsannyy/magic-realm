/**
 * File: scripts/portal.js
 * Phase: F1.4
 * Purpose: Aether portal teleport logic dengan fallback arena Overworld
 */

import { world } from '@minecraft/server';
import { tell } from './utils/ui.js';
import { isOnCooldown, markCooldown } from './utils/cooldown.js';

export const PORTAL_BLOCK_ID = 'magicrealm:aether_portal';
// Fallback: blok vanilla yang pasti dikenal /setblock di semua versi.
export const VANILLA_PORTAL_BLOCK_ID = 'minecraft:lodestone';
export const PORTAL_BLOCK_IDS = [PORTAL_BLOCK_ID, VANILLA_PORTAL_BLOCK_ID];
export const AETHER_DIMENSION_ID = 'magicrealm:aether';

const OVERWORLD_ID = 'minecraft:overworld';
const FALLBACK = { x: 10000, y: 66, z: 10000 };
const DEFAULT_RETURN = { x: 0, y: 65, z: 0 };
const COOLDOWN_TICKS = 60;
const COOLDOWN_KEY = 'portal';

function obj(id, display) {
  return world.scoreboard.getObjective(id) ?? world.scoreboard.addObjective(id, display);
}

function identityOf(player) {
  return player.scoreboardIdentity ?? player;
}

function saveReturn(player) {
  const loc = player.location;
  const values = {
    mr_ret_x: Math.floor(loc.x),
    mr_ret_y: Math.floor(loc.y),
    mr_ret_z: Math.floor(loc.z),
  };
  for (const [id, value] of Object.entries(values)) {
    obj(id, `Portal return ${id.slice(-1)}`).setScore(identityOf(player), value);
  }
}

function loadReturn(player) {
  const read = (id, fallback) => {
    const raw = obj(id, `Portal return ${id.slice(-1)}`).getScore(identityOf(player));
    return raw === undefined ? fallback : raw;
  };
  return {
    x: read('mr_ret_x', DEFAULT_RETURN.x),
    y: read('mr_ret_y', DEFAULT_RETURN.y),
    z: read('mr_ret_z', DEFAULT_RETURN.z),
  };
}

/** Pastikan arena fallback tidak berada di udara kosong. */
function ensureFallbackPlatform(dimension) {
  try {
    dimension.fillBlocks(
      { x: 9990, y: 64, z: 9990 },
      { x: 10010, y: 64, z: 10010 },
      'minecraft:polished_deepslate'
    );
    dimension.fillBlocks(
      { x: 9990, y: 65, z: 9990 },
      { x: 10010, y: 65, z: 10010 },
      'minecraft:air'
    );
    for (const [x, z] of [
      [9992, 9992], [10008, 9992], [9992, 10008], [10008, 10008],
    ]) {
      dimension.fillBlocks({ x, y: 65, z }, { x, y: 69, z }, 'minecraft:deepslate_bricks');
      dimension.setBlock({ x, y: 70, z }, 'minecraft:sea_lantern');
    }
    // Portal balik di tengah arena fallback (supaya player tidak nyangkut).
    dimension.setBlock({ x: FALLBACK.x, y: 65, z: FALLBACK.z }, PORTAL_BLOCK_ID);
  } catch (e) {
    // Chunk belum ter-load — teleport tetap dilakukan.
  }
}

function isAtFallback(player) {
  const loc = player.location;
  return (
    player.dimension.id === OVERWORLD_ID &&
    Math.abs(loc.x - FALLBACK.x) < 12 &&
    Math.abs(loc.z - FALLBACK.z) < 12
  );
}

/**
 * Gunakan portal dengan wand.
 * - Dari Overworld → simpan lokasi, teleport ke Aether (atau fallback).
 * - Dari Aether/arena fallback → teleport balik ke lokasi tersimpan.
 */
export function usePortal(player) {
  if (isOnCooldown(player, COOLDOWN_KEY, COOLDOWN_TICKS)) return true;
  markCooldown(player, COOLDOWN_KEY, COOLDOWN_TICKS);

  if (player.dimension.id === AETHER_DIMENSION_ID || isAtFallback(player)) {
    const back = loadReturn(player);
    try {
      player.teleport(back, world.getDimension(OVERWORLD_ID));
      tell(player, '§d✨ Kembali ke lokasi sebelumnya.');
    } catch (e) {
      tell(player, '§cGagal teleport balik. Coba lagi.');
    }
    return true;
  }

  saveReturn(player);
  try {
    const aether = world.getDimension(AETHER_DIMENSION_ID);
    if (!aether) throw new Error('dimension belum terdaftar');
    player.teleport(DEFAULT_RETURN, aether);
    tell(player, '§d✨ Memasuki Aether...');
  } catch (e) {
    const overworld = world.getDimension(OVERWORLD_ID);
    ensureFallbackPlatform(overworld);
    try {
      player.teleport(FALLBACK, overworld);
      tell(player, '§e⚠ Aether belum tersedia — fallback ke arena Overworld.');
    } catch (inner) {
      tell(player, '§cGagal teleport. Coba lagi.');
    }
  }
  return true;
}
