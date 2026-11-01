/**
 * Assistente de Voz Nativo do Dispositivo (Web Speech API)
 * Transforma fala em texto (SpeechRecognition) e lê vereditos em voz alta (SpeechSynthesis)
 * com custo R$ 0,00 e funcionamento direto no aparelho.
 */

// Declaração de tipos para SpeechRecognition do navegador
interface IWindowSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function isVoiceRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  const win = window as unknown as IWindowSpeech;
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Corrige separações fonéticas comuns feitas pelo reconhecedor de voz em nomes químicos de G6PD
 */
export function normalizeSpokenChemicalTerms(transcript: string): string {
  return transcript
    .replace(/\bmeta\s*bi\s*sulfito\b/gi, 'metabissulfito')
    .replace(/\bmeta\s*bissulfito\b/gi, 'metabissulfito')
    .replace(/\bbi\s*sulfito\b/gi, 'bissulfito')
    .replace(/\btarta\s*zina\b/gi, 'tartrazina')
    .replace(/\btartara\s*zina\b/gi, 'tartrazina')
    .replace(/\bprima\s*quina\b/gi, 'primaquina')
    .replace(/\btafeno\s*quina\b/gi, 'tafenoquina')
    .replace(/\bnitro\s*furanto[ií]na\b/gi, 'nitrofurantoína')
    .replace(/\bfenazo\s*piridina\b/gi, 'fenazopiridina')
    .replace(/\brasburi\s*case\b/gi, 'rasburicase')
    .replace(/\bsulfa\s*metoxazol\b/gi, 'sulfametoxazol');
}

/**
 * Inicia a escuta de voz em Português do Brasil, solicitando antes a permissão
 * de microfone via getUserMedia quando necessário (essencial no WebView Android/Capacitor).
 */
export function startVoiceListening(
  onResult: (transcript: string) => void,
  onError: (errorMessage: string) => void,
  onEnd?: () => void
): () => void {
  const win = window as unknown as IWindowSpeech;
  const SpeechClass = win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechClass) {
    onError('Reconhecimento de voz não suportado neste navegador/aparelho.');
    return () => {};
  }

  let recognition: any = null;
  let cancelled = false;

  const launchRecognition = () => {
    if (cancelled) return;
    recognition = new SpeechClass();
    recognition.lang = 'pt-BR';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const rawTranscript = event.results?.[0]?.[0]?.transcript;
      if (rawTranscript) {
        onResult(normalizeSpokenChemicalTerms(rawTranscript));
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Erro no reconhecimento de voz:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        onError('Permissão de microfone negada. Verifique nas configurações do aparelho se o microfone está liberado para o G6PDA.');
      } else if (event.error === 'no-speech') {
        onError('Nenhuma fala detectada. Tente falar novamente próximo ao microfone.');
      } else {
        onError(`Erro de áudio: ${event.error}`);
      }
    };

    recognition.onend = () => {
      onEnd?.();
    };

    try {
      recognition.start();
    } catch {
      onError('Não foi possível iniciar o microfone.');
    }
  };

  // Solicitar permissão explícita no WebView/navegador antes de iniciar o SpeechRecognition
  if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
        launchRecognition();
      })
      .catch(() => {
        // Tenta iniciar diretamente caso getUserMedia falhe por restrição de contexto, deixando SpeechRecognition reportar se bloqueado
        launchRecognition();
      });
  } else {
    launchRecognition();
  }

  return () => {
    cancelled = true;
    try {
      recognition?.stop();
    } catch {
      // Ignorar
    }
  };
}

/**
 * Fala o veredito clínico em voz alta usando o sintetizador nativo do celular
 */
export function speakVerdict(textToSpeak: string): void {
  if (!isSpeechSynthesisSupported()) return;

  try {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang === 'pt-BR' || v.lang.startsWith('pt'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Falha ao falar em voz alta:', err);
  }
}
