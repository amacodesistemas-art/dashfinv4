# PRD - Dashboard Financeiro B2B (DashFinV4)

## Informações do Projeto

**Nome**: Dashboard Financeiro B2B Multi-Tenant
**Versão**: 3.4.0
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

### Não-Funcionais
- [x] Cache de 10 minutos
- [x] Responsivo (mobile, tablet, desktop)
- [x] Atalhos de teclado
- [x] Onboarding para novos usuários

---

## O Que Foi Implementado

### v3.4.0 - Janeiro 2026
- ✅ **Correção do bug das metas**: Função `calculateGoalProgress()` reescrita para calcular corretamente objetivos (receitas) e gastos (limites)
- ✅ **Correção da busca de API key**: Agora busca da CONFIG do cliente OU da CONFIG_GLOBAL da ADMIN_MASTER
- ✅ **Limites de IA dinâmicos**: Lidos da CONFIG_GLOBAL ao invés de hardcoded
- ✅ **Script de atualização**: `ATUALIZAR_ADMIN_MASTER.gs` para configurar a planilha admin
- ✅ **Documentação atualizada**: CHANGELOG, GUIA_ATUALIZACAO_ADMIN, ESTRUTURA_PLANILHA

### v3.3.0 - Janeiro 2026
- Funções globais centralizadas para verificação de status
- Correção de inconsistências entre alertas e cards
- Sistema de importação restrito à equipe

### v3.2.0 - Janeiro 2026
- Botão de importação visível apenas para equipe
- Correção do nome da empresa mostrando "desconhecido"
- Onboarding renovado com 8 passos

### v3.1.0 - Dezembro 2025
- Chatbot de IA respeitando filtros de data
- Parsing de datas corrigido
- Logs para debug

---

## Backlog Priorizado

### P0 - Crítico
- [x] Bug das metas não progredindo para receitas (CORRIGIDO v3.4.0)
- [x] Erro "IA não configurada" mesmo com API na ADMIN_MASTER (CORRIGIDO v3.4.0)

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

1. **Validar correções**: Testar o painel de metas com dados reais do cliente
2. **Executar script de atualização**: Rodar `ATUALIZAR_ADMIN_MASTER.gs` na planilha admin do cliente
3. **Configurar API key**: Adicionar a chave OpenAI na CONFIG_GLOBAL
4. **Atualizar documentação do cliente**: Se necessário, gerar nova documentação técnica

---

## Estrutura de Arquivos Principais

```
/app/
├── Main.js                 # Entry point + Chatbot IA
├── Config.js               # Configurações
├── DataService.js          # Leitura de dados
├── AdminService.js         # Gestão multi-tenant
├── JS_Logic.html           # Cálculos (incluindo metas)
├── JS_Render.html          # Renderização UI
├── JS_ChatAI.html          # Interface do chat
├── scripts/
│   ├── CRIAR_ESTRUTURA_CLIENTE.gs
│   └── ATUALIZAR_ADMIN_MASTER.gs
├── docs/
│   ├── DOCUMENTACAO_TECNICA_COMPLETA.md
│   ├── ESTRUTURA_PLANILHA.md
│   ├── GUIA_ATUALIZACAO_ADMIN.md
│   └── ...
└── CHANGELOG.md
```

---

## Notas Técnicas

### Tipos de Meta Suportados
```javascript
// OBJETIVOS (progride com Entradas)
['receita', 'objetivo', 'entrada', 'sonho', 'meta_receita']

// GASTOS (progride com Saídas)
['gasto', 'saída', 'saida', 'despesa', 'limite']
```

### Busca de API Key (ordem)
1. Aba CONFIG da planilha do cliente (`ai_api_key`)
2. Aba CONFIG_GLOBAL da ADMIN_MASTER (`openai_api_key`)

### Limites de IA
- Lidos de `CONFIG_GLOBAL` (`limite_ia_basic`, `limite_ia_professional`, `limite_ia_enterprise`)
- Se não configurado, usa valores padrão do código

---

**Última Atualização**: Janeiro 2026
