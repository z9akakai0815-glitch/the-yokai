<script lang="ts">
  import { T } from '@threlte/core';

  // 最適化版 - 渋谷ステージ
  
  // ビルデータ（数を減らす）
  interface Building {
    x: number;
    z: number;
    width: number;
    depth: number;
    height: number;
    color: string;
  }

  const buildings: Building[] = [];
  
  // 左側のビル（5つに減らす）
  for (let i = 0; i < 5; i++) {
    buildings.push({
      x: -15,
      z: -30 + i * 15,
      width: 8,
      depth: 8,
      height: 15 + i * 5,
      color: '#2a2a3e',
    });
  }

  // 右側のビル（5つに減らす）
  for (let i = 0; i < 5; i++) {
    buildings.push({
      x: 15,
      z: -30 + i * 15,
      width: 8,
      depth: 8,
      height: 20 + i * 4,
      color: '#2a2a3e',
    });
  }

  // 街灯（4つだけ、光源なし）
  const streetLights = [
    { x: -7, z: -20 },
    { x: 7, z: -20 },
    { x: -7, z: 20 },
    { x: 7, z: 20 },
  ];
</script>

<!-- 地面（道路） -->
<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
  <T.PlaneGeometry args={[30, 100]} />
  <T.MeshLambertMaterial color="#2a2a2a" />
</T.Mesh>

<!-- 道路の白線 -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={0.01}>
  <T.PlaneGeometry args={[0.3, 80]} />
  <T.MeshBasicMaterial color="#ffffff" />
</T.Mesh>

<!-- 歩道（左右） -->
<T.Mesh position={[-10, 0.05, 0]} rotation.x={-Math.PI / 2}>
  <T.PlaneGeometry args={[4, 100]} />
  <T.MeshLambertMaterial color="#3a3a3a" />
</T.Mesh>
<T.Mesh position={[10, 0.05, 0]} rotation.x={-Math.PI / 2}>
  <T.PlaneGeometry args={[4, 100]} />
  <T.MeshLambertMaterial color="#3a3a3a" />
</T.Mesh>

<!-- ビル群（シンプルに） -->
{#each buildings as building}
  <T.Mesh position={[building.x, building.height / 2, building.z]}>
    <T.BoxGeometry args={[building.width, building.height, building.depth]} />
    <T.MeshLambertMaterial color={building.color} />
  </T.Mesh>
  
  <!-- 窓（明るく） -->
  <T.Mesh position={[building.x, building.height / 2, building.z + building.depth / 2 + 0.1]}>
    <T.PlaneGeometry args={[building.width * 0.8, building.height * 0.7]} />
    <T.MeshBasicMaterial color="#5588aa" transparent opacity={0.5} />
  </T.Mesh>
{/each}

<!-- 街灯（光源なし、見た目だけ） -->
{#each streetLights as light}
  <T.Mesh position={[light.x, 2.5, light.z]}>
    <T.CylinderGeometry args={[0.08, 0.08, 5, 6]} />
    <T.MeshLambertMaterial color="#333" />
  </T.Mesh>
  <T.Mesh position={[light.x, 5, light.z]}>
    <T.SphereGeometry args={[0.25, 6, 6]} />
    <T.MeshBasicMaterial color="#ffcc66" />
  </T.Mesh>
{/each}

<!-- ネオン看板（東京っぽく増やす） -->
<T.Mesh position={[-14, 8, -10]}>
  <T.BoxGeometry args={[4, 2, 0.1]} />
  <T.MeshBasicMaterial color="#ff0040" />
</T.Mesh>

<T.Mesh position={[14, 10, 5]}>
  <T.BoxGeometry args={[3, 1.5, 0.1]} />
  <T.MeshBasicMaterial color="#00ffff" />
</T.Mesh>

<T.Mesh position={[-13, 12, 15]}>
  <T.BoxGeometry args={[3, 1, 0.1]} />
  <T.MeshBasicMaterial color="#ff66aa" />
</T.Mesh>

<T.Mesh position={[13, 6, -20]}>
  <T.BoxGeometry args={[2, 2.5, 0.1]} />
  <T.MeshBasicMaterial color="#66ff66" />
</T.Mesh>

<T.Mesh position={[-14, 15, 0]}>
  <T.BoxGeometry args={[5, 1.5, 0.1]} />
  <T.MeshBasicMaterial color="#ffaa00" />
</T.Mesh>

<!-- 自動販売機（光る） -->
<T.Group position={[8, 0, -5]}>
  <T.Mesh position.y={1}>
    <T.BoxGeometry args={[1.2, 2, 0.7]} />
    <T.MeshLambertMaterial color="#1144aa" />
  </T.Mesh>
  <T.Mesh position={[0, 1, 0.36]}>
    <T.PlaneGeometry args={[1, 1.6]} />
    <T.MeshBasicMaterial color="#66ccff" transparent opacity={0.7} />
  </T.Mesh>
</T.Group>

<!-- 自動販売機2 -->
<T.Group position={[-8, 0, 10]}>
  <T.Mesh position.y={1}>
    <T.BoxGeometry args={[1.2, 2, 0.7]} />
    <T.MeshLambertMaterial color="#aa2222" />
  </T.Mesh>
  <T.Mesh position={[0, 1, 0.36]}>
    <T.PlaneGeometry args={[1, 1.6]} />
    <T.MeshBasicMaterial color="#ff6666" transparent opacity={0.7} />
  </T.Mesh>
</T.Group>

<!-- 霧（東京の夜霧） -->
<T.Fog color="#1a1a2e" near={40} far={120} attach="fog" />

<!-- ライティング（東京の夜） -->
<T.AmbientLight intensity={0.7} color="#8899cc" />
<T.DirectionalLight position={[10, 30, 10]} intensity={0.6} color="#aabbdd" />

<!-- 街の光（暖色） -->
<T.PointLight position={[0, 8, 0]} intensity={1.2} color="#ffaa66" distance={50} />

<!-- スカイボックス（東京の夜空） -->
<T.Mesh>
  <T.SphereGeometry args={[200, 16, 16]} />
  <T.MeshBasicMaterial color="#0a0a1a" side={1} />
</T.Mesh>

<!-- 月（大きく明るく） -->
<T.Mesh position={[50, 60, -100]}>
  <T.SphereGeometry args={[10, 16, 16]} />
  <T.MeshBasicMaterial color="#ffffdd" />
</T.Mesh>

<!-- 月明かり -->
<T.DirectionalLight position={[50, 60, -100]} intensity={0.3} color="#aaccff" />
