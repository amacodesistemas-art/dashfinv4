# Dashboard Financeiro B2B - Product Requirements Document

## Problema Original

O utilizador pretende construir um sistema de dashboard financeiro B2B profissional. A arquitetura consiste em:
- Frontend responsivo: HTML, JavaScript (ES6+), e Tailwind CSS (via CDN)
- Backend: Google Apps Script
- Base de dados: Google Sheets

Os clientes têm uma vista somente-leitura do dashboard. A equipa do utilizador gere toda a entrada de dados através do Google Sheets.

## Modelo de Negócio

### Estrutura de Planos

| Plano | Preço | IA | DRE | Alertas |
|-------|-------|-----|-----|---------|
| Básico | R$ 297/mês | ❌ | ❌ | ❌ |
| Profissional | R$ 597/mês | 30/mês | ✅ | ❌ |
| Enterprise | R$ 1.297/mês | ∞ | ✅ | ✅ |

### Custo de IA por Consulta
~R$ 0,003 (insignificante) - usando GPT-4o-mini

## Requisitos do Produto

### Funcionalidades Core
- [x] Dashboard de visão geral com KPIs
- [x] Gráficos de fluxo de caixa e despesas
- [x] Vista de DRE Gerencial (P&L)
- [x] Capacidades avançadas de filtragem
- [x] Acompanhamento de metas
- [x] Páginas de detalhe de contas
- [x] Sistema de limites de IA por plano

### Funcionalidades UX
- [x] Tema Escuro/Claro
- [x] Modo de privacidade (blur de valores)
- [x] Responsividade completa
- [x] Micro-interações

### Sistema de Planos Modulares
- [x] Plano Básico (R$ 297)
- [x] Plano Profissional (R$ 597) - com 30 consultas IA/mês
- [x] Plano Enterprise (R$ 1.297) - IA ilimitada

### Chatbot IA
- [x] Interface de chat integrada
- [x] Respostas baseadas em dados financeiros reais
- [x] Contexto sensível ao período filtrado ✅
- [x] Controle de limites por plano ✅
- [x] Contador de uso mensal ✅

## O Que Foi Implementado

### Versão 3.2.0 (Dezembro 2025)
- **Service Worker corrigido**: Agora usa `ContentService` para MIME type correto
- **Chatbot IA melhorado**:
  - Modelo atualizado para `gpt-4o-mini` (mais rápido e económico)
  - Tratamento de erros robusto
  - Logging detalhado para debug
- **Sistema de limites de IA**:
  - Controle mensal de consultas por plano
  - Contador automático na planilha CONFIG
  - Mensagem de limite atingido
  - Contador de consultas restantes na resposta
- **Preços atualizados** para comercialização

### Versão 3.1.0 (Dezembro 2025)
- Correção do contexto de datas no chatbot
- Bug de acentuação corrigido

## Roadmap de Alto Valor

### Fase 1: ✅ Correções Urgentes
- [x] Service Worker
- [x] Chatbot IA
- [x] Sistema de limites

### Fase 2: Alertas Automáticos (Próximo)
- [ ] Alerta de fluxo de caixa crítico
- [ ] Alerta de inadimplência
- [ ] Alerta de despesa anormal
- [ ] Alerta de meta estourada

### Fase 3: Automação para Equipa
- [ ] Importação automática OFX
- [ ] Categorização inteligente com IA
- [ ] Conciliação assistida

### Fase 4: Diferenciação Premium
- [ ] Previsões de fluxo de caixa (30/60/90 dias)
- [ ] Benchmarks do setor
- [ ] Relatórios automáticos WhatsApp/Email

## Dores Identificadas

### Cliente Final (Empresário)
1. Não sabe onde está vazando dinheiro
2. Falta visibilidade do fluxo de caixa futuro
3. Dificuldade em entender rentabilidade

### Equipa (Consultoria)
1. 2h/semana por cliente em categorização manual
2. Dados vêm de OFX, PDF, Excel
3. Categorização é o maior consumidor de tempo

## Schema da Base de Dados (Google Sheets)

| Tab | Colunas | Descrição |
|-----|---------|-----------|
| CONFIG | Plano, Nome Cliente, AI_API_KEY, AI_USAGE_YYYY-MM | Configuração |
| CONTAS | ID, Name, Type, Balance, Icon | Contas bancárias |
| TRANSACOES | Date, Type, Category, Value, Account, Status, Description | Movimentações |
| CATEGORIAS | Category, DRE_Group | Mapeamento para DRE |
| METAS | Category, Target, Type | Metas financeiras |

## Notas Técnicas

1. **Google Apps Script**: Ficheiros `.js` devem ser `.gs` com ES5
2. **Service Worker**: Servido via `ContentService.createTextOutput()`
3. **Controle de IA**: Uso gravado na CONFIG como `AI_USAGE_YYYY-MM`

---
*Última atualização: Dezembro 2025 - v3.2.0*
