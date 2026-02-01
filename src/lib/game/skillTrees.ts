// キャラクター別スキルツリー

export interface Skill {
  id: string;
  name: string;
  description: string;
  cost: number;
  requires?: string[];  // 必要な前提スキル
  effect: {
    type: 'damage' | 'speed' | 'defense' | 'special';
    value: number;
  };
}

export interface SkillTree {
  characterType: string;
  skills: Skill[];
}

// 🗡️ 刀使いのスキルツリー
export const swordSkillTree: SkillTree = {
  characterType: 'sword',
  skills: [
    // Tier 1
    {
      id: 'sword_basic',
      name: '基本斬撃強化',
      description: '通常攻撃のダメージ+20%',
      cost: 10,
      effect: { type: 'damage', value: 1.2 }
    },
    {
      id: 'sword_speed',
      name: '抜刀術',
      description: '攻撃速度+15%',
      cost: 15,
      effect: { type: 'speed', value: 1.15 }
    },
    // Tier 2
    {
      id: 'sword_combo',
      name: '三連斬',
      description: '連続攻撃が可能に',
      cost: 25,
      requires: ['sword_basic'],
      effect: { type: 'special', value: 3 }
    },
    {
      id: 'sword_iai',
      name: '居合',
      description: '溜め攻撃で大ダメージ',
      cost: 30,
      requires: ['sword_speed'],
      effect: { type: 'damage', value: 2.0 }
    },
    // Tier 3
    {
      id: 'sword_ultimate',
      name: '奥義・月光',
      description: '範囲攻撃の必殺技',
      cost: 50,
      requires: ['sword_combo', 'sword_iai'],
      effect: { type: 'special', value: 100 }
    },
  ]
};

// 🔫 銃使いのスキルツリー
export const gunSkillTree: SkillTree = {
  characterType: 'gun',
  skills: [
    // Tier 1
    {
      id: 'gun_basic',
      name: '霊弾強化',
      description: '弾のダメージ+20%',
      cost: 10,
      effect: { type: 'damage', value: 1.2 }
    },
    {
      id: 'gun_reload',
      name: '高速リロード',
      description: 'リロード速度+30%',
      cost: 15,
      effect: { type: 'speed', value: 1.3 }
    },
    // Tier 2
    {
      id: 'gun_rapid',
      name: '連射',
      description: '連続射撃が可能に',
      cost: 25,
      requires: ['gun_basic'],
      effect: { type: 'special', value: 5 }
    },
    {
      id: 'gun_pierce',
      name: '貫通弾',
      description: '敵を貫通する弾',
      cost: 30,
      requires: ['gun_reload'],
      effect: { type: 'special', value: 1 }
    },
    // Tier 3
    {
      id: 'gun_ultimate',
      name: '奥義・破魔光線',
      description: '強力なビーム攻撃',
      cost: 50,
      requires: ['gun_rapid', 'gun_pierce'],
      effect: { type: 'special', value: 100 }
    },
  ]
};

// ✨ 術師のスキルツリー
export const magicSkillTree: SkillTree = {
  characterType: 'magic',
  skills: [
    // Tier 1
    {
      id: 'magic_basic',
      name: '霊力増幅',
      description: '術のダメージ+20%',
      cost: 10,
      effect: { type: 'damage', value: 1.2 }
    },
    {
      id: 'magic_range',
      name: '術式拡大',
      description: '攻撃範囲+30%',
      cost: 15,
      effect: { type: 'special', value: 1.3 }
    },
    // Tier 2
    {
      id: 'magic_fire',
      name: '火炎術',
      description: '炎の範囲攻撃',
      cost: 25,
      requires: ['magic_basic'],
      effect: { type: 'damage', value: 1.5 }
    },
    {
      id: 'magic_barrier',
      name: '結界術',
      description: 'ダメージを軽減する結界',
      cost: 30,
      requires: ['magic_range'],
      effect: { type: 'defense', value: 0.7 }
    },
    // Tier 3
    {
      id: 'magic_ultimate',
      name: '奥義・天誅',
      description: '天からの裁きを下す',
      cost: 50,
      requires: ['magic_fire', 'magic_barrier'],
      effect: { type: 'special', value: 100 }
    },
  ]
};

// 👊 格闘家のスキルツリー
export const fistSkillTree: SkillTree = {
  characterType: 'fist',
  skills: [
    // Tier 1
    {
      id: 'fist_basic',
      name: '拳圧強化',
      description: '打撃ダメージ+20%',
      cost: 10,
      effect: { type: 'damage', value: 1.2 }
    },
    {
      id: 'fist_speed',
      name: '疾風',
      description: '移動速度+20%',
      cost: 15,
      effect: { type: 'speed', value: 1.2 }
    },
    // Tier 2
    {
      id: 'fist_combo',
      name: '連撃',
      description: '5連続コンボが可能に',
      cost: 25,
      requires: ['fist_basic'],
      effect: { type: 'special', value: 5 }
    },
    {
      id: 'fist_counter',
      name: 'カウンター',
      description: '敵の攻撃を弾き返す',
      cost: 30,
      requires: ['fist_speed'],
      effect: { type: 'special', value: 1 }
    },
    // Tier 3
    {
      id: 'fist_ultimate',
      name: '奥義・羅刹拳',
      description: '怒涛の連撃を叩き込む',
      cost: 50,
      requires: ['fist_combo', 'fist_counter'],
      effect: { type: 'special', value: 100 }
    },
  ]
};

// スキルツリーをまとめて取得
export const skillTrees: Record<string, SkillTree> = {
  sword: swordSkillTree,
  gun: gunSkillTree,
  magic: magicSkillTree,
  fist: fistSkillTree,
};

// スキルがアンロック可能かチェック
export function canUnlockSkill(
  skill: Skill, 
  unlockedSkills: string[], 
  souls: number
): boolean {
  // コスト確認
  if (souls < skill.cost) return false;
  
  // 前提スキル確認
  if (skill.requires) {
    for (const req of skill.requires) {
      if (!unlockedSkills.includes(req)) return false;
    }
  }
  
  return true;
}
