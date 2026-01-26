// ===========================================
// 2. CONFIGURAÇÕES GLOBAIS
// ===========================================

function getSpreadsheetId() {
  // Coloque o ID da planilha do cliente específico aqui
  return '1uUQm9Tq4Zstlfp-kmk8xurwAxsrT5-vCGRpxfxPE6bQ'; 
}

function getCacheConfig() {
  return {
    key: 'dashboard_data_v3', // Mude a versão para forçar limpeza em todos os clientes
    expiration: 300 // 5 minutos em segundos
  };
}