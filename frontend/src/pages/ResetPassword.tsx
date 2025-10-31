import React, { useMemo, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { api } from '../api';
import './Login.css';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ResetPasswordPage() {
  const q = useQuery();
  const navigate = useNavigate();
  const tokenFromUrl = q.get('token') || '';

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setMsg(null); setError(null);
    if (!token.trim()) { setError('Token inválido'); return; }
    if (!password || password.length < 8) { setError('Senha deve ter no mínimo 8 caracteres'); return; }
    if (password !== confirm) { setError('As senhas não conferem'); return; }
    setSubmitting(true);
    try {
      const res = await api.resetPassword({ token, newPassword: password });
      setMsg((res as any)?.message || 'Senha redefinida com sucesso');
      setTimeout(() => navigate('/login'), 1200);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Redefinir senha" subtitle="Informe o token e a nova senha">
      {msg && <div className="success" aria-live="polite">{msg}</div>}
      {error && <div className="error" aria-live="polite">{error}</div>}
      <form onSubmit={submit} className="auth-form">
        <label className="auth-row">
          <span className="auth-label">Token</span>
          <input value={token} onChange={(e)=>setToken(e.target.value)} placeholder="Cole aqui o token recebido" className="input" required />
        </label>
        <label className="auth-row">
          <span className="auth-label">Nova senha</span>
          <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="Nova senha" className="input" required />
        </label>
        <label className="auth-row">
          <span className="auth-label">Confirmar senha</span>
          <input value={confirm} onChange={(e)=>setConfirm(e.target.value)} type="password" placeholder="Confirmar senha" className="input" required />
        </label>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Redefinindo...' : 'Redefinir senha'}
        </button>
        <div className="auth-actions">
          <Link to="/login" className="link">Voltar ao login</Link>
          <span />
        </div>
      </form>
    </AuthLayout>
  );
}

