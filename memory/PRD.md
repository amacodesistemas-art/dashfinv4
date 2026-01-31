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

### Não-Funcionais
- [x] Cache de 10 minutos
- [x] Responsivo (mobile, tablet, desktop)
- [x] Atalhos de teclado
- [x] Onboarding para novos usuários

---

## O Que Foi Implementado

### v3.5.0 - Janeiro 2026
- ✅ **Saldo dinâmico de bancos**: `saldo_atual = saldo_inicial + entradas - saídas (pagos)`
- ✅ **Saldo dinâmico de contas/projetos**: Considera todas as transações associadas
- ✅ **Patrimônio total calculado**: Soma dos saldos dos bancos
- ✅ **Botão Atualizar aprimorado**: Limpa cache + reseta filtros + destrói gráficos
- ✅ **KPIs reposicionados**: Entradas/Saídas/Saldo no topo da página
- ✅ **Design renovado KPIs**: Cards com gradientes coloridos
- ✅ **Projeção de fluxo de caixa corrigida**: Parte do patrimônio atual

### v3.4.0 - Janeiro 2026
- ✅ **Correção do bug das metas**: Função `calculateGoalProgress()` reescrita
- ✅ **Correção da busca de API key**: Busca do cliente OU da CONFIG_GLOBAL
- ✅ **Limites de IA dinâmicos**: Lidos da CONFIG_GLOBAL
- ✅ **Script de atualização**: `ATUALIZAR_ADMIN_MASTER.gs`
- ✅ **Documentação atualizada**: CHANGELOG, GUIA_ATUALIZACAO_ADMIN

### v3.3.0 - Janeiro 2026
- Funções globais centralizadas para verificação de status
- Correção de inconsistências entre alertas e cards
- Sistema de importação restrito à equipe

---

## Backlog Priorizado

### P0 - Crítico
- [x] Bug das metas não progredindo para receitas (CORRIGIDO v3.4.0)
- [x] Erro "IA não configurada" (CORRIGIDO v3.4.0)
- [x] Saldo dos bancos fixo (CORRIGIDO v3.5.0)
- [x] Cache não limpando no refresh (CORRIGIDO v3.5.0)

### P1 - Alta Prioridade
- [ ] Alertas automáticos por email (plano Enterprise)
- [ ] Relatórios via WhatsApp
- [ ] Análise preditiva de fluxo de caixa

### P2 - Média Prioridade
- [ ] Integração com Open Banking
- [ ] Dashboard mobile app (PWA)
- [ ] Multi-idiomas (i18n)

### P3 - Baixa Prioridade
- [ ] Machine Learning para previsões
- [ ] Reconhecimento de padrões/anomalias
- [ ] Integração Slack/Discord

---

## Próximas Tarefas

1. **Validar correções**: Testar o dashboard com dados reais do cliente
2. **Verificar saldo dos bancos**: Confirmar que o patrimônio está calculando corretamente
3. **Testar botão Atualizar**: Verificar que não há mais dados fantasmas
4. **Testar metas de receita**: Confirmar que objetivos progridem com entradas

---

## Lógica de Negócio Importante

### Cálculo do Saldo de Banco
```javascript
saldo_atual = saldo_inicial + SUM(entradas_pagas) - SUM(saidas_pagas)
```
- `saldo_inicial`: Valor na coluna "Saldo" da aba BANCOS
- `entradas_pagas`: Transações com status "Pago", "Concluído" ou "Recebido" do tipo "Entrada"
- `saidas_pagas`: Transações com status "Pago", "Concluído" ou "Recebido" do tipo "Saída"

### Cálculo do Patrimônio Total
```javascript
patrimonio_total = SUM(saldo_atual de todos os bancos)
```

### Tipos de Meta Suportados
```javascript
// OBJETIVOS (progride com Entradas)
['receita', 'objetivo', 'entrada', 'sonho', 'meta_receita']

// GASTOS (progride com Saídas)
['gasto', 'saída', 'saida', 'despesa', 'limite']
```

---

**Última Atualização**: Janeiro 2026
