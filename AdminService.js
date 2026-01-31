// ===========================================
// ADMIN SERVICE - Gestão Multi-Cliente
// ===========================================

var AdminService = {
  
  // ID da planilha ADMIN_MASTER (configurar após criar)
  ADMIN_SPREADSHEET_ID: null, // Será lido de PropertiesService
  
  // Cache de clientes (5 minutos)
  CACHE_TTL: 300,
  
  // Inicializa o serviço admin
  init: function() {
    var props = PropertiesService.getScriptProperties();
    this.ADMIN_SPREADSHEET_ID = props.getProperty('ADMIN_SPREADSHEET_ID');
    return this.ADMIN_SPREADSHEET_ID !== null;
  },
  
  // Verifica se está em modo multi-cliente
  isMultiClientMode: function() {
    return this.init() && this.ADMIN_SPREADSHEET_ID;
  },
  
  // Busca cliente pelo ID
  getClientById: function(clientId) {
    if (!this.isMultiClientMode()) {
      return null;
    }
    
    var cache = CacheService.getScriptCache();
    var cacheKey = 'client_' + clientId;
    var cached = cache.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    try {
      var ss = SpreadsheetApp.openById(this.ADMIN_SPREADSHEET_ID);
      var sheet = ss.getSheetByName('CLIENTES');
      
      if (!sheet) {
        Logger.log('[Admin] Aba CLIENTES não encontrada');
        return null;
      }
      
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === clientId) {
          var client = {};
          for (var j = 0; j < headers.length; j++) {
            client[headers[j]] = data[i][j];
          }
          
          // Verifica se está ativo
          if (client.status !== 'ativo') {
            Logger.log('[Admin] Cliente ' + clientId + ' não está ativo: ' + client.status);
            return { error: 'Cliente suspenso ou cancelado', status: client.status };
          }
          
          cache.put(cacheKey, JSON.stringify(client), this.CACHE_TTL);
          return client;
        }
      }
      
      Logger.log('[Admin] Cliente não encontrado: ' + clientId);
      return null;
      
    } catch (e) {
      Logger.log('[Admin] Erro ao buscar cliente: ' + e.message);
      return null;
    }
  },
  
  // Lista todos os clientes
  getAllClients: function() {
    if (!this.isMultiClientMode()) {
      return [];
    }
    
    try {
      var ss = SpreadsheetApp.openById(this.ADMIN_SPREADSHEET_ID);
      var sheet = ss.getSheetByName('CLIENTES');
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var clients = [];
      
      for (var i = 1; i < data.length; i++) {
        if (data[i][0]) {
          var client = {};
          for (var j = 0; j < headers.length; j++) {
            client[headers[j]] = data[i][j];
          }
          clients.push(client);
        }
      }
      
      return clients;
      
    } catch (e) {
      Logger.log('[Admin] Erro ao listar clientes: ' + e.message);
      return [];
    }
  },
  
  // Atualiza último acesso do cliente
  updateLastAccess: function(clientId) {
    if (!this.isMultiClientMode()) return;
    
    try {
      var ss = SpreadsheetApp.openById(this.ADMIN_SPREADSHEET_ID);
      var sheet = ss.getSheetByName('CLIENTES');
      var data = sheet.getDataRange().getValues();
      
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === clientId) {
          // Encontra coluna de ultimo_acesso
          var headers = data[0];
          var colIndex = headers.indexOf('ultimo_acesso');
          if (colIndex > -1) {
            sheet.getRange(i + 1, colIndex + 1).setValue(new Date());
          }
          break;
        }
      }
    } catch (e) {
      Logger.log('[Admin] Erro ao atualizar último acesso: ' + e.message);
    }
  },
  
  // Incrementa contador de uso de IA
  incrementAIUsage: function(clientId) {
    if (!this.isMultiClientMode()) return;
    
    try {
      var ss = SpreadsheetApp.openById(this.ADMIN_SPREADSHEET_ID);
      var sheet = ss.getSheetByName('CLIENTES');
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === clientId) {
          var colIndex = headers.indexOf('consultas_ia_mes');
          if (colIndex > -1) {
            var current = parseInt(data[i][colIndex]) || 0;
            sheet.getRange(i + 1, colIndex + 1).setValue(current + 1);
          }
          break;
        }
      }
    } catch (e) {
      Logger.log('[Admin] Erro ao incrementar uso de IA: ' + e.message);
    }
  },
  
  // Reseta contadores de IA (executar mensalmente)
  resetMonthlyAICounters: function() {
    if (!this.isMultiClientMode()) return;
    
    try {
      var ss = SpreadsheetApp.openById(this.ADMIN_SPREADSHEET_ID);
      var sheet = ss.getSheetByName('CLIENTES');
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var colIndex = headers.indexOf('consultas_ia_mes');
      
      if (colIndex > -1) {
        for (var i = 1; i < data.length; i++) {
          if (data[i][0]) {
            sheet.getRange(i + 1, colIndex + 1).setValue(0);
          }
        }
      }
      
      Logger.log('[Admin] Contadores de IA resetados');
      
    } catch (e) {
      Logger.log('[Admin] Erro ao resetar contadores: ' + e.message);
    }
  },
  
  // Registra log do sistema
  log: function(clientId, acao, detalhes) {
    if (!this.isMultiClientMode()) return;
    
    try {
      var ss = SpreadsheetApp.openById(this.ADMIN_SPREADSHEET_ID);
      var sheet = ss.getSheetByName('LOG_SISTEMA');
      
      if (!sheet) {
        sheet = ss.insertSheet('LOG_SISTEMA');
        sheet.appendRow(['timestamp', 'client_id', 'acao', 'detalhes']);
      }
      
      sheet.appendRow([new Date(), clientId, acao, detalhes]);
      
      // Mantém apenas últimas 10000 linhas
      var lastRow = sheet.getLastRow();
      if (lastRow > 10000) {
        sheet.deleteRows(2, lastRow - 10000);
      }
      
    } catch (e) {
      Logger.log('[Admin] Erro ao registrar log: ' + e.message);
    }
  },
  
  // Busca configuração global
  getGlobalConfig: function(key) {
    if (!this.isMultiClientMode()) return null;
    
    try {
      var ss = SpreadsheetApp.openById(this.ADMIN_SPREADSHEET_ID);
      var sheet = ss.getSheetByName('CONFIG_GLOBAL');
      
      if (!sheet) return null;
      
      var data = sheet.getDataRange().getValues();
      for (var i = 0; i < data.length; i++) {
        if (String(data[i][0]).trim().toLowerCase() === key.toLowerCase()) {
          return data[i][1];
        }
      }
      
      return null;
      
    } catch (e) {
      Logger.log('[Admin] Erro ao buscar config global: ' + e.message);
      return null;
    }
  },
  
  // Cria novo cliente
  createClient: function(clientData) {
    if (!this.isMultiClientMode()) return { error: 'Modo multi-cliente não ativo' };
    
    try {
      var ss = SpreadsheetApp.openById(this.ADMIN_SPREADSHEET_ID);
      var sheet = ss.getSheetByName('CLIENTES');
      
      // Verifica se client_id já existe
      var data = sheet.getDataRange().getValues();
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === clientData.client_id) {
          return { error: 'Client ID já existe' };
        }
      }
      
      // Adiciona novo cliente
      sheet.appendRow([
        clientData.client_id,
        clientData.nome,
        clientData.spreadsheet_id,
        clientData.plano || 'basic',
        'ativo',
        new Date(), // data_inicio
        '', // data_vencimento
        0, // consultas_ia_mes
        new Date() // ultimo_acesso
      ]);
      
      this.log(clientData.client_id, 'cliente_criado', 'Novo cliente criado: ' + clientData.nome);
      
      return { success: true, client_id: clientData.client_id };
      
    } catch (e) {
      Logger.log('[Admin] Erro ao criar cliente: ' + e.message);
      return { error: e.message };
    }
  },
  
  // NOVO: Obtém lista de emails da equipe interna (staff)
  getStaffEmails: function() {
    if (!this.isMultiClientMode()) return [];
    
    try {
      var ss = SpreadsheetApp.openById(this.ADMIN_SPREADSHEET_ID);
      var sheet = ss.getSheetByName('CONFIG_GLOBAL');
      
      if (!sheet) return [];
      
      var data = sheet.getDataRange().getValues();
      
      for (var i = 0; i < data.length; i++) {
        var key = String(data[i][0]).toLowerCase().trim();
        if (key === 'emails_equipe' || key === 'staff_emails' || key === 'equipe_emails') {
          var emailsStr = String(data[i][1]);
          if (emailsStr) {
            return emailsStr.toLowerCase().split(',').map(function(e) {
              return e.trim();
            });
          }
        }
      }
      
      return [];
      
    } catch (e) {
      Logger.log('[Admin] Erro ao buscar emails da equipe: ' + e.message);
      return [];
    }
  }
};

// Função para configurar o ID da planilha admin (executar uma vez)
function setupAdminSpreadsheet(spreadsheetId) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('ADMIN_SPREADSHEET_ID', spreadsheetId);
  Logger.log('Admin Spreadsheet configurado: ' + spreadsheetId);
}

// Função alternativa: configura planilha existente pelo ID
// Use esta se já criou a planilha manualmente
function setupExistingAdminSpreadsheet(spreadsheetId) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  
  // Aba CLIENTES
  var clientesSheet = ss.getSheetByName('CLIENTES');
  if (!clientesSheet) {
    var sheets = ss.getSheets();
    if (sheets.length > 0 && sheets[0].getLastRow() <= 1) {
      clientesSheet = sheets[0];
      clientesSheet.setName('CLIENTES');
    } else {
      clientesSheet = ss.insertSheet('CLIENTES');
    }
  }
  
  if (clientesSheet.getLastRow() === 0) {
    clientesSheet.appendRow([
      'client_id', 'nome', 'spreadsheet_id', 'plano', 'status', 
      'data_inicio', 'data_vencimento', 'consultas_ia_mes', 'ultimo_acesso'
    ]);
    clientesSheet.getRange(1, 1, 1, 9).setBackground('#3b82f6').setFontColor('#ffffff').setFontWeight('bold');
    clientesSheet.setFrozenRows(1);
  }
  
  // Aba CONFIG_GLOBAL
  var configSheet = ss.getSheetByName('CONFIG_GLOBAL');
  if (!configSheet) {
    configSheet = ss.insertSheet('CONFIG_GLOBAL');
    configSheet.appendRow(['chave', 'valor']);
    configSheet.appendRow(['openai_api_key', '']);
    configSheet.appendRow(['limite_ia_basic', 0]);
    configSheet.appendRow(['limite_ia_professional', 30]);
    configSheet.appendRow(['limite_ia_enterprise', -1]);
    configSheet.appendRow(['email_admin', '']);
    configSheet.appendRow(['versao_sistema', '3.3.0']);
    configSheet.getRange(1, 1, 1, 2).setBackground('#10b981').setFontColor('#ffffff').setFontWeight('bold');
  }
  
  // Aba LOG_SISTEMA
  var logSheet = ss.getSheetByName('LOG_SISTEMA');
  if (!logSheet) {
    logSheet = ss.insertSheet('LOG_SISTEMA');
    logSheet.appendRow(['timestamp', 'client_id', 'acao', 'detalhes']);
    logSheet.getRange(1, 1, 1, 4).setBackground('#f59e0b').setFontColor('#ffffff').setFontWeight('bold');
  }
  
  // Aba ALERTAS_PENDENTES
  var alertasSheet = ss.getSheetByName('ALERTAS_PENDENTES');
  if (!alertasSheet) {
    alertasSheet = ss.insertSheet('ALERTAS_PENDENTES');
    alertasSheet.appendRow(['timestamp', 'client_id', 'tipo', 'mensagem', 'valor', 'enviado']);
    alertasSheet.getRange(1, 1, 1, 6).setBackground('#ef4444').setFontColor('#ffffff').setFontWeight('bold');
  }
  
  // Salva ID nas propriedades
  setupAdminSpreadsheet(spreadsheetId);
  
  Logger.log('✅ Planilha Admin configurada!');
  Logger.log('📋 ID: ' + spreadsheetId);
  Logger.log('🔗 URL: ' + ss.getUrl());
  
  return { success: true, url: ss.getUrl() };
}

// Função para criar estrutura da planilha admin
function createAdminStructure() {
  // Tenta usar a planilha ativa (se executar de dentro dela)
  // ou cria uma nova
  var ss;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create('ADMIN_DASHBOARD_MASTER');
    }
  } catch (e) {
    ss = SpreadsheetApp.create('ADMIN_DASHBOARD_MASTER');
  }
  
  var spreadsheetId = ss.getId();
  
  // Aba CLIENTES - usa a primeira aba existente ou cria
  var sheets = ss.getSheets();
  var clientesSheet = ss.getSheetByName('CLIENTES');
  
  if (!clientesSheet) {
    if (sheets.length > 0 && sheets[0].getLastRow() <= 1) {
      // Usa a primeira aba se estiver vazia
      clientesSheet = sheets[0];
      clientesSheet.setName('CLIENTES');
    } else {
      clientesSheet = ss.insertSheet('CLIENTES');
    }
  }
  
  // Limpa e configura CLIENTES
  clientesSheet.clear();
  clientesSheet.appendRow([
    'client_id', 'nome', 'spreadsheet_id', 'plano', 'status', 
    'data_inicio', 'data_vencimento', 'consultas_ia_mes', 'ultimo_acesso'
  ]);
  clientesSheet.getRange(1, 1, 1, 9).setBackground('#3b82f6').setFontColor('#ffffff').setFontWeight('bold');
  clientesSheet.setFrozenRows(1);
  
  // Aba CONFIG_GLOBAL
  var configSheet = ss.getSheetByName('CONFIG_GLOBAL');
  if (!configSheet) {
    configSheet = ss.insertSheet('CONFIG_GLOBAL');
  }
  configSheet.clear();
  configSheet.appendRow(['chave', 'valor']);
  configSheet.appendRow(['openai_api_key', '']);
  configSheet.appendRow(['limite_ia_basic', 0]);
  configSheet.appendRow(['limite_ia_professional', 30]);
  configSheet.appendRow(['limite_ia_enterprise', -1]);
  configSheet.appendRow(['email_admin', '']);
  configSheet.appendRow(['versao_sistema', '3.3.0']);
  configSheet.getRange(1, 1, 1, 2).setBackground('#10b981').setFontColor('#ffffff').setFontWeight('bold');
  
  // Aba LOG_SISTEMA
  var logSheet = ss.getSheetByName('LOG_SISTEMA');
  if (!logSheet) {
    logSheet = ss.insertSheet('LOG_SISTEMA');
  }
  logSheet.clear();
  logSheet.appendRow(['timestamp', 'client_id', 'acao', 'detalhes']);
  logSheet.getRange(1, 1, 1, 4).setBackground('#f59e0b').setFontColor('#ffffff').setFontWeight('bold');
  
  // Aba ALERTAS_PENDENTES
  var alertasSheet = ss.getSheetByName('ALERTAS_PENDENTES');
  if (!alertasSheet) {
    alertasSheet = ss.insertSheet('ALERTAS_PENDENTES');
  }
  alertasSheet.clear();
  alertasSheet.appendRow(['timestamp', 'client_id', 'tipo', 'mensagem', 'valor', 'enviado']);
  alertasSheet.getRange(1, 1, 1, 6).setBackground('#ef4444').setFontColor('#ffffff').setFontWeight('bold');
  
  // Configura o ID nas propriedades do script
  setupAdminSpreadsheet(spreadsheetId);
  
  Logger.log('✅ Planilha Admin configurada com sucesso!');
  Logger.log('📋 ID: ' + spreadsheetId);
  Logger.log('🔗 URL: ' + ss.getUrl());
  
  return {
    spreadsheetId: spreadsheetId,
    url: ss.getUrl(),
    message: 'Estrutura criada com sucesso!'
  };
}

// Trigger mensal para resetar contadores
function monthlyReset() {
  AdminService.resetMonthlyAICounters();
}
