import React, { useState, useMemo } from 'react';
import { Search, Pill } from 'lucide-react';
import { G6PDRule, ProfileMode } from '../engine/types.ts';
import { getActiveRulesDatabase } from '../services/rulesSync.ts';
import { normalizeText } from '../engine/normalizer.ts';

interface DrugSearchScreenProps {
  profileMode: ProfileMode;
}

export const DrugSearchScreen: React.FC<DrugSearchScreenProps> = ({ profileMode }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = [
    { id: 'ALL', label: 'Todos' },
    { id: 'DRUG', label: 'Medicamentos' },
    { id: 'DYE', label: 'Corantes (INS)' },
    { id: 'SULFITE', label: 'Sulfitos' },
    { id: 'FOOD', label: 'Alimentos' },
    { id: 'CHEM', label: 'Químicos / Cosméticos' }
  ];

  const filteredRules = useMemo(() => {
    const qNorm = normalizeText(query);

    return getActiveRulesDatabase().rules.filter((rule: G6PDRule) => {
      // Filtro de categoria
      if (selectedCategory === 'DRUG' && !rule.category.startsWith('DRUG_')) return false;
      if (selectedCategory === 'DYE' && !rule.category.startsWith('DYE_')) return false;
      if (selectedCategory === 'SULFITE' && rule.category !== 'SULFITE') return false;
      if (selectedCategory === 'FOOD' && rule.category !== 'FOOD_BEVERAGE') return false;
      if (selectedCategory === 'CHEM' && rule.category !== 'HOUSEHOLD_CHEMICAL') return false;

      if (!qNorm) return true;

      // Busca por nome, código INS, e-number ou sinônimos
      const nameNorm = normalizeText(rule.name);
      if (nameNorm.includes(qNorm)) return true;

      if (rule.insCode && rule.insCode.includes(qNorm)) return true;
      if (rule.eNumber && rule.eNumber.toLowerCase().includes(qNorm)) return true;

      return rule.synonyms.some(s => normalizeText(s).includes(qNorm));
    });
  }, [query, selectedCategory]);

  return (
    <div>
      <div className="card">
        <span className="eyebrow">Catálogo clínico</span>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Pill size={20} color="var(--primary)" />
          Consulta de Medicamentos e Corantes (INS)
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Pesquise por nome comercial (ex: <em>Novalgina, Bactrim, Alivium</em>), princípio ativo ou código INS (ex: <em>102, 110, 150d</em>).
        </p>

        {/* Campo de Busca */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={18} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            aria-label="Buscar medicamento, substância ou código"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o nome ou código..."
            style={{
              width: '100%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-main)',
              padding: '10px 12px 10px 38px',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-sans)'
            }}
          />
        </div>

        {/* Filtros de Categoria */}
        <div className="catalog-filters">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              aria-pressed={selectedCategory === cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? 'var(--primary)' : 'var(--bg-card-subtle)',
                color: selectedCategory === cat.id ? '#ffffff' : 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Resultados */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600, paddingLeft: '4px' }}>
          {filteredRules.length} item(ns) encontrado(s)
        </div>

        {filteredRules.map((rule) => {
          let effectiveRisk = rule.riskLevel;
          if (profileMode === 'GLOBAL_CPIC' && rule.protocolSource === 'BRAZIL_SBP_APAE') {
            effectiveRisk = 'CAUTION';
          } else if (profileMode === 'STRICT_ZERO_DYES' && rule.category === 'DYE_NATURAL') {
            effectiveRisk = 'RESTRICTED_BR';
          }

          const isRed = effectiveRisk === 'HIGH_RISK' || effectiveRisk === 'RESTRICTED_BR';
          const isYellow = effectiveRisk === 'CAUTION';

          return (
            <div
              key={rule.id}
              className="card"
              style={{
                marginBottom: '0',
                borderLeft: `4px solid ${isRed ? 'var(--red-border)' : isYellow ? 'var(--yellow-border)' : 'var(--green-border)'}`
              }}
            >
              <div className="rule-card-heading">
                <div>
                  <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {rule.name}
                  </h3>
                  <div className="rule-metadata">
                    {rule.insCode && <span>INS: <strong>{rule.insCode}</strong></span>}
                    {rule.eNumber && <span>E-Number: <strong>{rule.eNumber}</strong></span>}
                    <span>Fonte: <strong>{rule.protocolSource}</strong></span>
                  </div>
                </div>

                <span className={`badge ${isRed ? 'badge-red' : isYellow ? 'badge-yellow' : 'badge-green'}`}>
                  {effectiveRisk}
                </span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '8px' }}>
                {rule.clinicalMechanism}
              </p>

              {/* Alerta de Excipientes Pediátricos */}
              {rule.pediatricSyrupWarning && (
                <div style={{
                  background: 'var(--info-bg)',
                  border: '1px solid var(--info-border)',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '0.78rem',
                  color: 'var(--info-text)',
                  marginBottom: '8px'
                }}>
                  <strong>⚠️ Alerta de Apresentação Pediátrica:</strong> {rule.pediatricSyrupWarning}
                </div>
              )}

              {/* Sinônimos */}
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                <strong>Também conhecido por:</strong> {rule.synonyms.slice(0, 6).join(', ')}
                {rule.synonyms.length > 6 && ` (+${rule.synonyms.length - 6})`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
