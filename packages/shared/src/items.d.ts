import { StatusCondition } from './types.js';
export type ItemCategory = 'healing' | 'revive' | 'capture' | 'status_cure';
export interface GameItem {
    id: string;
    name: string;
    category: ItemCategory;
    description: string;
    value: number;
    curesCondition?: StatusCondition | 'all';
}
export declare const ITEMS: Record<string, GameItem>;
export type InventoryBag = Record<string, number>;
export declare const DEFAULT_INVENTORY: InventoryBag;
