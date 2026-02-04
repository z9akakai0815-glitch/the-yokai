<script lang="ts">
  import { gameState, CHARACTER_UNLOCK_COSTS, type CharacterType, type SkillSlot } from '$lib/game/gameState';
  import { skillSets, type Skill } from '$lib/game/skillTrees';

  $: hp = $gameState.playerHp;
  $: maxHp = $gameState.playerMaxHp;
  $: souls = $gameState.souls;
  $: enemiesDefeated = $gameState.enemiesDefeated;
  $: currentChar = $gameState.currentCharacter;
  $: charData = $gameState.characters[currentChar];
  $: currentSkillSet = skillSets[currentChar];
  $: cooldowns = $gameState.skillCooldowns;
  $: ultimateCharge = $gameState.ultimateCharge;
  $: activeSkill = $gameState.activeSkill;

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

  function getCooldownPercent(slot: SkillSlot): number {
    const cd = cooldowns[slot];
    if (cd.total === 0) return 0;
    return (cd.remaining / cd.total) * 100;
  }

  function isSkillReady(slot: SkillSlot): boolean {
    if (slot === 'R') return ultimateCharge >= 100;
    return cooldowns[slot].remaining <= 0;
  }
</script>

<div class="game-ui">
  <!-- プレイヤーステータス（左上） -->
  <div class="player-status">
    <div class="character-info">
      <span class="char-icon">{charIcons[currentChar]}</span>
      <span class="char-name">{charData.name}</span>
    </div>
    
    <div class="hp-container">
      <div class="hp-bar">
        <div class="hp-fill" style="width: {(hp / maxHp) * 100}%"></div>
        <div class="hp-text">{hp}/{maxHp}</div>
      </div>
    </div>
    
    <div class="souls-container">
      <span class="soul-icon">👻</span>
      <span class="soul-count">{souls}</span>
    </div>
  </div>

  <!-- スコア（右上） -->
  <div class="score">
    <div>討伐数: {enemiesDefeated}</div>
  </div>

  <!-- スキルバー（下部中央）- Valorant風 -->
  <div class="skill-bar">
    <!-- Qスキル -->
    <div class="skill-slot" class:ready={isSkillReady('Q')} class:active={activeSkill?.id.endsWith('_q')}>
      <div class="skill-key">Q</div>
      <div class="skill-icon-wrapper">
        <div class="skill-icon" style="background-color: {currentSkillSet.skills.Q.color}">
          {currentSkillSet.skills.Q.icon}
        </div>
        {#if cooldowns.Q.remaining > 0}
          <div class="cooldown-overlay" style="height: {getCooldownPercent('Q')}%"></div>
          <div class="cooldown-text">{Math.ceil(cooldowns.Q.remaining)}</div>
        {/if}
      </div>
      <div class="skill-name">{currentSkillSet.skills.Q.name}</div>
    </div>

    <!-- Eスキル -->
    <div class="skill-slot" class:ready={isSkillReady('E')} class:active={activeSkill?.id.endsWith('_e')}>
      <div class="skill-key">E</div>
      <div class="skill-icon-wrapper">
        <div class="skill-icon" style="background-color: {currentSkillSet.skills.E.color}">
          {currentSkillSet.skills.E.icon}
        </div>
        {#if cooldowns.E.remaining > 0}
          <div class="cooldown-overlay" style="height: {getCooldownPercent('E')}%"></div>
          <div class="cooldown-text">{Math.ceil(cooldowns.E.remaining)}</div>
        {/if}
      </div>
      <div class="skill-name">{currentSkillSet.skills.E.name}</div>
    </div>

    <!-- セパレーター -->
    <div class="skill-separator"></div>

    <!-- Rスキル（Ultimate） -->
    <div class="skill-slot ultimate" class:ready={isSkillReady('R')} class:active={activeSkill?.id.endsWith('_r')}>
      <div class="skill-key">R</div>
      <div class="skill-icon-wrapper">
        <div class="skill-icon ult-icon" style="background-color: {ultimateCharge >= 100 ? '#ffcc00' : '#333'}">
          {currentSkillSet.skills.R.icon}
        </div>
        {#if ultimateCharge < 100}
          <div class="ult-charge-overlay" style="height: {100 - ultimateCharge}%"></div>
          <div class="ult-charge-text">{Math.floor(ultimateCharge)}%</div>
        {/if}
      </div>
      <div class="skill-name">{currentSkillSet.skills.R.name}</div>
    </div>
  </div>

  <!-- アクティブスキル表示 -->
  {#if activeSkill}
    <div class="active-skill-indicator">
      {skillSets[currentChar].skills[activeSkill.name as SkillSlot]?.icon || '✨'}
      {skillSets[currentChar].skills[activeSkill.name as SkillSlot]?.name || activeSkill.name}
    </div>
  {/if}

  <!-- キャラ切り替えインジケーター（上部中央） -->
  <div class="character-switch">
    {#each Object.entries($gameState.characters) as [type, data], i}
      <div 
        class="char-slot" 
        class:active={type === currentChar}
        class:locked={!data.unlocked}
      >
        <span class="slot-icon">{charIcons[type as CharacterType]}</span>
        <span class="slot-key">{i + 1}</span>
        {#if !data.unlocked}
          <span class="lock">🔒</span>
        {/if}
      </div>
    {/each}
  </div>

  <!-- 操作説明（左下） -->
  <div class="controls-hint">
    <div class="hint-row"><span class="key">WASD</span><span class="action">移動</span></div>
    <div class="hint-row"><span class="key">左クリック</span><span class="action">攻撃</span></div>
    <div class="hint-row"><span class="key">Q/E/R</span><span class="action">スキル</span></div>
    <div class="hint-row"><span class="key">K</span><span class="action">スキル詳細</span></div>
    <div class="hint-row"><span class="key">C</span><span class="action">キャラ選択</span></div>
  </div>

  <!-- キャラクター選択パネル -->
  {#if $gameState.showCharacterSelect}
    <div class="modal-overlay" role="dialog" on:click={() => gameState.toggleCharacterSelect()} on:keydown={(e) => e.key === 'Escape' && gameState.toggleCharacterSelect()}>
      <div class="modal" on:click|stopPropagation role="document">
        <h2>キャラクター選択</h2>
        <div class="character-grid">
          {#each Object.entries($gameState.characters) as [type, data]}
            {@const cost = CHARACTER_UNLOCK_COSTS[type as CharacterType]}
            {@const skills = skillSets[type as CharacterType].skills}
            <div class="character-card" class:unlocked={data.unlocked}>
              <div class="card-icon">{charIcons[type as CharacterType]}</div>
              <div class="card-name">{data.name}</div>
              <div class="card-skills">
                <span>{skills.Q.icon}</span>
                <span>{skills.E.icon}</span>
                <span>{skills.R.icon}</span>
              </div>
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

  <!-- スキル詳細パネル -->
  {#if $gameState.showSkillTree}
    <div class="modal-overlay" role="dialog" on:click={() => gameState.toggleSkillTree()} on:keydown={(e) => e.key === 'Escape' && gameState.toggleSkillTree()}>
      <div class="modal skill-modal" on:click|stopPropagation role="document">
        <h2>{charIcons[currentChar]} {charData.name} のスキル</h2>
        <div class="skill-detail-list">
          {#each ['Q', 'E', 'R'] as slot}
            {@const skill = currentSkillSet.skills[slot as SkillSlot]}
            <div class="skill-detail-item">
              <div class="skill-detail-key">{slot}</div>
              <div class="skill-detail-icon" style="background-color: {skill.color}">
                {skill.icon}
              </div>
              <div class="skill-detail-info">
                <div class="skill-detail-name">{skill.name}</div>
                <div class="skill-detail-desc">{skill.description}</div>
                <div class="skill-detail-cd">
                  {#if slot === 'R'}
                    チャージ制（敵撃破で溜まる）
                  {:else}
                    クールダウン: {skill.cooldown}秒
                  {/if}
                </div>
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

  /* プレイヤーステータス */
  .player-status {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .character-info {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(0, 0, 0, 0.7);
    padding: 8px 15px;
    border-left: 3px solid #ff0040;
  }

  .char-icon { font-size: 1.5rem; }
  .char-name { color: #fff; font-size: 1rem; }

  .hp-container { display: flex; align-items: center; }

  .hp-bar {
    width: 200px;
    height: 24px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid #ff0040;
    position: relative;
  }

  .hp-fill {
    height: 100%;
    background: linear-gradient(90deg, #ff0040, #ff4060);
    transition: width 0.3s;
  }

  .hp-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 0.85rem;
    font-weight: bold;
    text-shadow: 1px 1px 2px #000;
  }

  .souls-container {
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.5);
    padding: 5px 15px;
  }

  .soul-icon { font-size: 1.3rem; }
  .soul-count { color: #8844ff; font-size: 1.1rem; font-weight: bold; }

  /* スコア */
  .score {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.7);
    padding: 10px 20px;
    border: 1px solid #ff0040;
    color: #fff;
  }

  /* スキルバー - Valorant風 */
  .skill-bar {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: rgba(0, 0, 0, 0.8);
    padding: 12px 20px;
    border-radius: 8px;
    border: 1px solid #444;
  }

  .skill-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    opacity: 0.5;
    transition: all 0.2s;
  }

  .skill-slot.ready {
    opacity: 1;
  }

  .skill-slot.active {
    transform: scale(1.1);
  }

  .skill-key {
    color: #888;
    font-size: 0.75rem;
    font-weight: bold;
  }

  .skill-slot.ready .skill-key {
    color: #fff;
  }

  .skill-icon-wrapper {
    position: relative;
    width: 50px;
    height: 50px;
  }

  .skill-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    border-radius: 8px;
    border: 2px solid #555;
  }

  .skill-slot.ready .skill-icon {
    border-color: #fff;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }

  .skill-slot.active .skill-icon {
    border-color: #ffcc00;
    box-shadow: 0 0 20px #ffcc00;
  }

  .cooldown-overlay, .ult-charge-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 0 0 6px 6px;
    transition: height 0.1s;
  }

  .cooldown-text, .ult-charge-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 1rem;
    font-weight: bold;
    text-shadow: 0 0 5px #000;
  }

  .skill-name {
    color: #888;
    font-size: 0.65rem;
    text-align: center;
    max-width: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .skill-slot.ready .skill-name {
    color: #ccc;
  }

  .skill-separator {
    width: 2px;
    height: 40px;
    background: #444;
    margin: 0 8px;
  }

  .skill-slot.ultimate .skill-icon {
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
  }

  .skill-slot.ultimate .skill-icon-wrapper {
    width: 60px;
    height: 60px;
  }

  .skill-slot.ultimate.ready .skill-icon {
    border-color: #ffcc00;
    box-shadow: 0 0 15px #ffcc00;
    animation: ult-pulse 1s infinite;
  }

  @keyframes ult-pulse {
    0%, 100% { box-shadow: 0 0 15px #ffcc00; }
    50% { box-shadow: 0 0 25px #ffcc00; }
  }

  /* アクティブスキル表示 */
  .active-skill-indicator {
    position: absolute;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 204, 0, 0.9);
    color: #000;
    padding: 8px 20px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1rem;
    animation: skill-active 0.3s ease-out;
  }

  @keyframes skill-active {
    from { transform: translateX(-50%) scale(1.5); opacity: 0; }
    to { transform: translateX(-50%) scale(1); opacity: 1; }
  }

  /* キャラ切り替え */
  .character-switch {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
  }

  .char-slot {
    width: 45px;
    height: 45px;
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

  .char-slot.locked { opacity: 0.5; }
  .slot-icon { font-size: 1.1rem; }
  .slot-key { font-size: 0.6rem; color: #888; }
  .lock { position: absolute; top: -5px; right: -5px; font-size: 0.7rem; }

  /* 操作説明 */
  .controls-hint {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.6);
    padding: 10px;
    font-size: 0.75rem;
  }

  .hint-row {
    display: flex;
    gap: 10px;
    margin-bottom: 4px;
  }

  .key {
    background: #333;
    color: #fff;
    padding: 2px 6px;
    font-size: 0.65rem;
    min-width: 45px;
    text-align: center;
  }

  .action { color: #888; }

  /* モーダル */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    z-index: 1000;
  }

  .modal {
    background: #1a1a2e;
    border: 2px solid #ff0040;
    padding: 25px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
  }

  .skill-modal { max-width: 550px; }

  .modal h2 {
    color: #ff0040;
    margin-bottom: 20px;
    text-align: center;
  }

  .character-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    margin-bottom: 15px;
  }

  .character-card {
    background: #0f3460;
    padding: 15px;
    text-align: center;
    border: 2px solid #333;
  }

  .character-card.unlocked { border-color: #ff0040; }
  .card-icon { font-size: 1.8rem; margin-bottom: 8px; }
  .card-name { color: #fff; margin-bottom: 8px; font-size: 0.9rem; }
  .card-skills { font-size: 1.2rem; margin-bottom: 10px; display: flex; justify-content: center; gap: 8px; }

  .select-btn, .unlock-btn, .close-btn {
    font-family: 'Noto Serif JP', serif;
    padding: 8px 16px;
    border: none;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .select-btn { background: #333; color: #fff; }
  .select-btn.active { background: #ff0040; }
  .unlock-btn { background: #8844ff; color: #fff; }
  .unlock-btn:disabled { background: #333; cursor: not-allowed; }
  .close-btn { display: block; width: 100%; background: #333; color: #fff; margin-top: 15px; }
  .close-btn:hover { background: #ff0040; }

  /* スキル詳細 */
  .skill-detail-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .skill-detail-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #0f3460;
    padding: 12px;
    border-radius: 8px;
  }

  .skill-detail-key {
    background: #333;
    color: #fff;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    border-radius: 4px;
  }

  .skill-detail-icon {
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    border-radius: 8px;
  }

  .skill-detail-info { flex: 1; }
  .skill-detail-name { color: #fff; font-weight: bold; margin-bottom: 4px; }
  .skill-detail-desc { color: #aaa; font-size: 0.8rem; margin-bottom: 4px; }
  .skill-detail-cd { color: #888; font-size: 0.75rem; }
</style>
