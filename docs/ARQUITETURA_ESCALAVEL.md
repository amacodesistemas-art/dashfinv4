# 🏗️ Arquitetura Escalável - Multi-Cliente

## Problema Atual
Cada cliente = 1 planilha + 1 projeto Apps Script = atualização manual em cada um

## Solução: Arquitetura Centralizada

```
┌─────────────────────────────────────────────────────────────┐
│                    PAINEL ADMIN (Master)                     │
│  Planilha: ADMIN_DASHBOARD_MASTER                           │
│  - Lista de todos os clientes                                │
│  - Controle de planos e uso de IA                           │
│  - Monitoramento de alertas                                  │
│  - Configurações globais                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Lê IDs das planilhas
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND CENTRAL (Apps Script)                   │
│  Projeto: DASHBOARD_FINANCEIRO_CORE                         │
│  - Código único para todos os clientes                      │
│  - Atualiza uma vez = atualiza todos                        │
│  - Publicado como Web App                                    │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Cliente A   │    │  Cliente B   │    │  Cliente C   │
│  Planilha    │    │  Planilha    │    │  Planilha    │
│  (dados)     │    │  (dados)     │    │  (dados)     │
└──────────────┘    └──────────────┘    └──────────────┘
```

## Como Funciona

### 1. URL Única com Parâmetro de Cliente
```
https://script.google.com/macros/s/XXXXX/exec?client=CLIENT_ID
```

### 2. Planilha ADMIN_MASTER
| client_id | nome_cliente | spreadsheet_id | plano | status | criado_em |
|-----------|--------------|----------------|-------|--------|-----------|
| acme_001 | ACME Corp | 1abc123... | enterprise | ativo | 2025-01-01 |
| beta_002 | Beta Inc | 1def456... | professional | ativo | 2025-01-15 |

### 3. Fluxo de Acesso
1. Cliente acessa URL com seu `client_id`
2. Backend busca `spreadsheet_id` na ADMIN_MASTER
3. Carrega dados da planilha do cliente
4. Renderiza dashboard personalizado

## Benefícios

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Atualizar código | 100 projetos | 1 projeto |
| Novo cliente | Copiar projeto + configurar | Adicionar linha na ADMIN |
| Monitorar uso | Planilha por planilha | Painel centralizado |
| Custos | Difícil rastrear | Dashboard de custos |

## Estrutura de Abas (Por Cliente)

### Abas Obrigatórias
- `CONFIG` - Configurações do cliente
- `CONTAS` - Contas bancárias
- `TRANSACOES` - Movimentações
- `CATEGORIAS` - Mapeamento DRE
- `METAS` - Objetivos financeiros

### Novas Abas
- `ALERTAS` - Configuração de alertas
- `REGRAS_CATEGORIZACAO` - Regras automáticas
- `HISTORICO_IA` - Log de consultas IA
- `CONCILIACAO` - Importações pendentes

## Estrutura ADMIN_MASTER

### Aba: CLIENTES
| Coluna | Descrição |
|--------|-----------|
| client_id | ID único do cliente |
| nome | Nome da empresa |
| spreadsheet_id | ID da planilha de dados |
| plano | basic/professional/enterprise |
| status | ativo/suspenso/cancelado |
| data_inicio | Data de início |
| data_vencimento | Próximo vencimento |
| consultas_ia_mes | Uso de IA no mês |
| ultimo_acesso | Último login |

### Aba: CONFIG_GLOBAL
| Coluna | Descrição |
|--------|-----------|
| openai_api_key | Chave API compartilhada |
| limite_ia_basic | 0 |
| limite_ia_professional | 30 |
| limite_ia_enterprise | -1 |
| email_admin | Email para alertas |

### Aba: LOG_SISTEMA
| Coluna | Descrição |
|--------|-----------|
| timestamp | Data/hora |
| client_id | Cliente |
| acao | login/ai_query/alert/error |
| detalhes | Descrição |

## Implementação

### Fase 1: Criar estrutura
1. Criar planilha ADMIN_MASTER
2. Modificar doGet para aceitar client_id
3. Criar função de lookup de cliente

### Fase 2: Migrar clientes existentes
1. Adicionar clientes à ADMIN_MASTER
2. Compartilhar URL única
3. Desativar projetos individuais

### Fase 3: Painel Admin
1. Dashboard para gestão de clientes
2. Relatórios de uso
3. Alertas de vencimento
