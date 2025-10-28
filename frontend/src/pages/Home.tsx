import React from 'react';
import Header from '../components/Header';
import CategoryNav from '../components/CategoryNav';
import Hero from '../components/Hero';
import ProductCard, { Product } from '../components/ProductCard';
import Footer from '../components/Footer';
import './Home.css';

const sample: Product[] = [
  { id: 1, title: 'Cimento CP-II 50kg', price: 39.9, image: 'https://images.unsplash.com/photo-1582582621957-5f6a71e17831?q=80&w=800&auto=format&fit=crop', badge: 'Oferta' },
  { id: 2, title: 'Tijolo Cerâmico 9x19x19', price: 1.29, image: 'https://images.unsplash.com/photo-1637169031919-25efc41f2d2e?q=80&w=800&auto=format&fit=crop' },
  { id: 3, title: 'Tinta Acrílica 18L Branco', price: 199.9, image: 'https://images.unsplash.com/photo-1613548320506-6fa9ea2502a7?q=80&w=800&auto=format&fit=crop' },
  { id: 4, title: 'Furadeira de Impacto 650W', price: 249.9, image: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?q=80&w=800&auto=format&fit=crop', badge: 'Lançamento' },
  { id: 5, title: 'Lâmpada LED 9W', price: 7.9, image: 'https://images.unsplash.com/photo-1496284045406-d3e0b918d7ba?q=80&w=800&auto=format&fit=crop' },
  { id: 6, title: 'Registro Esfera 1/2"', price: 18.5, image: 'https://images.unsplash.com/photo-1583225523296-3228f18c1940?q=80&w=800&auto=format&fit=crop' },
];

export default function Home() {
  return (
    <div className="home">
      <Header />
      <CategoryNav />
      <Hero />

      <main className="home__main">
        <section className="home__section">
          <h3 className="home__title">Destaques</h3>
          <div className="home__grid">
            {sample.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
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
