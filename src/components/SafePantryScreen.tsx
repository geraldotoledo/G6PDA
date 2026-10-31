import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Trash2,
  Share2,
  Download,
  Upload,
  Calendar,
  Search,
  ExternalLink
} from 'lucide-react';
import {
  PantryItem,
  getSafePantry,
  addPantryItem,
  removePantryItem,
  exportPantryAsJson,
  importPantryFromJson,
  generatePantryWhatsAppText
} from '../services/pantryStorage.ts';

interface SafePantryScreenProps {
  onAnalyzeProduct: (ingredients: string) => void;
}

export const SafePantryScreen: React.FC<SafePantryScreenProps> = ({ onAnalyzeProduct }) => {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // Formulário para novo item
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newBarcode, setNewBarcode] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const loadPantry = () => {
    setItems(getSafePantry());
  };

  useEffect(() => {
    loadPantry();
  }, []);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newIngredients.trim()) return;

    addPantryItem({
      name: newName.trim(),
      brand: newBrand.trim() || 'Marca genérica',
      barcode: newBarcode.trim() || undefined,
      ingredients: newIngredients.trim(),
      notes: newNotes.trim() || undefined
    });

    setNewName('');
    setNewBrand('');
    setNewBarcode('');
    setNewIngredients('');
    setNewNotes('');
    setShowAddModal(false);
    loadPantry();
  };

  const handleRemove = (id: string, name: string) => {
    if (confirm(`Remover "${name}" da Despensa Segura?`)) {
      removePantryItem(id);
      loadPantry();
    }
  };

  const handleWhatsAppShare = () => {
    const text = generatePantryWhatsAppText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleExport = () => {
    const jsonStr = exportPantryAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `despensa-segura-g6pd-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const res = importPantryFromJson(importJsonText);
    if (res.success) {
      setShowImportModal(false);
      setImportJsonText('');
      loadPantry();
      alert(`Sucesso! ${res.count} produto(s) importado(s) para a Despensa Segura.`);
    } else {
      alert(`Falha na importação: ${res.error}`);
    }
  };

  const filteredItems = items.filter(i => {
    const q = search.toLowerCase();
    return i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q) || (i.barcode && i.barcode.includes(q));
  });

  return (
    <div>
      <div className="card">
        <span className="eyebrow">Organização do cuidado</span>
        <div className="rule-card-heading">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={22} color="var(--primary)" />
            Despensa Segura da Família
          </h2>
          <span className="badge badge-green">{items.length} Aprovados</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Produtos já conferidos na embalagem física e liberados para o seu filho. Compartilhe com avós, tios e escola.
        </p>

        {/* Botões de Ação */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
          <button
            className="btn btn-primary"
            style={{ padding: '10px', fontSize: '0.82rem', background: 'var(--green-border)' }}
            onClick={handleWhatsAppShare}
          >
            <Share2 size={16} />
            Enviar no WhatsApp
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '10px', fontSize: '0.82rem' }}
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Novo Produto
          </button>
        </div>

        {/* Busca e Import/Export */}
        <div className="pantry-tools">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input
              type="text"
              aria-label="Buscar na despensa"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar nos favoritos..."
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                padding: '8px 10px 8px 32px',
                fontSize: '0.82rem'
              }}
            />
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '8px 10px', fontSize: '0.78rem' }}
            title="Exportar JSON para backup"
            aria-label="Exportar JSON para backup"
            onClick={handleExport}
          >
            <Download size={14} />
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: '8px 10px', fontSize: '0.78rem' }}
            title="Importar JSON de outro celular"
            aria-label="Importar JSON de outro celular"
            onClick={() => setShowImportModal(true)}
          >
            <Upload size={14} />
          </button>
        </div>
      </div>

      {/* Lista de Itens da Despensa */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{
              marginBottom: 0,
              borderLeft: '4px solid var(--green-border)',
              padding: '14px'
            }}
          >
            <div className="rule-card-heading">
              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {item.name}
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {item.brand} {item.barcode && `• EAN: ${item.barcode}`}
                </div>
              </div>
              <button
                onClick={() => handleRemove(item.id, item.name)}
                className="icon-button"
                style={{ color: 'var(--red-text)' }}
                title="Remover"
              >
                <Trash2 size={16} />
              </button>
            </div>

            {item.notes && (
              <div style={{ fontSize: '0.78rem', color: 'var(--green-text)', marginBottom: '6px', fontStyle: 'italic' }}>
                ↳ {item.notes}
              </div>
            )}

            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: '6px',
              padding: '8px',
              fontSize: '0.72rem',
              color: 'var(--text-dim)',
              maxHeight: '65px',
              overflowY: 'auto',
              marginBottom: '8px'
            }}>
              {item.ingredients}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                Validado em {item.verifiedDate}
              </span>

              <button
                onClick={() => onAnalyzeProduct(item.ingredients)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Reanalisar no Scanner
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="empty-state">
            Nenhum produto encontrado na Despensa Segura.
          </div>
        )}
      </div>

      {/* Modal para Adicionar Novo Item */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '14px' }}>
              Cadastrar Produto Aprovado
            </h3>
            <form onSubmit={handleAdd}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Nome do Produto *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Biscoito Maisena Tradicional"
                  style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Marca</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="Ex: Piraquê, Kopenhagen"
                    style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '8px' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Código EAN (Opcional)</label>
                  <input
                    type="text"
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    placeholder="Ex: 7891000..."
                    style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '8px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Lista de Ingredientes *</label>
                <textarea
                  required
                  rows={3}
                  value={newIngredients}
                  onChange={(e) => setNewIngredients(e.target.value)}
                  placeholder="Cole aqui os ingredientes conferidos..."
                  style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '8px', fontSize: '0.8rem' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Notas da Família</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ex: Não comprar a versão de chocolate"
                  style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Produto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Importar JSON */}
      {showImportModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '10px' }}>Importar Despensa Segura (JSON)</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Cole abaixo o texto JSON exportado do celular do outro familiar:
            </p>
            <textarea
              rows={6}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Cole o JSON aqui..."
              style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', padding: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: '14px' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>Fechar</button>
              <button className="btn btn-primary" onClick={handleImport}>Importar Produtos</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
