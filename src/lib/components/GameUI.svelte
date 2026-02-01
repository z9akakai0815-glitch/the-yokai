<script lang="ts">
  import { gameState } from '$lib/game/gameState';

  $: hp = $gameState.playerHp;
  $: maxHp = $gameState.playerMaxHp;
  $: souls = $gameState.souls;
  $: enemiesDefeated = $gameState.enemiesDefeated;
</script>

<div class="game-ui">
  <!-- プレイヤーステータス -->
  <div class="player-status">
    <div class="hp-container">
      <div class="hp-label">HP</div>
      <div class="hp-bar">
        <div class="hp-fill" style="width: {(hp / maxHp) * 100}%"></div>
      </div>
      <div class="hp-text">{hp}/{maxHp}</div>
    </div>
    
    <div class="souls-container">
      <span class="soul-icon">👻</span>
      <span class="soul-count">{souls}</span>
    </div>
  </div>

  <!-- 操作説明 -->
  <div class="controls-hint">
    <div class="hint-row">
      <span class="key">W A S D</span>
      <span class="action">移動</span>
    </div>
    <div class="hint-row">
      <span class="key">SPACE</span>
      <span class="action">攻撃</span>
    </div>
  </div>

  <!-- スコア -->
  <div class="score">
    <div>討伐数: {enemiesDefeated}</div>
  </div>
</div>

<style>
  .game-ui {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    font-family: 'Noto Serif JP', serif;
  }

  .player-status {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .hp-container {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hp-label {
    color: #ff0040;
    font-size: 1.2rem;
    font-weight: bold;
    text-shadow: 0 0 10px #ff0040;
  }

  .hp-bar {
    width: 200px;
    height: 20px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid #ff0040;
    overflow: hidden;
  }

  .hp-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff0040, #ff4060);
    transition: width 0.3s;
  }

  .hp-text {
    color: #fff;
    font-size: 0.9rem;
  }

  .souls-container {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.5);
    padding: 5px 15px;
    border: 1px solid #8844ff;
  }

  .soul-icon {
    font-size: 1.5rem;
  }

  .soul-count {
    color: #8844ff;
    font-size: 1.2rem;
    font-weight: bold;
    text-shadow: 0 0 10px #8844ff;
  }

  .controls-hint {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.7);
    padding: 15px;
    border: 1px solid #444;
  }

  .hint-row {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 5px;
  }

  .hint-row:last-child {
    margin-bottom: 0;
  }

  .key {
    background: #333;
    color: #fff;
    padding: 3px 8px;
    font-size: 0.8rem;
    border: 1px solid #666;
    min-width: 60px;
    text-align: center;
  }

  .action {
    color: #888;
    font-size: 0.9rem;
  }

  .score {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px 20px;
    border: 1px solid #ff0040;
    color: #fff;
  }
</style>
