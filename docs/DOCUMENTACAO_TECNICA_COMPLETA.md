# 📚 DOCUMENTAÇÃO TÉCNICA COMPLETA
## Sistema de Dashboard Financeiro Multi-Tenant B2B

---

## 📋 ÍNDICE

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Estrutura de Arquivos](#2-estrutura-de-arquivos)
3. [Fluxo de Dados](#3-fluxo-de-dados)
4. [Backend (Google Apps Script)](#4-backend-google-apps-script)
5. [Frontend (HTML/JavaScript)](#5-frontend-htmljavascript)
6. [Sistema de Planos](#6-sistema-de-planos)
7. [Modelo de Dados](#7-modelo-de-dados)
8. [Integrações](#8-integrações)
9. [Guia de Manutenção](#9-guia-de-manutenção)

---

## 1. VISÃO GERAL DA ARQUITETURA

### 1.1 Arquitetura Multi-Tenant

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PLANILHA DO PROJETO (COM CÓDIGO)                  │
│                    ════════════════════════════════                  │
│  📁 Contém todos os arquivos .gs e .html                            │
│  📌 É DAQUI que você publica o Web App                              │
│  🔗 Link único: https://script.google.com/.../exec                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ ?client=XXX
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         ADMIN_MASTER                                 │
│                         ════════════                                 │
│  📊 Base de dados central de clientes                               │
│  📋 Abas: CLIENTES, CONFIG_GLOBAL, LOG_SISTEMA                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  CLIENTE A      │       │  CLIENTE B      │       │  CLIENTE C      │
│  (Planilha)     │       │  (Planilha)     │       │  (Planilha)     │
│  ────────────   │       │  ────────────   │       │  ────────────   │
│  - BANCOS       │       │  - BANCOS       │       │  - BANCOS       │
│  - CONTAS       │       │  - CONTAS       │       │  - CONTAS       │
│  - TRANSACOES   │       │  - TRANSACOES   │       │  - TRANSACOES   │
│  - CONFIG       │       │  - CONFIG       │       │  - CONFIG       │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### 1.2 Hierarquia de Dados

```
BANCO (Nubank, Inter, Itaú...)     ← Onde o dinheiro ESTÁ
    └── CONTA/PROJETO (MOTO, CASA, EMPRESA X...)  ← Para ONDE vai / De onde vem
            └── TRANSAÇÃO (Parcela, Conta luz...)  ← O movimento em si
```

**Importante:** Uma mesma CONTA pode ter transações em DIFERENTES BANCOS.

---

## 2. ESTRUTURA DE ARQUIVOS

### 2.1 Backend (.gs)

| Arquivo | Função | Funções Principais |
|---------|--------|-------------------|
| `Main.js` | Entry point | `doGet()`, `include()`, `getClientData()` |
| `Config.js` | Configurações | `getSpreadsheetId()`, `getAPIKey()`, `getCacheConfig()` |
| `AdminService.js` | Multi-tenant | `getClientById()`, `isMultiClientMode()`, `log()` |
| `DataService.js` | Dados | `fetchAllData()`, `readTransactions()`, `readAccounts()`, `readBanks()` |
| `Controller.js` | Orquestração | `calculateStats()`, `getTransactionsByRange()` |
| `ImportService.js` | Importação | `parseOFX()`, `parseCSV()`, `importOFXFile()` |
| `CategorizationService.js` | IA | `categorize()`, `categorizeBatch()`, `learnFromCorrection()` |
| `AlertService.js` | Alertas | `checkAlerts()`, `sendAlert()` |
| `ValidationService.js` | Validação | `validateData()`, `validateTransaction()` |
| `AIService.js` | OpenAI | `callOpenAI()`, `buildPrompt()` |
| `PlanManager.js` | Planos | `checkFeature()`, `getUsage()` |
| `CacheManager.js` | Cache | `get()`, `set()`, `clear()` |
| `Utils.js` | Utilitários | `formatDate()`, `formatCurrency()` |

### 2.2 Frontend (.html)

| Arquivo | Função | Descrição |
|---------|--------|-----------|
| `index.html` | Container | HTML principal, carrega todos os módulos |
| `styles.html` | CSS | Estilos, dark mode, animações |
| `JS_Core.html` | Variáveis | Variáveis globais, formatadores |
| `JS_Init.html` | Inicialização | Carrega dados, registra Service Worker |
| `JS_Render.html` | Renderização | Dashboard principal, navegação, KPIs |
| `JS_Logic.html` | Lógica | Cálculos, filtros, estatísticas |
| `JS_Charts.html` | Gráficos | Chart.js, gráficos de fluxo |
| `JS_Bancos.html` | Visão Bancos | Interface de bancos |
| `JS_Contas.html` | Visão Contas | Interface de contas/projetos |
| `JS_ChatAI.html` | Chat IA | Chatbot financeiro |
| `JS_Import.html` | Importação | Modal de importação OFX/CSV |
| `JS_Alerts.html` | Alertas | Sistema de alertas |
| `JS_FeatureFlags.html` | Features | Controle de planos |
| `JS_Events.html` | Eventos | Handlers de eventos |
| `JS_Keyboard.html` | Atalhos | Atalhos de teclado |
| `JS_Components.html` | UI | Componentes reutilizáveis |
| `JS_Onboarding.html` | Onboarding | Tutorial inicial |
| `service-worker.html` | PWA | Cache offline |

---

## 3. FLUXO DE DADOS

### 3.1 Fluxo de Acesso (Multi-Tenant)

```
1. Usuário acessa URL:
   https://script.google.com/.../exec?client=empresa_x
   
2. Main.js (doGet):
   - Lê parâmetro ?client=empresa_x
   - Chama AdminService.getClientById('empresa_x')
   
3. AdminService:
   - Abre ADMIN_MASTER
   - Busca na aba CLIENTES o registro com client_id='empresa_x'
   - Retorna { spreadsheet_id: '1ABC...', plano: 'professional', ... }
   
4. Main.js:
   - Salva CURRENT_CLIENT_ID e CURRENT_SPREADSHEET_ID no PropertiesService
   - Retorna index.html
   
5. Frontend (JS_Init.html):
   - Chama google.script.run.getClientData()
   
6. Config.js (getSpreadsheetId):
   - Lê CURRENT_SPREADSHEET_ID do PropertiesService
   - Retorna ID da planilha do cliente
   
7. DataService.fetchAllData():
   - Abre planilha do cliente
   - Lê todas as abas (BANCOS, CONTAS, TRANSACOES, etc.)
   - Retorna JSON com todos os dados
   
8. Frontend:
   - Recebe dados via callback
   - Renderiza dashboard
```

### 3.2 Fluxo de Importação

```
1. Usuário clica "Importar" → abre modal
2. Seleciona BANCO de origem do extrato
3. Faz upload do arquivo OFX/CSV
4. Frontend chama: google.script.run.importOFXFile(content, bankId)

5. Backend (ImportService):
   a. Parse do arquivo (parseOFX ou parseCSV)
   b. Detecta duplicatas (findDuplicates)
   c. Categoriza via IA (CategorizationService.categorizeBatch)
   d. Cria aba de conciliação (IMPORT_timestamp)
   
6. Retorna URL da aba de conciliação

7. Usuário revisa na planilha:
   - Corrige categorias erradas (IA aprende)
   - Desmarca transações indesejadas
   
8. Executa aprovação → transações vão para TRANSACOES
```

---

## 4. BACKEND (GOOGLE APPS SCRIPT)

### 4.1 Main.js - Entry Point

```javascript
function doGet(e) {
  // Verifica requisições especiais (service worker, manifest)
  if (e.parameter.file === 'sw') { ... }
  if (e.parameter.file === 'manifest') { ... }
  
  // Modo multi-cliente
  var clientId = e.parameter.client;
  if (clientId && AdminService.isMultiClientMode()) {
    var client = AdminService.getClientById(clientId);
    // Salva no PropertiesService para uso posterior
    props.setProperty('CURRENT_CLIENT_ID', clientId);
    props.setProperty('CURRENT_SPREADSHEET_ID', client.spreadsheet_id);
  }
  
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function getClientData() {
  return JSON.stringify(DataService.fetchAllData());
}
```

### 4.2 Config.js - Configurações Dinâmicas

```javascript
function getSpreadsheetId() {
  // 1. Verifica cliente ativo (multi-tenant)
  var props = PropertiesService.getUserProperties();
  var clientSpreadsheetId = props.getProperty('CURRENT_SPREADSHEET_ID');
  if (clientSpreadsheetId) return clientSpreadsheetId;
  
  // 2. Verifica modo multi-cliente
  if (AdminService.isMultiClientMode()) return null;
  
  // 3. Fallback: modo single-tenant
  return DEFAULT_SPREADSHEET_ID;
}

function getAPIKey(ss) {
  // Tenta da planilha do cliente
  // Se não encontrar, busca da CONFIG_GLOBAL na ADMIN_MASTER
}
```

### 4.3 DataService.js - Leitura de Dados

```javascript
const DataService = {
  // Sistema de Planos
  PLANS: { BASIC: 'basic', PROFESSIONAL: 'professional', ENTERPRISE: 'enterprise' },
  
  PLAN_FEATURES: {
    'basic': { ai_queries_limit: 0, features: { dre: false, ai_insights: false } },
    'professional': { ai_queries_limit: 30, features: { dre: true, ai_insights: true } },
    'enterprise': { ai_queries_limit: -1, features: { ... } }
  },
  
  fetchAllData: function() {
    var ss = SpreadsheetApp.openById(getSpreadsheetId());
    var accounts = this.readAccounts(ss);
    var banks = this.readBanks(ss);
    var transactions = this.readTransactions(ss, accounts, banks, dreMapping);
    
    // Calcula balance de cada conta baseado nas transações
    accounts.forEach(function(account) {
      var balance = 0;
      transactions.forEach(function(tx) {
        if (tx.accountId === account.id) {
          balance += tx.type === 'Entrada' ? tx.value : -tx.value;
        }
      });
      account.balance = balance;
    });
    
    return { config, accounts, banks, transactions, goals, plan, validation };
  },
  
  readBanks: function(ss) {
    // Estrutura: ID, Nome, Tipo, Saldo, Icone, Agencia, Conta_Numero
  },
  
  readAccounts: function(ss) {
    // Estrutura: ID, Nome, Tipo, Icone, Orcamento_Mensal
  },
  
  readTransactions: function(ss, accounts, banks, dreMapping) {
    // Estrutura: Data, Tipo, Categoria, Subcategoria, Valor, Conta, Banco, Status, Descrição, Centro_Custo
  }
};
```

### 4.4 AdminService.js - Multi-Tenancy

```javascript
var AdminService = {
  ADMIN_SPREADSHEET_ID: null, // Lido de PropertiesService
  
  isMultiClientMode: function() {
    return this.getAdminSpreadsheetId() !== null;
  },
  
  getClientById: function(clientId) {
    var ss = SpreadsheetApp.openById(this.getAdminSpreadsheetId());
    var sheet = ss.getSheetByName('CLIENTES');
    var data = sheet.getDataRange().getValues();
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === clientId) {
        return {
          client_id: data[i][0],
          nome: data[i][1],
          spreadsheet_id: data[i][2],
          plano: data[i][3],
          status: data[i][4]
        };
      }
    }
    return null;
  },
  
  log: function(clientId, action, message) {
    // Registra na aba LOG_SISTEMA
  }
};
```

### 4.5 CategorizationService.js - IA

```javascript
var CategorizationService = {
  categorize: function(transaction, ss, apiKey) {
    // 1. Tenta por regras manuais (REGRAS_CATEGORIZACAO)
    var ruleMatch = this.matchRule(transaction.description, ss);
    if (ruleMatch) return { ...ruleMatch, method: 'rule', confidence: 1.0 };
    
    // 2. Tenta por IA
    if (apiKey) {
      var aiResult = this.categorizeWithAI(transaction, ss, apiKey);
      if (aiResult) return { ...aiResult, method: 'ai' };
    }
    
    // 3. Fallback
    return { category: 'A Classificar', method: 'default', confidence: 0 };
  },
  
  learnFromCorrection: function(ss, description, correctCategory, correctType) {
    // Adiciona nova regra na aba REGRAS_CATEGORIZACAO
    // Próximas transações similares serão categorizadas automaticamente
  }
};
```

---

## 5. FRONTEND (HTML/JAVASCRIPT)

### 5.1 Variáveis Globais (JS_Core.html)

```javascript
let GLOBAL_DATA = null;           // Dados do backend
let CURRENT_VIEW = 'overview';    // Visão atual
let CURRENT_TAB = 'dashboard';    // Aba atual (dashboard, banks, projects, dre)
let IS_PRIVACY_MODE = false;      // Modo privacidade (blur valores)
let IS_DRE_MODE = false;          // Visão DRE ativa
let START_DATE, END_DATE;         // Filtro de período
let FILTER_MODE = 'this_month';   // Modo de filtro
let CURRENT_PAGE = 1;             // Paginação
let ITEMS_PER_PAGE = 15;
let ADVANCED_FILTERS = { category: '', type: '', status: '', costCenter: '' };
```

### 5.2 Inicialização (JS_Init.html)

```javascript
function init() {
  // Define período inicial (mês atual)
  START_DATE = new Date(now.getFullYear(), now.getMonth(), 1);
  END_DATE = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  // Carrega dados do backend
  google.script.run
    .withSuccessHandler(function(jsonTexto) {
      GLOBAL_DATA = JSON.parse(jsonTexto);
      initFeatureFlags();  // Sistema de planos
      renderApp();         // Renderiza dashboard
      initChat();          // Chat IA
      loadAlerts();        // Alertas
    })
    .getClientData();
}
```

### 5.3 Renderização (JS_Render.html)

```javascript
function renderApp() {
  if (CURRENT_TAB === 'banks') {
    renderBanksView();
  } else if (CURRENT_TAB === 'projects') {
    renderProjectsView();
  } else if (CURRENT_TAB === 'dre') {
    renderOverview();  // Com IS_DRE_MODE = true
  } else {
    renderOverview();
  }
}

function renderTabNavigation() {
  var tabs = [
    { id: 'dashboard', label: 'Visão Geral', icon: 'layout-dashboard' },
    { id: 'banks', label: 'Bancos', icon: 'landmark' },
    { id: 'projects', label: 'Contas/Projetos', icon: 'folder-kanban' }
  ];
  
  if (hasFeature('dre')) {
    tabs.push({ id: 'dre', label: 'DRE', icon: 'file-bar-chart' });
  }
  // ...
}
```

### 5.4 Sistema de Features (JS_FeatureFlags.html)

```javascript
var FEATURE_FLAGS = {};
var CURRENT_PLAN = null;

function initFeatureFlags() {
  if (GLOBAL_DATA && GLOBAL_DATA.plan) {
    CURRENT_PLAN = GLOBAL_DATA.plan;
    FEATURE_FLAGS = CURRENT_PLAN.features || {};
  }
}

function hasFeature(featureName) {
  return FEATURE_FLAGS[featureName] === true;
}

function renderPlanBadge() {
  if (!CURRENT_PLAN) return '';
  return `<span class="px-3 py-1 rounded-full text-xs font-bold ...">
    ${CURRENT_PLAN.name}
  </span>`;
}
```

---

## 6. SISTEMA DE PLANOS

### 6.1 Planos Disponíveis

| Plano | Preço | IA Queries | Principais Features |
|-------|-------|------------|---------------------|
| **Básico** | R$ 297/mês | 0 | Dashboard, Filtros, CSV, Gráficos, Metas |
| **Profissional** | R$ 597/mês | 30/mês | + DRE, PDF, IA Insights |
| **Enterprise** | R$ 1.297/mês | Ilimitado | + Alertas, Previsões, WhatsApp, Benchmarks |

### 6.2 Matriz de Features

| Feature | Básico | Profissional | Enterprise |
|---------|--------|--------------|------------|
| Dashboard | ✅ | ✅ | ✅ |
| Filtros de Data | ✅ | ✅ | ✅ |
| Exportar CSV | ✅ | ✅ | ✅ |
| Exportar PDF | ❌ | ✅ | ✅ |
| Gráficos | ✅ | ✅ | ✅ |
| Metas | ✅ | ✅ | ✅ |
| DRE Gerencial | ❌ | ✅ | ✅ |
| Chat IA | ❌ | ✅ (30/mês) | ✅ (∞) |
| Alertas Automáticos | ❌ | ❌ | ✅ |
| Previsões | ❌ | ❌ | ✅ |
| Relatórios WhatsApp | ❌ | ❌ | ✅ |
| Benchmarking | ❌ | ❌ | ✅ |

### 6.3 Configuração de Plano

**Na ADMIN_MASTER (aba CLIENTES):**
```
| client_id | nome | spreadsheet_id | plano | status |
|-----------|------|----------------|-------|--------|
| empresa_x | Empresa X | 1ABC... | professional | ativo |
```

**Na planilha do cliente (aba CONFIG):**
```
| Plano | profissional |
```

---

## 7. MODELO DE DADOS

### 7.1 ADMIN_MASTER (Central)

**Aba: CLIENTES**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| client_id | string | Identificador único (usado na URL) |
| nome | string | Nome do cliente/empresa |
| spreadsheet_id | string | ID da planilha de dados do cliente |
| plano | string | basic, professional, enterprise |
| status | string | ativo, suspenso, cancelado |
| ultimo_acesso | datetime | Último acesso ao dashboard |

**Aba: CONFIG_GLOBAL**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| openai_api_key | string | Chave da API OpenAI |
| max_ai_queries_basic | number | Limite de queries para plano básico |

**Aba: LOG_SISTEMA**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| timestamp | datetime | Data/hora do evento |
| client_id | string | Cliente relacionado |
| level | string | info, warning, error |
| message | string | Descrição do evento |

### 7.2 Planilha do Cliente

**Aba: BANCOS** (Onde o dinheiro ESTÁ)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| ID | number | Identificador único |
| Nome | string | Nome do banco (Nubank, Inter, etc.) |
| Tipo | string | Corrente, Poupança, Digital, Investimento |
| Saldo | number | Saldo inicial ou atual |
| Icone | string | Emoji ou código do ícone |
| Agencia | string | Número da agência (opcional) |
| Conta_Numero | string | Número da conta (opcional) |

**Aba: CONTAS** (Projetos/Centros de Custo)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| ID | number | Identificador único |
| Nome | string | Nome do projeto (MOTO, CASA, EMPRESA X) |
| Tipo | string | Tipo de conta/projeto |
| Icone | string | Emoji ou código do ícone |
| Orcamento_Mensal | number | Orçamento mensal (opcional) |

**Aba: TRANSACOES**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Data | date | Data da transação |
| Tipo | string | Entrada ou Saída |
| Categoria | string | Nome da conta/projeto relacionado |
| Subcategoria | string | Detalhamento (ex: FINANCIAMENTO, LUZ) |
| Valor | number | Valor absoluto |
| Conta | number | ID da conta/projeto (FK) |
| Banco | number | ID do banco (FK) |
| Status | string | Pendente, Pago, Recebido, Atrasado |
| Descrição | string | Descrição detalhada |
| Centro_Custo | string | Agrupamento adicional |

**Aba: CATEGORIAS** (Mapeamento DRE)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Categoria | string | Nome da categoria |
| Grupo_DRE | string | Grupo no DRE (Receita Bruta, Custos Variáveis, etc.) |

**Aba: METAS**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| Categoria | string | Categoria relacionada |
| Meta | number | Valor da meta |
| Tipo | string | Gasto ou Receita |

**Aba: REGRAS_CATEGORIZACAO** (Aprendizado)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| padrao | string | Texto a buscar na descrição |
| categoria | string | Categoria a aplicar |
| subcategoria | string | Subcategoria a aplicar |
| tipo | string | Entrada ou Saída |

---

## 8. INTEGRAÇÕES

### 8.1 OpenAI (Chat IA)

**Configuração:**
- Chave API na aba CONFIG (cliente) ou CONFIG_GLOBAL (admin)
- Modelo: GPT-3.5-turbo ou GPT-4

**Uso:**
```javascript
// AIService.js
function callOpenAI(prompt, apiKey) {
  var options = {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey },
    payload: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }]
    })
  };
  var response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
  return JSON.parse(response.getContentText());
}
```

### 8.2 Chart.js (Gráficos)

**CDN:**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
```

**Tipos de gráficos usados:**
- Bar (comparativo de períodos)
- Doughnut (gastos por categoria)
- Line (evolução mensal, projeções)

### 8.3 Tailwind CSS (Estilos)

**CDN:**
```html
<script src="https://cdn.tailwindcss.com"></script>
```

**Nota:** Em produção, recomenda-se compilar o CSS.

### 8.4 Lucide Icons

**CDN:**
```html
<script src="https://unpkg.com/lucide@latest"></script>
```

---

## 9. GUIA DE MANUTENÇÃO

### 9.1 Adicionar Novo Cliente

1. **Criar planilha de dados:**
   ```javascript
   // Execute na planilha do cliente
   criarEstruturaCliente()
   ```

2. **Registrar na ADMIN_MASTER:**
   - Abrir ADMIN_MASTER
   - Ir na aba CLIENTES
   - Adicionar linha: `client_id | nome | spreadsheet_id | plano | ativo`

3. **Enviar link ao cliente:**
   ```
   https://script.google.com/.../exec?client=CLIENT_ID
   ```

### 9.2 Atualizar Código

1. Editar arquivos na planilha do projeto
2. Publicar nova versão do Web App:
   - Implantações → Gerenciar implantações
   - Editar → Nova versão
3. Todos os clientes receberão a atualização automaticamente

### 9.3 Monitorar Sistema

**Logs:**
- Verificar aba LOG_SISTEMA na ADMIN_MASTER
- Filtrar por `level = 'error'` para problemas

**Métricas:**
- Verificar `ultimo_acesso` de cada cliente
- Monitorar uso de queries IA por cliente

### 9.4 Backup

- As planilhas do Google Sheets têm versionamento automático
- Recomenda-se exportar periodicamente para backup externo

---

## 📝 CHANGELOG

| Versão | Data | Alterações |
|--------|------|------------|
| 3.3.0 | Dez/2025 | Arquitetura multi-tenant, sistema de planos |
| 3.2.0 | Dez/2025 | Hierarquia BANCOS → CONTAS → TRANSAÇÕES |
| 3.1.0 | Dez/2025 | Importação OFX/CSV com IA |
| 3.0.0 | Dez/2025 | Refatoração completa B2B |

---

*Documentação gerada em Dezembro 2025*
*Dashboard Financeiro Multi-Tenant B2B v3.3.0*
