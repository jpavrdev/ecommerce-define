import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { api, getToken } from '../api';

type User = { id: number; email: string; firstName?: string; lastName?: string; fullName?: string; name?: string };

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (getToken()) {
      api.me().then((u) => setUser(u as any)).catch(() => setUser(null));
    }
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const displayName = user?.fullName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : undefined);

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
        {user ? (
          <div className="header__right">
            <div className="dropdown" ref={menuRef}>
              <button className="userbox__btn" onClick={() => setOpen((v) => !v)} aria-haspopup="menu" aria-expanded={open}>
                <div className="userbox">
                  <span className="userbox__hello">Olá{displayName ? ',' : ''}</span>
                  <span className="userbox__name">{displayName || user.email}</span>
                </div>
                <svg className="caret" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              {open && (
                <div className="dropdown__menu" role="menu">
                  {user && (user as any).role === 'admin' && (
                    <Link to="/admin" className="dropdown__item" onClick={() => setOpen(false)}>
                      Configurações
                    </Link>
                  )}
                  <button className="dropdown__item" onClick={() => { api.logout(); setUser(null); setOpen(false); }}>
                    Sair
                  </button>
                </div>
              )}
            </div>
            <Link to="/cart" className="cart" aria-label="Carrinho">
              <svg className="cart__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM3 4h2l2.6 10.39A2 2 0 0 0 9.53 16h7.94a2 2 0 0 0 1.93-1.61L22 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Carrinho
            </Link>
          </div>
        ) : (
          <nav className="header__nav">
            <Link to="/login" className="header__link">Entrar</Link>
            <Link to="/register" className="header__link header__link--primary">Criar conta</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
