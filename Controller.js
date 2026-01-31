// ===========================================
// 3. CONTROLADOR (API DO FRONTEND)
// ===========================================

function getClientData(forceRefresh) {
  try {
    const cacheConf = getCacheConfig();
    
    // 1. Tenta pegar do Cache (se não for refresh forçado)
    if (!forceRefresh) {
      const cachedData = CacheManager.get(cacheConf.key);
      if (cachedData) {
        Logger.log('✓ Usando dados em cache');
        return cachedData;
      }
    } else {
      // Se for refresh forçado, LIMPA o cache primeiro
      Logger.log('🗑️ Limpando cache antes do refresh...');
      CacheManager.remove(cacheConf.key);
    }
    
    // 2. Se não tem cache, busca dados frescos (Chama o DataService)
    Logger.log('↻ Processando dados da planilha...');
    const dataObj = DataService.fetchAllData();
    
    // 3. Converte para JSON
    const jsonString = JSON.stringify(dataObj);
    
    // 4. Salva no Cache (com proteção contra erro de tamanho)
    CacheManager.put(cacheConf.key, jsonString, cacheConf.expiration);
    
    return jsonString;
    
  } catch (error) {
    Logger.log("ERRO FATAL: " + error.toString());
    return JSON.stringify({
      error: true,
      message: error.toString(),
      stack: error.stack
    });
  }
}

// Chamado pelo botão "Atualizar" do Dashboard - FORÇA limpeza de cache
function refreshData() {
  Logger.log('🔄 Refresh forçado pelo usuário - Limpando cache...');
  
  // Limpa o cache antes de buscar novos dados
  const cacheConf = getCacheConfig();
  CacheManager.remove(cacheConf.key);
  
  // Busca dados frescos
  return getClientData(true);
}

// Chamado manualmente para limpar problemas
function clearCache() {
  CacheManager.remove(getCacheConfig().key);
  return 'Cache limpo com sucesso!';
}

// =====================================================
// TESTES PARA VALIDAR
// =====================================================

// Execute isso no console do navegador para testar:
function testFilters() {
    console.log('=== TESTE DE FILTROS ===');
    
    // Mock de dados
    const mockTxs = [
        { type: 'Entrada', status: 'Pago', value: 1000, date: '2025-01-15' },
        { type: 'Saída', status: 'Pendente', value: 500, date: '2025-01-20' },
        { type: 'entrada', status: 'pendente', value: 2000, date: '2025-01-10' }, // minúscula
        { type: 'SAÍDA', status: null, value: 300, date: '2025-01-05' }, // MAIÚSCULA, sem status
    ];
    
    // Teste 1: Filtrar Saídas
    ADVANCED_FILTERS = { type: 'Saída', status: '', category: '', costCenter: '', minValue: null, maxValue: null };
    const saidas = applyFilters(mockTxs);
    console.log('Saídas encontradas:', saidas.length, '(esperado: 2)');
    
    // Teste 2: Filtrar Pendentes
    ADVANCED_FILTERS = { type: '', status: 'Pendente', category: '', costCenter: '', minValue: null, maxValue: null };
    const pendentes = applyFilters(mockTxs);
    console.log('Pendentes encontradas:', pendentes.length, '(esperado: 3)');
    
    // Teste 3: Saídas Pendentes (como o card faz)
    ADVANCED_FILTERS = { type: 'Saída', status: 'Pendente', category: '', costCenter: '', minValue: null, maxValue: null };
    const saidasPendentes = applyFilters(mockTxs);
    console.log('Saídas Pendentes:', saidasPendentes.length, '(esperado: 2)');
    
    console.log('=== FIM DOS TESTES ===');
}