# 📊 Dashboard Financeiro B2B - Sistema Completo

**Versão**: 3.4.0 | **Última Atualização**: Janeiro 2026

Sistema profissional de gestão financeira para empresas B2B, com visualização inteligente, análises avançadas e sincronização com Google Sheets.

---

## 📢 Novidades da v3.4.0

- ✅ **Correção do Painel de Metas**: Objetivos/Receitas agora progridem corretamente com transações de Entrada
- ✅ **Configuração de IA via ADMIN_MASTER**: API key e limites agora podem ser configurados centralmente
- ✅ **Script de atualização**: Novo script para atualizar a planilha ADMIN_MASTER automaticamente
- ✅ **Documentação atualizada**: Guias completos para configuração

---

## 🚀 Funcionalidades Principais

### Dashboard & Análise
- ✅ **Score de Saúde Financeira** (0-100) com critérios detalhados
- ✅ **KPIs em Tempo Real**: Receitas, Despesas, Saldo Líquido
- ✅ **Contas a Pagar/Receber** com drill-down automático
- ✅ **DRE Gerencial** com visualização vertical
- ✅ **Análise Inteligente Avançada**:
  - Taxa de queima (Burn Rate)
  - Runway (meses até zerar)
  - Concentração de receita
  - Velocidade do fluxo de caixa
  - Capital de giro
  - Detecção de inadimplência
  - Análise de tendências

### Gráficos & Visualizações
- 📈 **Projeção de Fluxo de Caixa** (30 dias)
- 📊 **Evolução 12 Meses** (barras + linha)
- 🥧 **Despesas por Categoria** (donut)
- 📉 **Comparativo de Períodos**

### Filtros & Busca
- 🔍 **Busca Inteligente** com debounce (400ms)
- 📅 **Filtros de Período**: Semana, Mês, Trimestre, Ano, Personalizado
- 🏷️ **Filtros Avançados**: Categoria, Tipo, Status, Centro de Custo
- 🔄 **Sistema de Status Visual**: Pago, Pendente, Atrasado, Vence Hoje

### Recursos UX
- ⌨️ **Atalhos de Teclado**:
  - `Ctrl+K`: Focar busca
  - `Ctrl+R`: Atualizar dados
  - `D`: Modo escuro/claro
  - `P`: Modo privacidade
  - `←/→`: Navegar páginas
  - `?`: Mostrar atalhos
- 🎓 **Onboarding Interativo** para novos usuários
- 🌙 **Modo Escuro/Claro** com transições suaves
- 🔒 **Modo Privacidade** (blur em valores sensíveis)
- 📱 **100% Responsivo** (Mobile, Tablet, Desktop)
- 📄 **Exportação**: CSV e PDF

### Performance
- ⚡ **Cache Inteligente** (10 minutos)
- 🔄 **Lazy Loading** de gráficos
- 📄 **Paginação** (15 itens por página)
- 🎯 **Debounce** em buscas

## 📋 Estrutura de Arquivos

```
/app/
├── index.html              # Estrutura principal HTML
├── styles.html             # CSS customizado + responsividade
├── Config.js               # Configuração (ID da planilha)
├── Main.js                 # Roteamento Google Apps Script
├── Controller.js           # API do frontend
├── DataService.js          # Leitura do Google Sheets
├── CacheManager.js         # Gerenciamento de cache
├── Utils.js                # Funções utilitárias
├── JS_Core.html            # Variáveis globais e formatadores
├── JS_Logic.html           # Lógica de negócio e cálculos
├── JS_EnhancedInsights.html # Sistema de análise inteligente
├── JS_Render.html          # Renderização de componentes
├── JS_Charts.html          # Gráficos (Chart.js)
├── JS_Events.html          # Gerenciamento de eventos
├── JS_Keyboard.html        # Atalhos de teclado
├── JS_Onboarding.html      # Tutorial para novos usuários
└── JS_Init.html            # Inicialização do app
```

## 🔧 Configuração

### 1. Google Sheets - Estrutura de Abas

O sistema requer uma planilha Google Sheets com as seguintes abas:

#### **CONFIG** (A1:B8)
```
Campo               | Valor
--------------------|------------------
nome_cliente        | Nome da Empresa
cnpj                | 12.345.678/0001-99
logo                | (opcional)
```

#### **CONTAS** (A:E)
```
ID      | Nome      | Tipo              | Saldo    | Ícone
--------|-----------|-------------------|----------|-------
acc_01  | Nubank    | Conta Corrente    | 5000     | 💳
acc_02  | Itaú      | Poupança          | 15000    | 🏦
```

#### **TRANSACOES** (A:I)
```
Data       | Tipo    | Categoria  | Subcategoria | Valor  | Conta  | Status    | Descrição      | Centro Custo
-----------|---------|------------|--------------|--------|--------|-----------|----------------|-------------
2025-01-15 | Entrada | Vendas     | Consultoria  | 10000  | acc_01 | Pago      | Cliente ABC    | SP
2025-01-20 | Saída   | Marketing  | Google Ads   | 2000   | acc_01 | Pendente  | Campanha Jan   | Marketing
```

#### **CATEGORIAS** (A:B)
Mapeamento para DRE Gerencial:
```
Categoria        | Grupo DRE
-----------------|-------------------
Vendas           | Receita
Custo Produto    | Custo Variável
Marketing        | Despesa Fixa
Investimentos    | Investimento
```

#### **METAS** (A:D)
```
Categoria    | Meta   | Cor Alerta | Tipo
-------------|--------|------------|----------
Marketing    | 5000   | warning    | Gasto
Vendas       | 50000  | success    | Objetivo
```

### 2. Instalação no Google Apps Script

1. Crie um novo projeto no [Google Apps Script](https://script.google.com)
2. Crie os arquivos `.gs` e `.html` conforme a estrutura
3. Em `Config.js`, configure o ID da planilha:
```javascript
function getSpreadsheetId() {
  return 'SEU_ID_AQUI'; // Cole o ID da sua planilha
}
```
4. Implante como **Web App**:
   - Clique em `Implantar` > `Nova implantação`
   - Tipo: `Aplicativo da Web`
   - Executar como: `Eu`
   - Quem tem acesso: `Qualquer pessoa com a conta Google` (ou configure conforme necessário)
5. Copie a URL gerada

### 3. Permissões Necessárias

Na primeira execução, o Google solicitará as seguintes permissões:
- ✅ Acesso ao Google Sheets
- ✅ Uso de cache
- ✅ Execução como Web App

## ⌨️ Atalhos de Teclado

| Atalho | Ação |
|--------|------|
| `Ctrl+K` ou `⌘+K` | Focar na busca |
| `Ctrl+R` ou `⌘+R` | Atualizar dados da planilha |
| `D` | Alternar modo escuro/claro |
| `P` | Ativar/desativar modo privacidade |
| `←` | Página anterior |
| `→` | Próxima página |
| `?` | Mostrar lista de atalhos |
| `ESC` | Fechar modais/overlays |

## 🎨 Sistema de Cores

### Light Mode
- **Primary**: Blue (#3b82f6) - Ações principais
- **Success**: Green (#10b981) - Receitas, positivo
- **Danger**: Red (#ef4444) - Despesas, negativo
- **Warning**: Orange (#f59e0b) - Alertas
- **Neutral**: Slate Gray (#64748b) - Texto, bordas

### Dark Mode
- **Background**: #0f172a (slate-900)
- **Cards**: #1e293b (slate-800)
- **Text**: #f8fafc (slate-50)
- **Borders**: #334155 (slate-700)

## 📊 Sistema de Status

| Badge | Cor | Condição |
|-------|-----|----------|
| ✓ Pago | Verde | Transação concluída |
| ⏰ Pendente | Amarelo | Data futura, não pago |
| ⏰ Vence Hoje | Laranja | Data = hoje |
| ⚠️ Atrasado | Vermelho | Data passada, não pago |

## 🧠 Análise Inteligente

O sistema gera insights automáticos baseados em:

1. **Comparação Temporal**: Performance vs período anterior
2. **Burn Rate**: Taxa de queima mensal/diária
3. **Runway**: Meses até zerar o patrimônio
4. **Concentração**: Dependência de clientes específicos
5. **Inadimplência**: Faturas em atraso
6. **Taxa de Poupança**: Percentual de receita guardado
7. **Capital de Giro**: Meses de operação cobertos
8. **Tendências**: Crescimento ou declínio
9. **Velocidade**: Fluxo de transações
10. **Top Categorias**: Maiores despesas

### Prioridades de Insights

- 🔴 **Critical**: Requer ação imediata
- 🟠 **High**: Atenção necessária
- 🟣 **Medium**: Monitore
- 🟢 **Low**: Informativo

## 🔄 Cache & Performance

- **Cache do Usuário**: 10 minutos (CacheService)
- **Carregamento Inicial**: < 2 segundos (alvo)
- **Debounce de Busca**: 400ms
- **Paginação**: 15 itens por página
- **Lazy Loading**: Gráficos renderizados após DOM

## 🎓 Onboarding

O sistema detecta automaticamente novos usuários e exibe um tour guiado:

1. Boas-vindas e introdução
2. Visão geral dos KPIs
3. Contas a pagar/receber (drill-down)
4. Filtros avançados
5. Atalhos de teclado
6. Mensagem final

**Resetar onboarding**: Execute no console do navegador:
```javascript
resetOnboarding();
```

## 🧪 Testes & Depuração

### No Google Apps Script
```javascript
// Testar leitura de dados
function testData() {
  const data = DataService.fetchAllData();
  Logger.log(JSON.stringify(data, null, 2));
}

// Limpar cache
function testClearCache() {
  clearCache();
}
```

### No Console do Navegador
```javascript
// Ver dados globais
console.log(GLOBAL_DATA);

// Forçar refresh
refreshDashboard();

// Resetar onboarding
resetOnboarding();

// Testar filtros
applyFilters(GLOBAL_DATA.transactions);
```

## 📱 Responsividade

### Mobile (< 640px)
- Tabelas transformadas em cards verticais
- Menu hambúrguer automático
- Botões flutuantes no canto
- Filtros empilhados

### Tablet (640px - 1024px)
- Layout adaptativo de colunas
- Gráficos redimensionados
- Navegação otimizada

### Desktop (> 1024px)
- Grid completo
- Todas funcionalidades visíveis
- Multi-coluna

## 🔒 Segurança & Privacidade

- ✅ Dados armazenados apenas no Google Sheets
- ✅ Cache por usuário (isolado)
- ✅ Modo privacidade para blur de valores
- ✅ Autenticação via Google Account
- ✅ Sem envio de dados para servidores externos

## 🐛 Troubleshooting

### Erro: "Este painel deve ser executado no Google Apps Script"
**Solução**: Acesse via URL do Web App, não abra o HTML diretamente.

### Dados não carregam
**Soluções**:
1. Verifique o ID da planilha em `Config.js`
2. Confirme permissões do Google Sheets
3. Execute `clearCache()` no Apps Script
4. Verifique se as abas estão nomeadas corretamente

### Gráficos não aparecem
**Soluções**:
1. Aguarde 1-2 segundos após carregamento
2. Verifique console do navegador (F12)
3. Confirme que Chart.js está carregando via CDN

### Performance lenta
**Soluções**:
1. Reduza número de transações (arquive antigas)
2. Verifique se cache está ativo (10 min)
3. Desative modo desenvolvedor do navegador

## 🎯 Roadmap Futuro (Sugestões)

- [ ] Exportação para Excel (.xlsx)
- [ ] Notificações de vencimento via email
- [ ] Múltiplas moedas
- [ ] API REST para integrações
- [ ] App mobile nativo
- [ ] Machine Learning para previsões
- [ ] Comparação com benchmarks de mercado
- [ ] Relatórios automatizados agendados

## 📄 Licença

Este projeto é proprietário. Desenvolvido para uso interno.

## 👨‍💻 Desenvolvedor

Desenvolvido por [Seu Nome/Empresa]
Versão: 3.0.0
Data: Janeiro 2025

---

**🚀 Pronto para usar!** 
Para suporte, consulte a documentação ou entre em contato com o time técnico.
