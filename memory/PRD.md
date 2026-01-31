# PRD - Dashboard Financeiro B2B (DashFinV4)

## Informações do Projeto

**Nome**: Dashboard Financeiro B2B Multi-Tenant
**Versão**: 3.5.0
**Última Atualização**: Janeiro 2026
**Repositório**: dashfinv4 (GitHub conectado ao Emergent)

---

## Visão Geral

Sistema de gestão financeira B2B baseado em Google Apps Script + Google Sheets, com arquitetura multi-tenant para atender múltiplos clientes com uma única base de código.

### Arquitetura
- **Frontend**: HTML + JavaScript (Vanilla) + Tailwind CSS
- **Backend**: Google Apps Script
- **Banco de Dados**: Google Sheets
- **IA**: OpenAI GPT-4o-mini

---

## Personas de Usuário

### 1. Cliente Final
- Acessa o dashboard via URL com parâmetro `?client=ID`
- Visualiza dados financeiros, metas, gráficos
- Usa chatbot de IA (planos Profissional/Enterprise)

### 2. Equipe de Consultoria (Staff)
- Acesso via email cadastrado na lista `emails_equipe`
- Pode importar OFX/CSV
- Acesso a todas as funcionalidades

### 3. Administrador
- Gerencia a planilha ADMIN_MASTER
- Configura planos, limites de IA, API keys
- Monitora uso do sistema

---

## Requisitos Core (Estáticos)

### Funcionais
- [x] Dashboard com KPIs em tempo real
- [x] Filtros de período (semana, mês, trimestre, ano, customizado)
- [x] Visualização de transações com paginação
- [x] Gráficos de evolução e distribuição
- [x] Sistema de metas (gastos e receitas)
- [x] DRE Gerencial
- [x] Chatbot com IA
- [x] Exportação CSV/PDF
- [x] Modo escuro/claro
- [x] Modo privacidade (blur)
- [x] Saldo dinâmico de bancos/contas
- [x] Alertas automáticos

### Não-Funcionais
- [x] Cache de 10 minutos
- [x] Responsivo (mobile, tablet, desktop)
- [x] Atalhos de teclado
- [x] Onboarding para novos usuários

---

## O Que Foi Implementado

### v3.5.0 - Janeiro 2026 (REVISÃO COMPLETA)

#### Correções de Lógica de Negócio:
- ✅ **Saldo dinâmico de bancos**: `saldo_atual = saldo_inicial + entradas - saídas (pagos)`
- ✅ **Saldo dinâmico de contas/projetos**: Considera todas as transações associadas
- ✅ **Patrimônio total calculado**: Soma dos saldos dos bancos (não das contas)
- ✅ **Projeção de fluxo de caixa**: Parte do patrimônio atual dos bancos
- ✅ **Score de saúde financeira**: Usa patrimônio correto
- ✅ **Insights inteligentes**: Runway e Capital de Giro usam patrimônio dos bancos
- ✅ **Sistema de alertas**: Usa bancos para projeção e saldo baixo

#### Correções de UX:
- ✅ **Botão Atualizar aprimorado**: Limpa cache + reseta filtros + destrói gráficos
- ✅ **KPIs reposicionados**: Entradas/Saídas/Saldo no topo da página
- ✅ **Design renovado KPIs**: Cards com gradientes coloridos

### v3.4.0 - Janeiro 2026
- ✅ **Bug das metas**: Objetivos (receitas) agora progridem com Entradas
- ✅ **API Key da IA**: Busca do cliente OU da CONFIG_GLOBAL
- ✅ **Limites de IA dinâmicos**: Lidos da CONFIG_GLOBAL
- ✅ **Script de atualização**: `ATUALIZAR_ADMIN_MASTER.gs`

---

## Arquivos Modificados na v3.5.0

| Arquivo | Modificação |
|---------|-------------|
| `DataService.js` | Cálculo dinâmico de saldo de bancos e contas |
| `Controller.js` | Limpeza correta de cache no refresh |
| `JS_Events.html` | Reset de variáveis no refresh |
| `JS_Render.html` | KPIs no topo, patrimônio total correto |
| `JS_Logic.html` | Projeção e saúde financeira usando bancos |
| `JS_EnhancedInsights.html` | Insights usando patrimônio correto |
| `AlertService.js` | Alertas usando bancos |

---

## Backlog Priorizado

### P0 - Crítico
- [x] Bug das metas não progredindo (CORRIGIDO v3.4.0)
- [x] Erro "IA não configurada" (CORRIGIDO v3.4.0)
- [x] Saldo dos bancos fixo (CORRIGIDO v3.5.0)
- [x] Cache não limpando no refresh (CORRIGIDO v3.5.0)
- [x] Insights usando patrimônio errado (CORRIGIDO v3.5.0)
- [x] Alertas usando contas ao invés de bancos (CORRIGIDO v3.5.0)

### P1 - Alta Prioridade
- [ ] Alertas automáticos por email (plano Enterprise)
- [ ] Relatórios via WhatsApp
- [ ] Análise preditiva de fluxo de caixa

### P2 - Média Prioridade
- [ ] Integração com Open Banking
- [ ] Dashboard mobile app (PWA)
- [ ] Multi-idiomas (i18n)

---

## Lógica de Negócio Importante

### Cálculo do Saldo de Banco
```javascript
// Para BANCOS: considera apenas transações PAGAS
saldo_atual = saldo_inicial + SUM(entradas_pagas) - SUM(saidas_pagas)

// Status considerados como "pago":
['pago', 'concluído', 'concluido', 'recebido']
```

### Cálculo do Saldo de Conta/Projeto
```javascript
// Para CONTAS: considera TODAS as transações associadas
saldo_atual = saldo_inicial + SUM(entradas) - SUM(saidas)
```

### Cálculo do Patrimônio Total
```javascript
patrimonio_total = SUM(saldo_atual de todos os BANCOS)
// NÃO usa contas para patrimônio
```

### Tipos de Meta Suportados
```javascript
// OBJETIVOS (progride com Entradas)
['receita', 'objetivo', 'entrada', 'sonho', 'meta_receita']

// GASTOS (progride com Saídas)
['gasto', 'saída', 'saida', 'despesa', 'limite']
```

### Verificação de Status de Transação (CASE INSENSITIVE)
```javascript
function isTransactionPaid(t) {
  const status = t.status.toLowerCase().trim();
  return ['pago', 'concluído', 'concluido', 'recebido'].includes(status);
}
```

---

**Última Atualização**: Janeiro 2026
