export const MAP_ZONES = {
    pallet_plaza: {
        id: 'pallet_plaza',
        name: 'Pallet Plaza (Safe Town)',
        minLevel: 1,
        maxLevel: 2,
        types: ['Normal'],
        speciesIds: []
    },
    route1: {
        id: 'route1',
        name: 'Route 1 (Meadow Trail)',
        minLevel: 2,
        maxLevel: 5,
        types: ['Grass', 'Fight'],
        // Sproutle (19), Seedling (22), Mosskin (25), Boxerpup (52), Sparrk (55), Armadillo (58)
        speciesIds: [19, 22, 25, 52, 55, 58]
    },
    lakeshore: {
        id: 'lakeshore',
        name: 'Lake Azure',
        minLevel: 3,
        maxLevel: 7,
        types: ['Water', 'Fly'],
        // Puddlefin (10), Bubblot (13), Shellby (16), Skylark (46), Featherpuff (49)
        speciesIds: [10, 13, 16, 46, 49]
    },
    sunken_grotto: {
        id: 'sunken_grotto',
        name: 'Sunken Grotto',
        minLevel: 7,
        maxLevel: 11,
        types: ['Water', 'Dark'],
        // Tidefin (11), Brinetoad (14), Coralisk (17), Shadeclaw (35), Duskfang (38)
        speciesIds: [11, 14, 17, 35, 38]
    },
    old_grove: {
        id: 'old_grove',
        name: 'Old Grove (Enchanted Woods)',
        minLevel: 4,
        maxLevel: 9,
        types: ['Grass', 'Psy', 'Dark'],
        // Seedling (22), Mosskin (25), Psypup (28), Gleamling (31), Umbrata (34), Grimling (37)
        speciesIds: [22, 25, 28, 31, 34, 37]
    },
    ember_crags: {
        id: 'ember_crags',
        name: 'Ember Crags & Volcano',
        minLevel: 5,
        maxLevel: 9,
        types: ['Fire', 'Dragon'],
        // Emberpup (1), Flickit (4), Coalbug (7), Wyrmlet (40), Pyrowyrm (43)
        speciesIds: [1, 4, 7, 40, 43]
    },
    celestial_summit: {
        id: 'celestial_summit',
        name: 'Celestial Summit',
        minLevel: 9,
        maxLevel: 14,
        types: ['Dragon', 'Psy', 'Fly'],
        // Mindhound (29), Prismoth (32), Drakeon (41), Ignidrake (44), Zephyrcrane (47), Cloudwing (50)
        speciesIds: [29, 32, 41, 44, 47, 50]
    },
    dojo_plateau: {
        id: 'dojo_plateau',
        name: 'Champion Dojo Plateau',
        minLevel: 8,
        maxLevel: 13,
        types: ['Fight', 'Dragon'],
        // Champhound (53), Brawlor (56), Crustox (59), Drakeon (41), Ignidrake (44)
        speciesIds: [53, 56, 59, 41, 44]
    }
};
