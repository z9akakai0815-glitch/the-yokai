<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { gameState } from '$lib/game/gameState';
  import * as THREE from 'three';

  export let position: [number, number, number] = [0, 0, 0];

  let enemyPos = { x: position[0], y: position[1], z: position[2] };
  let hp = 100;
  let maxHp = 100;
  let isHit = false;
  let floatOffset = 0;

  // プレイヤーとの距離を監視
  let playerPos = { x: 0, y: 0, z: 0 };
  
  gameState.subscribe(state => {
    playerPos = state.playerPosition;
    
    // 攻撃判定
    if (state.isAttacking && !isHit) {
      const dx = playerPos.x - enemyPos.x;
      const dz = playerPos.z - enemyPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // 攻撃範囲内
      if (distance < 2) {
        takeDamage(25);
      }
    }
  });

  function takeDamage(amount: number) {
    hp -= amount;
    isHit = true;
    
    setTimeout(() => {
      isHit = false;
    }, 200);

    if (hp <= 0) {
      hp = 0;
      // 敵を倒した処理（後で実装）
      gameState.update(s => ({
        ...s,
        souls: s.souls + 10,
        enemiesDefeated: s.enemiesDefeated + 1,
      }));
    }
  }

  // 浮遊アニメーション
  useTask((delta) => {
    floatOffset += delta * 2;
    
    // プレイヤーに向かって少しずつ移動
    if (hp > 0) {
      const dx = playerPos.x - enemyPos.x;
      const dz = playerPos.z - enemyPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance > 1.5) {
        enemyPos.x += (dx / distance) * 0.02;
        enemyPos.z += (dz / distance) * 0.02;
      }
    }
  });

  $: floatY = Math.sin(floatOffset) * 0.2 + 1;
  $: hpPercent = (hp / maxHp) * 100;
</script>

{#if hp > 0}
  <T.Group position.x={enemyPos.x} position.y={enemyPos.y} position.z={enemyPos.z}>
    <!-- 敵本体（小鬼） -->
    <T.Group position.y={floatY}>
      <!-- 体 -->
      <T.Mesh castShadow>
        <T.SphereGeometry args={[0.5, 16, 16]} />
        <T.MeshStandardMaterial 
          color={isHit ? "#ff6666" : "#440044"} 
          emissive={isHit ? "#ff0000" : "#220022"}
          emissiveIntensity={isHit ? 1 : 0.3}
        />
      </T.Mesh>

      <!-- 目（左） -->
      <T.Mesh position={[-0.15, 0.1, 0.4]}>
        <T.SphereGeometry args={[0.12, 8, 8]} />
        <T.MeshBasicMaterial color="#ff0040" />
      </T.Mesh>

      <!-- 目（右） -->
      <T.Mesh position={[0.15, 0.1, 0.4]}>
        <T.SphereGeometry args={[0.12, 8, 8]} />
        <T.MeshBasicMaterial color="#ff0040" />
      </T.Mesh>

      <!-- 角（左） -->
      <T.Mesh position={[-0.25, 0.4, 0]} rotation.z={0.3}>
        <T.ConeGeometry args={[0.08, 0.3, 8]} />
        <T.MeshStandardMaterial color="#1a1a1a" />
      </T.Mesh>

      <!-- 角（右） -->
      <T.Mesh position={[0.25, 0.4, 0]} rotation.z={-0.3}>
        <T.ConeGeometry args={[0.08, 0.3, 8]} />
        <T.MeshStandardMaterial color="#1a1a1a" />
      </T.Mesh>

      <!-- オーラ -->
      <T.Mesh>
        <T.SphereGeometry args={[0.7, 16, 16]} />
        <T.MeshBasicMaterial color="#ff0040" transparent opacity={0.1} />
      </T.Mesh>
    </T.Group>

    <!-- HPバー -->
    <T.Group position.y={2.5}>
      <!-- 背景 -->
      <T.Mesh>
        <T.PlaneGeometry args={[1, 0.1]} />
        <T.MeshBasicMaterial color="#333" />
      </T.Mesh>
      <!-- HP -->
      <T.Mesh position.x={(hpPercent - 100) / 200} position.z={0.01}>
        <T.PlaneGeometry args={[hpPercent / 100, 0.08]} />
        <T.MeshBasicMaterial color="#ff0040" />
      </T.Mesh>
    </T.Group>
  </T.Group>
{/if}
