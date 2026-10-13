export const ITEMS = {
    potion: {
        id: 'potion',
        name: 'Potion',
        category: 'healing',
        description: 'Restores 20 HP to one monster.',
        value: 20
    },
    super_potion: {
        id: 'super_potion',
        name: 'Super Potion',
        category: 'healing',
        description: 'Restores 50 HP to one monster.',
        value: 50
    },
    revive: {
        id: 'revive',
        name: 'Revive',
        category: 'revive',
        description: 'Revives a fainted monster with 50% HP.',
        value: 0.5
    },
    capsule: {
        id: 'capsule',
        name: 'Capture Capsule',
        category: 'capture',
        description: 'Standard capsule for catching wild monsters.',
        value: 1.0
    },
    ultra_capsule: {
        id: 'ultra_capsule',
        name: 'Ultra Capsule',
        category: 'capture',
        description: 'High performance capsule with 2.0x catch rate.',
        value: 2.0
    },
    antidote: {
        id: 'antidote',
        name: 'Antidote',
        category: 'status_cure',
        description: 'Cures a monster of poison.',
        value: 0,
        curesCondition: 'poison'
    },
    burn_heal: {
        id: 'burn_heal',
        name: 'Burn Heal',
        category: 'status_cure',
        description: 'Heals a monster suffering from a burn.',
        value: 0,
        curesCondition: 'burn'
    },
    paralyze_heal: {
        id: 'paralyze_heal',
        name: 'Paralyze Heal',
        category: 'status_cure',
        description: 'Cures a monster of paralysis.',
        value: 0,
        curesCondition: 'paralysis'
    },
    awakening: {
        id: 'awakening',
        name: 'Awakening',
        category: 'status_cure',
        description: 'Awakens a sleeping monster.',
        value: 0,
        curesCondition: 'sleep'
    },
    ice_heal: {
        id: 'ice_heal',
        name: 'Ice Heal',
        category: 'status_cure',
        description: 'Thaws a frozen monster.',
        value: 0,
        curesCondition: 'freeze'
    },
    full_heal: {
        id: 'full_heal',
        name: 'Full Heal',
        category: 'status_cure',
        description: 'Heals all status conditions from a monster.',
        value: 0,
        curesCondition: 'all'
    }
};
export const DEFAULT_INVENTORY = {
    potion: 3,
    super_potion: 1,
    revive: 1,
    capsule: 5,
    ultra_capsule: 1,
    antidote: 2,
    burn_heal: 1,
    paralyze_heal: 1,
    full_heal: 1
};
