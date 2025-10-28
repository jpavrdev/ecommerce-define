import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__wrap">
        <div className="footer__brand">Construclick</div>
        <div style={{ fontSize: 14 }}>Loja virtual de material de construção.</div>
        <small className="footer__small">© {new Date().getFullYear()} Construclick. Todos os direitos reservados.</small>
      </div>
    </footer>
  );
}
