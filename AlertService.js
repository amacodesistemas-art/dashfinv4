// ===========================================
// ALERT SERVICE - Sistema de Alertas Automáticos
// ===========================================

var AlertService = {
  
  // Tipos de alerta
  ALERT_TYPES: {
    FLUXO_CRITICO: 'fluxo_critico',
    INADIMPLENCIA: 'inadimplencia',
    DESPESA_ANORMAL: 'despesa_anormal',
    META_ESTOURADA: 'meta_estourada',
    VENCIMENTO_HOJE: 'vencimento_hoje',
    SALDO_BAIXO: 'saldo_baixo'
  },
  
  // Prioridades
  PRIORITY: {
    CRITICAL: 'critical',
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low'
  },
  
  // Analisa dados e gera alertas
  analyzeAndGenerateAlerts: function(data) {
    var alerts = [];
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    
    var transactions = data.transactions || [];
    var accounts = data.accounts || [];
    var goals = data.goals || [];
    
    // 1. ALERTA: Fluxo de Caixa Crítico (projeção negativa em 7 dias)
    var fluxoAlert = this.checkCashFlowProjection(transactions, accounts);
    if (fluxoAlert) alerts.push(fluxoAlert);
    
    // 2. ALERTA: Inadimplência (faturas a receber atrasadas)
    var inadimplenciaAlert = this.checkOverdueReceivables(transactions, today);
    if (inadimplenciaAlert) alerts.push(inadimplenciaAlert);
    
    // 3. ALERTA: Despesas Anormais (acima da média + 50%)
    var despesaAlerts = this.checkAbnormalExpenses(transactions, today);
    alerts = alerts.concat(despesaAlerts);
    
    // 4. ALERTA: Metas Estouradas ou Próximas do Limite
    var metaAlerts = this.checkGoalsProgress(transactions, goals, today);
    alerts = alerts.concat(metaAlerts);
    
    // 5. ALERTA: Vencimentos Hoje
    var vencimentoAlerts = this.checkDueToday(transactions, today);
    alerts = alerts.concat(vencimentoAlerts);
    
    // 6. ALERTA: Saldo Baixo em Contas
    var saldoAlerts = this.checkLowBalance(accounts);
    alerts = alerts.concat(saldoAlerts);
    
    // Ordena por prioridade
    var priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    alerts.sort(function(a, b) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    return alerts;
  },
  
  // 1. Verifica projeção de fluxo de caixa
  checkCashFlowProjection: function(transactions, accounts) {
    var totalBalance = 0;
    accounts.forEach(function(acc) {
      totalBalance += acc.balance || 0;
    });
    
    var today = new Date();
    var projection = totalBalance;
    var daysUntilNegative = -1;
    
    // Projeta próximos 30 dias
    for (var i = 0; i < 30; i++) {
      var checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      var dateStr = checkDate.toISOString().split('T')[0];
      
      transactions.forEach(function(t) {
        // Verificação CASE INSENSITIVE
        var status = (t.status || '').toLowerCase().trim();
        var isPending = status !== 'pago' && status !== 'concluído' && status !== 'concluido' && status !== 'recebido';
        
        if (t.date === dateStr && isPending) {
          if (t.type === 'Entrada') {
            projection += t.value;
          } else {
            projection -= t.value;
          }
        }
      });
      
      if (projection < 0 && daysUntilNegative === -1) {
        daysUntilNegative = i;
      }
    }
    
    if (daysUntilNegative >= 0 && daysUntilNegative <= 7) {
      return {
        type: this.ALERT_TYPES.FLUXO_CRITICO,
        priority: this.PRIORITY.CRITICAL,
        title: '⚠️ Fluxo de Caixa Crítico',
        message: 'Saldo projetado ficará NEGATIVO em ' + daysUntilNegative + ' dias!',
        value: projection,
        action: 'Revise contas a receber e negocie prazos de pagamento.',
        icon: 'alert-triangle',
        color: 'red'
      };
    } else if (daysUntilNegative >= 0 && daysUntilNegative <= 15) {
      return {
        type: this.ALERT_TYPES.FLUXO_CRITICO,
        priority: this.PRIORITY.HIGH,
        title: '🔔 Atenção ao Fluxo de Caixa',
        message: 'Saldo pode ficar negativo em ' + daysUntilNegative + ' dias.',
        value: projection,
        action: 'Planeje antecipadamente.',
        icon: 'trending-down',
        color: 'orange'
      };
    }
    
    return null;
  },
  
  // 2. Verifica inadimplência
  checkOverdueReceivables: function(transactions, today) {
    var overdueCount = 0;
    var overdueValue = 0;
    var oldestOverdue = null;
    
    transactions.forEach(function(t) {
      if (t.type === 'Entrada' && t.status !== 'Pago' && t.status !== 'Recebido' && t.status !== 'Concluído') {
        var parts = t.date.split('-');
        var tDate = new Date(parts[0], parts[1] - 1, parts[2]);
        
        if (tDate < today) {
          overdueCount++;
          overdueValue += t.value;
          
          if (!oldestOverdue || tDate < oldestOverdue) {
            oldestOverdue = tDate;
          }
        }
      }
    });
    
    if (overdueCount > 0) {
      var daysDiff = Math.floor((today - oldestOverdue) / (1000 * 60 * 60 * 24));
      var priority = overdueValue > 10000 || daysDiff > 30 ? this.PRIORITY.CRITICAL : 
                     overdueValue > 5000 || daysDiff > 15 ? this.PRIORITY.HIGH : this.PRIORITY.MEDIUM;
      
      return {
        type: this.ALERT_TYPES.INADIMPLENCIA,
        priority: priority,
        title: '💰 Contas a Receber em Atraso',
        message: overdueCount + ' fatura(s) em atraso totalizando R$ ' + overdueValue.toFixed(2),
        value: overdueValue,
        details: 'Atraso mais antigo: ' + daysDiff + ' dias',
        action: 'Entre em contato com os clientes inadimplentes.',
        icon: 'alert-circle',
        color: priority === 'critical' ? 'red' : 'orange'
      };
    }
    
    return null;
  },
  
  // 3. Verifica despesas anormais
  checkAbnormalExpenses: function(transactions, today) {
    var alerts = [];
    var currentMonth = today.getMonth();
    var currentYear = today.getFullYear();
    
    // Agrupa despesas por categoria no mês atual
    var currentExpenses = {};
    var historicalExpenses = {};
    var monthsCount = {};
    
    transactions.forEach(function(t) {
      if (t.type === 'Saída' || t.type === 'Saida') {
        var parts = t.date.split('-');
        var tDate = new Date(parts[0], parts[1] - 1, parts[2]);
        var cat = t.category || 'Outros';
        
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
          currentExpenses[cat] = (currentExpenses[cat] || 0) + t.value;
        } else if (tDate < today) {
          var monthKey = tDate.getFullYear() + '-' + tDate.getMonth();
          if (!historicalExpenses[cat]) {
            historicalExpenses[cat] = 0;
            monthsCount[cat] = 0;
          }
          historicalExpenses[cat] += t.value;
          
          // Conta meses únicos
          if (!monthsCount[cat + '_' + monthKey]) {
            monthsCount[cat + '_' + monthKey] = true;
            monthsCount[cat]++;
          }
        }
      }
    });
    
    // Compara com média histórica
    Object.keys(currentExpenses).forEach(function(cat) {
      var current = currentExpenses[cat];
      var historical = historicalExpenses[cat] || 0;
      var months = monthsCount[cat] || 1;
      var average = historical / months;
      
      if (average > 0 && current > average * 1.5) {
        var percentAbove = ((current - average) / average * 100).toFixed(0);
        
        alerts.push({
          type: AlertService.ALERT_TYPES.DESPESA_ANORMAL,
          priority: current > average * 2 ? AlertService.PRIORITY.HIGH : AlertService.PRIORITY.MEDIUM,
          title: '📈 Despesa Acima do Normal',
          message: cat + ' está ' + percentAbove + '% acima da média',
          value: current,
          details: 'Atual: R$ ' + current.toFixed(2) + ' | Média: R$ ' + average.toFixed(2),
          action: 'Verifique se há gastos não previstos.',
          icon: 'trending-up',
          color: 'orange',
          category: cat
        });
      }
    });
    
    return alerts;
  },
  
  // 4. Verifica progresso das metas
  checkGoalsProgress: function(transactions, goals, today) {
    var alerts = [];
    var currentMonth = today.getMonth();
    var currentYear = today.getFullYear();
    
    // Calcula gastos do mês por categoria
    var monthExpenses = {};
    transactions.forEach(function(t) {
      if (t.type === 'Saída' || t.type === 'Saida') {
        var parts = t.date.split('-');
        var tDate = new Date(parts[0], parts[1] - 1, parts[2]);
        
        if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
          var cat = t.category || 'Outros';
          monthExpenses[cat] = (monthExpenses[cat] || 0) + t.value;
        }
      }
    });
    
    // Verifica cada meta
    goals.forEach(function(goal) {
      if (goal.tipo === 'Gasto' || !goal.tipo) {
        var spent = monthExpenses[goal.categoria] || 0;
        var percent = (spent / goal.meta) * 100;
        
        if (percent >= 100) {
          alerts.push({
            type: AlertService.ALERT_TYPES.META_ESTOURADA,
            priority: AlertService.PRIORITY.HIGH,
            title: '🎯 Meta de Gasto Estourada',
            message: goal.categoria + ': ' + percent.toFixed(0) + '% do limite',
            value: spent,
            details: 'Gasto: R$ ' + spent.toFixed(2) + ' | Meta: R$ ' + goal.meta.toFixed(2),
            action: 'Controle os gastos desta categoria até o fim do mês.',
            icon: 'alert-octagon',
            color: 'red',
            category: goal.categoria
          });
        } else if (percent >= 80) {
          alerts.push({
            type: AlertService.ALERT_TYPES.META_ESTOURADA,
            priority: AlertService.PRIORITY.MEDIUM,
            title: '⚡ Meta Próxima do Limite',
            message: goal.categoria + ': ' + percent.toFixed(0) + '% utilizado',
            value: spent,
            details: 'Restam R$ ' + (goal.meta - spent).toFixed(2),
            action: 'Atenção aos próximos gastos.',
            icon: 'alert-circle',
            color: 'yellow',
            category: goal.categoria
          });
        }
      }
    });
    
    return alerts;
  },
  
  // 5. Verifica vencimentos do dia
  checkDueToday: function(transactions, today) {
    var alerts = [];
    var todayStr = today.toISOString().split('T')[0];
    
    var dueToday = transactions.filter(function(t) {
      return t.date === todayStr && t.status !== 'Pago' && t.status !== 'Concluído' && t.status !== 'Recebido';
    });
    
    if (dueToday.length > 0) {
      var totalPagar = 0;
      var totalReceber = 0;
      
      dueToday.forEach(function(t) {
        if (t.type === 'Entrada') {
          totalReceber += t.value;
        } else {
          totalPagar += t.value;
        }
      });
      
      if (totalPagar > 0) {
        alerts.push({
          type: this.ALERT_TYPES.VENCIMENTO_HOJE,
          priority: this.PRIORITY.HIGH,
          title: '📅 Contas a Pagar Hoje',
          message: 'R$ ' + totalPagar.toFixed(2) + ' vencem hoje',
          value: totalPagar,
          details: dueToday.filter(function(t) { return t.type !== 'Entrada'; }).length + ' conta(s)',
          action: 'Efetue os pagamentos para evitar juros.',
          icon: 'calendar',
          color: 'orange'
        });
      }
      
      if (totalReceber > 0) {
        alerts.push({
          type: this.ALERT_TYPES.VENCIMENTO_HOJE,
          priority: this.PRIORITY.MEDIUM,
          title: '📥 Recebimentos Previstos Hoje',
          message: 'R$ ' + totalReceber.toFixed(2) + ' a receber hoje',
          value: totalReceber,
          details: dueToday.filter(function(t) { return t.type === 'Entrada'; }).length + ' recebimento(s)',
          action: 'Confirme os recebimentos.',
          icon: 'download',
          color: 'green'
        });
      }
    }
    
    return alerts;
  },
  
  // 6. Verifica saldo baixo em contas
  checkLowBalance: function(accounts) {
    var alerts = [];
    
    accounts.forEach(function(acc) {
      if (acc.balance < 0) {
        alerts.push({
          type: AlertService.ALERT_TYPES.SALDO_BAIXO,
          priority: AlertService.PRIORITY.CRITICAL,
          title: '🔴 Conta Negativa',
          message: acc.name + ' está com saldo negativo',
          value: acc.balance,
          details: 'Saldo: R$ ' + acc.balance.toFixed(2),
          action: 'Transfira recursos ou negocie com o banco.',
          icon: 'alert-triangle',
          color: 'red',
          account: acc.name
        });
      } else if (acc.balance < 1000 && acc.type !== 'Cartão de Crédito') {
        alerts.push({
          type: AlertService.ALERT_TYPES.SALDO_BAIXO,
          priority: AlertService.PRIORITY.LOW,
          title: '💵 Saldo Baixo',
          message: acc.name + ' com saldo baixo',
          value: acc.balance,
          details: 'Saldo: R$ ' + acc.balance.toFixed(2),
          action: 'Considere fazer uma reserva.',
          icon: 'wallet',
          color: 'yellow',
          account: acc.name
        });
      }
    });
    
    return alerts;
  },
  
  // Formata alertas para exibição no frontend
  formatAlertsForDisplay: function(alerts) {
    return alerts.map(function(alert) {
      var priorityStyles = {
        critical: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', text: 'text-red-800 dark:text-red-200' },
        high: { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-800 dark:text-orange-200' },
        medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-800 dark:text-yellow-200' },
        low: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-800 dark:text-blue-200' }
      };
      
      var style = priorityStyles[alert.priority] || priorityStyles.medium;
      
      return {
        type: alert.type,
        priority: alert.priority,
        title: alert.title,
        message: alert.message,
        value: alert.value,
        details: alert.details,
        action: alert.action,
        icon: alert.icon,
        style: style
      };
    });
  }
};

// Função para ser chamada pelo frontend
function getAlerts(clientData) {
  var alerts = AlertService.analyzeAndGenerateAlerts(clientData);
  return AlertService.formatAlertsForDisplay(alerts);
}

// Função para testar alertas
function testAlerts() {
  var data = DataService.fetchAllData();
  var alerts = AlertService.analyzeAndGenerateAlerts(data);
  
  Logger.log('=== ALERTAS GERADOS ===');
  Logger.log('Total: ' + alerts.length);
  
  alerts.forEach(function(alert, index) {
    Logger.log('\n--- Alerta ' + (index + 1) + ' ---');
    Logger.log('Tipo: ' + alert.type);
    Logger.log('Prioridade: ' + alert.priority);
    Logger.log('Título: ' + alert.title);
    Logger.log('Mensagem: ' + alert.message);
    Logger.log('Ação: ' + alert.action);
  });
}
