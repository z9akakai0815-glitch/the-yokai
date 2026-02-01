<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { onMount, onDestroy } from 'svelte';
  import { gameState, type CharacterType, type SkillSlot } from '$lib/game/gameState';
  import { skillSets } from '$lib/game/skillTrees';
  import * as THREE from 'three';

  const { camera } = useThrelte();

  let position = { x: 0, y: 0, z: 0 };
  let rotation = 0;
  let isAttacking = false;
  let attackAnimation = 0;

  // スキルエフェクト
  let activeSkillEffect: string | null = null;
  let skillEffectProgress = 0;

  let keys: Record<string, boolean> = {};
  const BASE_SPEED = 0.15;
  
  const characterParams: Record<CharacterType, { speed: number; attackRange: number }> = {
    sword: { speed: 1.0, attackRange: 2 },
    gun: { speed: 0.9, attackRange: 8 },
    magic: { speed: 0.8, attackRange: 5 },
    fist: { speed: 1.2, attackRange: 1.5 },
  };

  function handleKeyDown(e: KeyboardEvent) {
    const key = e.key.toLowerCase();
    keys[key] = true;
    
    // スキル発動
    if (key === 'q') useSkill('Q');
    if (key === 'e') useSkill('E');
    if (key === 'r') useSkill('R');
    
    // キャラ切り替え
    if (e.key === '1') gameState.switchCharacter('sword');
    if (e.key === '2') gameState.switchCharacter('gun');
    if (e.key === '3') gameState.switchCharacter('magic');
    if (e.key === '4') gameState.switchCharacter('fist');
    
    // UI
    if (key === 'k') gameState.toggleSkillTree();
    if (key === 'c') gameState.toggleCharacterSelect();
  }

  function handleKeyUp(e: KeyboardEvent) {
    keys[e.key.toLowerCase()] = false;
  }

  function handleMouseDown(e: MouseEvent) {
    // 左クリックで攻撃
    if (e.button === 0 && !isAttacking && document.pointerLockElement) {
      attack();
    }
  }

  function attack() {
    isAttacking = true;
    attackAnimation = 0;
    gameState.update(s => ({ ...s, isAttacking: true }));
    
    const attackDuration = $gameState.currentCharacter === 'fist' ? 200 : 300;
    setTimeout(() => {
      isAttacking = false;
      gameState.update(s => ({ ...s, isAttacking: false }));
    }, attackDuration);
  }

  function useSkill(slot: SkillSlot) {
    const charType = $gameState.currentCharacter;
    const skill = skillSets[charType].skills[slot];
    const cooldown = $gameState.skillCooldowns[slot];
    
    // Ultのチェック
    if (slot === 'R') {
      if ($gameState.ultimateCharge < 100) return;
    } else {
      if (cooldown.remaining > 0) return;
    }
    
    // スキル発動
    gameState.useSkill(slot);
    activeSkillEffect = skill.id;
    skillEffectProgress = 0;
    
    // エフェクト終了
    const duration = slot === 'R' ? 3000 : (slot === 'Q' ? 2000 : 3000);
    setTimeout(() => {
      activeSkillEffect = null;
    }, duration);
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    window.removeEventListener('mousedown', handleMouseDown);
  });

  useTask((delta) => {
    const charType = $gameState.currentCharacter;
    const speed = BASE_SPEED * characterParams[charType].speed;
    
    // クールダウン更新
    gameState.updateCooldowns(delta);
    
    // 入力取得
    let inputX = 0;
    let inputZ = 0;

    if (keys['w'] || keys['arrowup']) inputZ = -1;
    if (keys['s'] || keys['arrowdown']) inputZ = 1;
    if (keys['a'] || keys['arrowleft']) inputX = -1;
    if (keys['d'] || keys['arrowright']) inputX = 1;

    if (inputX !== 0 || inputZ !== 0) {
      if ($camera) {
        const cameraDirection = new THREE.Vector3();
        $camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();
        
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
        cameraRight.normalize();
        
        const inputLength = Math.sqrt(inputX * inputX + inputZ * inputZ);
        inputX /= inputLength;
        inputZ /= inputLength;
        
        const moveDirection = new THREE.Vector3();
        moveDirection.addScaledVector(cameraDirection, -inputZ);
        moveDirection.addScaledVector(cameraRight, inputX);
        moveDirection.normalize();
        
        position.x += moveDirection.x * speed;
        position.z += moveDirection.z * speed;
        rotation = Math.atan2(moveDirection.x, moveDirection.z);
        
        position.x = Math.max(-9, Math.min(9, position.x));
        position.z = Math.max(-40, Math.min(40, position.z));
      }
    }

    if (isAttacking) attackAnimation += delta * 10;
    if (activeSkillEffect) skillEffectProgress += delta * 3;

    gameState.update(s => ({
      ...s,
      playerPosition: { ...position },
      playerRotation: rotation,
    }));
  });

  $: weaponRotation = isAttacking ? Math.sin(attackAnimation * Math.PI) * 1.5 : 0;
  $: charType = $gameState.currentCharacter;
  $: charColor = $gameState.characters[charType].color;
</script>

<T.Group position.x={position.x} position.y={position.y} position.z={position.z} rotation.y={rotation}>
  <!-- 体 -->
  <T.Mesh position.y={1} castShadow>
    <T.CapsuleGeometry args={[0.3, 1, 8, 16]} />
    <T.MeshLambertMaterial color="#2a2a4a" />
  </T.Mesh>

  <!-- 頭 -->
  <T.Mesh position.y={2} castShadow>
    <T.SphereGeometry args={[0.35, 12, 12]} />
    <T.MeshLambertMaterial color="#ffdbac" />
  </T.Mesh>

  <!-- 髪 -->
  <T.Mesh position={[0, 2.2, -0.1]} castShadow>
    <T.SphereGeometry args={[0.38, 12, 12]} />
    <T.MeshLambertMaterial color={charColor} />
  </T.Mesh>

  <!-- 武器 -->
  {#if charType === 'sword'}
    <T.Group position={[0.5, 1.2, 0]} rotation.x={weaponRotation}>
      <T.Mesh position.y={-0.2}>
        <T.CylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <T.MeshLambertMaterial color="#4a3728" />
      </T.Mesh>
      <T.Mesh position.y={0.4}>
        <T.BoxGeometry args={[0.02, 0.8, 0.08]} />
        <T.MeshLambertMaterial color="#c0c0c0" />
      </T.Mesh>
      {#if isAttacking}
        <T.Mesh position.y={0.4}>
          <T.BoxGeometry args={[0.1, 1, 0.3]} />
          <T.MeshBasicMaterial color="#4488ff" transparent opacity={0.5} />
        </T.Mesh>
      {/if}
    </T.Group>

  {:else if charType === 'gun'}
    <T.Group position={[0.5, 1, 0.3]} rotation.y={weaponRotation * 0.3}>
      <T.Mesh>
        <T.BoxGeometry args={[0.08, 0.15, 0.4]} />
        <T.MeshLambertMaterial color="#333" />
      </T.Mesh>
      {#if isAttacking}
        <T.Mesh position={[0, 0, 0.5]}>
          <T.SphereGeometry args={[0.15, 8, 8]} />
          <T.MeshBasicMaterial color="#ff8844" transparent opacity={0.8} />
        </T.Mesh>
      {/if}
    </T.Group>

  {:else if charType === 'magic'}
    <T.Group position={[0.5, 0.5, 0]} rotation.x={weaponRotation * 0.5}>
      <T.Mesh position.y={0.8}>
        <T.CylinderGeometry args={[0.03, 0.04, 1.6, 8]} />
        <T.MeshLambertMaterial color="#4a3728" />
      </T.Mesh>
      <T.Mesh position.y={1.7}>
        <T.OctahedronGeometry args={[0.15]} />
        <T.MeshBasicMaterial color="#aa44ff" />
      </T.Mesh>
      {#if isAttacking}
        <T.Mesh position={[0, 1.7, 0]}>
          <T.SphereGeometry args={[0.5, 12, 12]} />
          <T.MeshBasicMaterial color="#aa44ff" transparent opacity={0.3} />
        </T.Mesh>
      {/if}
    </T.Group>

  {:else if charType === 'fist'}
    <T.Group>
      <T.Mesh position={[0.4, 1, isAttacking ? 0.5 : 0.2]} castShadow>
        <T.SphereGeometry args={[0.15, 8, 8]} />
        <T.MeshLambertMaterial color="#8B4513" />
      </T.Mesh>
      <T.Mesh position={[-0.4, 1, isAttacking ? 0.3 : 0.2]} castShadow>
        <T.SphereGeometry args={[0.15, 8, 8]} />
        <T.MeshLambertMaterial color="#8B4513" />
      </T.Mesh>
      {#if isAttacking}
        <T.Mesh position={[0, 1, 0.5]}>
          <T.SphereGeometry args={[0.3, 8, 8]} />
          <T.MeshBasicMaterial color="#44ff88" transparent opacity={0.5} />
        </T.Mesh>
      {/if}
    </T.Group>
  {/if}

  <!-- オーラ -->
  <T.Mesh position.y={0.05} rotation.x={-Math.PI / 2}>
    <T.CircleGeometry args={[0.5, 16]} />
    <T.MeshBasicMaterial color={charColor} transparent opacity={0.3} />
  </T.Mesh>

  <!-- スキルエフェクト -->
  {#if activeSkillEffect}
    <!-- 刀スキル -->
    {#if activeSkillEffect === 'sword_q'}
      <!-- 居合斬り - 前方に青い斬撃 -->
      <T.Mesh position={[0, 1, 1 + skillEffectProgress * 2]} rotation.y={Math.PI / 2}>
        <T.PlaneGeometry args={[2, 0.1]} />
        <T.MeshBasicMaterial color="#4488ff" transparent opacity={0.8 - skillEffectProgress * 0.3} side={2} />
      </T.Mesh>
    {:else if activeSkillEffect === 'sword_e'}
      <!-- 剣気 - 周囲に拡大する円 -->
      <T.Mesh position.y={1} rotation.x={-Math.PI / 2}>
        <T.RingGeometry args={[skillEffectProgress * 2, skillEffectProgress * 2 + 0.3, 32]} />
        <T.MeshBasicMaterial color="#4488ff" transparent opacity={0.6 - skillEffectProgress * 0.2} side={2} />
      </T.Mesh>
    {:else if activeSkillEffect === 'sword_r'}
      <!-- 一閃 - 巨大な斬撃 -->
      <T.Mesh position={[0, 1, 2]} rotation.y={Math.PI / 2}>
        <T.PlaneGeometry args={[8, 0.3]} />
        <T.MeshBasicMaterial color="#ffcc00" transparent opacity={0.9 - skillEffectProgress * 0.2} side={2} />
      </T.Mesh>
      <T.PointLight position={[0, 2, 2]} intensity={2 - skillEffectProgress} color="#ffcc00" distance={10} />
    {/if}

    <!-- 銃スキル -->
    {#if activeSkillEffect === 'gun_q'}
      <!-- 連射 - 3発の弾 -->
      {#each [0, 0.3, 0.6] as delay}
        {#if skillEffectProgress > delay}
          <T.Mesh position={[0, 1, 1 + (skillEffectProgress - delay) * 5]}>
            <T.SphereGeometry args={[0.1, 8, 8]} />
            <T.MeshBasicMaterial color="#ff8844" />
          </T.Mesh>
        {/if}
      {/each}
    {:else if activeSkillEffect === 'gun_e'}
      <!-- 閃光弾 -->
      <T.Mesh position={[0, 2, 2]}>
        <T.SphereGeometry args={[1 + skillEffectProgress, 16, 16]} />
        <T.MeshBasicMaterial color="#ffffff" transparent opacity={0.5 - skillEffectProgress * 0.15} />
      </T.Mesh>
    {:else if activeSkillEffect === 'gun_r'}
      <!-- 必中 - 狙撃線 -->
      <T.Mesh position={[0, 1, 10]} rotation.x={Math.PI / 2}>
        <T.CylinderGeometry args={[0.02, 0.02, 20, 8]} />
        <T.MeshBasicMaterial color="#ff0000" transparent opacity={0.8} />
      </T.Mesh>
    {/if}

    <!-- 術師スキル -->
    {#if activeSkillEffect === 'magic_q'}
      <!-- 火球 -->
      <T.Mesh position={[0, 1.5, 1 + skillEffectProgress * 3]}>
        <T.SphereGeometry args={[0.3 + skillEffectProgress * 0.2, 12, 12]} />
        <T.MeshBasicMaterial color="#ff4400" />
      </T.Mesh>
      <T.PointLight position={[0, 1.5, 1 + skillEffectProgress * 3]} intensity={1} color="#ff4400" distance={5} />
    {:else if activeSkillEffect === 'magic_e'}
      <!-- 結界 -->
      <T.Mesh position.y={1}>
        <T.SphereGeometry args={[1.5, 16, 16]} />
        <T.MeshBasicMaterial color="#aa44ff" transparent opacity={0.3} side={1} />
      </T.Mesh>
    {:else if activeSkillEffect === 'magic_r'}
      <!-- 隕石 -->
      <T.Mesh position={[0, 10 - skillEffectProgress * 3, 3]}>
        <T.SphereGeometry args={[1.5, 12, 12]} />
        <T.MeshBasicMaterial color="#ff4400" />
      </T.Mesh>
      <T.PointLight position={[0, 10 - skillEffectProgress * 3, 3]} intensity={3} color="#ff4400" distance={15} />
    {/if}

    <!-- 格闘家スキル -->
    {#if activeSkillEffect === 'fist_q'}
      <!-- 瞬歩 - 残像 -->
      <T.Mesh position={[0, 1, -1 - skillEffectProgress]}>
        <T.CapsuleGeometry args={[0.3, 1, 8, 16]} />
        <T.MeshBasicMaterial color="#44ff88" transparent opacity={0.5 - skillEffectProgress * 0.15} />
      </T.Mesh>
    {:else if activeSkillEffect === 'fist_e'}
      <!-- 練気 - 体が光る -->
      <T.Mesh position.y={1}>
        <T.CapsuleGeometry args={[0.5, 1.2, 8, 16]} />
        <T.MeshBasicMaterial color="#44ff88" transparent opacity={0.4} />
      </T.Mesh>
    {:else if activeSkillEffect === 'fist_r'}
      <!-- 百裂拳 - 複数の拳 -->
      {#each Array(5) as _, i}
        <T.Mesh position={[Math.sin(skillEffectProgress * 10 + i) * 0.5, 1, 0.5 + Math.cos(skillEffectProgress * 10 + i) * 0.3]}>
          <T.SphereGeometry args={[0.15, 8, 8]} />
          <T.MeshBasicMaterial color="#ffcc00" transparent opacity={0.8} />
        </T.Mesh>
      {/each}
    {/if}
  {/if}
</T.Group>
