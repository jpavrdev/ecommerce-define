import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../components/CartContext';
import type { Product as CardProduct } from '../components/ProductCard';
import './Product.css';
import { api } from '../api';

type ServerProduct = {
  id: number;
  name: string;
  price: string; // DECIMAL string
  sku?: string;
  imageUrl?: string | null;
  images?: string[] | null;
  brandName?: string | null;
  description?: string | null;
  specifications?: any | null;
  brand?: { id: number; name: string } | null;
};

const placeholder = 'https://images.unsplash.com/photo-1606813907291-76a3600e5d0f?q=80&w=1200&auto=format&fit=crop';

function toCardProduct(p: ServerProduct): CardProduct {
  return { id: p.id, title: p.name, price: Number.parseFloat(p.price), image: p.imageUrl || p.images?.[0] || placeholder };
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation() as { state?: { product?: CardProduct } };
  const { add } = useCart();

  const [product, setProduct] = React.useState<CardProduct | undefined>(state?.product);
  const [loading, setLoading] = React.useState(!state?.product);
  const [error, setError] = React.useState<string | null>(null);
  const [specs, setSpecs] = React.useState<Array<{ key: string; value: string }>>([]);
  const [description, setDescription] = React.useState<string | null>(null);
  const [brandName, setBrandName] = React.useState<string | null>(null);
  const [sku, setSku] = React.useState<string | null>(null);
  const [rating, setRating] = React.useState<number>(0);
  const [dims, setDims] = React.useState<Partial<Record<'Altura'|'Largura'|'Comprimento'|'Peso', string>>>({});

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = (await api.getProduct(id!)) as ServerProduct;
        if (!alive) return;
        if (!state?.product) setProduct(toCardProduct(data));
        // Normalize specifications
        const entries: Array<{ key: string; value: string }> = [];
        const s = data.specifications as any;
        if (s) {
          if (Array.isArray(s)) {
            for (const item of s) {
              if (item && typeof item === 'object') {
                for (const [k, v] of Object.entries(item)) entries.push({ key: String(k), value: String(v as any) });
              }
            }
          } else if (typeof s === 'object') {
            for (const [k, v] of Object.entries(s)) entries.push({ key: String(k), value: String(v as any) });
          }
        }
        setSpecs(entries);
        setDescription(data.description ?? null);
        setBrandName(data.brand?.name ?? data.brandName ?? null);
        setSku(data.sku ?? null);
        // Dimensions subset (case-insensitive with diacritics removed)
        const norm = (str: string) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const lookup = new Map(entries.map(e => [norm(e.key), e.value] as const));
        const nextDims: Partial<Record<'Altura'|'Largura'|'Comprimento'|'Peso', string>> = {};
        const pick = (k: string) => lookup.get(norm(k));
        const altura = pick('Altura');
        const largura = pick('Largura');
        const comprimento = pick('Comprimento');
        const peso = pick('Peso');
        if (altura) nextDims.Altura = altura;
        if (largura) nextDims.Largura = largura;
        if (comprimento) nextDims.Comprimento = comprimento;
        if (peso) nextDims.Peso = peso;
        setDims(nextDims);
      } catch (e) {
        if (!alive) return;
        if (!state?.product) setError((e as Error).message);
      } finally {
        if (alive && !state?.product) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, state?.product]);

  return (
    <div className="productpage">
      <Header />
      <main className="productpage__main">
        {loading ? (
          <div>Carregando...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : !product ? (
          <div className="productpage__empty">Produto não encontrado.</div>
        ) : (
          <div className="product">
            <div className="product__gallery">
              <img src={product.image} alt={product.title} className="product__img" />
            </div>
            <div className="product__info">
              <h1 className="product__title">{product.title}</h1>
              <div className="product__meta">
                {brandName && <span className="product__brand">Marca: {brandName}</span>}
                {sku && <span className="product__sku">SKU: {sku}</span>}
              </div>
              <div className="product__rating" aria-label="Avaliação do produto">
                {[1,2,3,4,5].map((i) => (
                  <button key={i} className={'star' + (i <= rating ? ' star--filled' : '')} onClick={() => setRating(i)} aria-label={`${i} estrela${i>1?'s':''}`}>★</button>
                ))}
                <button className="product__rate-link" onClick={() => alert('Funcionalidade de avaliação em breve')}>avalie este produto</button>
              </div>
              <div className="product__price">R$ {product.price.toFixed(2)}</div>
              <p className="product__desc">{description || 'Sem descrição disponível.'}</p>
              {Object.keys(dims).length > 0 && (
                <div className="product__dims">
                  <div className="product__dims-title">Dimensões</div>
                  <div className="product__dims-grid">
                    {dims.Altura && (<div className="product__dim"><span>Altura</span><strong>{dims.Altura}</strong></div>)}
                    {dims.Largura && (<div className="product__dim"><span>Largura</span><strong>{dims.Largura}</strong></div>)}
                    {dims.Comprimento && (<div className="product__dim"><span>Comprimento</span><strong>{dims.Comprimento}</strong></div>)}
                    {dims.Peso && (<div className="product__dim"><span>Peso</span><strong>{dims.Peso}</strong></div>)}
                  </div>
                </div>
              )}
              <div className="product__actions">
                <button className="product__buy" onClick={() => add(product)}>Adicionar ao carrinho</button>
              </div>
            </div>
          </div>
        )}
      </main>
      {!!specs.length && (
        <section className="product__specs">
          <h3 className="product__specs-title">Especificações</h3>
          <div className="specs">
            {specs.map((row, i) => (
              <div key={i} className="specs__row">
                <div className="specs__key">{row.key}</div>
                <div className="specs__value">{row.value}</div>
              </div>
            ))}
          </div>
        </section>
      )}
      <Footer />
    </div>
  );
}
