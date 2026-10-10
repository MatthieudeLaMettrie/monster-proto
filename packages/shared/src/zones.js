export const MAP_ZONES = {
    route1: {
        id: 'route1',
        name: 'Route 1 (Meadow)',
        minLevel: 2,
        maxLevel: 5,
        types: ['Grass', 'Fight'],
        // Base forms: Sproutle (19), Mossling (22), Budbee (25), Jabbit (55), Cubrawl (58)
        speciesIds: [19, 22, 25, 55, 58]
    },
    lakeshore: {
        id: 'lakeshore',
        name: 'Lake Shore',
        minLevel: 3,
        maxLevel: 6,
        types: ['Water', 'Fly'],
        // Base forms: Puddlefin (10), Bubblot (13), Shellby (16), Pipwing (46), Flitbat (49), Kiteling (52)
        speciesIds: [10, 13, 16, 46, 49, 52]
    },
    ember_crags: {
        id: 'ember_crags',
        name: 'Ember Crags',
        minLevel: 5,
        maxLevel: 9,
        types: ['Fire', 'Dragon'],
        // Base forms: Emberpup (1), Flickit (4), Coalbug (7), Wyrmlet (40), Scalekin (43)
        speciesIds: [1, 4, 7, 40, 43]
    },
    old_grove: {
        id: 'old_grove',
        name: 'Old Grove',
        minLevel: 4,
        maxLevel: 8,
        types: ['Grass', 'Psy', 'Dark'],
        // Base forms: Mossling (22), Glimmote (28), Hushfox (31), Gloomouse (34), Hexmoth (37)
        speciesIds: [22, 28, 31, 34, 37]
    },
    dojo_plateau: {
        id: 'dojo_plateau',
        name: 'Dojo Plateau',
        minLevel: 6,
        maxLevel: 10,
        types: ['Fight', 'Fly'],
        // Base forms + stage 2: Jabbit (55), Boxhare (56), Cubrawl (58), Pipwing (46), Galefinch (47)
        speciesIds: [55, 56, 58, 46, 47]
    }
};
