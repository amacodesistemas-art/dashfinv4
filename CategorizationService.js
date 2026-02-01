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
    prompt += '{"category": "Nome da Categoria", "subcategory": "Subcategoria opcional", "type": "Entrada ou Saida", "confidence": 0.8}\n';
    prompt += 'Se nao tiver certeza, use confidence baixo (0.5-0.7).';
    
    try {
      var response = callOpenAI(apiKey, prompt, 150);
      
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
    
    // Busca categorias existentes (Contas/Projetos)
    var existingCategories = this.getExistingCategories(ss);
    
    transactions.forEach(function(tx, index) {
      var result = {
        index: index,
        description: tx.description,
        value: tx.value,
        date: tx.date,
        transactionType: tx.transactionType || (tx.value < 0 ? 'Saída' : 'Entrada'),
        selected: true // Por padrão, todas vêm selecionadas
      };
      
      // Tenta categorizar por regras primeiro
      var ruleResult = CategorizationService.categorizeByRules(tx.description, rules);
      
      if (ruleResult) {
        result.category = ruleResult.category;
        result.subcategory = ruleResult.subcategory;
        result.transactionType = ruleResult.type === 'auto' ? result.transactionType : ruleResult.type;
        result.confidence = ruleResult.confidence;
        result.method = 'rule';
      } else if (aiCount < maxAIPerBatch && apiKey) {
        // Usa IA se não encontrou regra
        var aiResult = CategorizationService.categorizeWithAI(tx.description, tx.value, apiKey, existingCategories);
        
        if (!aiResult.error) {
          result.category = aiResult.category;
          result.subcategory = aiResult.subcategory || '';
          result.transactionType = aiResult.type || result.transactionType;
          result.confidence = aiResult.confidence;
          result.method = 'ai';
          aiCount++;
        } else {
          result.category = 'A Classificar';
          result.confidence = 0;
          result.method = 'pending';
          result.error = aiResult.error;
        }
      } else {
        // Sem regra e sem IA disponível
        result.category = 'A Classificar';
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
  
  // Busca categorias existentes (agora usa CONTAS/Projetos)
  getExistingCategories: function(ss) {
    var sheet = ss.getSheetByName('CONTAS');
    if (!sheet) return [];
    
    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    
    var data = sheet.getRange(2, 2, lastRow - 1, 1).getValues(); // Coluna Nome
    var categories = [];
    
    data.forEach(function(row) {
      if (row[0]) {
        categories.push(String(row[0]).trim());
      }
    });
    
    return categories;
  },
  
  // Adiciona nova regra de categorização
  addCategorizationRule: function(ss, pattern, category, subcategory, type) {
    var sheet = ss.getSheetByName('REGRAS_CATEGORIZACAO');
    
    if (!sheet) {
      sheet = ss.insertSheet('REGRAS_CATEGORIZACAO');
      sheet.appendRow(['padrao', 'categoria', 'subcategoria', 'tipo']);
      sheet.getRange(1, 1, 1, 4).setBackground('#8b5cf6').setFontColor('#ffffff').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    // Verifica se já existe
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase().trim() === pattern.toLowerCase().trim()) {
        // Atualiza existente
        sheet.getRange(i + 1, 2, 1, 3).setValues([[category, subcategory || '', type || 'auto']]);
        return { success: true, updated: true };
      }
    }
    
    // Adiciona nova
    sheet.appendRow([pattern.toLowerCase().trim(), category, subcategory || '', type || 'auto']);
    
    return { success: true, added: true };
  },
  
  // Remove regra de categorização
  deleteCategorizationRule: function(ss, pattern) {
    var sheet = ss.getSheetByName('REGRAS_CATEGORIZACAO');
    if (!sheet) return { success: false, error: 'Aba não encontrada' };
    
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]).toLowerCase().trim() === pattern.toLowerCase().trim()) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    
    return { success: false, error: 'Regra não encontrada' };
  },
  
  // Aprende com correção do usuário (cria regra automática)
  learnFromCorrection: function(ss, description, correctCategory, correctSubcategory, correctType) {
    // Extrai palavras-chave da descrição
    var words = description.toLowerCase()
      .replace(/[0-9]/g, '')
      .replace(/[^a-záàâãéèêíìîóòôõúùûç\s]/gi, '')
      .split(/\s+/)
      .filter(function(w) { return w.length > 3; });
    
    // Usa as 2-3 palavras mais significativas como padrão
    var pattern = words.slice(0, 3).join(' ');
    
    if (pattern.length > 5) {
      this.addCategorizationRule(ss, pattern, correctCategory, correctSubcategory || '', correctType || 'auto');
      Logger.log('[Categorization] Nova regra aprendida: "' + pattern + '" -> ' + correctCategory);
      return { learned: true, pattern: pattern };
    }
    
    return { learned: false, reason: 'Padrão muito curto' };
  }
};

// ===========================================
// FUNÇÕES EXPOSTAS PARA O FRONTEND
// ===========================================

// Retorna contexto para categorização (regras, categorias, contas)
function getCategorizationContext() {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  
  var rules = CategorizationService.getCategorizationRules(ss);
  var categories = CategorizationService.getExistingCategories(ss);
  
  // Busca contas/projetos
  var accounts = DataService.readAccounts(ss);
  
  // Busca subcategorias das transações existentes
  var subcategories = {};
  var txSheet = ss.getSheetByName('TRANSACOES');
  if (txSheet && txSheet.getLastRow() > 1) {
    var txData = txSheet.getRange(2, 3, txSheet.getLastRow() - 1, 2).getValues(); // Categoria, Subcategoria
    txData.forEach(function(row) {
      if (row[0] && row[1]) {
        if (!subcategories[row[0]]) subcategories[row[0]] = [];
        if (subcategories[row[0]].indexOf(row[1]) === -1) {
          subcategories[row[0]].push(row[1]);
        }
      }
    });
  }
  
  return {
    rules: rules,
    categories: categories,
    accounts: accounts,
    subcategories: subcategories
  };
}

// Categoriza transações importadas
function categorizeImportedTransactions(transactions) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  var apiKey = getAPIKey(ss);
  
  return CategorizationService.categorizeBatch(transactions, ss, apiKey);
}

// Categoriza uma única transação (re-categorização)
function categorizeSingleTransaction(description, value, transactionType) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  var apiKey = getAPIKey(ss);
  
  if (!apiKey) {
    return { error: 'API Key não configurada' };
  }
  
  var categories = CategorizationService.getExistingCategories(ss);
  return CategorizationService.categorizeWithAI(description, value, apiKey, categories);
}

// Categoriza em lote (re-categorização)
function categorizeBatchTransactions(transactions) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  var apiKey = getAPIKey(ss);
  
  if (!apiKey) {
    return [{ error: 'API Key não configurada' }];
  }
  
  var categories = CategorizationService.getExistingCategories(ss);
  var results = [];
  
  transactions.forEach(function(tx) {
    var result = CategorizationService.categorizeWithAI(tx.description, tx.value, apiKey, categories);
    result.description = tx.description;
    results.push(result);
  });
  
  return results;
}

// Adiciona regra de categorização
function addCategorizationRule(pattern, category, subcategory, type) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  return CategorizationService.addCategorizationRule(ss, pattern, category, subcategory, type);
}

// Remove regra de categorização
function deleteCategorizationRule(pattern) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  return CategorizationService.deleteCategorizationRule(ss, pattern);
}

// Salva transações aprovadas diretamente na planilha do cliente
function saveApprovedTransactions(transactions, bankId) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  var sheet = ss.getSheetByName('TRANSACOES');
  
  if (!sheet) {
    return { success: false, error: 'Aba TRANSACOES não encontrada' };
  }
  
  // Busca mapa de contas (nome -> id) para vincular corretamente
  var accountsMap = {};
  var accountsSheet = ss.getSheetByName('CONTAS');
  if (accountsSheet && accountsSheet.getLastRow() > 1) {
    var accountsData = accountsSheet.getRange(2, 1, accountsSheet.getLastRow() - 1, 2).getValues();
    accountsData.forEach(function(row) {
      var id = String(row[0]).trim();
      var name = String(row[1]).trim().toLowerCase();
      if (id && name) {
        accountsMap[name] = id;
      }
    });
  }
  
  var saved = 0;
  var errors = [];
  
  // Estrutura: Data, Tipo, Categoria, Subcategoria, Valor, Conta, Banco, Status, Descrição, Centro_Custo
  transactions.forEach(function(tx, index) {
    try {
      // Resolve o accountId: usa o ID direto se fornecido, senão busca pelo nome da categoria/conta
      var accountId = tx.accountId || '';
      
      // Se não tem accountId mas tem category (que é o nome da conta), busca o ID
      if (!accountId && tx.category && tx.category !== 'A Classificar') {
        var categoryLower = String(tx.category).trim().toLowerCase();
        accountId = accountsMap[categoryLower] || '';
      }
      
      sheet.appendRow([
        tx.date,
        tx.transactionType,
        tx.category || 'A Classificar',
        tx.subcategory || '',
        tx.value,
        accountId,  // Conta (ID) - agora vincula corretamente
        bankId,
        tx.status || 'Pago',
        tx.description,
        tx.costCenter || ''
      ]);
      saved++;
      
      // Se tem categoria válida, aprende a regra automaticamente
      if (tx.category && tx.category !== 'A Classificar') {
        CategorizationService.learnFromCorrection(ss, tx.description, tx.category, tx.subcategory, tx.transactionType);
      }
      
    } catch (e) {
      errors.push({ index: index, error: e.message });
    }
  });
  
  // Limpa cache após importação
  CacheManager.remove(getCacheConfig().key);
  
  return {
    success: true,
    saved: saved,
    errors: errors
  };
}

// Aprende com correção
function learnCategorization(description, correctCategory, correctType) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  return CategorizationService.learnFromCorrection(ss, description, correctCategory, '', correctType);
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
