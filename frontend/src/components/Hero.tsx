import React from 'react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__wrap">
        <div>
          <h2 className="hero__title">Tudo para sua obra</h2>
          <p className="hero__subtitle">Preços de atacado, variedade e retirada rápida.</p>
        </div>
        <img alt="banner" src="https://images.unsplash.com/photo-1581091215367-59ab6bcd8ab9?q=80&w=1200&auto=format&fit=crop" className="hero__image" />
      </div>
    </section>
  );
}
