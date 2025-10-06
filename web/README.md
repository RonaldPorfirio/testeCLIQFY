# Sistema de Ordens de Serviço

Sistema completo de gerenciamento de ordens de serviço desenvolvido com React, Next.js e TypeScript.

##  Funcionalidades

-  **Autenticação**: Sistema de login com proteção de rotas
-  **Listagem de Ordens**: Visualização com filtros, busca e paginação
-  **Detalhes com Timeline**: Acompanhamento completo do histórico de cada ordem
-  **Dashboard de Relatórios**: Análises e gráficos de desempenho
-  **React Query**: Gerenciamento eficiente de estado e cache
-  **TypeScript**: Tipagem completa em todo o projeto
-  **Testes Unitários**: Cobertura de componentes principais

##  Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **UI**: React 19 + Tailwind CSS v4
- **Componentes**: shadcn/ui + Radix UI
- **Estado**: React Query (@tanstack/react-query)
- **Gráficos**: Recharts
- **Testes**: Jest + React Testing Library
- **Ícones**: Lucide React

## Instalação

\`\`\`bash
# Instalar dependências
npm install
# ou
pnpm install

# Executar em desenvolvimento
npm run dev

# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Build para produção
npm run build
\`\`\`

## Credenciais de Teste

Para acessar o sistema, use:

- **Email**: admin@example.com
- **Senha**: admin123

##  Estrutura do Projeto

\`\`\`
├── app/                      # Páginas Next.js (App Router)
│   ├── login/               # Página de login
│   ├── orders/              # Listagem e detalhes de ordens
│   └── reports/             # Dashboard de relatórios
├── components/              # Componentes React
│   ├── orders/             # Componentes de ordens
│   ├── reports/            # Componentes de relatórios
│   └── ui/                 # Componentes UI (shadcn)
├── contexts/               # Contextos React (Auth)
├── lib/                    # Utilitários e configurações
│   ├── api.ts             # Cliente API com mock
│   ├── types.ts           # Tipos TypeScript
│   └── query-provider.tsx # Provider React Query
├── __tests__/             # Testes unitários
└── hooks/                 # Custom hooks

\`\`\`

##  Testes

O projeto inclui testes unitários para os principais componentes:

- **OrderCard**: Testa renderização de cards de ordens
- **Timeline**: Valida exibição de eventos cronológicos
- **StatsCard**: Verifica cards de estatísticas

Execute os testes com:

\`\`\`bash
npm test
\`\`\`

##  Design

O sistema utiliza um tema dark profissional inspirado no Vercel, com:

- Paleta de cores consistente e acessível
- Componentes responsivos
- Animações suaves
- Tipografia clara e legível

##  API

O projeto está configurado para consumir uma API C# através do cliente em `lib/api.ts`. Durante o desenvolvimento, utiliza dados mock para facilitar o teste das funcionalidades.

Para conectar à API real, configure a variável de ambiente:

\`\`\`env
NEXT_PUBLIC_API_URL=https://sua-api.com/api
\`\`\`

##  Funcionalidades Detalhadas

### Autenticação
- Login com email/senha
- Proteção de rotas
- Gerenciamento de sessão com localStorage
- Redirecionamento automático

### Ordens de Serviço
- Listagem paginada
- Filtros por status e prioridade
- Busca por título e cliente
- Visualização de detalhes completos
- Timeline de eventos

### Relatórios
- Estatísticas gerais
- Gráficos de status e prioridade
- Métricas de desempenho
- Taxa de conclusão


## API (dev) - configuração rápida

Para usar a API real de relatórios mantendo mocks nas demais rotas, crie `web/.env.local` com:

```env
# URL base da API Node (NestJS) — prefixo /api
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Mantém mocks por padrão, exceto relatórios
NEXT_PUBLIC_USE_MOCKS=true
NEXT_PUBLIC_REPORTS_USE_REAL=true
```

Detalhes:
- O backend Node foi ajustado para ouvir em `http://localhost:5000` e usa prefixo global `/api`.
- `GET /api/reports` (Node) integra `GET http://localhost:5137/reports/daily` (C#) e retorna no formato esperado pelo front.

## Configuração da API (desenvolvimento)

Para consumir a API real ao invés dos mocks no front-end, crie um arquivo `.env.local` na pasta `web` com:

```env
# Desabilita mocks no front-end
NEXT_PUBLIC_USE_MOCKS=false

# URL base da API Node (NestJS)
# Exemplo: backend Node rodando na porta 3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Notas:
- O backend Node expõe `GET /reports`, que mapeia o `GET /reports/daily` do serviço C# para o formato esperado pelo front-end.
- O microserviço C# roda por padrão em `http://localhost:5137` (conforme `launchSettings.json`).
