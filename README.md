# 🩸 Hemocione Digital Event

Plataforma digital do **Hemocione** para gestão de eventos de doação de sangue. O sistema virtualiza filas de doação em eventos presenciais, permitindo que doadores entrem na fila pelo celular, acompanhem sua posição em tempo real e recebam notificações quando for a sua vez — sem precisar esperar fisicamente no local.

Acesse em produção: **[eventos.hemocione.com.br](https://eventos.hemocione.com.br)**

---

## 📋 Funcionalidades

- **Listagem de eventos** de doação de sangue do Hemocione
- **Fila virtual** — doadores entram na fila pelo celular e acompanham sua posição em tempo real
- **Agendamento por horário** — inscrição em horários específicos do evento
- **Pré-triagem digital** — formulário de triagem antes do evento
- **Gestão de voluntários externos** — cadastro e gerenciamento de vagas para voluntários
- **Backoffice do evento** — chamada de participantes, gestão de fila, visualização de métricas
- **Visualização de bolsas de sangue** — animação em tempo real do progresso das doações
- **Captação de parceiros** (escolas, empresas, faculdades)
- **Integração com Hemocione ID** — autenticação e sincronização de doações
- **Notificações** por SMS e WhatsApp ao ser chamado na fila
- **Lembretes de evento** — notificações automáticas 24h, 2h e 1h antes do evento
- **Mapa interativo** — visualização da localização do evento com navegação
- **Cálculo de distância** — cálculo de distância até o evento com rotas (Google Maps/Waze)
- **Preferências de notificação** — controle de canais de comunicação do usuário
- **SEO e Schema.org** — eventos indexáveis pelo Google

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework full-stack | [Nuxt 3](https://nuxt.com) (Vue 3 + Nitro) |
| Linguagem | TypeScript |
| Gerenciamento de estado | [Pinia](https://pinia.vuejs.org) |
| UI Components | [Element Plus](https://element-plus.org) |
| Banco de dados | MongoDB (via [Mongoose](https://mongoosejs.com)) |
| Jobs em background | [Inngest](https://www.inngest.com) |
| Deploy | [Vercel](https://vercel.com) |
| Storage / CDN | AWS S3 + CDN própria (`cdn.hemocione.com.br`) |
| Notificações | AWS SQS/SNS, Discord Webhook, Slack Webhook |
| Observabilidade | OpenTelemetry + [Bugsnag](https://www.bugsnag.com) |
| Analytics | [PostHog](https://posthog.com), Vercel Analytics |
| Charts | [ApexCharts](https://apexcharts.com) (vue3-apexcharts) |
| Fontes | Google Fonts (Roboto) |
| Linting/Formatação | ESLint + Prettier |

---

## ✅ Pré-requisitos

- **Node.js** `v20` (veja `.nvmrc`) — recomendamos usar [nvm](https://github.com/nvm-sh/nvm)
- **Yarn** `1.x`
- **MongoDB** — instância local ou remota (veja Docker abaixo)
- **gh** CLI (opcional, para abrir Pull Requests pelo terminal)

---

## 🚀 Configuração e Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/hemocione/hemocione-digital-event.git
cd hemocione-digital-event
```

### 2. Use a versão correta do Node

```bash
nvm use
```

### 3. Instale as dependências

```bash
yarn install
```

### 4. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com as variáveis abaixo. Os valores com `*` são **obrigatórios** para o funcionamento básico local — os demais possuem valores padrão que funcionam em modo de desenvolvimento.

```env
# --- Banco de dados * ---
MONGODB_URI=mongodb://localhost:27017/admin?authSource=admin&readPreference=primary&directConnection=true&ssl=false
DB_NAME=hemo

# --- Autenticação ---
HEMOCIONE_ID_JWT_SECRET_KEY=secret
HEMOCIONE_ID_INTEGRATION_SECRET=secret
API_SECRET=secret
HEMOCIONE_AUTH_COOKIE_KEY=hemocioneId

# --- Serviços Hemocione ---
NUXT_HEMOCIONE_ID_API_URL=https://hemocione-id-dev.cpt.hemocione.com.br
HEMOCIONE_ID_URL=https://id.d.hemocione.com.br
HEMOCIONE_SITE_URL=https://www.hemocione.com.br
CAN_DONATE_INTEGRATION_URL=https://possodoar.d.hemocione.com.br/integration

# --- Google Maps ---
GOOGLE_MAPS_API_KEY=

# --- CDN / AWS S3 ---
CDN_BUCKET=hemocione-assets
CDN_BASE_PATH=events/dev/uploads
CDN_BASE_URL=https://cdn.hemocione.com.br

# --- Inngest (jobs em background) ---
INNGEST_EVENT_KEY=mock-key

# --- Digital Stand ---
DIGITAL_STAND_API_URL=https://us-east1-estande-digital.cloudfunctions.net/api
DIGITAL_STAND_API_SECRET=

# --- Notificações ---
DISCORD_WEBHOOK_URL=
EXTERNAL_VOLUNTEERS_SLACK_WEBHOOK=
DONATIONS_QUEUE_URL=

# --- Analytics / Monitoramento ---
BUGSNAG_API_KEY=
SIGNOS_ORGANIZATION_ID=

# --- Captação ---
CAPTATION_FORM_URL_SCHOOL=
CAPTATION_FORM_URL_COMPANY=
CAPTATION_FORM_URL_COLLEGE=
```

### 5. Suba o MongoDB com Docker (opcional)

Se não tiver o MongoDB instalado localmente, use o `docker-compose.yml` incluso:

```bash
docker compose up -d
```

O MongoDB ficará disponível em `localhost:27017`.

---

## 💻 Rodando Localmente

### Servidor de desenvolvimento (Nuxt)

```bash
yarn dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Servidor Inngest (jobs em background)

Em outro terminal, rode o servidor do Inngest para processar os jobs localmente:

```bash
yarn dev:inngest
```

Acesse o painel do Inngest: [http://localhost:8288](http://localhost:8288)

> **Dica:** Para funcionalidade completa, rode `yarn dev` e `yarn dev:inngest` simultaneamente.

### Build para produção

```bash
yarn build
```

### Preview do build de produção

```bash
yarn preview
```

---

## 📁 Estrutura do Projeto

```
hemocione-digital-event/
├── app.vue                   # Componente raiz da aplicação
├── app.config.ts             # Configurações do app (Analytics, etc.)
├── nuxt.config.ts            # Configuração central do Nuxt
├── docker-compose.yml        # MongoDB local via Docker
│
├── pages/                    # Rotas da aplicação (file-based routing)
│   ├── index.vue             # Listagem de eventos
│   ├── event/[eventSlug]/    # Detalhes, fila, agenda, pré-triagem, backoffice
│   ├── queue/                # Fluxo de entrada e acompanhamento de fila
│   └── captation/            # Formulários de captação de parceiros
│
├── components/               # Componentes Vue reutilizáveis
├── composables/              # Composables Vue (ex: useHemocioneSdk)
├── stores/                   # Stores Pinia (event, user)
├── layouts/                  # Layouts de página (default, noPadding, noScroll)
├── middleware/               # Middleware de rotas (ex: autenticação)
├── plugins/                  # Plugins Nuxt (auth, iframeControl, signos)
├── helpers/                  # Funções auxiliares de formatação e lógica
├── utils/                    # Utilitários gerais (URLs, formatação, etc.)
│
├── server/                   # Backend (Nitro — SSR + API)
│   ├── api/                  # Endpoints REST da API
│   │   └── v1/               # Versão 1 da API pública
│   ├── models/               # Modelos Mongoose (Event, Subscription, etc.)
│   ├── services/             # Serviços de negócio (auth, CDN, filas, etc.)
│   ├── inngest/              # Jobs e crons do Inngest
│   │   ├── crons/            # Tarefas agendadas
│   │   └── eventHandlers/    # Handlers de eventos assíncronos
│   └── plugins/              # Plugins do servidor (ex: mongoose.ts)
│
├── assets/                   # CSS global e recursos estáticos
├── public/                   # Arquivos públicos (favicon, imagens)
└── bruno-collection/         # Coleção Bruno para testar a API
```

### Principais rotas da API

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/v1/event` | Lista eventos públicos |
| POST | `/api/v1/event` | Cria um novo evento |
| GET | `/api/v1/event/:slug` | Detalhes de um evento |
| PUT | `/api/v1/event/:slug` | Atualiza um evento |
| POST | `/api/v1/event/:slug/queue/:queueId/participant` | Entra na fila |
| GET | `/api/v1/queue/:queueId/participant/:id/position` | Posição na fila |
| POST | `/api/v1/event/:slug/subscription` | Inscrição em horário |
| GET | `/api/v1/subscription/mine/next` | Próxima inscrição do usuário |
| POST | `/api/v1/image/upload` | Upload de imagem para CDN |
| POST | `/api/v1/event/:slug/location` | Calcula distância até o evento |
| GET | `/api/v1/notifications/preferences` | Preferências de notificação do usuário |
| PUT | `/api/v1/notifications/preferences` | Atualiza preferências de notificação |

---

## 🔔 Sistema de Notificações

O sistema envia notificações automáticas em múltiplos canais:

### Lembretes de Evento
- **24h antes** — Lembrete principal com informações do evento
- **2h antes** — Alerta de que o evento está próximo
- **1h antes** — Lembrete final

### Canais Suportados
- **SMS** — Via AWS SNS
- **WhatsApp** — Integração futura (placeholder)
- **Email** — Integração futura (placeholder)
- **Push Notification** — Integração futura (placeholder)

### Preferências do Usuário
Usuários podem configurar:
- Quais canais desejam receber
- Horários de lembrete (24h, 2h, 1h)
- Telefone/email para cada canal

---

## 🗺️ Funcionalidades de Localização

### Mapa Interativo
- Visualização do local do evento no Google Maps
- Botão "Ver no Google Maps" para navegação externa
- Botão "Compartilhar" usando Web Share API

### Cálculo de Distância
- Solicita permissão de geolocalização do usuário
- Calcula distância exata até o evento (fórmula de Haversine)
- Links diretos para rotas no Google Maps e Waze
- Indicação visual da distância (ex: "Você está a 4.2km do evento")

### Coordenadas Geográficas
Eventos podem ter coordenadas (lat/lng) cadastradas para:
- Precisão maior que endereço textual
- Cálculos de distância precisos
- Integração com apps de navegação

---

## 🔧 Linting e Formatação

```bash
# Verificar problemas
yarn lint

# Corrigir automaticamente
yarn lint:fix
```

O projeto usa **ESLint** com configuração TypeScript + Vue e **Prettier** para formatação.

---

## 🤝 Contribuindo

1. Faça um **fork** do repositório
2. Crie uma branch descritiva: `git checkout -b feat/minha-feature` ou `fix/meu-bug`
3. Faça suas alterações e garanta que o lint passe: `yarn lint`
4. Commit com mensagem clara seguindo [Conventional Commits](https://www.conventionalcommits.org/):
   ```
   feat: adiciona notificação por WhatsApp
   fix: corrige posição na fila quando participante é chamado
   docs: atualiza README
   ```
5. Abra um **Pull Request** para a branch `main` com descrição do que foi feito

> Para testar endpoints da API, use a coleção [Bruno](https://www.usebruno.com/) disponível em `bruno-collection/`.

---

## 📄 Licença

Este projeto é privado e pertence ao **Hemocione**. Entre em contato em [contato@hemocione.com.br](mailto:contato@hemocione.com.br) para mais informações.

---

<div align="center">
  Feito com ❤️ pelo time <a href="https://hemocione.com.br">Hemocione</a>
</div>
