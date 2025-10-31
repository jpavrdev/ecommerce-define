import React, { useState } from 'react';
import Header from '../components/Header';
import './Admin.css';
import { api } from '../api';

export default function AdminPage() {
  return (
    <div className="page">
      <Header />
      <main className="admin">
        <h2 className="admin__title">Configurações</h2>
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
  const [priceMasked, setPriceMasked] = useState('');
  const [brandName, setBrandName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Array<{ id: number; name: string }>>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function formatBRLMask(raw: string) {
    const onlyDigits = raw.replace(/\D/g, '');
    if (!onlyDigits) return '';
    const value = Number(onlyDigits) / 100;
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function parseBRLToNumber(mask: string): number | null {
    const digits = mask.replace(/\D/g, '');
    if (!digits) return null;
    return Number(digits) / 100;
  }

  function onPriceChange(v: string) {
    setPriceMasked(formatBRLMask(v));
    setPrice(v);
  }

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = (await api.listCategories()) as any[];
        if (!alive) return;
        setCategories(rows.map(r => ({ id: r.id, name: r.name })));
      } catch {
        // ignore
      }
    })();
    return () => { alive = false; };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setSaving(true);
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('sku', sku);
      const numeric = parseBRLToNumber(priceMasked) ?? parseFloat(price || '');
      form.append('price', String(numeric));
      if (categoryId) form.append('categoryId', categoryId);
      if (brandName) form.append('brandName', brandName);
      if (imageFile) form.append('image', imageFile);
      await api.createProduct(form);
      setMsg('Produto criado com sucesso');
      setName(''); setSku(''); setPrice(''); setPriceMasked(''); setBrandName(''); setCategoryId(''); setImageFile(null);
    } catch (e) {
      setMsg((e as Error).message);
    } finally { setSaving(false); }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <div className="admin__cols">
        <label className="admin__row">
          <span className="auth-label">Nome</span>
          <input className="input" placeholder="Ex.: Camiseta básica" value={name} onChange={(e)=>setName(e.target.value)} required />
        </label>
        <label className="admin__row">
          <span className="auth-label">SKU</span>
          <input className="input" placeholder="Ex.: CAMI-001" value={sku} onChange={(e)=>setSku(e.target.value)} required />
        </label>
      </div>
      <div className="admin__cols">
        <label className="admin__row">
          <span className="auth-label">Preço</span>
          <input className="input input--currency" placeholder="R$ 0,00" value={priceMasked} onChange={(e)=>onPriceChange(e.target.value)} inputMode="numeric" required />
        </label>
        <label className="admin__row">
          <span className="auth-label">Marca</span>
          <input className="input" value={brandName} onChange={(e)=>setBrandName(e.target.value)} placeholder="Opcional" />
        </label>
      </div>
      <label className="admin__row">
        <span className="auth-label">Categoria</span>
        <select className="input" value={categoryId} onChange={(e)=>setCategoryId(e.target.value)} required>
          <option value="" disabled>Selecione uma categoria</option>
          {categories.map(c => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="admin__row">
        <span className="auth-label">Imagem</span>
        <div className="file-input">
          <input id="image-upload" className="file-input__native" type="file" accept="image/*" onChange={(e)=> setImageFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)} />
          <label htmlFor="image-upload" className="file-input__button">Escolher arquivo</label>
          <span className="file-input__name">{imageFile ? imageFile.name : 'Nenhum arquivo escolhido'}</span>
        </div>
      </label>
      {msg && <div className="error" aria-live="polite">{msg}</div>}
      <div className="admin__actions">
        <button className="btn-primary" type="submit" disabled={saving}>{saving? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  );
}
