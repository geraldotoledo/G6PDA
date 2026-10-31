import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Search,
  RotateCcw,
  Camera,
  Barcode,
  Plus,
  Info,
  Check,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';
import { AnalysisResult, ProfileMode } from '../engine/types.ts';
import { analyzeIngredientsText } from '../engine/ruleEngine.ts';
import { AiHandoffModal } from './AiHandoffModal.tsx';
import { BarcodeScannerModal } from './BarcodeScannerModal.tsx';
import { preprocessLabelImage, extractTextFromPreprocessedImage } from '../services/imageOcr.ts';
import { addPantryItem } from '../services/pantryStorage.ts';
import {
  startVoiceListening,
  speakVerdict,
  isVoiceRecognitionSupported,
  isSpeechSynthesisSupported
} from '../services/voiceAssistant.ts';

interface ScannerScreenProps {
  profileMode: ProfileMode;
  initialText?: string;
  onClearInitialText?: () => void;
}

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  profileMode,
  initialText = '',
  onClearInitialText
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [savedToPantry, setSavedToPantry] = useState(false);
  const [showSavePantryForm, setShowSavePantryForm] = useState(false);
  const [pantryProductName, setPantryProductName] = useState('');
  const [pantryProductBrand, setPantryProductBrand] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceStopFn, setVoiceStopFn] = useState<(() => void) | null>(null);

  const handleToggleVoice = () => {
    if (isListening) {
      voiceStopFn?.();
      setIsListening(false);
      setVoiceStopFn(null);
    } else {
      setIsListening(true);
      const stop = startVoiceListening(
        (transcript) => {
          setInputText(transcript);
          setIsListening(false);
          setVoiceStopFn(null);
        },
        (err) => {
          alert(err);
          setIsListening(false);
          setVoiceStopFn(null);
        },
        () => {
          setIsListening(false);
          setVoiceStopFn(null);
        }
      );
      setVoiceStopFn(() => stop);
    }
  };

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
      onClearInitialText?.();
    }
  }, [initialText, onClearInitialText]);

  // Amostras reais para teste rápido
  const sampleRealBiscuits = [
    {
      label: 'Biscoito c/ Sulfito e TBHQ (Real)',
      text: 'INGREDIENTES: Farinha de trigo enriquecida com ferro e ácido fólico, açúcar, gordura vegetal hidrogenada, amido de milho, sal, conservador metabissulfito de sódio (INS 223), antioxidante TBHQ (INS 319) e aromatizante. ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO E SOJA. CONTÉM GLÚTEN.'
    },
    {
      label: 'Piraquê Maltado c/ Caramelo IV (Real)',
      text: 'Ingredientes: Farinha de trigo enriquecida com ferro e ácido fólico, açúcar refinado, gordura vegetal, extrato de malte, corante caramelo IV (processo sulfito-amônia), corante natural urucum, corante natural cúrcuma, sal e fermentos químicos. ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO E CEVADA. CONTÉM GLÚTEN.'
    },
    {
      label: 'Piraquê Coco Seguro (Real)',
      text: 'INGREDIENTES: Farinha de trigo enriquecida com ferro e ácido fólico, açúcar, gordura vegetal, coco ralado desidratado, amido de milho, sal, fermentos químicos e aromatizante. ALÉRGICOS: CONTÉM DERIVADOS DE TRIGO. CONTÉM GLÚTEN.'
    },
    {
      label: 'Farinha c/ Sulfato Ferroso (Safe Lookalike)',
      text: 'Ingredientes: Farinha de trigo, açúcar, sulfato ferroso (ferro), sulfato de zinco (zinco), vitamina K1 (fitomenadiona), sal e aromatizante. ALÉRGICOS: CONTÉM TRIGO. CONTÉM GLÚTEN.'
    },
    {
      label: 'Ibuprofeno Pediátrico (Bula)',
      text: 'Composição: Cada ml de suspensão oral contém 100 mg de Ibuprofeno. Veículo/Excipientes: sorbitol, benzoato de sódio, aroma de morango, ácido cítrico e água purificada.'
    }
  ];

  const analysis: AnalysisResult | null = useMemo(() => {
    return inputText.trim()
      ? analyzeIngredientsText(inputText, { profileMode })
      : null;
  }, [inputText, profileMode]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsOcrProcessing(true);
      setOcrProgress(10);
      setOcrError(null);

      const processed = await preprocessLabelImage(file);
      setPhotoPreview(processed.processedDataUrl);
      setOcrProgress(25);

      const extractedText = await extractTextFromPreprocessedImage(
        processed.processedDataUrl,
        (progress) => setOcrProgress(25 + Math.round(progress * 0.75))
      );

      if (extractedText && extractedText.trim()) {
        setInputText(extractedText.trim());
      } else {
        setOcrError('Nenhum texto legível foi detectado na foto. Tente aproximar da lista de ingredientes ou digite o texto.');
      }
    } catch (err) {
      console.error('Falha no pré-processamento/OCR da imagem:', err);
      setOcrError('Não foi possível ler o texto automaticamente. Você pode digitar ou colar os ingredientes abaixo.');
    } finally {
      setIsOcrProcessing(false);
      e.target.value = '';
    }
  };

  const handleSaveToPantry = () => {
    if (!inputText.trim()) return;

    const fallbackName = inputText.trim().split('\n')[0].substring(0, 40);
    const finalName = pantryProductName.trim() || fallbackName || 'Produto Validado';
    const finalBrand = pantryProductBrand.trim() || 'Marca conferida';

    addPantryItem({
      name: finalName,
      brand: finalBrand,
      ingredients: inputText.trim(),
      notes: 'Adicionado após veredito 100% verde no Scanner'
    });

    setSavedToPantry(true);
    setShowSavePantryForm(false);
    setPantryProductName('');
    setPantryProductBrand('');
    setTimeout(() => setSavedToPantry(false), 2500);
  };

  const renderHighlightedText = () => {
    if (!analysis || !inputText) return null;

    const normalized = analysis.normalizedText;
    const spans = [...analysis.highlightSpans];

    if (spans.length === 0) {
      return <span>{inputText}</span>;
    }

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    spans.forEach((span, index) => {
      if (span.start > lastIdx) {
        elements.push(<span key={`text-${index}`}>{normalized.substring(lastIdx, span.start)}</span>);
      }

      let className = 'hl-yellow';
      if (span.type === 'RED') className = 'hl-red';
      if (span.type === 'SAFE_LOOKALIKE') className = 'hl-safe';

      elements.push(
        <mark
          key={`span-${index}`}
          className={className}
          title={span.message || span.ruleName || ''}
        >
          {normalized.substring(span.start, span.end)}
        </mark>
      );

      lastIdx = Math.max(lastIdx, span.end);
    });

    if (lastIdx < normalized.length) {
      elements.push(<span key="text-end">{normalized.substring(lastIdx)}</span>);
    }

    return elements;
  };

  return (
    <div>
      <div className="screen-intro scanner-intro">
        <span className="eyebrow">Cuidado vigilante</span>
        <h2>Vamos conferir o rótulo?</h2>
        <p>Consulte os ingredientes com o perfil de proteção selecionado.</p>
      </div>
      <section className="scanner-hero" aria-labelledby="capture-title">
        <Camera size={64} className="scanner-hero-icon" aria-hidden="true" />
        <span className="eyebrow">Leitura preventiva</span>
        <h3 id="capture-title">Checar composição</h3>
        <p>Fotografe o rótulo ou a bula, consulte um código de barras ou digite o texto abaixo.</p>
        <div className="capture-actions">
          <label className="btn capture-photo">
            <Camera size={20} aria-hidden="true" />
            Foto do Rótulo
            <input
              className="capture-file"
              type="file"
              accept="image/*"
              capture="environment"
              aria-label="Foto do Rótulo"
              onChange={handlePhotoUpload}
              disabled={isOcrProcessing}
            />
          </label>
          <button type="button" className="btn capture-barcode" onClick={() => setShowBarcodeModal(true)}>
            <Barcode size={18} aria-hidden="true" />
            Código de Barras (EAN)
          </button>
        </div>
      </section>

      {/* Prévia da Imagem Otimizada */}
      {photoPreview && (
        <div className="card" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
              Foto com Alto Contraste (Anti-Reflexo)
            </span>
            <button
              onClick={() => setPhotoPreview(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '0.75rem', cursor: 'pointer' }}
            >
              Fechar Prévia
            </button>
          </div>
          <img
            src={photoPreview}
            alt="Rótulo pré-processado"
            style={{ width: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Ajustamos o contraste para facilitar a leitura das letras miúdas. Digite ou cole o texto abaixo.
          </div>
        </div>
      )}

      {/* Indicador de Processamento OCR */}
      {isOcrProcessing && (
        <div style={{
          background: 'var(--info-bg)',
          border: '1px solid var(--info-border)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          color: 'var(--primary)'
        }}>
          <div style={{
            width: '14px',
            height: '14px',
            border: '2px solid var(--primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'spin 1s linear infinite'
          }} />
          <span>🔍 Lendo ingredientes da foto... {ocrProgress}%</span>
        </div>
      )}

      {/* Alerta de Falha/Aviso de OCR */}
      {ocrError && (
        <div style={{
          background: 'var(--red-bg)',
          border: '1px solid var(--red-border)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '14px',
          fontSize: '0.82rem',
          color: 'var(--red-text)'
        }}>
          {ocrError}
        </div>
      )}

      {/* Caixa de Entrada de Texto do Rótulo */}
      <div className="card">
        <div className="input-toolbar">
          <label htmlFor="label-text">
            <Search size={16} />
            Texto do Rótulo ou Bula
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {isVoiceRecognitionSupported() && (
              <button
                onClick={handleToggleVoice}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '6px', background: isListening ? 'var(--red-border)' : undefined }}
                title="Ditar pergunta ou ingredientes por voz"
              >
                {isListening ? <MicOff size={14} color="white" /> : <Mic size={14} />}
                <span>{isListening ? 'Ouvindo...' : 'Falar'}</span>
              </button>
            )}
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '6px' }}
              >
                <RotateCcw size={12} />
                Limpar
              </button>
            )}
          </div>
        </div>

        <textarea
          id="label-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Cole aqui o texto do rótulo, bula ou use o leitor de código de barras acima..."
          rows={4}
          style={{
            width: '100%',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            color: 'var(--text-main)',
            padding: '12px',
            fontSize: '0.88rem',
            fontFamily: 'var(--font-sans)',
            resize: 'vertical',
            lineHeight: '1.5'
          }}
        />

        <details style={{ marginTop: '12px' }}>
          <summary style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer', padding: '10px 0' }}>
            Exemplos Reais para Teste
          </summary>
          <div className="sample-list">
            {sampleRealBiscuits.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(sample.text)}
                type="button"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </details>
      </div>

      <div className="privacy-note">
        <Info size={18} aria-hidden="true" />
        <p>A análise textual usa as regras disponíveis no aparelho. Confira sempre a composição na embalagem física.</p>
      </div>
      {/* Veredito do Semáforo */}
      {analysis && (
        <>
          <div className="screen-intro">
            <span className="eyebrow">Resultado da verificação</span>
            <h2>Análise da composição</h2>
          </div>
          <div className={`traffic-banner ${
            analysis.status === 'RED_BLOCKED' ? 'red' :
            analysis.status === 'YELLOW_ATTENTION' || analysis.status === 'YELLOW_INCOMPLETE_SCAN' ? 'yellow' : 'green'
          }`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {analysis.status === 'RED_BLOCKED' && <AlertOctagon size={36} color="var(--red-border)" />}
                {(analysis.status === 'YELLOW_ATTENTION' || analysis.status === 'YELLOW_INCOMPLETE_SCAN') && (
                  <AlertTriangle size={36} color="var(--yellow-border)" />
                )}
                {analysis.status === 'GREEN_SAFE' && <CheckCircle2 size={36} color="var(--green-border)" />}

                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                    {analysis.statusTitle}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '2px', opacity: 0.9 }}>
                    {analysis.summary}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSpeechSynthesisSupported() && (
                  <button
                    onClick={() => speakVerdict(`${analysis.statusTitle}. ${analysis.summary}`)}
                    className="btn btn-secondary no-print"
                    style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
                    title="Ouvir veredito em voz alta"
                  >
                    <Volume2 size={16} />
                    <span className="no-print">Ouvir</span>
                  </button>
                )}
                <span className={`badge ${
                  analysis.status === 'RED_BLOCKED' ? 'badge-red' :
                  analysis.status === 'YELLOW_ATTENTION' || analysis.status === 'YELLOW_INCOMPLETE_SCAN' ? 'badge-yellow' : 'badge-green'
                }`}>
                  {analysis.statusBadge}
                </span>
              </div>
            </div>
          </div>

          {/* Alerta de Leitura Incompleta (Blindagem 1) */}
          {analysis.status === 'YELLOW_INCOMPLETE_SCAN' && (
            <div className="card" style={{ borderLeft: '4px solid var(--yellow-border)', background: 'var(--yellow-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Info size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.84rem', lineHeight: '1.5' }}>
                  <strong>Conferência pendente:</strong> Não foi possível confirmar uma lista completa e legível de ingredientes ou excipientes. Este resultado não libera o produto.
                  <br />
                  <em>Compare o texto com o rótulo físico e faça uma nova leitura da lista inteira, sem cortes ou reflexos.</em>
                </div>
              </div>
            </div>
          )}

          {/* Alerta de Excipientes em Medicamentos Pediátricos (Blindagem 3) */}
          {analysis.pediatricSyrupAlerts.length > 0 && (
            <div className="card" style={{ borderLeft: '4px solid var(--info-border)', background: 'var(--info-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Info size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--info-text)', marginBottom: '4px' }}>
                    Atenção aos Excipientes Pediátricos
                  </div>
                  {analysis.pediatricSyrupAlerts.map((alert, idx) => (
                    <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                      {alert}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Botão de Destaque: Analisar a Fundo com Minha IA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            <button
              className="btn btn-ai"
              style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
              onClick={() => setShowAiModal(true)}
            >
              <Sparkles size={20} />
              ✨ Analisar a Fundo com Minha IA (Gemini, ChatGPT, Claude)
            </button>

            {analysis.status === 'GREEN_SAFE' && (
              <div style={{ width: '100%' }}>
                {!showSavePantryForm ? (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', background: 'var(--green-border)' }}
                    onClick={() => setShowSavePantryForm(true)}
                    disabled={savedToPantry}
                  >
                    {savedToPantry ? <Check size={18} /> : <Plus size={18} />}
                    {savedToPantry ? 'Salvo na Despensa da Família!' : 'Salvar este Alimento na Despensa Segura'}
                  </button>
                ) : (
                  <div style={{
                    background: 'var(--green-bg)',
                    border: '1px solid var(--green-border)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    textAlign: 'left'
                  }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green-border)' }}>
                      Identificação para a Despensa Segura
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                        Nome do Alimento / Produto:
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Ex.: Biscoito Maria, Pão de Forma..."
                        value={pantryProductName}
                        onChange={(e) => setPantryProductName(e.target.value)}
                        style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                        Marca do Fabricante:
                      </label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Ex.: Bauducco, Wickbold..."
                        value={pantryProductBrand}
                        onChange={(e) => setPantryProductBrand(e.target.value)}
                        style={{ width: '100%', padding: '8px', fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '10px', background: 'var(--green-border)' }}
                        onClick={handleSaveToPantry}
                      >
                        <Check size={16} /> Confirmar e Salvar
                      </button>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '10px 14px' }}
                        onClick={() => setShowSavePantryForm(false)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Texto com Destaque Colorido */}
          <div className="card">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Texto Analisado e Destaques
            </h4>
            <div className="highlight-box">
              {renderHighlightedText()}
            </div>
            <div className="result-legend">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--red-border)', borderRadius: '2px', display: 'inline-block' }}></span>
                Proibido / Restrito
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--yellow-border)', borderRadius: '2px', display: 'inline-block' }}></span>
                Cautela / Ambíguo
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '10px', height: '10px', background: 'var(--green-border)', borderRadius: '2px', display: 'inline-block' }}></span>
                Nutriente Seguro (Não é sulfito)
              </span>
            </div>
          </div>

          {/* Detalhamento das Regras Disparadas */}
          {analysis.matches.length > 0 && (
            <div className="card">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                Substâncias Identificadas ({analysis.matches.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {analysis.matches.map((match, idx) => (
                  <div
                    key={idx}
                    className="rule-card"
                  >
                    <div className="rule-card-heading">
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {match.rule.name}
                      </span>
                      <span className={`badge ${
                        match.effectiveRisk === 'HIGH_RISK' || match.effectiveRisk === 'RESTRICTED_BR'
                          ? 'badge-red'
                          : match.effectiveRisk === 'CAUTION' ? 'badge-yellow' : 'badge-green'
                      }`}>
                        {match.effectiveRisk}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      {match.rule.clinicalMechanism}
                    </p>

                    <div className="rule-metadata">
                      <span>Fonte: <strong>{match.rule.protocolSource}</strong></span>
                      {match.rule.insCode && <span>• INS: <strong>{match.rule.insCode}</strong></span>}
                      {match.rule.eNumber && <span>• E-Number: <strong>{match.rule.eNumber}</strong></span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Falsos Amigos Seguros Reconhecidos */}
          {analysis.safeLookalikesDetected.length > 0 && (
            <div className="card">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--green-text)', marginBottom: '10px', textTransform: 'uppercase' }}>
                Nutrientes Seguros Reconhecidos ({analysis.safeLookalikesDetected.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {analysis.safeLookalikesDetected.map((safe, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--green-bg)',
                      border: '1px solid var(--green-border)',
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '0.8rem'
                    }}
                  >
                    <strong style={{ color: 'var(--green-text)' }}>{safe.term}:</strong> {safe.explanation}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Handoff para IA */}
      {showAiModal && analysis && (
        <AiHandoffModal
          analysis={analysis}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {/* Modal de Leitor de Código de Barras */}
      {showBarcodeModal && (
        <BarcodeScannerModal
          profileMode={profileMode}
          onClose={() => setShowBarcodeModal(false)}
          onSelectIngredientsForScan={(text) => {
            setInputText(text);
          }}
        />
      )}
    </div>
  );
};
