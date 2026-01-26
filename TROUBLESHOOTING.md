# 🔧 Guia de Troubleshooting - Deploy Google Apps Script

## 🐛 Problemas Comuns e Soluções

---

## ❌ ERRO: "ReferenceError: self is not defined"

### **Causa:**
Arquivo JavaScript sendo executado no servidor (Google Apps Script) ao invés do navegador.

### **Solução Implementada:**
✅ Service Worker convertido para `.html` e servido dinamicamente
✅ Main.js atualizado para servir SW corretamente via query parameter `?file=sw`
✅ Manifest.json integrado no Main.js

### **Verificação:**
1. Certifique-se que `service-worker.html` existe (não `.js`)
2. Verifique que `Main.js` tem a função `doGet()` atualizada
3. Confirme que `JS_Init.html` registra SW com URL correta

---

## ❌ ERRO: "Cannot find function doGet"

### **Causa:**
Arquivo `Main.js` não foi criado ou está com nome errado.

### **Solução:**
1. Verifique que o arquivo se chama exatamente `Main.gs` (no Apps Script)
2. Conteúdo deve começar com:
```javascript
function doGet(e) {
  // ...
}
```

---

## ❌ ERRO: "Cannot find function include"

### **Causa:**
Função `include()` não está definida no Main.js.

### **Solução:**
Adicione ao `Main.js`:
```javascript
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

---

## ❌ ERRO: "ValidationService is not defined"

### **Causa:**
ValidationService.js sendo referenciado antes de ser carregado.

### **Solução Temporária (se necessário):**
Comente temporariamente a validação no `DataService.js`:

```javascript
// const validation = this.validateData({...});

return {
  config: config,
  accounts: accounts,
  transactions: transactions,
  goals: goals,
  lastUpdate: new Date().toISOString(),
  // validation: validation
};
```

### **Solução Definitiva:**
1. Copie o conteúdo de `ValidationService.js`
2. Cole DENTRO do arquivo `DataService.js` (no início)
3. Ou crie como `ValidationService.gs` separado no Apps Script

---

## ❌ ERRO: "Script function not found: testData"

### **Causa:**
Função testData() não existe ou está em arquivo não `.gs`.

### **Solução:**
Certifique-se que `Main.js` foi salvo como `Main.gs` no Apps Script e contém:
```javascript
function testData() {
  const data = DataService.fetchAllData();
  Logger.log(JSON.stringify(data.validation, null, 2));
}
```

---

## ❌ Manifest não carrega (PWA não instala)

### **Causa:**
Manifest não está sendo servido corretamente.

### **Verificação:**
1. Abra: `SUA_URL?file=manifest`
2. Deve retornar JSON do manifest
3. Se não funcionar, verifique função `doGet()` no Main.js

### **Solução:**
Confirme que Main.js tem:
```javascript
if (e.parameter && e.parameter.file === 'manifest') {
  const manifest = { /* ... */ };
  return ContentService.createTextOutput(JSON.stringify(manifest))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## ❌ Service Worker não registra

### **Causa:**
URL do Service Worker incorreta.

### **Verificação Console:**
Abra F12 no navegador e veja:
```
⚠️ Service Worker não registrado: [erro]
```

### **Solução:**
1. Verifique que `service-worker.html` existe
2. Teste acessar: `SUA_URL?file=sw`
3. Deve retornar código JavaScript do Service Worker

---

## ❌ Dados não carregam (tela branca)

### **Causa:**
Erro no Controller.js ao buscar dados.

### **Diagnóstico:**
1. Abra Console (F12)
2. Veja erro no console
3. Execute no Apps Script:
```javascript
function testData() {
  const data = DataService.fetchAllData();
  Logger.log(JSON.stringify(data, null, 2));
}
```

### **Erros Comuns:**
- ID da planilha errado
- Abas com nomes incorretos
- Permissões insuficientes
- Planilha foi deletada

---

## ❌ Planilha não encontrada

### **Erro Exato:**
"Exception: You do not have permission to access the requested document"

### **Soluções:**
1. **Verifique ID da planilha** em `Config.gs`
2. **Confirme permissões**: Abra planilha no navegador
3. **Re-autorize** o script:
   - Apps Script → Executar → testData()
   - Autorizar novamente

---

## ⚙️ Checklist de Deploy Completo

### **Arquivos Backend (.gs no Apps Script):**
- [ ] `Config.gs` - com ID correto da planilha
- [ ] `Main.gs` - função doGet() e include()
- [ ] `Controller.gs` - função getClientData()
- [ ] `DataService.gs` - leitura da planilha
- [ ] `CacheManager.gs` - cache do usuário
- [ ] `Utils.gs` - funções auxiliares
- [ ] `ValidationService.gs` - validação de dados

### **Arquivos Frontend (.html no Apps Script):**
- [ ] `index` (sem extensão)
- [ ] `styles`
- [ ] `service-worker`
- [ ] `JS_Core`
- [ ] `JS_Logic`
- [ ] `JS_EnhancedInsights`
- [ ] `JS_Components`
- [ ] `JS_Events`
- [ ] `JS_Render`
- [ ] `JS_Charts`
- [ ] `JS_Keyboard`
- [ ] `JS_Onboarding`
- [ ] `JS_Init`

### **Configuração:**
- [ ] Planilha ID configurado
- [ ] Abas criadas: CONFIG, CONTAS, TRANSACOES, CATEGORIAS, METAS
- [ ] Web App implantado
- [ ] Permissões autorizadas

---

## 🧪 Testes Pós-Deploy

### 1. **Teste Básico**
```
✅ Dashboard carrega
✅ Dados aparecem
✅ Gráficos renderizam
✅ Filtros funcionam
```

### 2. **Teste Service Worker**
```
✅ Console mostra: "Service Worker registrado"
✅ DevTools → Application → Service Workers mostra ativo
✅ Network mostra recursos sendo cacheados
```

### 3. **Teste PWA**
```
✅ Manifest carrega (DevTools → Application → Manifest)
✅ Prompt de instalação aparece
✅ Consegue instalar no mobile
```

### 4. **Teste Validação**
```
✅ Executar testData() no Apps Script
✅ Ver relatório de validação no Logger
✅ Console do dashboard mostra GLOBAL_DATA.validation
```

---

## 🔍 Como Debugar

### **No Google Apps Script:**

1. **Ver Logs:**
```javascript
function debug() {
  Logger.log('Teste');
}
```
Executar → Ver logs (Ctrl+Enter)

2. **Testar Funções:**
```javascript
function testConfig() {
  const id = getSpreadsheetId();
  Logger.log('ID: ' + id);
}
```

3. **Verificar Erros:**
Menu: Execuções (ver histórico de erros)

### **No Navegador:**

1. **Console (F12):**
```javascript
// Ver dados globais
console.log(GLOBAL_DATA);

// Ver validação
console.log(GLOBAL_DATA.validation);

// Forçar refresh
refreshDashboard();
```

2. **Network Tab:**
- Ver requisições para Apps Script
- Ver status codes (200 OK, 500 Error)
- Ver response JSON

3. **Application Tab:**
- Service Workers → Ver status
- Manifest → Ver configuração PWA
- Cache Storage → Ver recursos cacheados

---

## 🚨 Erros Críticos

### **ERRO: "Script is taking too long"**

**Causa:** Muitos dados (>10.000 transações)

**Solução:**
1. Arquivar transações antigas em outra aba
2. Otimizar DataService (usar ranges menores)
3. Implementar paginação no backend

### **ERRO: "Service invoked too many times"**

**Causa:** Muitas requisições simultâneas (limite: 30/segundo)

**Solução:**
1. Aumentar tempo de cache (de 10min para 30min)
2. Reduzir frequência de refresh automático
3. Implementar debounce em filtros

---

## 📞 Quando Pedir Ajuda

Entre em contato se:

1. ✅ Seguiu todos os passos do guia
2. ✅ Verificou checklist completo
3. ✅ Testou todas as soluções sugeridas
4. ❌ Erro persiste

**Forneça:**
- Screenshot do erro
- Console logs (F12)
- Apps Script logs (Logger)
- URL do Web App (pode mascarar ID)
- Descrição do que já tentou

---

## ✅ Verificação Final

Execute este checklist antes de considerar deploy completo:

```bash
✅ Web App implantado e URL funciona
✅ Dashboard carrega em <3 segundos
✅ testData() executa sem erros
✅ Validação retorna relatório correto
✅ Service Worker registra (console confirma)
✅ Manifest carrega (?file=manifest funciona)
✅ PWA instala no celular
✅ Modo offline mostra mensagem adequada
✅ Todos os atalhos de teclado funcionam
✅ Dark mode funciona
✅ Filtros aplicam corretamente
✅ Gráficos renderizam
✅ Export CSV funciona
✅ Export PDF funciona
```

---

**Versão**: 1.0  
**Última Atualização**: Janeiro 2025  
**Para**: Google Apps Script Deployment
