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
    }
};
export const DEFAULT_INVENTORY = {
    potion: 3,
    revive: 1,
    capsule: 5,
    ultra_capsule: 1
};
