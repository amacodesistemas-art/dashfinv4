# Dashboard Financeiro B2B - Product Requirements Document

## Problema Original

Sistema de dashboard financeiro B2B profissional para consultoria financeira atender múltiplos clientes. O cliente da consultoria visualiza seu fluxo financeiro e tem insights sobre saúde financeira - **apenas visualização, sem inserir ou enviar dados**. Funcionalidades de importação e edição são exclusivas da equipe de consultoria.

## Hierarquia de Dados (ATUALIZADA)

```
BANCO (onde o dinheiro está fisicamente)
├── Nubank, Inter, Itaú, Caixa Físico...
│
└── CONTA/PROJETO (para que serve o dinheiro)
    ├── MOTO, CASA, EMPRESA X...
    │
    └── TRANSAÇÃO (movimento financeiro)
        ├── Pertence a 1 BANCO + 1 CONTA
        └── SUBCATEGORIA (FINANCIAMENTO, MULTA, LUZ...)
```

**Importante:** Uma CONTA pode movimentar em VÁRIOS bancos.

## Modelo de Negócio (ATUALIZADO v3.5)

### Planos para Clientes:

| Plano | Preço | IA | DRE | Alertas | Importação |
|-------|-------|-----|-----|---------|------------|
| **Básico** | R$ 97/mês | ❌ | ❌ | ❌ | ❌ |
| **Intermediário** | R$ 197/mês | ❌ | ✅ | ❌ | ❌ |
| **Avançado** | R$ 397/mês | ✅ | ✅ | ✅ | ❌ |

### Plano para Equipe Interna:

| Plano | Preço | Todas Features | Importação |
|-------|-------|----------------|------------|
| **Admin** | Interno | ✅ | ✅ |

**IMPORTANTE**: Clientes NUNCA veem funcionalidades de importação/edição de dados.

## O Que Foi Implementado

### Versão 3.5.0 (Janeiro 2026) ✅ ATUAL

#### Correções Críticas

1. **Botão de Importação oculto para clientes** 
   - Feature flag `import_enabled` adicionada em todos os planos
   - Valor `false` para todos planos de cliente
   - Novo plano `admin` com `import_enabled: true` para equipe

2. **Nome da empresa corrigido**
   - Função `readConfig()` aprimorada com mapeamento expandido de chaves
   - Reconhece variações: nome, Nome, nome_cliente, Cliente, Empresa, razao_social
   - Fallback seguro para "Cliente" se não encontrado

3. **Onboarding atualizado**
   - 8 passos detalhados (era 6)
   - Descrições mais completas
   - Novos passos sobre filtros e gráficos

**Arquivos modificados**:
- `DataService.js` - Features e readConfig
- `PlanManager.js` - Consistência de features
- `JS_Init.html` - Condição de exibição
- `JS_Onboarding.html` - Passos atualizados
- `CHANGELOG.md` - Documentação

### Versão 3.4.0 (Dezembro 2025)

#### Nova Estrutura de Dados
- **BANCOS** (nova aba): Onde o dinheiro está (Nubank, Inter, etc.)
- **CONTAS** (renomeada): Projetos/Centros de custo (MOTO, CASA, etc.)
- **TRANSACOES** com campo Banco

#### Novas Visões no Dashboard
- **Visão por Bancos**: Saldo, entradas/saídas por banco
- **Visão por Contas/Projetos**: Gastos por projeto, subcategorias
- **Navegação por abas**: Dashboard | Bancos | Contas | DRE

#### Arquitetura Multi-Cliente
- Sistema centralizado (1 código = N clientes)
- ADMIN_MASTER para controle
- URL com parâmetro ?client=ID

#### Funcionalidades
- Alertas automáticos (6 tipos)
- Importação OFX/CSV
- Categorização com IA
- Chatbot financeiro

## Estrutura de Abas (Planilha do Cliente)

| Aba | Descrição |
|-----|-----------|
| CONFIG | Configurações do cliente |
| BANCOS | Onde o dinheiro está (NOVO) |
| CONTAS | Projetos/Centros de custo |
| TRANSACOES | Movimentações (com campo Banco) |
| CATEGORIAS | Mapeamento DRE |
| METAS | Objetivos financeiros |
| REGRAS_CATEGORIZACAO | Regras de importação |

## Documentação Disponível

| Arquivo | Descrição |
|---------|-----------|
| `/app/docs/DOCUMENTACAO_TECNICA_COMPLETA.md` | Guia completo para desenvolvedores |
| `/app/docs/GUIA_PASSO_A_PASSO_COMPLETO.md` | Setup do sistema |
| `/app/docs/NOVA_ESTRUTURA_BANCOS.md` | Estrutura de dados |
| `/app/ROADMAP_COMERCIAL.md` | Precificação e roadmap |

---
*Última atualização: Dezembro 2025 - v3.4.0*

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
