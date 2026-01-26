// ===========================================
// 1. FUNÇÃO PRINCIPAL (doGet)
// ===========================================

function doGet(e) {
  // Verifica se é requisição para service worker
  if (e.parameter && e.parameter.file === 'sw') {
    return HtmlService.createHtmlOutput(
      include('service-worker')
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  // Verifica se é requisição para manifest
  if (e.parameter && e.parameter.file === 'manifest') {
    const manifest = {
      "name": "Dashboard Financeiro B2B",
      "short_name": "FinDash B2B",
      "description": "Sistema profissional de gestão financeira para empresas B2B",
      "start_url": "./",
      "display": "standalone",
      "background_color": "#0f172a",
      "theme_color": "#3b82f6",
      "orientation": "portrait-primary",
      "icons": [
        {
          "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%233b82f6'/%3E%3Cpath d='M256 128c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm0 200c-39.8 0-72-32.2-72-72s32.2-72 72-72 72 32.2 72 72-32.2 72-72 72z' fill='%23fff'/%3E%3C/svg%3E",
          "sizes": "192x192",
          "type": "image/svg+xml",
          "purpose": "any maskable"
        },
        {
          "src": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%233b82f6'/%3E%3Cpath d='M256 128c-70.7 0-128 57.3-128 128s57.3 128 128 128 128-57.3 128-128-57.3-128-128-128zm0 200c-39.8 0-72-32.2-72-72s32.2-72 72-72 72 32.2 72 72-32.2 72-72 72z' fill='%23fff'/%3E%3C/svg%3E",
          "sizes": "512x512",
          "type": "image/svg+xml",
          "purpose": "any maskable"
        }
      ]
    };
    
    return ContentService.createTextOutput(JSON.stringify(manifest))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // Retorna página principal
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Dashboard Financeiro')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function testData() {
  const data = DataService.fetchAllData();
  Logger.log('=== TESTE DE DADOS ===');
  Logger.log('Config: ' + JSON.stringify(data.config));
  Logger.log('Contas: ' + data.accounts.length);
  Logger.log('Transações: ' + data.transactions.length);
  Logger.log('Metas: ' + data.goals.length);
  
  if (data.validation) {
    Logger.log('\n=== VALIDAÇÃO ===');
    Logger.log('Válido: ' + data.validation.valid);
    Logger.log('Erros: ' + data.validation.errors.length);
    Logger.log('Avisos: ' + data.validation.warnings.length);
    
    if (data.validation.errors.length > 0) {
      Logger.log('\nErros Encontrados:');
      data.validation.errors.forEach(function(err) {
        Logger.log('  - ' + err);
      });
    }
    
    if (data.validation.warnings.length > 0) {
      Logger.log('\nAvisos:');
      data.validation.warnings.forEach(function(warn) {
        Logger.log('  - ' + warn);
      });
    }
  }
  
  Logger.log('\n=== FIM DOS TESTES ===');
}