import React from 'react';
import { Link } from 'react-router-dom';
import './AuthLayout.css';

type Props = { title: string; subtitle?: string; children: React.ReactNode };

export default function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <div className="auth-shell">
      <header className="auth-header">
        <div className="auth-header__wrap">
          <Link to="/" className="auth-logo-link">
            <img src="/images/construclick_logo_wordmark_v2.svg" alt="Construclick" className="auth-logo" />
          </Link>
        </div>
      </header>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-card__head">
            <h1 className="auth-card__title">{title}</h1>
            {subtitle ? <p className="auth-card__subtitle">{subtitle}</p> : null}
          </div>
          <div className="auth-card__body">{children}</div>
        </div>
      </main>
      <footer className="auth-footer">© {new Date().getFullYear()} Construclick</footer>
    </div>
  );
}
