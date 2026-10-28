import { useState, useEffect, useRef } from 'react';
import { searchCoins } from '../api.ts';
import type { SearchResult } from '../types.ts';
import { Icon } from './Icon.tsx';

interface SearchBarProps {
  watchlist: string[];
  onAdd: (id: string) => void;
}

export function SearchBar({ watchlist, onAdd }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ignore = false;
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    setResults([]);
    const timeout = setTimeout(async () => {
      try {
        const next = await searchCoins(query);
        if (!ignore) setResults(next);
      } catch {
        if (!ignore) setError(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 400);
    return () => { ignore = true; clearTimeout(timeout); };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAdd = (coin: SearchResult) => {
    onAdd(coin.id);
    setQuery('');
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="searchbar" ref={containerRef} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }} onKeyDown={(event) => {
      if (event.key === 'Escape') { inputRef.current?.focus(); setOpen(false); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const buttons = Array.from(containerRef.current?.querySelectorAll<HTMLButtonElement>('.search-result:not(:disabled)') ?? []);
        if (!buttons.length) return;
        event.preventDefault();
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.key === 'ArrowDown' ? (current + 1) % buttons.length : current <= 0 ? buttons.length - 1 : current - 1;
        buttons[next]?.focus();
      }
    }}>
      <label className="searchbar-label" htmlFor="coin-search">Adicionar à sua lista</label>
      <div className="searchbar-input-wrap">
        <Icon name="search" className="search-icon" />
        <input ref={inputRef} id="coin-search" type="text" className="searchbar-input" placeholder="Buscar por nome ou símbolo" aria-label="Buscar criptomoeda" aria-controls={open && query.trim() ? 'coin-results' : undefined} autoComplete="off" spellCheck={false} value={query} onChange={(e) => { setQuery(e.target.value); setOpen(true); }} onFocus={() => query.trim() && setOpen(true)} />
        {loading ? <Icon name="refresh" className="search-loading spinning" /> : query ? <button className="search-clear icon-btn" aria-label="Limpar busca" onClick={() => { setQuery(''); inputRef.current?.focus(); }}><Icon name="close" /></button> : <Icon name="plus" className="search-plus" />}
      </div>
      {open && query.trim() && (
        <div className="search-dropdown" id="coin-results" aria-label="Resultados da busca">
          <div className="search-dropdown-heading">Adicionar criptomoeda</div>
          {loading ? <p className="search-feedback" role="status">Buscando moedas...</p> : error ? <p className="search-feedback search-error" role="alert">Não foi possível buscar. Tente novamente em instantes.</p> : results.length === 0 ? <p className="search-feedback" role="status">Nenhuma moeda encontrada.</p> : <ul className="search-results">
            {results.map((coin) => {
              const alreadyAdded = watchlist.includes(coin.id);
              return (
                <li key={coin.id}>
                  <button className="search-result" onClick={() => handleAdd(coin)} disabled={alreadyAdded} aria-label={alreadyAdded ? `${coin.name} já está na lista` : `Adicionar ${coin.name}`}>
                    <span className="search-thumb-wrap">{coin.thumb ? <img src={coin.thumb} alt="" className="search-thumb" width="28" height="28" /> : <span className="search-thumb-placeholder">{coin.symbol.slice(0, 1).toUpperCase()}</span>}</span>
                    <span className="search-coin"><span className="search-name">{coin.name}</span><span className="search-symbol">{coin.symbol.toUpperCase()}</span></span>
                    <span className={`add-indicator ${alreadyAdded ? 'is-added' : ''}`}><Icon name={alreadyAdded ? 'check' : 'plus'} /></span>
                  </button>
                </li>
              );
            })}
          </ul>}
        </div>
      )}
    </div>
  );
}
