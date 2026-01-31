// ===========================================
// SCRIPT PARA ATUALIZAR/CRIAR ABAS NA ADMIN_MASTER
// ===========================================
// 
// INSTRUÇÕES DE USO:
// 1. Abra a planilha ADMIN_MASTER no Google Sheets
// 2. Vá em Extensões > Apps Script
// 3. Cole este código inteiro
// 4. Execute a função `atualizarAdminMaster()`
// 5. Autorize quando solicitado
//
// IMPORTANTE: Este script NÃO apaga dados existentes!
// Ele apenas adiciona novas abas ou atualiza configurações faltantes.
// ===========================================

/**
 * Função principal para atualizar a ADMIN_MASTER
 * Executa todas as atualizações de forma segura
 */
function atualizarAdminMaster() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Logger.log('🚀 Iniciando atualização da ADMIN_MASTER...');
  Logger.log('📋 Planilha: ' + ss.getName());
  Logger.log('🔗 ID: ' + ss.getId());
  
  // 1. Atualiza/Cria aba CONFIG_GLOBAL
  atualizarConfigGlobal(ss);
  
  // 2. Atualiza/Cria aba PLANOS_FEATURES (opcional - para controle visual)
  criarAbaPlanos(ss);
  
  // 3. Verifica se CLIENTES existe e tem as colunas certas
  verificarAbaClientes(ss);
  
  // 4. Verifica se LOG_SISTEMA existe
  verificarAbaLog(ss);
  
  // 5. Cria aba de FEATURES_POR_PLANO para controle administrativo
  criarAbaFeaturesPorPlano(ss);
  
  Logger.log('\n✅ Atualização concluída com sucesso!');
  Logger.log('📊 Verifique as abas criadas/atualizadas na planilha.');
  
  SpreadsheetApp.getUi().alert(
    '✅ Atualização Concluída!',
    'As abas foram atualizadas/criadas com sucesso.\n\n' +
    'Verifique:\n' +
    '• CONFIG_GLOBAL - Configurações centrais\n' +
    '• PLANOS_FEATURES - Definição de features por plano\n' +
    '• FEATURES_POR_PLANO - Controle visual das features\n' +
    '• CLIENTES - Verificado/atualizado\n' +
    '• LOG_SISTEMA - Verificado/atualizado',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Atualiza a aba CONFIG_GLOBAL com todas as configurações necessárias
 */
function atualizarConfigGlobal(ss) {
  Logger.log('\n📝 Verificando CONFIG_GLOBAL...');
  
  var sheet = ss.getSheetByName('CONFIG_GLOBAL');
  
  if (!sheet) {
    Logger.log('  → Criando nova aba CONFIG_GLOBAL');
    sheet = ss.insertSheet('CONFIG_GLOBAL');
    
    // Cabeçalho
    sheet.getRange('A1:C1').setValues([['chave', 'valor', 'descricao']]);
    sheet.getRange('A1:C1')
      .setBackground('#10b981')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  // Configurações necessárias (não sobrescreve existentes)
  var configsNecessarias = [
    ['openai_api_key', '', 'Chave da API OpenAI para o chatbot de IA'],
    ['limite_ia_basic', '0', 'Limite de consultas IA para plano Básico (0 = desabilitado)'],
    ['limite_ia_professional', '30', 'Limite de consultas IA para plano Profissional'],
    ['limite_ia_enterprise', '-1', 'Limite de consultas IA para plano Enterprise (-1 = ilimitado)'],
    ['email_admin', '', 'Email do administrador para notificações'],
    ['emails_equipe', '', 'Emails da equipe interna (separados por vírgula)'],
    ['versao_sistema', '3.4.0', 'Versão atual do sistema'],
    ['whatsapp_suporte', '', 'Número do WhatsApp para suporte (com código do país)'],
    ['url_documentacao', '', 'URL da documentação do sistema'],
    ['habilitar_import_cliente', 'false', 'Se true, permite que clientes importem OFX/CSV'],
    ['modelo_ia', 'gpt-4o-mini', 'Modelo da OpenAI a ser usado (gpt-4o-mini, gpt-4o, gpt-4)'],
    ['max_tokens_ia', '400', 'Máximo de tokens por resposta da IA']
  ];
  
  // Lê configurações existentes
  var data = sheet.getDataRange().getValues();
  var existentes = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      existentes[String(data[i][0]).toLowerCase().trim()] = true;
    }
  }
  
  // Adiciona apenas as que não existem
  var novasConfigs = [];
  configsNecessarias.forEach(function(config) {
    if (!existentes[config[0].toLowerCase()]) {
      novasConfigs.push(config);
      Logger.log('  + Adicionando: ' + config[0]);
    }
  });
  
  if (novasConfigs.length > 0) {
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, novasConfigs.length, 3).setValues(novasConfigs);
    Logger.log('  → ' + novasConfigs.length + ' configurações adicionadas');
  } else {
    Logger.log('  → CONFIG_GLOBAL já está completa');
  }
  
  // Ajusta largura das colunas
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 400);
}

/**
 * Cria aba PLANOS_FEATURES com definição dos planos
 */
function criarAbaPlanos(ss) {
  Logger.log('\n📝 Verificando PLANOS_FEATURES...');
  
  var sheet = ss.getSheetByName('PLANOS_FEATURES');
  
  if (sheet) {
    Logger.log('  → Aba já existe, mantendo dados existentes');
    return;
  }
  
  Logger.log('  → Criando nova aba PLANOS_FEATURES');
  sheet = ss.insertSheet('PLANOS_FEATURES');
  
  // Cabeçalho
  var headers = ['plano', 'nome_display', 'preco', 'limite_ia', 'descricao'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#8b5cf6')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  sheet.setFrozenRows(1);
  
  // Dados dos planos
  var planos = [
    ['basic', 'Básico', 'R$ 297/mês', '0', 'Dashboard, filtros, gráficos, metas básicas'],
    ['professional', 'Profissional', 'R$ 597/mês', '30', 'Tudo do Básico + DRE, IA (30/mês), PDF'],
    ['enterprise', 'Enterprise', 'R$ 1.297/mês', '-1', 'Tudo do Profissional + IA ilimitada, alertas, previsões'],
    ['admin', 'Administrador', 'Interno', '-1', 'Acesso total para equipe interna']
  ];
  
  sheet.getRange(2, 1, planos.length, headers.length).setValues(planos);
  
  // Formatação
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 150);
  sheet.setColumnWidth(3, 120);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 400);
  
  Logger.log('  → Aba PLANOS_FEATURES criada com ' + planos.length + ' planos');
}

/**
 * Cria aba FEATURES_POR_PLANO para controle visual das features
 */
function criarAbaFeaturesPorPlano(ss) {
  Logger.log('\n📝 Verificando FEATURES_POR_PLANO...');
  
  var sheet = ss.getSheetByName('FEATURES_POR_PLANO');
  
  if (sheet) {
    Logger.log('  → Aba já existe, mantendo dados existentes');
    return;
  }
  
  Logger.log('  → Criando nova aba FEATURES_POR_PLANO');
  sheet = ss.insertSheet('FEATURES_POR_PLANO');
  
  // Cabeçalho
  var headers = ['feature', 'descricao', 'basic', 'professional', 'enterprise'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#3b82f6')
    .setFontColor('#ffffff')
    .setFontWeight('bold');
  sheet.setFrozenRows(1);
  
  // Features
  var features = [
    ['dashboard', 'Dashboard principal', 'TRUE', 'TRUE', 'TRUE'],
    ['filters', 'Filtros avançados de data', 'TRUE', 'TRUE', 'TRUE'],
    ['export_csv', 'Exportar para CSV', 'TRUE', 'TRUE', 'TRUE'],
    ['export_pdf', 'Exportar para PDF', 'FALSE', 'TRUE', 'TRUE'],
    ['charts', 'Gráficos e visualizações', 'TRUE', 'TRUE', 'TRUE'],
    ['goals', 'Metas e objetivos', 'TRUE', 'TRUE', 'TRUE'],
    ['accounts', 'Gestão de contas/projetos', 'TRUE', 'TRUE', 'TRUE'],
    ['insights_basic', 'Insights básicos automáticos', 'TRUE', 'TRUE', 'TRUE'],
    ['dre', 'DRE Gerencial', 'FALSE', 'TRUE', 'TRUE'],
    ['ai_insights', 'Chatbot com IA', 'FALSE', 'TRUE', 'TRUE'],
    ['ai_classification', 'Classificação automática com IA', 'FALSE', 'FALSE', 'TRUE'],
    ['alerts', 'Alertas automáticos', 'FALSE', 'FALSE', 'TRUE'],
    ['predictive_analytics', 'Análise preditiva', 'FALSE', 'FALSE', 'TRUE'],
    ['whatsapp_reports', 'Relatórios via WhatsApp', 'FALSE', 'FALSE', 'TRUE'],
    ['import_enabled', 'Importação OFX/CSV (apenas equipe)', 'FALSE', 'FALSE', 'FALSE'],
    ['benchmarks', 'Benchmarks do setor', 'FALSE', 'FALSE', 'TRUE']
  ];
  
  sheet.getRange(2, 1, features.length, headers.length).setValues(features);
  
  // Formatação condicional para TRUE/FALSE
  var range = sheet.getRange(2, 3, features.length, 3);
  
  // Regra para TRUE (verde)
  var ruleTrue = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('TRUE')
    .setBackground('#dcfce7')
    .setFontColor('#166534')
    .setRanges([range])
    .build();
  
  // Regra para FALSE (vermelho claro)
  var ruleFalse = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('FALSE')
    .setBackground('#fee2e2')
    .setFontColor('#991b1b')
    .setRanges([range])
    .build();
  
  var rules = sheet.getConditionalFormatRules();
  rules.push(ruleTrue);
  rules.push(ruleFalse);
  sheet.setConditionalFormatRules(rules);
  
  // Ajusta largura
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 300);
  sheet.setColumnWidth(3, 100);
  sheet.setColumnWidth(4, 100);
  sheet.setColumnWidth(5, 100);
  
  Logger.log('  → Aba FEATURES_POR_PLANO criada com ' + features.length + ' features');
}

/**
 * Verifica e atualiza a aba CLIENTES
 */
function verificarAbaClientes(ss) {
  Logger.log('\n📝 Verificando CLIENTES...');
  
  var sheet = ss.getSheetByName('CLIENTES');
  
  if (!sheet) {
    Logger.log('  → Criando nova aba CLIENTES');
    sheet = ss.insertSheet('CLIENTES');
    
    var headers = [
      'client_id', 'nome', 'spreadsheet_id', 'plano', 'status',
      'data_inicio', 'data_vencimento', 'consultas_ia_mes', 'ultimo_acesso',
      'email_contato', 'telefone', 'observacoes'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#3b82f6')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    Logger.log('  → Aba CLIENTES criada com cabeçalho completo');
  } else {
    // Verifica se tem todas as colunas necessárias
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var colunasNecessarias = ['email_contato', 'telefone', 'observacoes'];
    var colunasExistentes = headers.map(function(h) { return String(h).toLowerCase().trim(); });
    
    var colunasFaltando = [];
    colunasNecessarias.forEach(function(col) {
      if (colunasExistentes.indexOf(col) === -1) {
        colunasFaltando.push(col);
      }
    });
    
    if (colunasFaltando.length > 0) {
      var ultimaColuna = sheet.getLastColumn();
      colunasFaltando.forEach(function(col, idx) {
        sheet.getRange(1, ultimaColuna + idx + 1).setValue(col);
      });
      
      // Formata novas colunas
      sheet.getRange(1, ultimaColuna + 1, 1, colunasFaltando.length)
        .setBackground('#3b82f6')
        .setFontColor('#ffffff')
        .setFontWeight('bold');
      
      Logger.log('  → Adicionadas colunas: ' + colunasFaltando.join(', '));
    } else {
      Logger.log('  → Aba CLIENTES já está completa');
    }
  }
}

/**
 * Verifica e atualiza a aba LOG_SISTEMA
 */
function verificarAbaLog(ss) {
  Logger.log('\n📝 Verificando LOG_SISTEMA...');
  
  var sheet = ss.getSheetByName('LOG_SISTEMA');
  
  if (!sheet) {
    Logger.log('  → Criando nova aba LOG_SISTEMA');
    sheet = ss.insertSheet('LOG_SISTEMA');
    
    var headers = ['timestamp', 'client_id', 'acao', 'detalhes', 'nivel'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#f59e0b')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    Logger.log('  → Aba LOG_SISTEMA criada');
  } else {
    Logger.log('  → Aba LOG_SISTEMA já existe');
  }
}

// ===========================================
// FUNÇÕES AUXILIARES
// ===========================================

/**
 * Reseta contadores de IA para todos os clientes (executar no início de cada mês)
 */
function resetarContadoresIA() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('CLIENTES');
  
  if (!sheet) {
    Logger.log('Aba CLIENTES não encontrada');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var colIndex = headers.indexOf('consultas_ia_mes');
  
  if (colIndex === -1) {
    Logger.log('Coluna consultas_ia_mes não encontrada');
    return;
  }
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) { // Se tem client_id
      sheet.getRange(i + 1, colIndex + 1).setValue(0);
    }
  }
  
  Logger.log('✅ Contadores de IA resetados para todos os clientes');
}

/**
 * Cria trigger mensal para resetar contadores
 */
function criarTriggerMensal() {
  // Remove triggers existentes
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'resetarContadoresIA') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Cria novo trigger para rodar todo dia 1 às 00:00
  ScriptApp.newTrigger('resetarContadoresIA')
    .timeBased()
    .onMonthDay(1)
    .atHour(0)
    .create();
  
  Logger.log('✅ Trigger mensal criado para resetar contadores no dia 1 de cada mês');
}

/**
 * Função para listar todos os clientes e seus planos
 */
function listarClientes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('CLIENTES');
  
  if (!sheet) {
    Logger.log('Aba CLIENTES não encontrada');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  
  Logger.log('\n=== LISTA DE CLIENTES ===\n');
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      Logger.log('📌 ' + data[i][0]);
      Logger.log('   Nome: ' + data[i][1]);
      Logger.log('   Plano: ' + data[i][3]);
      Logger.log('   Status: ' + data[i][4]);
      Logger.log('   Último acesso: ' + data[i][8]);
      Logger.log('');
    }
  }
}

/**
 * Verifica se uma API key é válida (teste básico)
 */
function testarAPIKey() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('CONFIG_GLOBAL');
  
  if (!sheet) {
    Logger.log('❌ Aba CONFIG_GLOBAL não encontrada');
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  var apiKey = null;
  
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase().trim() === 'openai_api_key') {
      apiKey = data[i][1];
      break;
    }
  }
  
  if (!apiKey || String(apiKey).trim() === '') {
    Logger.log('❌ API Key não configurada na CONFIG_GLOBAL');
    return;
  }
  
  Logger.log('🔑 API Key encontrada: ' + apiKey.substring(0, 10) + '...');
  
  // Teste simples
  try {
    var response = UrlFetchApp.fetch('https://api.openai.com/v1/models', {
      method: 'get',
      headers: {
        'Authorization': 'Bearer ' + apiKey
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() === 200) {
      Logger.log('✅ API Key válida!');
    } else {
      Logger.log('❌ API Key inválida. Código: ' + response.getResponseCode());
      Logger.log('Resposta: ' + response.getContentText());
    }
  } catch (e) {
    Logger.log('❌ Erro ao testar API Key: ' + e.message);
  }
}
