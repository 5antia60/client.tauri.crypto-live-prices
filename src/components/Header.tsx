import type { Currency } from '../types.ts';
import { Icon } from './Icon.tsx';

interface HeaderProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  lastUpdated: string | null;
  loading: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
  count: number;
}

export function Header({ currency, onCurrencyChange, lastUpdated, loading, onRefresh, onOpenSettings, count }: HeaderProps) {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <>
      <header className="header">
        <div className="header-left">
          <span className="header-logo"><Icon name="activity" /></span>
          <div className="header-brand">
            <span className="header-title">Crypto Live Prices</span>
            <span className="header-subtitle">O mercado, em um olhar.</span>
          </div>
        </div>
        <div className="header-right">
          <button className="icon-btn refresh-btn" onClick={onRefresh} aria-label="Atualizar cotações" title={formattedTime ? `Última atualização: ${formattedTime}` : 'Atualizar cotações'} disabled={loading}>
            <Icon name="refresh" className={loading ? 'spinning' : ''} />
          </button>
          <button className="icon-btn" onClick={onOpenSettings} aria-label="Configurações" title="Configurações">
            <Icon name="settings" />
          </button>
        </div>
      </header>
      <div className="app-toolbar">
        <div className="watchlist-heading">
          <h1>Sua lista</h1>
          <span className="asset-count" aria-label={`${count} ${count === 1 ? 'moeda na lista' : 'moedas na lista'}`}>{count}</span>
        </div>
        <div className="currency-toggle" role="group" aria-label="Moeda das cotações">
          {(['usd', 'brl'] as const).map((value) => (
            <button key={value} className={`currency-btn ${currency === value ? 'active' : ''}`} aria-pressed={currency === value} onClick={() => onCurrencyChange(value)}>
              {value.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="list-columns" aria-hidden="true"><span>Ativo</span><span>Preço / 24h</span></div>
    </>
  );
}
