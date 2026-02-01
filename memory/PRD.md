# PRD - Dashboard Financeiro B2B (DashFinV4)

## Informações do Projeto

**Nome**: Dashboard Financeiro B2B Multi-Tenant
**Versão**: 3.6.0
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
- Pode importar OFX/CSV e aprovar transações
- Cria regras de categorização
- Acesso a todas as funcionalidades

### 3. Administrador
- Gerencia a planilha ADMIN_MASTER
- Configura planos, limites de IA, API keys
- Monitora uso do sistema

---

## O Que Foi Implementado

### v3.6.0 - Janeiro 2026 (PAINEL DE APROVAÇÃO)

#### Nova Funcionalidade: Painel de Aprovação de Importação
- ✅ **Fluxo completo dentro do dashboard**: Não precisa mais ir à planilha
- ✅ **Categorização automática**: Regras primeiro, IA quando necessário
- ✅ **Edição de transações**: Alterar categoria, subcategoria, centro de custo
- ✅ **Criar regras on-the-fly**: A partir de qualquer transação
- ✅ **Aprendizado automático**: Sistema cria regras baseado nas correções
- ✅ **Gerenciador de regras**: Visualizar e excluir regras existentes
- ✅ **Re-categorização com IA**: Para transações pendentes

#### Como Funciona a Categorização
1. **Regras (prioridade)**: Busca na aba REGRAS_CATEGORIZACAO
2. **IA (fallback)**: Consulta OpenAI quando não há regra
3. **Aprendizado**: Ao aprovar, sistema cria regra automaticamente

### v3.5.0 - Janeiro 2026 (REVISÃO COMPLETA)
- ✅ Saldo dinâmico de bancos e contas
- ✅ Patrimônio total calculado dos bancos
- ✅ Botão Atualizar limpa cache corretamente
- ✅ KPIs reposicionados no topo
- ✅ Projeção de fluxo de caixa corrigida

### v3.4.0 - Janeiro 2026
- ✅ Bug das metas corrigido
- ✅ API Key da IA buscada da CONFIG_GLOBAL
- ✅ Script de atualização da ADMIN_MASTER

---

## Estrutura de Arquivos Principais

```
/app/
├── Main.js                    # Entry point + Chatbot IA
├── Config.js                  # Configurações e API Key
├── DataService.js             # Leitura de dados (saldo dinâmico)
├── AdminService.js            # Gestão multi-tenant
├── ImportService.js           # Parse OFX/CSV
├── CategorizationService.js   # Categorização com IA e Regras
├── AlertService.js            # Sistema de alertas
├── CacheManager.js            # Gestão de cache
├── Controller.js              # API do frontend
│
├── JS_Core.html               # Variáveis globais e utilitários
├── JS_Init.html               # Inicialização
├── JS_Logic.html              # Cálculos (metas, projeção, saúde)
├── JS_Render.html             # Renderização UI principal
├── JS_Events.html             # Eventos e interações
├── JS_Charts.html             # Gráficos Chart.js
├── JS_Import.html             # Modal de importação
├── JS_ApprovalPanel.html      # NOVO: Painel de aprovação
├── JS_EnhancedInsights.html   # Insights inteligentes
│
├── scripts/
│   ├── CRIAR_ESTRUTURA_CLIENTE.gs
│   └── ATUALIZAR_ADMIN_MASTER.gs
│
└── docs/
    ├── DOCUMENTACAO_TECNICA_COMPLETA.md
    ├── ESTRUTURA_PLANILHA.md
    └── GUIA_ATUALIZACAO_ADMIN.md
```

---

## Fluxo de Importação de Extratos (v3.6.0)

```
1. Consultor clica "Importar" (só aparece para equipe)
       ↓
2. Seleciona banco e arquivo OFX/CSV
       ↓
3. Sistema faz parse do arquivo
       ↓
4. Detecta duplicatas (ignora)
       ↓
5. Categoriza cada transação:
   - Busca REGRAS_CATEGORIZACAO → se encontrar, usa
   - Se não encontrar, usa IA (OpenAI)
   - Se não tiver IA, marca como "A Classificar"
       ↓
6. Abre PAINEL DE APROVAÇÃO no dashboard
       ↓
7. Consultor pode:
   - Editar categoria de cada transação
   - Criar regras para futuras importações
   - Re-categorizar com IA
   - Desselecionar transações
       ↓
8. Clica "Confirmar Importação"
       ↓
9. Sistema salva na aba TRANSACOES do cliente
       ↓
10. Sistema aprende: cria regras automáticas das correções
```

---

## Lógica de Categorização

### Prioridade:
1. **Regras manuais** (confiança 95%)
2. **IA OpenAI** (confiança variável 50-90%)
3. **"A Classificar"** (confiança 0%)

### Aba REGRAS_CATEGORIZACAO
| padrao | categoria | subcategoria | tipo |
|--------|-----------|--------------|------|
| pix recebido | Vendas | Serviços | auto |
| pagamento aluguel | Aluguel | - | Saída |
| fornecedor | Fornecedores | - | Saída |

### Aprendizado Automático
Quando consultor aprova uma transação com categoria válida:
1. Sistema extrai 2-3 palavras-chave da descrição
2. Cria regra automaticamente na aba REGRAS_CATEGORIZACAO
3. Futuras transações similares serão categorizadas automaticamente

---

## Backlog

### P0 - Crítico
- [x] Todas as correções críticas implementadas

### P1 - Alta Prioridade
- [ ] Alertas automáticos por email
- [ ] Relatórios via WhatsApp
- [ ] Análise preditiva refinada

### P2 - Média Prioridade
- [ ] Integração Open Banking
- [ ] PWA mobile
- [ ] Multi-idiomas

---

**Última Atualização**: Janeiro 2026
