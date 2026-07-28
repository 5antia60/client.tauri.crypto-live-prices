import type { CryptoAsset, Currency } from '../types.ts';

interface CryptoItemProps {
  asset: CryptoAsset;
  currency: Currency;
  onRemove: (id: string) => void;
}

function formatPrice(value: number, currency: Currency): string {
  const locale = currency === 'brl' ? 'pt-BR' : 'en-US';
  const currencyCode = currency === 'brl' ? 'BRL' : 'USD';

  if (value < 0.01) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    }).format(value);
  }
  if (value < 1) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value);
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function CryptoItem({ asset, currency, onRemove }: CryptoItemProps) {
  const price = currency === 'brl' ? asset.current_price_brl : asset.current_price_usd;
  const change = asset.price_change_percentage_24h;
  const isPositive = change >= 0;

  return (
    <div className="crypto-item">
      <div className="crypto-icon-wrap">
        {asset.image ? (
          <img src={asset.image} alt={asset.name} className="crypto-icon" />
        ) : (
          <span className="crypto-icon-placeholder">{asset.symbol[0]}</span>
        )}
      </div>
      <div className="crypto-info">
        <span className="crypto-symbol">{asset.symbol}</span>
        <span className="crypto-name">{asset.name}</span>
      </div>
      <div className="crypto-price-wrap">
        <span className="crypto-price">{formatPrice(price, currency)}</span>
        <span className={`crypto-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </span>
      </div>
      <button
        className="remove-btn"
        onClick={() => onRemove(asset.id)}
        title={`Remover ${asset.name}`}
      >
        ×
      </button>
    </div>
  );
}

interface CryptoListProps {
  assets: CryptoAsset[];
  currency: Currency;
  onRemove: (id: string) => void;
  loading: boolean;
  error: string | null;
}

export function CryptoList({ assets, currency, onRemove, loading, error }: CryptoListProps) {
  if (loading && assets.length === 0) {
    return (
      <div className="list-state">
        <div className="spinner" />
        <span>Carregando cotações...</span>
      </div>
    );
  }

  if (error && assets.length === 0) {
    return (
      <div className="list-state error">
        <span className="error-icon">⚠</span>
        <span>{error}</span>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="list-state empty">
        <span>Nenhuma criptomoeda adicionada.</span>
        <span className="hint">Use a busca abaixo para adicionar.</span>
      </div>
    );
  }

  return (
    <div className="crypto-list">
      {assets.map((asset) => (
        <CryptoItem
          key={asset.id}
          asset={asset}
          currency={currency}
          onRemove={onRemove}
        />
      ))}
      {error && (
        <div className="list-error-bar">
          <span>⚠ {error}</span>
        </div>
      )}
    </div>
  );
}
