import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import CategoryNav from '../components/CategoryNav';
import Footer from '../components/Footer';
import ProductCard, { Product } from '../components/ProductCard';
import './Category.css';
import { api, productImageUrl } from '../api';

type ServerProduct = { id: number; name: string; price: string; imageUrl?: string | null; images?: string[] };

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="filter">
      <button className="filter__summary" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span>{title}</span>
        <span className={'filter__chev' + (open ? ' is-open' : '')}>▾</span>
      </button>
      {open && <div className="filter__content">{children}</div>}
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [cats, setCats] = React.useState<Array<{ id: number; name: string; slug: string }>>([]);
  const [subcats, setSubcats] = React.useState<Array<{ id: number; name: string; slug?: string; productCount?: number }>>([]);

  const params = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const catId = params.get('catId');
  const sort = params.get('sort') || 'relevance';
  const maxPrice = params.get('maxPrice') || '';

  // Global faixa de preço inferida a partir dos produtos carregados
  const [rangeMin, setRangeMin] = React.useState<number>(0);
  const [rangeMax, setRangeMax] = React.useState<number>(0);
  // Slider único: preço até X
  const [selectedMax, setSelectedMax] = React.useState<number>(Number(maxPrice || 0));
  const debounceRef = React.useRef<number | undefined>(undefined);
  const fmt2 = (n: number) => Math.round(n * 100) / 100;
  const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

  function setParam(name: string, value: string | null) {
    const usp = new URLSearchParams(location.search);
    if (value === null || value === '') usp.delete(name); else usp.set(name, value);
    navigate({ search: usp.toString() }, { replace: true });
  }

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const all = (await api.listCategories()) as Array<{ id: number; name: string; slug: string }>;
        if (!alive) return;
        setCats(all);
        if (!catId && slug) {
          const found = all.find(c => c.slug === slug);
          if (found) setParam('catId', String(found.id));
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, [slug]);

  // Carrega subcategorias relacionadas ao catId
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!catId) { setSubcats([]); return; }
        const rows = (await api.listSubcategoriesWithCount(catId)) as Array<any>;
        if (!alive) return;
        setSubcats(rows.map(r => ({ id: r.id, name: r.name, slug: r.slug, productCount: Number(r.productCount || 0) })));
      } catch { setSubcats([]); }
    })();
    return () => { alive = false; };
  }, [catId]);

  // 1) Carregar faixa real (min/max) apenas quando categoria muda
  React.useEffect(() => {
    let alive = true;
    (async () => {
      if (!catId) return;
      try {
        const resp: any = await api.listProducts({ categoryId: catId, limit: 1000 });
        const items: ServerProduct[] = Array.isArray(resp) ? resp : resp?.items || [];
        if (!alive) return;
        if (items.length) {
          const prices = items.map(m => Number.parseFloat(m.price));
          const round2 = (n: number) => Math.round(n * 100) / 100;
          const lo = round2(Math.min(...prices));
          const hi = round2(Math.max(...prices));
          setRangeMin(lo);
          setRangeMax(hi);
          // Se não houver maxPrice na URL, seleciona o topo da faixa
          if (!maxPrice) setSelectedMax(hi);
        } else {
          setRangeMin(0);
          setRangeMax(0);
          setSelectedMax(0);
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, [catId]);

  // 2) Carregar produtos ao mudar filtros/ordenacao
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const mx = maxPrice || (selectedMax ? String((Math.round(selectedMax * 100) / 100).toFixed(2)) : '');
        const query: any = { categoryId: catId || undefined, sort };
        if (mx) query.maxPrice = mx;
        const resp: any = await api.listProducts(query);
        const items: ServerProduct[] = Array.isArray(resp) ? resp : resp?.items || [];
        const mapped: Product[] = items.map(p => ({ id: p.id, title: p.name, price: Number.parseFloat(p.price), image: p.imageUrl || p.images?.[0] || productImageUrl(p.id) }));
        if (!alive) return;
        setProducts(mapped);
        setCount(Array.isArray(resp) ? mapped.length : (resp?.count ?? mapped.length));
        setError(null);
      } catch (e) {
        if (!alive) return;
        setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [catId, sort, maxPrice, selectedMax]);

  const catName = React.useMemo(() => cats.find(c => String(c.id) === String(catId))?.name || 'Categoria', [cats, catId]);

  function debounceSetParam(name: string, value: string) {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setParam(name, value), 300);
  }

  return (
    <div className="category-page page">
      <Header />
      <CategoryNav />
      <main className="category">
        <aside className="category__filters">
          <div className="filters__title">
            <span className="filters__icon">⎚</span>
            <span>Filtrar por</span>
          </div>

          <Section title="Relevância">
            <select className="input" value={sort} onChange={e=>setParam('sort', e.target.value)}>
              <option value="relevance">Relevância</option>
              <option value="price_asc">Preço: menor para maior</option>
              <option value="price_desc">Preço: maior para menor</option>
              <option value="newest">Mais recentes</option>
              <option value="name_asc">Nome A-Z</option>
            </select>
          </Section>

          <Section title="Faixas de preço">
            <div className="filter__range">
              <input
                type="range"
                min={rangeMin || 0}
                max={rangeMax || 0}
                step={0.01}
                value={selectedMax || rangeMax || 0}
                onInput={(e)=>{ const v = Number((e.target as HTMLInputElement).value); setSelectedMax(v); }}
                onChange={(e)=>{ const v = Number(e.target.value); const vv = (Math.round(v * 100) / 100).toFixed(2); if (vv !== (maxPrice || '')) debounceSetParam('maxPrice', vv); }}
              />
              <div className="filter__range-labels">
                <span>R$ {(rangeMin || 0).toFixed(2)}</span>
                <span>R$ {(selectedMax || rangeMax || 0).toFixed(2)}</span>
              </div>
            </div>
          </Section>

          <Section title="Categoria" defaultOpen={false}>
            <div className="filter__list" style={{ maxHeight: 280, overflow: 'auto' }}>
              {subcats.length > 0 ? (
                subcats.map(sc => (
                  <button key={sc.id} className={'filter__chip' + (String(sc.id)===String(catId)?' is-active':'')} onClick={()=>setParam('catId', String(sc.id))}>
                    {sc.name} {typeof sc.productCount === 'number' ? ` (${sc.productCount})` : ''}
                  </button>
                ))
              ) : (
                <div style={{ color: '#666', fontSize: 14 }}>Sem subcategorias para esta categoria.</div>
              )}
            </div>
          </Section>
        </aside>
        <section className="category__results">
          <div className="category__toolbar">
            <div className="category__count"><strong>{count}</strong> produtos</div>
            <div className="category__views">
              <button className="view is-active" aria-label="Grade">▦</button>
              <button className="view" aria-label="Lista">▥</button>
            </div>
          </div>
          <h1 className="category__title">{catName}</h1>
          {loading && (<div>Carregando...</div>)}
          {!loading && error && (<div className="error">{error}</div>)}
          {!loading && !error && (
            products.length === 0 ? (
              <div className="category__empty">Nenhum produto encontrado.</div>
            ) : (
              <div className="category__grid">
                {products.map(p => (<ProductCard key={p.id} p={p} />))}
              </div>
            )
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
