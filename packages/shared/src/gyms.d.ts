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
export declare const BADGES: Record<string, BadgeInfo>;
export interface GymLeaderDef {
    id: string;
    name: string;
    title: string;
    badgeId: string;
    badgeName: string;
    tile: {
        x: number;
        y: number;
    };
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
export declare const GYM_LEADERS: GymLeaderDef[];
export declare const REQUIRED_BADGES_FOR_CHAMPION: string[];
