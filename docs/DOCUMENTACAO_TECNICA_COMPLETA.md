# 📚 Documentação Técnica Completa - Dashboard Financeiro B2B

## Índice
1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Estrutura de Dados (Planilhas)](#2-estrutura-de-dados)
3. [Código para Criar Planilha do Cliente](#3-código-criação-planilha)
4. [Documentação dos Arquivos .gs (Backend)](#4-arquivos-gs)
5. [Documentação dos Arquivos .html (Frontend)](#5-arquivos-html)
6. [Sistema Multi-Cliente (ADMIN)](#6-sistema-admin)
7. [Análise de Escalabilidade](#7-escalabilidade)
8. [Guia de Manutenção](#8-manutenção)

---

## 1. Visão Geral da Arquitetura

### Diagrama Geral

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GOOGLE APPS SCRIPT                          │
│                     (Projeto Único - Backend)                       │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │   Main.gs   │  │DataService  │  │AdminService │                │
│  │  Entrypoint │  │   .gs       │  │    .gs      │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │AlertService │  │Categoriz.   │  │ImportService│                │
│  │    .gs      │  │Service.gs   │  │    .gs      │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND (HTML Files)                     │   │
│  │  index.html, JS_Core, JS_Render, JS_Bancos, JS_Contas, etc. │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│                    Publicado como WEB APP                           │
│            https://script.google.com/.../exec                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ ?client=xxx
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ADMIN_MASTER (Planilha)                        │
│                                                                     │
│  CLIENTES: client_id → spreadsheet_id → plano                      │
│  CONFIG_GLOBAL: API keys, limites                                   │
│  LOG_SISTEMA: Acessos e eventos                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ PLANILHA        │    │ PLANILHA        │    │ PLANILHA        │
│ CLIENTE A       │    │ CLIENTE B       │    │ CLIENTE C       │
│                 │    │                 │    │                 │
│ - BANCOS        │    │ - BANCOS        │    │ - BANCOS        │
│ - CONTAS        │    │ - CONTAS        │    │ - CONTAS        │
│ - TRANSACOES    │    │ - TRANSACOES    │    │ - TRANSACOES    │
│ - CATEGORIAS    │    │ - CATEGORIAS    │    │ - CATEGORIAS    │
│ - METAS         │    │ - METAS         │    │ - METAS         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Hierarquia de Dados

```
BANCO (onde o dinheiro está)
   └── Nubank, Inter, Itaú, Caixa Físico...
   
CONTA/PROJETO (para que serve)
   └── MOTO, CASA, EMPRESA X, INVESTIMENTOS...
   
TRANSAÇÃO (movimento financeiro)
   └── Pertence a 1 BANCO + 1 CONTA
   └── Tem SUBCATEGORIA (FINANCIAMENTO, MULTA, SEGURO...)
```

---

## 2. Estrutura de Dados

### 2.1 Planilha do Cliente - Abas Necessárias

#### Aba: CONFIG
| Coluna A | Coluna B | Descrição |
|----------|----------|-----------|
| Plano | professional | basic/professional/enterprise |
| Nome | Empresa XPTO | Nome do cliente |
| CNPJ | 00.000.000/0001-00 | Documento |
| AI_API_KEY | sk-xxx (opcional) | Chave OpenAI própria |

#### Aba: BANCOS (NOVA)
| ID | Nome | Tipo | Saldo | Icone | Agencia | Conta_Numero |
|----|------|------|-------|-------|---------|--------------|
| 1 | Nubank | Digital | 10000 | 💜 | | |
| 2 | Inter | Digital | 5000 | 🧡 | | |
| 3 | Itaú | Corrente | 25000 | 🏦 | 1234 | 56789-0 |
| 4 | Caixa Físico | Dinheiro | 500 | 💵 | | |

**Tipos válidos:** Digital, Corrente, Poupança, Investimento, Dinheiro, Cartão de Crédito

#### Aba: CONTAS (Projetos/Centros de Custo)
| ID | Nome | Tipo | Icone | Orcamento_Mensal |
|----|------|------|-------|------------------|
| 1 | MOTO | Veículo | 🏍️ | 1500 |
| 2 | CASA | Moradia | 🏠 | 3000 |
| 3 | EMPRESA ABC | Cliente | 🏢 | 0 |
| 4 | INVESTIMENTOS | Pessoal | 📈 | 2000 |

#### Aba: TRANSACOES
| Data | Tipo | Categoria | Subcategoria | Valor | Conta | Banco | Status | Descrição | Centro_Custo |
|------|------|-----------|--------------|-------|-------|-------|--------|-----------|--------------|
| 2025-01-15 | Saída | MOTO | FINANCIAMENTO | 800 | 1 | 1 | Pago | Parcela 5/48 | Pessoal |
| 2025-01-16 | Saída | MOTO | SEGURO | 200 | 1 | 2 | Pago | Seguro anual | Pessoal |
| 2025-01-17 | Entrada | EMPRESA ABC | SERVIÇOS | 5000 | 3 | 1 | Recebido | Projeto X | Comercial |

**Campos importantes:**
- **Data:** Formato YYYY-MM-DD
- **Tipo:** Entrada ou Saída
- **Categoria:** Nome da CONTA/PROJETO (MOTO, CASA, etc.)
- **Subcategoria:** Detalhe (FINANCIAMENTO, MULTA, LUZ, etc.)
- **Valor:** Número decimal (sem R$)
- **Conta:** ID da aba CONTAS
- **Banco:** ID da aba BANCOS
- **Status:** Pago, Pendente, Recebido, Atrasado, Agendado

#### Aba: CATEGORIAS (Mapeamento DRE)
| Categoria | Grupo_DRE |
|-----------|-----------|
| MOTO | Despesas Pessoais |
| CASA | Despesas Fixas |
| EMPRESA ABC | Receita de Serviços |
| INVESTIMENTOS | Investimentos |

#### Aba: METAS
| Categoria | Meta | Tipo |
|-----------|------|------|
| MOTO | 1500 | Gasto |
| CASA | 3000 | Gasto |
| EMPRESA ABC | 10000 | Receita |

#### Aba: REGRAS_CATEGORIZACAO (Para importação automática)
| padrao | categoria | subcategoria | tipo |
|--------|-----------|--------------|------|
| pix recebido | EMPRESA ABC | SERVIÇOS | Entrada |
| financiamento moto | MOTO | FINANCIAMENTO | Saída |
| energia elet | CASA | LUZ | Saída |
| aluguel | CASA | ALUGUEL | Saída |

---

## 3. Código para Criar Planilha do Cliente

Cole e execute este código no Apps Script da planilha do cliente:

```javascript
// ===========================================
// SCRIPT PARA CRIAR ESTRUTURA COMPLETA
// Execute: criarEstruturaCompleta()
// ===========================================

function criarEstruturaCompleta() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Logger.log('🚀 Iniciando criação da estrutura...');
  
  // 1. CONFIG
  criarAbaConfig(ss);
  
  // 2. BANCOS
  criarAbaBancos(ss);
  
  // 3. CONTAS
  criarAbaContas(ss);
  
  // 4. TRANSACOES
  criarAbaTransacoes(ss);
  
  // 5. CATEGORIAS
  criarAbaCategorias(ss);
  
  // 6. METAS
  criarAbaMetas(ss);
  
  // 7. REGRAS_CATEGORIZACAO
  criarAbaRegras(ss);
  
  // Remove aba padrão se existir
  var sheet1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('Página1');
  if (sheet1 && ss.getSheets().length > 1) {
    ss.deleteSheet(sheet1);
  }
  
  Logger.log('✅ Estrutura criada com sucesso!');
  Logger.log('📋 ID da planilha: ' + ss.getId());
  Logger.log('🔗 URL: ' + ss.getUrl());
  
  return {
    id: ss.getId(),
    url: ss.getUrl()
  };
}

function criarAbaConfig(ss) {
  var sheet = ss.getSheetByName('CONFIG');
  if (!sheet) {
    sheet = ss.insertSheet('CONFIG');
  }
  sheet.clear();
  
  var dados = [
    ['Plano', 'professional'],
    ['Nome', 'Nome da Empresa'],
    ['CNPJ', ''],
    ['AI_API_KEY', '']
  ];
  
  sheet.getRange(1, 1, dados.length, 2).setValues(dados);
  sheet.getRange('A:A').setFontWeight('bold');
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 300);
  
  Logger.log('  ✓ CONFIG criada');
}

function criarAbaBancos(ss) {
  var sheet = ss.getSheetByName('BANCOS');
  if (!sheet) {
    sheet = ss.insertSheet('BANCOS');
  }
  sheet.clear();
  
  // Cabeçalho
  var headers = ['ID', 'Nome', 'Tipo', 'Saldo', 'Icone', 'Agencia', 'Conta_Numero'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#059669')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  // Dados de exemplo
  var exemplos = [
    [1, 'Nubank', 'Digital', 10000, '💜', '', ''],
    [2, 'Inter', 'Digital', 5000, '🧡', '', ''],
    [3, 'Banco Principal', 'Corrente', 25000, '🏦', '', '']
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  // Formatação
  sheet.setFrozenRows(1);
  sheet.getRange('D:D').setNumberFormat('R$ #,##0.00');
  sheet.setColumnWidths(1, 7, [50, 150, 100, 120, 60, 80, 120]);
  
  Logger.log('  ✓ BANCOS criada');
}

function criarAbaContas(ss) {
  var sheet = ss.getSheetByName('CONTAS');
  if (!sheet) {
    sheet = ss.insertSheet('CONTAS');
  }
  sheet.clear();
  
  var headers = ['ID', 'Nome', 'Tipo', 'Icone', 'Orcamento_Mensal'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#7c3aed')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  var exemplos = [
    [1, 'MOTO', 'Veículo', '🏍️', 1500],
    [2, 'CASA', 'Moradia', '🏠', 3000],
    [3, 'EMPRESA CLIENTE', 'Cliente', '🏢', 0]
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  sheet.setFrozenRows(1);
  sheet.getRange('E:E').setNumberFormat('R$ #,##0.00');
  sheet.setColumnWidths(1, 5, [50, 200, 100, 60, 150]);
  
  Logger.log('  ✓ CONTAS criada');
}

function criarAbaTransacoes(ss) {
  var sheet = ss.getSheetByName('TRANSACOES');
  if (!sheet) {
    sheet = ss.insertSheet('TRANSACOES');
  }
  sheet.clear();
  
  var headers = ['Data', 'Tipo', 'Categoria', 'Subcategoria', 'Valor', 'Conta', 'Banco', 'Status', 'Descrição', 'Centro_Custo'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#2563eb')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  // Exemplos
  var hoje = new Date();
  var dataStr = Utilities.formatDate(hoje, 'GMT-3', 'yyyy-MM-dd');
  
  var exemplos = [
    [dataStr, 'Saída', 'MOTO', 'FINANCIAMENTO', 800, 1, 1, 'Pago', 'Parcela financiamento', 'Pessoal'],
    [dataStr, 'Saída', 'CASA', 'LUZ', 250, 2, 2, 'Pendente', 'Conta de luz janeiro', 'Pessoal'],
    [dataStr, 'Entrada', 'EMPRESA CLIENTE', 'SERVIÇOS', 5000, 3, 1, 'Recebido', 'Projeto entregue', 'Comercial']
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  sheet.setFrozenRows(1);
  sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('E:E').setNumberFormat('R$ #,##0.00');
  sheet.setColumnWidths(1, 10, [100, 80, 150, 150, 100, 60, 60, 80, 250, 100]);
  
  // Validação de dados para Tipo
  var tipoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Entrada', 'Saída'], true)
    .build();
  sheet.getRange('B2:B1000').setDataValidation(tipoRule);
  
  // Validação para Status
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pendente', 'Pago', 'Recebido', 'Atrasado', 'Agendado', 'Concluído'], true)
    .build();
  sheet.getRange('H2:H1000').setDataValidation(statusRule);
  
  Logger.log('  ✓ TRANSACOES criada');
}

function criarAbaCategorias(ss) {
  var sheet = ss.getSheetByName('CATEGORIAS');
  if (!sheet) {
    sheet = ss.insertSheet('CATEGORIAS');
  }
  sheet.clear();
  
  var headers = ['Categoria', 'Grupo_DRE'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#dc2626')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  var exemplos = [
    ['MOTO', 'Despesas Pessoais'],
    ['CASA', 'Despesas Fixas'],
    ['EMPRESA CLIENTE', 'Receita de Serviços']
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  sheet.setFrozenRows(1);
  sheet.setColumnWidths(1, 2, [200, 200]);
  
  Logger.log('  ✓ CATEGORIAS criada');
}

function criarAbaMetas(ss) {
  var sheet = ss.getSheetByName('METAS');
  if (!sheet) {
    sheet = ss.insertSheet('METAS');
  }
  sheet.clear();
  
  var headers = ['Categoria', 'Meta', 'Tipo'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#f59e0b')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  var exemplos = [
    ['MOTO', 1500, 'Gasto'],
    ['CASA', 3000, 'Gasto'],
    ['EMPRESA CLIENTE', 10000, 'Receita']
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  sheet.setFrozenRows(1);
  sheet.getRange('B:B').setNumberFormat('R$ #,##0.00');
  
  var tipoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Gasto', 'Receita'], true)
    .build();
  sheet.getRange('C2:C1000').setDataValidation(tipoRule);
  
  sheet.setColumnWidths(1, 3, [200, 150, 100]);
  
  Logger.log('  ✓ METAS criada');
}

function criarAbaRegras(ss) {
  var sheet = ss.getSheetByName('REGRAS_CATEGORIZACAO');
  if (!sheet) {
    sheet = ss.insertSheet('REGRAS_CATEGORIZACAO');
  }
  sheet.clear();
  
  var headers = ['padrao', 'categoria', 'subcategoria', 'tipo'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#ec4899')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  var exemplos = [
    ['pix recebido', 'EMPRESA CLIENTE', 'SERVIÇOS', 'Entrada'],
    ['financiamento', 'MOTO', 'FINANCIAMENTO', 'Saída'],
    ['energia', 'CASA', 'LUZ', 'Saída'],
    ['aluguel', 'CASA', 'ALUGUEL', 'Saída'],
    ['seguro', 'MOTO', 'SEGURO', 'Saída']
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  sheet.setFrozenRows(1);
  
  var tipoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Entrada', 'Saída', 'auto'], true)
    .build();
  sheet.getRange('D2:D1000').setDataValidation(tipoRule);
  
  sheet.setColumnWidths(1, 4, [200, 150, 150, 80]);
  
  Logger.log('  ✓ REGRAS_CATEGORIZACAO criada');
}

// Função auxiliar para configurar larguras de colunas
SpreadsheetApp.Spreadsheet.prototype.setColumnWidths = function(startCol, numCols, widths) {
  // Esta função é chamada no sheet, não no spreadsheet
};

Sheet.prototype.setColumnWidths = function(startCol, numCols, widths) {
  for (var i = 0; i < widths.length; i++) {
    this.setColumnWidth(startCol + i, widths[i]);
  }
};
```

---

## 4. Documentação dos Arquivos .gs (Backend)

### 4.1 Main.gs
**Função:** Ponto de entrada da aplicação (doGet) e processamento de IA.

```
Main.gs
├── doGet(e)                    → Entrypoint do Web App
│   ├── Serve service-worker.html
│   ├── Serve manifest.json
│   ├── Processa ?client=xxx (multi-cliente)
│   └── Retorna index.html
│
├── include(filename)           → Inclui arquivos HTML
│
├── checkAIUsageLimit()         → Verifica limite de consultas IA
│
├── askAIFinancialQuestion()    → Processa perguntas do chatbot
│   ├── Valida API key
│   ├── Filtra transações por período
│   ├── Monta contexto financeiro
│   └── Chama callOpenAI()
│
├── callOpenAI()                → Chamada à API da OpenAI
│
├── calculatePreviousPeriod()   → Calcula período anterior
│
└── Funções de teste
```

**Manutenção:**
- Se mudar modelo da OpenAI: alterar em `callOpenAI()`
- Se adicionar novos parâmetros de URL: modificar `doGet()`
- Logs de debug: usar `Logger.log()`

---

### 4.2 DataService.gs
**Função:** Leitura e processamento de dados das planilhas.

```
DataService.gs
├── PLANS                       → Definição dos planos (basic, professional, enterprise)
├── PLAN_FEATURES               → Features por plano
│
├── getClientPlan(ss)           → Lê plano do cliente da CONFIG
├── getPlanInfo(planKey)        → Retorna info do plano
│
├── fetchAllData()              → Função principal - busca todos os dados
│   ├── readConfig()
│   ├── readAccounts()
│   ├── readBanks()             → NOVO
│   ├── readDreMapping()
│   ├── readTransactions()
│   └── readGoals()
│
├── readConfig(ss)              → Lê aba CONFIG
├── readAccounts(ss)            → Lê aba CONTAS
├── readBanks(ss)               → Lê aba BANCOS (NOVO)
├── readTransactions(ss,...)    → Lê aba TRANSACOES
├── readGoals(ss)               → Lê aba METAS
├── readDreMapping(ss)          → Lê aba CATEGORIAS
│
└── validateData()              → Valida dados carregados
```

**Manutenção:**
- Adicionar nova aba: criar função `readNovaAba()` e chamar em `fetchAllData()`
- Adicionar coluna em aba: ajustar range e mapeamento na função correspondente
- Mudar preços dos planos: editar `PLAN_FEATURES`

---

### 4.3 AdminService.gs
**Função:** Gestão multi-cliente centralizada.

```
AdminService.gs
├── ADMIN_SPREADSHEET_ID        → ID da planilha admin (de PropertiesService)
│
├── init()                      → Inicializa serviço
├── isMultiClientMode()         → Verifica se está em modo multi-cliente
│
├── getClientById(clientId)     → Busca cliente pelo ID
├── getAllClients()             → Lista todos os clientes
│
├── updateLastAccess()          → Atualiza último acesso
├── incrementAIUsage()          → Incrementa uso de IA
├── resetMonthlyAICounters()    → Reseta contadores mensais
│
├── log()                       → Registra evento no LOG_SISTEMA
├── getGlobalConfig()           → Lê config global
├── createClient()              → Cria novo cliente
│
├── setupAdminSpreadsheet()     → Configura ID da planilha admin
├── setupExistingAdminSpreadsheet() → Configura planilha existente
└── createAdminStructure()      → Cria estrutura completa
```

**Manutenção:**
- Trigger mensal: configurar `monthlyReset()` no Apps Script
- Adicionar campo em CLIENTES: editar `createClient()` e `getClientById()`

---

### 4.4 AlertService.gs
**Função:** Geração de alertas automáticos.

```
AlertService.gs
├── ALERT_TYPES                 → Tipos de alerta
├── PRIORITY                    → Níveis de prioridade
│
├── analyzeAndGenerateAlerts()  → Função principal
│   ├── checkCashFlowProjection()    → Fluxo de caixa crítico
│   ├── checkOverdueReceivables()    → Inadimplência
│   ├── checkAbnormalExpenses()      → Despesas anormais
│   ├── checkGoalsProgress()         → Metas estouradas
│   ├── checkDueToday()              → Vencimentos do dia
│   └── checkLowBalance()            → Saldo baixo
│
└── formatAlertsForDisplay()    → Formata para frontend
```

**Manutenção:**
- Adicionar novo tipo de alerta: criar função `checkNovoAlerta()` e adicionar em `analyzeAndGenerateAlerts()`
- Ajustar limites: modificar valores nas funções de verificação

---

### 4.5 CategorizationService.gs
**Função:** Categorização automática de transações.

```
CategorizationService.gs
├── DEFAULT_CATEGORIES          → Categorias padrão
│
├── getCategorizationRules()    → Lê regras da planilha
├── categorizeByRules()         → Categoriza por regras
├── categorizeWithAI()          → Categoriza usando IA
├── categorizeBatch()           → Processa lote
│
├── getExistingCategories()     → Lista categorias existentes
├── addCategorizationRule()     → Adiciona nova regra
└── learnFromCorrection()       → Aprende com correções
```

---

### 4.6 ImportService.gs
**Função:** Importação de extratos OFX/CSV.

```
ImportService.gs
├── parseOFX()                  → Parser de arquivos OFX
├── parseCSV()                  → Parser de arquivos CSV
│
├── extractTag()                → Extrai tag OFX
├── parseOFXDate()              → Converte data OFX
├── parseCSVDate()              → Converte data CSV
├── parseCSVValue()             → Converte valor CSV
│
├── findDuplicates()            → Detecta duplicatas
├── saveImportedTransactions()  → Salva transações
├── createReconciliationSheet() → Cria aba de revisão
└── processApprovedTransactions() → Processa aprovações
```

---

### 4.7 Config.gs
**Função:** Configurações centrais.

```
Config.gs
├── ADMIN_MASTER_ID             → ID da planilha admin
├── getSpreadsheetId()          → Retorna ID da planilha atual
└── initAdminService()          → Inicializa admin
```

---

## 5. Documentação dos Arquivos .html (Frontend)

### 5.1 index.html
**Função:** Página principal que carrega todos os módulos.

```html
Estrutura:
├── <head>
│   ├── Meta tags (viewport, theme-color)
│   ├── Tailwind CSS (CDN)
│   ├── Chart.js (CDN)
│   ├── Lucide Icons (CDN)
│   └── styles.html (CSS customizado)
│
└── <body>
    ├── <div id="app">           → Container principal
    └── Scripts (ordem importa!):
        ├── JS_Core.html         → Variáveis globais
        ├── JS_Logic.html        → Lógica de negócio
        ├── JS_EnhancedInsights  → Insights aprimorados
        ├── JS_Components.html   → Componentes reutilizáveis
        ├── JS_FeatureFlags.html → Controle de features por plano
        ├── JS_ChatAI.html       → Chatbot de IA
        ├── JS_Alerts.html       → Sistema de alertas
        ├── JS_Import.html       → Importação de extratos
        ├── JS_Bancos.html       → Visão por bancos
        ├── JS_Contas.html       → Visão por contas/projetos
        ├── JS_Events.html       → Eventos e interações
        ├── JS_Render.html       → Renderização principal
        ├── JS_Charts.html       → Gráficos
        ├── JS_Keyboard.html     → Atalhos de teclado
        ├── JS_Onboarding.html   → Tutorial inicial
        └── JS_Init.html         → Inicialização
```

---

### 5.2 JS_Core.html
**Função:** Variáveis globais e funções utilitárias.

```javascript
Variáveis:
├── GLOBAL_DATA          → Dados carregados do backend
├── CURRENT_VIEW         → Visão atual (overview, detail)
├── CURRENT_TAB          → Aba atual (dashboard, banks, projects, dre)
├── SELECTED_BANK        → Banco selecionado para filtro
├── SELECTED_PROJECT     → Projeto selecionado para filtro
├── START_DATE, END_DATE → Período de filtro
├── FILTER_MODE          → Modo de filtro (this_month, last_month, etc)
├── IS_PRIVACY_MODE      → Modo privacidade ativo
├── IS_DRE_MODE          → Modo DRE ativo
└── ADVANCED_FILTERS     → Filtros avançados

Funções:
├── switchTab(tab)       → Troca de aba
├── formatCurrency()     → Formata valor em R$
├── formatDateBR()       → Formata data DD/MM/YYYY
├── parseDate()          → Parse de data
└── showToast()          → Exibe notificação
```

---

### 5.3 JS_Render.html
**Função:** Renderização principal do dashboard.

```javascript
Funções principais:
├── renderApp()              → Decide qual view renderizar
├── renderOverview()         → Renderiza visão geral
├── renderBanksView()        → Renderiza visão de bancos
├── renderProjectsView()     → Renderiza visão de projetos
│
├── renderHeader()           → Cabeçalho com logo e ações
├── renderTabNavigation()    → Abas de navegação
├── renderFilterBar()        → Filtros de período
├── renderKPICards()         → Cards de KPIs
├── renderCharts()           → Área de gráficos
├── renderTransactionsTable() → Tabela de transações
└── renderPagination()       → Paginação
```

---

### 5.4 JS_Bancos.html
**Função:** Componente de visão por bancos.

```javascript
Variáveis:
├── SELECTED_BANK        → Banco selecionado
└── BANKS_VIEW_MODE      → Modo de visualização (cards/list)

Funções:
├── renderBanksSection()     → Renderiza seção principal
├── renderBanksCards()       → Renderiza cards de bancos
├── renderBanksList()        → Renderiza lista de bancos
├── openBankDetail()         → Abre modal de detalhe
├── closeBankDetail()        → Fecha modal
├── switchBankTab()          → Troca aba no modal
├── setBanksViewMode()       → Altera modo de visualização
└── filterByBank()           → Filtra dashboard por banco
```

---

### 5.5 JS_Contas.html
**Função:** Componente de visão por contas/projetos.

```javascript
Variáveis:
├── SELECTED_PROJECT     → Projeto selecionado
└── PROJECTS_VIEW_MODE   → Modo de visualização

Funções:
├── renderProjectsSection()  → Renderiza seção principal
├── renderProjectsCards()    → Renderiza cards de projetos
├── renderProjectsList()     → Renderiza lista
├── openProjectDetail()      → Abre modal de detalhe
├── closeProjectDetail()     → Fecha modal
├── switchProjectTab()       → Troca aba no modal
└── setProjectsViewMode()    → Altera modo
```

---

### 5.6 JS_ChatAI.html
**Função:** Interface do chatbot de IA.

```javascript
Funções:
├── initChat()               → Inicializa chat
├── renderChatButton()       → Botão flutuante
├── openChat()               → Abre janela do chat
├── closeChat()              → Fecha chat
├── sendMessage()            → Envia mensagem
├── addMessage()             → Adiciona mensagem ao histórico
├── askQuickQuestion()       → Pergunta rápida pré-definida
└── getContextForAI()        → Monta contexto para IA
```

---

### 5.7 JS_Alerts.html
**Função:** Sistema de alertas automáticos.

```javascript
Variáveis:
├── ALERTS_DATA          → Alertas carregados
└── ALERTS_DISMISSED     → Alertas dispensados

Funções:
├── loadAlerts()             → Carrega alertas do backend
├── generateLocalAlerts()    → Gera alertas localmente (fallback)
├── renderAlertsPanel()      → Renderiza painel de alertas
├── renderAlertCard()        → Renderiza card individual
├── dismissAlert()           → Dispensa alerta
├── dismissAllAlerts()       → Dispensa todos
├── showAllAlerts()          → Modal com todos alertas
└── initAlerts()             → Inicialização
```

---

### 5.8 JS_Import.html
**Função:** Importação de extratos OFX/CSV.

```javascript
Variáveis:
└── IMPORT_STATE         → Estado da importação

Funções:
├── openImportModal()        → Abre modal de importação
├── closeImportModal()       → Fecha modal
├── handleFileDrop()         → Processa drag & drop
├── handleFileSelect()       → Processa seleção de arquivo
├── processSelectedFile()    → Processa arquivo
├── previewImportFile()      → Preview do arquivo
├── processImport()          → Executa importação
├── handleImportResult()     → Processa resultado
└── showReconciliationLink() → Mostra link para revisão
```

---

### 5.9 JS_FeatureFlags.html
**Função:** Controle de features por plano.

```javascript
Funções:
├── hasFeature(feature)      → Verifica se feature está disponível
├── requireFeature(feature)  → Exige feature (mostra upgrade se não tiver)
└── getAvailableFeatures()   → Lista features disponíveis

Features controladas:
├── dashboard, filters, charts, goals    → Todos os planos
├── export_csv, export_pdf               → Todos os planos
├── dre                                  → Professional+
├── ai_insights                          → Professional+
├── alerts                               → Enterprise
├── predictive_analytics                 → Enterprise
└── whatsapp_reports                     → Enterprise
```

---

### 5.10 Outros Arquivos

| Arquivo | Função |
|---------|--------|
| JS_Events.html | Handlers de eventos (cliques, filtros, etc) |
| JS_Charts.html | Renderização de gráficos (Chart.js) |
| JS_Logic.html | Cálculos e lógica de negócio |
| JS_Components.html | Componentes reutilizáveis (cards, modais) |
| JS_EnhancedInsights.html | Insights financeiros avançados |
| JS_Keyboard.html | Atalhos de teclado |
| JS_Onboarding.html | Tutorial de primeiro acesso |
| JS_Init.html | Inicialização da aplicação |
| styles.html | CSS customizado |
| service-worker.html | PWA Service Worker |

---

## 6. Sistema Multi-Cliente (ADMIN)

### 6.1 Fluxo de Acesso

```
1. Cliente acessa: https://script.google.com/.../exec?client=empresa_abc
                                                     ↓
2. doGet() lê parâmetro "client"
                                                     ↓
3. AdminService.getClientById("empresa_abc")
                                                     ↓
4. Busca na ADMIN_MASTER → spreadsheet_id
                                                     ↓
5. Salva em PropertiesService.getUserProperties()
                                                     ↓
6. DataService.fetchAllData() usa esse spreadsheet_id
                                                     ↓
7. Renderiza dashboard com dados do cliente
```

### 6.2 Estrutura ADMIN_MASTER

```
ADMIN_DASHBOARD_MASTER (Planilha)
│
├── CLIENTES
│   │ client_id │ nome │ spreadsheet_id │ plano │ status │
│   │ emp_001   │ XPTO │ 1abc123...     │ prof  │ ativo  │
│
├── CONFIG_GLOBAL
│   │ chave           │ valor    │
│   │ openai_api_key  │ sk-xxx   │
│   │ limite_ia_basic │ 0        │
│
├── LOG_SISTEMA
│   │ timestamp │ client_id │ acao  │ detalhes │
│
└── ALERTAS_PENDENTES
    │ timestamp │ client_id │ tipo │ mensagem │
```

### 6.3 Papel de Cada Componente

| Componente | Papel |
|------------|-------|
| **Projeto Apps Script** | Contém TODO o código. É único para todos os clientes. |
| **ADMIN_MASTER** | Controle central. Lista clientes, configura limites, registra logs. |
| **Planilha do Cliente** | Apenas DADOS. Não tem código. É onde o cliente/equipe preenche. |

---

## 7. Análise de Escalabilidade

### 7.1 Pontos Fortes ✅

| Aspecto | Análise |
|---------|---------|
| **Atualização de código** | Um deploy atualiza todos os clientes |
| **Custo de IA** | ~R$ 0,003/consulta - insignificante |
| **Cache** | CacheService reduz leituras de planilha |
| **Separação de dados** | Cada cliente em planilha separada |
| **Controle de acesso** | client_id + status na ADMIN |

### 7.2 Pontos de Atenção ⚠️

| Aspecto | Risco | Mitigação |
|---------|-------|-----------|
| **Limite de execução GAS** | 6min/execução | Otimizar leituras, usar cache |
| **Quota de API** | 20.000 req/dia (free) | Monitorar, considerar Workspace |
| **Planilhas grandes** | >50k linhas lento | Arquivar dados antigos |
| **Concorrência** | Múltiplos acessos | Cache + locks se necessário |

### 7.3 Campos e Relacionamentos

```
Validação de Consistência:

TRANSACOES.Conta ─────────► CONTAS.ID         ✅ Validado
TRANSACOES.Banco ─────────► BANCOS.ID         ✅ Validado
TRANSACOES.Categoria ─────► CONTAS.Nome       ✅ Validado (ou CATEGORIAS)
METAS.Categoria ──────────► CONTAS.Nome       ✅ Validado
CATEGORIAS.Categoria ─────► CONTAS.Nome       ✅ Validado
```

### 7.4 Recomendações para Escala

1. **Até 50 clientes:** Estrutura atual funciona bem
2. **50-200 clientes:** Implementar arquivamento automático
3. **200+ clientes:** Considerar migração para Cloud SQL + App Engine

---

## 8. Guia de Manutenção

### 8.1 Tarefas Comuns

| Tarefa | Arquivo | Local |
|--------|---------|-------|
| Mudar preço dos planos | DataService.gs | PLAN_FEATURES |
| Adicionar nova feature | DataService.gs + JS_FeatureFlags.html | PLAN_FEATURES + hasFeature() |
| Novo tipo de alerta | AlertService.gs | analyzeAndGenerateAlerts() |
| Mudar modelo OpenAI | Main.gs | callOpenAI() |
| Adicionar nova aba | DataService.gs | criar readNovaAba() |
| Novo campo em transação | DataService.gs + JS_Render.html | readTransactions() + tabela |

### 8.2 Deploy de Atualizações

```
1. Editar código no Apps Script
2. Salvar (Ctrl+S)
3. Testar: "Executar" → função de teste
4. Deploy:
   - "Implantar" → "Gerenciar implantações"
   - Editar implantação existente
   - Nova versão → Implantar
5. Testar URL em aba anônima
```

### 8.3 Troubleshooting

| Problema | Causa Provável | Solução |
|----------|---------------|---------|
| Erro 404 | Deploy não publicado | Verificar implantação |
| Dados não carregam | spreadsheet_id errado | Verificar ADMIN_MASTER |
| IA não responde | API key inválida | Verificar CONFIG_GLOBAL |
| Cliente não encontrado | client_id errado | Verificar parâmetro URL |
| Lento | Muitos dados | Implementar paginação/cache |

### 8.4 Logs e Debug

```javascript
// No backend (Apps Script)
Logger.log('Mensagem de debug');

// Ver logs:
// Apps Script → "Execuções" → Selecionar execução → Ver logs

// No frontend (Console do navegador)
console.log('Debug:', variavel);
```

---

## Checklist de Implantação

- [ ] Criar projeto Apps Script
- [ ] Copiar todos os arquivos .gs e .html
- [ ] Criar planilha ADMIN_MASTER
- [ ] Executar `createAdminStructure()` na ADMIN
- [ ] Configurar API Key na CONFIG_GLOBAL
- [ ] Criar planilha do primeiro cliente
- [ ] Executar `criarEstruturaCompleta()` na planilha do cliente
- [ ] Cadastrar cliente na ADMIN_MASTER (aba CLIENTES)
- [ ] Fazer deploy do Web App
- [ ] Testar URL: `...exec?client=CLIENT_ID`
- [ ] Configurar trigger mensal para `monthlyReset()`

---

*Documentação criada em Dezembro 2025*
*Versão do Sistema: 3.3.0*
