export type GameSize = 'medium' | 'wide' | 'tall' | 'featured';

export type GameCategory = 
  | 'all'
  | 'popular'
  | 'favorites'
  | 'arcade'
  | 'action'
  | 'driving'
  | 'puzzle'
  | 'retro'
  | 'sports'
  | 'multiplayer';

export interface GameItem {
  id: number;
  title: string;
  url: string;
  size: GameSize;
  isNew?: boolean;
  category: GameCategory;
  description?: string;
  tags?: string[];
  plays?: number;
  iconUrl?: string;
}

export type ThemeMode = 'cosmic-dark' | 'cyber-neon' | 'midnight-blue' | 'clean-light' | 'sunset-amber';

export interface CloakPreset {
  id: string;
  name: string;
  title: string;
  favicon: string;
}
