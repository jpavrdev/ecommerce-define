import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  function submit(e: React.FormEvent) { e.preventDefault(); setSent(true); }
  return (
    <div>
      <Header />
      <main style={{ maxWidth: 720, margin: '24px auto', padding: '0 16px' }}>
        <h2>Fale conosco</h2>
        {sent ? (
          <div style={{ background:'#e6f4ea', color:'#1e7e34', padding:12, borderRadius:6 }}>Mensagem enviada! Em breve entraremos em contato.</div>
        ) : (
          <form onSubmit={submit} style={{ display:'grid', gap:12 }}>
            <label>Nome <input className="input" value={name} onChange={(e)=>setName(e.target.value)} required /></label>
            <label>Email <input className="input" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></label>
            <label>Mensagem <textarea className="input" rows={6} value={message} onChange={(e)=>setMessage(e.target.value)} required /></label>
            <button className="btn-primary" type="submit">Enviar</button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}

