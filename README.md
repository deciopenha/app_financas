# Finanças Pessoais App

Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase (Auth + PostgreSQL + RLS) + Recharts.

## Configuração

1. Crie um projeto em [supabase.com](https://supabase.com).
2. No **SQL Editor**, execute [supabase/schema.sql](supabase/schema.sql) (tabela `transactions` + políticas RLS).
3. Em **Authentication → Providers → Email**, deixe e-mail/senha habilitado (desative "Confirm email" para testar sem confirmar).
4. Copie `.env.local.example` para `.env.local` e preencha com a URL e a anon key (Project Settings → API).
5. `npm install` e `npm run dev` → http://localhost:3000

## Deploy (Vercel)

Suba o repositório no GitHub, importe na Vercel e defina as mesmas variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Estrutura

- `src/app/page.tsx` — landing page
- `src/app/login` — login e cadastro
- `src/app/(app)/dashboard` — cards de resumo + gráfico de pizza por categoria
- `src/app/(app)/transacoes` — CRUD, filtros (mês/ano, categoria, busca) e exportação CSV
- `src/proxy.ts` — proteção de rotas (Next 16: Proxy substitui o Middleware)
