<script lang="ts">
  import { T, useTask } from '@threlte/core';
  import { OrbitControls, Grid } from '@threlte/extras';
  import Player from './Player.svelte';
  import Enemy from './Enemy.svelte';
  import { gameState } from '$lib/game/gameState';
  import * as THREE from 'three';

  // 環境光と指向性ライト
  const ambientIntensity = 0.3;
  const directionalIntensity = 1;
</script>

<!-- カメラ -->
<T.PerspectiveCamera makeDefault position={[0, 8, 12]} fov={60}>
  <OrbitControls 
    enablePan={false}
    maxPolarAngle={Math.PI / 2.2}
    minDistance={5}
    maxDistance={20}
  />
</T.PerspectiveCamera>

<!-- ライティング -->
<T.AmbientLight intensity={ambientIntensity} color="#4466ff" />
<T.DirectionalLight 
  position={[10, 20, 10]} 
  intensity={directionalIntensity}
  castShadow
/>
<T.PointLight position={[0, 5, 0]} intensity={0.5} color="#ff0040" />

<!-- 霧 -->
<T.Fog color="#0a0a1a" near={10} far={50} attach="fog" />

<!-- 地面 -->
<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
  <T.PlaneGeometry args={[100, 100]} />
  <T.MeshStandardMaterial color="#1a1a2e" />
</T.Mesh>

<!-- グリッド（デバッグ用） -->
<Grid 
  cellColor="#ff0040"
  sectionColor="#ff0040"
  fadeDistance={30}
  cellSize={1}
  sectionSize={5}
  infiniteGrid
/>

<!-- プレイヤー -->
<Player />

<!-- 敵（テスト用） -->
<Enemy position={[0, 0, -5]} />

<!-- 背景の演出 -->
<T.Mesh position={[0, 25, -30]}>
  <T.SphereGeometry args={[2, 16, 16]} />
  <T.MeshBasicMaterial color="#ff0040" />
</T.Mesh>
