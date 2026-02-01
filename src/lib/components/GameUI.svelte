<script lang="ts">
  import { gameState, CHARACTER_UNLOCK_COSTS, type CharacterType } from '$lib/game/gameState';
  import { skillTrees, canUnlockSkill } from '$lib/game/skillTrees';

  $: hp = $gameState.playerHp;
  $: maxHp = $gameState.playerMaxHp;
  $: souls = $gameState.souls;
  $: enemiesDefeated = $gameState.enemiesDefeated;
  $: currentChar = $gameState.currentCharacter;
  $: charData = $gameState.characters[currentChar];
  $: currentSkillTree = skillTrees[currentChar];

  // キャラクターアイコン
  const charIcons: Record<CharacterType, string> = {
    sword: '🗡️',
    gun: '🔫',
    magic: '✨',
    fist: '👊',
  };

  function unlockCharacter(type: CharacterType) {
    const cost = CHARACTER_UNLOCK_COSTS[type];
    gameState.unlockCharacter(type, cost);
  }

  function unlockSkill(skillId: string, cost: number) {
    gameState.unlockSkill(skillId, cost);
  }
</script>

<div class="game-ui">
  <!-- プレイヤーステータス -->
  <div class="player-status">
    <div class="character-info">
      <span class="char-icon">{charIcons[currentChar]}</span>
      <span class="char-name">{charData.name}</span>
    </div>
    
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

  <!-- キャラ切り替えインジケーター -->
  <div class="character-switch">
    {#each Object.entries($gameState.characters) as [type, data]}
      <div 
        class="char-slot" 
        class:active={type === currentChar}
        class:locked={!data.unlocked}
      >
        <span class="slot-icon">{charIcons[type as CharacterType]}</span>
        <span class="slot-key">{['1','2','3','4'][Object.keys($gameState.characters).indexOf(type)]}</span>
        {#if !data.unlocked}
          <span class="lock">🔒</span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- 操作説明 -->
  <div class="controls-hint">
    <div class="hint-row"><span class="key">WASD</span><span class="action">移動</span></div>
    <div class="hint-row"><span class="key">SPACE</span><span class="action">攻撃</span></div>
    <div class="hint-row"><span class="key">1-4</span><span class="action">キャラ切替</span></div>
    <div class="hint-row"><span class="key">K</span><span class="action">スキル</span></div>
    <div class="hint-row"><span class="key">C</span><span class="action">キャラ</span></div>
  </div>

  <!-- スコア -->
  <div class="score">
    <div>討伐数: {enemiesDefeated}</div>
  </div>

  <!-- キャラクター選択パネル -->
  {#if $gameState.showCharacterSelect}
    <div class="modal-overlay" on:click={() => gameState.toggleCharacterSelect()}>
      <div class="modal" on:click|stopPropagation>
        <h2>キャラクター選択</h2>
        <div class="character-grid">
          {#each Object.entries($gameState.characters) as [type, data]}
            {@const cost = CHARACTER_UNLOCK_COSTS[type as CharacterType]}
            <div class="character-card" class:unlocked={data.unlocked}>
              <div class="card-icon">{charIcons[type as CharacterType]}</div>
              <div class="card-name">{data.name}</div>
              {#if data.unlocked}
                <button 
                  class="select-btn"
                  class:active={type === currentChar}
                  on:click={() => gameState.switchCharacter(type as CharacterType)}
                >
                  {type === currentChar ? '使用中' : '選択'}
                </button>
              {:else}
                <button 
                  class="unlock-btn"
                  disabled={souls < cost}
                  on:click={() => unlockCharacter(type as CharacterType)}
                >
                  解放 ({cost}👻)
                </button>
              {/if}
            </div>
          {/each}
        </div>
        <button class="close-btn" on:click={() => gameState.toggleCharacterSelect()}>閉じる</button>
      </div>
    </div>
  {/if}

  <!-- スキルツリーパネル -->
  {#if $gameState.showSkillTree}
    <div class="modal-overlay" on:click={() => gameState.toggleSkillTree()}>
      <div class="modal skill-modal" on:click|stopPropagation>
        <h2>{charIcons[currentChar]} {charData.name} のスキル</h2>
        <div class="skill-list">
          {#each currentSkillTree.skills as skill}
            {@const isUnlocked = charData.unlockedSkills.includes(skill.id)}
            {@const canUnlock = canUnlockSkill(skill, charData.unlockedSkills, souls)}
            <div class="skill-item" class:unlocked={isUnlocked} class:available={canUnlock && !isUnlocked}>
              <div class="skill-info">
                <div class="skill-name">{skill.name}</div>
                <div class="skill-desc">{skill.description}</div>
                {#if skill.requires}
                  <div class="skill-req">必要: {skill.requires.map(r => currentSkillTree.skills.find(s => s.id === r)?.name).join(', ')}</div>
                {/if}
              </div>
              <div class="skill-action">
                {#if isUnlocked}
                  <span class="unlocked-badge">習得済</span>
                {:else}
                  <button 
                    class="unlock-skill-btn"
                    disabled={!canUnlock}
                    on:click={() => unlockSkill(skill.id, skill.cost)}
                  >
                    {skill.cost}👻
                  </button>
                {/if}
              </div>
            </div>
          {/each}
        </div>
        <button class="close-btn" on:click={() => gameState.toggleSkillTree()}>閉じる</button>
      </div>
    </div>
  {/if}
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

  .character-info {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.7);
    padding: 8px 15px;
    border-left: 3px solid #ff0040;
  }

  .char-icon {
    font-size: 1.5rem;
  }

  .char-name {
    color: #fff;
    font-size: 1rem;
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

  .soul-icon { font-size: 1.5rem; }
  .soul-count {
    color: #8844ff;
    font-size: 1.2rem;
    font-weight: bold;
    text-shadow: 0 0 10px #8844ff;
  }

  .character-switch {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 10px;
  }

  .char-slot {
    width: 50px;
    height: 50px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid #444;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .char-slot.active {
    border-color: #ff0040;
    box-shadow: 0 0 10px #ff0040;
  }

  .char-slot.locked {
    opacity: 0.5;
  }

  .slot-icon { font-size: 1.2rem; }
  .slot-key {
    font-size: 0.7rem;
    color: #888;
  }

  .lock {
    position: absolute;
    top: -5px;
    right: -5px;
    font-size: 0.8rem;
  }

  .controls-hint {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.7);
    padding: 15px;
    border: 1px solid #444;
    pointer-events: auto;
  }

  .hint-row {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 5px;
  }
  .hint-row:last-child { margin-bottom: 0; }

  .key {
    background: #333;
    color: #fff;
    padding: 3px 8px;
    font-size: 0.7rem;
    border: 1px solid #666;
    min-width: 50px;
    text-align: center;
  }

  .action {
    color: #888;
    font-size: 0.8rem;
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

  /* モーダル */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    z-index: 1000;
  }

  .modal {
    background: #1a1a2e;
    border: 2px solid #ff0040;
    padding: 30px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .skill-modal {
    max-width: 600px;
  }

  .modal h2 {
    color: #ff0040;
    margin-bottom: 20px;
    text-align: center;
  }

  .character-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-bottom: 20px;
  }

  .character-card {
    background: #0f3460;
    padding: 20px;
    text-align: center;
    border: 2px solid #333;
  }

  .character-card.unlocked {
    border-color: #ff0040;
  }

  .card-icon { font-size: 2rem; margin-bottom: 10px; }
  .card-name { color: #fff; margin-bottom: 10px; }

  .select-btn, .unlock-btn, .close-btn {
    font-family: 'Noto Serif JP', serif;
    padding: 8px 20px;
    border: none;
    cursor: pointer;
    transition: all 0.2s;
  }

  .select-btn {
    background: #333;
    color: #fff;
  }

  .select-btn.active {
    background: #ff0040;
  }

  .unlock-btn {
    background: #8844ff;
    color: #fff;
  }

  .unlock-btn:disabled {
    background: #333;
    cursor: not-allowed;
  }

  .close-btn {
    display: block;
    width: 100%;
    background: #333;
    color: #fff;
    margin-top: 20px;
  }

  .close-btn:hover {
    background: #ff0040;
  }

  /* スキルリスト */
  .skill-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .skill-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #0f3460;
    padding: 15px;
    border: 2px solid #333;
  }

  .skill-item.unlocked {
    border-color: #44ff88;
  }

  .skill-item.available {
    border-color: #8844ff;
  }

  .skill-name {
    color: #fff;
    font-size: 1rem;
    font-weight: bold;
  }

  .skill-desc {
    color: #888;
    font-size: 0.8rem;
    margin-top: 5px;
  }

  .skill-req {
    color: #ff8844;
    font-size: 0.7rem;
    margin-top: 5px;
  }

  .unlocked-badge {
    color: #44ff88;
    font-size: 0.9rem;
  }

  .unlock-skill-btn {
    font-family: 'Noto Serif JP', serif;
    background: #8844ff;
    color: #fff;
    border: none;
    padding: 8px 15px;
    cursor: pointer;
  }

  .unlock-skill-btn:disabled {
    background: #333;
    cursor: not-allowed;
  }
</style>
