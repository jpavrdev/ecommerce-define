import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__wrap">
        <div className="footer__links">
          <a href="#">Condições de Uso</a>
          <span className="sep">|</span>
          <a href="#">Notificação de Privacidade</a>
          <span className="sep">|</span>
          <a href="#">Cookies</a>
          <span className="sep">|</span>
          <a href="#">Anúncios Baseados em Interesses</a>
        </div>

        <div className="footer__copyright">© {year} Construclick, Inc. e suas afiliadas</div>

        <div className="footer__legal">Construclick Comércio de Materiais Ltda. | CNPJ 12.345.678/0001-99</div>

        <div className="footer__contact">
          Av. Juscelino Kubitschek, 2041, Torre E, 18º andar – São Paulo – SP, CEP: 04543-011
          <span className="sep">|</span>
          <Link to="/contact" className="footer__link">Fale conosco</Link>
          <span className="sep">|</span>
          <a href="mailto:contato@construclick.com.br" className="footer__link">contato@construclick.com.br</a>
        </div>

        <div className="footer__payments">
          Formas de pagamento aceitas: cartões de crédito (Visa, MasterCard, Elo e American Express), cartões de débito (Visa e Elo), Boleto e Pix.
        </div>
      </div>
    </footer>
  );
}
