import { useState, useEffect, useRef } from 'react';
import { searchCoins } from '../api.ts';
import type { SearchResult } from '../types.ts';

interface SearchBarProps {
  watchlist: string[];
  onAdd: (id: string) => void;
}

export function SearchBar({ watchlist, onAdd }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await searchCoins(query);
        setResults(r);
        setOpen(r.length > 0);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = (coin: SearchResult) => {
    onAdd(coin.id);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div className="searchbar" ref={containerRef}>
      <div className="searchbar-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="searchbar-input"
          placeholder="Adicionar criptomoeda..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
        />
        {loading && <span className="search-loading">⋯</span>}
      </div>
      {open && results.length > 0 && (
        <ul className="search-dropdown">
          {results.map((coin) => {
            const alreadyAdded = watchlist.includes(coin.id);
            return (
              <li key={coin.id} className={`search-item ${alreadyAdded ? 'disabled' : ''}`}>
                <img src={coin.thumb} alt={coin.name} className="search-thumb" />
                <span className="search-name">{coin.name}</span>
                <span className="search-symbol">{coin.symbol}</span>
                <button
                  className="add-btn"
                  onClick={() => !alreadyAdded && handleAdd(coin)}
                  disabled={alreadyAdded}
                >
                  {alreadyAdded ? '✓' : '+'}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
