// ===========================================
// SCRIPT PARA CRIAR ESTRUTURA COMPLETA
// Execute: criarEstruturaCompleta()
// ===========================================

function criarEstruturaCompleta() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Logger.log('🚀 Iniciando criação da estrutura...');
  
  // 1. CONFIG
  criarAbaConfig(ss);
  
  // 2. BANCOS
  criarAbaBancos(ss);
  
  // 3. CONTAS
  criarAbaContas(ss);
  
  // 4. TRANSACOES
  criarAbaTransacoes(ss);
  
  // 5. CATEGORIAS
  criarAbaCategorias(ss);
  
  // 6. METAS
  criarAbaMetas(ss);
  
  // 7. REGRAS_CATEGORIZACAO
  criarAbaRegras(ss);
  
  // Remove aba padrão se existir
  try {
    var sheet1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('Página1') || ss.getSheetByName('Planilha1');
    if (sheet1 && ss.getSheets().length > 1) {
      ss.deleteSheet(sheet1);
    }
  } catch (e) {
    Logger.log('Nota: ' + e.message);
  }
  
  Logger.log('✅ Estrutura criada com sucesso!');
  Logger.log('📋 ID da planilha: ' + ss.getId());
  Logger.log('🔗 URL: ' + ss.getUrl());
  
  return {
    id: ss.getId(),
    url: ss.getUrl()
  };
}

function criarAbaConfig(ss) {
  var sheet = ss.getSheetByName('CONFIG');
  if (!sheet) {
    sheet = ss.insertSheet('CONFIG');
  }
  sheet.clear();
  
  var dados = [
    ['Plano', 'professional'],
    ['Nome', 'Nome da Empresa'],
    ['CNPJ', ''],
    ['AI_API_KEY', '']
  ];
  
  sheet.getRange(1, 1, dados.length, 2).setValues(dados);
  sheet.getRange('A:A').setFontWeight('bold');
  sheet.setColumnWidth(1, 150);
  sheet.setColumnWidth(2, 300);
  
  Logger.log('  ✓ CONFIG criada');
}

function criarAbaBancos(ss) {
  var sheet = ss.getSheetByName('BANCOS');
  if (!sheet) {
    sheet = ss.insertSheet('BANCOS');
  }
  sheet.clear();
  
  // Cabeçalho
  var headers = ['ID', 'Nome', 'Tipo', 'Saldo', 'Icone', 'Agencia', 'Conta_Numero'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#059669')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  // Dados de exemplo
  var exemplos = [
    [1, 'Nubank', 'Digital', 10000, '💜', '', ''],
    [2, 'Inter', 'Digital', 5000, '🧡', '', ''],
    [3, 'Banco Principal', 'Corrente', 25000, '🏦', '', '']
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  // Formatação
  sheet.setFrozenRows(1);
  sheet.getRange('D:D').setNumberFormat('R$ #,##0.00');
  
  // Larguras das colunas
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 60);
  sheet.setColumnWidth(6, 80);
  sheet.setColumnWidth(7, 120);
  
  Logger.log('  ✓ BANCOS criada');
}

function criarAbaContas(ss) {
  var sheet = ss.getSheetByName('CONTAS');
  if (!sheet) {
    sheet = ss.insertSheet('CONTAS');
  }
  sheet.clear();
  
  var headers = ['ID', 'Nome', 'Tipo', 'Icone', 'Orcamento_Mensal'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#7c3aed')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  var exemplos = [
    [1, 'MOTO', 'Veículo', '🏍️', 1500],
    [2, 'CASA', 'Moradia', '🏠', 3000],
    [3, 'EMPRESA CLIENTE', 'Cliente', '🏢', 0]
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  sheet.setFrozenRows(1);
  sheet.getRange('E:E').setNumberFormat('R$ #,##0.00');
  
  sheet.setColumnWidth(1, 50);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 60);
  sheet.setColumnWidth(5, 150);
  
  Logger.log('  ✓ CONTAS criada');
}

function criarAbaTransacoes(ss) {
  var sheet = ss.getSheetByName('TRANSACOES');
  if (!sheet) {
    sheet = ss.insertSheet('TRANSACOES');
  }
  sheet.clear();
  
  var headers = ['Data', 'Tipo', 'Categoria', 'Subcategoria', 'Valor', 'Conta', 'Banco', 'Status', 'Descrição', 'Centro_Custo'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#2563eb')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  // Exemplos
  var hoje = new Date();
  var dataStr = Utilities.formatDate(hoje, 'GMT-3', 'yyyy-MM-dd');
  
  var exemplos = [
    [dataStr, 'Saída', 'MOTO', 'FINANCIAMENTO', 800, 1, 1, 'Pago', 'Parcela financiamento', 'Pessoal'],
    [dataStr, 'Saída', 'CASA', 'LUZ', 250, 2, 2, 'Pendente', 'Conta de luz janeiro', 'Pessoal'],
    [dataStr, 'Entrada', 'EMPRESA CLIENTE', 'SERVIÇOS', 5000, 3, 1, 'Recebido', 'Projeto entregue', 'Comercial']
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  sheet.setFrozenRows(1);
  sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('E:E').setNumberFormat('R$ #,##0.00');
  
  // Larguras
  sheet.setColumnWidth(1, 100);
  sheet.setColumnWidth(2, 80);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 150);
  sheet.setColumnWidth(5, 100);
  sheet.setColumnWidth(6, 60);
  sheet.setColumnWidth(7, 60);
  sheet.setColumnWidth(8, 80);
  sheet.setColumnWidth(9, 250);
  sheet.setColumnWidth(10, 100);
  
  // Validação de dados para Tipo
  var tipoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Entrada', 'Saída'], true)
    .build();
  sheet.getRange('B2:B1000').setDataValidation(tipoRule);
  
  // Validação para Status
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pendente', 'Pago', 'Recebido', 'Atrasado', 'Agendado', 'Concluído'], true)
    .build();
  sheet.getRange('H2:H1000').setDataValidation(statusRule);
  
  Logger.log('  ✓ TRANSACOES criada');
}

function criarAbaCategorias(ss) {
  var sheet = ss.getSheetByName('CATEGORIAS');
  if (!sheet) {
    sheet = ss.insertSheet('CATEGORIAS');
  }
  sheet.clear();
  
  var headers = ['Categoria', 'Grupo_DRE'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#dc2626')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  var exemplos = [
    ['MOTO', 'Despesas Pessoais'],
    ['CASA', 'Despesas Fixas'],
    ['EMPRESA CLIENTE', 'Receita de Serviços']
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  sheet.setFrozenRows(1);
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 200);
  
  Logger.log('  ✓ CATEGORIAS criada');
}

function criarAbaMetas(ss) {
  var sheet = ss.getSheetByName('METAS');
  if (!sheet) {
    sheet = ss.insertSheet('METAS');
  }
  sheet.clear();
  
  var headers = ['Categoria', 'Meta', 'Tipo'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#f59e0b')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  var exemplos = [
    ['MOTO', 1500, 'Gasto'],
    ['CASA', 3000, 'Gasto'],
    ['EMPRESA CLIENTE', 10000, 'Receita']
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  sheet.setFrozenRows(1);
  sheet.getRange('B:B').setNumberFormat('R$ #,##0.00');
  
  var tipoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Gasto', 'Receita'], true)
    .build();
  sheet.getRange('C2:C1000').setDataValidation(tipoRule);
  
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 100);
  
  Logger.log('  ✓ METAS criada');
}

function criarAbaRegras(ss) {
  var sheet = ss.getSheetByName('REGRAS_CATEGORIZACAO');
  if (!sheet) {
    sheet = ss.insertSheet('REGRAS_CATEGORIZACAO');
  }
  sheet.clear();
  
  var headers = ['padrao', 'categoria', 'subcategoria', 'tipo'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#ec4899')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  
  var exemplos = [
    ['pix recebido', 'EMPRESA CLIENTE', 'SERVIÇOS', 'Entrada'],
    ['financiamento', 'MOTO', 'FINANCIAMENTO', 'Saída'],
    ['energia', 'CASA', 'LUZ', 'Saída'],
    ['aluguel', 'CASA', 'ALUGUEL', 'Saída'],
    ['seguro', 'MOTO', 'SEGURO', 'Saída']
  ];
  sheet.getRange(2, 1, exemplos.length, headers.length).setValues(exemplos);
  
  sheet.setFrozenRows(1);
  
  var tipoRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Entrada', 'Saída', 'auto'], true)
    .build();
  sheet.getRange('D2:D1000').setDataValidation(tipoRule);
  
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 150);
  sheet.setColumnWidth(4, 80);
  
  Logger.log('  ✓ REGRAS_CATEGORIZACAO criada');
}
