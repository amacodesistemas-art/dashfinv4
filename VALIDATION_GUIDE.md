# 🛡️ Guia de Validação de Dados - Equipe de Consultoria

## 📋 O que é a Validação?

O sistema agora valida automaticamente todos os dados da planilha Google Sheets antes de exibi-los no dashboard. Isso ajuda a detectar erros de digitação e garantir integridade dos dados.

---

## ✅ O que é Validado

### 1. **CONTAS** (Aba CONTAS)

| Campo | Validação | Exemplo Válido | ❌ Erro Comum |
|-------|-----------|----------------|---------------|
| ID | Obrigatório, texto | `acc_01` | Vazio |
| Nome | Obrigatório, texto | `Nubank` | Vazio |
| Tipo | Obrigatório, texto | `Conta Corrente` | Vazio |
| Saldo | Obrigatório, número | `5000` | Texto como "cinco mil" |
| Ícone | Opcional, texto | `💳` | - |

### 2. **TRANSAÇÕES** (Aba TRANSACOES)

| Campo | Validação | Exemplo Válido | ❌ Erro Comum |
|-------|-----------|----------------|---------------|
| Data | Obrigatório, formato YYYY-MM-DD | `2025-01-15` | `15/01/2025` |
| Tipo | Obrigatório, "Entrada" ou "Saída" | `Entrada` | `entrada` (minúsculo) |
| Categoria | Obrigatório, texto | `Vendas` | Vazio |
| Subcategoria | Opcional, texto | `Consultoria` | - |
| Valor | Obrigatório, número ≥ 0 | `1000` | Negativo ou texto |
| Conta (ID) | Obrigatório, texto | `acc_01` | ID inexistente |
| Status | Obrigatório, texto | `Pago` | Vazio |
| Descrição | Obrigatório, texto | `Cliente ABC` | Vazio |
| Centro de Custo | Opcional, texto | `SP` | - |

### 3. **METAS** (Aba METAS)

| Campo | Validação | Exemplo Válido | ❌ Erro Comum |
|-------|-----------|----------------|---------------|
| Categoria | Obrigatório, texto | `Marketing` | Vazio |
| Meta | Obrigatório, número ≥ 0 | `5000` | Negativo |
| Cor Alerta | Opcional, texto | `warning` | - |
| Tipo | Obrigatório, "Gasto" ou "Objetivo" | `Gasto` | `gasto` (minúsculo) |

---

## 🔍 Como Ver o Relatório de Validação

### Método 1: Console do Google Apps Script

1. Abra o projeto no Apps Script
2. Selecione função: `testData`
3. Clique em "Executar"
4. Veja logs (Ctrl+Enter ou ⌘+Enter)

**Exemplo de output:**
```javascript
{
  "valid": false,
  "errors": [
    "Conta 3 (Banco X): Campo obrigatório ausente: balance"
  ],
  "warnings": [
    "Transação linha 15: value deve ser número, recebido: string",
    "Transação linha 28: type deve ser um dos valores: Entrada, Saída"
  ],
  "stats": {
    "totalTransactions": 1250,
    "validTransactions": 1248,
    "totalAccounts": 5,
    "validAccounts": 4
  }
}
```

### Método 2: Console do Navegador (Dashboard)

1. Abra o dashboard
2. Pressione F12 (abre console)
3. Digite: `console.log(GLOBAL_DATA.validation)`
4. Enter

---

## 🚨 Tipos de Problemas

### 🔴 **ERROS (Críticos)**

Impedem funcionamento correto. **Corrija imediatamente!**

**Exemplos:**
- ❌ "Conta 2: Campo obrigatório ausente: id"
- ❌ "Conta 3: balance deve ser número, recebido: string"

**Como corrigir:**
1. Vá para a aba CONTAS
2. Localize linha com problema
3. Preencha campo faltando ou corrija tipo

### ⚠️ **WARNINGS (Avisos)**

Não impedem funcionamento, mas indicam dados estranhos.

**Exemplos:**
- ⚠️ "Transação linha 45: type deve ser um dos valores: Entrada, Saída. Recebido: entrada"
- ⚠️ "Meta 2: meta deve ser >= 0"

**Como corrigir:**
1. Vá para aba indicada
2. Localize linha (número mostrado é a linha da planilha)
3. Ajuste valor

---

## 📝 Checklist Diário

### Ao Adicionar Dados:

- [ ] Data no formato `YYYY-MM-DD` (ex: 2025-01-15)
- [ ] Tipo com inicial maiúscula: `Entrada` ou `Saída`
- [ ] Valor é número (sem R$, pontos ou vírgulas)
- [ ] Status preenchido: `Pago`, `Pendente`, etc.
- [ ] Descrição não está vazia
- [ ] ID da conta existe na aba CONTAS

### Verificação Semanal:

- [ ] Executar `testData()` no Apps Script
- [ ] Verificar se `valid: true`
- [ ] Se há warnings, revisar linhas indicadas
- [ ] Corrigir erros críticos imediatamente

---

## 🔧 Problemas Comuns e Soluções

### ❌ "date deve estar no formato YYYY-MM-DD"

**Problema:** Data está como `15/01/2025` ou `15-01-2025`

**Solução:**
1. Selecione coluna de data
2. Formatar → Número → Data (`YYYY-MM-DD`)
3. Ou digite manualmente: `2025-01-15`

### ❌ "value deve ser número"

**Problema:** Valor está como texto: `"1.000,00"` ou `"R$ 1000"`

**Solução:**
1. Remova R$, pontos e símbolos
2. Use ponto para decimal: `1000.50`
3. Não use vírgulas ou separadores de milhares

### ❌ "type deve ser um dos valores: Entrada, Saída"

**Problema:** Tipo está minúsculo ou com acento: `entrada`, `saida`, `Saida`

**Solução:**
Use EXATAMENTE:
- `Entrada` (E maiúsculo, sem acento)
- `Saída` (S maiúsculo, COM acento)

### ❌ "Campo obrigatório ausente"

**Problema:** Célula está vazia

**Solução:**
1. Preencha a célula
2. Se não sabe o valor, use:
   - Descrição: "Não informado"
   - Status: "Pendente"
   - Categoria: "Outros"

---

## 💡 Boas Práticas

### 1. **Padronização de Categorias**

✅ Use sempre as mesmas categorias:
- `Vendas`, `Marketing`, `Administrativo`, `RH`, etc.

❌ Evite variações:
- `Marketing`, `marketin`, `Marketing Digital`, `Mkt`

### 2. **IDs de Contas Consistentes**

✅ Use prefixo + número:
- `acc_01`, `acc_02`, `acc_03`

❌ Evite IDs aleatórios:
- `conta1`, `banco_nubank`, `123`

### 3. **Status Padronizados**

✅ Use apenas:
- `Pago`, `Pendente`, `Cancelado`, `Agendado`

❌ Evite variações:
- `pago`, `PAGO`, `Já pago`, `Pagamento efetuado`

### 4. **Formato de Datas**

✅ Configure coluna para formato ISO:
- Menu: Formatar → Número → Data → `YYYY-MM-DD`

### 5. **Backup Regular**

- Faça cópia da planilha semanalmente
- Nomeie: `Cliente_YYYY-MM-DD`
- Guarde em pasta do Google Drive

---

## 📊 Interpretando o Relatório

### Exemplo de Relatório Bom ✅

```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "stats": {
    "totalTransactions": 1250,
    "validTransactions": 1250,
    "totalAccounts": 5,
    "validAccounts": 5,
    "totalGoals": 8,
    "validGoals": 8
  }
}
```

**Interpretação:** Tudo OK! 100% dos dados válidos.

### Exemplo de Relatório com Problemas ⚠️

```json
{
  "valid": false,
  "errors": [
    "Conta 3 (Investimentos): balance deve ser número"
  ],
  "warnings": [
    "Transação linha 45: type deve ser Entrada ou Saída",
    "Meta 2: meta deve ser >= 0"
  ],
  "stats": {
    "totalTransactions": 1250,
    "validTransactions": 1248,
    "totalAccounts": 5,
    "validAccounts": 4,
    "totalGoals": 8,
    "validGoals": 7
  }
}
```

**Interpretação:** 
- 1 erro crítico na conta 3 (corrigir urgente!)
- 2 avisos (revisar quando possível)
- 99,8% das transações válidas (ótimo!)
- 1 conta com problema
- 1 meta com problema

---

## 🎯 Metas de Qualidade

### Objetivo Ideal:
- ✅ `valid: true`
- ✅ Zero erros
- ✅ Zero warnings
- ✅ 100% dados válidos

### Aceitável:
- ⚠️ `valid: false` (mas sem erros críticos)
- ⚠️ Até 5 warnings
- ⚠️ >98% dados válidos

### Inaceitável (Corrigir Urgente):
- 🔴 Erros críticos presentes
- 🔴 >10 warnings
- 🔴 <95% dados válidos

---

## 📞 Quando Solicitar Suporte Técnico

Entre em contato com suporte se:

1. **Validação consistentemente falha** mesmo após correções
2. **Erros incompreensíveis** que não consegue resolver
3. **Performance ruim** (carregamento lento)
4. **Cliente relata problemas** no dashboard

**Forneça ao suporte:**
- Screenshot do relatório de validação
- Link da planilha (com permissão de visualização)
- Descrição do problema
- Passos já tentados para resolver

---

## 🔄 Processo Recomendado

### Fluxo de Trabalho Semanal:

**Segunda-feira:**
1. Inserir transações da semana anterior
2. Atualizar saldos das contas
3. Executar `testData()` para validar
4. Corrigir erros encontrados

**Quarta-feira:**
5. Revisar metas (ajustar se necessário)
6. Verificar se há warnings pendentes
7. Fazer backup da planilha

**Sexta-feira:**
8. Validação final da semana
9. Confirmar que dashboard está OK
10. Notificar cliente se houver insights importantes

---

## ✅ Checklist de Qualidade

Antes de finalizar entrada de dados:

- [ ] Todas as datas no formato correto
- [ ] Tipos com inicial maiúscula
- [ ] Valores são números puros
- [ ] Sem células vazias obrigatórias
- [ ] IDs de contas existem
- [ ] Categorias padronizadas
- [ ] Executei `testData()` e está OK
- [ ] Dashboard carrega sem erros
- [ ] Cliente pode visualizar normalmente

---

**Versão**: 1.0  
**Última Atualização**: Janeiro 2025  
**Para**: Equipe de Consultoria Financeira
