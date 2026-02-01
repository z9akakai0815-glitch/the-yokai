import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export type CharacterType = 'sword' | 'gun' | 'magic' | 'fist';

export interface CharacterData {
  name: string;
  unlocked: boolean;
  level: number;
  unlockedSkills: string[];
  color: string;
}

export interface GameState {
  // プレイヤー
  playerHp: number;
  playerMaxHp: number;
  playerPosition: { x: number; y: number; z: number };
  playerRotation: number;
  isAttacking: boolean;
  
  // 進行
  souls: number;
  totalSouls: number;  // 累計獲得魂
  enemiesDefeated: number;
  currentStage: string;
  
  // キャラクター
  currentCharacter: CharacterType;
  characters: Record<CharacterType, CharacterData>;
  
  // UI状態
  showSkillTree: boolean;
  showCharacterSelect: boolean;
}

const initialState: GameState = {
  playerHp: 100,
  playerMaxHp: 100,
  playerPosition: { x: 0, y: 0, z: 0 },
  playerRotation: 0,
  isAttacking: false,
  
  souls: 0,
  totalSouls: 0,
  enemiesDefeated: 0,
  currentStage: 'shibuya',
  
  currentCharacter: 'sword',
  characters: {
    sword: {
      name: '刀使い・零',
      unlocked: true,
      level: 1,
      unlockedSkills: [],
      color: '#4488ff',
    },
    gun: {
      name: '銃使い・凛',
      unlocked: false,
      level: 1,
      unlockedSkills: [],
      color: '#ff8844',
    },
    magic: {
      name: '術師・紫',
      unlocked: false,
      level: 1,
      unlockedSkills: [],
      color: '#aa44ff',
    },
    fist: {
      name: '格闘家・剛',
      unlocked: false,
      level: 1,
      unlockedSkills: [],
      color: '#44ff88',
    },
  },
  
  showSkillTree: false,
  showCharacterSelect: false,
};

// ローカルストレージのキー
const SAVE_KEY = 'the-yokai-save';

// セーブデータを読み込む
function loadSaveData(): Partial<GameState> | null {
  if (!browser) return null;
  
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load save data:', e);
  }
  return null;
}

// セーブデータを保存
function saveGameData(state: GameState) {
  if (!browser) return;
  
  try {
    // 保存するデータを選別（位置などは保存しない）
    const saveData = {
      souls: state.souls,
      totalSouls: state.totalSouls,
      enemiesDefeated: state.enemiesDefeated,
      currentStage: state.currentStage,
      currentCharacter: state.currentCharacter,
      characters: state.characters,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.error('Failed to save game data:', e);
  }
}

// 初期状態にセーブデータをマージ
function getInitialState(): GameState {
  const saved = loadSaveData();
  if (saved) {
    return { ...initialState, ...saved };
  }
  return initialState;
}

// ストア作成
function createGameStore() {
  const { subscribe, set, update } = writable<GameState>(getInitialState());
  
  return {
    subscribe,
    set,
    update,
    
    // キャラクター切り替え
    switchCharacter: (type: CharacterType) => {
      update(state => {
        if (state.characters[type].unlocked) {
          const newState = { ...state, currentCharacter: type };
          saveGameData(newState);
          return newState;
        }
        return state;
      });
    },
    
    // キャラクターアンロック
    unlockCharacter: (type: CharacterType, cost: number) => {
      update(state => {
        if (state.souls >= cost && !state.characters[type].unlocked) {
          const newState = {
            ...state,
            souls: state.souls - cost,
            characters: {
              ...state.characters,
              [type]: { ...state.characters[type], unlocked: true },
            },
          };
          saveGameData(newState);
          return newState;
        }
        return state;
      });
    },
    
    // スキルアンロック
    unlockSkill: (skillId: string, cost: number) => {
      update(state => {
        const char = state.characters[state.currentCharacter];
        if (state.souls >= cost && !char.unlockedSkills.includes(skillId)) {
          const newState = {
            ...state,
            souls: state.souls - cost,
            characters: {
              ...state.characters,
              [state.currentCharacter]: {
                ...char,
                unlockedSkills: [...char.unlockedSkills, skillId],
              },
            },
          };
          saveGameData(newState);
          return newState;
        }
        return state;
      });
    },
    
    // 魂を追加
    addSouls: (amount: number) => {
      update(state => {
        const newState = {
          ...state,
          souls: state.souls + amount,
          totalSouls: state.totalSouls + amount,
        };
        saveGameData(newState);
        return newState;
      });
    },
    
    // 敵撃破
    defeatEnemy: () => {
      update(state => {
        const newState = {
          ...state,
          enemiesDefeated: state.enemiesDefeated + 1,
        };
        saveGameData(newState);
        return newState;
      });
    },
    
    // ダメージを受ける
    takeDamage: (amount: number) => {
      update(state => ({
        ...state,
        playerHp: Math.max(0, state.playerHp - amount),
      }));
    },
    
    // 回復
    heal: (amount: number) => {
      update(state => ({
        ...state,
        playerHp: Math.min(state.playerMaxHp, state.playerHp + amount),
      }));
    },
    
    // スキルツリー表示切り替え
    toggleSkillTree: () => {
      update(state => ({ ...state, showSkillTree: !state.showSkillTree }));
    },
    
    // キャラ選択表示切り替え
    toggleCharacterSelect: () => {
      update(state => ({ ...state, showCharacterSelect: !state.showCharacterSelect }));
    },
    
    // HPリセット
    resetHp: () => {
      update(state => ({ ...state, playerHp: state.playerMaxHp }));
    },
    
    // 手動セーブ
    save: () => {
      const state = get(gameState);
      saveGameData(state);
    },
    
    // データリセット
    resetAll: () => {
      if (browser) {
        localStorage.removeItem(SAVE_KEY);
      }
      set(initialState);
    },
  };
}

export const gameState = createGameStore();

// キャラクターアンロックコスト
export const CHARACTER_UNLOCK_COSTS: Record<CharacterType, number> = {
  sword: 0,   // 最初から解放
  gun: 50,
  magic: 100,
  fist: 75,
};
