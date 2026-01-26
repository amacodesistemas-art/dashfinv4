# 🚀 Guia de Implantação - Dashboard Financeiro B2B

## Passo a Passo para Deploy no Google Apps Script

### 1️⃣ Preparação da Planilha Google Sheets

1. **Criar nova planilha** ou use uma existente
2. **Criar as seguintes abas** (nomes exatos):
   - `CONFIG`
   - `CONTAS`
   - `TRANSACOES`
   - `CATEGORIAS`
   - `METAS`

3. **Copie o ID da planilha** da URL:
   ```
   https://docs.google.com/spreadsheets/d/[ESTE_É_O_ID]/edit
   ```

### 2️⃣ Criar Projeto no Google Apps Script

1. Acesse [script.google.com](https://script.google.com)
2. Clique em **"Novo projeto"**
3. Renomeie para: `Dashboard Financeiro B2B`

### 3️⃣ Criar Arquivos do Backend (.gs)

Crie os seguintes arquivos `.gs` no Apps Script:

#### Arquivo: `Config.gs`
```javascript
// Cole o conteúdo de Config.js
```

#### Arquivo: `Main.gs`
```javascript
// Cole o conteúdo de Main.js
```

#### Arquivo: `Controller.gs`
```javascript
// Cole o conteúdo de Controller.js
```

#### Arquivo: `DataService.gs`
```javascript
// Cole o conteúdo de DataService.js
```

#### Arquivo: `CacheManager.gs`
```javascript
// Cole o conteúdo de CacheManager.js
```

#### Arquivo: `Utils.gs`
```javascript
// Cole o conteúdo de Utils.js
```

### 4️⃣ Criar Arquivos do Frontend (.html)

Crie os seguintes arquivos `.html` no Apps Script:

1. `index` (sem extensão)
2. `styles`
3. `JS_Core`
4. `JS_Logic`
5. `JS_EnhancedInsights`
6. `JS_Events`
7. `JS_Render`
8. `JS_Charts`
9. `JS_Keyboard`
10. `JS_Onboarding`
11. `JS_Init`

### 5️⃣ Configurar o ID da Planilha

No arquivo `Config.gs`, atualize:

```javascript
function getSpreadsheetId() {
  return 'SEU_ID_DA_PLANILHA_AQUI';
}
```

### 6️⃣ Testar Localmente

No editor do Apps Script:

1. Selecione a função: `testData`
2. Clique em **"Executar"**
3. Autorize as permissões quando solicitado
4. Verifique os logs (Ctrl+Enter)

### 7️⃣ Implantar como Web App

1. Clique em **"Implantar"** > **"Nova implantação"**
2. Configurações:
   - **Tipo**: Aplicativo da web
   - **Descrição**: Dashboard Financeiro v3.0
   - **Executar como**: Eu (seu email)
   - **Quem tem acesso**: 
     - Para uso interno: "Qualquer pessoa na [sua organização]"
     - Para clientes: "Qualquer pessoa"
3. Clique em **"Implantar"**
4. **Copie a URL do Web App**

### 8️⃣ Verificação de Deploy

Acesse a URL gerada. Você deve ver:

✅ Dashboard carregando
✅ Ícones Lucide renderizados
✅ Dados da planilha exibidos
✅ Tema claro/escuro funcionando
✅ Gráficos renderizados

### 9️⃣ Configurar Domínio Personalizado (Opcional)

Se quiser usar um domínio próprio:

1. Use serviços como [Bitly](https://bitly.com) para encurtar URL
2. Ou configure redirect no seu servidor web
3. Ou use Google Cloud Platform para domínio customizado

---

## ⚙️ Configuração Avançada

### Alterar Tempo de Cache

Em `Config.gs`:
```javascript
function getCacheConfig() {
  return {
    key: 'dashboard_data_v3',
    expiration: 600 // Altere para segundos desejados
  };
}
```

### Adicionar Novos Clientes

1. Duplique o projeto no Apps Script
2. Altere o ID da planilha em `Config.gs`
3. Reimplante como nova Web App

### Atualização de Versão

Quando atualizar o código:

1. Faça as alterações necessárias
2. Vá em **"Implantar"** > **"Gerenciar implantações"**
3. Clique no ícone de edição (lápis)
4. **Nova versão**: Selecione
5. Descrição: "v3.1 - [descrição da mudança]"
6. **"Implantar"**

**Nota**: A URL permanece a mesma!

---

## 🔧 Troubleshooting de Deploy

### Erro: "Script function not found: doGet"

**Causa**: Arquivo Main.gs não foi criado ou está com nome errado

**Solução**: 
1. Verifique se o arquivo se chama exatamente `Main.gs`
2. Confirme que contém a função `doGet()`

### Erro: "Exception: Você não tem permissão para acessar esta planilha"

**Causa**: ID da planilha errado ou sem permissão

**Solução**:
1. Verifique o ID em `Config.gs`
2. Abra a planilha no navegador e confirme acesso
3. Reimplante o Web App

### Erro: "TypeError: Cannot read property 'transactions' of null"

**Causa**: Abas da planilha não estão nomeadas corretamente

**Solução**:
1. Confirme que todas as 5 abas existem
2. Nomes EXATOS: CONFIG, CONTAS, TRANSACOES, CATEGORIAS, METAS
3. Execute `testData()` para ver o erro específico

### Página em branco ao acessar

**Causa**: CDN bloqueado ou erro de JavaScript

**Solução**:
1. Abra Console do navegador (F12)
2. Verifique erros
3. Confirme que CDNs estão acessíveis:
   - Tailwind CSS
   - Chart.js
   - Lucide Icons

### Gráficos não renderizam

**Causa**: Chart.js não carregou ou dados vazios

**Solução**:
1. Verifique se há transações na planilha
2. Abra console e veja erros
3. Confirme que `GLOBAL_DATA.transactions` tem dados

---

## 📋 Checklist Pré-Deploy

- [ ] Planilha criada com 5 abas
- [ ] ID da planilha configurado em `Config.gs`
- [ ] Todos os 6 arquivos `.gs` criados
- [ ] Todos os 11 arquivos `.html` criados
- [ ] Função `testData()` executada com sucesso
- [ ] Permissões do Google autorizadas
- [ ] Web App implantado
- [ ] URL copiada e testada
- [ ] Dashboard carrega corretamente
- [ ] Dados aparecem na tela
- [ ] Gráficos renderizam
- [ ] Filtros funcionam
- [ ] Modo escuro funciona
- [ ] Onboarding aparece na primeira visita

---

## 🔐 Segurança Pós-Deploy

1. **Não compartilhe** o código-fonte publicamente
2. **Limite acesso** na implantação (apenas sua organização)
3. **Monitore** logs de execução no Apps Script
4. **Backup** regular da planilha
5. **Versionamento** no Git (código apenas, sem dados sensíveis)

---

## 📊 Monitoramento

### Quotas do Google Apps Script

- **Tempo de execução**: 6 min/execução
- **Tamanho do cache**: 100 KB por usuário
- **Requisições simultâneas**: 30/segundo

Monitore em: Apps Script > Execuções

### Métricas de Uso

Acompanhe:
- Número de acessos diários
- Tempo médio de carregamento
- Erros reportados
- Feedback dos usuários

---

## 🎓 Treinamento de Usuários

Após deploy, envie para usuários:

1. **URL do Dashboard**
2. **Credenciais** (se aplicável)
3. **Link para README.md** (documentação)
4. **Vídeo tutorial** (opcional, mas recomendado)
5. **Atalhos de teclado** (impressos)

---

## ✅ Deploy Completo!

Seu Dashboard Financeiro B2B está pronto para uso!

**Próximos passos**:
- Teste com usuários reais
- Colete feedback
- Implemente melhorias contínuas
- Mantenha dados atualizados

**Suporte**: Consulte README.md para troubleshooting adicional.
