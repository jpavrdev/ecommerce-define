import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { api } from '../api';
import './Register.css';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
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
      await api.register({ firstName, lastName, email, password, dateOfBirth: dateOfBirth || undefined });
      navigate('/login');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Bem-vindo(a) à Construclick">
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit} className="auth-form">
        <div className="auth-cols">
          <label className="auth-row">
            <span className="auth-label">Primeiro nome</span>
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Primeiro nome" className="input" />
          </label>
          <label className="auth-row">
            <span className="auth-label">Sobrenome</span>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sobrenome" className="input" />
          </label>
        </div>
        <label className="auth-row">
          <span className="auth-label">Data de nascimento</span>
          <input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} type="date" className="input" />
        </label>
        <label className="auth-row">
          <span className="auth-label">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="input" />
        </label>
        <label className="auth-row">
          <span className="auth-label">Senha</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" className="input" />
        </label>
        <button type="submit" disabled={submitting} className="btn-primary">
          {submitting ? 'Criando...' : 'Criar conta'}
        </button>
        <div>
          <span>Já tem conta? </span>
          <Link to="/login" className="link">Entrar</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
