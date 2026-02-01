<script lang="ts">
  import { T, useThrelte, useTask } from '@threlte/core';
  import { gameState } from '$lib/game/gameState';
  import * as THREE from 'three';

  const { camera } = useThrelte();

  // カメラ設定
  const CAMERA_DISTANCE = 8;
  const CAMERA_HEIGHT = 5;
  const CAMERA_SMOOTHING = 0.1;

  let targetPosition = new THREE.Vector3();
  let currentPosition = new THREE.Vector3(0, CAMERA_HEIGHT, CAMERA_DISTANCE);

  // マウスでカメラ回転
  let mouseX = 0;
  let mouseY = 0;
  let cameraAngle = 0;
  let cameraVertical = 0.3;

  function handleMouseMove(e: MouseEvent) {
    if (document.pointerLockElement) {
      cameraAngle -= e.movementX * 0.003;
      cameraVertical = Math.max(0.1, Math.min(0.8, cameraVertical + e.movementY * 0.003));
    }
  }

  function handleClick() {
    const canvas = document.querySelector('canvas');
    if (canvas && !document.pointerLockElement) {
      canvas.requestPointerLock();
    }
  }

  // ゲームループでカメラ更新
  useTask(() => {
    const playerPos = $gameState.playerPosition;
    const playerRot = $gameState.playerRotation;

    // プレイヤーの位置を基準にカメラ位置を計算
    const offsetX = Math.sin(cameraAngle) * CAMERA_DISTANCE;
    const offsetZ = Math.cos(cameraAngle) * CAMERA_DISTANCE;
    const offsetY = CAMERA_HEIGHT * cameraVertical + 2;

    targetPosition.set(
      playerPos.x + offsetX,
      playerPos.y + offsetY,
      playerPos.z + offsetZ
    );

    // スムーズに追従
    currentPosition.lerp(targetPosition, CAMERA_SMOOTHING);

    // カメラ位置を更新
    if ($camera) {
      $camera.position.copy(currentPosition);
      $camera.lookAt(playerPos.x, playerPos.y + 1.5, playerPos.z);
    }
  });
</script>

<svelte:window on:mousemove={handleMouseMove} on:click={handleClick} />

<T.PerspectiveCamera 
  makeDefault 
  position={[0, CAMERA_HEIGHT, CAMERA_DISTANCE]} 
  fov={60}
  near={0.1}
  far={1000}
/>
