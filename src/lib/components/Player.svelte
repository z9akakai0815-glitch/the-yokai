<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { onMount, onDestroy } from 'svelte';
  import { gameState } from '$lib/game/gameState';
  import * as THREE from 'three';

  let position = { x: 0, y: 0, z: 0 };
  let rotation = 0;
  let isAttacking = false;
  let attackAnimation = 0;

  // キー入力状態
  let keys: Record<string, boolean> = {};

  // 移動速度
  const MOVE_SPEED = 0.15;
  const ROTATION_SPEED = 0.1;

  function handleKeyDown(e: KeyboardEvent) {
    keys[e.key.toLowerCase()] = true;
    
    // 攻撃（スペースキー）
    if (e.key === ' ' && !isAttacking) {
      attack();
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    keys[e.key.toLowerCase()] = false;
  }

  function attack() {
    isAttacking = true;
    attackAnimation = 0;
    gameState.update(s => ({ ...s, isAttacking: true }));
    
    // 攻撃アニメーション
    setTimeout(() => {
      isAttacking = false;
      gameState.update(s => ({ ...s, isAttacking: false }));
    }, 300);
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
    // 移動
    let moveX = 0;
    let moveZ = 0;

    if (keys['w'] || keys['arrowup']) moveZ -= 1;
    if (keys['s'] || keys['arrowdown']) moveZ += 1;
    if (keys['a'] || keys['arrowleft']) moveX -= 1;
    if (keys['d'] || keys['arrowright']) moveX += 1;

    // 移動ベクトルを正規化
    if (moveX !== 0 || moveZ !== 0) {
      const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
      moveX /= length;
      moveZ /= length;

      // 移動方向に向きを変える
      rotation = Math.atan2(moveX, moveZ);
    }

    position.x += moveX * MOVE_SPEED;
    position.z += moveZ * MOVE_SPEED;

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

  // 刀の回転（攻撃時）
  $: swordRotation = isAttacking ? Math.sin(attackAnimation * Math.PI) * 1.5 : 0;
</script>

<!-- プレイヤー本体 -->
<T.Group position.x={position.x} position.y={position.y} position.z={position.z} rotation.y={rotation}>
  <!-- 体 -->
  <T.Mesh position.y={1} castShadow>
    <T.CapsuleGeometry args={[0.3, 1, 8, 16]} />
    <T.MeshStandardMaterial color="#2a2a4a" />
  </T.Mesh>

  <!-- 頭 -->
  <T.Mesh position.y={2} castShadow>
    <T.SphereGeometry args={[0.35, 16, 16]} />
    <T.MeshStandardMaterial color="#ffdbac" />
  </T.Mesh>

  <!-- 髪 -->
  <T.Mesh position={[0, 2.2, -0.1]} castShadow>
    <T.SphereGeometry args={[0.38, 16, 16]} />
    <T.MeshStandardMaterial color="#1a1a2e" />
  </T.Mesh>

  <!-- 刀 -->
  <T.Group position={[0.5, 1.2, 0]} rotation.x={swordRotation}>
    <!-- 柄 -->
    <T.Mesh position.y={-0.2}>
      <T.CylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
      <T.MeshStandardMaterial color="#4a3728" />
    </T.Mesh>
    <!-- 刃 -->
    <T.Mesh position.y={0.4}>
      <T.BoxGeometry args={[0.02, 0.8, 0.08]} />
      <T.MeshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
    </T.Mesh>
    <!-- 攻撃エフェクト -->
    {#if isAttacking}
      <T.Mesh position.y={0.4}>
        <T.BoxGeometry args={[0.1, 1, 0.3]} />
        <T.MeshBasicMaterial color="#ff0040" transparent opacity={0.5} />
      </T.Mesh>
    {/if}
  </T.Group>
</T.Group>
