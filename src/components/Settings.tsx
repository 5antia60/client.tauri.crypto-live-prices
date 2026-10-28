import { useState, useEffect, useRef } from 'react';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { Icon } from './Icon.tsx';

interface SettingsProps {
  refreshInterval: number;
  onIntervalChange: (s: number) => void;
  onClose: () => void;
}

export function Settings({ refreshInterval, onIntervalChange, onClose }: SettingsProps) {
  const [autostart, setAutostart] = useState(false);
  const [autostartLoading, setAutostartLoading] = useState(isTauri());
  const [autostartReady, setAutostartReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const native = isTauri();

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => { dialog?.close(); previousFocus?.focus(); };
  }, []);

  useEffect(() => {
    if (!native) return;
    let ignore = false;
    invoke<boolean>('get_autostart_status')
      .then((value) => { if (!ignore) { setAutostart(value); setAutostartReady(true); } })
      .catch(() => { if (!ignore) setError('Não foi possível consultar a inicialização automática. Reabra as configurações para tentar novamente.'); })
      .finally(() => { if (!ignore) setAutostartLoading(false); });
    return () => { ignore = true; };
  }, [native]);

  const toggleAutostart = async () => {
    setAutostartLoading(true);
    setError(null);
    try {
      await invoke('set_autostart', { enabled: !autostart });
      setAutostart((value) => !value);
    } catch {
      setError('Não foi possível alterar essa preferência. Tente novamente.');
    } finally {
      setAutostartLoading(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="settings-panel" aria-labelledby="settings-title" aria-describedby="settings-description" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => {
      if (event.target === event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }
    }}>
      <div className="settings-header">
        <div><h2 id="settings-title">Configurações</h2><p id="settings-description">Deixe o app do seu jeito.</p></div>
        <button className="icon-btn settings-close" onClick={onClose} aria-label="Fechar configurações" autoFocus><Icon name="close" /></button>
      </div>
      <div className="settings-body">
        <div className="settings-field">
          <label htmlFor="refresh-interval"><Icon name="clock" />Atualização automática</label>
          <p>Escolha a frequência das cotações.</p>
          <select id="refresh-interval" value={refreshInterval} onChange={(e) => onIntervalChange(Number(e.target.value))} className="settings-select">
            <option value={30}>A cada 30 segundos</option><option value={60}>A cada 1 minuto</option><option value={120}>A cada 2 minutos</option><option value={300}>A cada 5 minutos</option>
          </select>
        </div>
        <div className="settings-autostart">
          <div><span id="autostart-label">Iniciar com o sistema</span><p id="autostart-description">{native ? 'Disponível assim que você entrar.' : 'Disponível no aplicativo desktop.'}</p></div>
          <button className={`toggle-switch ${autostart ? 'on' : ''}`} role="switch" aria-checked={autostart} aria-labelledby="autostart-label" aria-describedby="autostart-description" onClick={toggleAutostart} disabled={!autostartReady || autostartLoading}><span /></button>
        </div>
        {error && <p className="settings-error" role="alert">{error}</p>}
        <p className="settings-saved"><Icon name="check" />Preferências salvas automaticamente</p>
      </div>
      <div className="settings-footer"><span>CryptoTray v0.1.0</span><span>Dados: CoinGecko</span></div>
    </dialog>
  );
}
