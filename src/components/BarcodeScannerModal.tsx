import React, { useState } from 'react';
import { Barcode, Search, X, Camera, Plus, Loader2, Check } from 'lucide-react';
import { lookupProductByBarcode, ProductLookupResult, OpenFoodFactsProduct } from '../services/openFoodFacts.ts';
import { detectBarcodeFromImage } from '../services/imageOcr.ts';
import { addPantryItem } from '../services/pantryStorage.ts';
import { ProfileMode } from '../engine/types.ts';

interface BarcodeScannerModalProps {
  profileMode: ProfileMode;
  onClose: () => void;
  onSelectIngredientsForScan: (text: string, productMeta?: OpenFoodFactsProduct) => void;
  /** Quando definido, funciona como leitor auxiliar para alimentar a tabela de confirmação da Despensa */
  onFillPantryMetadata?: (meta: { barcode: string; name?: string; brand?: string }) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  profileMode,
  onClose,
  onSelectIngredientsForScan,
  onFillPantryMetadata
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductLookupResult | null>(null);
  const [savedToPantry, setSavedToPantry] = useState(false);

  const isNativeBarcodeSupported = typeof window !== 'undefined' && 'BarcodeDetector' in window;
  const isMetadataFillMode = !!onFillPantryMetadata;

  const sampleEans = [
    { label: 'Biscoito Piraquê (Real)', ean: '7891000368945' },
    { label: 'Biscoito Maltado (Real)', ean: '7896024761460' }
  ];

  const handleSearch = async (codeToSearch?: string) => {
    const targetCode = (codeToSearch || barcodeInput).trim();
    if (!targetCode) return;

    setLoading(true);
    setResult(null);
    setSavedToPantry(false);

    try {
      const res = await lookupProductByBarcode(targetCode, profileMode);
      setResult(res);
      if (isMetadataFillMode && res.found && res.product) {
        onFillPantryMetadata({
          barcode: res.product.code || targetCode,
          name: res.product.productName,
          brand: res.product.brands
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const detected = await detectBarcodeFromImage(file);
      if (detected) {
        setBarcodeInput(detected);
        await handleSearch(detected);
      } else {
        alert('Não foi possível ler o código de barras nesta foto. Digite os números do código manualmente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPantry = () => {
    if (!result?.product) return;

    addPantryItem({
      name: result.product.productName,
      brand: result.product.brands,
      barcode: result.product.code,
      ingredients: result.product.ingredientsText,
      notes: 'Importado via consulta Open Food Facts'
    });

    setSavedToPantry(true);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" role="dialog" aria-modal="true" aria-label="Leitor de Código de Barras">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Barcode size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                {isMetadataFillMode ? 'Preencher Dados via Código de Barras' : 'Leitor de Código de Barras (EAN)'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isMetadataFillMode
                  ? 'Escaneie ou digite o EAN para alimentar Nome, Marca e Código na tabela'
                  : 'Consulta direta na base global Open Food Facts'}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Fechar leitor de código de barras"
            onClick={onClose}
            className="icon-button"
          >
            <X size={20} />
          </button>
        </div>

        {/* Campo de Código EAN */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <input
            type="text"
            aria-label="Código de barras EAN"
            inputMode="numeric"
            pattern="[0-9]*"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Digite os 13 números do código..."
            style={{
              flex: 1,
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-main)',
              padding: '10px 12px',
              fontSize: '0.9rem',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <button
            className="btn btn-primary"
            style={{ padding: '0 16px' }}
            onClick={() => handleSearch()}
            disabled={loading}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          </button>
        </div>

        {/* Botão de Foto / Câmera de Código de Barras */}
        <label
          className="btn btn-secondary"
          style={{ width: '100%', cursor: 'pointer', marginBottom: '14px', fontSize: '0.82rem' }}
        >
          <Camera size={16} />
          Fotografar Código de Barras
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </label>

        {!isNativeBarcodeSupported && (
          <div style={{
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginBottom: '14px',
            background: 'var(--bg-card-subtle)',
            padding: '8px 10px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>💡 Dica: Digite os 13 números do código de barras diretamente ou envie uma foto nítida.</span>
          </div>
        )}

        {/* Amostras rápidas de EAN */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
            Testar com códigos reais:
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {sampleEans.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setBarcodeInput(s.ean);
                  handleSearch(s.ean);
                }}
                style={{
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resultado da Consulta */}
        {result && (
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            padding: '14px',
            marginBottom: '16px'
          }}>
            {result.found && result.product ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {result.product.productName}
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Marca: {result.product.brands} • EAN: {result.product.code}
                    </span>
                  </div>
                  {result.analysis && (
                    <span className={`badge ${
                      result.analysis.status === 'RED_BLOCKED'
                        ? 'badge-red'
                        : result.analysis.status === 'GREEN_SAFE'
                        ? 'badge-green'
                        : 'badge-yellow'
                    }`}>
                      {result.analysis.statusBadge}
                    </span>
                  )}
                </div>

                <p style={{
                  fontSize: '0.82rem',
                  color: result.analysis?.status === 'RED_BLOCKED'
                    ? 'var(--red-text)'
                    : result.analysis?.status === 'GREEN_SAFE'
                    ? 'var(--green-text)'
                    : 'var(--yellow-text)',
                  marginTop: '8px',
                  lineHeight: '1.4'
                }}>
                  {result.message}
                </p>

                {result.product.ingredientsText && (
                  <div style={{
                    marginTop: '10px',
                    padding: '8px',
                    background: 'var(--bg-card)',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    maxHeight: '100px',
                    overflowY: 'auto'
                  }}>
                    <strong>Ingredientes na base:</strong> {result.product.ingredientsText}
                  </div>
                )}

                {/* Botões de Ação para o Produto */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                  {isMetadataFillMode ? (
                    <button
                      className="btn btn-primary"
                      style={{ gridColumn: '1 / -1', padding: '10px', fontSize: '0.82rem', background: 'var(--green-border)' }}
                      onClick={() => {
                        onFillPantryMetadata?.({
                          barcode: result.product?.code || barcodeInput.trim(),
                          name: result.product?.productName,
                          brand: result.product?.brands
                        });
                        onClose();
                      }}
                    >
                      <Check size={16} />
                      Usar estes dados na Tabela da Despensa
                    </button>
                  ) : (
                    <>
                      {result.product.ingredientsText && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '8px', fontSize: '0.78rem' }}
                          onClick={() => {
                            onSelectIngredientsForScan(result.product?.ingredientsText || '', result.product);
                            onClose();
                          }}
                        >
                          Analisar no Scanner
                        </button>
                      )}

                      {result.analysis?.status === 'GREEN_SAFE' && (
                        <button
                          className="btn btn-primary"
                          style={{ padding: '8px', fontSize: '0.78rem' }}
                          onClick={handleAddToPantry}
                          disabled={savedToPantry}
                        >
                          <Plus size={14} />
                          {savedToPantry ? 'Salvo na Despensa!' : 'Salvar na Despensa'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '12px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div style={{ marginBottom: '10px' }}>{result.message}</div>
                {isMetadataFillMode && barcodeInput.trim() && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', padding: '8px 12px' }}
                    onClick={() => {
                      onFillPantryMetadata?.({ barcode: barcodeInput.trim() });
                      onClose();
                    }}
                  >
                    Usar apenas o código EAN ({barcodeInput.trim()}) e digitar Nome/Marca na tabela
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <button
          className="btn btn-secondary"
          style={{ width: '100%' }}
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
