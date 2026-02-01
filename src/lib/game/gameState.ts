import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';

export type CharacterType = 'sword' | 'gun' | 'magic' | 'fist';
export type SkillSlot = 'Q' | 'E' | 'R';

export interface CharacterData {
  name: string;
  unlocked: boolean;
  level: number;
  unlockedSkills: string[];
  color: string;
}

export interface SkillCooldown {
  remaining: number;  // 残りクールダウン（秒）
  total: number;      // 全体クールダウン（秒）
}

export interface ActiveSkill {
  id: string;
  name: string;
  duration: number;  // 残り持続時間
}

export interface GameState {
  // プレイヤー
  playerHp: number;
  playerMaxHp: number;
  playerPosition: { x: number; y: number; z: number };
  playerRotation: number;
  isAttacking: boolean;
  
  // スキル
  skillCooldowns: Record<SkillSlot, SkillCooldown>;
  activeSkill: ActiveSkill | null;
  ultimateCharge: number;  // 0-100
  
  // 進行
  souls: number;
  totalSouls: number;
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
  
  skillCooldowns: {
    Q: { remaining: 0, total: 8 },
    E: { remaining: 0, total: 12 },
    R: { remaining: 0, total: 0 },  // Ultはチャージ制
  },
  activeSkill: null,
  ultimateCharge: 0,
  
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
      unlockedSkills: ['sword_q', 'sword_e', 'sword_r'],  // 初期から全スキル使用可能
      color: '#4488ff',
    },
    gun: {
      name: '銃使い・凛',
      unlocked: false,
      level: 1,
      unlockedSkills: ['gun_q', 'gun_e', 'gun_r'],
      color: '#ff8844',
    },
    magic: {
      name: '術師・紫',
      unlocked: false,
      level: 1,
      unlockedSkills: ['magic_q', 'magic_e', 'magic_r'],
      color: '#aa44ff',
    },
    fist: {
      name: '格闘家・剛',
      unlocked: false,
      level: 1,
      unlockedSkills: ['fist_q', 'fist_e', 'fist_r'],
      color: '#44ff88',
    },
  },
  
  showSkillTree: false,
  showCharacterSelect: false,
};

const SAVE_KEY = 'the-yokai-save';

function loadSaveData(): Partial<GameState> | null {
  if (!browser) return null;
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load save data:', e);
  }
  return null;
}

function saveGameData(state: GameState) {
  if (!browser) return;
  try {
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

function getInitialState(): GameState {
  const saved = loadSaveData();
  if (saved) return { ...initialState, ...saved };
  return initialState;
}

function createGameStore() {
  const { subscribe, set, update } = writable<GameState>(getInitialState());
  
  return {
    subscribe,
    set,
    update,
    
    switchCharacter: (type: CharacterType) => {
      update(state => {
        if (state.characters[type].unlocked) {
          const newState = { 
            ...state, 
            currentCharacter: type,
            // キャラ変更時にクールダウンリセット
            skillCooldowns: {
              Q: { remaining: 0, total: 8 },
              E: { remaining: 0, total: 12 },
              R: { remaining: 0, total: 0 },
            },
          };
          saveGameData(newState);
          return newState;
        }
        return state;
      });
    },
    
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
    
    // スキル使用
    useSkill: (slot: SkillSlot) => {
      update(state => {
        const cooldown = state.skillCooldowns[slot];
        
        // Ultはチャージ制
        if (slot === 'R') {
          if (state.ultimateCharge >= 100) {
            return {
              ...state,
              ultimateCharge: 0,
              activeSkill: {
                id: `${state.currentCharacter}_r`,
                name: 'Ultimate',
                duration: 3,
              },
            };
          }
          return state;
        }
        
        // 通常スキル
        if (cooldown.remaining <= 0) {
          return {
            ...state,
            skillCooldowns: {
              ...state.skillCooldowns,
              [slot]: { ...cooldown, remaining: cooldown.total },
            },
            activeSkill: {
              id: `${state.currentCharacter}_${slot.toLowerCase()}`,
              name: slot,
              duration: slot === 'Q' ? 2 : 3,
            },
          };
        }
        return state;
      });
    },
    
    // クールダウン更新（毎フレーム呼ぶ）
    updateCooldowns: (deltaSeconds: number) => {
      update(state => {
        const newCooldowns = { ...state.skillCooldowns };
        let changed = false;
        
        for (const slot of ['Q', 'E', 'R'] as SkillSlot[]) {
          if (newCooldowns[slot].remaining > 0) {
            newCooldowns[slot] = {
              ...newCooldowns[slot],
              remaining: Math.max(0, newCooldowns[slot].remaining - deltaSeconds),
            };
            changed = true;
          }
        }
        
        // アクティブスキルの持続時間も更新
        let newActiveSkill = state.activeSkill;
        if (state.activeSkill) {
          const newDuration = state.activeSkill.duration - deltaSeconds;
          if (newDuration <= 0) {
            newActiveSkill = null;
          } else {
            newActiveSkill = { ...state.activeSkill, duration: newDuration };
          }
          changed = true;
        }
        
        if (changed) {
          return { ...state, skillCooldowns: newCooldowns, activeSkill: newActiveSkill };
        }
        return state;
      });
    },
    
    // Ultチャージ追加
    addUltCharge: (amount: number) => {
      update(state => ({
        ...state,
        ultimateCharge: Math.min(100, state.ultimateCharge + amount),
      }));
    },
    
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
    
    defeatEnemy: () => {
      update(state => {
        const newState = {
          ...state,
          enemiesDefeated: state.enemiesDefeated + 1,
          // 敵を倒すとUltチャージ
          ultimateCharge: Math.min(100, state.ultimateCharge + 15),
        };
        saveGameData(newState);
        return newState;
      });
    },
    
    takeDamage: (amount: number) => {
      update(state => ({
        ...state,
        playerHp: Math.max(0, state.playerHp - amount),
      }));
    },
    
    heal: (amount: number) => {
      update(state => ({
        ...state,
        playerHp: Math.min(state.playerMaxHp, state.playerHp + amount),
      }));
    },
    
    toggleSkillTree: () => {
      update(state => ({ ...state, showSkillTree: !state.showSkillTree }));
    },
    
    toggleCharacterSelect: () => {
      update(state => ({ ...state, showCharacterSelect: !state.showCharacterSelect }));
    },
    
    resetHp: () => {
      update(state => ({ ...state, playerHp: state.playerMaxHp }));
    },
    
    save: () => {
      const state = get(gameState);
      saveGameData(state);
    },
    
    resetAll: () => {
      if (browser) localStorage.removeItem(SAVE_KEY);
      set(initialState);
    },
  };
}

export const gameState = createGameStore();

export const CHARACTER_UNLOCK_COSTS: Record<CharacterType, number> = {
  sword: 0,
  gun: 50,
  magic: 100,
  fist: 75,
};
