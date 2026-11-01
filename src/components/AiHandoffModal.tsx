import React, { useState } from 'react';
import { Sparkles, Copy, Check, Share2, ExternalLink, X } from 'lucide-react';
import { AnalysisResult } from '../engine/types.ts';
import { buildAiPrompt, copyToClipboard, shareWithNativeAi, getAiDirectLinks } from '../services/aiHandoff.ts';

interface AiHandoffModalProps {
  analysis: AnalysisResult;
  onClose: () => void;
}

export const AiHandoffModal: React.FC<AiHandoffModalProps> = ({ analysis, onClose }) => {
  const [copied, setCopied] = useState(false);
  const prompt = buildAiPrompt(analysis);
  const links = getAiDirectLinks(prompt);

  const handleCopy = async () => {
    const ok = await copyToClipboard(prompt);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const res = await shareWithNativeAi(prompt);
    if (res.copied) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Consultar Minha IA">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--purple-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Consultar Minha IA</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Contexto clínico pronto para o seu modelo favorito</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar consulta de IA"
            onClick={onClose}
            className="icon-button"
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.5' }}>
          O G6PDA montou um prompt completo com os ingredientes lidos, as substâncias identificadas e os links das diretrizes oficiais (CPIC e SBP). Escolha como deseja abrir:
        </p>

        {/* Botão Principal: Gaveta do Sistema (Android Share Sheet / Intent) */}
        <button
          className="btn btn-ai"
          style={{ width: '100%', marginBottom: '12px', padding: '14px' }}
          onClick={handleNativeShare}
        >
          <Share2 size={18} />
          Escolher Aplicativo de IA (Android / Sistema)
        </button>

        {/* Botões Rápidos Diretos (Deep Links para abrir já com a pergunta) */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Ou abra direto com 1 clique:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <a
              href={links.chatgpt}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ textDecoration: 'none', fontSize: '0.82rem', padding: '10px' }}
            >
              <span>💬 ChatGPT</span>
              <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
            </a>
            <a
              href={links.perplexity}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ textDecoration: 'none', fontSize: '0.82rem', padding: '10px' }}
            >
              <span>🔍 Perplexity</span>
              <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
            </a>
            <a
              href={links.claude}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ textDecoration: 'none', fontSize: '0.82rem', padding: '10px' }}
            >
              <span>🧠 Claude</span>
              <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
            </a>
            <a
              href={links.geminiWeb}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ textDecoration: 'none', fontSize: '0.82rem', padding: '10px' }}
              onClick={handleCopy}
            >
              <span>✨ Gemini Web</span>
              <ExternalLink size={14} style={{ marginLeft: 'auto' }} />
            </a>
          </div>
        </div>

        {/* Visualização e Cópia do Prompt */}
        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Texto do Super-Prompt
            </span>
            <button
              onClick={handleCopy}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
            >
              {copied ? <Check size={14} color="var(--green-border)" /> : <Copy size={14} />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>
          <pre style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            maxHeight: '130px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {prompt}
          </pre>
        </div>

        <button
          className="btn btn-secondary"
          style={{ width: '100%' }}
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
