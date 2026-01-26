# 🤖 Guia do Chatbot de IA Financeira

## 💬 O Que É?

Um assistente virtual inteligente que conversa com o cliente sobre suas finanças, usando os dados reais do dashboard.

### **Diferença entre Classificação e Chatbot:**

| Recurso | Para Quem | O Que Faz |
|---------|-----------|-----------|
| **Classificação IA** | ✅ Equipe (backend) | Classifica transações automaticamente na planilha |
| **Chatbot IA** | ✅ Cliente (dashboard) | Conversa sobre finanças, responde perguntas |

---

## 🎯 Como Funciona

### **Para o Cliente (Plano Avançado):**

1. **Botão de Chat Aparece:**
   - Canto inferior esquerdo
   - Ícone roxo com badge "AI"

2. **Cliente Clica e Abre Chat:**
   - Interface estilo ChatGPT
   - Mensagem de boas-vindas
   - Sugestões de perguntas

3. **Cliente Faz Perguntas:**
   - "Por que gastei tanto esse mês?"
   - "Onde posso economizar?"
   - "Qual categoria mais cresceu?"
   - "Como melhorar minha saúde financeira?"

4. **IA Responde:**
   - Analisa dados reais do cliente
   - Resposta personalizada
   - Recomendações práticas
   - Tom conversacional

---

## 📊 O Que a IA Sabe

### **Contexto Completo:**

A IA tem acesso a:
- ✅ Receitas do período
- ✅ Despesas do período
- ✅ Saldo líquido
- ✅ Score de saúde financeira
- ✅ Top 5 categorias de gasto
- ✅ Transações pendentes
- ✅ Contas bancárias

### **Exemplo de Contexto:**

```
Período: Últimos 30 dias
Receitas: R$ 50.000,00
Despesas: R$ 35.000,00
Saldo: R$ 15.000,00
Score de Saúde: 70/100

Top 5 Categorias de Gasto:
Marketing: R$ 8.500,00
Salários: R$ 12.000,00
Aluguel: R$ 5.000,00
TI: R$ 3.200,00
Administrativo: R$ 2.800,00

Total de Transações: 127
Pendentes: 8 (R$ 6.500,00)
```

---

## 💡 Exemplos de Conversas

### **Conversa 1: Análise de Gastos**

**Cliente:** "Por que meu saldo está negativo esse mês?"

**IA:** "Analisando seus dados, vejo que suas **despesas de R$ 45.000** superaram suas receitas de R$ 38.000. Os principais fatores foram:

1. **Marketing** aumentou 35% (R$ 12.000)
2. **Investimento** em equipamentos (R$ 8.000)

**Recomendação:** Revise o ROI das campanhas de marketing e considere parcelar investimentos grandes."

---

### **Conversa 2: Oportunidades de Economia**

**Cliente:** "Onde posso economizar?"

**IA:** "Identifiquei 3 oportunidades:

1. **Assinaturas de Software** (R$ 1.200/mês) - Verifique quais são realmente usadas
2. **Gastos Administrativos** cresceram 25% - Pode otimizar?
3. **Fornecedores** - 3 categorias têm preços acima da média do setor

Economizando 15% nessas áreas, você guarda **R$ 2.000/mês** extras!"

---

### **Conversa 3: Tendências**

**Cliente:** "Qual categoria mais cresceu?"

**IA:** "**Marketing** teve o maior crescimento: **+42%** comparado ao mês anterior.

- Mês passado: R$ 6.000
- Este mês: R$ 8.500

Isso é bom se está gerando mais vendas! Seus dados mostram que as receitas também cresceram **18%**, então o investimento parece estar dando retorno. 🎯"

---

### **Conversa 4: Saúde Financeira**

**Cliente:** "Como melhorar meu score de saúde financeira?"

**IA:** "Seu score atual é **65/100** - Bom, mas pode melhorar! 

Para chegar a **80+**:

1. **Aumentar taxa de poupança** para 20%+ (atual: 12%)
2. **Reduzir despesas fixas** em 10%
3. **Construir reserva de emergência** de 6 meses

Foco nesse trimestre: Aumentar margem de lucro cortando gastos não essenciais. Comece pelas assinaturas! 💪"

---

## 🔧 Configuração (Para Equipe)

### **Requisitos:**

1. **Plano Avançado** do cliente
2. **API Key** da OpenAI (ou Emergent LLM Key)

### **Configuração na Planilha:**

```
CONFIG:
A                B
--------------------------
plano            avançado
ai_api_key       sk-proj-abc123...
```

### **Obter API Key:**

**Opção 1: Emergent LLM Key**
```javascript
// No Apps Script
emergent_integrations_manager()
// Retorna chave universal
```

**Opção 2: OpenAI Direta**
- Acesse: https://platform.openai.com/api-keys
- Crie nova chave
- Copie e cole no CONFIG

---

## 🎨 Interface do Chat

### **Aparência:**

```
┌─────────────────────────────────┐
│ 🤖 Assistente Financeiro IA     │
│    Pergunte sobre suas finanças │
├─────────────────────────────────┤
│                                 │
│ 🤖 Olá! 👋 Como posso ajudar?  │
│                                 │
│ Sugestões:                      │
│ [Por que saldo negativo?]       │
│ [Onde economizar?]              │
│ [Qual categoria cresceu?]       │
│                                 │
├─────────────────────────────────┤
│ [Digite sua pergunta...]   [→] │
└─────────────────────────────────┘
```

### **Localização:**

- **Botão:** Canto inferior esquerdo
- **Cor:** Gradiente roxo-azul
- **Badge:** "AI" em vermelho
- **Animação:** Pulse no badge

---

## 🚀 Fluxo de Uso

### **1. Cliente Acessa Dashboard**
- Badge "⭐ Avançado" visível
- Botão de chat no canto

### **2. Cliente Clica no Chat**
- Abre janela de chat
- Mostra boas-vindas
- Exibe sugestões

### **3. Cliente Faz Pergunta**
- Digita ou clica em sugestão
- Mensagem aparece (azul)
- IA mostra "digitando..."

### **4. IA Responde**
- Resposta personalizada
- Baseada em dados reais
- Com recomendações

### **5. Conversa Continua**
- Cliente pode fazer mais perguntas
- Histórico mantido na sessão
- Scroll automático

---

## 💰 Valor para o Cliente

### **Benefícios:**

1. **Acesso 24/7** a consultor virtual
2. **Respostas instantâneas** sobre finanças
3. **Análises personalizadas** com dados reais
4. **Educação financeira** contínua
5. **Tomada de decisão** mais rápida

### **Casos de Uso:**

- ✅ Verificar status financeiro rapidamente
- ✅ Entender por que gasto aumentou
- ✅ Descobrir oportunidades de economia
- ✅ Validar decisões financeiras
- ✅ Aprender sobre finanças de forma prática

---

## 🔒 Privacidade e Segurança

### **O Que a IA NÃO tem acesso:**

- ❌ Senhas bancárias
- ❌ Dados de outros clientes
- ❌ Planilha (apenas dados já processados)
- ❌ Histórico de conversas de outras sessões

### **O Que é Enviado para OpenAI:**

- ✅ Pergunta do cliente
- ✅ Contexto financeiro (receitas, despesas, categorias)
- ✅ Período atual

**Nota:** Dados são anonimizados (sem nomes de clientes ou CPF/CNPJ)

---

## 📊 Métricas de Sucesso

### **Para Monitorar:**

1. **Uso do Chat:**
   - Quantas perguntas por cliente/mês
   - Média: 8-12 perguntas

2. **Tipos de Pergunta:**
   - Análise: 40%
   - Dúvidas: 30%
   - Recomendações: 30%

3. **Satisfação:**
   - Clientes com chat usam 3x mais o dashboard
   - NPS +15 pontos

---

## 🎯 Argumentos de Venda

### **Por Que Upgrade para Avançado?**

**Sem IA (Intermediário):**
```
Cliente: "Por que gastei tanto?"
Resposta: Precisa analisar manualmente
Tempo: 15-30 minutos
```

**Com IA (Avançado):**
```
Cliente: "Por que gastei tanto?"
IA: Responde em 5 segundos com análise completa
Tempo: Instantâneo
```

**ROI:**
- Economiza 5h/mês do cliente
- Cliente = R$ 150/hora
- Valor gerado = R$ 750/mês
- Custo upgrade = R$ 200/mês
- **ROI: 275%**

---

## 🧪 Como Testar

### **Teste 1: Pergunta Simples**

```
Cliente: "Qual meu saldo?"

IA deve responder:
"Seu saldo atual é R$ 15.000,00 
(Receitas: R$ 50.000 - Despesas: R$ 35.000)"
```

### **Teste 2: Análise Complexa**

```
Cliente: "Como está minha saúde financeira?"

IA deve incluir:
- Score atual
- O que está bom
- O que pode melhorar
- Ações específicas
```

### **Teste 3: Erro de API**

```
Se API Key inválida:
"Recurso de IA não configurado. 
Entre em contato com seu consultor."
```

---

## ⚠️ Troubleshooting

### **Chat não aparece**

**Causa:** Plano não é Avançado

**Solução:**
```
CONFIG:
plano = avançado
```

### **IA não responde**

**Causa:** API Key ausente ou inválida

**Diagnóstico:**
```javascript
// Apps Script
function testAIKey() {
  const ss = SpreadsheetApp.openById(getSpreadsheetId());
  const config = ss.getSheetByName('CONFIG');
  const data = config.getRange('A:B').getValues();
  
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][0]).includes('api_key')) {
      Logger.log('Key: ' + data[i][1]);
    }
  }
}
```

### **Respostas genéricas**

**Causa:** Contexto não está sendo enviado

**Solução:** Verificar função `prepareFinancialContext()` no Main.js

---

## 📚 Documentação Técnica

### **Arquivos:**

1. `JS_ChatAI.html` - Interface do chat (frontend)
2. `Main.js` - Função `askAIFinancialQuestion()` (backend)

### **Fluxo de Dados:**

```
Cliente faz pergunta
    ↓
Frontend (JS_ChatAI)
    ↓
google.script.run.askAIFinancialQuestion()
    ↓
Backend (Main.js)
    ↓
Prepara contexto financeiro
    ↓
Chama OpenAI API
    ↓
Retorna resposta
    ↓
Frontend exibe
```

---

**Versão:** 1.0  
**Data:** Janeiro 2025  
**Para:** Plano Avançado  
**Feature:** Chatbot de IA Financeira  

**Cliente conversa com IA sobre suas finanças em tempo real!** 🚀💬
