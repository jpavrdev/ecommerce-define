import React from 'react';
import Header from '../components/Header';
import CategoryNav from '../components/CategoryNav';
import Hero from '../components/Hero';
import ProductCard, { Product } from '../components/ProductCard';
import Footer from '../components/Footer';
import './Home.css';
import { api } from '../api';

type ServerProduct = {
  id: number;
  name: string;
  price: string; // DECIMAL string
  imageUrl?: string | null;
  images?: string[];
  brandName?: string | null;
  description?: string | null;
};

const placeholder = 'https://images.unsplash.com/photo-1606813907291-76a3600e5d0f?q=80&w=1200&auto=format&fit=crop';

function toCardProduct(p: ServerProduct): Product {
  return {
    id: p.id,
    title: p.name,
    price: Number.parseFloat(p.price),
    image: p.imageUrl || p.images?.[0] || placeholder,
  };
}

export default function Home() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const resp = (await api.listProducts()) as any;
        const items: ServerProduct[] = Array.isArray(resp)
          ? resp
          : Array.isArray(resp?.items)
          ? resp.items
          : [];
        if (!alive) return;
        setProducts(items.map(toCardProduct));
      } catch (e) {
        if (!alive) return;
        setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="home page">
      <Header />
      <CategoryNav />
      <Hero />

      <main className="home__main">
        <section className="home__section">
          <h3 className="home__title">Destaques</h3>
          {loading ? (
            <div>Carregando produtos...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="home__grid">
              {products.map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </section>

        <section className="home__newsletter">
          <div>
            <div className="home__headline">Assine nossa newsletter</div>
            <div className="home__note">Receba ofertas e novidades</div>
          </div>
          <form action="#" onSubmit={(e) => e.preventDefault()} className="home__newsletter-form">
            <input placeholder="Seu e-mail" className="home__newsletter-input" />
            <button className="home__newsletter-btn">Assinar</button>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
}
