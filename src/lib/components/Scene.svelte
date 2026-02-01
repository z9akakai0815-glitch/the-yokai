<script lang="ts">
  import { T } from '@threlte/core';
  import ThirdPersonCamera from './ThirdPersonCamera.svelte';
  import Stage from './Stage.svelte';
  import Player from './Player.svelte';
  import Enemy from './Enemy.svelte';
  import { gameState } from '$lib/game/gameState';

  // 敵の配置（ステージ上のランダムな位置）
  const enemies: { x: number; z: number }[] = [
    { x: 3, z: -10 },
    { x: -4, z: -5 },
    { x: 5, z: 5 },
    { x: -3, z: 15 },
    { x: 0, z: -20 },
    { x: 6, z: -15 },
    { x: -5, z: 10 },
  ];
</script>

<!-- 三人称カメラ -->
<ThirdPersonCamera />

<!-- ステージ -->
<Stage />

<!-- プレイヤー -->
<Player />

<!-- 敵キャラクター -->
{#each enemies as enemy, i}
  <Enemy position={[enemy.x, 0, enemy.z]} />
{/each}

<!-- スカイボックス（夜空） -->
<T.Mesh>
  <T.SphereGeometry args={[500, 32, 32]} />
  <T.MeshBasicMaterial color="#050510" side={1} />
</T.Mesh>

<!-- 月 -->
<T.Mesh position={[100, 80, -200]}>
  <T.SphereGeometry args={[20, 32, 32]} />
  <T.MeshBasicMaterial color="#ffffee" />
</T.Mesh>
