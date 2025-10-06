# Teste CLIQFY - Guia

## Visão geral
Este repositório concentra quatro aplicações que compõem a solução proposta para o desafio CLIQFY:

- **backend-node/** – API NestJS responsável por autenticação, ordens de serviço, check-ins e relatórios agregados (PostgreSQL via Prisma).
- **web/** – Front-end Next.js (App Router) para uso no desktop.
- **mobile/** – Aplicativo Expo/React Native voltado à operação em campo (check-in com GPS e foto).
- **service-csharp/** – Serviço auxiliar em .NET que expõe relatórios consumidos pelo backend Node.

### Requisitos mínimos

| Componente | Versão sugerida |
|------------|-----------------|
| Node.js    | 18 LTS          |
| npm        | >= 10           |
| PostgreSQL | 15+             |
| .NET SDK   | 8.0             |
| Expo CLI   | `npm i -g expo` (opcional, `npx expo` já funciona) |

## Instruções de execução

### Backend Node (NestJS + Prisma)
```bash
cd backend-node
npm install
npm run prisma:generate
# configure o DATABASE_URL antes da migração
npm run prisma:migrate
npm run prisma:seed   # popula usuários e ordens de exemplo
npm run start:dev
```
- API: `http://localhost:5000/api`
- Swagger: `http://localhost:5000/api/docs`
- Defina `DATABASE_URL` (ex.: `postgresql://postgres:postgres@localhost:5432/teste_cliqfy`).

### Serviço de relatórios (.NET)
```bash
cd service-csharp/ReportsService
dotnet restore
dotnet run
```
- Endpoint exposto: `http://localhost:5137/reports/daily`
- O backend Node consome esse serviço diretamente (`ReportsService`).

### Front-end Web (Next.js)
```bash
cd web
npm install
npm run dev
```
- Disponível em `http://localhost:3000`
- Requer o backend ativo para autenticação e dados em tempo real.

### Mobile (Expo / React Native)
```bash
cd mobile
npm install
# Se estiver em dispositivo físico, ajuste o backend abaixo
# echo "EXPO_PUBLIC_API_URL=http://192.168.x.x:5000/api" > .env.local
npx expo start
```
- Permissões obrigatórias: localização, câmera e galeria.
- Fluxo de check-in solicita permissões em sequência, captura GPS + foto e envia para `POST /api/checkins/:id`.

### Testes
| Projeto        | Comando                                       |
|----------------|-----------------------------------------------|
| backend-node   | `npm run test` / `npm run test:e2e`           |
| web            | `npm run test`                                |
| mobile         | `npx tsc --noEmit` + `npm run lint` (Expo)    |
| service-csharp | `dotnet test` (quando houver testes)          |

## Usuários de teste
| Perfil  | Email                | Senha     |
|---------|----------------------|-----------|
| Admin   | `admin@example.com`  | `admin123`|
| Agente  | `agent@example.com`  | `agent123`|
| Visualizador | `viewer@example.com` | `viewer123` |

## Decisões técnicas
- **Arquitetura modular**: NestJS segmentado em módulos (auth, workorders, checkins, reports) com DI explícita via tokens.
- **Autenticação e RBAC**: JWT + guardas (`JwtAuthGuard`, `RolesGuard`) garantindo papéis `admin`, `agent`, `viewer` tanto na API quanto na UI.
- **Persistência**: Prisma ORM com PostgreSQL; seeds idempotentes popularizam usuários e ordens base.
- **Observabilidade**: `nestjs-pino` fornece logs estruturados prontos para integração com ferramentas externas.
- **Web**: Next.js App Router (React 18), React Query para cache/reatividade, componentes desacoplados (Radix + Tailwind).
- **Mobile**: Expo Router com armazenamento offline básico (AsyncStorage) para preservar check-ins até sincronização.
- **Integração externa**: Serviço .NET separado para relatórios, consumido via cliente HTTP dedicado no backend Node.

## Workflow CI/CD
O workflow GitHub Actions (`.github/workflows/ci.yml`) executa a cada push em `main` ou PR:
1. Instala dependências (cache npm por projeto).
2. `backend-node`: `npm run prisma:generate`, `npm run build`, `npm run test -- --runInBand`.
3. `web`: `npm run lint` e `npm run test -- --runInBand`.
4. `mobile`: `npx tsc --noEmit`.

## Pontos não implementados (backlog sugerido)
- Docker Compose orquestrando todos os serviços (PostgreSQL, API Node, Web, Mobile bundler e serviço .NET).
- Processamento de relatórios assíncrono via fila (Redis/RabbitMQ) para escalar cálculos pesados.
- Modo offline completo com fila de sincronização posterior (ordens, check-ins e anexos) em todas as plataformas.

## Variáveis de ambiente úteis
- `DATABASE_URL` – conexão PostgreSQL do backend.
- `JWT_SECRET` – chave usada para assinar tokens JWT.
- `EXPO_PUBLIC_API_URL` – override da URL base no app mobile.

Bons testes!
