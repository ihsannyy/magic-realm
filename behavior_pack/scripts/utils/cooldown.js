/**
 * File: scripts/utils/cooldown.js
 * Phase: F1.3
 * Purpose: Per-player, per-ability cooldown tracker berbasis game tick
 */

import { system } from '@minecraft/server';

const store = new Map();

function keyOf(player, key) {
  return `${player.id}:${key}`;
}

/** @returns {boolean} true jika masih dalam masa cooldown. */
export function isOnCooldown(player, key, durationTicks) {
  const until = store.get(keyOf(player, key));
  return until !== undefined && until > system.currentTick;
}

/** Tandai kemampuan sebagai baru saja dipakai. */
export function markCooldown(player, key, durationTicks) {
  store.set(keyOf(player, key), system.currentTick + durationTicks);
}

/** Sisa tick cooldown (0 jika sudah siap). */
export function remainingTicks(player, key) {
  const until = store.get(keyOf(player, key));
  if (until === undefined) return 0;
  return Math.max(0, until - system.currentTick);
}
