export interface PantryItem {
  id: string;
  name: string;
  brand: string;
  barcode?: string;
  ingredients: string;
  verifiedDate: string; // YYYY-MM-DD
  notes?: string;
}

const PANTRY_STORAGE_KEY = 'g6pd_safe_pantry_v1';

export const DEFAULT_INITIAL_PANTRY: PantryItem[] = [
  {
    id: 'pantry-piraque-coco',
    name: 'Biscoito Coco Tradicional',
    brand: 'Piraquê',
    barcode: '7891000368945',
    ingredients: 'Farinha de trigo enriquecida com ferro e ácido fólico, açúcar, gordura vegetal, coco ralado desidratado, amido de milho, sal, fermentos químicos e aromatizante.',
    verifiedDate: '2026-10-23',
    notes: 'Validado em casa. Totalmente sem corantes e sem metabissulfito.'
  },
  {
    id: 'pantry-chocolate-kopenhagen',
    name: 'Minitrufas Tradicionais',
    brand: 'Kopenhagen',
    ingredients: 'Açúcar, manteiga de cacau, leite em pó integral, massa de cacau, soro de leite e lecitina de soja.',
    verifiedDate: '2026-10-23',
    notes: 'Seguro para G6PD. Contém apenas lecitina de soja (segura).'
  }
];

export function getSafePantry(): PantryItem[] {
  try {
    const raw = localStorage.getItem(PANTRY_STORAGE_KEY);
    if (!raw) {
      // Inicializar com itens padrão seguros da sessão se estiver vazio
      localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_PANTRY));
      return DEFAULT_INITIAL_PANTRY;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INITIAL_PANTRY;
  }
}

export function saveSafePantry(items: PantryItem[]): void {
  try {
    localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Falha ao salvar despensa segura:', err);
  }
}

export function addPantryItem(
  item: Omit<PantryItem, 'id' | 'verifiedDate'>
): PantryItem {
  const pantry = getSafePantry();
  const newItem: PantryItem = {
    ...item,
    id: `pantry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    verifiedDate: new Date().toISOString().split('T')[0]
  };

  const updated = [newItem, ...pantry.filter(p => p.barcode !== item.barcode || !item.barcode)];
  saveSafePantry(updated);
  return newItem;
}

export function removePantryItem(id: string): void {
  const pantry = getSafePantry();
  const updated = pantry.filter(item => item.id !== id);
  saveSafePantry(updated);
}

export function exportPantryAsJson(): string {
  const pantry = getSafePantry();
  return JSON.stringify(pantry, null, 2);
}

export function importPantryFromJson(jsonStr: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) {
      return { success: false, count: 0, error: 'O arquivo não contém uma lista válida de produtos.' };
    }

    const current = getSafePantry();
    const map = new Map<string, PantryItem>();

    current.forEach(item => map.set(item.id, item));
    parsed.forEach((item: PantryItem) => {
      if (item.name && item.ingredients) {
        map.set(item.id || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, item);
      }
    });

    const merged = Array.from(map.values());
    saveSafePantry(merged);

    return { success: true, count: parsed.length };
  } catch (err: unknown) {
    return { success: false, count: 0, error: err instanceof Error ? err.message : 'JSON inválido' };
  }
}

export function generatePantryWhatsAppText(): string {
  const pantry = getSafePantry();
  if (pantry.length === 0) {
    return 'Nenhum produto cadastrado na Despensa Segura ainda.';
  }

  const lines = pantry.map((item, idx) => {
    const code = item.barcode ? ` [EAN: ${item.barcode}]` : '';
    const notes = item.notes ? `\n   ↳ _${item.notes}_` : '';
    return `${idx + 1}. *${item.name}* (${item.brand})${code} - _Validado em ${item.verifiedDate}_${notes}`;
  }).join('\n\n');

  return `🛒 *DESPENSA SEGURA PARA DEFICIÊNCIA DE G6PD (ALIMENTOS LIBERADOS)*

Estes são os produtos já conferidos no rótulo físico e aprovados para o nosso filho:

${lines}

⚠️ *Lembrete para Avós e Escola:* Se a embalagem mudar de desenho ou se for de outra marca, confira a lista de ingredientes no *G6PDA* antes de oferecer à criança!`.trim();
}
