// ===========================================
// 1. FUNÇÃO PRINCIPAL (doGet)
// ===========================================

function doGet(e) {
  // Verifica se é requisição para service worker
  if (e.parameter && e.parameter.file === 'sw') {
    return HtmlService.createHtmlOutput(
      include('service-worker')
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  // Verifica se é requisição para manifest
  if (e.parameter && e.parameter.file === 'manifest') {
    const manifest = {
      "name": "Dashboard Financeiro B2B",
      "short_name": "FinDash B2B",
      "description": "Sistema profissional de gestão financeira para empresas B2B",
      "start_url": "./",
      "display": "standalone",
      "background_color": "#0f172a",
      "theme_color": "#3b82f6",
      "orientation": "portrait-primary",
      "icons": [
        {
          "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%233b82f6'/%3E%3Cpath d='M256 128c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm0 200c-39.8 0-72-32.2-72-72s32.2-72 72-72 72 32.2 72 72-32.2 72-72 72z' fill='%23fff'/%3E%3C/svg%3E",
          "sizes": "192x192",
          "type": "image/svg+xml",
          "purpose": "any maskable"
        },
        {
          "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%233b82f6'/%3E%3Cpath d='M256 128c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm0 200c-39.8 0-72-32.2-72-72s32.2-72 72-72 72 32.2 72 72-32.2 72-72 72z' fill='%23fff'/%3E%3C/svg%3E",
          "sizes": "512x512",
          "type": "image/svg+xml",
          "purpose": "any maskable"
        }
      ]
    };
    
    return ContentService.createTextOutput(JSON.stringify(manifest))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Retorna página principal
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Dashboard Financeiro')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Função para processar perguntas do chatbot de IA
function askAIFinancialQuestion(question, contextData) {
  try {
    // Verifica se tem API key configurada
    var ss = SpreadsheetApp.openById(getSpreadsheetId());
    var configSheet = ss.getSheetByName('CONFIG');
    
    if (!configSheet) {
      return 'Desculpe, nao consegui acessar as configuracoes.';
    }
    
    // Busca API key
    var data = configSheet.getRange('A:B').getValues();
    var apiKey = null;
    
    for (var i = 0; i < data.length; i++) {
      var key = String(data[i][0]).toLowerCase().trim();
      if (key.indexOf('ai_api_key') > -1 || key.indexOf('api_key') > -1) {
        apiKey = data[i][1];
        break;
      }
    }
    
    if (!apiKey) {
      return 'Recurso de IA nao configurado. Entre em contato com seu consultor para ativar.';
    }
    
    // Filtra transacoes pelo periodo atual
    var period = contextData.period || {};
    var startDate = null;
    var endDate = null;
    
    if (period.start) {
      startDate = new Date(period.start);
      startDate.setHours(0, 0, 0, 0);
    }
    
    if (period.end) {
      endDate = new Date(period.end);
      endDate.setHours(23, 59, 59, 999);
    }
    
    var allTransactions = contextData.transactions || [];
    var filteredTransactions = allTransactions;
    
    Logger.log('[AI Chat] Periodo recebido: ' + period.start + ' ate ' + period.end + ' (mode: ' + period.mode + ')');
    Logger.log('[AI Chat] Total transacoes recebidas: ' + allTransactions.length);
    
    if (startDate && endDate) {
      filteredTransactions = allTransactions.filter(function(t) {
        if (!t.date) return false;
        var parts = t.date.split('-');
        var tDate = new Date(parts[0], parts[1] - 1, parts[2]);
        tDate.setHours(12, 0, 0, 0);
        return tDate >= startDate && tDate <= endDate;
      });
      
      Logger.log('[AI Chat] Transacoes filtradas para o periodo: ' + filteredTransactions.length);
    }
    
    // Calcula periodo anterior para comparacao
    var previousPeriod = calculatePreviousPeriod(filteredTransactions, allTransactions, startDate, endDate);
    
    // Prepara contexto financeiro
    var stats = calculateStats({ transactions: filteredTransactions, accounts: contextData.accounts });
    var context = prepareEnhancedFinancialContext(filteredTransactions, stats, period, previousPeriod, contextData);
    
    // Monta prompt para IA com contexto rico
    var prompt = 'Voce e um assistente financeiro brasileiro especializado e amigavel.\n\n';
    prompt += 'IMPORTANTE: Responda SEMPRE considerando APENAS o periodo filtrado mencionado no contexto.\n\n';
    prompt += 'Contexto Financeiro do Cliente:\n' + context + '\n\n';
    prompt += 'Pergunta do Cliente: ' + question + '\n\n';
    prompt += 'INSTRUCOES:\n';
    prompt += '- Responda considerando APENAS os dados do periodo atual mostrado\n';
    prompt += '- Use os valores exatos do contexto\n';
    prompt += '- Compare com periodo anterior quando relevante\n';
    prompt += '- Seja especifico com categorias e valores\n';
    prompt += '- De recomendacoes praticas e acionaveis\n';
    prompt += '- Tom conversacional, use emojis quando apropriado\n';
    prompt += '- Maximo 200 palavras\n\n';
    prompt += 'Resposta:';
    
    // Chama OpenAI
    var response = callOpenAI(apiKey, prompt, 400);
    return response;
    
  } catch (error) {
    Logger.log('[AI Chat] Erro: ' + error.message);
    return 'Desculpe, tive um problema ao processar sua pergunta. Erro: ' + error.message;
  }
}

// Calcula periodo anterior para comparacao
function calculatePreviousPeriod(currentTransactions, allTransactions, startDate, endDate) {
  if (!startDate || !endDate) return { entradas: 0, saidas: 0, saldo: 0 };
  
  var periodDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
  var prevEndDate = new Date(startDate);
  prevEndDate.setDate(prevEndDate.getDate() - 1);
  var prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - periodDays);
  
  var prevTransactions = allTransactions.filter(function(t) {
    var tDate = new Date(t.date);
    return tDate >= prevStartDate && tDate <= prevEndDate;
  });
  
  var entradas = 0;
  var saidas = 0;
  
  prevTransactions.forEach(function(t) {
    if (t.type === 'Entrada') {
      entradas += t.value;
    } else {
      saidas += t.value;
    }
  });
  
  return {
    entradas: entradas,
    saidas: saidas,
    saldo: entradas - saidas,
    count: prevTransactions.length
  };
}

// Prepara contexto financeiro aprimorado
function prepareEnhancedFinancialContext(transactions, stats, period, previousPeriod, contextData) {
  // Nome do periodo
  var periodName = getPeriodName(period.mode);
  
  // Top 5 categorias de gasto
  var gastos = {};
  transactions.filter(function(t) { return t.type === 'Saída'; }).forEach(function(t) {
    gastos[t.category] = (gastos[t.category] || 0) + t.value;
  });
  
  var topGastos = Object.keys(gastos)
    .map(function(key) { return [key, gastos[key]]; })
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 5);
  
  // Top 5 fontes de receita
  var receitas = {};
  transactions.filter(function(t) { return t.type === 'Entrada'; }).forEach(function(t) {
    var fonte = t.category || 'Outros';
    receitas[fonte] = (receitas[fonte] || 0) + t.value;
  });
  
  var topReceitas = Object.keys(receitas)
    .map(function(key) { return [key, receitas[key]]; })
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 3);
  
  // Transacoes pendentes
  var pendentes = transactions.filter(function(t) {
    var status = (t.status || '').toLowerCase();
    return status.indexOf('pago') === -1 && status.indexOf('concluido') === -1;
  });
  
  var pendenteTotal = pendentes.reduce(function(s, t) { return s + t.value; }, 0);
  
  // Calcula variacoes
  var varReceita = previousPeriod.entradas > 0 
    ? ((stats.entradas - previousPeriod.entradas) / previousPeriod.entradas * 100).toFixed(1)
    : 'N/A';
  
  var varDespesa = previousPeriod.saidas > 0
    ? ((stats.saidas - previousPeriod.saidas) / previousPeriod.saidas * 100).toFixed(1)
    : 'N/A';
  
  var varSaldo = previousPeriod.saldo !== 0
    ? ((stats.saldo - previousPeriod.saldo) / Math.abs(previousPeriod.saldo) * 100).toFixed(1)
    : 'N/A';
  
  // Monta contexto
  var context = '=== PERIODO ATUAL: ' + periodName + ' ===\n';
  context += 'Data Inicio: ' + period.start + '\n';
  context += 'Data Fim: ' + period.end + '\n\n';
  
  context += '--- RESUMO FINANCEIRO ---\n';
  context += 'Receitas: R$ ' + stats.entradas.toFixed(2);
  if (varReceita !== 'N/A') {
    context += ' (' + (varReceita > 0 ? '+' : '') + varReceita + '% vs periodo anterior)\n';
  } else {
    context += '\n';
  }
  
  context += 'Despesas: R$ ' + stats.saidas.toFixed(2);
  if (varDespesa !== 'N/A') {
    context += ' (' + (varDespesa > 0 ? '+' : '') + varDespesa + '% vs periodo anterior)\n';
  } else {
    context += '\n';
  }
  
  context += 'Saldo: R$ ' + stats.saldo.toFixed(2);
  if (varSaldo !== 'N/A') {
    context += ' (' + (varSaldo > 0 ? '+' : '') + varSaldo + '% vs periodo anterior)\n';
  } else {
    context += '\n';
  }
  
  context += 'Score de Saude Financeira: ' + stats.healthScore + '/100\n';
  context += 'Total de Transacoes no Periodo: ' + transactions.length + '\n\n';
  
  context += '--- TOP DESPESAS DO PERIODO ---\n';
  if (topGastos.length > 0) {
    topGastos.forEach(function(item, idx) {
      var percentual = stats.saidas > 0 ? (item[1] / stats.saidas * 100).toFixed(1) : 0;
      context += (idx + 1) + '. ' + item[0] + ': R$ ' + item[1].toFixed(2) + ' (' + percentual + '% do total)\n';
    });
  } else {
    context += 'Nenhuma despesa no periodo\n';
  }
  
  context += '\n--- TOP RECEITAS DO PERIODO ---\n';
  if (topReceitas.length > 0) {
    topReceitas.forEach(function(item, idx) {
      var percentual = stats.entradas > 0 ? (item[1] / stats.entradas * 100).toFixed(1) : 0;
      context += (idx + 1) + '. ' + item[0] + ': R$ ' + item[1].toFixed(2) + ' (' + percentual + '% do total)\n';
    });
  } else {
    context += 'Nenhuma receita no periodo\n';
  }
  
  context += '\n--- CONTAS PENDENTES ---\n';
  context += 'Quantidade: ' + pendentes.length + '\n';
  context += 'Valor Total: R$ ' + pendenteTotal.toFixed(2) + '\n';
  
  if (pendentes.length > 0) {
    var maioresPendentes = pendentes
      .sort(function(a, b) { return b.value - a.value; })
      .slice(0, 3);
    
    context += 'Maiores:\n';
    maioresPendentes.forEach(function(p, idx) {
      context += '  ' + (idx + 1) + '. ' + p.description + ': R$ ' + p.value.toFixed(2) + ' (' + p.category + ')\n';
    });
  }
  
  context += '\n--- COMPARACAO COM PERIODO ANTERIOR ---\n';
  context += 'Periodo Anterior:\n';
  context += '  Receitas: R$ ' + previousPeriod.entradas.toFixed(2) + '\n';
  context += '  Despesas: R$ ' + previousPeriod.saidas.toFixed(2) + '\n';
  context += '  Saldo: R$ ' + previousPeriod.saldo.toFixed(2) + '\n';
  context += '  Transacoes: ' + previousPeriod.count + '\n';
  
  return context;
}

// Retorna nome do periodo
function getPeriodName(mode) {
  var names = {
    'this_week': 'Esta Semana',
    'last_week': 'Semana Passada',
    'this_month': 'Este Mes',
    'last_month': 'Mes Passado',
    'last_90': 'Ultimos 90 Dias',
    'this_year': 'Este Ano',
    'last_year': 'Ano Passado',
    'all': 'Desde o Inicio',
    'custom': 'Periodo Personalizado'
  };
  
  return names[mode] || 'Periodo Atual';
}

// Prepara contexto financeiro
function prepareFinancialContext(data, stats) {
  var transactions = data.transactions || [];
  
  // Top 5 categorias de gasto
  var gastos = {};
  transactions.filter(function(t) { return t.type === 'Saída'; }).forEach(function(t) {
    gastos[t.category] = (gastos[t.category] || 0) + t.value;
  });
  
  var topGastos = Object.keys(gastos)
    .map(function(key) { return [key, gastos[key]]; })
    .sort(function(a, b) { return b[1] - a[1]; })
    .slice(0, 5)
    .map(function(item) { return item[0] + ': R$ ' + item[1].toFixed(2); });
  
  // Transacoes pendentes
  var pendentes = transactions.filter(function(t) {
    var status = (t.status || '').toLowerCase();
    return status.indexOf('pago') === -1 && status.indexOf('concluido') === -1;
  });
  
  var pendenteTotal = pendentes.reduce(function(s, t) { return s + t.value; }, 0);
  
  var context = '\nPeriodo: Ultimos 30 dias\n';
  context += 'Receitas: R$ ' + stats.entradas.toFixed(2) + '\n';
  context += 'Despesas: R$ ' + stats.saidas.toFixed(2) + '\n';
  context += 'Saldo: R$ ' + stats.saldo.toFixed(2) + '\n';
  context += 'Score de Saude: ' + stats.healthScore + '/100\n\n';
  context += 'Top 5 Categorias de Gasto:\n' + topGastos.join('\n') + '\n\n';
  context += 'Total de Transacoes: ' + transactions.length + '\n';
  context += 'Pendentes: ' + pendentes.length + ' (R$ ' + pendenteTotal.toFixed(2) + ')\n';
  
  return context;
}

// Calcula estatisticas
function calculateStats(data) {
  var transactions = data.transactions || [];
  var accounts = data.accounts || [];
  
  var entradas = 0;
  var saidas = 0;
  
  transactions.forEach(function(t) {
    if (t.type === 'Entrada') {
      entradas += t.value;
    } else {
      saidas += t.value;
    }
  });
  
  var saldo = entradas - saidas;
  var totalPatrimonio = accounts.reduce(function(s, a) { return s + a.balance; }, 0);
  
  // Calcula score de saude
  var healthScore = 0;
  if (saldo > 0) healthScore += 40;
  if (entradas > 0 && (saldo / entradas) >= 0.2) healthScore += 30;
  if (totalPatrimonio > 0) healthScore += 30;
  
  return {
    entradas: entradas,
    saidas: saidas,
    saldo: saldo,
    healthScore: healthScore
  };
}

// Chama OpenAI API
function callOpenAI(apiKey, prompt, maxTokens) {
  var url = 'https://api.openai.com/v1/chat/completions';
  
  var payload = {
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Voce e um assistente financeiro brasileiro especializado, sempre respondendo em portugues do Brasil de forma clara e pratica.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: maxTokens,
    temperature: 0.7
  };
  
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var json = JSON.parse(response.getContentText());
  
  if (json.error) {
    throw new Error('OpenAI Error: ' + json.error.message);
  }
  
  return json.choices[0].message.content.trim();
}

function testData() {
  Logger.log('=== TESTE DE DADOS ===');
  
  const data = DataService.fetchAllData();
  
  Logger.log('Config: ' + JSON.stringify(data.config));
  Logger.log('Contas: ' + data.accounts.length);
  Logger.log('Transações: ' + data.transactions.length);
  Logger.log('Metas: ' + data.goals.length);
  
  // Teste de Plano
  Logger.log('\n=== INFORMAÇÕES DO PLANO ===');
  Logger.log('Plano: ' + data.plan.plan);
  Logger.log('Nome: ' + data.plan.name);
  Logger.log('Preço: ' + data.plan.price);
  Logger.log('DRE disponível? ' + data.plan.features.dre);
  Logger.log('IA disponível? ' + data.plan.features.ai_classification);
  
  if (data.validation) {
    Logger.log('\n=== VALIDAÇÃO ===');
    Logger.log('Válido: ' + data.validation.valid);
    Logger.log('Erros: ' + data.validation.errors.length);
    Logger.log('Avisos: ' + data.validation.warnings.length);
    
    if (data.validation.errors.length > 0) {
      Logger.log('\nErros Encontrados:');
      data.validation.errors.forEach(function(err) {
        Logger.log('  - ' + err);
      });
    }
    
    if (data.validation.warnings.length > 0) {
      Logger.log('\nAvisos:');
      data.validation.warnings.forEach(function(warn) {
        Logger.log('  - ' + warn);
      });
    }
  }
  
  Logger.log('\n=== FIM DOS TESTES ===');
}

// Função específica para testar planos
function testPlans() {
  Logger.log('=== TESTE DE PLANOS ===');
  
  const ss = SpreadsheetApp.openById(getSpreadsheetId());
  const plan = DataService.getClientPlan(ss);
  const planInfo = DataService.getPlanInfo(plan);
  
  Logger.log('Plano detectado: ' + plan);
  Logger.log('Nome do plano: ' + planInfo.name);
  Logger.log('Preço: ' + planInfo.price);
  
  Logger.log('\nFeatures Disponíveis:');
  Object.keys(planInfo.features).forEach(function(feature) {
    const available = planInfo.features[feature];
    Logger.log('  ' + (available ? '✓' : '✗') + ' ' + feature);
  });
  
  Logger.log('\n=== FIM DO TESTE ===');
}