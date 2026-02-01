import { writable } from 'svelte/store';

export interface GameState {
  // プレイヤー
  playerHp: number;
  playerMaxHp: number;
  playerPosition: { x: number; y: number; z: number };
  playerRotation: number;
  isAttacking: boolean;
  
  // 進行
  souls: number;
  enemiesDefeated: number;
  currentStage: string;
  
  // スキルツリー
  unlockedSkills: string[];
  
  // キャラクター
  currentCharacter: 'sword' | 'gun' | 'magic' | 'fist';
  characters: {
    sword: CharacterData;
    gun: CharacterData;
    magic: CharacterData;
    fist: CharacterData;
  };
}

export interface CharacterData {
  name: string;
  unlocked: boolean;
  level: number;
  skills: string[];
}

const initialState: GameState = {
  playerHp: 100,
  playerMaxHp: 100,
  playerPosition: { x: 0, y: 0, z: 0 },
  playerRotation: 0,
  isAttacking: false,
  
  souls: 0,
  enemiesDefeated: 0,
  currentStage: 'shibuya',
  
  unlockedSkills: [],
  
  currentCharacter: 'sword',
  characters: {
    sword: {
      name: '刀使い',
      unlocked: true,
      level: 1,
      skills: ['斬撃', '居合'],
    },
    gun: {
      name: '銃使い',
      unlocked: false,
      level: 1,
      skills: ['霊弾', '連射'],
    },
    magic: {
      name: '術師',
      unlocked: false,
      level: 1,
      skills: ['火炎術', '結界'],
    },
    fist: {
      name: '格闘家',
      unlocked: false,
      level: 1,
      skills: ['連撃', '気功'],
    },
  },
};

export const gameState = writable<GameState>(initialState);

// ヘルパー関数
export function takeDamage(amount: number) {
  gameState.update(state => ({
    ...state,
    playerHp: Math.max(0, state.playerHp - amount),
  }));
}

export function heal(amount: number) {
  gameState.update(state => ({
    ...state,
    playerHp: Math.min(state.playerMaxHp, state.playerHp + amount),
  }));
}

export function addSouls(amount: number) {
  gameState.update(state => ({
    ...state,
    souls: state.souls + amount,
  }));
}

export function unlockSkill(skillName: string, cost: number) {
  gameState.update(state => {
    if (state.souls >= cost && !state.unlockedSkills.includes(skillName)) {
      return {
        ...state,
        souls: state.souls - cost,
        unlockedSkills: [...state.unlockedSkills, skillName],
      };
    }
    return state;
  });
}

export function switchCharacter(character: 'sword' | 'gun' | 'magic' | 'fist') {
  gameState.update(state => {
    if (state.characters[character].unlocked) {
      return { ...state, currentCharacter: character };
    }
    return state;
  });
}
