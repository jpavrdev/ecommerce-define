import React, { useState } from 'react';
import Header from '../components/Header';
import './Admin.css';
import { api } from '../api';

export default function AdminPage() {
  return (
    <div className="page">
      <Header />
      <main className="admin">
        <h2 className="admin__title">ConfiguraÃ§Ãµes</h2>
        <section className="admin__card">
          <h3 style={{ margin: 0 }}>Novo produto</h3>
          <CreateProductForm />
        </section>
      </main>
    </div>
  );
}

function CreateProductForm() {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [brandName, setBrandName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setSaving(true);
    try {
      await api.createProduct({ name, sku, price: parseFloat(price), brandName: brandName || undefined, imageUrl: imageUrl || undefined });
      setMsg('Produto criado com sucesso');
      setName(''); setSku(''); setPrice(''); setBrandName(''); setImageUrl('');
    } catch (e) {
      setMsg((e as Error).message);
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <div className="admin__cols">
        <label className="admin__row">
          <span className="auth-label">Nome</span>
          <input className="input" value={name} onChange={(e)=>setName(e.target.value)} required />
        </label>
        <label className="admin__row">
          <span className="auth-label">SKU</span>
          <input className="input" value={sku} onChange={(e)=>setSku(e.target.value)} required />
        </label>
      </div>
      <div className="admin__cols">
        <label className="admin__row">
          <span className="auth-label">PreÃ§o</span>
          <input className="input" value={price} onChange={(e)=>setPrice(e.target.value)} type="number" step="0.01" required />
        </label>
        <label className="admin__row">
          <span className="auth-label">Marca</span>
          <input className="input" value={brandName} onChange={(e)=>setBrandName(e.target.value)} placeholder="Opcional" />
        </label>
      </div>
      <label className="admin__row">
        <span className="auth-label">Imagem (URL)</span>
        <input className="input" value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} placeholder="https://..." />
      </label>
      {msg && <div className="error" aria-live="polite">{msg}</div>}
      <div className="admin__actions">
        <button className="btn-primary" type="submit" disabled={saving}>{saving? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  );
}


