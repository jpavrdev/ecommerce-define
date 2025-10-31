import React, { useRef } from 'react';
import './ProductCarousel.css';
import ProductCard, { Product } from './ProductCard';

export default function ProductCarousel({ products }: { products: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollBy = (delta: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className="pcarousel">
      <button className="pcarousel__btn pcarousel__btn--prev" aria-label="Anterior" onClick={() => scrollBy(-400)}>‹</button>
      <div className="pcarousel__viewport" ref={trackRef}>
        <div className="pcarousel__track">
          {products.map(p => (
            <div key={p.id} className="pcarousel__item">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </div>
      <button className="pcarousel__btn pcarousel__btn--next" aria-label="Próximo" onClick={() => scrollBy(400)}>›</button>
    </div>
  );
}

