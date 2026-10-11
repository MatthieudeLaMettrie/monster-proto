export type ItemCategory = 'healing' | 'revive' | 'capture';
export interface GameItem {
    id: string;
    name: string;
    category: ItemCategory;
    description: string;
    value: number;
}
export declare const ITEMS: Record<string, GameItem>;
export type InventoryBag = Record<string, number>;
export declare const DEFAULT_INVENTORY: InventoryBag;
