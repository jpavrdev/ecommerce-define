import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header() {
  return (
    <header className="header">
      <div className="header__wrap">
        <Link to="/" className="brand">
          <img src="/images/construclick_logo_wordmark_v2.svg" alt="Construclick" className="brand__logo" />
        </Link>
        <div className="search">
          <form action="#" className="search__form" onSubmit={(e) => e.preventDefault()}>
            <input className="search__input" placeholder="Buscar produtos, marcas e categorias" />
            <button className="search__btn">Buscar</button>
          </form>
        </div>
        <nav className="header__nav">
          <Link to="/login" className="header__link">Entrar</Link>
          <Link to="/register" className="header__link header__link--primary">Criar conta</Link>
        </nav>
      </div>
    </header>
  );
}
