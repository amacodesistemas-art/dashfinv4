// ===========================================
// SERVIÇO DE IA - CLASSIFICAÇÃO E INSIGHTS
// ===========================================

const AIService = {
  
  // Chave da API (use Emergent LLM Key)
  API_KEY: null,
  API_ENDPOINT: 'https://api.openai.com/v1/chat/completions',
  
  // Inicializa com chave
  init: function(apiKey) {
    this.API_KEY = apiKey;
  },
  
  // Classifica transação automaticamente
  classifyTransaction: function(description, value, type) {
    if (!hasFeature('ai_classification')) {
      return null; // Feature não disponível no plano
    }
    
    const prompt = `Você é um assistente de classificação financeira.

Analise esta transação e sugira a categoria e subcategoria mais adequada:

Descrição: ${description}
Valor: R$ ${value}
Tipo: ${type}

Categorias disponíveis:
- Vendas (subcategorias: Produtos, Serviços, Consultoria)
- Marketing (subcategorias: Google Ads, Facebook Ads, Influencers)
- Administrativo (subcategorias: Materiais, Softwares, Assinaturas)
- RH (subcategorias: Salários, Benefícios, Treinamentos)
- Operacional (subcategorias: Aluguel, Contas, Manutenção)
- Financeiro (subcategorias: Juros, Taxas, Empréstimos)

Responda APENAS no formato JSON:
{
  "categoria": "nome da categoria",
  "subcategoria": "nome da subcategoria",
  "confianca": 0.95,
  "justificativa": "breve explicação"
}`;
    
    try {
      const response = this.callOpenAI(prompt, 150);
      const result = JSON.parse(response);
      
      return {
        success: true,
        categoria: result.categoria,
        subcategoria: result.subcategoria,
        confianca: result.confianca,
        justificativa: result.justificativa
      };
      
    } catch (error) {
      Logger.log('[AI] Erro na classificação: ' + error.message);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  // Gera insights avançados com IA
  generateAdvancedInsights: function(transactions, currentStats) {
    if (!hasFeature('ai_insights')) {
      return []; // Feature não disponível
    }
    
    // Prepara contexto financeiro
    const context = {
      totalTransactions: transactions.length,
      entradas: currentStats.entradas,
      saidas: currentStats.saidas,
      saldo: currentStats.saldo,
      periodo: 'últimos 30 dias'
    };
    
    // Análise de top gastos
    const topGastos = {};
    transactions.filter(t => t.type === 'Saída').forEach(t => {
      topGastos[t.category] = (topGastos[t.category] || 0) + t.value;
    });
    
    const topCategories = Object.entries(topGastos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`);
    
    const prompt = `Você é um consultor financeiro experiente.

Analise esta situação financeira e forneça 3 insights estratégicos:

Resumo Financeiro (${context.periodo}):
- Receitas: R$ ${context.entradas.toFixed(2)}
- Despesas: R$ ${context.saidas.toFixed(2)}
- Resultado: R$ ${context.saldo.toFixed(2)}
- Total de transações: ${context.totalTransactions}

Top 5 Categorias de Gasto:
${topCategories.join('\n')}

Forneça insights acionáveis no formato JSON:
[
  {
    "titulo": "título curto",
    "descricao": "insight detalhado",
    "prioridade": "alta|media|baixa",
    "categoria": "otimizacao|oportunidade|alerta|crescimento",
    "acao": "ação recomendada"
  }
]`;
    
    try {
      const response = this.callOpenAI(prompt, 500);
      const insights = JSON.parse(response);
      
      return insights.map(insight => ({
        icon: this.getIconForCategory(insight.categoria),
        color: this.getColorForPriority(insight.prioridade),
        text: `<strong>${insight.titulo}</strong>: ${insight.descricao}`,
        priority: insight.prioridade,
        action: insight.acao,
        source: 'ai'
      }));
      
    } catch (error) {
      Logger.log('[AI] Erro ao gerar insights: ' + error.message);
      return [];
    }
  },
  
  // Análise preditiva
  predictCashFlow: function(transactions, months = 3) {
    if (!hasFeature('predictive_analytics')) {
      return null;
    }
    
    // Agrupa por mês
    const monthlyData = {};
    transactions.forEach(t => {
      const month = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { entradas: 0, saidas: 0 };
      }
      
      if (t.type === 'Entrada') {
        monthlyData[month].entradas += t.value;
      } else {
        monthlyData[month].saidas += t.value;
      }
    });
    
    const prompt = `Você é um analista financeiro.

Dados históricos mensais:
${JSON.stringify(monthlyData, null, 2)}

Faça uma previsão de fluxo de caixa para os próximos ${months} meses.

Responda no formato JSON:
{
  "previsao": [
    {"mes": "2025-02", "entradas": 50000, "saidas": 35000, "saldo": 15000},
    ...
  ],
  "tendencia": "crescimento|estabilidade|declinio",
  "confianca": 0.85,
  "recomendacoes": ["recomendação 1", "recomendação 2"]
}`;
    
    try {
      const response = this.callOpenAI(prompt, 400);
      return JSON.parse(response);
    } catch (error) {
      Logger.log('[AI] Erro na previsão: ' + error.message);
      return null;
    }
  },
  
  // Chama API OpenAI
  callOpenAI: function(prompt, maxTokens = 200) {
    if (!this.API_KEY) {
      throw new Error('API Key não configurada');
    }
    
    const payload = {
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente financeiro especializado. Sempre responda em português do Brasil e no formato JSON quando solicitado.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: maxTokens,
      temperature: 0.7
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + this.API_KEY
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(this.API_ENDPOINT, options);
    const json = JSON.parse(response.getContentText());
    
    if (json.error) {
      throw new Error('OpenAI Error: ' + json.error.message);
    }
    
    return json.choices[0].message.content.trim();
  },
  
  // Helpers
  getIconForCategory: function(category) {
    const icons = {
      'otimizacao': 'zap',
      'oportunidade': 'trending-up',
      'alerta': 'alert-triangle',
      'crescimento': 'rocket'
    };
    return icons[category] || 'lightbulb';
  },
  
  getColorForPriority: function(priority) {
    const colors = {
      'alta': 'red',
      'media': 'orange',
      'baixa': 'blue'
    };
    return colors[priority] || 'gray';
  }
};

// Exporta
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIService;
}