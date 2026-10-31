import React from 'react';
import { BookOpen, ExternalLink, Award } from 'lucide-react';
import { DEFAULT_G6PD_DATABASE } from '../data/defaultRules.ts';

export const AboutScreen: React.FC = () => {
  return (
    <div>
      <div className="card">
        <span className="eyebrow">Transparência e cuidado</span>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={20} color="var(--primary)" />
          Sobre o G6PDApp e Diretrizes Clínicas
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>
          O <strong>G6PDApp</strong> foi idealizado e desenvolvido como uma ferramenta de segurança clínica de <strong>alto interesse pessoal e familiar</strong>, concebido para proteger uma criança com Deficiência de G6PD e compartilhado gratuitamente para apoiar outras famílias, escolas e cuidadores em todo o Brasil.
        </p>

        <div style={{
          background: 'var(--info-bg)',
          border: '1px solid var(--info-border)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--info-text)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Award size={16} />
            Invariante #1: Zero Falsos Negativos
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
            O aplicativo <strong>nunca</strong> depende de uma resposta aberta de IA para dizer que um produto é seguro. Ele utiliza um <strong>Motor de Regras Determinístico</strong> com travas de completude estrutural (que impedem aprovação de fotos cortadas por reflexo) e desambiguação química (que não confunde nutrientes seguros como <em>Sulfato Ferroso</em> com o conservante restrito <em>Sulfito</em>).
          </p>
        </div>

        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
          Entendendo os Dois Protocolos Clínicos
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
          Existe hoje uma distinção técnica entre as diretrizes internacionais baseadas em evidências farmacogenéticas estritas (como <strong>CPIC</strong> e <strong>OMS</strong>) e as condutas pediátricas adotadas no Brasil (<strong>Ministério da Saúde</strong>, <strong>EBSERH</strong>, <strong>APAE</strong> e <strong>Sociedade Brasileira de Pediatria — SBP</strong>):
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>1. Protocolo Pediátrico Brasileiro (SBP / APAE / MS):</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.5' }}>
              Adota uma postura conservadora e preventiva na infância: recomenda a restrição total de <strong>corantes artificiais azoicos (INS 102 a 150d)</strong>, <strong>sulfitos (INS 220-228)</strong> e <strong>Dipirona</strong> para eliminar riscos de reações cruzadas e estresse oxidativo precoce em lactentes e crianças.
            </p>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <strong style={{ color: 'var(--purple-primary)', fontSize: '0.85rem' }}>2. Consenso Internacional (CPIC / OMS / Favismo.it):</strong>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.5' }}>
              Classifica fármacos e substâncias estritamente com base em evidência farmacogenética molecular de indução direta de hemólise aguda (fava, primaquina, dapsona, nitrofurantoína, azul de metileno, rasburicase).
            </p>
          </div>
        </div>

        <h3 style={{ fontSize: '0.92rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
          Fontes Oficiais da Base de Conhecimento
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {DEFAULT_G6PD_DATABASE.sources.map((source, idx) => (
            <a
              key={idx}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                textDecoration: 'none',
                fontSize: '0.82rem',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{source.name}</span>
              <ExternalLink size={14} color="var(--text-muted)" />
            </a>
          ))}
        </div>

        <div style={{
          marginTop: '20px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-dim)'
        }}>
          G6PDApp • Versão da Base: <strong>{DEFAULT_G6PD_DATABASE.rulesVersion}</strong> (Atualizada em {DEFAULT_G6PD_DATABASE.updatedAt})
          <br />
          Feito com carinho e rigor científico de pai para filho.
        </div>
      </div>
    </div>
  );
};
