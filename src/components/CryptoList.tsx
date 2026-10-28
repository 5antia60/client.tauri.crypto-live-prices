import type { CryptoAsset, Currency } from '../types.ts';
import { Icon } from './Icon.tsx';

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
    <li className="crypto-item">
      <div className="crypto-icon-wrap">
        {asset.image ? (
          <img src={asset.image} alt="" className="crypto-icon" width="36" height="36" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
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
          <Icon name={isPositive ? 'arrow-up' : 'arrow-down'} />
          <span>{isPositive ? '+' : '−'}{Math.abs(change).toFixed(2)}%</span>
        </span>
      </div>
      <button
        className="remove-btn"
        onClick={() => onRemove(asset.id)}
        title={`Remover ${asset.name}`}
        aria-label={`Remover ${asset.name}`}
      >
        <Icon name="close" />
      </button>
    </li>
  );
}

interface CryptoListProps {
  assets: CryptoAsset[];
  currency: Currency;
  onRemove: (id: string) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

export function CryptoList({ assets, currency, onRemove, loading, error, onRetry }: CryptoListProps) {
  if (loading && assets.length === 0) {
    return (
      <div className="crypto-list loading-list" role="status" aria-label="Carregando cotações">
        {[0, 1, 2].map((item) => <div className="skeleton-row" key={item} aria-hidden="true"><span className="skeleton skeleton-icon" /><span className="skeleton-copy"><span className="skeleton skeleton-name" /><span className="skeleton skeleton-symbol" /></span><span className="skeleton skeleton-price" /></div>)}
      </div>
    );
  }

  if (error && assets.length === 0) {
    return (
      <div className="list-state error" role="alert">
        <span className="state-icon"><Icon name="alert" /></span>
        <h2>Não foi possível atualizar</h2>
        <p>{error}</p>
        <button className="retry-btn" onClick={onRetry}>Tentar novamente</button>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="list-state empty">
        <span className="state-icon"><Icon name="list" /></span>
        <h2>Sua lista começa aqui</h2>
        <p>Busque uma criptomoeda abaixo para acompanhar suas cotações.</p>
      </div>
    );
  }

  return (
    <main className="crypto-list" aria-label="Cotações da sua lista" aria-busy={loading}>
      <ul className="crypto-items">
        {assets.map((asset) => (
        <CryptoItem
          key={asset.id}
          asset={asset}
          currency={currency}
          onRemove={onRemove}
        />
        ))}
      </ul>
      {error && (
        <div className="list-error-bar" role="alert">
          <Icon name="alert" /><span>{error} Os valores exibidos são da última atualização.</span>
        </div>
      )}
    </main>
  );
}
