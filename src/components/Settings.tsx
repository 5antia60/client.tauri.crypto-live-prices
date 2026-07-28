import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface SettingsProps {
  refreshInterval: number;
  onIntervalChange: (s: number) => void;
  onClose: () => void;
}

export function Settings({ refreshInterval, onIntervalChange, onClose }: SettingsProps) {
  const [autostart, setAutostart] = useState(false);
  const [autostartLoading, setAutostartLoading] = useState(false);
  const [interval, setInterval] = useState(refreshInterval);

  useEffect(() => {
    invoke<boolean>('get_autostart_status')
      .then(setAutostart)
      .catch(() => {});
  }, []);

  const toggleAutostart = async () => {
    setAutostartLoading(true);
    try {
      await invoke('set_autostart', { enabled: !autostart });
      setAutostart((v) => !v);
    } catch {
      // ignore
    } finally {
      setAutostartLoading(false);
    }
  };

  const handleIntervalChange = (v: number) => {
    setInterval(v);
    onIntervalChange(v);
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span>Configurações</span>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-row">
          <label>Atualização automática</label>
          <select
            value={interval}
            onChange={(e) => handleIntervalChange(Number(e.target.value))}
            className="settings-select"
          >
            <option value={30}>30 segundos</option>
            <option value={60}>1 minuto</option>
            <option value={120}>2 minutos</option>
            <option value={300}>5 minutos</option>
          </select>
        </div>

        <div className="settings-row">
          <label>Iniciar com o sistema</label>
          <button
            className={`toggle-btn ${autostart ? 'on' : 'off'}`}
            onClick={toggleAutostart}
            disabled={autostartLoading}
          >
            {autostart ? 'Ativado' : 'Desativado'}
          </button>
        </div>

        <div className="settings-footer">
          <span className="settings-version">CryptoTray v0.1.0</span>
          <a
            href="#"
            className="settings-link"
            onClick={(e) => {
              e.preventDefault();
              // Open CoinGecko attribution
            }}
          >
            Dados: CoinGecko
          </a>
        </div>
      </div>
    </div>
  );
}
