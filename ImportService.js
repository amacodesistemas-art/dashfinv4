// ===========================================
// IMPORT SERVICE - Importação de Extratos OFX/CSV
// ===========================================

var ImportService = {
  
  // Parse arquivo OFX
  parseOFX: function(content) {
    var transactions = [];
    
    // Remove headers XML se existirem
    content = content.replace(/<\?xml[^>]*\?>/gi, '');
    
    // Extrai transações
    var stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    var matches;
    
    while ((matches = stmtTrnRegex.exec(content)) !== null) {
      var txBlock = matches[1];
      
      var tx = {
        type: this.extractTag(txBlock, 'TRNTYPE'),
        date: this.parseOFXDate(this.extractTag(txBlock, 'DTPOSTED')),
        value: parseFloat(this.extractTag(txBlock, 'TRNAMT')) || 0,
        fitid: this.extractTag(txBlock, 'FITID'),
        description: this.extractTag(txBlock, 'MEMO') || this.extractTag(txBlock, 'NAME') || '',
        checknum: this.extractTag(txBlock, 'CHECKNUM')
      };
      
      // Limpa descrição
      tx.description = tx.description.replace(/\s+/g, ' ').trim();
      
      // Determina tipo baseado no valor
      if (tx.value > 0) {
        tx.transactionType = 'Entrada';
      } else {
        tx.transactionType = 'Saída';
        tx.value = Math.abs(tx.value);
      }
      
      if (tx.date && tx.value) {
        transactions.push(tx);
      }
    }
    
    // Ordena por data
    transactions.sort(function(a, b) {
      return new Date(a.date) - new Date(b.date);
    });
    
    return {
      success: true,
      transactions: transactions,
      count: transactions.length,
      period: {
        start: transactions.length > 0 ? transactions[0].date : null,
        end: transactions.length > 0 ? transactions[transactions.length - 1].date : null
      }
    };
  },
  
  // Extrai valor de uma tag OFX
  extractTag: function(content, tagName) {
    var regex = new RegExp('<' + tagName + '>([^<\\n]+)', 'i');
    var match = content.match(regex);
    return match ? match[1].trim() : '';
  },
  
  // Converte data OFX (YYYYMMDDHHMMSS) para YYYY-MM-DD
  parseOFXDate: function(dateStr) {
    if (!dateStr || dateStr.length < 8) return null;
    
    var year = dateStr.substring(0, 4);
    var month = dateStr.substring(4, 6);
    var day = dateStr.substring(6, 8);
    
    return year + '-' + month + '-' + day;
  },
  
  // Parse arquivo CSV
  parseCSV: function(content, config) {
    var transactions = [];
    var lines = content.split(/\r?\n/);
    
    // Configuração padrão
    config = config || {
      separator: ';',
      dateColumn: 0,
      descriptionColumn: 1,
      valueColumn: 2,
      typeColumn: -1, // -1 = detectar pelo valor
      skipHeader: true,
      dateFormat: 'DD/MM/YYYY'
    };
    
    var startRow = config.skipHeader ? 1 : 0;
    
    for (var i = startRow; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      
      var columns = line.split(config.separator);
      
      var tx = {
        date: this.parseCSVDate(columns[config.dateColumn], config.dateFormat),
        description: columns[config.descriptionColumn] ? columns[config.descriptionColumn].trim() : '',
        value: this.parseCSVValue(columns[config.valueColumn])
      };
      
      // Tipo
      if (config.typeColumn >= 0 && columns[config.typeColumn]) {
        var typeStr = columns[config.typeColumn].toLowerCase().trim();
        tx.transactionType = typeStr.indexOf('créd') > -1 || typeStr.indexOf('cred') > -1 || typeStr === 'c' ? 'Entrada' : 'Saída';
      } else {
        tx.transactionType = tx.value >= 0 ? 'Entrada' : 'Saída';
        tx.value = Math.abs(tx.value);
      }
      
      if (tx.date && tx.description) {
        transactions.push(tx);
      }
    }
    
    return {
      success: true,
      transactions: transactions,
      count: transactions.length
    };
  },
  
  // Parse data CSV
  parseCSVDate: function(dateStr, format) {
    if (!dateStr) return null;
    dateStr = dateStr.trim();
    
    var day, month, year;
    
    if (format === 'DD/MM/YYYY' || format === 'DD-MM-YYYY') {
      var parts = dateStr.split(/[\/\-]/);
      day = parts[0];
      month = parts[1];
      year = parts[2];
    } else if (format === 'YYYY-MM-DD') {
      var parts = dateStr.split('-');
      year = parts[0];
      month = parts[1];
      day = parts[2];
    } else if (format === 'MM/DD/YYYY') {
      var parts = dateStr.split('/');
      month = parts[0];
      day = parts[1];
      year = parts[2];
    }
    
    if (year && year.length === 2) {
      year = '20' + year;
    }
    
    if (year && month && day) {
      return year + '-' + month.padStart(2, '0') + '-' + day.padStart(2, '0');
    }
    
    return null;
  },
  
  // Parse valor CSV
  parseCSVValue: function(valueStr) {
    if (!valueStr) return 0;
    
    // Remove caracteres não numéricos exceto vírgula, ponto e menos
    valueStr = String(valueStr).trim()
      .replace(/[R$\s]/g, '')
      .replace(/\./g, '')  // Remove pontos de milhar
      .replace(',', '.');   // Vírgula decimal -> ponto
    
    return parseFloat(valueStr) || 0;
  },
  
  // Detecta duplicatas
  findDuplicates: function(newTransactions, existingTransactions) {
    var duplicates = [];
    var unique = [];
    
    newTransactions.forEach(function(newTx) {
      var isDuplicate = existingTransactions.some(function(existTx) {
        return existTx.date === newTx.date && 
               Math.abs(existTx.value - newTx.value) < 0.01 &&
               existTx.description.toLowerCase().indexOf(newTx.description.toLowerCase().substring(0, 10)) > -1;
      });
      
      if (isDuplicate) {
        duplicates.push(newTx);
      } else {
        unique.push(newTx);
      }
    });
    
    return {
      duplicates: duplicates,
      unique: unique
    };
  },
  
  // Salva transações importadas na planilha
  saveImportedTransactions: function(ss, transactions, bankId) {
    var sheet = ss.getSheetByName('TRANSACOES');
    if (!sheet) {
      return { error: 'Aba TRANSACOES não encontrada' };
    }
    
    var saved = 0;
    var errors = [];
    
    // Estrutura: Data, Tipo, Categoria, Subcategoria, Valor, Conta, Banco, Status, Descrição, Centro_Custo
    transactions.forEach(function(tx, index) {
      try {
        sheet.appendRow([
          tx.date,
          tx.transactionType || tx.type,
          tx.category || 'A Classificar',
          tx.subcategory || '',
          tx.value,
          tx.accountId || '',        // ID da Conta/Projeto (será categorizado pela IA)
          bankId,                    // ID do Banco de origem
          tx.status || 'Pendente',
          tx.description,
          tx.costCenter || ''        // Centro de custo
        ]);
        saved++;
      } catch (e) {
        errors.push({ index: index, error: e.message });
      }
    });
    
    return {
      success: true,
      saved: saved,
      errors: errors
    };
  },
  
  // Cria aba de conciliação para revisão
  createReconciliationSheet: function(ss, transactions, importId, bankId) {
    var sheetName = 'IMPORT_' + importId;
    var sheet = ss.getSheetByName(sheetName);
    
    if (sheet) {
      ss.deleteSheet(sheet);
    }
    
    sheet = ss.insertSheet(sheetName);
    
    // Busca nome do banco
    var bankName = 'N/A';
    var banksSheet = ss.getSheetByName('BANCOS');
    if (banksSheet) {
      var banksData = banksSheet.getDataRange().getValues();
      for (var i = 1; i < banksData.length; i++) {
        if (String(banksData[i][0]) === String(bankId)) {
          bankName = banksData[i][1];
          break;
        }
      }
    }
    
    // Cabeçalho
    sheet.appendRow([
      'APROVAR', 'DATA', 'DESCRIÇÃO', 'VALOR', 'TIPO', 
      'CONTA_SUGERIDA', 'SUBCATEGORIA', 'CONFIANÇA', 'MÉTODO', 'BANCO'
    ]);
    sheet.getRange(1, 1, 1, 10).setBackground('#3b82f6').setFontColor('#ffffff').setFontWeight('bold');
    
    // Dados
    transactions.forEach(function(tx) {
      sheet.appendRow([
        true, // Checkbox para aprovar
        tx.date,
        tx.description,
        tx.value,
        tx.transactionType || tx.type,
        tx.category || 'A Classificar',
        tx.subcategory || '',
        tx.confidence ? (tx.confidence * 100).toFixed(0) + '%' : '-',
        tx.method || '-',
        bankName + ' (ID: ' + bankId + ')'
      ]);
    });
    
    // Adiciona checkboxes
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, 1, lastRow - 1, 1).insertCheckboxes();
    }
    
    // Formata valores
    sheet.getRange(2, 4, lastRow - 1, 1).setNumberFormat('R$ #,##0.00');
    
    // Larguras
    sheet.setColumnWidth(1, 80);
    sheet.setColumnWidth(2, 100);
    sheet.setColumnWidth(3, 300);
    sheet.setColumnWidth(4, 120);
    sheet.setColumnWidth(6, 150);
    sheet.setColumnWidth(7, 150);
    sheet.setColumnWidth(10, 150);
    
    // Adiciona nota explicativa
    sheet.getRange(lastRow + 2, 1).setValue('📌 Instruções:');
    sheet.getRange(lastRow + 3, 1).setValue('1. Revise as categorias sugeridas pela IA');
    sheet.getRange(lastRow + 4, 1).setValue('2. Corrija as que estiverem erradas (o sistema aprende com suas correções)');
    sheet.getRange(lastRow + 5, 1).setValue('3. Desmarque as transações que não deseja importar');
    sheet.getRange(lastRow + 6, 1).setValue('4. Execute a função "aprovarImportacao" para finalizar');
    
    return {
      sheetName: sheetName,
      url: ss.getUrl() + '#gid=' + sheet.getSheetId(),
      bankId: bankId
    };
  },
  
  // Processa aprovações da aba de conciliação
  processApprovedTransactions: function(ss, importSheetName, accountId) {
    var importSheet = ss.getSheetByName(importSheetName);
    if (!importSheet) {
      return { error: 'Aba de importação não encontrada' };
    }
    
    var data = importSheet.getDataRange().getValues();
    var approved = [];
    
    // Pula cabeçalho
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === true) { // Checkbox marcado
        approved.push({
          date: data[i][1],
          description: data[i][2],
          value: data[i][3],
          transactionType: data[i][4],
          category: data[i][5],
          account: accountId
        });
      }
    }
    
    if (approved.length === 0) {
      return { error: 'Nenhuma transação aprovada' };
    }
    
    // Salva transações aprovadas
    var result = this.saveImportedTransactions(ss, approved, accountId);
    
    // Remove aba de importação
    if (result.success) {
      ss.deleteSheet(importSheet);
    }
    
    return result;
  }
};

// Funções expostas para o frontend

// Importa arquivo OFX
function importOFXFile(fileContent, bankId) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  
  // Parse OFX
  var parseResult = ImportService.parseOFX(fileContent);
  if (!parseResult.success) {
    return parseResult;
  }
  
  // Busca transações existentes para detectar duplicatas
  var existingTxs = DataService.readTransactions(ss, DataService.readAccounts(ss), DataService.readBanks(ss), {});
  var dupCheck = ImportService.findDuplicates(parseResult.transactions, existingTxs);
  
  // Categoriza usando IA (sugere Conta/Projeto baseado na descrição)
  var apiKey = getAPIKey(ss);
  var categorized = CategorizationService.categorizeBatch(dupCheck.unique, ss, apiKey);
  
  // NOVO: Retorna as transações categorizadas para o frontend aprovar
  // Não cria mais aba de conciliação na planilha!
  return {
    success: true,
    total: parseResult.count,
    duplicates: dupCheck.duplicates.length,
    toReview: dupCheck.unique.length,
    categorization: categorized.stats,
    categorizedTransactions: categorized.results, // Envia para o painel de aprovação
    period: parseResult.period,
    bankId: bankId
  };
}

// Importa CSV
function importCSVFile(fileContent, config, bankId) {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  
  var parseResult = ImportService.parseCSV(fileContent, config);
  if (!parseResult.success) {
    return parseResult;
  }
  
  var existingTxs = DataService.readTransactions(ss, DataService.readAccounts(ss), DataService.readBanks(ss), {});
  var dupCheck = ImportService.findDuplicates(parseResult.transactions, existingTxs);
  
  var apiKey = getAPIKey(ss);
  var categorized = CategorizationService.categorizeBatch(dupCheck.unique, ss, apiKey);
  
  // NOVO: Retorna as transações categorizadas para o frontend aprovar
  return {
    success: true,
    total: parseResult.count,
    duplicates: dupCheck.duplicates.length,
    toReview: dupCheck.unique.length,
    categorization: categorized.stats,
    categorizedTransactions: categorized.results, // Envia para o painel de aprovação
    bankId: bankId
  };
}

// REMOVIDO: approveImportedTransactions - agora usa saveApprovedTransactions do CategorizationService

// Lista abas de importação pendentes (mantido para compatibilidade)
function getPendingImports() {
  var ss = SpreadsheetApp.openById(getSpreadsheetId());
  var sheets = ss.getSheets();
  var pending = [];
  
  sheets.forEach(function(sheet) {
    var name = sheet.getName();
    if (name.indexOf('IMPORT_') === 0) {
      var lastRow = sheet.getLastRow();
      pending.push({
        name: name,
        count: lastRow - 1,
        url: ss.getUrl() + '#gid=' + sheet.getSheetId()
      });
    }
  });
  
  return pending;
}
