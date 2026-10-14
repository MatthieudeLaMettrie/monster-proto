export const WAYPOINTS = [
    {
        id: 'pallet_town',
        name: 'Pallet Plaza',
        subtitle: 'Town Center & Clinic',
        tile: { x: 10, y: 10 },
        zoneId: 'pallet_plaza',
        icon: '🏥',
        color: 0x38bdf8,
        description: 'A peaceful cobblestone hub with the Pokémon Center Clinic and PC Storage Terminal.',
        levelRange: 'Safe Haven',
        wildPreview: 'None (Safe Zone)'
    },
    {
        id: 'route1',
        name: 'Route 1 Meadow',
        subtitle: 'Verdant Fields',
        tile: { x: 28, y: 9 },
        zoneId: 'route1',
        icon: '🌾',
        color: 0x22c55e,
        description: 'Rolling grasslands where beginner trainers take their first steps into the wild.',
        levelRange: 'Lv 2 - 6',
        wildPreview: 'Sproutle, Boxerpup, Puddlefin',
        gymLeader: 'Camper Leo (Boulder Badge)'
    },
    {
        id: 'lake_azure',
        name: 'Lake Azure Pier',
        subtitle: 'Crystal Coast & Grotto',
        tile: { x: 14, y: 28 },
        zoneId: 'lakeshore',
        icon: '🌊',
        color: 0x0284c7,
        description: 'Sunlit waters and wooden docks stretching out toward the sunken sea cavern.',
        levelRange: 'Lv 6 - 14',
        wildPreview: 'Puddlefin, Skylark, Coralbas',
        gymLeader: 'Marina (Cascade Badge)'
    },
    {
        id: 'old_grove',
        name: 'Old Grove Fairy Shrine',
        subtitle: 'Ancient Whispering Woods',
        tile: { x: 38, y: 39 },
        zoneId: 'old_grove',
        icon: '🌲',
        color: 0x16a34a,
        description: 'An enchanted ancient canopy filled with glowing fireflies and mystic fairy monuments.',
        levelRange: 'Lv 10 - 20',
        wildPreview: 'Mosstusk, Ursumaul, Florasprout',
        gymLeader: 'Rowan (Verdant Badge)'
    },
    {
        id: 'ember_crags',
        name: 'Ember Crags Caldera',
        subtitle: 'Volcanic Dragon Peaks',
        tile: { x: 65, y: 8 },
        zoneId: 'ember_crags',
        icon: '🌋',
        color: 0xef4444,
        description: 'Hazardous jagged obsidian ridges with rising thermal embers and wild fire dragons.',
        levelRange: 'Lv 16 - 26',
        wildPreview: 'Pyrodial, Infernmastiff, Dracoflare',
        gymLeader: 'Flint (Magma Badge)'
    },
    {
        id: 'pagoda_dojo',
        name: 'Grand Pagoda Dojo',
        subtitle: 'Celestial Summit Ridge',
        tile: { x: 68, y: 46 },
        zoneId: 'dojo_plateau',
        icon: '🥋',
        color: 0xf59e0b,
        description: 'The highest martial summit where Grand Champion Master Aaron awaits worthy challengers.',
        levelRange: 'Lv 24 - 32',
        wildPreview: 'Celestial Dragons & Martial Beasts',
        gymLeader: 'Grand Champion Aaron (Crown Badge)'
    }
];
export const DEFAULT_UNLOCKED_WAYPOINTS = ['pallet_town'];
export function getWaypoint(id) {
    return WAYPOINTS.find(w => w.id === id);
}
export function getWaypointForZone(zoneId) {
    if (zoneId === 'pallet_plaza')
        return getWaypoint('pallet_town');
    if (zoneId === 'route1')
        return getWaypoint('route1');
    if (zoneId === 'lakeshore' || zoneId === 'sunken_grotto')
        return getWaypoint('lake_azure');
    if (zoneId === 'old_grove')
        return getWaypoint('old_grove');
    if (zoneId === 'ember_crags')
        return getWaypoint('ember_crags');
    if (zoneId === 'celestial_summit' || zoneId === 'dojo_plateau')
        return getWaypoint('pagoda_dojo');
    return undefined;
}
export function canFastTravel(unlockedWaypoints, waypointId) {
    return unlockedWaypoints.includes(waypointId);
}
export function discoverWaypoint(unlockedWaypoints, waypointId) {
    if (!WAYPOINTS.some(w => w.id === waypointId)) {
        return { unlocked: unlockedWaypoints, isNew: false };
    }
    if (unlockedWaypoints.includes(waypointId)) {
        return { unlocked: unlockedWaypoints, isNew: false };
    }
    return {
        unlocked: [...unlockedWaypoints, waypointId],
        isNew: true
    };
}
