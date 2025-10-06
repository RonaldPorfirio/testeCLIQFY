# Teste CLIQFY - Guia do Monorepo

Este repositorio contem quatro aplicacoes coordenadas para o desafio da CLIQFY:

- **backend-node/** - API NestJS responsavel por autenticacao, ordens de servico, check-ins e relatorios agregados. Agora utiliza PostgreSQL via Prisma.
- **web/** - Front-end Next.js (App Router) para uso no desktop.
- **mobile/** - Aplicativo Expo/React Native focado na execucao em campo, com check-in (GPS + foto).
- **service-csharp/** - Servico auxiliar em .NET que expoe relatorios consumidos pelo backend Node.

## Requisitos minimos

| Componente | Versao sugerida |
|------------|-----------------|
| Node.js    | 18 LTS          |
| npm        | >= 10           |
| PostgreSQL | 15+             |
| .NET SDK   | 8.0             |
| Expo CLI   | `npm i -g expo` (opcional, `npx expo` ja funciona) |

## Backend Node (NestJS + Prisma)
```bash
cd backend-node
npm install
npm run prisma:generate
# configure o DATABASE_URL antes da migracao
npm run prisma:migrate
npm run prisma:seed   # popula usuarios e ordens de exemplo
npm run start:dev
```
- API: `http://localhost:5000/api`
- Swagger: `http://localhost:5000/api/docs`
- Defina `DATABASE_URL` (ex.: `postgresql://postgres:postgres@localhost:5432/teste_cliqfy`).

## Servico de relatorios (.NET)
```bash
cd service-csharp/ReportsService
dotnet restore
dotnet run
```
- Endpoint: `http://localhost:5137/reports/daily`
- O NestJS consome o servico automaticamente (`ReportsService`).

## Front-end Web (Next.js)
```bash
cd web
npm install
npm run dev
```
- Disponivel em `http://localhost:3000`
- Requer backend ativo para autenticacao e dados.

## Mobile (Expo / React Native)
```bash
cd mobile
npm install
# Se estiver em dispositivo fisico, ajuste o backend abaixo
# echo "EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api" > .env.local
npx expo start
```
- Permissoes obrigatorias: localizacao, camera e galeria.
- Fluxo de check-in solicita permissoes em sequencia, captura GPS + foto e envia para `POST /api/checkins/:id`.

## Qualidade e arquitetura
- **Backend:** modulos segregados (auth, workorders, checkins, reports), RBAC (`admin`, `agent`, `viewer`), logs estruturados (`nestjs-pino`) e persistencia com Prisma/PostgreSQL.
- **Web:** React Query para consumo da API, paginas tipadas em TypeScript, filtros/paginacao e tela de relatorios consumindo o microservico .NET.
- **Mobile:** telas divididas em `app/`, estado global no hook `useAuth`, design tokens em `constants/design.ts` e check-in com fallback offline basico (AsyncStorage).

## Testes
| Projeto        | Comando                                       |
|----------------|-----------------------------------------------|
| backend-node   | `npm run test` / `npm run test:e2e`           |
| web            | `npm run test`                                |
| mobile         | `npx tsc --noEmit` + `npm run lint` (Expo)    |
| service-csharp | `dotnet test` (se houver testes)              |

## CI/CD
Um workflow GitHub Actions (`.github/workflows/ci.yml`) executa automaticamente:
1. `npm install` para backend, web e mobile;
2. `npm run prisma:generate`, `npm run build` e `npm run test -- --runInBand` no backend;
3. `npm run lint` + `npm run test` no web;
4. `npx tsc --noEmit` no mobile.

## Variaveis de ambiente uteis
- `DATABASE_URL` - Conexao PostgreSQL (backend).
- `JWT_SECRET` - Chave usada pelo Nest para assinar tokens.
- `EXPO_PUBLIC_API_URL` - Override do backend no app mobile.


Bons testes!