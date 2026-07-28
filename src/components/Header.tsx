import type { Currency } from '../types.ts';

interface HeaderProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  lastUpdated: string | null;
  loading: boolean;
  onRefresh: () => void;
}

export function Header({ currency, onCurrencyChange, lastUpdated, loading, onRefresh }: HeaderProps) {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="header">
      <div className="header-left">
        <span className="header-logo">₿</span>
        <span className="header-title">Crypto Live Prices</span>
      </div>
      <div className="header-right">
        <div className="currency-toggle">
          <button
            className={`currency-btn ${currency === 'usd' ? 'active' : ''}`}
            onClick={() => onCurrencyChange('usd')}
          >
            USD
          </button>
          <button
            className={`currency-btn ${currency === 'brl' ? 'active' : ''}`}
            onClick={() => onCurrencyChange('brl')}
          >
            BRL
          </button>
        </div>
        <button
          className={`refresh-btn ${loading ? 'spinning' : ''}`}
          onClick={onRefresh}
          title={formattedTime ? `Última atualização: ${formattedTime}` : 'Atualizar'}
          disabled={loading}
        >
          ↻
        </button>
      </div>
    </div>
  );
}
