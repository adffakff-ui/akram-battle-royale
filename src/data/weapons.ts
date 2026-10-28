export interface Weapon {
  id: string;
  name: string;
  category: 'assault' | 'sniper' | 'shotgun' | 'heavy';
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
    name: 'كلاشينكوف اليماني (AK-47)',
    category: 'assault',
    icon: '🔫',
    damage: 28,
    fireRate: 0.14,
    range: 90,
    magazineSize: 30,
    recoil: 0.05,
    color: '#f59e0b',
    description: 'سلاح هجومي قياسي سريع ومتوازن لجميع مسافات الاشتباك.'
  },
  sniper: {
    id: 'sniper',
    name: 'قناص شبام الصحراوي',
    category: 'sniper',
    icon: '🎯',
    damage: 95,
    fireRate: 1.2,
    range: 180,
    magazineSize: 5,
    recoil: 0.2,
    color: '#38bdf8',
    description: 'قناص ذو دقة متناهية وإصابات قاتلة من أطول المسافات.'
  },
  shotgun: {
    id: 'shotgun',
    name: 'شوزن جبال صعدة',
    category: 'shotgun',
    icon: '💥',
    damage: 18, // 18 x 6 pellets = 108 max close-range damage
    fireRate: 0.75,
    range: 35,
    magazineSize: 8,
    pellets: 6,
    spread: 0.12,
    recoil: 0.15,
    color: '#ef4444',
    description: 'بندقية صيد متشعبة تطلق 6 طلقات دفعة واحدة لقوة تدميرية قريبة.'
  },
  heavy: {
    id: 'heavy',
    name: 'قاذف مأرب التكتيكي',
    category: 'heavy',
    icon: '🚀',
    damage: 120,
    fireRate: 1.8,
    range: 120,
    magazineSize: 3,
    recoil: 0.25,
    color: '#ec4899',
    description: 'قاذف صواريخ تكتيكي يسبب ضرراً هائلاً وانفجارات رادعة.'
  }
};

export const UPGRADES: TacticalUpgrade[] = [
  {
    id: 'incendiary_ammo',
    name: 'ذخيرة نارية خارقة',
    description: '+40% ضرر إضافي على جميع الأسلحة',
    icon: '🔥',
    type: 'damage',
    value: 1.4
  },
  {
    id: 'extended_drum',
    name: 'خزنة ذخيرة مضاعفة',
    description: '+100% زيادة سعة مخزن الرصاص',
    icon: '🔋',
    type: 'ammo',
    value: 2.0
  },
  {
    id: 'titanium_vest',
    name: 'درع تيتانيوم سبئي',
    description: '+50 نقطة حماية إضافية ضد الرصاص',
    icon: '🛡️',
    type: 'shield',
    value: 50
  },
  {
    id: 'adrenaline_boost',
    name: 'حقنة الأدرينالين الجبلية',
    description: '+30% سرعة ركض إضافية',
    icon: '⚡',
    type: 'speed',
    value: 1.3
  }
];
