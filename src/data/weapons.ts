export interface Weapon {
  id: string;
  name: string;
  category: 'assault' | 'sniper' | 'shotgun' | 'smg' | 'heavy';
  icon: string;
  damage: number;
  fireRate: number; // seconds between shots
  range: number;
  magazineSize: number;
  pellets?: number; // for shotguns
  spread?: number;
  recoil: number;
  color: string;
  description: string;
  scope?: boolean;
}

export interface TacticalUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'damage' | 'ammo' | 'shield' | 'speed';
  value: number;
}

export const WEAPONS: Record<string, Weapon> = {
  assault: {
    id: 'assault',
    name: 'AK47 التنين الناري (Dragon AK)',
    category: 'assault',
    icon: '🔫',
    damage: 38,
    fireRate: 0.13,
    range: 110,
    magazineSize: 30,
    recoil: 0.05,
    color: '#f59e0b',
    description: 'سلاح فري فاير الهجومي الأكثر شهرة بضرر خارق ومسافة اشتباك واسعة.'
  },
  mp40: {
    id: 'mp40',
    name: 'رشاش MP40 الأسطوري',
    category: 'smg',
    icon: '⚡',
    damage: 26,
    fireRate: 0.08,
    range: 75,
    magazineSize: 32,
    recoil: 0.04,
    color: '#eab308',
    description: 'أسرع معدل إطلاق نار في فري فاير للمعارك القريبة والصاعقة.'
  },
  sniper: {
    id: 'sniper',
    name: 'قناص AWM الأسطوري (One Shot)',
    category: 'sniper',
    icon: '🎯',
    damage: 150,
    fireRate: 1.1,
    range: 220,
    magazineSize: 5,
    recoil: 0.2,
    color: '#38bdf8',
    description: 'قناص فري فاير الفتاك مع منظار 4x/8x لإصابات الرأس بضربة واحدة.',
    scope: true
  },
  shotgun: {
    id: 'shotgun',
    name: 'شوزن M1887 المزدوج',
    category: 'shotgun',
    icon: '💥',
    damage: 32, // 32 x 6 = 192 max point-blank damage
    fireRate: 0.65,
    range: 40,
    magazineSize: 6,
    pellets: 6,
    spread: 0.14,
    recoil: 0.18,
    color: '#ef4444',
    description: 'الشوزن الكلاسيكي الفتاك في فري فاير للقضاء الفوري على الخصوم.'
  },
  scar: {
    id: 'scar',
    name: 'بندقية SCAR التكتيكية',
    category: 'assault',
    icon: '🎖️',
    damage: 32,
    fireRate: 0.11,
    range: 95,
    magazineSize: 30,
    recoil: 0.03,
    color: '#10b981',
    description: 'بندقية متزنة للغاية مع ارتداد منخفض ودقة فائقة للمسافات المتوسطة.'
  }
};

export const UPGRADES: TacticalUpgrade[] = [
  {
    id: 'incendiary_ammo',
    name: 'ذخيرة نارية خارقة (Fire Bullets)',
    description: '+40% ضرر ناري إضافي على جميع أسلحة فري فاير',
    icon: '🔥',
    type: 'damage',
    value: 1.4
  },
  {
    id: 'extended_drum',
    name: 'مخزن ذخيرة مزدوج (Level 3 Mag)',
    description: '+100% زيادة سعة مخزن الرصاص لجميع البنادق',
    icon: '🔋',
    type: 'ammo',
    value: 2.0
  },
  {
    id: 'vest_lvl3',
    name: 'درع واقي ليفل 3 (Kevlar Vest Lv3)',
    description: '+80 نقطة حماية إضافية وامتصاص 65% من الضرر',
    icon: '🛡️',
    type: 'shield',
    value: 80
  },
  {
    id: 'adrenaline_boost',
    name: 'حقنة الأدرينالين (Inhaler Ep Boost)',
    description: '+30% سرعة ركض إضافية وشحن فوري لطاقة EP',
    icon: '⚡',
    type: 'speed',
    value: 1.3
  }
];
