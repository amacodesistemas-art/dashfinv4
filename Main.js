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

// Fun\u00e7\u00e3o para processar perguntas do chatbot de IA
function askAIFinancialQuestion(question, dashboardData) {
  try {
    // Verifica se tem API key configurada
    const ss = SpreadsheetApp.openById(getSpreadsheetId());
    const configSheet = ss.getSheetByName('CONFIG');
    
    if (!configSheet) {
      return 'Desculpe, n\u00e3o consegui acessar as configura\u00e7\u00f5es.';
    }
    
    // Busca API key
    const data = configSheet.getRange('A:B').getValues();
    let apiKey = null;
    
    for (let i = 0; i < data.length; i++) {
      const key = String(data[i][0]).toLowerCase().trim();
      if (key.includes('ai_api_key') || key.includes('api_key')) {
        apiKey = data[i][1];
        break;
      }
    }
    
    if (!apiKey) {
      return 'Recurso de IA n\u00e3o configurado. Entre em contato com seu consultor para ativar.';
    }
    
    // Prepara contexto financeiro
    const stats = calculateStats(dashboardData);
    const context = prepareFinancialContext(dashboardData, stats);
    
    // Monta prompt para IA
    const prompt = `Voc\u00ea \u00e9 um assistente financeiro especializado e amig\u00e1vel.\n\nContexto Financeiro do Cliente:\n${context}\n\nPergunta do Cliente: ${question}\n\nResponda de forma:\n- Clara e objetiva\n- Usando dados reais do contexto\n- Dando recomenda\u00e7\u00f5es pr\u00e1ticas\n- Tom conversacional e acess\u00edvel\n- M\u00e1ximo 150 palavras\n\nResposta:`;\n    \n    // Chama OpenAI\n    const response = callOpenAI(apiKey, prompt, 300);\n    return response;\n    \n  } catch (error) {\n    Logger.log('[AI Chat] Erro: ' + error.message);\n    return 'Desculpe, tive um problema ao processar sua pergunta. Erro: ' + error.message;\n  }\n}\n\n// Prepara contexto financeiro\nfunction prepareFinancialContext(data, stats) {\n  const transactions = data.transactions || [];\n  \n  // Top 5 categorias de gasto\n  const gastos = {};\n  transactions.filter(t => t.type === 'Sa\u00edda').forEach(t => {\n    gastos[t.category] = (gastos[t.category] || 0) + t.value;\n  });\n  \n  const topGastos = Object.entries(gastos)\n    .sort((a, b) => b[1] - a[1])\n    .slice(0, 5)\n    .map(([cat, val]) => `${cat}: R$ ${val.toFixed(2)}`);\n  \n  // Transa\u00e7\u00f5es pendentes\n  const pendentes = transactions.filter(t => {\n    const status = (t.status || '').toLowerCase();\n    return !status.includes('pago') && !status.includes('conclu\u00eddo');\n  });\n  \n  const context = `\nPer\u00edodo: \u00daltimos 30 dias\nReceitas: R$ ${stats.entradas.toFixed(2)}\nDespesas: R$ ${stats.saidas.toFixed(2)}\nSaldo: R$ ${stats.saldo.toFixed(2)}\nScore de Sa\u00fade: ${stats.healthScore}/100\n\nTop 5 Categorias de Gasto:\n${topGastos.join('\\n')}\n\nTotal de Transa\u00e7\u00f5es: ${transactions.length}\nPendentes: ${pendentes.length} (R$ ${pendentes.reduce((s, t) => s + t.value, 0).toFixed(2)})\n`;\n  \n  return context;\n}\n\n// Calcula estat\u00edsticas\nfunction calculateStats(data) {\n  const transactions = data.transactions || [];\n  const accounts = data.accounts || [];\n  \n  let entradas = 0;\n  let saidas = 0;\n  \n  transactions.forEach(t => {\n    if (t.type === 'Entrada') {\n      entradas += t.value;\n    } else {\n      saidas += t.value;\n    }\n  });\n  \n  const saldo = entradas - saidas;\n  const totalPatrimonio = accounts.reduce((s, a) => s + a.balance, 0);\n  \n  // Calcula score de sa\u00fade\n  let healthScore = 0;\n  if (saldo > 0) healthScore += 40;\n  if (entradas > 0 && (saldo / entradas) >= 0.2) healthScore += 30;\n  if (totalPatrimonio > 0) healthScore += 30;\n  \n  return {\n    entradas: entradas,\n    saidas: saidas,\n    saldo: saldo,\n    healthScore: healthScore\n  };\n}\n\n// Chama OpenAI API\nfunction callOpenAI(apiKey, prompt, maxTokens) {\n  const url = 'https://api.openai.com/v1/chat/completions';\n  \n  const payload = {\n    model: 'gpt-4',\n    messages: [\n      {\n        role: 'system',\n        content: 'Voc\u00ea \u00e9 um assistente financeiro brasileiro especializado, sempre respondendo em portugu\u00eas do Brasil de forma clara e pr\u00e1tica.'\n      },\n      {\n        role: 'user',\n        content: prompt\n      }\n    ],\n    max_tokens: maxTokens,\n    temperature: 0.7\n  };\n  \n  const options = {\n    method: 'post',\n    contentType: 'application/json',\n    headers: {\n      'Authorization': 'Bearer ' + apiKey\n    },\n    payload: JSON.stringify(payload),\n    muteHttpExceptions: true\n  };\n  \n  const response = UrlFetchApp.fetch(url, options);\n  const json = JSON.parse(response.getContentText());\n  \n  if (json.error) {\n    throw new Error('OpenAI Error: ' + json.error.message);\n  }\n  \n  return json.choices[0].message.content.trim();\n}\n\nfunction testData() {
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