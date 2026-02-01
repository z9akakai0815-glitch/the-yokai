<script lang="ts">
  import { T, useTask, useThrelte } from '@threlte/core';
  import { onMount, onDestroy } from 'svelte';
  import { gameState, type CharacterType } from '$lib/game/gameState';
  import * as THREE from 'three';

  const { camera } = useThrelte();

  let position = { x: 0, y: 0, z: 0 };
  let rotation = 0;
  let isAttacking = false;
  let attackAnimation = 0;

  // キー入力状態
  let keys: Record<string, boolean> = {};

  // 移動速度
  const BASE_SPEED = 0.15;
  
  // キャラクター別パラメータ
  const characterParams: Record<CharacterType, { speed: number; attackRange: number }> = {
    sword: { speed: 1.0, attackRange: 2 },
    gun: { speed: 0.9, attackRange: 8 },
    magic: { speed: 0.8, attackRange: 5 },
    fist: { speed: 1.2, attackRange: 1.5 },
  };

  function handleKeyDown(e: KeyboardEvent) {
    keys[e.key.toLowerCase()] = true;
    
    // 攻撃（スペースキー）
    if (e.key === ' ' && !isAttacking) {
      attack();
    }
    
    // キャラ切り替え（1-4）
    if (e.key === '1') gameState.switchCharacter('sword');
    if (e.key === '2') gameState.switchCharacter('gun');
    if (e.key === '3') gameState.switchCharacter('magic');
    if (e.key === '4') gameState.switchCharacter('fist');
    
    // スキルツリー（K）
    if (e.key === 'k') gameState.toggleSkillTree();
    
    // キャラ選択（C）
    if (e.key === 'c') gameState.toggleCharacterSelect();
  }

  function handleKeyUp(e: KeyboardEvent) {
    keys[e.key.toLowerCase()] = false;
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

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  });

  // ゲームループ
  useTask((delta) => {
    const charType = $gameState.currentCharacter;
    const speed = BASE_SPEED * characterParams[charType].speed;
    
    // 入力取得
    let inputX = 0;
    let inputZ = 0;

    if (keys['w'] || keys['arrowup']) inputZ = -1;
    if (keys['s'] || keys['arrowdown']) inputZ = 1;
    if (keys['a'] || keys['arrowleft']) inputX = -1;
    if (keys['d'] || keys['arrowright']) inputX = 1;

    // 移動がある場合
    if (inputX !== 0 || inputZ !== 0) {
      // カメラの向きを取得
      if ($camera) {
        const cameraDirection = new THREE.Vector3();
        $camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // Y軸は無視（水平移動のみ）
        cameraDirection.normalize();
        
        // カメラの右方向を計算
        const cameraRight = new THREE.Vector3();
        cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
        cameraRight.normalize();
        
        // 入力を正規化
        const inputLength = Math.sqrt(inputX * inputX + inputZ * inputZ);
        inputX /= inputLength;
        inputZ /= inputLength;
        
        // カメラ基準の移動方向を計算
        // 前後（Z入力）はカメラの向きの逆方向（カメラは後ろを向いているので）
        // 左右（X入力）はカメラの右方向
        const moveDirection = new THREE.Vector3();
        moveDirection.addScaledVector(cameraDirection, -inputZ); // Wで前進
        moveDirection.addScaledVector(cameraRight, inputX);      // Dで右
        moveDirection.normalize();
        
        // 位置を更新
        position.x += moveDirection.x * speed;
        position.z += moveDirection.z * speed;
        
        // キャラクターの向きを移動方向に合わせる
        rotation = Math.atan2(moveDirection.x, moveDirection.z);
        
        // 道路の範囲内に制限
        position.x = Math.max(-9, Math.min(9, position.x));
        position.z = Math.max(-40, Math.min(40, position.z));
      }
    }

    // 攻撃アニメーション
    if (isAttacking) {
      attackAnimation += delta * 10;
    }

    // ゲームステートを更新
    gameState.update(s => ({
      ...s,
      playerPosition: { ...position },
      playerRotation: rotation,
    }));
  });

  // 武器の回転（攻撃時）
  $: weaponRotation = isAttacking ? Math.sin(attackAnimation * Math.PI) * 1.5 : 0;
  $: charType = $gameState.currentCharacter;
  $: charColor = $gameState.characters[charType].color;
</script>

<!-- プレイヤー本体 -->
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

  <!-- 髪（キャラ別の色） -->
  <T.Mesh position={[0, 2.2, -0.1]} castShadow>
    <T.SphereGeometry args={[0.38, 12, 12]} />
    <T.MeshLambertMaterial color={charColor} />
  </T.Mesh>

  <!-- 武器（キャラ別） -->
  {#if charType === 'sword'}
    <!-- 🗡️ 刀 -->
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
    <!-- 🔫 銃 -->
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
    <!-- ✨ 杖 -->
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
    <!-- 👊 グローブ -->
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

  <!-- キャラクターオーラ -->
  <T.Mesh position.y={0.05} rotation.x={-Math.PI / 2}>
    <T.CircleGeometry args={[0.5, 16]} />
    <T.MeshBasicMaterial color={charColor} transparent opacity={0.3} />
  </T.Mesh>
</T.Group>
