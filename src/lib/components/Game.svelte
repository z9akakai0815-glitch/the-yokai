<script lang="ts">
  import { Canvas } from '@threlte/core';
  import Scene from './Scene.svelte';
  import GameUI from './GameUI.svelte';
  import { gameState } from '$lib/game/gameState';
</script>

<div class="game-container">
  <Canvas>
    <Scene />
  </Canvas>
  <GameUI />
</div>

<style>
  .game-container {
    width: 100vw;
    height: 100vh;
    position: relative;
  }

  .game-container :global(canvas) {
    display: block;
  }
</style>
