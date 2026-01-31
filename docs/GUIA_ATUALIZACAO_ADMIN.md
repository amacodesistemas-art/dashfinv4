# 📋 Guia de Atualização da ADMIN_MASTER

## Visão Geral

Este guia explica como atualizar a planilha **ADMIN_MASTER** para suportar as novas funcionalidades do sistema v3.4.0, incluindo configurações dinâmicas de IA e controle de features por plano.

---

## 🚀 Execução Rápida

### Passo 1: Acessar o Apps Script

1. Abra sua planilha **ADMIN_MASTER** no Google Sheets
2. Vá em **Extensões** > **Apps Script**

### Passo 2: Copiar o Código

1. Abra o arquivo `/app/scripts/ATUALIZAR_ADMIN_MASTER.gs`
2. Copie todo o conteúdo
3. Cole no editor do Apps Script (substitua o conteúdo existente ou crie um novo arquivo)

### Passo 3: Executar

1. Selecione a função `atualizarAdminMaster` no dropdown
2. Clique em **Executar** (▶️)
3. Na primeira execução, autorize o script quando solicitado
4. Aguarde a mensagem de confirmação

---

## 📊 O Que o Script Faz

### 1. Cria/Atualiza CONFIG_GLOBAL

Adiciona as seguintes configurações (sem sobrescrever existentes):

| Chave | Valor Padrão | Descrição |
|-------|--------------|-----------|
| `openai_api_key` | (vazio) | Chave da API OpenAI |
| `limite_ia_basic` | 0 | Limite de consultas IA - Básico |
| `limite_ia_professional` | 30 | Limite de consultas IA - Profissional |
| `limite_ia_enterprise` | -1 | Limite de consultas IA - Enterprise (-1 = ilimitado) |
| `email_admin` | (vazio) | Email do administrador |
| `emails_equipe` | (vazio) | Emails da equipe (separados por vírgula) |
| `versao_sistema` | 3.4.0 | Versão atual do sistema |
| `whatsapp_suporte` | (vazio) | WhatsApp para suporte |
| `modelo_ia` | gpt-4o-mini | Modelo OpenAI |
| `max_tokens_ia` | 400 | Máximo de tokens por resposta |

### 2. Cria PLANOS_FEATURES

Tabela com definição dos planos:

| plano | nome_display | preco | limite_ia | descricao |
|-------|--------------|-------|-----------|-----------|
| basic | Básico | R$ 297/mês | 0 | Dashboard, filtros... |
| professional | Profissional | R$ 597/mês | 30 | + DRE, IA (30/mês)... |
| enterprise | Enterprise | R$ 1.297/mês | -1 | + IA ilimitada... |
| admin | Administrador | Interno | -1 | Acesso total |

### 3. Cria FEATURES_POR_PLANO

Matriz visual de features por plano com formatação condicional (verde para TRUE, vermelho para FALSE).

### 4. Verifica CLIENTES

Adiciona colunas faltantes:
- `email_contato`
- `telefone`
- `observacoes`

### 5. Verifica LOG_SISTEMA

Cria a aba se não existir.

---

## ⚙️ Configuração Manual (Alternativa)

Se preferir não usar o script, crie/atualize as abas manualmente:

### CONFIG_GLOBAL

```
| chave                | valor           |
|---------------------|-----------------|
| openai_api_key      | sk-xxx...       |
| limite_ia_basic     | 0               |
| limite_ia_professional | 30           |
| limite_ia_enterprise | -1             |
| email_admin         | admin@empresa.com |
| emails_equipe       | equipe@empresa.com |
| modelo_ia           | gpt-4o-mini     |
```

---

## 🔑 Configurando a API Key

### Opção 1: Na ADMIN_MASTER (recomendado)

Na aba **CONFIG_GLOBAL**, configure:
```
openai_api_key | sk-proj-xxxxx...
```

Esta chave será usada por TODOS os clientes que não tiverem chave própria.

### Opção 2: Por Cliente

Na aba **CONFIG** da planilha do cliente:
```
ai_api_key | sk-proj-xxxxx...
```

Esta chave tem prioridade sobre a da ADMIN_MASTER.

---

## 📈 Alterando Limites de IA

Para alterar os limites de consultas de IA por plano:

1. Abra a aba **CONFIG_GLOBAL**
2. Encontre as linhas:
   - `limite_ia_basic`
   - `limite_ia_professional`
   - `limite_ia_enterprise`
3. Altere os valores na coluna B

**Valores especiais**:
- `0` = IA desabilitada
- `-1` = Ilimitado
- Qualquer número positivo = limite mensal

---

## 👥 Configurando Emails da Equipe

Para que membros da equipe tenham acesso à importação OFX/CSV:

1. Abra a aba **CONFIG_GLOBAL**
2. Encontre ou adicione a linha `emails_equipe`
3. Adicione os emails separados por vírgula:
   ```
   emails_equipe | joao@empresa.com, maria@empresa.com, pedro@empresa.com
   ```

---

## 🔄 Resetando Contadores de IA

Os contadores de uso de IA são resetados automaticamente todo dia 1º de cada mês.

Para criar o trigger automático:
1. Execute a função `criarTriggerMensal()` no Apps Script

Para resetar manualmente:
1. Execute a função `resetarContadoresIA()` no Apps Script

---

## 🧪 Testando a API Key

Para verificar se a API key está funcionando:

1. Execute a função `testarAPIKey()` no Apps Script
2. Verifique o log de execução

Resultado esperado:
```
🔑 API Key encontrada: sk-proj-xx...
✅ API Key válida!
```

---

## 📝 Funções Disponíveis no Script

| Função | Descrição |
|--------|-----------|
| `atualizarAdminMaster()` | Executa todas as atualizações |
| `resetarContadoresIA()` | Reseta contadores de todos os clientes |
| `criarTriggerMensal()` | Cria trigger para reset automático |
| `listarClientes()` | Lista todos os clientes no log |
| `testarAPIKey()` | Testa se a API key está funcionando |

---

## ⚠️ Importante

- O script **NÃO apaga dados existentes**
- Apenas **adiciona** configurações faltantes
- **Faça backup** da planilha antes de executar (por precaução)
- Execute o script apenas **uma vez** (executar novamente não causa problemas, apenas não faz nada)

---

## 🆘 Troubleshooting

### Erro de Autorização

Se aparecer erro de autorização:
1. Clique em "Revisar permissões"
2. Selecione sua conta Google
3. Clique em "Avançado"
4. Clique em "Ir para [nome do projeto]"
5. Clique em "Permitir"

### Abas Não Foram Criadas

Verifique:
1. Se você está na planilha ADMIN_MASTER correta
2. Se tem permissão de edição na planilha
3. Se o script executou sem erros (verifique o log)

### API Key Inválida

Verifique:
1. Se a chave começa com `sk-proj-` ou `sk-`
2. Se não há espaços antes ou depois
3. Se a chave não expirou no OpenAI

---

**Versão**: 3.4.0  
**Data**: Janeiro 2026
