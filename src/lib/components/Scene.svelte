<script lang="ts">
  import { T } from '@threlte/core';
  import ThirdPersonCamera from './ThirdPersonCamera.svelte';
  import Stage from './Stage.svelte';
  import Player from './Player.svelte';
  import Enemy from './Enemy.svelte';
  import { gameState } from '$lib/game/gameState';

  // ウェーブシステム
  interface EnemyData {
    id: number;
    x: number;
    z: number;
    alive: boolean;
  }

  let nextEnemyId = 0;
  let enemies: EnemyData[] = [];
  let defeatedInWave = 0;
  const ENEMIES_PER_WAVE = 3;
  const WAVE_SPAWN_THRESHOLD = 3; // 3体倒したら次のウェーブ

  // 初期スポーン位置
  function getSpawnPositions(): { x: number; z: number }[] {
    return [
      { x: 3 + (Math.random() - 0.5) * 4, z: -10 + (Math.random() - 0.5) * 4 },
      { x: -3 + (Math.random() - 0.5) * 4, z: 5 + (Math.random() - 0.5) * 4 },
      { x: 0 + (Math.random() - 0.5) * 4, z: 15 + (Math.random() - 0.5) * 4 },
    ];
  }

  // ウェーブスポーン
  function spawnWave() {
    const positions = getSpawnPositions();
    for (const pos of positions) {
      enemies = [...enemies, { id: nextEnemyId++, x: pos.x, z: pos.z, alive: true }];
    }
  }

  // 敵が倒された時
  function onEnemyDefeated(event: CustomEvent<{ id: number }>) {
    const { id } = event.detail;
    enemies = enemies.map(e => e.id === id ? { ...e, alive: false } : e);
    defeatedInWave++;
    
    // 3体倒したら次のウェーブ
    if (defeatedInWave >= WAVE_SPAWN_THRESHOLD) {
      defeatedInWave = 0;
      // 死んだ敵を削除してから新しいウェーブ
      enemies = enemies.filter(e => e.alive);
      setTimeout(() => spawnWave(), 1000); // 1秒後に新しいウェーブ
    }
  }

  // 初期スポーン
  spawnWave();

  $: aliveEnemies = enemies.filter(e => e.alive);
</script>

<!-- 三人称カメラ -->
<ThirdPersonCamera />

<!-- ステージ -->
<Stage />

<!-- プレイヤー -->
<Player />

<!-- 敵キャラクター -->
{#each aliveEnemies as enemy (enemy.id)}
  <Enemy 
    position={[enemy.x, 0, enemy.z]} 
    id={enemy.id}
    on:defeated={onEnemyDefeated}
  />
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
