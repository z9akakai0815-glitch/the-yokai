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
      color: '#1a1a2e',
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
      color: '#1a1a2e',
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
  <T.MeshLambertMaterial color="#1a1a1a" />
</T.Mesh>

<!-- 道路の白線 -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={0.01}>
  <T.PlaneGeometry args={[0.3, 80]} />
  <T.MeshBasicMaterial color="#ffffff" />
</T.Mesh>

<!-- 歩道（左右） -->
<T.Mesh position={[-10, 0.05, 0]} rotation.x={-Math.PI / 2}>
  <T.PlaneGeometry args={[4, 100]} />
  <T.MeshLambertMaterial color="#252525" />
</T.Mesh>
<T.Mesh position={[10, 0.05, 0]} rotation.x={-Math.PI / 2}>
  <T.PlaneGeometry args={[4, 100]} />
  <T.MeshLambertMaterial color="#252525" />
</T.Mesh>

<!-- ビル群（シンプルに） -->
{#each buildings as building}
  <T.Mesh position={[building.x, building.height / 2, building.z]}>
    <T.BoxGeometry args={[building.width, building.height, building.depth]} />
    <T.MeshLambertMaterial color={building.color} />
  </T.Mesh>
  
  <!-- 窓（テクスチャ代わりに1枚の発光面） -->
  <T.Mesh position={[building.x, building.height / 2, building.z + building.depth / 2 + 0.1]}>
    <T.PlaneGeometry args={[building.width * 0.8, building.height * 0.7]} />
    <T.MeshBasicMaterial color="#334466" transparent opacity={0.3} />
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

<!-- ネオン看板（光源なし、シンプル） -->
<T.Mesh position={[-14, 8, -10]}>
  <T.BoxGeometry args={[3, 1.5, 0.1]} />
  <T.MeshBasicMaterial color="#ff0040" />
</T.Mesh>

<T.Mesh position={[14, 10, 5]}>
  <T.BoxGeometry args={[2.5, 1, 0.1]} />
  <T.MeshBasicMaterial color="#4488ff" />
</T.Mesh>

<!-- 自動販売機 -->
<T.Mesh position={[8, 1, -5]}>
  <T.BoxGeometry args={[1, 2, 0.6]} />
  <T.MeshLambertMaterial color="#2244aa" />
</T.Mesh>

<!-- 霧（軽め） -->
<T.Fog color="#050510" near={30} far={100} attach="fog" />

<!-- ライティング（最小限） -->
<T.AmbientLight intensity={0.4} color="#6688aa" />
<T.DirectionalLight position={[10, 30, 10]} intensity={0.5} color="#8899bb" />

<!-- 妖気の光（1つだけ） -->
<T.PointLight position={[0, 3, 0]} intensity={0.8} color="#ff0040" distance={30} />

<!-- スカイボックス -->
<T.Mesh>
  <T.SphereGeometry args={[200, 16, 16]} />
  <T.MeshBasicMaterial color="#030308" side={1} />
</T.Mesh>

<!-- 月 -->
<T.Mesh position={[50, 60, -100]}>
  <T.SphereGeometry args={[8, 16, 16]} />
  <T.MeshBasicMaterial color="#ffffee" />
</T.Mesh>
