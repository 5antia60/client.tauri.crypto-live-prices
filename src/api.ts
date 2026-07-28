import type { CryptoAsset, SearchResult } from './types.ts';

const BASE_URL = 'https://api.coingecko.com/api/v3';

export async function fetchPrices(ids: string[]): Promise<CryptoAsset[]> {
  if (ids.length === 0) return [];

  const idsParam = ids.join(',');
  const url = `${BASE_URL}/coins/markets?vs_currency=usd&ids=${idsParam}&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();

  // Fetch BRL prices as well
  const urlBrl = `${BASE_URL}/coins/markets?vs_currency=brl&ids=${idsParam}&order=market_cap_desc&per_page=250&page=1&sparkline=false`;
  const responseBrl = await fetch(urlBrl);
  const dataBrl: Record<string, number> = {};

  if (responseBrl.ok) {
    const brlData = await responseBrl.json();
    for (const coin of brlData) {
      dataBrl[coin.id] = coin.current_price;
    }
  }

  return data.map((coin: any): CryptoAsset => ({
    id: coin.id,
    symbol: coin.symbol?.toUpperCase() ?? '',
    name: coin.name,
    current_price_usd: coin.current_price ?? 0,
    current_price_brl: dataBrl[coin.id] ?? 0,
    price_change_percentage_24h: coin.price_change_percentage_24h ?? 0,
    image: coin.image ?? '',
    last_updated: coin.last_updated ?? new Date().toISOString(),
  }));
}

export async function searchCoins(query: string): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const url = `${BASE_URL}/search?query=${encodeURIComponent(query)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`CoinGecko search error: ${response.status}`);
  }

  const data = await response.json();
  return (data.coins ?? []).slice(0, 10).map((coin: any): SearchResult => ({
    id: coin.id,
    symbol: coin.symbol?.toUpperCase() ?? '',
    name: coin.name,
    thumb: coin.thumb ?? '',
  }));
}
