import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface OnboardingModalProps {
  onAccept: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onAccept }) => {
  const [agreed, setAgreed] = useState(false);

  const handleConfirm = () => {
    if (agreed) {
      localStorage.setItem('g6pd_disclaimer_accepted_v1', 'true');
      onAccept();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Termo de Uso e Segurança Clínica">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--red-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--red-border)'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Termo de Uso e Segurança Clínica</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Deficiência de G6PD (CID-10: D55.0)</p>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '12px',
          padding: '14px',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          lineHeight: '1.6',
          color: 'var(--text-main)',
          marginBottom: '18px'
        }}>
          <p style={{ marginBottom: '10px' }}>
            <strong>Bem-vindo ao G6PDA.</strong> Este aplicativo foi desenvolvido com rigor analítico para apoiar famílias, escolas e cuidadores na identificação de agentes oxidantes, corantes sintéticos e medicamentos de risco na infância.
          </p>
          <p style={{ marginBottom: '10px' }}>
            ⚠️ <strong>Aviso Médico Fundamental:</strong> O aplicativo é uma <em>ferramenta de conferência auxiliar</em> baseada nas diretrizes do <strong>CPIC</strong>, <strong>Sociedade Brasileira de Pediatria (SBP)</strong> e <strong>Ministério da Saúde</strong>. Ele <u>não substitui</u> o acompanhamento médico do hematologista/pediatra do seu filho.
          </p>
          <p>
            🔍 <strong>Conferência Visual:</strong> Embalagens podem sofrer reformulação na fábrica. Sempre faça a conferência visual final no rótulo físico antes de oferecer qualquer alimento ou medicamento à criança.
          </p>
        </div>

        <label style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '0.88rem',
          color: 'var(--text-main)'
        }}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--primary)', cursor: 'pointer' }}
          />
          <span>Compreendo e aceito os termos de segurança. Desejo utilizar o aplicativo como ferramenta auxiliar para a proteção do meu filho.</span>
        </label>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', opacity: agreed ? 1 : 0.5, cursor: agreed ? 'pointer' : 'not-allowed' }}
          disabled={!agreed}
          onClick={handleConfirm}
        >
          <ShieldCheck size={18} />
          Acessar o Aplicativo
        </button>
      </div>
    </div>
  );
};
