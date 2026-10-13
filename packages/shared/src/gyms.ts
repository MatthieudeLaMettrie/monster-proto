export interface BadgeInfo {
  id: string;
  name: string;
  leader: string;
  title: string;
  icon: string;
  color: number;
  hexColor: string;
  description: string;
}

export const BADGES: Record<string, BadgeInfo> = {
  meadow: {
    id: 'meadow',
    name: 'Meadow Badge',
    leader: 'Camper Leo',
    title: 'Route 1 Meadow Leader',
    icon: '🌿',
    color: 0x22c55e,
    hexColor: '#22c55e',
    description: 'Proof of victory over Camper Leo at Route 1 Meadow.'
  },
  azure: {
    id: 'azure',
    name: 'Azure Badge',
    leader: 'Fisher Marina',
    title: 'Lake Azure Pier Leader',
    icon: '💧',
    color: 0x0ea5e9,
    hexColor: '#0ea5e9',
    description: 'Proof of victory over Fisher Marina at Lake Azure Pier.'
  },
  grove: {
    id: 'grove',
    name: 'Grove Badge',
    leader: 'Ranger Rowan',
    title: 'Old Grove Shrine Leader',
    icon: '🌲',
    color: 0x15803d,
    hexColor: '#15803d',
    description: 'Proof of victory over Ranger Rowan at Old Grove Shrine.'
  },
  magma: {
    id: 'magma',
    name: 'Magma Badge',
    leader: 'Pyromancer Flint',
    title: 'Ember Crags Leader',
    icon: '🔥',
    color: 0xef4444,
    hexColor: '#ef4444',
    description: 'Proof of victory over Pyromancer Flint at Ember Crags.'
  },
  crown: {
    id: 'crown',
    name: 'Crown Badge',
    leader: 'Grand Champion Aaron',
    title: 'Grand Pagoda Dojo Champion',
    icon: '👑',
    color: 0xf59e0b,
    hexColor: '#f59e0b',
    description: 'The supreme mark of mastery awarded by Grand Champion Aaron.'
  }
};

export interface GymLeaderDef {
  id: string;
  name: string;
  title: string;
  badgeId: string;
  badgeName: string;
  tile: { x: number; y: number };
  color: number;
  avatarIcon: string;
  introDialog: string;
  defeatDialog: string;
  alreadyBeatenDialog: string;
  team: {
    speciesId: number;
    nickname: string;
    level: number;
  }[];
}

export const GYM_LEADERS: GymLeaderDef[] = [
  {
    id: 'leader-leo',
    name: 'Camper Leo',
    title: 'Meadow Scout Leader',
    badgeId: 'meadow',
    badgeName: 'Meadow Badge',
    tile: { x: 30, y: 11 },
    color: 0x22c55e,
    avatarIcon: '🌿',
    introDialog: '"The fresh breeze across Route 1 keeps my monsters sharp! Show me your bond with your team!"',
    defeatDialog: '"Incredible poise! You understand the harmony of nature. Accept the Meadow Badge!"',
    alreadyBeatenDialog: '"Keep heading east, trainer! The road gets steeper from here on out."',
    team: [
      { speciesId: 19, nickname: 'Sproutle', level: 5 },
      { speciesId: 55, nickname: 'Jabbit', level: 6 }
    ]
  },
  {
    id: 'leader-marina',
    name: 'Fisher Marina',
    title: 'Azure Tides Leader',
    badgeId: 'azure',
    badgeName: 'Azure Badge',
    tile: { x: 14, y: 26 },
    color: 0x0ea5e9,
    avatarIcon: '💧',
    introDialog: '"Lake Azure\'s currents can capsize careless trainers. Let\'s see if you can weather my tidal waves!"',
    defeatDialog: '"What serene control! You parted my whirlpools like a master captain. Here is the Azure Badge!"',
    alreadyBeatenDialog: '"Sail onward, champion! Deep waters still hold untold mysteries."',
    team: [
      { speciesId: 10, nickname: 'Puddlefin', level: 9 },
      { speciesId: 16, nickname: 'Shellby', level: 10 }
    ]
  },
  {
    id: 'leader-rowan',
    name: 'Ranger Rowan',
    title: 'Grove Warden Leader',
    badgeId: 'grove',
    badgeName: 'Grove Badge',
    tile: { x: 38, y: 36 },
    color: 0x15803d,
    avatarIcon: '🌲',
    introDialog: '"The Old Grove Fairy Shrine is guarded by ancient boughs. Only steadfast hearts may pass deeper!"',
    defeatDialog: '"The forest spirits applaud your vigor! Wear the Grove Badge with eternal honor!"',
    alreadyBeatenDialog: '"The trees will always shelter a trainer with a heart as pure as yours."',
    team: [
      { speciesId: 23, nickname: 'Fernbuck', level: 12 },
      { speciesId: 59, nickname: 'Grizzlash', level: 13 }
    ]
  },
  {
    id: 'leader-flint',
    name: 'Pyromancer Flint',
    title: 'Ember Crags Leader',
    badgeId: 'magma',
    badgeName: 'Magma Badge',
    tile: { x: 60, y: 14 },
    color: 0xef4444,
    avatarIcon: '🔥',
    introDialog: '"The volcanic caldera burns away all hesitation! Can your heart withstand my inferno?"',
    defeatDialog: '"Magnificent! You didn\'t flinch before the roaring flame. Take the Magma Badge!"',
    alreadyBeatenDialog: '"Your passion burns brighter than molten lava! The Grand Pagoda Dojo lies ahead!"',
    team: [
      { speciesId: 2, nickname: 'Cindhound', level: 14 },
      { speciesId: 5, nickname: 'Blazelynx', level: 15 }
    ]
  }
];

export const REQUIRED_BADGES_FOR_CHAMPION = ['meadow', 'azure', 'grove', 'magma'];
