// ===========================================
// 2. CONFIGURAÇÕES GLOBAIS
// ===========================================

// ID padrão (fallback para modo single-tenant ou testes)
var DEFAULT_SPREADSHEET_ID = '1HnUJM2541GB1ukUiggtu-xrbtMqDk7zrggmQa0LkaNjiKYbJtnzrZYtz';

function getSpreadsheetId() {
  // 1. Primeiro, verifica se tem um cliente ativo (modo multi-tenant)
  var props = PropertiesService.getUserProperties();
  var clientSpreadsheetId = props.getProperty('CURRENT_SPREADSHEET_ID');
  
  if (clientSpreadsheetId) {
    Logger.log('[Config] Usando planilha do cliente: ' + clientSpreadsheetId);
    return clientSpreadsheetId;
  }
  
  // 2. Se não há cliente ativo, verifica se AdminService está configurado
  if (typeof AdminService !== 'undefined' && AdminService.isMultiClientMode()) {
    Logger.log('[Config] Modo multi-cliente ativo, mas nenhum cliente selecionado');
    // Em modo multi-cliente sem cliente selecionado, retorna null para forçar erro
    return null;
  }
  
  // 3. Fallback: modo single-tenant (usa ID padrão)
  Logger.log('[Config] Modo single-tenant, usando planilha padrão');
  return DEFAULT_SPREADSHEET_ID;
}

// Obtém API Key da planilha de configuração
function getAPIKey(ss) {
  if (!ss) {
    ss = SpreadsheetApp.openById(getSpreadsheetId());
  }
  
  // Primeiro tenta da planilha do cliente
  var configSheet = ss.getSheetByName('CONFIG');
  if (configSheet) {
    var data = configSheet.getRange('A:B').getValues();
    for (var i = 0; i < data.length; i++) {
      var key = String(data[i][0]).toLowerCase().trim();
      if (key.indexOf('ai_api_key') > -1 || key.indexOf('api_key') > -1 || key.indexOf('openai') > -1) {
        if (data[i][1]) {
          return data[i][1];
        }
      }
    }
  }
  
  // Se não encontrou, busca da CONFIG_GLOBAL na ADMIN_MASTER
  if (typeof AdminService !== 'undefined' && AdminService.isMultiClientMode()) {
    var globalKey = AdminService.getGlobalConfig('openai_api_key');
    if (globalKey) {
      return globalKey;
    }
  }
  
  return null;
}

function getCacheConfig() {
  // Inclui o client_id no cache para evitar conflitos entre clientes
  var props = PropertiesService.getUserProperties();
  var clientId = props.getProperty('CURRENT_CLIENT_ID') || 'default';
  
  return {
    key: 'dashboard_data_v3_' + clientId,
    expiration: 600 // 10 minutos em segundos
  };
}