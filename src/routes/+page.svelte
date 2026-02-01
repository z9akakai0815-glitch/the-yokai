<script lang="ts">
  import { onMount } from 'svelte';
  import Game from '$lib/components/Game.svelte';

  let gameStarted = false;

  function startGame() {
    gameStarted = true;
  }
</script>

<svelte:head>
  <title>THE YOKAI</title>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700;900&display=swap" rel="stylesheet">
</svelte:head>

{#if !gameStarted}
  <main class="title-screen">
    <div class="title-content">
      <h1 class="game-title">THE YOKAI</h1>
      <p class="subtitle">〜 妖怪討伐 〜</p>
      <button class="start-btn" on:click={startGame}>
        始める
      </button>
    </div>
    <div class="bg-effect"></div>
  </main>
{:else}
  <Game />
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #0a0a0a;
    font-family: 'Noto Serif JP', serif;
    color: #fff;
    overflow: hidden;
  }

  .title-screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a1a 100%);
  }

  .title-content {
    text-align: center;
    z-index: 10;
  }

  .game-title {
    font-size: 5rem;
    font-weight: 900;
    color: #fff;
    text-shadow: 
      0 0 10px #ff0040,
      0 0 20px #ff0040,
      0 0 40px #ff0040,
      0 0 80px #ff0040;
    letter-spacing: 0.2em;
    margin-bottom: 0.5rem;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { 
      text-shadow: 
        0 0 10px #ff0040,
        0 0 20px #ff0040,
        0 0 40px #ff0040;
    }
    50% { 
      text-shadow: 
        0 0 20px #ff0040,
        0 0 40px #ff0040,
        0 0 60px #ff0040,
        0 0 100px #ff0040;
    }
  }

  .subtitle {
    font-size: 1.5rem;
    color: #888;
    margin-bottom: 3rem;
    letter-spacing: 0.5em;
  }

  .start-btn {
    font-family: 'Noto Serif JP', serif;
    font-size: 1.5rem;
    padding: 1rem 3rem;
    background: transparent;
    color: #ff0040;
    border: 2px solid #ff0040;
    cursor: pointer;
    transition: all 0.3s;
    letter-spacing: 0.3em;
  }

  .start-btn:hover {
    background: #ff0040;
    color: #000;
    box-shadow: 0 0 30px #ff0040;
  }

  .bg-effect {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(255, 0, 64, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 80% 20%, rgba(64, 0, 255, 0.1) 0%, transparent 40%);
    pointer-events: none;
  }
</style>
