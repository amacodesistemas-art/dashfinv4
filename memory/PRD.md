# Dashboard Financeiro B2B - Product Requirements Document

## Problema Original

O utilizador pretende construir um sistema de dashboard financeiro B2B profissional. A arquitetura consiste em:
- Frontend responsivo: HTML, JavaScript (ES6+), e Tailwind CSS (via CDN)
- Backend: Google Apps Script
- Base de dados: Google Sheets

Os clientes têm uma vista somente-leitura do dashboard. A equipa do utilizador gere toda a entrada de dados através do Google Sheets.

## Requisitos do Produto

### Funcionalidades Core
- [x] Dashboard de visão geral com KPIs
- [x] Gráficos de fluxo de caixa e despesas
- [x] Vista de DRE Gerencial (P&L)
- [x] Capacidades avançadas de filtragem
- [x] Acompanhamento de metas
- [x] Páginas de detalhe de contas

### Funcionalidades UX
- [x] Tema Escuro/Claro
- [x] Modo de privacidade (blur de valores)
- [x] Responsividade completa
- [x] Micro-interações

### Sistema de Planos Modulares
- [x] Plano Básico
- [x] Plano Intermediário  
- [x] Plano Avançado (com IA e DRE)

### Chatbot IA (Plano Avançado)
- [x] Interface de chat integrada
- [x] Respostas baseadas em dados financeiros reais
- [x] Contexto sensível ao período filtrado ✅ CORRIGIDO

### PWA
- [x] Service Worker para cache
- [x] Instalável no ecrã inicial
- [x] Funcionalidade offline parcial

## O Que Foi Implementado

### Versão 3.1.0 (Dezembro 2025)
- **Correção do Chatbot IA**: O chatbot agora respeita os filtros de data selecionados
  - Parsing de datas corrigido com horas definidas
  - Filtragem de transações corrigida
  - Bug de acentuação `'Saida'` → `'Saída'` corrigido
  - Logging para debug adicionado

### Versão 3.0.0 (Janeiro 2025)
- Sistema de atalhos de teclado
- Onboarding interativo
- Análise inteligente aprimorada (10 tipos)
- Indicadores de status melhorados
- Documentação completa

## Arquitectura

```
/app/
├── *.gs (Backend - Google Apps Script)
│   ├── Main.gs (Entrypoint, doGet, AI endpoint)
│   ├── DataService.gs (Data fetching, Plan logic)
│   ├── ValidationService.gs (Data validation)
│   └── Config.gs (ID da planilha)
│
├── *.html (Frontend Structure & JS Modules)
│   ├── index.html (Página principal)
│   ├── styles.html (CSS customizado)
│   ├── service-worker.html (PWA logic)
│   ├── JS_ChatAI.html (Chatbot UI/Logic)
│   ├── JS_Core.html (Variáveis globais)
│   ├── JS_Render.html (UI Rendering)
│   ├── JS_Logic.html (Lógica de negócio)
│   ├── JS_Events.html (Eventos e interação)
│   ├── JS_FeatureFlags.html (Frontend plan checks)
│   └── ...
│
└── *.md (Documentação)
    ├── README.md
    ├── CHANGELOG.md
    └── ...
```

## Schema da Base de Dados (Google Sheets)

| Tab | Colunas | Descrição |
|-----|---------|-----------|
| CONFIG | Plano, Nome Cliente, CNPJ, AI_API_KEY | Configuração do cliente |
| CONTAS | ID, Name, Type, Balance, Icon | Contas bancárias |
| TRANSACOES | Date, Type, Category, Subcategory, Value, Account, Status, Description, Cost Center | Movimentações |
| CATEGORIAS | Category, DRE_Group | Mapeamento para DRE |
| METAS | Category, Target, Type | Metas financeiras |

## Endpoints/Funções Principais

| Função | Descrição |
|--------|-----------|
| `doGet(e)` | Entrypoint - serve HTML, SW ou manifest |
| `getClientData()` | Retorna dados iniciais do dashboard |
| `refreshData()` | Atualiza dados do cache |
| `askAIFinancialQuestion(question, context)` | Processa pergunta do chatbot |

## Tarefas Pendentes

### P1 - Próximas Tarefas
- [ ] Ecrã de Detalhes da Conta (vista ao clicar numa conta)
- [ ] Classificação Automática de Dados (regras automáticas)

### P2 - Futuras
- [ ] Exportação para PDF melhorada
- [ ] Atalhos de teclado completos
- [ ] IA conversacional (multi-turn)

## Integrações de Terceiros

- **Chart.js**: Visualização de dados
- **Tailwind CSS**: Styling via CDN
- **Lucide Icons**: Ícones
- **OpenAI API**: Chatbot IA (requer API key na CONFIG)

## Notas Técnicas Importantes

1. **Google Apps Script**: Todos os ficheiros `.js` backend devem ser salvos como `.gs` e usar JavaScript ES5 compatível (sem const/let, arrow functions limitadas).

2. **Service Worker**: O ficheiro é servido como HTML com MimeType.JAVASCRIPT via `Main.gs`. Não alterar este padrão.

3. **Planos**: A visibilidade de funcionalidades é controlada pelo valor `Plano` na tab CONFIG do Google Sheets.

4. **Idioma**: Interface e comunicação em Português (PT-BR).

---
*Última atualização: Dezembro 2025*
