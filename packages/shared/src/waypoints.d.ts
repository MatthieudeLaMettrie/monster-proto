export interface WaypointDef {
    id: string;
    name: string;
    subtitle: string;
    tile: {
        x: number;
        y: number;
    };
    zoneId: string;
    icon: string;
    color: number;
    description: string;
    levelRange: string;
    wildPreview: string;
    gymLeader?: string;
}
export declare const WAYPOINTS: WaypointDef[];
export declare const DEFAULT_UNLOCKED_WAYPOINTS: string[];
export declare function getWaypoint(id: string): WaypointDef | undefined;
export declare function getWaypointForZone(zoneId: string): WaypointDef | undefined;
export declare function canFastTravel(unlockedWaypoints: string[], waypointId: string): boolean;
export declare function discoverWaypoint(unlockedWaypoints: string[], waypointId: string): {
    unlocked: string[];
    isNew: boolean;
};
