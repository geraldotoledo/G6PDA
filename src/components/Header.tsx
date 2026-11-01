import React, { useState, useEffect } from 'react';
import { RefreshCw, Settings2, Check, AlertCircle, X } from 'lucide-react';
import { ProfileMode } from '../engine/types.ts';
import { syncRulesFromRemote, SyncCheckResult } from '../services/rulesSync.ts';

interface HeaderProps {
  profileMode: ProfileMode;
  onProfileModeChange: (mode: ProfileMode) => void;
  rulesVersion: string;
  screenTitle: string;
  onOpenEmergency: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profileMode,
  onProfileModeChange,
  rulesVersion,
  screenTitle,
  onOpenEmergency
}) => {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncCheckResult | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoZoomOpen, setLogoZoomOpen] = useState(false);

  useEffect(() => {
    if (!logoZoomOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLogoZoomOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [logoZoomOpen]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncRulesFromRemote();
      setSyncResult(res);
      setTimeout(() => setSyncResult(null), 5000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <header className="app-header">
        <div className="header-row">
          <div className="brand">
            <button
              type="button"
              className="brand-logo-btn"
              onClick={() => setLogoZoomOpen(true)}
              aria-label="Ampliar emblema G6PDA (LHPT)"
              title="Toque para ampliar o emblema"
            >
              <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="Emblema G6PDA" width={48} height={48} />
            </button>
            <div>
              <h1>G6PDA</h1>
              <p>{screenTitle}</p>
            </div>
          </div>
          <div className="header-actions">
            <button type="button" className="icon-button sos-button" onClick={onOpenEmergency} aria-label="Abrir cartão de emergência" title="Cartão SOS">
              <AlertCircle size={22} />
            </button>
          </div>
        </div>

        <details id="protection-settings" className="header-profile" open={settingsOpen} onToggle={(e) => setSettingsOpen(e.currentTarget.open)}>
          <summary aria-label="Abrir configurações de proteção">
            <Settings2 size={14} /> Perfil e base de regras <span className="badge badge-neutral">v{rulesVersion}</span>
          </summary>
          <div className="header-profile-panel">
            <label htmlFor="protection-profile">Protocolo de Proteção</label>
            <select id="protection-profile" value={profileMode} onChange={(e) => onProfileModeChange(e.target.value as ProfileMode)}>
              <option value="BRAZIL_PEDIATRIC">🇧🇷 Brasil Pediátrico (Zero Corantes Artificiais + Sulfitos)</option>
              <option value="STRICT_ZERO_DYES">🛡️ Proteção Máxima (Zero Corantes Totais)</option>
              <option value="GLOBAL_CPIC">🌐 Consenso Internacional (CPIC / OMS Estrito)</option>
            </select>
            <button type="button" onClick={handleSync} disabled={syncing} className="btn btn-secondary" title="Verificar atualização da base clínica no GitHub">
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Verificando atualização…' : 'Sincronizar base de regras'}
            </button>
          </div>
        </details>

        {syncResult && (
          <div role="status" className={`sync-notice${syncResult.updated ? ' updated' : ''}`}>
            {syncResult.updated ? <Check size={16} /> : <AlertCircle size={16} />}
            <span>{syncResult.message}</span>
          </div>
        )}
      </header>

      {logoZoomOpen && (
        <div
          className="modal-backdrop logo-zoom-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Emblema G6PDA em alta resolução"
          onClick={() => setLogoZoomOpen(false)}
        >
          <div className="logo-zoom-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="icon-button logo-zoom-close"
              onClick={() => setLogoZoomOpen(false)}
              aria-label="Fechar ampliação do emblema"
              title="Fechar"
            >
              <X size={20} />
            </button>
            <img
              src={`${import.meta.env.BASE_URL}icons/icon-512.png`}
              alt="Emblema G6PDA — G6PD LHPT em alta resolução"
              className="logo-zoom-img"
            />
          </div>
        </div>
      )}
    </>
  );
};
