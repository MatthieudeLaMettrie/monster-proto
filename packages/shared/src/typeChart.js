// Attacker row vs Defender column
// 1 = normal, 2 = super effective, 0.5 = resisted
export const TYPE_CHART = {
    Fire: {
        Fire: 0.5,
        Water: 0.5,
        Grass: 2.0,
        Dragon: 0.5
    },
    Water: {
        Fire: 2.0,
        Water: 0.5,
        Grass: 0.5,
        Dragon: 0.5
    },
    Grass: {
        Fire: 0.5,
        Water: 2.0,
        Grass: 0.5,
        Dragon: 0.5,
        Fly: 0.5
    },
    Psy: {
        Psy: 0.5,
        Dark: 0.5,
        Fight: 2.0
    },
    Dark: {
        Psy: 2.0,
        Dark: 0.5,
        Dragon: 2.0,
        Fight: 0.5
    },
    Dragon: {
        Dragon: 2.0,
        Fly: 1.5,
        Fight: 0.5
    },
    Fly: {
        Grass: 2.0,
        Dragon: 0.5,
        Fight: 2.0
    },
    Fight: {
        Psy: 0.5,
        Dark: 2.0,
        Fly: 0.5,
        Dragon: 1.5
    }
};
export function getTypeMultiplier(attackerType, defenderType) {
    if (attackerType === 'Normal')
        return 1.0;
    const row = TYPE_CHART[attackerType];
    if (!row)
        return 1.0;
    return row[defenderType] ?? 1.0;
}
