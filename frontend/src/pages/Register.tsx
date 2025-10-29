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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string | undefined }>({});
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const errs: { [k: string]: string } = {};
    if (!firstName.trim()) errs.firstName = 'Primeiro nome é obrigatório';
    if (!lastName.trim()) errs.lastName = 'Sobrenome é obrigatório';
    if (!email.trim()) errs.email = 'Email é obrigatório';
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = 'Email inválido';
    if (!password) errs.password = 'Senha é obrigatória';
    else if (password.length < 8) errs.password = 'Senha deve ter no mínimo 8 caracteres';
    if (!confirmPassword) errs.confirmPassword = 'Confirmação de senha é obrigatória';
    else if (confirmPassword !== password) errs.confirmPassword = 'As senhas não conferem';
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      await api.register({ firstName, lastName, email, password, confirmPassword, dateOfBirth: dateOfBirth || undefined });
      navigate('/login');
    } catch (e) {
      const err = e as any;
      setError(err.message);
      if (err?.details) setFieldErrors(err.details);
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
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Primeiro nome" className={`input ${fieldErrors.firstName ? 'input--error' : ''}`} />
            {fieldErrors.firstName && <small className="field-error">{fieldErrors.firstName}</small>}
          </label>
          <label className="auth-row">
            <span className="auth-label">Sobrenome</span>
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sobrenome" className={`input ${fieldErrors.lastName ? 'input--error' : ''}`} />
            {fieldErrors.lastName && <small className="field-error">{fieldErrors.lastName}</small>}
          </label>
        </div>
        <label className="auth-row">
          <span className="auth-label">Data de nascimento</span>
          <input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} type="date" className="input" />
        </label>
        <label className="auth-row">
          <span className="auth-label">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className={`input ${fieldErrors.email ? 'input--error' : ''}`} />
          {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
        </label>
        <label className="auth-row">
          <span className="auth-label">Senha</span>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" className={`input ${fieldErrors.password ? 'input--error' : ''}`} />
          {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
        </label>
        <label className="auth-row">
          <span className="auth-label">Confirmar senha</span>
          <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirmar senha" className={`input ${fieldErrors.confirmPassword ? 'input--error' : ''}`} />
          {fieldErrors.confirmPassword && <small className="field-error">{fieldErrors.confirmPassword}</small>}
        </label>
        <div className="auth-center">
          <button type="submit" disabled={submitting} className="btn-primary btn-md">
            {submitting ? 'Criando...' : 'Criar conta'}
          </button>
        </div>
        <div className="auth-bottom">
          <span>Já tem conta? </span>
          <Link to="/login" className="link">Entrar</Link>
        </div>
      </form>
    </AuthLayout>
  );
}
