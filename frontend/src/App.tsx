import React, { useEffect, useState } from 'react';
import { api, getToken } from './api';

type User = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  dateOfBirth?: string | null;
};

export default function App() {
  const [view, setView] = useState<'login' | 'register' | 'profile'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (getToken()) {
      setLoading(true);
      api
        .me()
        .then(setUser)
        .then(() => setView('profile'))
        .catch(() => setView('login'))
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <div style={{ maxWidth: 420, margin: '4rem auto', fontFamily: 'Inter, system-ui, Arial' }}>
      <h1 style={{ textAlign: 'center' }}>Ecommerce Define</h1>
      {loading && <p>Carregando...</p>}
      {error && (
        <p style={{ color: 'crimson' }}>
          {error}
        </p>
      )}

      {view !== 'profile' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button onClick={() => setView('login')} disabled={view === 'login'}>
            Entrar
          </button>
          <button onClick={() => setView('register')} disabled={view === 'register'}>
            Criar conta
          </button>
        </div>
      )}

      {view === 'login' && (
        <LoginForm
          onSuccess={(u) => {
            setUser(u);
            setView('profile');
          }}
          onError={setError}
        />
      )}
      {view === 'register' && <RegisterForm onSuccess={() => setView('login')} onError={setError} />}
      {view === 'profile' && user && (
        <Profile
          user={user}
          onLogout={() => {
            api.logout();
            setUser(null);
            setView('login');
          }}
        />
      )}
    </div>
  );
}

function LoginForm({ onSuccess, onError }: { onSuccess: (user: User) => void; onError: (msg: string | null) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setSubmitting(true);
    try {
      const { user } = await api.login({ email, password });
      onSuccess(user);
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </label>
      <label>
        Senha
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}

function RegisterForm({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string | null) => void }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    onError(null);
    setSubmitting(true);
    try {
      await api.register({ firstName, lastName, email, password, dateOfBirth: dateOfBirth || undefined });
      onSuccess();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
      <label>
        Primeiro nome
        <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </label>
      <label>
        Sobrenome
        <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </label>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
      </label>
      <label>
        Senha
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
      </label>
      <label>
        Data de nascimento
        <input value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} type="date" />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Criando...' : 'Criar conta'}
      </button>
    </form>
  );
}

function Profile({ user, onLogout }: { user: User; onLogout: () => void }) {
  const displayName =
    user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name) || 'Usuário';
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <h2>Olá, {displayName} 👋</h2>
      <p>Email: {user.email}</p>
      {user.dateOfBirth ? <p>Nascimento: {user.dateOfBirth}</p> : null}
      <button onClick={onLogout}>Sair</button>
    </div>
  );
}

