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

export type InputSourceChannel = 'TEXT' | 'VOICE' | 'PHOTO_OCR' | 'BARCODE';

const COMMON_FOOD_WORDS = new Set([
  'ingredientes', 'ingrediente', 'composicao', 'contem', 'alergicos', 'derivados', 'gluten', 'lactose',
  'farinha', 'trigo', 'enriquecida', 'ferro', 'acido', 'folico', 'acucar', 'refinado', 'cristal', 'mascavo',
  'gordura', 'vegetal', 'hidrogenada', 'oleo', 'soja', 'girassol', ' palma', 'canola', 'milho', 'amido',
  'sal', 'marinho', 'agua', 'leite', 'integral', 'desnatado', 'soro', 'po', 'ovo', 'ovos', 'clara', 'gema',
  'cacau', 'massa', 'manteiga', 'chocolate', 'coco', 'ralado', 'desidratado', 'aveia', 'centeio', 'cevada',
  'malte', 'extrato', 'arroz', 'polvilho', 'mandioca', 'fécula', 'fecula', 'batata', 'aromatizante', 'aroma',
  'natural', 'identico', 'artificial', 'fermento', 'fermentos', 'quimicos', 'quimico', 'biologico',
  'bicarbonato', 'sodio', 'amonio', 'calcio', 'potassio', 'zinco', 'vitamina', 'vitaminas', 'minerais',
  'emulsificante', 'lecitina', 'estabilizante', 'espessante', 'conservador', 'conservante', 'antioxidante',
  'acidulante', 'regulador', 'acidez', 'edulcorante', 'corante', 'urucum', 'curcuma', 'beterraba', 'caramelo',
  'sorbitol', 'manitol', 'xilitol', 'sucralose', 'stevia', 'goma', 'xantana', 'guar', 'pectina', 'gelatina',
  'polpa', 'suco', 'fruta', 'morango', 'laranja', 'limao', 'uva', 'maca', 'banana', 'baunilha', 'mel',
  'suspensao', 'oral', 'cada', 'ml', 'mg', 'gotas', 'comprimido', 'capsula', 'veiculo', 'excipientes',
  'excipiente', 'purificada', 'benzoato', 'citrico', 'ascorbico', 'latico', 'tartarico', 'fosforico',
  'propionato', 'sorbato', 'nisina', 'natamicina', 'tocofeois', 'tocoferol', 'palmitato', 'ascorbila',
  'ferroso', 'ferrico', 'oxido', 'pirofosfato', 'cobalamina', 'riboflavina', 'tiamina', 'niacina',
  'piridoxina', 'biotina', 'pantotenato', 'fitomenadiona', 'colecalciferol', 'retinol', 'com', 'sem',
  'de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'em', 'para', 'por', 'no', 'na', 'nos', 'nas', 'um', 'uma'
]);

export const ScannerScreen: React.FC<ScannerScreenProps> = ({
  profileMode,
  initialText = '',
  onClearInitialText
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [inputSource, setInputSource] = useState<InputSourceChannel>('TEXT');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);
  const [showBarcodeForPantryFill, setShowBarcodeForPantryFill] = useState(false);
  const [savedToPantry, setSavedToPantry] = useState(false);
  const [showSavePantryForm, setShowSavePantryForm] = useState(false);
  const [pantryProductName, setPantryProductName] = useState('');
  const [pantryProductBrand, setPantryProductBrand] = useState('');
  const [pantryProductBarcode, setPantryProductBarcode] = useState('');
  const [pantryProductNotes, setPantryProductNotes] = useState('Validado no Scanner G6PDA');
  const [pantryLookupNotice, setPantryLookupNotice] = useState<string | null>(null);
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
          setInputSource('VOICE');
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
      setInputSource('TEXT');
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

  // Auditoria de Voz / Lista Ditada e Apresentação Coerente com o Canal de Entrada
  const voiceAudit = useMemo(() => {
    if (!analysis || !inputText.trim()) return null;

    const recognizedSafeNames: string[] = [
      ...analysis.safeLookalikesDetected.map(s => s.term),
      ...analysis.safeActiveDrugsDetected.map(m => m.rule.name),
      ...analysis.matches.filter(m => m.effectiveRisk === 'SAFE').map(m => m.rule.name)
    ];

    const hasSulfatoHomophoneRisk = analysis.safeLookalikesDetected.some(s =>
      s.term.toLowerCase().includes('sulfato')
    );

    // Identificar palavras faladas que não estão no vocabulário comum nem nas regras/lookalikes
    const normalizedWords = analysis.normalizedText
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 4);

    const matchedRuleWords = new Set<string>();
    analysis.matches.forEach(m => {
      m.matchedTerm.toLowerCase().split(/\s+/).forEach(w => matchedRuleWords.add(w));
      m.rule.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/).forEach(w => matchedRuleWords.add(w));
    });
    analysis.safeLookalikesDetected.forEach(s => {
      s.term.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/).forEach(w => matchedRuleWords.add(w));
    });

    const unrecognizedTokens = Array.from(new Set(
      normalizedWords.filter(w => !COMMON_FOOD_WORDS.has(w) && !matchedRuleWords.has(w))
    ));

    return {
      recognizedSafeNames: Array.from(new Set(recognizedSafeNames)),
      hasSulfatoHomophoneRisk,
      unrecognizedTokens
    };
  }, [analysis, inputText]);

  const displayVerdict = useMemo(() => {
    if (!analysis) return null;

    const safeNames = voiceAudit?.recognizedSafeNames || [];

    if (inputSource === 'VOICE') {
      if (analysis.status === 'RED_BLOCKED') {
        const redNames = analysis.matches
          .filter(m => m.effectiveRisk === 'HIGH_RISK' || m.effectiveRisk === 'RESTRICTED_BR')
          .map(m => m.rule.name);
        return {
          visualColor: 'red' as const,
          title: '🔴 NÃO CONSUMIR — Ingredientes Mencionados Não São Seguros',
          badge: 'PROIBIDO (VOZ)',
          summary: `Entre os ingredientes mencionados por voz, foi identificada substância restrita para G6PD (${redNames.join(', ')}).`
        };
      }
      if (analysis.status === 'YELLOW_ATTENTION') {
        const yellowNames = analysis.matches
          .filter(m => m.effectiveRisk === 'CAUTION')
          .map(m => m.rule.name);
        return {
          visualColor: 'yellow' as const,
          title: '🟡 ATENÇÃO — Ingredientes Mencionados Exigem Cautela',
          badge: 'CAUTELA (VOZ)',
          summary: `Entre os ingredientes ditados por voz, há item que exige atenção (${yellowNames.join(', ')}). Confira os detalhes abaixo.`
        };
      }
      if (analysis.status === 'GREEN_SAFE' || (analysis.status === 'YELLOW_INCOMPLETE_SCAN' && safeNames.length > 0)) {
        const namesLabel = safeNames.length > 0 ? ` (${safeNames.join(', ')})` : '';
        return {
          visualColor: 'green' as const,
          title: '🟢 INGREDIENTES MENCIONADOS SÃO SEGUROS',
          badge: 'SEGURO (VOZ)',
          summary: `Os ingredientes mencionados por voz${namesLabel} são seguros para G6PD. Confira abaixo se a conversão de voz escreveu tudo corretamente e se há outros itens no rótulo.`
        };
      }
      // YELLOW_INCOMPLETE_SCAN em voz sem item específico reconhecido no catálogo
      const hasUnknown = (voiceAudit?.unrecognizedTokens.length || 0) > 0;
      return {
        visualColor: hasUnknown ? ('yellow' as const) : ('green' as const),
        title: hasUnknown
          ? '🟡 INGREDIENTES MENCIONADOS SEM ALERTA (Conferir Transcrição de Voz)'
          : '🟢 INGREDIENTES MENCIONADOS SÃO SEGUROS (Nenhum Alerta na Fala)',
        badge: hasUnknown ? 'CONFERIR VOZ' : 'SEM ALERTA (VOZ)',
        summary: hasUnknown
          ? `Nenhum proibido foi detectado no que foi falado, mas há palavras ditadas (${voiceAudit?.unrecognizedTokens.join(', ')}) que convém conferir na embalagem para descartar erro do microfone.`
          : 'Os ingredientes comuns mencionados por voz não possuem restrição para G6PD. Lembre-se de conferir se há conservantes ou corantes no final do rótulo.'
      };
    }

    // Quando foi digitado manualmente (TEXT) e caiu em YELLOW_INCOMPLETE_SCAN (sem ser foto cortada!)
    if (inputSource === 'TEXT' && analysis.status === 'YELLOW_INCOMPLETE_SCAN') {
      if (safeNames.length > 0) {
        return {
          visualColor: 'green' as const,
          title: '🟢 INGREDIENTES INFORMADOS SÃO SEGUROS (Consulta Isolada)',
          badge: 'SEGURO ISOLADAMENTE',
          summary: `Os itens informados (${safeNames.join(', ')}) são reconhecidos como seguros para G6PD. Para validar um produto inteiro, inclua toda a lista de ingredientes da embalagem.`
        };
      }
      return {
        visualColor: 'yellow' as const,
        title: '🟡 CONSULTA PARCIAL SEM ALERTA DIRETO',
        badge: 'LISTA PARCIAL',
        summary: 'Nenhuma substância proibida foi identificada nos termos digitados, mas o texto não contém os marcadores de um rótulo completo (ex.: "Ingredientes:").'
      };
    }

    // Comportamento padrão para Rótulo Completo ou Foto OCR
    return {
      visualColor:
        analysis.status === 'RED_BLOCKED'
          ? ('red' as const)
          : analysis.status === 'YELLOW_ATTENTION' || analysis.status === 'YELLOW_INCOMPLETE_SCAN'
          ? ('yellow' as const)
          : ('green' as const),
      title: analysis.statusTitle,
      badge: analysis.statusBadge,
      summary: analysis.summary
    };
  }, [analysis, inputSource, voiceAudit]);

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
        setInputSource('PHOTO_OCR');
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
      barcode: pantryProductBarcode.trim() || undefined,
      ingredients: inputText.trim(),
      notes: pantryProductNotes.trim() || 'Adicionado após conferência no Scanner G6PDA'
    });

    setSavedToPantry(true);
    setShowSavePantryForm(false);
    setPantryLookupNotice(null);
    setTimeout(() => setSavedToPantry(false), 3000);
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
            Texto do Rótulo, Bula ou Ingredientes Ditados
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {isVoiceRecognitionSupported() && (
              <button
                onClick={handleToggleVoice}
                className="btn btn-secondary"
                style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '6px', background: isListening ? 'var(--red-border)' : undefined, color: isListening ? '#fff' : undefined }}
                title="Ditar ingredientes por voz"
              >
                {isListening ? <MicOff size={14} color="white" /> : <Mic size={14} />}
                <span>{isListening ? 'Ouvindo...' : 'Falar'}</span>
              </button>
            )}
            {inputText && (
              <button
                onClick={() => {
                  setInputText('');
                  setInputSource('TEXT');
                }}
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
          onChange={(e) => {
            setInputSource('TEXT');
            setInputText(e.target.value);
          }}
          placeholder="Cole aqui o texto do rótulo, fale os ingredientes pelo microfone ou use o leitor de código de barras acima..."
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
                onClick={() => {
                  setInputSource('TEXT');
                  setInputText(sample.text);
                }}
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
      {analysis && displayVerdict && (
        <>
          <div className="screen-intro">
            <span className="eyebrow">
              {inputSource === 'VOICE'
                ? 'Resultado da consulta por voz'
                : inputSource === 'BARCODE'
                ? 'Resultado via código de barras'
                : inputSource === 'PHOTO_OCR'
                ? 'Resultado da leitura por foto'
                : 'Resultado da verificação'}
            </span>
            <h2>
              {inputSource === 'VOICE' ? 'Análise dos ingredientes mencionados' : 'Análise da composição'}
            </h2>
          </div>

          <div className={`traffic-banner ${displayVerdict.visualColor}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {displayVerdict.visualColor === 'red' && <AlertOctagon size={36} color="var(--red-border)" />}
                {displayVerdict.visualColor === 'yellow' && (
                  <AlertTriangle size={36} color="var(--yellow-border)" />
                )}
                {displayVerdict.visualColor === 'green' && <CheckCircle2 size={36} color="var(--green-border)" />}

                <div>
                  <h3 style={{ fontSize: '1.12rem', fontWeight: 800 }}>
                    {displayVerdict.title}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '4px', opacity: 0.92, lineHeight: 1.45 }}>
                    {displayVerdict.summary}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {isSpeechSynthesisSupported() && (
                  <button
                    onClick={() => speakVerdict(`${displayVerdict.title}. ${displayVerdict.summary}`)}
                    className="btn btn-secondary no-print"
                    style={{ padding: '6px 10px', fontSize: '0.75rem', borderRadius: '8px' }}
                    title="Ouvir veredito em voz alta"
                  >
                    <Volume2 size={16} />
                    <span className="no-print">Ouvir</span>
                  </button>
                )}
                <span className={`badge ${
                  displayVerdict.visualColor === 'red' ? 'badge-red' :
                  displayVerdict.visualColor === 'yellow' ? 'badge-yellow' : 'badge-green'
                }`}>
                  {displayVerdict.badge}
                </span>
              </div>
            </div>
          </div>

          {/* Auditoria de Conversão de Voz para Texto (Quando o usuário usou o botão Falar) */}
          {inputSource === 'VOICE' && voiceAudit && (
            <div className="card" style={{ borderLeft: '4px solid var(--primary)', background: 'var(--bg-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Mic size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.84rem', lineHeight: '1.5', width: '100%' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
                    🎙️ Auditoria de Conversão de Voz para Texto
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <strong>O que o microfone entendeu:</strong>{' '}
                    <span style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontWeight: 700 }}>
                      "{inputText}"
                    </span>
                  </div>

                  {voiceAudit.hasSulfatoHomophoneRisk && (
                    <div style={{
                      background: 'var(--yellow-bg)',
                      border: '1px solid var(--yellow-border)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      marginTop: '6px',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)'
                    }}>
                      <strong>⚠️ Verificação Fonética Importante (-ATO vs -ITO):</strong> Você falou <strong>Sulfato</strong> (que é um nutriente seguro). Confira visualmente no rótulo se está escrito <strong>SULFATO</strong> e não <strong>SULFITO / BISSULFITO / METABISSULFITO</strong> (que têm som parecido mas são conservantes proibidos).
                    </div>
                  )}

                  {voiceAudit.unrecognizedTokens.length > 0 && (
                    <div style={{
                      background: 'var(--info-bg)',
                      border: '1px solid var(--info-border)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      marginTop: '6px',
                      fontSize: '0.8rem',
                      color: 'var(--text-main)'
                    }}>
                      <strong>🔍 Conferir grafia do que foi dito:</strong> O termo{' '}
                      <strong>"{voiceAudit.unrecognizedTokens.join(', ')}"</strong> não corresponde a um ingrediente comum ou substância catalogada. Se o microfone tiver trocado alguma letra de um nome químico difícil, você pode corrigir no campo de texto acima.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detalhamento Imediato: Substâncias Identificadas e Nutrientes Seguros Reconhecidos logo abaixo do Veredito */}
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

          {/* Falsos Amigos Seguros Reconhecidos (Ex: Sulfato Ferroso, Sulfato de Zinco, Ácido Lático, Vitamina K1) */}
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
                      fontSize: '0.82rem'
                    }}
                  >
                    <strong style={{ color: 'var(--green-text)' }}>✓ {safe.term}:</strong> {safe.explanation}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerta de Leitura Incompleta de Rótulo (Apenas quando veio de FOTO OCR ou lista truncada sem itens seguros isolados) */}
          {analysis.status === 'YELLOW_INCOMPLETE_SCAN' && inputSource === 'PHOTO_OCR' && (
            <div className="card" style={{ borderLeft: '4px solid var(--yellow-border)', background: 'var(--yellow-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Info size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.84rem', lineHeight: '1.5' }}>
                  <strong>Conferência da foto pendente:</strong> Não foi possível confirmar uma lista completa e legível de ingredientes na imagem. Este resultado não libera o produto.
                  <br />
                  <em>Compare o texto extraído com o rótulo físico e faça uma nova foto da lista inteira, sem cortes ou reflexos.</em>
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

          {/* Botões de Ação: IA + Salvar na Despensa Segura com Tabela Editável e Scanner EAN Auxiliar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            <button
              className="btn btn-ai"
              style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
              onClick={() => setShowAiModal(true)}
            >
              <Sparkles size={20} />
              ✨ Analisar a Fundo com Minha IA (Gemini, ChatGPT, Claude)
            </button>

            {(analysis.status === 'GREEN_SAFE' || displayVerdict.visualColor === 'green') && (
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
                    background: 'var(--bg-secondary)',
                    border: '2px solid var(--green-border)',
                    borderRadius: '14px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    textAlign: 'left',
                    boxShadow: '0 8px 24px rgba(0, 109, 91, 0.10)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--green-text)' }}>
                          📋 Tabela Editável de Confirmação — Despensa Segura
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {pantryProductBarcode
                            ? `Dados carregados do código de barras (${pantryProductBarcode}). Você pode editar qualquer campo abaixo.`
                            : 'Quer preencher nome, marca e EAN automaticamente? Escaneie o código de barras abaixo ou edite livremente.'}
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{
                          padding: '7px 12px',
                          fontSize: '0.78rem',
                          borderRadius: '8px',
                          border: '1px solid var(--primary)',
                          color: 'var(--primary)',
                          fontWeight: 700
                        }}
                        onClick={() => setShowBarcodeForPantryFill(true)}
                      >
                        <Barcode size={16} />
                        {pantryProductBarcode ? 'Trocar / Reler Código de Barras' : 'Ler Código de Barras p/ Preencher'}
                      </button>
                    </div>

                    {pantryLookupNotice && (
                      <div style={{
                        background: 'var(--info-bg)',
                        border: '1px solid var(--info-border)',
                        borderRadius: '8px',
                        padding: '8px 10px',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)'
                      }}>
                        {pantryLookupNotice}
                      </div>
                    )}

                    {/* Tabela Editável Estruturada */}
                    <div style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: 'var(--bg-primary)'
                    }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{
                              width: '34%',
                              padding: '10px',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-muted)',
                              fontWeight: 700,
                              textAlign: 'left',
                              fontSize: '0.76rem'
                            }}>
                              Código de Barras (EAN)
                            </th>
                            <td style={{ padding: '6px 10px' }}>
                              <input
                                type="text"
                                className="input-field"
                                placeholder="Opcional — escaneie acima ou digite (ex: 789...)"
                                value={pantryProductBarcode}
                                onChange={(e) => setPantryProductBarcode(e.target.value)}
                                style={{ width: '100%', padding: '7px 9px', fontSize: '0.84rem' }}
                              />
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{
                              padding: '10px',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-muted)',
                              fontWeight: 700,
                              textAlign: 'left',
                              fontSize: '0.76rem'
                            }}>
                              Nome do Alimento *
                            </th>
                            <td style={{ padding: '6px 10px' }}>
                              <input
                                type="text"
                                className="input-field"
                                placeholder="Ex.: Biscoito Maria, Pão de Forma..."
                                value={pantryProductName}
                                onChange={(e) => setPantryProductName(e.target.value)}
                                style={{ width: '100%', padding: '7px 9px', fontSize: '0.84rem', fontWeight: 600 }}
                              />
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{
                              padding: '10px',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-muted)',
                              fontWeight: 700,
                              textAlign: 'left',
                              fontSize: '0.76rem'
                            }}>
                              Marca / Fabricante *
                            </th>
                            <td style={{ padding: '6px 10px' }}>
                              <input
                                type="text"
                                className="input-field"
                                placeholder="Ex.: Piraquê, Bauducco, Wickbold..."
                                value={pantryProductBrand}
                                onChange={(e) => setPantryProductBrand(e.target.value)}
                                style={{ width: '100%', padding: '7px 9px', fontSize: '0.84rem' }}
                              />
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{
                              padding: '10px',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-muted)',
                              fontWeight: 700,
                              textAlign: 'left',
                              fontSize: '0.76rem'
                            }}>
                              Ingredientes Validados
                            </th>
                            <td style={{ padding: '6px 10px' }}>
                              <textarea
                                className="input-field"
                                rows={2}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                style={{ width: '100%', padding: '7px 9px', fontSize: '0.78rem', resize: 'vertical' }}
                              />
                            </td>
                          </tr>
                          <tr>
                            <th style={{
                              padding: '10px',
                              background: 'var(--bg-secondary)',
                              color: 'var(--text-muted)',
                              fontWeight: 700,
                              textAlign: 'left',
                              fontSize: '0.76rem'
                            }}>
                              Observação Familiar
                            </th>
                            <td style={{ padding: '6px 10px' }}>
                              <input
                                type="text"
                                className="input-field"
                                placeholder="Ex.: Aprovado para lanche da escola"
                                value={pantryProductNotes}
                                onChange={(e) => setPantryProductNotes(e.target.value)}
                                style={{ width: '100%', padding: '7px 9px', fontSize: '0.82rem' }}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1, padding: '10px', background: 'var(--green-border)' }}
                        onClick={handleSaveToPantry}
                      >
                        <Check size={16} /> Confirmar Dados e Salvar na Despensa
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
        </>
      )}

      {/* Modal de Handoff para IA */}
      {showAiModal && analysis && (
        <AiHandoffModal
          analysis={analysis}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {/* Modal de Leitor de Código de Barras (Fluxo Principal de Consulta) */}
      {showBarcodeModal && (
        <BarcodeScannerModal
          profileMode={profileMode}
          onClose={() => setShowBarcodeModal(false)}
          onSelectIngredientsForScan={(text, productMeta) => {
            setInputSource('BARCODE');
            setInputText(text);
            if (productMeta) {
              if (productMeta.productName) setPantryProductName(productMeta.productName);
              if (productMeta.brands) setPantryProductBrand(productMeta.brands);
              if (productMeta.code) setPantryProductBarcode(productMeta.code);
            }
          }}
        />
      )}

      {/* Modal de Leitor de Código de Barras Auxiliar (Para Preencher a Tabela da Despensa Segura) */}
      {showBarcodeForPantryFill && (
        <BarcodeScannerModal
          profileMode={profileMode}
          onClose={() => setShowBarcodeForPantryFill(false)}
          onSelectIngredientsForScan={(text, productMeta) => {
            setInputSource('BARCODE');
            setInputText(text);
            if (productMeta) {
              if (productMeta.productName) setPantryProductName(productMeta.productName);
              if (productMeta.brands) setPantryProductBrand(productMeta.brands);
              if (productMeta.code) setPantryProductBarcode(productMeta.code);
              setPantryLookupNotice(`✅ Código ${productMeta.code} lido! Dados preenchidos na tabela abaixo — edite se desejar.`);
            }
            setShowBarcodeForPantryFill(false);
          }}
          onFillPantryMetadata={(meta) => {
            setPantryProductBarcode(meta.barcode);
            if (meta.name) setPantryProductName(meta.name);
            if (meta.brand) setPantryProductBrand(meta.brand);
            if (meta.name || meta.brand) {
              setPantryLookupNotice(`✅ Produto identificado pelo EAN ${meta.barcode}! Confira os campos na tabela abaixo.`);
            } else {
              setPantryLookupNotice(`ℹ️ O código EAN ${meta.barcode} foi registrado na tabela, mas ainda não consta na base online. Preencha ou edite o Nome e a Marca manualmente abaixo.`);
            }
            setShowBarcodeForPantryFill(false);
          }}
        />
      )}
    </div>
  );
};
