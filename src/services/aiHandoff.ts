import { AnalysisResult } from '../engine/types.ts';

/**
 * Constrói o Super-Prompt estruturado com o contexto completo da leitura
 * para que o modelo de IA do usuário responda com precisão clínica imediata.
 */
export function buildAiPrompt(analysis: AnalysisResult): string {
  const detectedItems = analysis.matches.length > 0
    ? analysis.matches.map(m => `• ${m.rule.name} (Categoria: ${m.rule.category}, Risco: ${m.effectiveRisk}, Fonte: ${m.rule.protocolSource}) - Mecanismo: ${m.rule.clinicalMechanism}`).join('\n')
    : '• Nenhum componente proibido identificado na base de regras.';

  const safeLookalikes = analysis.safeLookalikesDetected.length > 0
    ? analysis.safeLookalikesDetected.map(s => `• ${s.term} (${s.explanation})`).join('\n')
    : '• Nenhum identificado.';

  const syrupAlerts = analysis.pediatricSyrupAlerts.length > 0
    ? analysis.pediatricSyrupAlerts.map(a => `• ${a}`).join('\n')
    : '• Sem alertas específicos de excipientes.';

  return `Atue como um especialista em hematologia pediátrica, farmacologia clínica e nutrição para Deficiência de G6PD (CID-10: D55.0).

Sou pai/cuidador de uma criança com Deficiência de G6PD. Utilizei o aplicativo G6PDA para analisar a composição de um produto.

--- DADOS EXTRAÍDOS DO RÓTULO/BULA ---
Texto lido:
"${analysis.rawText.trim()}"

--- AVALIAÇÃO DO MOTOR DETERMINÍSTICO ---
• Veredito: ${analysis.statusTitle}
• Protocolo Utilizado: ${analysis.protocolModeUsed}
• Componentes Detectados:
${detectedItems}

• Nutrientes / Falsos Amigos Seguros Reconhecidos:
${safeLookalikes}

• Alertas Pediátricos de Excipientes:
${syrupAlerts}

--- O QUE PRECISO QUE VOCÊ EXPLIQUE EM LINGUAGEM CLARA E ACESSÍVEL ---
1. O que é exatamente cada um desses componentes detectados e qual o papel dele na formulação deste produto?
2. Qual é o mecanismo de ação dele na criança com Deficiência de G6PD (há risco comprovado de estresse oxidativo/hemólise ou trata-se de restrição preventiva do protocolo pediátrico brasileiro)?
3. Se for medicamento seguro, a versão líquida/xarope pode esconder corantes proibidos no veículo/excipiente?
4. Quais são as opções alternativas mais comuns e seguras?

Por favor, considere em sua resposta as diretrizes internacionais da CPIC (https://cpicpgx.org/guidelines/cpic-guideline-for-g6pd/), os protocolos da Sociedade Brasileira de Pediatria (SBP) e as cartilhas do Ministério da Saúde/EBSERH.`.trim();
}

/**
 * Copia o texto para a Área de Transferência
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Erro ao copiar via clipboard API:', err);
  }

  // Fallback tradicional
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (err) {
    console.error('Fallback de cópia falhou:', err);
    return false;
  }
}

/**
 * Dispara a gaveta nativa do sistema (Share Sheet / Android Intent.ACTION_SEND)
 * copiando preventivamente para o clipboard caso o app destino exija colar.
 */
export async function shareWithNativeAi(prompt: string): Promise<{ shared: boolean; copied: boolean }> {
  const copied = await copyToClipboard(prompt);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: 'Consultar IA sobre Rótulo (G6PD)',
        text: prompt
      });
      return { shared: true, copied };
    } catch (err) {
      // O usuário pode ter cancelado a gaveta de compartilhamento
      return { shared: false, copied };
    }
  }

  return { shared: false, copied };
}

/**
 * URLs de Deep Link direto para os principais motores de IA
 */
export function getAiDirectLinks(prompt: string) {
  const encoded = encodeURIComponent(prompt);
  return {
    chatgpt: `https://chatgpt.com/?q=${encoded}`,
    perplexity: `https://www.perplexity.ai/search?q=${encoded}`,
    claude: `https://claude.ai/new?q=${encoded}`,
    geminiWeb: 'https://gemini.google.com/app',
    geminiPlayStore: 'market://details?id=com.google.android.apps.bard'
  };
}
