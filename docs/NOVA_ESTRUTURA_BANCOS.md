# 📊 Nova Estrutura de Dados - Com Bancos

## Mudança Principal

**Antes:** CONTAS = Projetos/Centros de Custo (MOTO, CASA, etc.)
**Agora:** CONTAS continua igual + Nova aba BANCOS

## Estrutura das Abas

### Aba: BANCOS (NOVA)
Onde o dinheiro está fisicamente.

| ID | Nome | Tipo | Saldo | Icone | Agencia | Conta_Numero |
|----|------|------|-------|-------|---------|--------------|
| 1 | Nubank | Digital | 10000 | 💜 | | |
| 2 | Inter | Digital | 5000 | 🧡 | | |
| 3 | Itaú | Corrente | 25000 | 🏦 | 1234 | 12345-6 |
| 4 | Caixa Físico | Dinheiro | 500 | 💵 | | |

**Tipos sugeridos:** Digital, Corrente, Poupança, Investimento, Dinheiro, Cartão de Crédito

---

### Aba: CONTAS (mantém - são os Projetos/Centros de Custo)
Para que serve o dinheiro.

| ID | Nome | Tipo | Icone | Orcamento_Mensal |
|----|------|------|-------|------------------|
| 1 | MOTO | Veículo | 🏍️ | 1500 |
| 2 | CASA | Moradia | 🏠 | 3000 |
| 3 | EMPRESA ABC | Cliente | 🏢 | 0 |
| 4 | INVESTIMENTOS | Pessoal | 📈 | 2000 |

**Nota:** Removemos "Saldo" daqui. O saldo real está nos BANCOS.

---

### Aba: TRANSACOES (atualizada)
Agora tem campo BANCO.

| Data | Tipo | Categoria | Subcategoria | Valor | Conta | Banco | Status | Descrição |
|------|------|-----------|--------------|-------|-------|-------|--------|-----------|
| 2025-01-15 | Saída | MOTO | FINANCIAMENTO | 800 | 1 | 1 | Pago | Parcela 5/48 |
| 2025-01-16 | Saída | MOTO | SEGURO | 200 | 1 | 2 | Pago | Seguro anual |
| 2025-01-17 | Entrada | EMPRESA ABC | SERVIÇOS | 5000 | 3 | 1 | Recebido | Projeto X |
| 2025-01-18 | Saída | CASA | LUZ | 300 | 2 | 3 | Pendente | Conta janeiro |

**Colunas:**
- **Conta:** ID da CONTA/PROJETO (MOTO, CASA, etc.)
- **Banco:** ID do BANCO (Nubank, Inter, etc.) - **NOVO**

---

### Aba: CATEGORIAS (mantém - mapeamento DRE)

| Categoria | Grupo_DRE |
|-----------|-----------|
| MOTO | Despesas Pessoais |
| CASA | Despesas Fixas |
| EMPRESA ABC | Receitas |

---

### Aba: METAS (mantém)

| Categoria | Meta | Tipo |
|-----------|------|------|
| MOTO | 1500 | Gasto |
| CASA | 3000 | Gasto |

---

## Visões no Dashboard

### 1. Visão Geral (Dashboard)
- KPIs consolidados
- Gráficos de fluxo
- Lista de transações

### 2. Visão por Bancos (NOVA)
- Cards de cada banco com saldo
- Entradas e saídas por banco
- Extrato por banco
- "De qual banco saiu/entrou?"

### 3. Visão por Contas/Projetos
- Cards de cada conta (MOTO, CASA, etc.)
- Total gasto/recebido por conta
- Subcategorias de cada conta
- "Para que foi o dinheiro?"

### 4. DRE (P&L)
- Visão gerencial
- Agrupamentos por grupo DRE

---

## Exemplos de Análise

### "Quanto gastei com MOTO este mês?"
→ Visão por Contas → MOTO → Total: R$ 1.150

### "Quanto saiu do Nubank este mês?"
→ Visão por Bancos → Nubank → Saídas: R$ 5.300

### "Qual banco tem mais dinheiro?"
→ Visão por Bancos → Itaú: R$ 25.000

### "Onde gastei mais: MOTO ou CASA?"
→ Visão por Contas → Comparativo

---

## Migração de Dados

Se você já tem dados na estrutura antiga:

1. **CONTAS atual** → Continua igual (são os projetos)
2. **Criar aba BANCOS** → Nova
3. **TRANSACOES** → Adicionar coluna "Banco" (coluna G)
4. **Preencher histórico** → Definir de qual banco foram as transações antigas

### Script de Migração (opcional)

```javascript
function migrarParaNovaestrutura() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Criar aba BANCOS se não existir
  var bancosSheet = ss.getSheetByName('BANCOS');
  if (!bancosSheet) {
    bancosSheet = ss.insertSheet('BANCOS');
    bancosSheet.appendRow(['ID', 'Nome', 'Tipo', 'Saldo', 'Icone', 'Agencia', 'Conta_Numero']);
    bancosSheet.getRange(1, 1, 1, 7).setBackground('#3b82f6').setFontColor('#fff').setFontWeight('bold');
    
    // Adiciona banco padrão
    bancosSheet.appendRow([1, 'Banco Principal', 'Corrente', 0, '🏦', '', '']);
  }
  
  // 2. Verificar se TRANSACOES tem coluna Banco
  var transSheet = ss.getSheetByName('TRANSACOES');
  if (transSheet) {
    var headers = transSheet.getRange(1, 1, 1, 10).getValues()[0];
    
    // Se não tem coluna Banco, adiciona
    if (headers.indexOf('Banco') === -1) {
      // Insere coluna entre Conta e Status
      transSheet.insertColumnAfter(6);
      transSheet.getRange(1, 7).setValue('Banco');
      
      // Preenche todas as transações com banco padrão (1)
      var lastRow = transSheet.getLastRow();
      if (lastRow > 1) {
        var range = transSheet.getRange(2, 7, lastRow - 1, 1);
        var values = [];
        for (var i = 0; i < lastRow - 1; i++) {
          values.push([1]); // Banco padrão = 1
        }
        range.setValues(values);
      }
    }
  }
  
  Logger.log('✅ Migração concluída!');
}
```

---

## Relacionamentos

```
BANCOS (1) ───────┐
                  │
                  ├──► TRANSAÇÕES (N)
                  │
CONTAS (1) ───────┘

Ou seja:
- 1 Transação pertence a 1 Banco E 1 Conta
- 1 Banco pode ter N transações de várias Contas
- 1 Conta pode ter N transações em vários Bancos
```
