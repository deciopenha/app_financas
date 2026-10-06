# Finanças Pessoais App

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase (Auth + PostgreSQL + RLS) + Recharts.

## Configuração local

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute [supabase/schema.sql](supabase/schema.sql) (tabela `transactions` + políticas RLS).
3. Em **Authentication → Providers → Email**, deixe e-mail/senha habilitado.
4. Copie `.env.local.example` para `.env.local` e preencha com a URL e a chave pública (Project Settings → API).
5. `npm install` e `npm run dev` → http://localhost:3000

## Segurança

- Só a **URL** e a chave **anon/publishable** do Supabase são usadas, e ambas são públicas por design (ficam no navegador). A proteção dos dados vem do **Row Level Security**: cada usuário só lê e altera as próprias transações.
- **Nunca** coloque a `service_role` / secret key nem a senha do banco no projeto ou em variáveis `NEXT_PUBLIC_*`.
- `.env.local` está no `.gitignore` e não é versionado.
- Cabeçalhos de segurança (nosniff, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy) em [next.config.ts](next.config.ts).

## Deploy na Vercel

1. Em vercel.com, **Add New → Project** e importe este repositório.
2. Em **Root Directory**, selecione `financas-app` (o app fica numa subpasta). Framework: Next.js (detectado automaticamente).
3. Em **Environment Variables**, adicione (Production, Preview e Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**.
5. No Supabase, em **Authentication → URL Configuration**, defina **Site URL** com a URL da Vercel e inclua `https://SEU-APP.vercel.app/**` em **Redirect URLs**.

## Estrutura

- `src/app/page.tsx`: landing page
- `src/app/login`: login e cadastro
- `src/app/(app)/dashboard`: cards de resumo + gráficos de receitas e despesas por categoria
- `src/app/(app)/transacoes`: CRUD, filtros (mês/ano, categoria, busca) e exportação CSV
- `src/proxy.ts`: proteção de rotas (Next 16: Proxy substitui o Middleware)
