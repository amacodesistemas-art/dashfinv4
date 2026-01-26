// ===========================================
// 4. SERVIÇO DE DADOS (ATUALIZADO B2B)
// ===========================================

const DataService = {
  
  fetchAllData: function() {
    const ss = SpreadsheetApp.openById(getSpreadsheetId());
    
    const config = this.readConfig(ss);
    const accounts = this.readAccounts(ss);
    const dreMapping = this.readDreMapping(ss);
    const transactions = this.readTransactions(ss, accounts, dreMapping);
    const goals = this.readGoals(ss);
    
    // Obtem informações do plano
    const planInfo = getPlanInfo();
    
    // Validação de dados
    const validation = this.validateData({
      accounts: accounts,
      transactions: transactions,
      goals: goals
    });
    
    return {
      config: config,
      accounts: accounts,
      transactions: transactions,
      goals: goals,
      lastUpdate: new Date().toISOString(),
      validation: validation,
      plan: planInfo // Adiciona informações do plano
    };
  },
  
  // Nova função: Valida todos os dados
  validateData: function(data) {
    const report = {
      valid: true,
      warnings: [],
      errors: [],
      stats: {
        totalAccounts: data.accounts.length,
        validAccounts: 0,
        totalTransactions: data.transactions.length,
        validTransactions: 0,
        totalGoals: data.goals.length,
        validGoals: 0
      }
    };
    
    // Valida contas
    data.accounts.forEach((acc, index) => {
      const validation = ValidationService.validate(acc, 'account');
      if (validation.valid) {
        report.stats.validAccounts++;
      } else {
        report.valid = false;
        report.errors.push(`Conta ${index + 1} (${acc.name || 'sem nome'}): ${validation.errors.join(', ')}`);
      }
    });
    
    // Valida transações (sample de 10% para performance)
    const sampleSize = Math.min(100, Math.ceil(data.transactions.length * 0.1));
    const sampleTransactions = data.transactions.slice(0, sampleSize);
    
    sampleTransactions.forEach((tx, index) => {
      const validation = ValidationService.validate(tx, 'transaction');
      if (validation.valid) {
        report.stats.validTransactions++;
      } else {
        report.warnings.push(`Transação linha ${index + 2}: ${validation.errors.join(', ')}`);
      }
    });
    
    // Estima total de transações válidas
    if (sampleSize > 0) {
      const validRatio = report.stats.validTransactions / sampleSize;
      report.stats.validTransactions = Math.round(data.transactions.length * validRatio);
    }
    
    // Valida metas
    data.goals.forEach((goal, index) => {
      const validation = ValidationService.validate(goal, 'goal');
      if (validation.valid) {
        report.stats.validGoals++;
      } else {
        report.warnings.push(`Meta ${index + 1} (${goal.categoria || 'sem categoria'}): ${validation.errors.join(', ')}`);
      }
    });
    
    // Se tem mais de 10 warnings, resume
    if (report.warnings.length > 10) {
      const extraWarnings = report.warnings.length - 10;
      report.warnings = report.warnings.slice(0, 10);
      report.warnings.push(`... e mais ${extraWarnings} avisos`);
    }
    
    return report;
  },

  readConfig: function(ss) {
    const sheet = ss.getSheetByName('CONFIG');
    const config = {};
    if (sheet) {
      const data = sheet.getRange('A2:B8').getValues();
      data.forEach(row => { if (row[0]) config[row[0]] = row[1]; });
    }
    return config;
  },

  readAccounts: function(ss) {
    const sheet = ss.getSheetByName('CONTAS');
    const lastRow = sheet ? Math.max(2, sheet.getLastRow()) : 2;
    if (!sheet || lastRow < 2) return [];

    const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    return data
      .filter(row => row[0] && String(row[0]).trim() !== '')
      .map(row => ({
        id: String(row[0]),
        name: String(row[1]),
        type: String(row[2]),
        balance: parseFloat(row[3]) || 0,
        icon: row[4] || '💰'
      }));
  },

  // NOVO: Lê o mapeamento do DRE
  readDreMapping: function(ss) {
    const sheet = ss.getSheetByName('CATEGORIAS');
    const map = {};
    if (!sheet) return map; // Se não criar a aba, não quebra o sistema
    
    const lastRow = Math.max(2, sheet.getLastRow());
    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    
    data.forEach(row => {
      if(row[0] && row[1]) {
        map[String(row[0]).trim()] = String(row[1]).trim();
      }
    });
    return map;
  },

  readTransactions: function(ss, accounts, dreMapping) {
    const sheet = ss.getSheetByName('TRANSACOES');
    const lastRow = sheet ? Math.max(2, sheet.getLastRow()) : 2;
    if (!sheet || lastRow < 2) return [];

    const accountMap = {};
    accounts.forEach(c => accountMap[c.id] = c.name);

    // Agora lê até a coluna I (índice 9)
    const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    
    return data
      .filter(row => row[0] && row[0] !== '')
      .map(row => {
        const cat = String(row[2]).trim();
        return {
          date: formatDate(row[0]),
          type: String(row[1]).trim(),
          category: cat,
          dreGroup: dreMapping[cat] || 'Outros', // Classifica pro DRE
          subcategory: String(row[3]).trim(),
          value: parseFloat(row[4]) || 0,
          accountId: String(row[5]).trim(),
          account: accountMap[String(row[5]).trim()] || String(row[5]).trim(),
          status: String(row[6]).trim(), // Pago ou Pendente
          description: String(row[7]).trim(),
          costCenter: String(row[8]).trim() // Coluna I: Centro de Custo
        };
      });
  },

  readGoals: function(ss) {
    const sheet = ss.getSheetByName('METAS');
    const lastRow = sheet ? Math.max(2, sheet.getLastRow()) : 2;
    if (!sheet || lastRow < 2) return [];
    const data = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    return data
      .filter(row => row[0] && String(row[0]).trim() !== '')
      .map(row => ({
        categoria: String(row[0]).trim(),
        meta: parseFloat(row[1]) || 0,
        corAlerta: String(row[2]).trim() || 'warning',
        tipo: String(row[3]).trim() || 'Gasto'
      }));
  }
};