// ===========================================
// SISTEMA DE PLANOS E FEATURE FLAGS
// ===========================================

// Definição dos planos disponíveis
const PLANS = {
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

// Features disponíveis por plano
const PLAN_FEATURES = {
  [PLANS.BASIC]: {
    name: 'Básico',
    price: 'R$ 97/mês',
    features: {
      dashboard: true,
      filters: true,
      export_csv: true,
      export_pdf: true,
      charts: true,
      goals: true,
      accounts: true,
      insights_basic: true,
      // Recursos avançados desabilitados
      dre: false,
      ai_classification: false,
      ai_insights: false,
      predictive_analytics: false,
      import_enabled: false // Cliente não pode importar
    }
  },
  
  [PLANS.INTERMEDIATE]: {
    name: 'Intermediário',
    price: 'R$ 197/mês',
    features: {
      dashboard: true,
      filters: true,
      export_csv: true,
      export_pdf: true,
      charts: true,
      goals: true,
      accounts: true,
      insights_basic: true,
      dre: true, // DRE habilitado
      // IA ainda desabilitada
      ai_classification: false,
      ai_insights: false,
      predictive_analytics: false,
      import_enabled: false // Cliente não pode importar
    }
  },
  
  [PLANS.ADVANCED]: {
    name: 'Avançado',
    price: 'R$ 397/mês',
    features: {
      dashboard: true,
      filters: true,
      export_csv: true,
      export_pdf: true,
      charts: true,
      goals: true,
      accounts: true,
      insights_basic: true,
      dre: true,
      ai_classification: true, // IA habilitada
      ai_insights: true,
      predictive_analytics: true,
      priority_support: true,
      custom_reports: true,
      import_enabled: false // Cliente não pode importar
    }
  }
};

// Função para obter plano do cliente
function getClientPlan() {
  try {
    const ss = SpreadsheetApp.openById(getSpreadsheetId());
    const configSheet = ss.getSheetByName('CONFIG');
    
    if (!configSheet) {
      Logger.log('[Plans] Aba CONFIG não encontrada, usando plano BASIC');
      return PLANS.BASIC;
    }
    
    // Procura pela configuração de plano (linha com "plano" na coluna A)
    const data = configSheet.getRange('A:B').getValues();
    
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] && data[i][0].toString().toLowerCase().includes('plano')) {
        const planValue = data[i][1].toString().toLowerCase().trim();
        
        // Mapeia para plano válido
        if (planValue.includes('avançado') || planValue.includes('advanced')) {
          return PLANS.ADVANCED;
        } else if (planValue.includes('intermediário') || planValue.includes('intermediario') || planValue.includes('intermediate')) {
          return PLANS.INTERMEDIATE;
        } else {
          return PLANS.BASIC;
        }
      }
    }
    
    // Se não encontrou configuração, usa plano básico
    Logger.log('[Plans] Configuração de plano não encontrada, usando BASIC');
    return PLANS.BASIC;
    
  } catch (error) {
    Logger.log('[Plans] Erro ao obter plano: ' + error.message);
    return PLANS.BASIC; // Fallback seguro
  }
}

// Função para verificar se feature está disponível
function hasFeature(featureName) {
  const plan = getClientPlan();
  const planConfig = PLAN_FEATURES[plan];
  
  if (!planConfig) {
    Logger.log('[Plans] Plano não encontrado: ' + plan);
    return false;
  }
  
  return planConfig.features[featureName] === true;
}

// Função para obter informações do plano
function getPlanInfo() {
  const plan = getClientPlan();
  return {
    plan: plan,
    name: PLAN_FEATURES[plan].name,
    price: PLAN_FEATURES[plan].price,
    features: PLAN_FEATURES[plan].features
  };
}

// Função para listar features disponíveis
function getAvailableFeatures() {
  const plan = getClientPlan();
  const features = PLAN_FEATURES[plan].features;
  
  return Object.keys(features).filter(key => features[key] === true);
}

// Função de teste
function testPlans() {
  Logger.log('=== TESTE DE PLANOS ===');
  
  const planInfo = getPlanInfo();
  Logger.log('Plano Atual: ' + planInfo.name + ' (' + planInfo.price + ')');
  
  Logger.log('\nFeatures Disponíveis:');
  const available = getAvailableFeatures();
  available.forEach(feature => {
    Logger.log('  ✓ ' + feature);
  });
  
  Logger.log('\nFeatures Bloqueadas:');
  Object.keys(planInfo.features).forEach(feature => {
    if (!planInfo.features[feature]) {
      Logger.log('  ✗ ' + feature);
    }
  });
  
  Logger.log('\nTeste de Features Específicas:');
  Logger.log('  DRE disponível? ' + hasFeature('dre'));
  Logger.log('  IA disponível? ' + hasFeature('ai_classification'));
  Logger.log('  Insights IA? ' + hasFeature('ai_insights'));
}