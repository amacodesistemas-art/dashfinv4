// ===========================================
// 7. FERRAMENTAS DE DEBUG
// ===========================================

function debugSystem() {
  const ss = SpreadsheetApp.openById(getSpreadsheetId());
  Logger.log("=== INICIANDO DIAGNÓSTICO ===");
  
  const abas = ss.getSheets().map(s => s.getName());
  Logger.log("Abas encontradas: " + abas.join(", "));
  
  if (!abas.includes('METAS')) {
    Logger.log("❌ ERRO: Aba METAS não encontrada.");
  } else {
    Logger.log("✓ Aba METAS encontrada.");
    const metasData = DataService.readGoals(ss);
    Logger.log(`   Lido ${metasData.length} metas.`);
    if(metasData.length > 0) {
      Logger.log(`   Exemplo: ${metasData[0].categoria} - Tipo: ${metasData[0].tipo}`);
    }
  }
  
  Logger.log("=== FIM ===");
}

function testGetData() {
  const result = getClientData(true);
  Logger.log(result.substring(0, 200) + "..."); // Mostra só o começo
}