# 🚀 Guia Completo: Configuração do Sistema Multi-Cliente

## Visão Geral

Este guia vai te ajudar a configurar o sistema de dashboard financeiro para atender múltiplos clientes com **um único código**.

### O Que Você Vai Ter no Final:
- ✅ Um sistema central que atende todos os clientes
- ✅ Cada cliente acessa por uma URL única
- ✅ Atualizar o código UMA vez = todos atualizados
- ✅ Controle centralizado de planos e uso de IA

---

## 📋 Pré-requisitos

- [ ] Conta Google com acesso ao Google Apps Script
- [ ] Planilha ADMIN_MASTER já criada (você já fez isso ✅)
- [ ] Planilha(s) de dados dos clientes
- [ ] API Key da OpenAI (para funcionalidade de IA)

---

## PASSO 1: Criar o Projeto Central

### 1.1 Criar Novo Projeto Apps Script

1. Acesse: https://script.google.com
2. Clique em **"Novo projeto"**
3. Renomeie para: `Dashboard_Financeiro_Central`

### 1.2 Estrutura de Arquivos

No projeto, você vai criar os seguintes arquivos:

**Arquivos .gs (Backend):**
```
Main.gs
DataService.gs
AdminService.gs
AlertService.gs
CategorizationService.gs
ImportService.gs
ValidationService.gs
Config.gs
```

**Arquivos .html (Frontend):**
```
index.html
styles.html
service-worker.html
JS_Core.html
JS_Logic.html
JS_Render.html
JS_Charts.html
JS_Components.html
JS_Events.html
JS_Init.html
JS_FeatureFlags.html
JS_EnhancedInsights.html
JS_ChatAI.html
JS_Alerts.html
JS_Import.html
JS_Accounts.html
JS_Keyboard.html
JS_Onboarding.html
```

### 1.3 Como Criar os Arquivos

1. No editor do Apps Script, clique em **"+"** ao lado de "Arquivos"
2. Selecione **"Script"** para criar arquivos .gs
3. Selecione **"HTML"** para criar arquivos .html
4. Renomeie cada arquivo conforme a lista acima
5. Cole o conteúdo correspondente de cada arquivo

**IMPORTANTE:** 
- Arquivos `.js` do projeto devem ser salvos como `.gs`
- O conteúdo é o mesmo, só muda a extensão

---

## PASSO 2: Configurar o Config.gs

Crie o arquivo `Config.gs` com o seguinte conteúdo:

```javascript
// ===========================================
// CONFIGURAÇÃO CENTRAL
// ===========================================

// ID da planilha ADMIN_MASTER
// Cole aqui o ID da sua planilha admin
var ADMIN_MASTER_ID = 'COLE_O_ID_DA_SUA_PLANILHA_ADMIN_AQUI';

// Função para obter o ID da planilha do cliente atual
function getSpreadsheetId() {
  // Primeiro, tenta pegar do contexto multi-cliente
  var props = PropertiesService.getUserProperties();
  var clientSpreadsheetId = props.getProperty('CURRENT_SPREADSHEET_ID');
  
  if (clientSpreadsheetId) {
    return clientSpreadsheetId;
  }
  
  // Fallback: ID fixo para modo single-client (desenvolvimento)
  // Substitua pelo ID de uma planilha de teste
  return 'ID_PLANILHA_PADRAO_PARA_TESTES';
}

// Inicializa o AdminService com o ID correto
function initAdminService() {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('ADMIN_SPREADSHEET_ID', ADMIN_MASTER_ID);
}
```

### 2.1 Obter o ID da Planilha ADMIN_MASTER

O ID está na URL da planilha:
```
https://docs.google.com/spreadsheets/d/ESTE_TEXTO_É_O_ID/edit
```

Exemplo:
```
https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit
                                      ↑________________________↑
                                           Este é o ID
```

---

## PASSO 3: Configurar a Planilha ADMIN_MASTER

### 3.1 Verificar Abas Criadas

Sua planilha ADMIN_MASTER deve ter estas abas (já criadas):
- ✅ CLIENTES
- ✅ CONFIG_GLOBAL
- ✅ LOG_SISTEMA
- ✅ ALERTAS_PENDENTES

### 3.2 Preencher CONFIG_GLOBAL

Na aba `CONFIG_GLOBAL`, preencha:

| chave | valor |
|-------|-------|
| openai_api_key | sk-sua-chave-aqui |
| limite_ia_basic | 0 |
| limite_ia_professional | 30 |
| limite_ia_enterprise | -1 |
| email_admin | seu@email.com |
| versao_sistema | 3.3.0 |

### 3.3 Cadastrar Primeiro Cliente

Na aba `CLIENTES`, adicione uma linha:

| client_id | nome | spreadsheet_id | plano | status | data_inicio | data_vencimento | consultas_ia_mes | ultimo_acesso |
|-----------|------|----------------|-------|--------|-------------|-----------------|------------------|---------------|
| empresa_teste | Empresa Teste LTDA | COLE_O_ID_DA_PLANILHA_DO_CLIENTE | professional | ativo | 2025-01-01 | 2025-12-31 | 0 | |

**IMPORTANTE:** O `spreadsheet_id` é o ID da planilha de DADOS do cliente (não da ADMIN).

---

## PASSO 4: Configurar Planilha do Cliente

### 4.1 Estrutura Obrigatória

A planilha de dados de cada cliente precisa ter estas abas:

**Aba: CONFIG**
| Coluna A | Coluna B |
|----------|----------|
| Plano | professional |
| Nome | Nome da Empresa |
| CNPJ | 00.000.000/0001-00 |
| AI_API_KEY | (opcional, se não usar chave global) |

**Aba: BANCOS** (Onde o dinheiro FICA - contas bancárias)
| ID | Nome | Tipo | Saldo | Icone | Agencia | Conta_Numero |
|----|------|------|-------|-------|---------|--------------|
| 1 | Nubank | Digital | 10000 | 💜 | | |
| 2 | Inter | Digital | 5000 | 🧡 | | |
| 3 | Banco Principal | Corrente | 25000 | 🏦 | 0001 | 12345-6 |

**Aba: CONTAS** (Projetos/Centros de Custo - Para ONDE vai o dinheiro)
| ID | Nome | Tipo | Icone | Orcamento_Mensal |
|----|------|------|-------|------------------|
| 1 | MOTO | Veículo | 🏍️ | 1500 |
| 2 | CASA | Moradia | 🏠 | 3000 |
| 3 | EMPRESA CLIENTE | Cliente | 🏢 | 0 |

**Aba: TRANSACOES**
| Data | Tipo | Categoria | Subcategoria | Valor | Conta | Banco | Status | Descrição | Centro_Custo |
|------|------|-----------|--------------|-------|-------|-------|--------|-----------|--------------|
| 2025-01-15 | Saída | MOTO | FINANCIAMENTO | 800 | 1 | 1 | Pago | Parcela | Pessoal |
| 2025-01-15 | Saída | CASA | LUZ | 250 | 2 | 2 | Pendente | Conta de luz | Pessoal |
| 2025-01-15 | Entrada | EMPRESA CLIENTE | SERVIÇOS | 5000 | 3 | 1 | Recebido | Projeto | Comercial |

**IMPORTANTE - Entendendo a Hierarquia de Dados:**
```
BANCO (Nubank, Inter, BB...)     ← Onde o dinheiro ESTÁ
    └── CONTA/PROJETO (MOTO, CASA, EMPRESA X...)  ← Para ONDE vai / De onde vem
            └── TRANSAÇÃO (Parcela, Conta luz...)  ← O movimento em si
```

Uma mesma CONTA (ex: MOTO) pode ter transações em DIFERENTES BANCOS.

**Aba: CATEGORIAS**
| Categoria | Grupo_DRE |
|-----------|-----------|
| MOTO | Despesas Pessoais |
| CASA | Despesas Fixas |
| EMPRESA CLIENTE | Receita de Serviços |

**Aba: METAS**
| Categoria | Meta | Tipo |
|-----------|------|------|
| MOTO | 1500 | Gasto |
| CASA | 3000 | Gasto |
| EMPRESA CLIENTE | 10000 | Receita |

### 4.2 Script para Criar Estrutura Automaticamente

Execute isso na planilha do cliente para criar as abas:

```javascript
function criarEstruturaCliente() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // CONFIG
  var config = ss.getSheetByName('CONFIG') || ss.insertSheet('CONFIG');
  if (config.getLastRow() === 0) {
    config.getRange('A1:B4').setValues([
      ['Plano', 'professional'],
      ['Nome', 'Nome da Empresa'],
      ['CNPJ', ''],
      ['AI_API_KEY', '']
    ]);
  }
  
  // BANCOS (Onde o dinheiro fica)
  var bancos = ss.getSheetByName('BANCOS') || ss.insertSheet('BANCOS');
  if (bancos.getLastRow() === 0) {
    bancos.appendRow(['ID', 'Nome', 'Tipo', 'Saldo', 'Icone', 'Agencia', 'Conta_Numero']);
    bancos.getRange(1, 1, 1, 7).setBackground('#059669').setFontColor('#fff').setFontWeight('bold');
    bancos.setFrozenRows(1);
    // Exemplos
    bancos.appendRow([1, 'Nubank', 'Digital', 10000, '💜', '', '']);
    bancos.appendRow([2, 'Inter', 'Digital', 5000, '🧡', '', '']);
  }
  
  // CONTAS (Projetos/Centros de custo)
  var contas = ss.getSheetByName('CONTAS') || ss.insertSheet('CONTAS');
  if (contas.getLastRow() === 0) {
    contas.appendRow(['ID', 'Nome', 'Tipo', 'Icone', 'Orcamento_Mensal']);
    contas.getRange(1, 1, 1, 5).setBackground('#7c3aed').setFontColor('#fff').setFontWeight('bold');
    contas.setFrozenRows(1);
    // Exemplos
    contas.appendRow([1, 'MOTO', 'Veículo', '🏍️', 1500]);
    contas.appendRow([2, 'CASA', 'Moradia', '🏠', 3000]);
  }
  
  // TRANSACOES
  var trans = ss.getSheetByName('TRANSACOES') || ss.insertSheet('TRANSACOES');
  if (trans.getLastRow() === 0) {
    trans.appendRow(['Data', 'Tipo', 'Categoria', 'Subcategoria', 'Valor', 'Conta', 'Banco', 'Status', 'Descrição', 'Centro_Custo']);
    trans.getRange(1, 1, 1, 10).setBackground('#2563eb').setFontColor('#fff').setFontWeight('bold');
    trans.setFrozenRows(1);
    
    // Validação de Tipo
    var tipoRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Entrada', 'Saída'], true)
      .build();
    trans.getRange('B2:B1000').setDataValidation(tipoRule);
    
    // Validação de Status
    var statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Pendente', 'Pago', 'Recebido', 'Atrasado', 'Agendado', 'Concluído'], true)
      .build();
    trans.getRange('H2:H1000').setDataValidation(statusRule);
  }
  
  // CATEGORIAS
  var cats = ss.getSheetByName('CATEGORIAS') || ss.insertSheet('CATEGORIAS');
  if (cats.getLastRow() === 0) {
    cats.appendRow(['Categoria', 'Grupo_DRE']);
    cats.getRange(1, 1, 1, 2).setBackground('#dc2626').setFontColor('#fff').setFontWeight('bold');
  }
  
  // METAS
  var metas = ss.getSheetByName('METAS') || ss.insertSheet('METAS');
  if (metas.getLastRow() === 0) {
    metas.appendRow(['Categoria', 'Meta', 'Tipo']);
    metas.getRange(1, 1, 1, 3).setBackground('#f59e0b').setFontColor('#fff').setFontWeight('bold');
    
    var tipoMetaRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['Gasto', 'Receita'], true)
      .build();
    metas.getRange('C2:C1000').setDataValidation(tipoMetaRule);
  }
  
  // REGRAS_CATEGORIZACAO (para importação automática)
  var regras = ss.getSheetByName('REGRAS_CATEGORIZACAO') || ss.insertSheet('REGRAS_CATEGORIZACAO');
  if (regras.getLastRow() === 0) {
    regras.appendRow(['padrao', 'categoria', 'subcategoria', 'tipo']);
    regras.getRange(1, 1, 1, 4).setBackground('#ec4899').setFontColor('#fff').setFontWeight('bold');
    // Exemplos
    regras.appendRow(['pix recebido', 'EMPRESA CLIENTE', 'SERVIÇOS', 'Entrada']);
    regras.appendRow(['financiamento', 'MOTO', 'FINANCIAMENTO', 'Saída']);
    regras.appendRow(['energia', 'CASA', 'LUZ', 'Saída']);
  }
  
  // Remove aba padrão vazia
  try {
    var sheet1 = ss.getSheetByName('Sheet1') || ss.getSheetByName('Página1') || ss.getSheetByName('Planilha1');
    if (sheet1 && ss.getSheets().length > 1) {
      ss.deleteSheet(sheet1);
    }
  } catch (e) {}
  
  Logger.log('✅ Estrutura criada com sucesso!');
  Logger.log('📋 ID: ' + ss.getId());
  Logger.log('🔗 URL: ' + ss.getUrl());
}
```

---

## PASSO 5: Publicar o Web App

### 5.1 Fazer Deploy

1. No projeto Apps Script, clique em **"Implantar"** (Deploy)
2. Selecione **"Nova implantação"**
3. Configure:
   - **Tipo:** Web App
   - **Descrição:** Dashboard Financeiro v3.3
   - **Executar como:** Eu (seu email)
   - **Quem pode acessar:** Qualquer pessoa
4. Clique em **"Implantar"**
5. **COPIE A URL** que aparece (ela será algo como):
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

### 5.2 Autorizar Permissões

Na primeira vez, o Google vai pedir permissões:
1. Clique em "Revisar permissões"
2. Escolha sua conta
3. Clique em "Avançado" → "Acessar Dashboard_Financeiro_Central"
4. Permita o acesso

---

## PASSO 6: Testar o Sistema

### 6.1 URL de Acesso para Clientes

A URL final para cada cliente será:
```
https://script.google.com/macros/s/SEU_DEPLOY_ID/exec?client=CLIENT_ID
```

**Exemplo real:**
```
https://script.google.com/macros/s/AKfycbxABC123.../exec?client=empresa_teste
```

### 6.2 Testar

1. Abra a URL em uma aba anônima
2. O sistema deve:
   - Ler `client=empresa_teste` da URL
   - Buscar na ADMIN_MASTER o spreadsheet_id
   - Carregar os dados da planilha do cliente
   - Mostrar o dashboard

---

## PASSO 7: Adicionar Mais Clientes

### 7.1 Para Cada Novo Cliente:

1. **Crie a planilha de dados** (ou duplique uma existente)
2. **Execute** `criarEstruturaCliente()` na planilha
3. **Preencha os dados** (contas, transações, etc.)
4. **Cadastre na ADMIN_MASTER** (aba CLIENTES):
   - Escolha um `client_id` único
   - Cole o `spreadsheet_id` da planilha
   - Defina o plano
5. **Compartilhe a URL** com o cliente:
   ```
   https://script.google.com/.../exec?client=NOVO_CLIENT_ID
   ```

---

## 📊 Resumo Visual

```
VOCÊ (Administrador)
       │
       │ Gerencia
       ▼
┌─────────────────────────────────────────────────────────┐
│                    ADMIN_MASTER                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ CLIENTES:                                        │    │
│  │ cliente_a → planilha_123 → professional         │    │
│  │ cliente_b → planilha_456 → enterprise           │    │
│  │ cliente_c → planilha_789 → basic                │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                          │
                          │
┌─────────────────────────────────────────────────────────┐
│              PROJETO APPS SCRIPT                         │
│                  (código único)                          │
│                                                          │
│    Publicado como Web App:                               │
│    https://script.google.com/.../exec                    │
└─────────────────────────────────────────────────────────┘
                          │
      ┌───────────────────┼───────────────────┐
      ▼                   ▼                   ▼
   ?client=a          ?client=b          ?client=c
      │                   │                   │
      ▼                   ▼                   ▼
┌──────────┐       ┌──────────┐       ┌──────────┐
│Planilha A│       │Planilha B│       │Planilha C│
│ (dados)  │       │ (dados)  │       │ (dados)  │
└──────────┘       └──────────┘       └──────────┘
```

---

## ❓ FAQ - Perguntas Frequentes

### "Preciso colocar código na planilha do cliente?"
**NÃO.** O código fica APENAS no projeto central. As planilhas dos clientes só têm dados.

### "Como atualizo o sistema para todos os clientes?"
1. Edite o código no projeto Apps Script
2. Clique em "Implantar" → "Gerenciar implantações"
3. Edite a implantação existente → Nova versão
4. Pronto! Todos os clientes acessam a nova versão.

### "O cliente pode acessar direto pela planilha?"
**NÃO.** O cliente acessa pela URL do Web App (`?client=xxx`), não pela planilha.

### "E se eu não quiser usar multi-cliente?"
Você pode continuar usando o sistema antigo (uma planilha com código para cada cliente). O multi-cliente é opcional.

### "Posso ter clientes com planos diferentes?"
**SIM!** Cada cliente tem seu plano definido na ADMIN_MASTER. As funcionalidades aparecem/escondem baseado no plano.

---

## ✅ Checklist Final

- [ ] Projeto Apps Script criado com todos os arquivos
- [ ] Config.gs com ID da ADMIN_MASTER
- [ ] ADMIN_MASTER com CONFIG_GLOBAL preenchida
- [ ] Pelo menos 1 cliente cadastrado na aba CLIENTES
- [ ] Planilha do cliente com estrutura correta
- [ ] Web App publicado
- [ ] URL testada e funcionando

---

## 🆘 Problemas Comuns

### Erro: "Cliente não encontrado"
- Verifique se o `client_id` na URL está correto
- Verifique se o cliente está cadastrado na ADMIN_MASTER
- Verifique se o `status` é "ativo"

### Erro: "Não foi possível abrir a planilha"
- Verifique se o `spreadsheet_id` está correto
- Verifique se o projeto Apps Script tem permissão para acessar a planilha

### Dashboard vazio
- Verifique se a planilha do cliente tem dados
- Verifique se as abas têm os nomes corretos (TRANSACOES, CONTAS, etc.)

---

*Guia criado em Dezembro 2025 - Versão 3.3.0*
