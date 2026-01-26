// ===========================================
// 2. CONFIGURAÇÕES GLOBAIS
// ===========================================

function getSpreadsheetId() {
  // ID da planilha do cliente
  return '1HnUJM2541GB1ukUiggtu-xrbtMqDk7zrggmQa0LkaNjiKYbJtnzrZYtz'; 
}

function getCacheConfig() {
  return {
    key: 'dashboard_data_v3',
    expiration: 600 // 10 minutos em segundos
  };
}