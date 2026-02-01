<script lang="ts">
  import { T } from '@threlte/core';
  import * as THREE from 'three';

  // 渋谷ステージ - 夜の東京風
  
  // ビルの生成データ
  interface Building {
    x: number;
    z: number;
    width: number;
    depth: number;
    height: number;
    color: string;
  }

  // ランダムにビルを配置
  const buildings: Building[] = [];
  
  // 左側のビル群
  for (let i = 0; i < 8; i++) {
    buildings.push({
      x: -15 + Math.random() * 3,
      z: -40 + i * 12,
      width: 6 + Math.random() * 4,
      depth: 6 + Math.random() * 4,
      height: 15 + Math.random() * 25,
      color: `hsl(${220 + Math.random() * 30}, 20%, ${15 + Math.random() * 10}%)`,
    });
  }

  // 右側のビル群
  for (let i = 0; i < 8; i++) {
    buildings.push({
      x: 15 + Math.random() * 3,
      z: -40 + i * 12,
      width: 6 + Math.random() * 4,
      depth: 6 + Math.random() * 4,
      height: 15 + Math.random() * 25,
      color: `hsl(${220 + Math.random() * 30}, 20%, ${15 + Math.random() * 10}%)`,
    });
  }

  // 街灯データ
  const streetLights: { x: number; z: number }[] = [];
  for (let i = 0; i < 10; i++) {
    streetLights.push({ x: -8, z: -35 + i * 8 });
    streetLights.push({ x: 8, z: -35 + i * 8 });
  }

  // 窓の光（ビルごとにランダム）
  function getWindowLights(building: Building): { x: number; y: number; z: number }[] {
    const lights: { x: number; y: number; z: number }[] = [];
    const windowsX = Math.floor(building.width / 2);
    const windowsY = Math.floor(building.height / 3);
    
    for (let wx = 0; wx < windowsX; wx++) {
      for (let wy = 0; wy < windowsY; wy++) {
        if (Math.random() > 0.4) {
          lights.push({
            x: building.x - building.width / 2 + 1 + wx * 2,
            y: 2 + wy * 3,
            z: building.z + building.depth / 2 + 0.1,
          });
        }
      }
    }
    return lights;
  }
</script>

<!-- 地面（道路） -->
<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
  <T.PlaneGeometry args={[30, 100]} />
  <T.MeshStandardMaterial color="#1a1a1a" />
</T.Mesh>

<!-- 道路の白線 -->
<T.Mesh rotation.x={-Math.PI / 2} position.y={0.01}>
  <T.PlaneGeometry args={[0.3, 80]} />
  <T.MeshBasicMaterial color="#ffffff" />
</T.Mesh>

<!-- 歩道（左） -->
<T.Mesh position={[-12, 0.1, 0]} rotation.x={-Math.PI / 2}>
  <T.PlaneGeometry args={[6, 100]} />
  <T.MeshStandardMaterial color="#2a2a2a" />
</T.Mesh>

<!-- 歩道（右） -->
<T.Mesh position={[12, 0.1, 0]} rotation.x={-Math.PI / 2}>
  <T.PlaneGeometry args={[6, 100]} />
  <T.MeshStandardMaterial color="#2a2a2a" />
</T.Mesh>

<!-- ビル群 -->
{#each buildings as building}
  <T.Mesh 
    position={[building.x, building.height / 2, building.z]} 
    castShadow 
    receiveShadow
  >
    <T.BoxGeometry args={[building.width, building.height, building.depth]} />
    <T.MeshStandardMaterial color={building.color} />
  </T.Mesh>
  
  <!-- ビルの窓の光 -->
  {#each getWindowLights(building) as light}
    <T.Mesh position={[light.x, light.y, light.z]}>
      <T.PlaneGeometry args={[1, 1.5]} />
      <T.MeshBasicMaterial 
        color={Math.random() > 0.7 ? "#ffaa44" : "#aaddff"} 
        transparent 
        opacity={0.8} 
      />
    </T.Mesh>
  {/each}
{/each}

<!-- 街灯 -->
{#each streetLights as light}
  <!-- ポール -->
  <T.Mesh position={[light.x, 2.5, light.z]}>
    <T.CylinderGeometry args={[0.1, 0.1, 5, 8]} />
    <T.MeshStandardMaterial color="#333" metalness={0.8} />
  </T.Mesh>
  <!-- ランプ -->
  <T.Mesh position={[light.x, 5, light.z]}>
    <T.SphereGeometry args={[0.3, 8, 8]} />
    <T.MeshBasicMaterial color="#ffaa44" />
  </T.Mesh>
  <!-- 光源 -->
  <T.PointLight 
    position={[light.x, 5, light.z]} 
    intensity={0.5} 
    color="#ffaa44" 
    distance={15}
  />
{/each}

<!-- 赤いネオン看板 -->
<T.Group position={[-14, 8, -10]}>
  <T.Mesh>
    <T.BoxGeometry args={[4, 2, 0.2]} />
    <T.MeshBasicMaterial color="#ff0040" />
  </T.Mesh>
  <T.PointLight position={[0, 0, 1]} intensity={1} color="#ff0040" distance={10} />
</T.Group>

<!-- 青いネオン看板 -->
<T.Group position={[14, 10, 5]}>
  <T.Mesh>
    <T.BoxGeometry args={[3, 1.5, 0.2]} />
    <T.MeshBasicMaterial color="#4488ff" />
  </T.Mesh>
  <T.PointLight position={[0, 0, 1]} intensity={1} color="#4488ff" distance={10} />
</T.Group>

<!-- 紫のネオン看板 -->
<T.Group position={[-13, 6, 20]}>
  <T.Mesh>
    <T.BoxGeometry args={[2, 3, 0.2]} />
    <T.MeshBasicMaterial color="#aa44ff" />
  </T.Mesh>
  <T.PointLight position={[0, 0, 1]} intensity={1} color="#aa44ff" distance={10} />
</T.Group>

<!-- 自動販売機 -->
<T.Group position={[9, 1, -5]}>
  <T.Mesh castShadow>
    <T.BoxGeometry args={[1.2, 2, 0.8]} />
    <T.MeshStandardMaterial color="#2244aa" />
  </T.Mesh>
  <T.Mesh position={[0, 0, 0.41]}>
    <T.PlaneGeometry args={[1, 1.5]} />
    <T.MeshBasicMaterial color="#88ccff" transparent opacity={0.5} />
  </T.Mesh>
  <T.PointLight position={[0, 0, 1]} intensity={0.3} color="#88ccff" distance={5} />
</T.Group>

<!-- コンビニ風の店 -->
<T.Group position={[-10, 0, 15]}>
  <T.Mesh position.y={2} castShadow>
    <T.BoxGeometry args={[8, 4, 6]} />
    <T.MeshStandardMaterial color="#1a1a2e" />
  </T.Mesh>
  <!-- 店の入り口（光） -->
  <T.Mesh position={[0, 1.5, 3.1]}>
    <T.PlaneGeometry args={[3, 2.5]} />
    <T.MeshBasicMaterial color="#ffffff" transparent opacity={0.3} />
  </T.Mesh>
  <T.PointLight position={[0, 2, 4]} intensity={1} color="#ffffff" distance={8} />
</T.Group>

<!-- 空気感の霧 -->
<T.Fog color="#0a0a1a" near={20} far={80} attach="fog" />

<!-- 環境光 -->
<T.AmbientLight intensity={0.15} color="#4466aa" />

<!-- メインの指向性ライト（月明かり） -->
<T.DirectionalLight 
  position={[20, 40, 20]} 
  intensity={0.3}
  color="#6688cc"
  castShadow
/>

<!-- 赤い不気味な光（妖怪の気配） -->
<T.PointLight position={[0, 3, 0]} intensity={0.5} color="#ff0040" distance={20} />
