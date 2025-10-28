import React, { useState, useEffect } from 'react';
import { api, getToken } from '../api';

type User = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  dateOfBirth?: string | null;
};

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset' | 'profile'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getToken()) {
      api.me().then((u) => { setUser(u); setView('profile'); }).catch(() => setView('login'));
    }
  }, []);

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', display: 'grid', gap: 12 }}>
      <h2>Minha conta</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setView('login')} disabled={view === 'login'}>Entrar</button>
        <button onClick={() => setView('register')} disabled={view === 'register'}>Criar conta</button>
        <button onClick={() => setView('forgot')} disabled={view === 'forgot'}>Esqueci minha senha</button>
      </div>

      {view === 'login' && <LoginForm onSuccess={(u) => { setUser(u); setView('profile'); }} onError={setError} />}
      {view === 'register' && <RegisterForm onSuccess={() => setView('login')} onError={setError} />}
      {view === 'forgot' && <ForgotPasswordForm onSuccess={() => setView('reset')} onError={setError} />}
      {view === 'reset' && <ResetPasswordForm onSuccess={() => setView('login')} onError={setError} />}
      {view === 'profile' && user && <Profile user={user} />}
    </div>
  );
}

function LoginForm({ onSuccess, onError }: { onSuccess: (u: User) => void; onError: (m: string | null) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); onError(null); setSubmitting(true);
    try { const { user } = await api.login({ email, password }); onSuccess(user); } catch (e) { onError((e as Error).message); } finally { setSubmitting(false); }
  }
  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <label> Email <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required/></label>
      <label> Senha <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required/></label>
      <button type="submit" disabled={submitting}>{submitting?'Entrando...':'Entrar'}</button>
    </form>
  );
}

function RegisterForm({ onSuccess, onError }: { onSuccess: ()=>void; onError: (m: string | null)=>void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [submitting, setSubmitting] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); onError(null); setSubmitting(true);
    try { await api.register({ firstName, lastName, email, password, dateOfBirth: dateOfBirth || undefined }); onSuccess(); } catch (e) { onError((e as Error).message); } finally { setSubmitting(false); }
  }
  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <label> Primeiro nome <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} required/></label>
      <label> Sobrenome <input value={lastName} onChange={(e)=>setLastName(e.target.value)} required/></label>
      <label> Email <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required/></label>
      <label> Senha <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" required/></label>
      <label> Data de nascimento <input value={dateOfBirth} onChange={(e)=>setDateOfBirth(e.target.value)} type="date"/></label>
      <button type="submit" disabled={submitting}>{submitting ? 'Criando...' : 'Criar conta'}</button>
    </form>
  );
}

function ForgotPasswordForm({ onSuccess, onError }: { onSuccess: ()=>void; onError: (m: string | null)=>void }) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  async function submit(e: React.FormEvent){ e.preventDefault(); onError(null); setSubmitting(true); try{ await api.forgotPassword({ email }); onSuccess(); }catch(e){ onError((e as Error).message);}finally{ setSubmitting(false);} }
  return (
    <form onSubmit={submit} style={{ display:'grid', gap:8 }}>
      <label> Email <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" required/></label>
      <button type="submit" disabled={submitting}>{submitting?'Enviando...':'Enviar instruções'}</button>
    </form>
  );
}

function ResetPasswordForm({ onSuccess, onError }: { onSuccess: ()=>void; onError: (m: string | null)=>void }) {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  async function submit(e: React.FormEvent){ e.preventDefault(); onError(null); setSubmitting(true); try{ await api.resetPassword({ token, newPassword }); onSuccess(); }catch(e){ onError((e as Error).message);}finally{ setSubmitting(false);} }
  return (
    <form onSubmit={submit} style={{ display:'grid', gap:8 }}>
      <label> Token <input value={token} onChange={(e)=>setToken(e.target.value)} required/></label>
      <label> Nova senha <input value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} type="password" required/></label>
      <button type="submit" disabled={submitting}>{submitting?'Redefinindo...':'Redefinir senha'}</button>
    </form>
  );
}

function Profile({ user }: { user: User }) {
  const name = user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name) || 'Usuário';
  return (
    <div style={{ display:'grid', gap:8 }}>
      <div>Olá, {name} 👋</div>
      <div>{user.email}</div>
      {user.dateOfBirth ? <div>Nascimento: {user.dateOfBirth}</div> : null}
    </div>
  );
}

