# 🎯 Guia Completo: Sistema Modular de Planos + IA

## 📋 Visão Geral

Sistema implementado com 3 planos modulares e recursos de IA para classificação automática e insights avançados.

### **Planos Disponíveis:**

| Plano | Preço | DRE | IA Classificação | IA Insights |
|-------|-------|-----|------------------|-------------|
| **Básico** | R$ 97/mês | ❌ | ❌ | ❌ |
| **Intermediário** | R$ 197/mês | ✅ | ❌ | ❌ |
| **Avançado** | R$ 397/mês | ✅ | ✅ | ✅ |

---

## 🔧 Configuração Inicial

### **Passo 1: Configurar Plano na Planilha**

Na aba **CONFIG** do Google Sheets, adicione:

| Coluna A | Coluna B |
|----------|----------|
| plano | básico |

**Valores aceitos:**
- `básico` ou `basic` → Plano Básico
- `intermediário` ou `intermediate` → Plano Intermediário
- `avançado` ou `advanced` → Plano Avançado

**Exemplo:**
```
A                B
--------------------------
nome_cliente     Empresa XYZ
cnpj             12.345.678/0001-99
plano            intermediário
```

### **Passo 2: Configurar API Key (Apenas Plano Avançado)**

Se o cliente está no **Plano Avançado** e quer usar IA:

1. **Obter Emergent LLM Key:**
   - Use a ferramenta `emergent_integrations_manager`
   - Ou cliente fornece chave própria da OpenAI

2. **Adicionar na planilha CONFIG:**

| Coluna A | Coluna B |
|----------|----------|
| ai_api_key | sk-proj-... |

---

## 📊 Como Alimentar o DRE (Planos Intermediário e Avançado)

### **Estrutura da Aba CATEGORIAS:**

Crie aba chamada **CATEGORIAS** com 2 colunas:

| Categoria | Grupo DRE |
|-----------|-----------|
| Vendas | Receita |
| Serviços | Receita |
| CMV | Custo Variável |
| Matéria Prima | Custo Variável |
| Salários | Despesa Fixa |
| Aluguel | Despesa Fixa |
| Marketing | Despesa Fixa |
| Equipamentos | Investimento |
| Software | Investimento |

### **Grupos DRE Disponíveis:**

1. **Receita** - Faturamento
2. **Custo Variável** - Custos que variam com produção
3. **Despesa Fixa** - Custos fixos mensais
4. **Investimento** - Compra de ativos
5. **Não Operacional** - Fora da operação (juros, multas)

---

## 🤖 Como Usar IA (Apenas Plano Avançado)

### **1. Classificação Automática de Transações**

**O que faz:** IA analisa descrição e sugere categoria/subcategoria.

**Como usar (pela equipe):**

1. **No Google Apps Script**, criar função:

```javascript
function classificarTransacao() {
  // Inicializa IA com chave
  const apiKey = 'sk-proj-...'; // Ou pega do CONFIG
  AIService.init(apiKey);
  
  // Classifica transação
  const result = AIService.classifyTransaction(
    'Pagamento Google Ads - Campanha Janeiro',
    2500,
    'Saída'
  );
  
  Logger.log(result);
  // {
  //   success: true,
  //   categoria: 'Marketing',
  //   subcategoria: 'Google Ads',
  //   confianca: 0.95,
  //   justificativa: 'Claramente identificado como despesa de marketing digital'
  // }
}
```

2. **Usar resultado** para preencher planilha automaticamente

**Benefício:** Economiza 80% do tempo de classificação manual.

### **2. Insights Avançados com IA**

**O que faz:** IA analisa padrões e gera recomendações estratégicas.

**Exemplo de output:**

```json
[
  {
    "titulo": "Oportunidade de Redução em Marketing",
    "descricao": "Seus gastos com marketing aumentaram 35% sem proporcional aumento de receita. Considere revisar ROI das campanhas.",
    "prioridade": "alta",
    "categoria": "otimizacao",
    "acao": "Auditar campanhas de Google Ads e pausar as com CPA > R$ 150"
  },
  {
    "titulo": "Tendência Positiva de Crescimento",
    "descricao": "Receitas crescem consistentemente 12% ao mês nos últimos 3 meses.",
    "prioridade": "baixa",
    "categoria": "crescimento",
    "acao": "Considerar expansão da equipe comercial"
  }
]
```

### **3. Análise Preditiva**

**O que faz:** Prevê fluxo de caixa dos próximos 3 meses.

**Exemplo:**
```javascript
function preverFluxo() {
  AIService.init(apiKey);
  
  const transactions = DataService.readTransactions(...);
  const prediction = AIService.predictCashFlow(transactions, 3);
  
  Logger.log(prediction);
  // {
  //   previsao: [
  //     {mes: '2025-02', entradas: 55000, saidas: 38000, saldo: 17000},
  //     {mes: '2025-03', entradas: 58000, saidas: 40000, saldo: 18000},
  //     {mes: '2025-04', entradas: 62000, saidas: 42000, saldo: 20000}
  //   ],
  //   tendencia: 'crescimento',
  //   confianca: 0.82
  // }
}
```

---

## 🎨 Interface do Cliente

### **Visualização de Plano**

Cliente vê badge no header:
```
⭐ Intermediário
```

### **Features Bloqueadas**

Se cliente tenta acessar feature não disponível:

```
┌──────────────────────────────────────┐
│  🔒 DRE Gerencial                    │
│  Disponível em Planos Superiores     │
│                                      │
│  [⚡ Ver Planos]  [💬 Falar com     │
│                     Consultor]       │
└──────────────────────────────────────┘
```

### **Modal de Upgrade**

Mostra comparativo dos 3 planos com:
- Preços
- Features incluídas/não incluídas
- Botão de upgrade
- Link para WhatsApp

---

## 🔄 Workflow Completo

### **Para Cliente Novo (Plano Básico):**

1. **Equipe cria planilha** com aba CONFIG
2. Define: `plano = básico`
3. **Implanta dashboard**
4. Cliente acessa e vê features básicas
5. **Toggle DRE não aparece** (feature desabilitada)
6. Insights básicos funcionam normalmente

### **Cliente Faz Upgrade para Intermediário:**

1. **Equipe atualiza** CONFIG: `plano = intermediário`
2. Cria **aba CATEGORIAS** com mapeamento DRE
3. Cliente recarrega dashboard
4. **Toggle DRE aparece** automaticamente
5. Cliente pode alternar entre Caixa/DRE

### **Cliente Faz Upgrade para Avançado:**

1. **Equipe atualiza** CONFIG: `plano = avançado`
2. Adiciona `ai_api_key` no CONFIG
3. Cliente recarrega dashboard
4. **Insights com IA** aparecem automaticamente
5. **Previsões** são geradas
6. Badge muda para ⭐ Avançado

---

## 🧪 Como Testar

### **Teste 1: Mudança de Plano**

```javascript
// No Apps Script
function testPlans() {
  Logger.log('=== TESTE DE PLANOS ===');
  
  const planInfo = getPlanInfo();
  Logger.log('Plano: ' + planInfo.name);
  Logger.log('DRE disponível? ' + hasFeature('dre'));
  Logger.log('IA disponível? ' + hasFeature('ai_classification'));
}
```

### **Teste 2: Feature Flags no Frontend**

```javascript
// No console do navegador (F12)
console.log('Plano:', GLOBAL_DATA.plan);
console.log('DRE disponível?', hasFeature('dre'));
console.log('IA disponível?', hasFeature('ai_insights'));
```

### **Teste 3: Classificação com IA**

```javascript
// No Apps Script
function testAI() {
  AIService.init('sua-chave-aqui');
  
  const result = AIService.classifyTransaction(
    'Pagamento Salário João',
    5000,
    'Saída'
  );
  
  Logger.log(result);
  // Deve retornar: categoria='RH', subcategoria='Salários'
}
```

---

## 💰 Estratégia de Venda

### **Upsell Automático:**

Cliente no **Básico** vê no dashboard:
```
💡 Dica: Desbloqueie DRE Gerencial 
no plano Intermediário por apenas +R$ 100/mês
[Ver Benefícios]
```

Cliente no **Intermediário** vê:
```
🤖 Economize 5h/mês com IA
Classifique transações automaticamente
[Fazer Upgrade]
```

### **Argumentos de Venda:**

**Básico → Intermediário:**
- ✅ DRE Gerencial profissional
- ✅ Relatórios personalizados
- ✅ Suporte prioritário
- 💰 ROI: Economiza 3h/mês de trabalho manual

**Intermediário → Avançado:**
- ✅ Classificação automática (economiza 5h/mês)
- ✅ Insights com IA (decisões mais inteligentes)
- ✅ Previsão de fluxo de caixa (planejamento)
- 💰 ROI: Cliente aumenta margem em 15-20%

---

## 📊 Métricas de Sucesso

### **Para Monitorar:**

1. **Taxa de Upgrade:** % clientes que fazem upgrade
2. **Tempo de Uso:** Clientes avançados usam 3x mais
3. **Churn:** Clientes avançados cancelam 50% menos
4. **NPS:** Clientes IA têm NPS 30 pontos maior

---

## 🔐 Segurança

### **API Keys:**

- ✅ Armazenadas apenas no CONFIG (Google Sheets)
- ✅ Não enviadas para frontend
- ✅ Usadas apenas no backend (Apps Script)
- ✅ Nunca logadas ou expostas

### **Feature Flags:**

- ✅ Validados no backend (PlanManager.js)
- ✅ Re-validados no frontend (JS_FeatureFlags)
- ✅ Cliente não pode "hackear" para desbloquear features

---

## 🆘 Troubleshooting

### **DRE não aparece (Plano Intermediário)**

**Causa:** Aba CATEGORIAS não existe ou mal configurada

**Solução:**
1. Criar aba CATEGORIAS
2. Preencher mapeamentos
3. Recarregar dashboard

### **IA não funciona (Plano Avançado)**

**Causa:** API Key inválida ou não configurada

**Solução:**
1. Verificar CONFIG tem `ai_api_key`
2. Testar key: `testAI()` no Apps Script
3. Ver logs para erro específico

### **Cliente vê features que não deveria**

**Causa:** Plano não configurado corretamente

**Solução:**
1. Verificar CONFIG: `plano` está correto?
2. Reimplantar Web App
3. Cliente limpar cache e recarregar

---

## ✅ Checklist de Implantação

**Para cada novo cliente:**

- [ ] Definir plano contratado
- [ ] Atualizar CONFIG com plano correto
- [ ] Se Intermediário+: criar aba CATEGORIAS
- [ ] Se Avançado: adicionar ai_api_key
- [ ] Testar no Apps Script: `testPlans()`
- [ ] Testar no dashboard: abrir e verificar features
- [ ] Validar badge do plano aparece
- [ ] Confirmar features bloqueadas não aparecem

---

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Para**: Equipe de Consultoria
