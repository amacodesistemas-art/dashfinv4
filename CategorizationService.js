// ===========================================
// CATEGORIZATION SERVICE - Categorização Automática com IA
// ===========================================

var CategorizationService = {
  
  // Categorias padrão do sistema
  DEFAULT_CATEGORIES: {
    'receitas': ['Vendas', 'Serviços', 'Comissões', 'Juros Recebidos', 'Reembolsos', 'Outros Recebimentos'],
    'despesas_fixas': ['Aluguel', 'Salários', 'Encargos', 'Internet', 'Telefone', 'Contabilidade', 'Seguros'],
    'despesas_variaveis': ['Fornecedores', 'Materiais', 'Combustível', 'Manutenção', 'Marketing', 'Frete'],
    'financeiras': ['Juros', 'Tarifas Bancárias', 'IOF', 'Multas'],
    'investimentos': ['Equipamentos', 'Veículos', 'Reformas', 'Tecnologia'],
    'pessoal': ['Pro-labore', 'Benefícios', 'Vale Transporte', 'Vale Alimentação']
  },
  
  // Busca regras de categorização do cliente
  getCategorizationRules: function(ss) {
    var sheet = ss.getSheetByName('REGRAS_CATEGORIZACAO');
    var rules = [];
    
    if (!sheet) {
      return rules;
    }
    
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return rules;
    
    var data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    
    data.forEach(function(row) {
      if (row[0]) {
        rules.push({
          pattern: String(row[0]).toLowerCase().trim(),
          category: String(row[1]).trim(),
          subcategory: String(row[2]).trim() || '',
          type: String(row[3]).trim() || 'auto' // auto, Entrada, Saída
        });
      }
    });
    
    return rules;
  },
  
  // Categoriza uma transação usando regras
  categorizeByRules: function(description, rules) {
    var descLower = description.toLowerCase();
    
    for (var i = 0; i < rules.length; i++) {
      var rule = rules[i];
      if (descLower.indexOf(rule.pattern) > -1) {
        return {
          category: rule.category,
          subcategory: rule.subcategory,
          type: rule.type,
          confidence: 0.95,
          method: 'rule'
        };
      }
    }
    
    return null;
  },
  
  // Categoriza usando IA (quando regras não encontram)
  categorizeWithAI: function(description, value, apiKey, existingCategories) {
    if (!apiKey) {
      return { error: 'API Key não configurada' };
    }
    
    var categoriesList = existingCategories.join(', ') || 
      'Vendas, Serviços, Fornecedores, Salários, Aluguel, Marketing, Materiais, Impostos, Outros';
    
    var prompt = 'Categorize esta transacao financeira brasileira:\n';
    prompt += 'Descricao: "' + description + '"\n';
    prompt += 'Valor: R$ ' + value + '\n\n';
    prompt += 'Categorias disponiveis: ' + categoriesList + '\n\n';
    prompt += 'Responda APENAS no formato JSON:\n';
    prompt += '{"category": "Nome da Categoria", "type": "Entrada ou Saida", "confidence": 0.8}\n';
    prompt += 'Se nao tiver certeza, use confidence baixo (0.5-0.7).';
    
    try {
      var response = callOpenAI(apiKey, prompt, 100);
      
      // Extrai JSON da resposta
      var jsonMatch = response.match(/\{[^}]+\}/);
      if (jsonMatch) {
        var result = JSON.parse(jsonMatch[0]);
        result.method = 'ai';
        return result;
      }
      
      return { error: 'Resposta da IA inválida', raw: response };
      
    } catch (e) {
      Logger.log('[Categorization] Erro IA: ' + e.message);
      return { error: e.message };
    }
  },
  
  // Categoriza em lote (para importação)
  categorizeBatch: function(transactions, ss, apiKey) {
    var rules = this.getCategorizationRules(ss);
    var results = [];
    var aiCount = 0;
    var maxAIPerBatch = 20; // Limita chamadas de IA por lote
    
    // Busca categorias existentes
    var existingCategories = this.getExistingCategories(ss);
    
    transactions.forEach(function(tx, index) {
      var result = {
        index: index,
        description: tx.description,
        value: tx.value,
        original: tx
      };
      
      // Tenta categorizar por regras primeiro
      var ruleResult = CategorizationService.categorizeByRules(tx.description, rules);
      
      if (ruleResult) {
        result.category = ruleResult.category;
        result.subcategory = ruleResult.subcategory;
        result.type = ruleResult.type === 'auto' ? (tx.value < 0 ? 'Saída' : 'Entrada') : ruleResult.type;
        result.confidence = ruleResult.confidence;
        result.method = 'rule';
      } else if (aiCount < maxAIPerBatch && apiKey) {
        // Usa IA se não encontrou regra
        var aiResult = CategorizationService.categorizeWithAI(tx.description, tx.value, apiKey, existingCategories);
        
        if (!aiResult.error) {
          result.category = aiResult.category;
          result.type = aiResult.type;
          result.confidence = aiResult.confidence;
          result.method = 'ai';
          aiCount++;
        } else {
          result.category = 'A Classificar';
          result.type = tx.value < 0 ? 'Saída' : 'Entrada';
          result.confidence = 0;
          result.method = 'pending';
          result.error = aiResult.error;
        }
      } else {
        // Sem regra e sem IA disponível
        result.category = 'A Classificar';
        result.type = tx.value < 0 ? 'Saída' : 'Entrada';
        result.confidence = 0;
        result.method = 'pending';
      }
      
      results.push(result);
    });
    
    return {
      results: results,
      stats: {
        total: transactions.length,
        byRule: results.filter(function(r) { return r.method === 'rule'; }).length,
        byAI: results.filter(function(r) { return r.method === 'ai'; }).length,
        pending: results.filter(function(r) { return r.method === 'pending'; }).length
      }
    };
  },
  
  // Busca categorias existentes nas transações
  getExistingCategories: function(ss) {
    var sheet = ss.getSheetByName('TRANSACOES');
    if (!sheet) return [];
    
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    
    var data = sheet.getRange(2, 3, lastRow - 1, 1).getValues();
    var categories = {};
    
    data.forEach(function(row) {
      if (row[0]) {
        categories[String(row[0]).trim()] = true;
      }
    });
    
    return Object.keys(categories).sort();
  },
  
  // Adiciona nova regra de categorização
  addCategorizationRule: function(ss, pattern, category, subcategory, type) {
    var sheet = ss.getSheetByName('REGRAS_CATEGORIZACAO');
    
    if (!sheet) {
      sheet = ss.insertSheet('REGRAS_CATEGORIZACAO');
      sheet.appendRow(['padrao', 'categoria', 'subcategoria', 'tipo']);
      sheet.getRange(1, 1, 1, 4).setBackground('#8b5cf6').setFontColor('#ffffff').setFontWeight('bold');
    }
    
    sheet.appendRow([pattern.toLowerCase(), category, subcategory || '', type || 'auto']);
    
    return { success: true };
  },
  
  // Aprende com correção do usuário
  learnFromCorrection: function(ss, description, correctCategory, correctType) {
    // Extrai palavras-chave da descrição
    var words = description.toLowerCase()
      .replace(/[0-9]/g, '')
      .replace(/[^a-záàâãéèêíìîóòôõúùûç\s]/gi, '')
      .split(/\s+/)
      .filter(function(w) { return w.length > 3; });
    
    // Usa as 2-3 palavras mais significativas como padrão
    var pattern = words.slice(0, 3).join(' ');
    
    if (pattern.length > 5) {
      this.addCategorizationRule(ss, pattern, correctCategory, '', correctType);
      Logger.log('[Categorization] Nova regra aprendida: "' + pattern + '" -> ' + correctCategory);
      return { learned: true, pattern: pattern };
    }
    
    return { learned: false, reason: 'Padrão muito curto' };
  }
};

// Funções expostas para o frontend

// Categoriza transações importadas
function categorizeImportedTransactions(transactions) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  var apiKey = getAPIKey(ss);
  
  return CategorizationService.categorizeBatch(transactions, ss, apiKey);
}

// Adiciona regra de categorização
function addCategorizationRule(pattern, category, subcategory, type) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  return CategorizationService.addCategorizationRule(ss, pattern, category, subcategory, type);
}

// Aprende com correção
function learnCategorization(description, correctCategory, correctType) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  return CategorizationService.learnFromCorrection(ss, description, correctCategory, correctType);
}

// Busca API Key
function getAPIKey(ss) {
  var configSheet = ss.getSheetByName('CONFIG');
  if (!configSheet) return null;
  
  var data = configSheet.getRange('A:B').getValues();
  for (var i = 0; i < data.length; i++) {
    var key = String(data[i][0]).toLowerCase().trim();
    if (key.indexOf('api_key') > -1) {
      return data[i][1];
    }
  }
  
  return null;
}

// Teste de categorização
function testCategorization() {
  var testTransactions = [
    { description: 'PIX RECEBIDO CLIENTE JOAO SILVA', value: 1500 },
    { description: 'PAGAMENTO ALUGUEL SALA COMERCIAL', value: -2000 },
    { description: 'TED FORNECEDOR MATERIAIS LTDA', value: -850 },
    { description: 'VENDA CARTAO CREDITO LOJA 01', value: 3200 },
    { description: 'PAGTO CONTA LUZ CEMIG', value: -450 }
  ];
  
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  var apiKey = getAPIKey(ss);
  
  var result = CategorizationService.categorizeBatch(testTransactions, ss, apiKey);
  
  Logger.log('=== TESTE CATEGORIZAÇÃO ===');
  Logger.log('Stats: ' + JSON.stringify(result.stats));
  
  result.results.forEach(function(r) {
    Logger.log('\n' + r.description);
    Logger.log('  -> ' + r.category + ' (' + r.method + ', confiança: ' + (r.confidence * 100).toFixed(0) + '%)');
  });
}
