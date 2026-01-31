# 📊 Estrutura de Abas da Planilha do Cliente

## Abas Obrigatórias

### 1. CONFIG
Configurações do cliente.

| Coluna A | Coluna B |
|----------|----------|
| Plano | professional |
| Nome | Nome da Empresa |
| CNPJ | 00.000.000/0001-00 |
| AI_API_KEY | sk-xxxxxxx (opcional - pode usar da ADMIN_MASTER) |

### 2. CONTAS
Contas bancárias e caixas.

| ID | Nome | Tipo | Saldo | Icone |
|----|------|------|-------|-------|
| 1 | Banco do Brasil | Corrente | 15000 | 🏦 |
| 2 | Nubank | Digital | 8500 | 💳 |
| 3 | Caixa | Dinheiro | 500 | 💵 |

### 3. TRANSACOES
Movimentações financeiras.

| Data | Tipo | Categoria | Subcategoria | Valor | Conta | Status | Descrição | Centro de Custo |
|------|------|-----------|--------------|-------|-------|--------|-----------|-----------------|
| 2025-01-15 | Entrada | Vendas | Serviços | 5000 | 1 | Recebido | Cliente ABC | Projetos |
| 2025-01-16 | Saída | Fornecedores | Materiais | 1500 | 2 | Pago | Fornecedor XYZ | Operação |

**Tipos**: `Entrada`, `Saída`
**Status**: `Pendente`, `Pago`, `Recebido`, `Atrasado`, `Agendado`

### 4. CATEGORIAS
Mapeamento para DRE.

| Categoria | Grupo_DRE |
|-----------|-----------|
| Vendas | Receita Bruta |
| Serviços | Receita Bruta |
| Fornecedores | Custos Variáveis |
| Salários | Despesas Fixas |
| Marketing | Despesas Variáveis |

### 5. METAS
Metas e objetivos financeiros.

| Categoria | Meta | Tipo |
|-----------|------|------|
| Marketing | 5000 | Gasto |
| Vendas | 50000 | Receita |
| Fornecedores | 15000 | Gasto |
| EMPRESA CLIENTE | 10000 | Receita |

**Tipos de Meta**:

| Tipo | Descrição | Transações Consideradas | Comportamento |
|------|-----------|------------------------|---------------|
| `Gasto`, `Saída`, `Despesa`, `Limite` | Limite de gastos | Saídas | > 100% = Estourou (vermelho) |
| `Receita`, `Objetivo`, `Entrada`, `Sonho` | Meta de receita | Entradas | 100% = Alcançou (verde) |

> **IMPORTANTE**: Todos os tipos são case-insensitive (funciona `gasto`, `Gasto`, `GASTO`, etc.)

---

## Novas Abas (Opcionais)

### 6. REGRAS_CATEGORIZACAO
Regras automáticas de categorização.

| padrao | categoria | subcategoria | tipo |
|--------|-----------|--------------|------|
| pix | Vendas | | Entrada |
| aluguel | Aluguel | | Saída |
| fornecedor | Fornecedores | | auto |
| salario | Salários | | Saída |
| energia | Utilidades | Energia | Saída |
| internet | Utilidades | Internet | Saída |

**Tipo**: `Entrada`, `Saída`, `auto` (detecta pelo valor)

### 7. ALERTAS_CONFIG
Configuração de alertas personalizados (opcional).

| tipo_alerta | ativo | limite | email |
|-------------|-------|--------|-------|
| inadimplencia | TRUE | 5000 | gerente@empresa.com |
| fluxo_critico | TRUE | 7 | financeiro@empresa.com |
| meta_estourada | TRUE | 90 | |

### 8. HISTORICO_IA
Log de consultas de IA (gerado automaticamente).

| timestamp | pergunta | resposta | tokens |
|-----------|----------|----------|--------|

---

## Criação Automática

Para criar todas as abas automaticamente em uma nova planilha, execute:

```javascript
function criarEstruturaCliente() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // CONFIG
  var config = ss.getSheetByName('CONFIG') || ss.insertSheet('CONFIG');
  config.getRange('A1:B4').setValues([
    ['Plano', 'professional'],
    ['Nome', 'Nome da Empresa'],
    ['CNPJ', ''],
    ['AI_API_KEY', '']
  ]);
  config.getRange('A:A').setFontWeight('bold');
  
  // CONTAS
  var contas = ss.getSheetByName('CONTAS') || ss.insertSheet('CONTAS');
  contas.getRange('A1:E1').setValues([['ID', 'Nome', 'Tipo', 'Saldo', 'Icone']]);
  contas.getRange('A1:E1').setBackground('#3b82f6').setFontColor('#fff').setFontWeight('bold');
  
  // TRANSACOES
  var trans = ss.getSheetByName('TRANSACOES') || ss.insertSheet('TRANSACOES');
  trans.getRange('A1:I1').setValues([['Data', 'Tipo', 'Categoria', 'Subcategoria', 'Valor', 'Conta', 'Status', 'Descrição', 'Centro de Custo']]);
  trans.getRange('A1:I1').setBackground('#10b981').setFontColor('#fff').setFontWeight('bold');
  
  // CATEGORIAS
  var cats = ss.getSheetByName('CATEGORIAS') || ss.insertSheet('CATEGORIAS');
  cats.getRange('A1:B1').setValues([['Categoria', 'Grupo_DRE']]);
  cats.getRange('A1:B1').setBackground('#8b5cf6').setFontColor('#fff').setFontWeight('bold');
  
  // METAS
  var metas = ss.getSheetByName('METAS') || ss.insertSheet('METAS');
  metas.getRange('A1:C1').setValues([['Categoria', 'Meta', 'Tipo']]);
  metas.getRange('A1:C1').setBackground('#f59e0b').setFontColor('#fff').setFontWeight('bold');
  
  // REGRAS_CATEGORIZACAO
  var regras = ss.getSheetByName('REGRAS_CATEGORIZACAO') || ss.insertSheet('REGRAS_CATEGORIZACAO');
  regras.getRange('A1:D1').setValues([['padrao', 'categoria', 'subcategoria', 'tipo']]);
  regras.getRange('A1:D1').setBackground('#ec4899').setFontColor('#fff').setFontWeight('bold');
  
  // Exemplos de regras
  regras.getRange('A2:D6').setValues([
    ['pix recebido', 'Vendas', '', 'Entrada'],
    ['pix enviado', 'Fornecedores', '', 'Saída'],
    ['aluguel', 'Aluguel', '', 'Saída'],
    ['salario', 'Salários', '', 'Saída'],
    ['energia', 'Utilidades', 'Energia', 'Saída']
  ]);
  
  Logger.log('✅ Estrutura criada com sucesso!');
}
```

---

## Validação de Dados

### Formato de Data
- Use: `YYYY-MM-DD` (ex: 2025-01-15)
- Evite: `DD/MM/YYYY` ou outros formatos

### Valores
- Use ponto como separador decimal: `1500.50`
- Não use símbolos de moeda: ❌ `R$ 1.500,00` ✅ `1500`

### Status Válidos
- `Pendente`
- `Pago`
- `Recebido`
- `Atrasado`
- `Agendado`
- `Concluído`

### Tipos Válidos
- `Entrada`
- `Saída`

---

## Dicas de Performance

1. **Limite de linhas**: Mantenha no máximo 50.000 transações por planilha
2. **Arquive dados antigos**: Crie abas de histórico por ano
3. **Use Cache**: O sistema usa cache de 5 minutos
4. **Evite fórmulas complexas**: Use valores diretos quando possível
