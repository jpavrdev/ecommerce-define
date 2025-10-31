import React from 'react';
import './ProductCard.css';
import { useCart } from './CartContext';
import { Link } from 'react-router-dom';

export type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
  badge?: string;
};

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    img.onerror = null;
    img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAACXBIWXMAAAsSAAALEgHS3X78AAABOElEQVR4nO3RMQEAIAwAMcD/0ySxg3E2Q0m4zqgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGD8B1y8A5m2c0tMAAAAAElFTkSuQmCC';
  };
  return (
    <div className="card">
      <Link to={`/product/${p.id}`} state={{ product: p }} className="card__imgwrap">
        {p.badge && <span className="card__badge">{p.badge}</span>}
        <img src={p.image} onError={onImgError} alt={p.title} className="card__img" />
      </Link>
      <Link to={`/product/${p.id}`} state={{ product: p }} className="card__title">{p.title}</Link>
      <div className="card__price">R$ {p.price.toFixed(2)}</div>
      <button className="card__btn" onClick={() => add(p)}>Adicionar</button>
    </div>
  );
}
