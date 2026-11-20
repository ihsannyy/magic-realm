/**
 * File: scripts/utils/ui.js
 * Phase: F1.2
 * Purpose: Shared actionbar / chat UI helpers
 */

/**
 * Tampilkan teks di actionbar player.
 * Fallback ke chat jika onScreenDisplay tidak tersedia di versi API tertentu.
 */
export function actionBar(player, text) {
  try {
    if (player.onScreenDisplay && typeof player.onScreenDisplay.setActionBar === 'function') {
      player.onScreenDisplay.setActionBar(text);
      return;
    }
  } catch (e) {
    // API belum tersedia — lanjut ke fallback
  }
  try {
    player.sendMessage(text);
  } catch (e) {
    // Player sudah keluar dari world
  }
}

/** Kirim pesan chat ke player (aman jika player sudah disconnect). */
export function tell(player, text) {
  try {
    player.sendMessage(text);
  } catch (e) {
    // Player sudah keluar dari world
  }
}

/** Buat visual bar Unicode, cth: ████░░░░░░ */
export function buildBar(value, max, width = 10) {
  const safeMax = max > 0 ? max : 1;
  const ratio = Math.max(0, Math.min(1, value / safeMax));
  const filled = Math.round(ratio * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}
