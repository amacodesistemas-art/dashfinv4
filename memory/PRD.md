# Dashboard Financeiro B2B - Product Requirements Document

## Problema Original

O utilizador pretende construir um sistema de dashboard financeiro B2B profissional. A arquitetura consiste em:
- Frontend responsivo: HTML, JavaScript (ES6+), e Tailwind CSS (via CDN)
- Backend: Google Apps Script
- Base de dados: Google Sheets

Os clientes têm uma vista somente-leitura do dashboard. A equipa do utilizador gere toda a entrada de dados através do Google Sheets.

## Modelo de Negócio

### Estrutura de Planos

| Plano | Preço | IA | DRE | Alertas | Importação |
|-------|-------|-----|-----|---------|------------|
| Básico | R$ 297/mês | ❌ | ❌ | ❌ | ✅ |
| Profissional | R$ 597/mês | 30/mês | ✅ | ❌ | ✅ |
| Enterprise | R$ 1.297/mês | ∞ | ✅ | ✅ | ✅ |

### Custo de IA por Consulta
~R$ 0,003 (insignificante) - usando GPT-4o-mini

## O Que Foi Implementado

### Versão 3.3.0 (Dezembro 2025) ✅ ATUAL

#### Visão por Contas Bancárias (`JS_Accounts.html`) ✨ NEW
- Navegação por abas: Dashboard | Contas | DRE
- Cards visuais de cada conta com:
  - Saldo atual e projetado
  - Entradas e saídas do período
  - Últimas transações
  - Barra de progresso entradas vs saídas
- Modo lista para visão resumida
- Modal de detalhe por conta com:
  - Extrato completo filtrado
  - Análise por categoria
  - Opção de filtrar dashboard pela conta

#### Arquitetura Multi-Cliente
- Sistema centralizado para gerenciar 10, 100+ clientes
- URL única com parâmetro `?client=ID`
- Planilha ADMIN_MASTER para controle
- Um deploy = todos os clientes atualizados
- Log de acessos e uso de IA centralizado

#### Sistema de Alertas Automáticos (`AlertService.js`)
- 🔴 Fluxo de caixa crítico (projeção negativa)
- 💰 Inadimplência (faturas atrasadas)
- 📈 Despesas anormais (+50% da média)
- 🎯 Metas estouradas ou próximas do limite
- 📅 Vencimentos do dia
- 💵 Saldo baixo em contas
- Interface de alertas no dashboard

#### Categorização Automática com IA (`CategorizationService.js`)
- Regras de categorização configuráveis
- Categorização por IA quando não há regra
- Aprendizado com correções do usuário
- Batch processing para importações

#### Importação de Extratos (`ImportService.js`)
- Parser de arquivos OFX (padrão bancário)
- Parser de arquivos CSV configurável
- Detecção de duplicatas
- Aba de conciliação para revisão
- Categorização automática na importação
- Interface drag-and-drop

#### Frontend (`JS_Alerts.html`, `JS_Import.html`)
- Painel de alertas com prioridades
- Modal de importação com preview
- Configuração de CSV dinâmica
- Link direto para planilha de revisão

### Versão 3.2.0 (Dezembro 2025)
- Service Worker corrigido
- Chatbot IA com contexto de datas
- Sistema de limites de IA por plano
- Preços atualizados

### Versão 3.1.0 (Dezembro 2025)
- Correção do contexto de datas no chatbot
- Bug de acentuação corrigido

## Arquitectura

```
/app/
├── Backend (*.js → salvar como *.gs)
│   ├── Main.js          - Entrypoint, doGet, AI endpoint
│   ├── DataService.js   - Dados, planos, features
│   ├── AdminService.js  - Gestão multi-cliente ✨ NEW
│   ├── AlertService.js  - Alertas automáticos ✨ NEW
│   ├── CategorizationService.js - Categorização IA ✨ NEW
│   ├── ImportService.js - Importação OFX/CSV ✨ NEW
│   ├── ValidationService.js
│   └── Config.js
│
├── Frontend (*.html)
│   ├── index.html       - Página principal
│   ├── styles.html      - CSS customizado
│   ├── JS_Core.html     - Variáveis globais
│   ├── JS_Alerts.html   - Alertas UI ✨ NEW
│   ├── JS_Import.html   - Importação UI ✨ NEW
│   ├── JS_ChatAI.html   - Chatbot
│   ├── JS_Render.html   - Rendering
│   └── ...
│
├── PWA
│   ├── service-worker.html
│   └── manifest (dinâmico)
│
└── Documentação (*.md)
    ├── GUIA_MULTI_CLIENTE.md ✨ NEW
    ├── ESTRUTURA_PLANILHA.md ✨ NEW
    ├── ROADMAP_COMERCIAL.md ✨ NEW
    └── ...
```

## Schema da Base de Dados

### Planilha ADMIN_MASTER (Central)
| Aba | Colunas |
|-----|---------|
| CLIENTES | client_id, nome, spreadsheet_id, plano, status, data_inicio, consultas_ia_mes, ultimo_acesso |
| CONFIG_GLOBAL | chave, valor (API keys, limites) |
| LOG_SISTEMA | timestamp, client_id, acao, detalhes |

### Planilha do Cliente
| Aba | Colunas |
|-----|---------|
| CONFIG | Plano, Nome, CNPJ, AI_API_KEY |
| CONTAS | ID, Nome, Tipo, Saldo, Icone |
| TRANSACOES | Data, Tipo, Categoria, Subcategoria, Valor, Conta, Status, Descrição |
| CATEGORIAS | Categoria, Grupo_DRE |
| METAS | Categoria, Meta, Tipo |
| REGRAS_CATEGORIZACAO | padrao, categoria, subcategoria, tipo ✨ NEW |

## Fluxos Implementados

### 1. Multi-Cliente
```
URL: ?client=acme_001
       ↓
AdminService.getClientById()
       ↓
Valida status → ativo?
       ↓
Carrega spreadsheet_id do cliente
       ↓
Renderiza dashboard
```

### 2. Importação de Extrato
```
Upload OFX/CSV
       ↓
Parse automático
       ↓
Detecta duplicatas
       ↓
Categorização (regras → IA)
       ↓
Cria aba IMPORT_xxx
       ↓
Usuário revisa e aprova
       ↓
Transações salvas
```

### 3. Alertas
```
Carrega dados
       ↓
AlertService.analyzeAndGenerateAlerts()
       ↓
Ordena por prioridade
       ↓
Renderiza no dashboard
       ↓
Usuário pode dispensar
```

## Roadmap

### ✅ Completo
- Dashboard com KPIs
- Sistema de planos (3 níveis)
- Chatbot IA com contexto
- PWA instalável
- Multi-cliente centralizado
- Alertas automáticos
- Importação OFX/CSV
- Categorização com IA

### 🔜 Próximo
- Previsão de fluxo de caixa (30/60/90 dias)
- Notificações WhatsApp/Email
- Benchmarks do setor
- Relatórios automáticos

### 📋 Backlog
- IA conversacional (multi-turn)
- Exportação PDF avançada
- App mobile nativo
- Integração com ERPs

## Integrações

| Serviço | Uso |
|---------|-----|
| OpenAI GPT-4o-mini | Chatbot, categorização |
| Chart.js | Gráficos |
| Tailwind CSS | Styling |
| Lucide Icons | Ícones |

## Documentação

| Arquivo | Descrição |
|---------|-----------|
| `/app/docs/GUIA_MULTI_CLIENTE.md` | Setup multi-cliente |
| `/app/docs/ESTRUTURA_PLANILHA.md` | Estrutura de abas |
| `/app/ROADMAP_COMERCIAL.md` | Precificação e roadmap |
| `/app/CHANGELOG.md` | Histórico de versões |

---
*Última atualização: Dezembro 2025 - v3.3.0*
