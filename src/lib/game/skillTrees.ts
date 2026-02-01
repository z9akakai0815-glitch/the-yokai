import type { CharacterType, SkillSlot } from './gameState';

export interface Skill {
  id: string;
  slot: SkillSlot;
  name: string;
  description: string;
  cooldown: number;  // 秒
  icon: string;
  color: string;
}

export interface SkillSet {
  character: CharacterType;
  characterName: string;
  skills: Record<SkillSlot, Skill>;
}

// キャラクター別スキル定義
export const skillSets: Record<CharacterType, SkillSet> = {
  sword: {
    character: 'sword',
    characterName: '刀使い・零',
    skills: {
      Q: {
        id: 'sword_q',
        slot: 'Q',
        name: '居合斬り',
        description: '高速で前方に突進し、敵を斬りつける',
        cooldown: 8,
        icon: '⚔️',
        color: '#4488ff',
      },
      E: {
        id: 'sword_e',
        slot: 'E',
        name: '剣気',
        description: '周囲に剣気を放ち、近くの敵にダメージ',
        cooldown: 12,
        icon: '🌀',
        color: '#4488ff',
      },
      R: {
        id: 'sword_r',
        slot: 'R',
        name: '一閃',
        description: '必殺の一撃。前方広範囲に大ダメージ',
        cooldown: 0,  // チャージ制
        icon: '⚡',
        color: '#ffcc00',
      },
    },
  },
  
  gun: {
    character: 'gun',
    characterName: '銃使い・凛',
    skills: {
      Q: {
        id: 'gun_q',
        slot: 'Q',
        name: '連射',
        description: '高速で3連射する',
        cooldown: 6,
        icon: '🔫',
        color: '#ff8844',
      },
      E: {
        id: 'gun_e',
        slot: 'E',
        name: '閃光弾',
        description: '敵の動きを一時的に止める',
        cooldown: 15,
        icon: '💥',
        color: '#ff8844',
      },
      R: {
        id: 'gun_r',
        slot: 'R',
        name: '必中',
        description: '照準を合わせ、確実に急所を撃ち抜く',
        cooldown: 0,
        icon: '🎯',
        color: '#ffcc00',
      },
    },
  },
  
  magic: {
    character: 'magic',
    characterName: '術師・紫',
    skills: {
      Q: {
        id: 'magic_q',
        slot: 'Q',
        name: '火球',
        description: '炎の球を放ち、着弾点で爆発',
        cooldown: 7,
        icon: '🔥',
        color: '#aa44ff',
      },
      E: {
        id: 'magic_e',
        slot: 'E',
        name: '結界',
        description: '一定時間、ダメージを軽減する',
        cooldown: 20,
        icon: '🛡️',
        color: '#aa44ff',
      },
      R: {
        id: 'magic_r',
        slot: 'R',
        name: '隕石',
        description: '空から巨大な隕石を降らせる',
        cooldown: 0,
        icon: '☄️',
        color: '#ffcc00',
      },
    },
  },
  
  fist: {
    character: 'fist',
    characterName: '格闘家・剛',
    skills: {
      Q: {
        id: 'fist_q',
        slot: 'Q',
        name: '瞬歩',
        description: '瞬間移動で敵の背後に回る',
        cooldown: 5,
        icon: '💨',
        color: '#44ff88',
      },
      E: {
        id: 'fist_e',
        slot: 'E',
        name: '練気',
        description: '次の攻撃のダメージが2倍になる',
        cooldown: 10,
        icon: '💪',
        color: '#44ff88',
      },
      R: {
        id: 'fist_r',
        slot: 'R',
        name: '百裂拳',
        description: '超高速の連続パンチを叩き込む',
        cooldown: 0,
        icon: '👊',
        color: '#ffcc00',
      },
    },
  },
};

// スキルIDからスキル情報を取得
export function getSkillById(id: string): Skill | null {
  for (const set of Object.values(skillSets)) {
    for (const skill of Object.values(set.skills)) {
      if (skill.id === id) return skill;
    }
  }
  return null;
}
