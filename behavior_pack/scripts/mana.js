/**
 * File: scripts/mana.js
 * Phase: F1.2
 * Purpose: Mana system — state disimpan di scoreboard objective `mana`
 */

import { world, system } from '@minecraft/server';
import { actionBar, buildBar } from './utils/ui.js';

const OBJECTIVE_ID = 'mana';
export const MAX_MANA = 100;
const REGEN_TICKS = 40; // 40 tick = 2 detik → +1 mana

let objective = null;

/** Ambil/buat objective. Tidak mendaftarkan interval (aman dipanggil berulang). */
function ensureObjective() {
  if (!objective) {
    objective =
      world.scoreboard.getObjective(OBJECTIVE_ID) ??
      world.scoreboard.addObjective(OBJECTIVE_ID, '§b✦ Mana');
  }
  return objective;
}

/** ScoreboardIdentity lebih stabil daripada Entity pada beberapa versi API. */
function identityOf(player) {
  return player.scoreboardIdentity ?? player;
}

/** Inisialisasi sistem: objective + regenerate pasif. Dipanggil sekali dari main.js. */
export function initManaSystem() {
  ensureObjective();

  system.runInterval(() => {
    for (const player of world.getPlayers()) {
      const current = getMana(player);
      if (current < MAX_MANA) {
        setMana(player, current + 1);
      }
    }
  }, REGEN_TICKS);
}

export function getMana(player) {
  const obj = ensureObjective();
  const raw = obj.getScore(identityOf(player));

  // Player baru belum punya score → init penuh, lalu simpan supaya persist.
  if (raw === undefined) {
    setMana(player, MAX_MANA);
    return MAX_MANA;
  }

  return Math.max(0, Math.min(MAX_MANA, raw));
}

export function setMana(player, value) {
  const obj = ensureObjective();
  const clamped = Math.max(0, Math.min(MAX_MANA, Math.floor(value)));
  obj.setScore(identityOf(player), clamped);
  return clamped;
}

/**
 * Kurangi mana jika cukup.
 * @returns {boolean} true jika berhasil, false jika mana tidak cukup.
 */
export function useMana(player, amount) {
  const current = getMana(player);
  if (current < amount) {
    showManaBar(player);
    return false;
  }
  setMana(player, current - amount);
  showManaBar(player);
  return true;
}

export function showManaBar(player) {
  const mana = getMana(player);
  actionBar(player, `§b✦ MANA §f[${buildBar(mana, MAX_MANA)}] §b${mana}/${MAX_MANA}`);
}
