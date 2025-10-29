import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api, getToken } from '../api';

type Props = { children: React.ReactNode };

export function RequireAuth({ children }: Props) {
  const location = useLocation();
  const hasToken = !!getToken();
  const [checking, setChecking] = useState(hasToken);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!hasToken) return;
    let mounted = true;
    api
      .me()
      .then(() => mounted && setOk(true))
      .catch(() => mounted && setOk(false))
      .finally(() => mounted && setChecking(false));
    return () => {
      mounted = false;
    };
  }, [hasToken]);

  if (!hasToken) return <Navigate to={`/login`} state={{ from: location }} replace />;
  if (checking) return <div style={{ padding: 24 }}>Verificando sessão...</div>;
  if (!ok) return <Navigate to={`/login`} state={{ from: location }} replace />;
  return <>{children}</>;
}

export function RequireAdmin({ children }: Props) {
  const location = useLocation();
  const hasToken = !!getToken();
  const [checking, setChecking] = useState(hasToken);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!hasToken) return;
    let mounted = true;
    api
      .me()
      .then((u: any) => mounted && setOk(u?.role === 'admin'))
      .catch(() => mounted && setOk(false))
      .finally(() => mounted && setChecking(false));
    return () => {
      mounted = false;
    };
  }, [hasToken]);

  if (!hasToken) return <Navigate to={`/login`} state={{ from: location }} replace />;
  if (checking) return <div style={{ padding: 24 }}>Verificando permissões...</div>;
  if (!ok) return <Navigate to={`/`} replace />;
  return <>{children}</>;
}

