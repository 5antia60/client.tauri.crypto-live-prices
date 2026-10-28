import { useState, useEffect, useCallback, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { isTauri } from '@tauri-apps/api/core';
import { fetchPrices } from './api.ts';
import { loadPreferences, savePreferences } from './storage.ts';
import type { CryptoAsset, Currency, AppPreferences } from './types.ts';
import { Header } from './components/Header.tsx';
import { CryptoList } from './components/CryptoList.tsx';
import { SearchBar } from './components/SearchBar.tsx';
import { Settings } from './components/Settings.tsx';
import './App.css';

function App() {
  const [prefs, setPrefs] = useState<AppPreferences>(() => loadPreferences());
  const [assets, setAssets] = useState<CryptoAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const watchlistRef = useRef(prefs.watchlist);
  watchlistRef.current = prefs.watchlist;

  const refreshPrices = useCallback(async (watchlist?: string[]) => {
    const ids = watchlist ?? watchlistRef.current;
    if (ids.length === 0) {
      setAssets([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPrices(ids);
      // Sort to match watchlist order
      const ordered = ids
        .map((id) => data.find((a) => a.id === id))
        .filter(Boolean) as CryptoAsset[];
      setAssets(ordered);
      setLastUpdated(new Date().toISOString());
    } catch (e: any) {
      const msg = e?.message ?? 'Erro ao buscar cotações';
      if (msg.includes('429')) {
        setError('Limite da API atingido. Aguarde um momento.');
      } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('Sem conexão com a internet.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshPrices();
  }, [refreshPrices]);

  // Auto-refresh interval
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      refreshPrices();
    }, prefs.refreshInterval * 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [prefs.refreshInterval, refreshPrices]);

  // Listen to tray "refresh" event from Rust
  useEffect(() => {
    if (!isTauri()) return;
    const unlisten = listen('refresh-prices', () => {
      refreshPrices();
    });
    return () => {
      unlisten.then((f) => f());
    };
  }, [refreshPrices]);

  const updatePrefs = useCallback((updates: Partial<AppPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...updates };
      savePreferences(next);
      return next;
    });
  }, []);

  const handleCurrencyChange = (currency: Currency) => {
    updatePrefs({ currency });
  };

  const handleAddCoin = (id: string) => {
    if (prefs.watchlist.includes(id)) return;
    const newList = [...prefs.watchlist, id];
    updatePrefs({ watchlist: newList });
    refreshPrices(newList);
  };

  const handleRemoveCoin = (id: string) => {
    const newList = prefs.watchlist.filter((w) => w !== id);
    updatePrefs({ watchlist: newList });
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleIntervalChange = (refreshInterval: number) => {
    updatePrefs({ refreshInterval });
  };

  return (
    <div className="app">
      <Header
        currency={prefs.currency}
        onCurrencyChange={handleCurrencyChange}
        lastUpdated={lastUpdated}
        loading={loading}
        onRefresh={() => refreshPrices()}
        onOpenSettings={() => setShowSettings(true)}
        count={prefs.watchlist.length}
      />

      <CryptoList
        assets={assets}
        currency={prefs.currency}
        onRemove={handleRemoveCoin}
        loading={loading}
        error={error}
        onRetry={() => refreshPrices()}
      />

      <div className={`market-status ${error ? 'has-error' : ''}`}>
        <span className="status-message" role="status">
          <span className={`status-dot ${loading ? 'is-loading' : ''}`} aria-hidden="true" />
          {loading ? 'Atualizando cotações...' : error ? 'Atualização indisponível' : prefs.watchlist.length === 0 ? 'Aguardando sua primeira moeda' : lastUpdated ? `Atualizado às ${new Date(lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : 'Aguardando cotações'}
        </span>
        <span className="refresh-cadence">a cada {prefs.refreshInterval < 60 ? `${prefs.refreshInterval}s` : `${prefs.refreshInterval / 60} min`}</span>
      </div>
      <SearchBar watchlist={prefs.watchlist} onAdd={handleAddCoin} />
      <footer className="app-footer"><span>Dados por CoinGecko</span><span>Cotações informativas</span></footer>

      {showSettings && (
        <Settings
          refreshInterval={prefs.refreshInterval}
          onIntervalChange={handleIntervalChange}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
