# 🔧 Troubleshooting: Plano Sempre Aparece como "Básico"

## ✅ Solução Implementada

O sistema de planos foi **integrado diretamente no DataService.js** para evitar problemas de dependência.

---

## 🧪 Como Testar Agora

### **Passo 1: Verificar Planilha CONFIG**

Na sua planilha Google Sheets, aba **CONFIG**, deve ter:

```
A           B
---------------------
plano       intermediário
```

**⚠️ IMPORTANTE:**
- Coluna A: exatamente `plano` (sem acentos, minúsculo)
- Coluna B: pode ser `intermediário`, `intermediario`, `intermediate`

**Variações aceitas (Coluna B):**
- Básico: `básico`, `basico`, `basic`
- Intermediário: `intermediário`, `intermediario`, `intermediate`
- Avançado: `avançado`, `avancado`, `advanced`

---

### **Passo 2: Executar Teste no Apps Script**

1. Abra Google Apps Script
2. Selecione função: **`testPlans`**
3. Clique em **"Executar"**
4. Veja os logs (Ctrl+Enter ou ⌘+Enter)

**Output esperado:**
```
=== TESTE DE PLANOS ===
[Plans] Linha 1: key="nome_cliente", value="empresa xyz"
[Plans] Linha 2: key="cnpj", value="12.345.678/0001-99"
[Plans] Linha 3: key="plano", value="intermediário"
[Plans] Encontrou linha de plano: intermediário
[Plans] Detectado: INTERMEDIATE
Plano detectado: intermediate
Nome do plano: Intermediário
Preço: R$ 197/mês

Features Disponíveis:
  ✓ dashboard
  ✓ filters
  ✓ export_csv
  ✓ export_pdf
  ✓ charts
  ✓ goals
  ✓ accounts
  ✓ insights_basic
  ✓ dre                  ← DEVE ESTAR MARCADO!
  ✗ ai_classification
  ✗ ai_insights
  ✗ predictive_analytics
```

---

### **Passo 3: Reimplantar Web App**

Depois de confirmar que o teste funciona:

1. Apps Script → **Implantar** → **Gerenciar implantações**
2. Clique no ícone de **edição** (lápis)
3. **Nova versão**
4. Descrição: `Fix: Sistema de planos integrado`
5. **Implantar**

---

### **Passo 4: Verificar no Dashboard**

1. Abra o dashboard
2. **Limpe o cache**: F12 → Application → Storage → Clear site data
3. Recarregue a página (Ctrl+R ou F5)
4. Verifique:
   - Badge deve mostrar: `⭐ Intermediário`
   - Toggle "Caixa / DRE Gerencial" deve aparecer

---

## 🔍 Diagnóstico de Problemas

### **Problema 1: Ainda aparece "Básico"**

**Diagnóstico:**
```javascript
// No console do navegador (F12)
console.log('Plano:', GLOBAL_DATA.plan);
```

**Se retornar:**
```javascript
{
  plan: "basic",
  name: "Básico",
  features: { dre: false, ... }
}
```

**Causa:** Planilha CONFIG não tem linha `plano` ou está escrita errado.

**Solução:**
1. Verifique se aba se chama **exatamente** `CONFIG` (maiúsculas)
2. Verifique se linha tem `plano` na coluna A
3. Verifique se não tem espaços extras: `" plano "` ❌ vs `"plano"` ✅

---

### **Problema 2: Erro ao executar `testPlans()`**

**Erro:** `Cannot find function getClientPlan`

**Solução:**
1. Copie o **DataService.js atualizado** para o Apps Script
2. Certifique-se que salvou como `DataService.gs`
3. Execute `testPlans()` novamente

---

### **Problema 3: Toggle DRE não aparece**

**Diagnóstico:**
```javascript
// Console do navegador (F12)
console.log('DRE disponível?', hasFeature('dre'));
```

**Se retornar `false`:**

**Causa 1:** Plano ainda é Basic
- Execute `testPlans()` no Apps Script
- Confirme que detecta `INTERMEDIATE`

**Causa 2:** Frontend não atualizou
- Limpe cache (F12 → Application → Clear storage)
- Reimplante Web App como nova versão

---

## 📋 Checklist de Verificação

Execute em ordem:

- [ ] **Planilha:** CONFIG tem linha `plano | intermediário`
- [ ] **Apps Script:** Executar `testPlans()` retorna `INTERMEDIATE`
- [ ] **Apps Script:** Logs mostram "Detectado: INTERMEDIATE"
- [ ] **Deploy:** Reimplantar como nova versão
- [ ] **Navegador:** Limpar cache e recarregar
- [ ] **Dashboard:** Badge mostra "⭐ Intermediário"
- [ ] **Dashboard:** Toggle DRE aparece
- [ ] **Console:** `GLOBAL_DATA.plan.plan === 'intermediate'`
- [ ] **Console:** `hasFeature('dre') === true`

---

## 🎯 Formato Correto da CONFIG

### **Exemplo Completo:**

| A | B |
|---|---|
| nome_cliente | Empresa ABC |
| cnpj | 12.345.678/0001-99 |
| plano | intermediário |
| ai_api_key | sk-proj-... (apenas se Avançado) |

### **❌ Erros Comuns:**

```
A              B
--------------------------
Plano          intermediário    ← ERRADO (P maiúsculo)
plano          Intermediário    ← OK (funciona)
 plano         intermediário    ← ERRADO (espaço antes)
plano          inter            ← ERRADO (nome incompleto)
plan           intermediate     ← OK (aceita inglês)
```

---

## 🚀 Comando Rápido de Teste

Execute no Apps Script para ver tudo de uma vez:

```javascript
function testComplete() {
  Logger.log('=== TESTE COMPLETO ===\n');
  
  // 1. Testa leitura da planilha
  const ss = SpreadsheetApp.openById(getSpreadsheetId());
  const configSheet = ss.getSheetByName('CONFIG');
  const data = configSheet.getRange('A:B').getValues();
  
  Logger.log('Conteúdo da CONFIG:');
  for (let i = 0; i < Math.min(10, data.length); i++) {
    if (data[i][0]) {
      Logger.log('  ' + data[i][0] + ' = ' + data[i][1]);
    }
  }
  
  // 2. Testa detecção de plano
  const plan = DataService.getClientPlan(ss);
  Logger.log('\nPlano detectado: ' + plan);
  
  // 3. Testa info do plano
  const planInfo = DataService.getPlanInfo(plan);
  Logger.log('Nome: ' + planInfo.name);
  Logger.log('DRE disponível? ' + planInfo.features.dre);
  
  // 4. Testa fetchAllData
  const allData = DataService.fetchAllData();
  Logger.log('\nPlano no fetchAllData: ' + allData.plan.plan);
  Logger.log('Nome no fetchAllData: ' + allData.plan.name);
}
```

---

## 📞 Se Ainda Não Funcionar

Envie para suporte:

1. **Screenshot da aba CONFIG**
2. **Logs do `testPlans()`** (copie tudo)
3. **Console do navegador** (F12 → copie `GLOBAL_DATA.plan`)
4. **Qual plano deveria ser** vs **qual está aparecendo**

---

**Versão**: 1.0  
**Data**: Janeiro 2025  
**Status**: Sistema Integrado no DataService.js
