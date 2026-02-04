<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { gameState } from '$lib/game/gameState';
  import { createEventDispatcher } from 'svelte';

  export let position: [number, number, number] = [0, 0, 0];
  export let id: number = 0;

  const dispatch = createEventDispatcher<{ defeated: { id: number } }>();

  let enemyPos = { x: position[0], y: position[1], z: position[2] };
  let hp = 100;
  let maxHp = 100;
  let isHit = false;
  let isAttacking = false;
  let floatOffset = Math.random() * Math.PI * 2;
  let attackCooldown = 0;
  const ATTACK_INTERVAL = 1.5; // 1.5秒に1回攻撃
  const ATTACK_RANGE = 1.8;
  const ATTACK_DAMAGE = 10;

  // プレイヤー位置
  let playerPos = { x: 0, y: 0, z: 0 };
  let activeSkill: { id: string; duration: number } | null = null;
  
  gameState.subscribe(state => {
    playerPos = state.playerPosition;
    activeSkill = state.activeSkill;
    
    // 通常攻撃の判定
    if (state.isAttacking && !isHit && hp > 0) {
      const dx = playerPos.x - enemyPos.x;
      const dz = playerPos.z - enemyPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < 2.5) {
        takeDamage(25);
      }
    }
    
    // スキルダメージ判定
    if (activeSkill && hp > 0) {
      const dx = playerPos.x - enemyPos.x;
      const dz = playerPos.z - enemyPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // Q: 範囲3, 50ダメージ
      if (activeSkill.id.endsWith('_q') && distance < 3 && !isHit) {
        takeDamage(50);
      }
      // E: 範囲4, 30ダメージ
      if (activeSkill.id.endsWith('_e') && distance < 4 && !isHit) {
        takeDamage(30);
      }
      // R: 範囲6, 100ダメージ
      if (activeSkill.id.endsWith('_r') && distance < 6 && !isHit) {
        takeDamage(100);
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
      dispatch('defeated', { id });
    }
  }

  function attackPlayer() {
    isAttacking = true;
    gameState.takeDamage(ATTACK_DAMAGE);
    
    setTimeout(() => {
      isAttacking = false;
    }, 300);
  }

  // 簡易アニメーション
  useTask((delta) => {
    floatOffset += delta * 2;
    
    // プレイヤーに向かって移動 & 攻撃（生きている場合のみ）
    if (hp > 0) {
      const dx = playerPos.x - enemyPos.x;
      const dz = playerPos.z - enemyPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // 攻撃クールダウン更新
      if (attackCooldown > 0) {
        attackCooldown -= delta;
      }
      
      // 攻撃範囲内ならプレイヤーを攻撃
      if (distance <= ATTACK_RANGE && attackCooldown <= 0) {
        attackPlayer();
        attackCooldown = ATTACK_INTERVAL;
      }
      // 離れてたら近づく
      else if (distance > ATTACK_RANGE && distance < 15) {
        const speed = 0.03;
        enemyPos.x += (dx / distance) * speed;
        enemyPos.z += (dz / distance) * speed;
      }
    }
  });

  $: floatY = Math.sin(floatOffset) * 0.1 + 0.8;
  $: hpPercent = (hp / maxHp) * 100;
  $: skinColor = isHit ? "#ff4444" : isAttacking ? "#884488" : "#4a3a5a"; // 紫がかった灰色
  $: skinEmissive = isHit ? "#ff0000" : isAttacking ? "#440044" : "#1a1020";
  $: bodyScale = isAttacking ? 1.15 : 1;
  $: armSwing = Math.sin(floatOffset * 3) * 0.3; // 腕を振る
</script>

{#if hp > 0}
  <T.Group position.x={enemyPos.x} position.y={enemyPos.y} position.z={enemyPos.z}>
    <!-- 餓鬼本体 -->
    <T.Group position.y={floatY} scale={[bodyScale, bodyScale, bodyScale]}>
      
      <!-- 頭（大きめ、ガリガリだから目立つ） -->
      <T.Mesh position.y={0.9}>
        <T.SphereGeometry args={[0.28, 10, 10]} />
        <T.MeshLambertMaterial color={skinColor} emissive={skinEmissive} />
      </T.Mesh>

      <!-- 目（大きくてギョロッと、赤く光る） -->
      <T.Mesh position={[-0.12, 0.92, 0.2]}>
        <T.SphereGeometry args={[0.08, 8, 8]} />
        <T.MeshBasicMaterial color="#ff0020" />
      </T.Mesh>
      <T.Mesh position={[0.12, 0.92, 0.2]}>
        <T.SphereGeometry args={[0.08, 8, 8]} />
        <T.MeshBasicMaterial color="#ff0020" />
      </T.Mesh>
      <!-- 瞳孔 -->
      <T.Mesh position={[-0.12, 0.92, 0.27]}>
        <T.SphereGeometry args={[0.03, 6, 6]} />
        <T.MeshBasicMaterial color="#000000" />
      </T.Mesh>
      <T.Mesh position={[0.12, 0.92, 0.27]}>
        <T.SphereGeometry args={[0.03, 6, 6]} />
        <T.MeshBasicMaterial color="#000000" />
      </T.Mesh>

      <!-- 尖った耳 -->
      <T.Mesh position={[-0.28, 0.95, 0]} rotation.z={0.5}>
        <T.ConeGeometry args={[0.06, 0.2, 4]} />
        <T.MeshLambertMaterial color={skinColor} emissive={skinEmissive} />
      </T.Mesh>
      <T.Mesh position={[0.28, 0.95, 0]} rotation.z={-0.5}>
        <T.ConeGeometry args={[0.06, 0.2, 4]} />
        <T.MeshLambertMaterial color={skinColor} emissive={skinEmissive} />
      </T.Mesh>

      <!-- 口（裂けた感じ） -->
      <T.Mesh position={[0, 0.82, 0.25]} rotation.x={0.2}>
        <T.BoxGeometry args={[0.15, 0.02, 0.05]} />
        <T.MeshBasicMaterial color="#220000" />
      </T.Mesh>

      <!-- 体（めっちゃ細い、骨と皮） -->
      <T.Mesh position.y={0.45}>
        <T.CylinderGeometry args={[0.08, 0.12, 0.5, 8]} />
        <T.MeshLambertMaterial color={skinColor} emissive={skinEmissive} />
      </T.Mesh>

      <!-- 肋骨（見えてる感じ） -->
      {#each [-0.08, 0, 0.08] as ribY}
        <T.Mesh position={[0, 0.45 + ribY, 0.1]} rotation.x={Math.PI / 2}>
          <T.TorusGeometry args={[0.1, 0.015, 4, 8, Math.PI]} />
          <T.MeshLambertMaterial color="#3a2a4a" />
        </T.Mesh>
      {/each}

      <!-- 左腕（細長い、振る） -->
      <T.Group position={[-0.15, 0.5, 0]} rotation.x={armSwing}>
        <T.Mesh position.y={-0.2}>
          <T.CylinderGeometry args={[0.03, 0.025, 0.4, 6]} />
          <T.MeshLambertMaterial color={skinColor} emissive={skinEmissive} />
        </T.Mesh>
        <!-- 爪（長い） -->
        {#each [-0.03, 0, 0.03] as clawX}
          <T.Mesh position={[clawX, -0.42, 0.02]} rotation.x={0.3}>
            <T.ConeGeometry args={[0.012, 0.08, 4]} />
            <T.MeshLambertMaterial color="#2a1a2a" />
          </T.Mesh>
        {/each}
      </T.Group>

      <!-- 右腕（細長い、振る） -->
      <T.Group position={[0.15, 0.5, 0]} rotation.x={-armSwing}>
        <T.Mesh position.y={-0.2}>
          <T.CylinderGeometry args={[0.03, 0.025, 0.4, 6]} />
          <T.MeshLambertMaterial color={skinColor} emissive={skinEmissive} />
        </T.Mesh>
        <!-- 爪（長い） -->
        {#each [-0.03, 0, 0.03] as clawX}
          <T.Mesh position={[clawX, -0.42, 0.02]} rotation.x={0.3}>
            <T.ConeGeometry args={[0.012, 0.08, 4]} />
            <T.MeshLambertMaterial color="#2a1a2a" />
          </T.Mesh>
        {/each}
      </T.Group>

      <!-- 左足（細い） -->
      <T.Mesh position={[-0.06, 0.1, 0]}>
        <T.CylinderGeometry args={[0.035, 0.03, 0.25, 6]} />
        <T.MeshLambertMaterial color={skinColor} emissive={skinEmissive} />
      </T.Mesh>

      <!-- 右足（細い） -->
      <T.Mesh position={[0.06, 0.1, 0]}>
        <T.CylinderGeometry args={[0.035, 0.03, 0.25, 6]} />
        <T.MeshLambertMaterial color={skinColor} emissive={skinEmissive} />
      </T.Mesh>

    </T.Group>

    <!-- HPバー -->
    <T.Group position.y={2}>
      <T.Mesh>
        <T.PlaneGeometry args={[0.8, 0.08]} />
        <T.MeshBasicMaterial color="#222" />
      </T.Mesh>
      <T.Mesh position.x={(hpPercent - 100) / 250} position.z={0.01}>
        <T.PlaneGeometry args={[hpPercent / 125, 0.06]} />
        <T.MeshBasicMaterial color="#ff0040" />
      </T.Mesh>
    </T.Group>
  </T.Group>
{/if}
