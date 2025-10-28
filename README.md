Ecommerce Define – Monorepo (React + Express + Sequelize + MySQL)

Estrutura
- `backend/`: API Node/Express com TypeScript, Sequelize (MySQL) e JWT
- `frontend/`: SPA React + Vite + TypeScript

Pré‑requisitos
- Node.js 18+
- MySQL 8 (ou compatível)

Configuração do banco
1) Crie um database (ex.: `ecommerce`).
2) Copie `backend/.env.example` para `backend/.env` e ajuste credenciais de DB e JWT.

Instalação
No Windows PowerShell, rode em cada pasta:

backend
1) `cd backend`
2) `npm install`
3) `npm run dev`
   - Servidor em `http://localhost:4000` (API em `/api`).

frontend
1) `cd frontend`
2) `npm install`
3) Copie `frontend/.env.example` para `frontend/.env` e ajuste `VITE_API_URL` (opcional)
4) `npm run dev`
   - App em `http://localhost:5173`

Endpoints principais
- `POST /api/auth/register` { name, email, password }
- `POST /api/auth/login` { email, password } → { token, user }
- `GET /api/auth/me` (Bearer token) → usuário autenticado

Notas
- O Sequelize usa `sequelize.sync()` para criar tabelas inicials (sem migrações). Para produção, prefira migrações e versionamento de schema.
- CORS está habilitado para desenvolvimento.

