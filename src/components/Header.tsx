import React, { useState } from 'react';
import { RefreshCw, Settings2, Check, AlertCircle } from 'lucide-react';
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
    <header className="app-header">
      <div className="header-row">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" width={48} height={48} />
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
  );
};
