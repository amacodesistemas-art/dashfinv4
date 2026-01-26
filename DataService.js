// ===========================================
// 4. SERVIÇO DE DADOS (ATUALIZADO B2B)
// ===========================================

const DataService = {
  
  fetchAllData: function() {
    const ss = SpreadsheetApp.openById(getSpreadsheetId());
    
    const config = this.readConfig(ss);
    const accounts = this.readAccounts(ss);
    const dreMapping = this.readDreMapping(ss); // Novo!
    const transactions = this.readTransactions(ss, accounts, dreMapping); // Atualizado
    const goals = this.readGoals(ss);
    
    return {
      config: config,
      accounts: accounts,
      transactions: transactions,
      goals: goals,
      lastUpdate: new Date().toISOString()
    };
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