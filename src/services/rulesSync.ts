import { G6PDRulesDatabase } from '../engine/types.ts';
import { DEFAULT_G6PD_DATABASE } from '../data/defaultRules.ts';
import { normalizeText } from '../engine/normalizer.ts';

const DYNAMIC_RULES_STORAGE_KEY = 'g6pd_dynamic_rules_database_v1';
const LAST_CHECK_KEY = 'g6pd_rules_last_sync_check';

// URL padrão no GitHub Pages (custo R$ 0,00)
export const DEFAULT_REMOTE_RULES_URL =
  'https://geraldotoledo.github.io/G6PDA/g6pd_rules.json';

export interface SyncCheckResult {
  updated: boolean;
  currentVersion: string;
  remoteVersion?: string;
  updatedAt?: string;
  message: string;
  error?: string;
}

/**
 * Compara duas versões no formato YYYY.MM.DD ou SemVer numericamente
 * Retorna > 0 se vA > vB, < 0 se vA < vB, e 0 se iguais.
 */
export function compareRulesVersion(vA: string, vB: string): number {
  const partsA = vA.replace(/^v/i, '').split('.').map(Number);
  const partsB = vB.replace(/^v/i, '').split('.').map(Number);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const a = partsA[i] || 0;
    const b = partsB[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}

/**
 * Retorna a base de regras ativa (usando a versão atualizada pela nuvem,
 * ou o fallback embutido de fábrica se offline ou primeira execução).
 */
export function getActiveRulesDatabase(): G6PDRulesDatabase {
  try {
    if (typeof localStorage === 'undefined') {
      return DEFAULT_G6PD_DATABASE;
    }
    const stored = localStorage.getItem(DYNAMIC_RULES_STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      // Aplicar o mesmo contrato usado pelo payload remoto e pelo auditor.
      if (isValidRulesDatabase(parsed)) {
        // Usar a que tiver versão mais recente numericamente
        if (compareRulesVersion(parsed.rulesVersion, DEFAULT_G6PD_DATABASE.rulesVersion) >= 0) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao carregar base dinâmica, usando embutida:', err);
  }

  return DEFAULT_G6PD_DATABASE;
}

const VALID_RISK_LEVELS = new Set(['HIGH_RISK', 'RESTRICTED_BR', 'CAUTION', 'SAFE']);
const VALID_CATEGORIES = new Set([
  'DYE_ARTIFICIAL',
  'DYE_NATURAL',
  'DYE_CARAMEL',
  'SULFITE',
  'ANTIOXIDANT',
  'FOOD_BEVERAGE',
  'DRUG_ANALGESIC',
  'DRUG_ANTIBIOTIC',
  'DRUG_ANTIMALARIAL',
  'DRUG_URICOLYTIC',
  'DRUG_CARDIOVASCULAR',
  'DRUG_VITAMIN',
  'DRUG_OTHER',
  'HOUSEHOLD_CHEMICAL'
]);
const VALID_PROTOCOL_SOURCES = new Set([
  'GLOBAL_CPIC_WHO',
  'BRAZIL_SBP_APAE',
  'ANVISA',
  'FAVISMO_IT',
  'MINISTERIO_DA_SAUDE'
]);
const VALID_EVIDENCE_KINDS: Record<string, true> = {
  DIRECT_HEMOLYTIC_RISK: true,
  PEDIATRIC_PRECAUTION: true,
  DOSE_DEPENDENT_CAUTION: true,
  AMBIGUOUS_LABEL: true,
  SAFE_REFERENCE: true
};
const VALID_PROVENANCE_STATUSES: Record<string, true> = {
  DOCUMENTED: true,
  PENDING_REVIEW: true
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isUniqueId(value: unknown, seen: Set<string>): value is string {
  if (!isNonEmptyString(value) || value !== value.trim()) return false;
  const key = value.toLowerCase();
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
}

function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || value.length !== 10 || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= daysInMonth[month - 1];
}

function isReferenceUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value) || /\s/.test(value)) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && url.hostname.length > 0;
  } catch {
    return false;
  }
}

function isRegexList(value: unknown): value is string[] {
  if (!Array.isArray(value)) return false;
  for (const pattern of value) {
    if (!isNonEmptyString(pattern)) return false;
    try {
      new RegExp(pattern, 'gi');
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Validador estrito anti-corrupção (Captive Portal Guard):
 * Garante que uma rede Wi-Fi de mercado interceptando a requisição com tela de login
 * ou payload incompleto não corrompa a base do aplicativo.
 */
export function isValidRulesDatabase(data: unknown): data is G6PDRulesDatabase {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;
  const db = data as Partial<G6PDRulesDatabase>;

  if (db.schemaVersion !== 1) return false;
  // Manter o formato de versão da base existente, sem confundi-lo com updatedAt.
  if (typeof db.rulesVersion !== 'string' || db.rulesVersion !== db.rulesVersion.trim() ||
      !/^v?\d{4}\.\d{1,2}\.\d{1,2}$/i.test(db.rulesVersion)) {
    return false;
  }
  if (!isCalendarDate(db.updatedAt) || !isNonEmptyString(db.description)) return false;
  if (!Array.isArray(db.sources) || db.sources.length === 0) return false;
  const seenSourceIds = new Set<string>();
  const sourceIds = new Set<string>();
  for (const src of db.sources) {
    if (!src || typeof src !== 'object' || Array.isArray(src) || !isUniqueId(src.id, seenSourceIds)) return false;
    sourceIds.add(src.id);
    if (!isNonEmptyString(src.name) || !isNonEmptyString(src.organization)) return false;
    if (!isNonEmptyString(src.documentTitle) || !isNonEmptyString(src.editionOrDate)) return false;
    if (!isReferenceUrl(src.url) || !isNonEmptyString(src.sectionOrTable)) return false;
  }

  if (!Array.isArray(db.rules) || db.rules.length < 25) return false;
  if (!Array.isArray(db.safeLookalikes) || db.safeLookalikes.length < 5) return false;

  const seenRuleIds = new Set<string>();
  for (const rule of db.rules) {
    if (!rule || typeof rule !== 'object' || Array.isArray(rule) || !isUniqueId(rule.id, seenRuleIds)) return false;
    if (!isNonEmptyString(rule.name) || !isNonEmptyString(rule.clinicalMechanism)) return false;
    if (typeof rule.riskLevel !== 'string' || !VALID_RISK_LEVELS.has(rule.riskLevel)) return false;
    if (typeof rule.category !== 'string' || !VALID_CATEGORIES.has(rule.category)) return false;
    if (typeof rule.protocolSource !== 'string' || !VALID_PROTOCOL_SOURCES.has(rule.protocolSource)) return false;
    if (!Array.isArray(rule.synonyms) || rule.synonyms.length === 0) return false;
    if (!rule.synonyms.every(isNonEmptyString)) return false;
    if ('insCode' in rule && (typeof rule.insCode !== 'string' ||
        rule.insCode !== rule.insCode.trim() || !/^\d{3}[a-z]?$/i.test(rule.insCode))) return false;
    if ('eNumber' in rule && (typeof rule.eNumber !== 'string' ||
        rule.eNumber !== rule.eNumber.trim() || !/^E\d{3}[a-z]?$/i.test(rule.eNumber))) return false;
    if ('isAmbiguous' in rule && typeof rule.isAmbiguous !== 'boolean') return false;
    if ('pediatricSyrupWarning' in rule && !isNonEmptyString(rule.pediatricSyrupWarning)) return false;
    if ('regexPatterns' in rule && !isRegexList(rule.regexPatterns)) return false;
    if (typeof rule.evidenceKind !== 'string' || VALID_EVIDENCE_KINDS[rule.evidenceKind] !== true) return false;
    if (!isNonEmptyString(rule.sourceRef) || !sourceIds.has(rule.sourceRef)) return false;
    if (typeof rule.provenanceStatus !== 'string' || VALID_PROVENANCE_STATUSES[rule.provenanceStatus] !== true) return false;
    if ('provenanceNote' in rule && !isNonEmptyString(rule.provenanceNote)) return false;
    if (rule.provenanceStatus === 'PENDING_REVIEW' && !isNonEmptyString(rule.provenanceNote)) return false;
  }

  const seenSafeIds = new Set<string>();
  const seenSafeTerms = new Set<string>();
  for (const safe of db.safeLookalikes) {
    if (!safe || typeof safe !== 'object' || Array.isArray(safe) || !isUniqueId(safe.id, seenSafeIds)) return false;
    if (!isNonEmptyString(safe.term)) return false;
    const term = normalizeText(safe.term);
    if (!term || seenSafeTerms.has(term)) return false;
    seenSafeTerms.add(term);
    if (!isNonEmptyString(safe.category) || !isNonEmptyString(safe.explanation)) return false;
  }

  return true;
}

/**
 * Sincroniza a base de regras com a nuvem silenciosamente ou sob demanda
 */
export async function syncRulesFromRemote(
  remoteUrl = DEFAULT_REMOTE_RULES_URL
): Promise<SyncCheckResult> {
  const currentDb = getActiveRulesDatabase();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);
  let json: unknown;

  try {
    // Cache-busting com timestamp para evitar que a CDN sirva arquivo velho.
    const cacheBustedUrl = `${remoteUrl}?t=${Date.now()}`;
    const res = await fetch(cacheBustedUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      return {
        updated: false,
        currentVersion: currentDb.rulesVersion,
        message: `Servidor retornou status ${res.status}. Base local mantida intacta.`
      };
    }
    json = await res.json();
  } catch (err: unknown) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return {
      updated: false,
      currentVersion: currentDb.rulesVersion,
      message: isAbort
        ? 'A verificação de atualização demorou muito. Base local mantida intacta.'
        : 'Falha de comunicação ou leitura da resposta do servidor de atualizações. Base local mantida intacta.',
      error: err instanceof Error ? err.message : 'Erro de comunicação'
    };
  } finally {
    clearTimeout(timeoutId);
  }

  if (!isValidRulesDatabase(json)) {
    return {
      updated: false,
      currentVersion: currentDb.rulesVersion,
      message: 'O arquivo baixado não passou no teste de integridade estrutural. Base local protegida.',
      error: 'Schema inválido ou incompleto'
    };
  }

  const hasNewVersion = compareRulesVersion(json.rulesVersion, currentDb.rulesVersion) > 0;
  let storage: Storage;
  try {
    if (typeof localStorage === 'undefined') throw new Error('Armazenamento local indisponível');
    storage = localStorage;
    if (hasNewVersion) {
      // Ponto de confirmação: somente esta gravação ativa a nova base.
      storage.setItem(DYNAMIC_RULES_STORAGE_KEY, JSON.stringify(json));
    }
  } catch (err: unknown) {
    return {
      updated: false,
      currentVersion: currentDb.rulesVersion,
      remoteVersion: json.rulesVersion,
      message: hasNewVersion
        ? 'Não foi possível armazenar e ativar a atualização. Base anterior mantida.'
        : 'Base local mantida; armazenamento indisponível para registrar a verificação.',
      error: `Erro de armazenamento: ${err instanceof Error ? err.message : 'persistência indisponível'}`
    };
  }

  const result: SyncCheckResult = hasNewVersion
    ? {
      updated: true,
      currentVersion: json.rulesVersion,
      remoteVersion: json.rulesVersion,
      updatedAt: json.updatedAt,
      message: `Base atualizada com sucesso para a versão ${json.rulesVersion} (${json.rules.length} regras)!`
    }
    : {
      updated: false,
      currentVersion: currentDb.rulesVersion,
      remoteVersion: json.rulesVersion,
      message: `A sua base (v${currentDb.rulesVersion}) já está na versão mais recente disponível.`
    };

  try {
    storage.setItem(LAST_CHECK_KEY, new Date().toISOString());
  } catch (err: unknown) {
    // Metadado secundário: sua falha nunca desfaz a confirmação acima.
    result.message += ' Aviso: não foi possível registrar a data da última verificação.';
    result.error = `Erro no metadado de armazenamento: ${err instanceof Error ? err.message : 'gravação indisponível'}`;
  }
  return result;
}
