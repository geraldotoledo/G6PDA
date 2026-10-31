import React, { useState } from 'react';
import { AlertCircle, Printer, Share2, Save, Check } from 'lucide-react';

export const EmergencyCardScreen: React.FC = () => {
  // Carregar dados salvos no aparelho
  const [childName, setChildName] = useState(() => localStorage.getItem('g6pd_child_name') || '');
  const [childWeight, setChildWeight] = useState(() => localStorage.getItem('g6pd_child_weight') || '');
  const [bloodType, setBloodType] = useState(() => localStorage.getItem('g6pd_blood_type') || '');
  const [doctorContact, setDoctorContact] = useState(() => localStorage.getItem('g6pd_doctor_contact') || '');
  const [parentContact, setParentContact] = useState(() => localStorage.getItem('g6pd_parent_contact') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('g6pd_child_name', childName);
    localStorage.setItem('g6pd_child_weight', childWeight);
    localStorage.setItem('g6pd_blood_type', bloodType);
    localStorage.setItem('g6pd_doctor_contact', doctorContact);
    localStorage.setItem('g6pd_parent_contact', parentContact);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Montar texto para envio rápido no WhatsApp da escola/cuidadores
  const handleShareWhatsApp = () => {
    const text = `🚨 *ALERTA MÉDICO ESCOLAR / PRONTO-SOCORRO: DEFICIÊNCIA DE G6PD (CID-10: D55.0)*

*Nome da Criança:* ${childName || '[Nome da Criança]'}
*Peso Atual:* ${childWeight ? `${childWeight} kg` : '[Peso]'} | *Tipo Sanguíneo:* ${bloodType || '[Tipo]'}
*Contatos dos Pais:* ${parentContact || '[Telefones]'}
*Médico/Hematologista:* ${doctorContact || '[Contato Médico]'}

⚠️ *ATENÇÃO: RISCO DE ANEMIA HEMOLÍTICA AGUDA*
Esta criança possui Deficiência enzimática de G6PD nos glóbulos vermelhos.

❌ *NUNCA OFERECER / PROIBIDO:*
1. *Alimentos:* Feijão-fava (Vicia faba - inclusive farinhas), Água tônica (quinina) e alimentos com corantes artificiais (Tartrazina INS 102, Amarelo Crepúsculo INS 110, Vermelho 40 INS 129, Caramelo IV INS 150d) ou Sulfitos (INS 220-228).
2. *Medicamentos proibidos:* Dipirona (Novalgina), AAS/Aspirina, Sulfas (Bactrim), Nitrofurantoína e Azul de Metileno.
3. *Produtos químicos:* Naftalina (bolinhas antimofo - nem inalar o cheiro!), Henna preta e tintas faciais sintéticas.

✅ *PARA FEBRE OU DOR (SEMPRE SEM CORANTE NO XAROPE):*
• Ibuprofeno ou Paracetamol (estritamente na dose médica correta). Preferir gotas incolores.

🚨 *SINAIS DE EMERGÊNCIA (IR AO PRONTO-SOCORRO IMEDIATAMENTE):*
• Urina escura (cor de chá preto, café ou refrigerante de cola)
• Olhos ou pele amarelados (icterícia)
• Palidez súbita nos lábios/gengivas ou cansaço/sonolência excessiva

_Gerado via G6PDApp • Base Oficial CPIC & Sociedade Brasileira de Pediatria (SBP)_`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <div className="screen-intro no-print">
        <span className="eyebrow">Informações sempre à mão</span>
        <h2>Cartão de emergência</h2>
        <p>Dados salvos neste aparelho para compartilhar com cuidadores.</p>
      </div>
      {/* Botões de Ação no Topo */}
      <div className="no-print" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <button
          className="btn btn-primary"
          style={{ padding: '12px', fontSize: '0.86rem', background: 'var(--green-border)' }}
          onClick={handleShareWhatsApp}
        >
          <Share2 size={16} />
          Enviar no WhatsApp
        </button>
        <button
          className="btn btn-secondary"
          style={{ padding: '12px', fontSize: '0.86rem' }}
          onClick={() => window.print()}
        >
          <Printer size={16} />
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Cartão de Emergência Imprimível */}
      <div className="card emergency-card">
        {/* Cabeçalho do Cartão */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          paddingBottom: '14px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '16px'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'var(--red-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0
          }}>
            <AlertCircle size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--red-text)' }}>
              ALERTA MÉDICO: DEFICIÊNCIA DE G6PD
            </h2>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              CID-10: D55.0 • Cartão de Bolso, Escola e Pronto-Socorro
            </div>
          </div>
        </div>

        {/* Dados da Criança (Editáveis) */}
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Dados da Criança (Salvos no Aparelho)
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Nome da Criança</label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="Nome completo..."
              style={{
                width: '100%',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-main)',
                padding: '6px 8px',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Peso Atual (kg)</label>
              <input
                type="text"
                value={childWeight}
                onChange={(e) => setChildWeight(e.target.value)}
                placeholder="Ex: 18.5"
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '6px 8px',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Tipo Sang.</label>
              <input
                type="text"
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                placeholder="Ex: O+"
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '6px 8px',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Telefone dos Pais</label>
              <input
                type="text"
                value={parentContact}
                onChange={(e) => setParentContact(e.target.value)}
                placeholder="(DDD) 99999-9999"
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '6px 8px',
                  fontSize: '0.85rem'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Médico / Hematologista</label>
              <input
                type="text"
                value={doctorContact}
                onChange={(e) => setDoctorContact(e.target.value)}
                placeholder="Dr(a)... Tel: ..."
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-main)',
                  padding: '6px 8px',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="btn btn-secondary no-print"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            {saved ? <Check size={14} color="var(--green-border)" /> : <Save size={14} />}
            {saved ? 'Dados Salvos!' : 'Salvar Dados'}
          </button>
        </div>

        {/* 5 Sinais de Emergência de Crise Hemolítica */}
        <div style={{
          background: 'var(--red-bg)',
          border: '1px solid var(--red-border)',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '16px'
        }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--red-text)', marginBottom: '8px' }}>
            🚨 SINAIS DE ALERTA DE CRISE HEMOLÍTICA (IR AO PRONTO-SOCORRO):
          </h3>
          <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
            <li><strong>Urina escura:</strong> Cor de refrigerante de cola, café ou chá preto (hemoglobinúria).</li>
            <li><strong>Icterícia:</strong> Parte branca dos olhos ou pele amareladas.</li>
            <li><strong>Palidez súbita:</strong> Lábios, gengivas e palma das mãos muito brancos.</li>
            <li><strong>Cansaço extremo:</strong> Moleza excessiva, sonolência incomum ou coração acelerado.</li>
            <li><strong>Dor abdominal ou dor lombar nas costas.</strong></li>
          </ul>
        </div>

        {/* Resumo Rápido de Proibições para Pronto-Socorro */}
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
            Medicamentos e Substâncias Proibidas (Urgência)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem' }}>
            <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--red-border)' }}>❌ Analgésicos Proibidos:</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Dipirona (Metamizol), AAS/Aspirina, Fenazopiridina (Pyridium).</div>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--red-border)' }}>❌ Antibióticos Proibidos:</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Sulfas (Bactrim/Sulfametoxazol), Nitrofurantoína (Macrodantina), Ácido Nalidíxico.</div>
            </div>
            <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <strong style={{ color: 'var(--red-border)' }}>❌ Outros Proibidos:</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Azul de Metileno, Primaquina, Tafenoquina, Rasburicase, Vitamina K3.</div>
            </div>
            <div style={{ background: 'var(--green-bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--green-border)' }}>
              <strong style={{ color: 'var(--green-border)' }}>✅ Opções Seguras para Febre:</strong>
              <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Ibuprofeno ou Paracetamol (em dose habitual e preferindo gotas incolores sem corante).</div>
            </div>
          </div>
        </div>

        {/* Proibições Escolares e Festas */}
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
          <strong>Regra de Ouro para a Escola:</strong> Não oferecer feijão-fava, alimentos com corantes artificiais (balas coloridas, refrigerantes, gelatinas), nem aplicar tatuagens de henna preta ou pintura facial química sem conferência prévia com os pais.
        </div>
      </div>
    </div>
  );
};
