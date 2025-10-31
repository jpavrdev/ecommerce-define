import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { api } from '../api';
import './Login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.login({ email, password });
      navigate('/');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Acesse sua conta Construclick">
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit} className="auth-form">
        <label className="auth-row">
          <span className="auth-label">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="input" />
        </label>
        <label className="auth-row">
          <span className="auth-label">Senha</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" className="input" />
        </label>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
        <div className="auth-actions">
          <Link to="/register" className="link">Criar conta</Link>
          <Link to="/forgot" className="link">Esqueci minha senha</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
