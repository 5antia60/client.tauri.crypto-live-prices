export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  current_price_usd: number;
  current_price_brl: number;
  price_change_percentage_24h: number;
  image: string;
  last_updated: string;
}

export interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
}

export type Currency = 'usd' | 'brl';

export interface AppPreferences {
  currency: Currency;
  autostart: boolean;
  refreshInterval: number; // seconds
  watchlist: string[]; // coin ids
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  currency: 'usd',
  autostart: false,
  refreshInterval: 60,
  watchlist: ['bitcoin'],
};
