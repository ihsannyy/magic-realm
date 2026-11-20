/**
 * File: scripts/spells/fireball.js
 * Phase: F1.3
 * Purpose: Fireball spell implementation
 */

import { useMana, getMana, MAX_MANA } from '../mana.js';
import { isOnCooldown, markCooldown } from '../utils/cooldown.js';
import { actionBar } from '../utils/ui.js';

export const id = 'fireball';
export const name = 'Fireball';
export const cost = 15;
export const cooldownTicks = 60; // 3 detik

/**
 * Cast fireball ke arah pandangan player.
 * @returns {boolean} true jika spell berhasil di-cast.
 */
export function cast(player) {
  if (isOnCooldown(player, id, cooldownTicks)) {
    actionBar(player, '§7⏳ Fireball cooldown...');
    return false;
  }

  if (!useMana(player, cost)) {
    actionBar(player, `§c✦ MANA KURANG! §7Butuh ${cost}, punya ${getMana(player)}`);
    return false;
  }

  markCooldown(player, id, cooldownTicks);

  const view = player.getViewDirection();
  const loc = player.location;
  const origin = {
    x: loc.x + view.x * 1.5,
    y: loc.y + 1.6 + view.y * 1.5,
    z: loc.z + view.z * 1.5,
  };
  const impulse = {
    x: view.x * 1.2,
    y: view.y * 1.2,
    z: view.z * 1.2,
  };

  const dimension = player.dimension;
  try {
    const projectile = dimension.spawnEntity('minecraft:fireball', origin);
    projectile.clearVelocity();
    projectile.applyImpulse(impulse);
  } catch (e) {
    // Fallback untuk versi API yang tidak mengizinkan spawnEntity/applyImpulse.
    try {
      player.runCommand(
        `summon minecraft:fireball ${origin.x.toFixed(2)} ${origin.y.toFixed(2)} ${origin.z.toFixed(2)}`
      );
    } catch (inner) {
      // Abaikan: world mungkin sedang unload.
    }
  }

  try {
    dimension.spawnParticle('minecraft:basic_flame_particle', origin);
  } catch (e) {
    // Particle opsional.
  }

  try {
    player.runCommand('playsound mob.blaze.shoot @s');
  } catch (e) {
    // Sound opsional.
  }

  actionBar(player, `§c🔥 FIREBALL! §8│ §b✦ ${getMana(player)}/${MAX_MANA}`);
  return true;
}
