import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../components/CartContext';
import './Cart.css';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { items, increment, decrement, remove, clear, total, count } = useCart();

  return (
    <div className="cartpage">
      <Header />
      <main className="cartpage__main">
        <h2 className="cartpage__title">Seu carrinho</h2>
        {items.length === 0 ? (
          <div className="cartpage__empty">
            <p>Seu carrinho está vazio.</p>
            <Link to="/" className="cartpage__back">Voltar às compras</Link>
          </div>
        ) : (
          <div className="cartpage__content">
            <ul className="cartlist">
              {items.map(({ product, qty }) => (
                <li key={product.id} className="cartlist__item">
                  <img src={product.image} alt={product.title} className="cartlist__img" />
                  <div className="cartlist__info">
                    <div className="cartlist__title">{product.title}</div>
                    <div className="cartlist__price">R$ {product.price.toFixed(2)}</div>
                    <div className="cartlist__controls">
                      <button className="qtybtn" onClick={() => decrement(product.id)} aria-label="Diminuir">-</button>
                      <span className="qty">{qty}</span>
                      <button className="qtybtn" onClick={() => increment(product.id)} aria-label="Aumentar">+</button>
                      <button className="removebtn" onClick={() => remove(product.id)}>Remover</button>
                    </div>
                  </div>
                  <div className="cartlist__subtotal">R$ {(qty * product.price).toFixed(2)}</div>
                </li>
              ))}
            </ul>
            <aside className="cartsummary">
              <div className="cartsummary__line">
                <span>Itens</span>
                <span>{count}</span>
              </div>
              <div className="cartsummary__line cartsummary__total">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <button className="cartsummary__checkout" onClick={() => alert('Fluxo de checkout a implementar')}>Finalizar compra</button>
              <button className="cartsummary__clear" onClick={clear}>Esvaziar carrinho</button>
              <Link to="/" className="cartpage__back">Continuar comprando</Link>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

