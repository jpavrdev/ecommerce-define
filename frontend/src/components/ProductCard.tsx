import React from 'react';
import './ProductCard.css';
import { useCart } from './CartContext';

export type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
  badge?: string;
};

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  return (
    <div className="card">
      <div className="card__imgwrap">
        {p.badge && <span className="card__badge">{p.badge}</span>}
        <img src={p.image} alt={p.title} className="card__img" />
      </div>
      <div className="card__title">{p.title}</div>
      <div className="card__price">R$ {p.price.toFixed(2)}</div>
      <button className="card__btn" onClick={() => add(p)}>Adicionar</button>
    </div>
  );
}
