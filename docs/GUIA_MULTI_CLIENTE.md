# 📋 Guia de Configuração Multi-Cliente

## Visão Geral

Este guia explica como configurar o sistema para gerenciar múltiplos clientes com uma única instalação do código.

## Passo 1: Criar Planilha Admin Master

Execute a função `createAdminStructure()` no Google Apps Script:

```javascript
function createAdminStructure() {
  // Esta função cria automaticamente a planilha ADMIN_DASHBOARD_MASTER
}
```

Ou crie manualmente uma planilha com as seguintes abas:

### Aba: CLIENTES
| client_id | nome | spreadsheet_id | plano | status | data_inicio | data_vencimento | consultas_ia_mes | ultimo_acesso |
|-----------|------|----------------|-------|--------|-------------|-----------------|------------------|---------------|
| acme_001 | ACME Corp | 1abc123... | enterprise | ativo | 2025-01-01 | 2025-12-31 | 0 | |

### Aba: CONFIG_GLOBAL
| chave | valor |
|-------|-------|
| openai_api_key | sk-xxx |
| limite_ia_basic | 0 |
| limite_ia_professional | 30 |
| limite_ia_enterprise | -1 |
| email_admin | admin@empresa.com |
| versao_sistema | 3.2.0 |

### Aba: LOG_SISTEMA
| timestamp | client_id | acao | detalhes |
|-----------|-----------|------|----------|

### Aba: ALERTAS_PENDENTES
| timestamp | client_id | tipo | mensagem | valor | enviado |
|-----------|-----------|------|----------|-------|---------|

## Passo 2: Configurar ID da Planilha Admin

Após criar a planilha, copie o ID dela (da URL) e execute:

```javascript
function setup() {
  setupAdminSpreadsheet('ID_DA_PLANILHA_ADMIN');
}
```

## Passo 3: Criar Planilhas dos Clientes

Para cada cliente, crie uma planilha com as abas padrão:

- CONFIG
- CONTAS
- TRANSACOES
- CATEGORIAS
- METAS

## Passo 4: Registrar Clientes

Na aba CLIENTES da planilha Admin, adicione uma linha para cada cliente:

| Campo | Descrição |
|-------|-----------|
| client_id | ID único (ex: `empresa_001`) |
| nome | Nome da empresa |
| spreadsheet_id | ID da planilha de dados do cliente |
| plano | `basic`, `professional` ou `enterprise` |
| status | `ativo`, `suspenso` ou `cancelado` |
| data_inicio | Data de início do contrato |
| data_vencimento | Data de vencimento (opcional) |
| consultas_ia_mes | Iniciar com 0 |
| ultimo_acesso | Deixar vazio |

## Passo 5: Acessar Dashboard

Cada cliente acessa seu dashboard através de uma URL personalizada:

```
https://script.google.com/macros/s/DEPLOY_ID/exec?client=CLIENT_ID
```

Exemplo:
```
https://script.google.com/macros/s/AKfycbx.../exec?client=acme_001
```

## Atualização de Código

### Vantagem Principal

Com a arquitetura multi-cliente, quando você atualiza o código no Google Apps Script e faz um novo deploy:

1. **Todos os clientes** recebem a atualização automaticamente
2. **Não precisa** atualizar cada projeto individualmente
3. **Um deploy** = todos atualizados

### Como Atualizar

1. Edite o código no projeto Google Apps Script
2. Clique em "Deploy" > "Manage deployments"
3. Edite o deployment existente ou crie um novo
4. Todos os clientes usando aquela URL serão atualizados

## Monitoramento

### Ver Log de Acessos

A aba LOG_SISTEMA registra automaticamente:
- Logins de clientes
- Consultas de IA
- Erros

### Resetar Contadores de IA

Execute mensalmente (ou configure um trigger):

```javascript
function monthlyReset() {
  AdminService.resetMonthlyAICounters();
}
```

### Configurar Trigger Mensal

No Google Apps Script:
1. Vá em "Triggers" (ícone do relógio)
2. Adicione um trigger
3. Função: `monthlyReset`
4. Tipo: Time-driven
5. Frequência: Monthly

## Estrutura de URLs

| URL | Descrição |
|-----|-----------|
| `.../exec?client=ID` | Dashboard do cliente |
| `.../exec?client=ID&file=sw` | Service Worker |
| `.../exec?client=ID&file=manifest` | PWA Manifest |

## Segurança

### Recomendações

1. **Não exponha** os IDs das planilhas
2. **Use client_id** que não seja facilmente adivinhável
3. **Monitore** o LOG_SISTEMA regularmente
4. **Desative** clientes inadimplentes mudando status para `suspenso`

### Controle de Acesso

O sistema verifica automaticamente:
- Se o `client_id` existe
- Se o cliente está `ativo`
- Se não excedeu o limite de IA (para planos com limite)

## Troubleshooting

### Erro: "Cliente não encontrado"
- Verifique se o `client_id` está correto na URL
- Verifique se o cliente existe na aba CLIENTES

### Erro: "Acesso Bloqueado"
- Cliente pode estar com status `suspenso` ou `cancelado`
- Verifique a aba CLIENTES

### Dados não carregam
- Verifique se o `spreadsheet_id` está correto
- Verifique se o script tem permissão para acessar a planilha do cliente

### IA não responde
- Verifique se a API Key está na CONFIG_GLOBAL
- Verifique se o cliente não excedeu o limite de consultas

## Migração de Clientes Existentes

Se você já tem clientes com projetos individuais:

1. **Adicione** o cliente na ADMIN_MASTER
2. **Compartilhe** a nova URL com o cliente
3. **Desative** o projeto antigo (opcional)
4. **Redirecione** o domínio se aplicável

---

## Resumo dos Benefícios

| Aspecto | Modo Individual | Modo Multi-Cliente |
|---------|-----------------|-------------------|
| Atualizar 100 clientes | 100 deploys | 1 deploy |
| Adicionar cliente | Copiar projeto + configurar | Adicionar 1 linha |
| Monitorar uso | Manual em cada projeto | Dashboard centralizado |
| Controle de IA | Por cliente | Centralizado |
| Custo de manutenção | Alto | Baixo |
