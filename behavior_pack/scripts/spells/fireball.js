/**
 * File: scripts/spells/fireball.js
 * Phase: F1.3
 * Purpose: Fireball spell implementation
 */

import { system } from '@minecraft/server';
import { useMana, getMana, MAX_MANA } from '../mana.js';
import { isOnCooldown, markCooldown } from '../utils/cooldown.js';
import { actionBar } from '../utils/ui.js';

export const id = 'fireball';
export const name = 'Fireball';
export const cost = 15;
export const cooldownTicks = 60; // 3 detik

/** Ledakan partikel di sekitar titik (efek visual lebih tebal). */
function particleBurst(dimension, center, particle, count, radius) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const pitch = (Math.random() - 0.5) * Math.PI;
    const r = radius * (0.35 + Math.random() * 0.65);
    const point = {
      x: center.x + Math.cos(angle) * Math.cos(pitch) * r,
      y: center.y + Math.sin(pitch) * r,
      z: center.z + Math.sin(angle) * Math.cos(pitch) * r,
    };
    try {
      dimension.spawnParticle(particle, point);
    } catch (e) {
      // Partikel opsional.
    }
  }
}

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
  let projectile = null;
  try {
    projectile = dimension.spawnEntity('minecraft:fireball', origin);
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

  // Efek tebal: api + asap + percikan lava + trail mengikuti proyektil.
  // ID partikel mengikuti daftar vanilla Bedrock Wiki (minecraft:smoke tidak valid).
  particleBurst(dimension, origin, 'minecraft:basic_flame_particle', 36, 1.6);
  particleBurst(dimension, origin, 'minecraft:basic_smoke_particle', 20, 1.2);
  particleBurst(dimension, origin, 'minecraft:lava_particle', 12, 0.9);
  particleBurst(dimension, origin, 'minecraft:basic_portal_particle', 10, 0.7);

  if (projectile) {
    let ticks = 0;
    const trailId = system.runInterval(() => {
      ticks++;
      try {
        if (!projectile.isValid) {
          system.clearRun(trailId);
          return;
        }
        const p = projectile.location;
        particleBurst(dimension, p, 'minecraft:basic_flame_particle', 6, 0.35);
        particleBurst(dimension, p, 'minecraft:basic_smoke_particle', 3, 0.3);
      } catch (e) {
        system.clearRun(trailId);
        return;
      }
      if (ticks >= 16) system.clearRun(trailId);
    }, 2);
  }

  try {
    player.runCommand('playsound mob.blaze.shoot @s');
  } catch (e) {
    // Sound opsional.
  }

  actionBar(player, `§c🔥 FIREBALL! §8│ §b✦ ${getMana(player)}/${MAX_MANA}`);
  return true;
}
