// ===========================================
// 5. GERENCIADOR DE CACHE
// ===========================================

const CacheManager = {
  get: function(key) {
    const cache = CacheService.getUserCache();
    return cache.get(key);
  },

  put: function(key, value, expirationInSeconds) {
    const cache = CacheService.getUserCache();
    try {
      cache.put(key, value, expirationInSeconds);
      Logger.log('✓ Dados salvos no cache');
    } catch (e) {
      Logger.log('⚠ AVISO: Dados muito grandes para o cache. Ignorando salvamento.');
      // Não lança erro, apenas deixa o sistema funcionar sem cache para dados gigantes
    }
  },

  remove: function(key) {
    const cache = CacheService.getUserCache();
    cache.remove(key);
  }
};  