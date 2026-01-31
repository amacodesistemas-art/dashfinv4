// ===========================================
// 4. SERVIÇO DE DADOS (ATUALIZADO B2B)
// ===========================================

const DataService = {
  
  // Sistema de Planos integrado
  PLANS: {
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise'
  },
  
  PLAN_FEATURES: {
    'basic': {
      name: 'Básico',
      price: 'R$ 297/mês',
      ai_queries_limit: 0, // Sem IA
      features: {
        dashboard: true,
        filters: true,
        export_csv: true,
        export_pdf: false,
        charts: true,
        goals: true,
        accounts: true,
        insights_basic: true,
        dre: false,
        ai_insights: false,
        alerts: false,
        predictive_analytics: false,
        whatsapp_reports: false,
        import_enabled: false // Cliente não pode importar
      }
    },
    'professional': {
      name: 'Profissional',
      price: 'R$ 597/mês',
      ai_queries_limit: 30, // 30 consultas/mês
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
        ai_insights: true,
        alerts: false,
        predictive_analytics: false,
        whatsapp_reports: false,
        import_enabled: false // Cliente não pode importar
      }
    },
    'enterprise': {
      name: 'Enterprise',
      price: 'R$ 1.297/mês',
      ai_queries_limit: -1, // Ilimitado
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
        ai_insights: true,
        alerts: true,
        predictive_analytics: true,
        whatsapp_reports: true,
        priority_support: true,
        custom_reports: true,
        benchmarks: true,
        import_enabled: false // Cliente não pode importar
      }
    },
    // Aliases para compatibilidade com versões anteriores
    'intermediate': {
      name: 'Profissional',
      price: 'R$ 597/mês',
      ai_queries_limit: 30,
      features: {
        dashboard: true, filters: true, export_csv: true, export_pdf: true,
        charts: true, goals: true, accounts: true, insights_basic: true,
        dre: true, ai_insights: true, alerts: false, predictive_analytics: false,
        import_enabled: false
      }
    },
    'advanced': {
      name: 'Enterprise',
      price: 'R$ 1.297/mês',
      ai_queries_limit: -1,
      features: {
        dashboard: true, filters: true, export_csv: true, export_pdf: true,
        charts: true, goals: true, accounts: true, insights_basic: true,
        dre: true, ai_insights: true, alerts: true, predictive_analytics: true,
        whatsapp_reports: true, priority_support: true,
        import_enabled: false
      }
    },
    // NOVO: Plano especial para uso interno da equipe/consultoria
    'admin': {
      name: 'Administrador',
      price: 'Interno',
      ai_queries_limit: -1,
      features: {
        dashboard: true, filters: true, export_csv: true, export_pdf: true,
        charts: true, goals: true, accounts: true, insights_basic: true,
        dre: true, ai_insights: true, alerts: true, predictive_analytics: true,
        whatsapp_reports: true, priority_support: true, custom_reports: true,
        benchmarks: true,
        import_enabled: true // Apenas admin pode importar
      }
    }
  },
  
  // Obtém plano do cliente
  getClientPlan: function(ss) {
    try {
      // 1. Primeiro, tenta obter da ADMIN_MASTER se estiver em modo multi-cliente
      if (typeof AdminService !== 'undefined' && AdminService.isMultiClientMode()) {
        var props = PropertiesService.getUserProperties();
        var clientId = props.getProperty('CURRENT_CLIENT_ID');
        
        if (clientId) {
          var client = AdminService.getClientById(clientId);
          if (client && client.plano) {
            var planoAdmin = String(client.plano).toLowerCase().trim();
            Logger.log('[Plans] Plano da ADMIN_MASTER: ' + planoAdmin);
            
            // Mapeia para plano válido
            if (planoAdmin.includes('enterprise') || planoAdmin.includes('avançado') || planoAdmin.includes('avancado') || planoAdmin.includes('advanced')) {
              return this.PLANS.ENTERPRISE;
            } else if (planoAdmin.includes('professional') || planoAdmin.includes('profissional') || planoAdmin.includes('pro')) {
              return this.PLANS.PROFESSIONAL;
            } else {
              return this.PLANS.BASIC;
            }
          }
        }
      }
      
      // 2. Fallback: Lê da aba CONFIG da planilha do cliente
      const configSheet = ss.getSheetByName('CONFIG');
      
      if (!configSheet) {
        Logger.log('[Plans] Aba CONFIG não encontrada, usando plano BASIC');
        return this.PLANS.BASIC;
      }
      
      // Lê todas as linhas da CONFIG
      const lastRow = configSheet.getLastRow();
      if (lastRow < 1) {
        Logger.log('[Plans] CONFIG vazia, usando plano BASIC');
        return this.PLANS.BASIC;
      }
      
      const data = configSheet.getRange(1, 1, lastRow, 2).getValues();
      
      // Procura pela linha com "plano"
      for (let i = 0; i < data.length; i++) {
        const key = String(data[i][0]).toLowerCase().trim();
        const value = String(data[i][1]).toLowerCase().trim();
        
        Logger.log('[Plans] Linha ' + (i+1) + ': key="' + key + '", value="' + value + '"');
        
        if (key.includes('plano') || key.includes('plan')) {
          Logger.log('[Plans] Encontrou linha de plano: ' + value);
          
          // Mapeia para plano válido
          if (value.includes('enterprise') || value.includes('avançado') || value.includes('avancado') || value.includes('advanced')) {
            Logger.log('[Plans] Detectado: ENTERPRISE');
            return this.PLANS.ENTERPRISE;
          } else if (value.includes('professional') || value.includes('profissional') || value.includes('pro') || value.includes('intermediário') || value.includes('intermediario')) {
            Logger.log('[Plans] Detectado: PROFESSIONAL');
            return this.PLANS.PROFESSIONAL;
          } else if (value.includes('básico') || value.includes('basico') || value.includes('basic')) {
            Logger.log('[Plans] Detectado: BASIC');
            return this.PLANS.BASIC;
          }
        }
      }
      
      Logger.log('[Plans] Plano não encontrado na CONFIG, usando BASIC');
      return this.PLANS.BASIC;
      
    } catch (error) {
      Logger.log('[Plans] Erro ao obter plano: ' + error.message);
      return this.PLANS.BASIC;
    }
  },
  
  // Obtém info do plano
  getPlanInfo: function(planKey) {
    const planConfig = this.PLAN_FEATURES[planKey];
    
    if (!planConfig) {
      Logger.log('[Plans] Plano não encontrado: ' + planKey + ', usando BASIC');
      planKey = this.PLANS.BASIC;
    }
    
    return {
      plan: planKey,
      name: this.PLAN_FEATURES[planKey].name,
      price: this.PLAN_FEATURES[planKey].price,
      features: this.PLAN_FEATURES[planKey].features
    };
  },
  
  // NOVO: Verifica se o usuário atual é da equipe interna
  isStaffUser: function(config) {
    try {
      // Obtém email do usuário logado
      const currentUser = Session.getActiveUser().getEmail();
      
      if (!currentUser) {
        Logger.log('[Staff] Não foi possível obter email do usuário');
        return false;
      }
      
      Logger.log('[Staff] Usuário atual: ' + currentUser);
      
      // Verifica na lista de emails da equipe (do CONFIG da planilha)
      if (config.emails_equipe) {
        const staffEmails = String(config.emails_equipe)
          .toLowerCase()
          .split(',')
          .map(e => e.trim());
        
        if (staffEmails.includes(currentUser.toLowerCase())) {
          Logger.log('[Staff] Usuário é da equipe (via CONFIG)');
          return true;
        }
      }
      
      // Verifica na ADMIN_MASTER se estiver em modo multi-cliente
      if (typeof AdminService !== 'undefined' && AdminService.isMultiClientMode()) {
        const adminEmails = AdminService.getStaffEmails();
        if (adminEmails && adminEmails.includes(currentUser.toLowerCase())) {
          Logger.log('[Staff] Usuário é da equipe (via ADMIN_MASTER)');
          return true;
        }
      }
      
      Logger.log('[Staff] Usuário NÃO é da equipe');
      return false;
      
    } catch (error) {
      Logger.log('[Staff] Erro ao verificar equipe: ' + error.message);
      return false;
    }
  },
  
  fetchAllData: function() {
    const ss = SpreadsheetApp.openById(getSpreadsheetId());
    
    // Obtém plano do cliente
    const clientPlan = this.getClientPlan(ss);
    Logger.log('[DataService] Plano do cliente: ' + clientPlan);
    
    const config = this.readConfig(ss);
    const accounts = this.readAccounts(ss);
    const banks = this.readBanks(ss);
    const dreMapping = this.readDreMapping(ss);
    const transactions = this.readTransactions(ss, accounts, banks, dreMapping);
    const goals = this.readGoals(ss);
    
    // ====================================================
    // CÁLCULO DINÂMICO DO SALDO DAS CONTAS (CONTAS/PROJETOS)
    // ====================================================
    // O balance inicial da planilha é o SALDO INICIAL.
    // O saldo atual = saldo inicial + entradas - saídas (apenas transações PAGAS/CONCLUÍDAS)
    accounts.forEach(function(account) {
      var saldoInicial = account.balanceInicial || 0;
      var movimentacoes = 0;
      
      transactions.forEach(function(tx) {
        // Verifica se a transação pertence a esta conta
        var pertenceAConta = (String(tx.accountId) === String(account.id) || 
                             tx.account === account.name || 
                             tx.category === account.name);
        
        if (pertenceAConta) {
          // Considera TODAS as transações (não apenas pagas) para o saldo corrente
          // Se quiser apenas pagas, adicione: && isPaid(tx.status)
          if (tx.type === 'Entrada') {
            movimentacoes += tx.value;
          } else if (tx.type === 'Saída') {
            movimentacoes -= tx.value;
          }
        }
      });
      
      account.balanceInicial = saldoInicial;
      account.movimentacoes = movimentacoes;
      account.balance = saldoInicial + movimentacoes;
    });
    
    // ====================================================
    // CÁLCULO DINÂMICO DO SALDO DOS BANCOS
    // ====================================================
    // Saldo do banco = saldo inicial (da planilha) + entradas - saídas do banco
    banks.forEach(function(bank) {
      var saldoInicial = bank.balanceInicial || 0;
      var movimentacoes = 0;
      
      transactions.forEach(function(tx) {
        // Verifica se a transação pertence a este banco
        var pertenceAoBanco = (String(tx.bankId) === String(bank.id) || 
                              tx.bank === bank.name);
        
        if (pertenceAoBanco) {
          // Considera apenas transações PAGAS para o saldo real do banco
          var isPago = tx.status && 
                       (tx.status.toLowerCase() === 'pago' || 
                        tx.status.toLowerCase() === 'concluído' || 
                        tx.status.toLowerCase() === 'concluido' ||
                        tx.status.toLowerCase() === 'recebido');
          
          if (isPago) {
            if (tx.type === 'Entrada') {
              movimentacoes += tx.value;
            } else if (tx.type === 'Saída') {
              movimentacoes -= tx.value;
            }
          }
        }
      });
      
      bank.balanceInicial = saldoInicial;
      bank.movimentacoes = movimentacoes;
      bank.balance = saldoInicial + movimentacoes;
    });
    
    // Obtem informações do plano
    let planInfo = this.getPlanInfo(clientPlan);
    Logger.log('[DataService] Plan Info: ' + JSON.stringify(planInfo));
    
    // NOVO: Se usuário é da equipe, habilita funcionalidades de admin
    const isStaff = this.isStaffUser(config);
    if (isStaff) {
      Logger.log('[DataService] Usuário é STAFF - habilitando import_enabled');
      // Cria cópia das features e habilita importação
      planInfo = {
        ...planInfo,
        features: {
          ...planInfo.features,
          import_enabled: true
        },
        isStaff: true
      };
    }
    
    // Validação de dados
    const validation = this.validateData({
      accounts: accounts,
      banks: banks,
      transactions: transactions,
      goals: goals
    });
    
    // Calcula o patrimônio total (saldo de todos os bancos)
    const patrimonioTotal = banks.reduce(function(total, bank) {
      return total + (bank.balance || 0);
    }, 0);
    
    return {
      config: config,
      accounts: accounts,
      banks: banks,
      transactions: transactions,
      goals: goals,
      patrimonioTotal: patrimonioTotal,
      lastUpdate: new Date().toISOString(),
      validation: validation,
      plan: planInfo,
      isStaff: isStaff
    };
  },
  
  // Nova função: Valida todos os dados
  validateData: function(data) {
    const report = {
      valid: true,
      warnings: [],
      errors: [],
      stats: {
        totalAccounts: data.accounts.length,
        validAccounts: 0,
        totalTransactions: data.transactions.length,
        validTransactions: 0,
        totalGoals: data.goals.length,
        validGoals: 0
      }
    };
    
    // Valida contas
    data.accounts.forEach((acc, index) => {
      const validation = ValidationService.validate(acc, 'account');
      if (validation.valid) {
        report.stats.validAccounts++;
      } else {
        report.valid = false;
        report.errors.push(`Conta ${index + 1} (${acc.name || 'sem nome'}): ${validation.errors.join(', ')}`);
      }
    });
    
    // Valida transações (sample de 10% para performance)
    const sampleSize = Math.min(100, Math.ceil(data.transactions.length * 0.1));
    const sampleTransactions = data.transactions.slice(0, sampleSize);
    
    sampleTransactions.forEach((tx, index) => {
      const validation = ValidationService.validate(tx, 'transaction');
      if (validation.valid) {
        report.stats.validTransactions++;
      } else {
        report.warnings.push(`Transação linha ${index + 2}: ${validation.errors.join(', ')}`);
      }
    });
    
    // Estima total de transações válidas
    if (sampleSize > 0) {
      const validRatio = report.stats.validTransactions / sampleSize;
      report.stats.validTransactions = Math.round(data.transactions.length * validRatio);
    }
    
    // Valida metas
    data.goals.forEach((goal, index) => {
      const validation = ValidationService.validate(goal, 'goal');
      if (validation.valid) {
        report.stats.validGoals++;
      } else {
        report.warnings.push(`Meta ${index + 1} (${goal.categoria || 'sem categoria'}): ${validation.errors.join(', ')}`);
      }
    });
    
    // Se tem mais de 10 warnings, resume
    if (report.warnings.length > 10) {
      const extraWarnings = report.warnings.length - 10;
      report.warnings = report.warnings.slice(0, 10);
      report.warnings.push(`... e mais ${extraWarnings} avisos`);
    }
    
    return report;
  },

  readConfig: function(ss) {
    const sheet = ss.getSheetByName('CONFIG');
    const config = {};
    if (sheet) {
      const lastRow = sheet.getLastRow();
      if (lastRow >= 1) {
        const data = sheet.getRange(1, 1, lastRow, 2).getValues();
        data.forEach(row => { 
          if (row[0]) {
            const key = String(row[0]).toLowerCase().trim();
            const value = row[1];
            
            // Guarda com a chave original também
            config[row[0]] = value;
            config[key] = value;
            
            // Mapeia chaves conhecidas para nomes padronizados
            if (key === 'nome' || key === 'nome_cliente' || key === 'cliente' || 
                key === 'nome cliente' || key === 'empresa' || key === 'razao_social' ||
                key === 'razão social' || key === 'razao social') {
              config.nome_cliente = value;
            }
            if (key === 'plano' || key === 'plan') {
              config.plano = value;
            }
            if (key === 'cnpj') {
              config.cnpj = value;
            }
            // Lista de emails da equipe (separados por vírgula)
            if (key === 'emails_equipe' || key === 'staff_emails' || key === 'equipe') {
              config.emails_equipe = value;
            }
          }
        });
      }
    }
    
    // Valores padrão se não encontrados - busca mais abrangente
    if (!config.nome_cliente || config.nome_cliente === '' || config.nome_cliente === 'undefined') {
      // Tenta várias variações de chaves
      config.nome_cliente = config['Nome'] || config['nome'] || 
                           config['Nome_Cliente'] || config['nome_cliente'] ||
                           config['NomeCliente'] || config['Cliente'] ||
                           config['cliente'] || config['Empresa'] ||
                           config['empresa'] || config['NOME'] ||
                           config['NOME_CLIENTE'] || 'Cliente';
    }
    
    // Se ainda for vazio ou undefined, usa fallback
    if (!config.nome_cliente || config.nome_cliente.toString().trim() === '' || 
        config.nome_cliente === 'undefined' || config.nome_cliente === 'null') {
      config.nome_cliente = 'Cliente';
    }
    
    return config;
  },

  readAccounts: function(ss) {
    const sheet = ss.getSheetByName('CONTAS');
    const lastRow = sheet ? Math.max(2, sheet.getLastRow()) : 2;
    if (!sheet || lastRow < 2) return [];

    // Estrutura: ID, Nome, Tipo, Icone, Orcamento_Mensal
    const data = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    return data
      .filter(row => row[0] && String(row[0]).trim() !== '')
      .map(row => ({
        id: String(row[0]),
        name: String(row[1]),
        type: String(row[2]),
        icon: row[3] || '📁',
        budget: parseFloat(row[4]) || 0,
        // Para compatibilidade com frontend antigo, balance vem da soma de transações
        // ou será calculado depois com base nos bancos
        balance: 0
      }));
  },
  
  // NOVO: Lê os bancos
  readBanks: function(ss) {
    const sheet = ss.getSheetByName('BANCOS');
    const lastRow = sheet ? Math.max(2, sheet.getLastRow()) : 2;
    if (!sheet || lastRow < 2) return [];

    const data = sheet.getRange(2, 1, lastRow - 1, 7).getValues();
    return data
      .filter(row => row[0] && String(row[0]).trim() !== '')
      .map(row => {
        const saldoInicial = parseFloat(row[3]) || 0;
        return {
          id: String(row[0]),
          name: String(row[1]),
          type: String(row[2]),
          balanceInicial: saldoInicial, // Saldo inicial da planilha
          balance: saldoInicial, // Será recalculado no fetchAllData
          icon: row[4] || '🏦',
          agency: String(row[5] || ''),
          accountNumber: String(row[6] || '')
        };
      });
  },

  // NOVO: Lê o mapeamento do DRE
  readDreMapping: function(ss) {
    const sheet = ss.getSheetByName('CATEGORIAS');
    const map = {};
    if (!sheet) return map; // Se não criar a aba, não quebra o sistema
    
    const lastRow = Math.max(2, sheet.getLastRow());
    const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
    
    data.forEach(row => {
      if(row[0] && row[1]) {
        map[String(row[0]).trim()] = String(row[1]).trim();
      }
    });
    return map;
  },

  readTransactions: function(ss, accounts, banks, dreMapping) {
    const sheet = ss.getSheetByName('TRANSACOES');
    const lastRow = sheet ? Math.max(2, sheet.getLastRow()) : 2;
    if (!sheet || lastRow < 2) return [];

    // Mapeia IDs para nomes
    const accountMap = {};
    accounts.forEach(c => accountMap[c.id] = c.name);
    
    const bankMap = {};
    if (banks && banks.length > 0) {
      banks.forEach(b => bankMap[b.id] = b.name);
    }

    // Lê até a coluna J (10 colunas) para incluir Banco
    const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
    
    return data
      .filter(row => row[0] && row[0] !== '')
      .map(row => {
        const cat = String(row[2]).trim();
        const accountId = String(row[5]).trim();
        const bankId = String(row[6]).trim();
        
        return {
          date: formatDate(row[0]),
          type: String(row[1]).trim(),
          category: cat,
          dreGroup: dreMapping[cat] || 'Outros',
          subcategory: String(row[3]).trim(),
          value: parseFloat(row[4]) || 0,
          accountId: accountId,
          account: accountMap[accountId] || accountId,
          bankId: bankId,
          bank: bankMap[bankId] || bankId || 'Não informado',
          status: String(row[7]).trim(),
          description: String(row[8]).trim(),
          costCenter: String(row[9]).trim()
        };
      });
  },

  readGoals: function(ss) {
    const sheet = ss.getSheetByName('METAS');
    const lastRow = sheet ? Math.max(2, sheet.getLastRow()) : 2;
    if (!sheet || lastRow < 2) return [];
    
    // Estrutura: Categoria, Meta, Tipo (3 colunas)
    const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    return data
      .filter(row => row[0] && String(row[0]).trim() !== '')
      .map(row => ({
        categoria: String(row[0]).trim(),
        meta: parseFloat(row[1]) || 0,
        tipo: String(row[2]).trim() || 'Gasto',
        corAlerta: 'warning' // Valor padrão
      }));
  }
};