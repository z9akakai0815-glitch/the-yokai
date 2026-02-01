<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { gameState } from '$lib/game/gameState';

  export let position: [number, number, number] = [0, 0, 0];

  let enemyPos = { x: position[0], y: position[1], z: position[2] };
  let hp = 100;
  let maxHp = 100;
  let isHit = false;
  let floatOffset = Math.random() * Math.PI * 2;

  // プレイヤー位置
  let playerPos = { x: 0, y: 0, z: 0 };
  
  gameState.subscribe(state => {
    playerPos = state.playerPosition;
    
    // 攻撃判定
    if (state.isAttacking && !isHit && hp > 0) {
      const dx = playerPos.x - enemyPos.x;
      const dz = playerPos.z - enemyPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < 2.5) {
        takeDamage(25);
      }
    }
  });

  function takeDamage(amount: number) {
    hp -= amount;
    isHit = true;
    
    setTimeout(() => {
      isHit = false;
    }, 150);

    if (hp <= 0) {
      hp = 0;
      gameState.addSouls(10);
      gameState.defeatEnemy();
    }
  }

  // 簡易アニメーション
  useTask((delta) => {
    floatOffset += delta * 2;
    
    // プレイヤーに向かって移動（生きている場合のみ）
    if (hp > 0) {
      const dx = playerPos.x - enemyPos.x;
      const dz = playerPos.z - enemyPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance > 1.5 && distance < 15) {
        enemyPos.x += (dx / distance) * 0.03;
        enemyPos.z += (dz / distance) * 0.03;
      }
    }
  });

  $: floatY = Math.sin(floatOffset) * 0.15 + 1;
  $: hpPercent = (hp / maxHp) * 100;
  $: bodyColor = isHit ? "#ff4444" : "#440044";
</script>

{#if hp > 0}
  <T.Group position.x={enemyPos.x} position.y={enemyPos.y} position.z={enemyPos.z}>
    <!-- 敵本体（シンプル化） -->
    <T.Group position.y={floatY}>
      <!-- 体 -->
      <T.Mesh>
        <T.SphereGeometry args={[0.5, 12, 12]} />
        <T.MeshLambertMaterial color={bodyColor} emissive={isHit ? "#ff0000" : "#220022"} />
      </T.Mesh>

      <!-- 目（左右） -->
      <T.Mesh position={[-0.15, 0.1, 0.4]}>
        <T.SphereGeometry args={[0.1, 6, 6]} />
        <T.MeshBasicMaterial color="#ff0040" />
      </T.Mesh>
      <T.Mesh position={[0.15, 0.1, 0.4]}>
        <T.SphereGeometry args={[0.1, 6, 6]} />
        <T.MeshBasicMaterial color="#ff0040" />
      </T.Mesh>

      <!-- 角 -->
      <T.Mesh position={[-0.2, 0.4, 0]} rotation.z={0.3}>
        <T.ConeGeometry args={[0.06, 0.25, 6]} />
        <T.MeshLambertMaterial color="#1a1a1a" />
      </T.Mesh>
      <T.Mesh position={[0.2, 0.4, 0]} rotation.z={-0.3}>
        <T.ConeGeometry args={[0.06, 0.25, 6]} />
        <T.MeshLambertMaterial color="#1a1a1a" />
      </T.Mesh>
    </T.Group>

    <!-- HPバー -->
    <T.Group position.y={2.2}>
      <T.Mesh>
        <T.PlaneGeometry args={[1, 0.1]} />
        <T.MeshBasicMaterial color="#222" />
      </T.Mesh>
      <T.Mesh position.x={(hpPercent - 100) / 200} position.z={0.01}>
        <T.PlaneGeometry args={[hpPercent / 100, 0.08]} />
        <T.MeshBasicMaterial color="#ff0040" />
      </T.Mesh>
    </T.Group>
  </T.Group>
{/if}
