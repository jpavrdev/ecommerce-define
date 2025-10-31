import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { api } from '../api';
import './Login.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setError(null); setSubmitting(true);
    try {
      const res = await api.forgotPassword({ email });
      const message = (res && (res as any).message) || 'Se existir, enviaremos instruções para o e-mail informado';
      setMsg(message);
      if ((res as any)?.devToken) setDevToken((res as any).devToken);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Esqueci minha senha" subtitle="Informe seu e-mail para receber o link de recuperação">
      {msg && <div className="success" aria-live="polite">{msg}</div>}
      {error && <div className="error" aria-live="polite">{error}</div>}
      <form onSubmit={submit} className="auth-form">
        <label className="auth-row">
          <span className="auth-label">Email</span>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="Email" className="input" required />
        </label>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
        </button>
      </form>
      {devToken && (
        <div className="devbox">Token de desenvolvimento: <code>{devToken}</code> – use <a href={`/reset?token=${encodeURIComponent(devToken)}`}>este link</a> para testar.</div>
      )}
    </AuthLayout>
  );
}
