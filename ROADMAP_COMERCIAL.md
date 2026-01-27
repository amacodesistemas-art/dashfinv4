# 🚀 Roadmap Comercial - Dashboard Financeiro B2B

## 📊 Análise de Custos da IA

### Custo Real por Consulta (GPT-4o-mini)
| Métrica | Valor |
|---------|-------|
| Input tokens (média) | ~2.000 tokens |
| Output tokens (média) | ~300 tokens |
| Custo input | $0.15/1M tokens |
| Custo output | $0.60/1M tokens |
| **Custo por consulta** | **~$0.0005** (~R$ 0,003) |
| 100 consultas/mês | ~$0.05 (~R$ 0,30) |
| 500 consultas/mês | ~$0.25 (~R$ 1,50) |

**Conclusão**: O custo de IA é insignificante. Mesmo com uso intenso, não passa de R$ 5/mês por cliente.

---

## 💰 Sugestão de Precificação

### Plano Básico - R$ 297/mês
**Público**: Microempresas, MEIs, profissionais liberais
**Funcionalidades**:
- ✅ Dashboard com KPIs principais
- ✅ Gráficos de fluxo de caixa
- ✅ Filtros por período
- ✅ Exportação CSV
- ✅ Modo escuro/privacidade
- ✅ 1 usuário
- ❌ DRE Gerencial
- ❌ IA
- ❌ Alertas automáticos

### Plano Profissional - R$ 597/mês
**Público**: Pequenas empresas, startups
**Funcionalidades**:
- ✅ Tudo do Básico
- ✅ DRE Gerencial (P&L)
- ✅ Metas e objetivos
- ✅ Análise inteligente (regras)
- ✅ Exportação PDF
- ✅ 3 usuários
- ✅ **30 consultas IA/mês**
- ❌ Alertas WhatsApp
- ❌ Benchmarks

### Plano Enterprise - R$ 1.297/mês
**Público**: PMEs, empresas em crescimento
**Funcionalidades**:
- ✅ Tudo do Profissional
- ✅ **Consultas IA ilimitadas**
- ✅ Alertas por Email/WhatsApp
- ✅ Previsão de fluxo de caixa (IA)
- ✅ Benchmarks do setor
- ✅ Relatórios automáticos semanais
- ✅ Usuários ilimitados
- ✅ Suporte prioritário

### Margem de Contribuição
| Plano | Receita | Custo IA | Custo Operacional* | Margem |
|-------|---------|----------|-------------------|--------|
| Básico | R$ 297 | R$ 0 | R$ 50 | **R$ 247 (83%)** |
| Profissional | R$ 597 | R$ 2 | R$ 80 | **R$ 515 (86%)** |
| Enterprise | R$ 1.297 | R$ 10 | R$ 150 | **R$ 1.137 (87%)** |

*Custo operacional = tempo de conciliação da equipa

---

## 🎯 Funcionalidades de Alto Valor (Roadmap)

### Fase 1: Correções Urgentes (Esta semana)
- [x] Corrigir Service Worker
- [x] Corrigir Chatbot IA
- [ ] Testar fluxo completo

### Fase 2: Alertas Automáticos (Semana 1-2)
**Impacto**: ⭐⭐⭐⭐⭐ (Diferenciador principal)

1. **Alerta de Fluxo de Caixa Crítico**
   - "Atenção: Saldo projetado negativo em 7 dias"
   - Trigger: projeção < 0

2. **Alerta de Inadimplência**
   - "3 faturas em atraso totalizando R$ X"
   - Trigger: faturas > 5 dias atrasadas

3. **Alerta de Despesa Anormal**
   - "Categoria X 40% acima da média"
   - Trigger: gasto > média + 2 desvios

4. **Alerta de Meta Estourada**
   - "Limite de Marketing atingido (102%)"
   - Trigger: gasto > 90% da meta

### Fase 3: Previsões com IA (Semana 3-4)
**Impacto**: ⭐⭐⭐⭐⭐

1. **Previsão de Fluxo de Caixa 30/60/90 dias**
   - Baseado em padrões históricos
   - Considera sazonalidade

2. **Análise de Tendências**
   - "Suas despesas com pessoal cresceram 15% nos últimos 3 meses"

3. **Recomendações Proativas**
   - "Baseado no histórico, reserve R$ X para o 13º"

### Fase 4: Automação para Equipa (Semana 5-8)
**Impacto**: ⭐⭐⭐⭐⭐ (Reduz 70% do tempo manual)

1. **Importação Automática OFX**
   - Upload de arquivo OFX
   - Parsing automático
   - Sugestão de categorias com IA

2. **Categorização Inteligente**
   - IA aprende padrões de categorização
   - "Transferência PIX João Silva" → Fornecedores
   - Acurácia esperada: 85%+

3. **Conciliação Assistida**
   - Matching automático entre lançamentos
   - Destaque de divergências

### Fase 5: Benchmarks e Relatórios (Semana 9-12)
**Impacto**: ⭐⭐⭐⭐

1. **Benchmarks por Setor**
   - "Sua margem (12%) está abaixo do setor (18%)"
   - Dados agregados anônimos dos clientes

2. **Relatório Semanal Automático**
   - PDF gerado automaticamente
   - Enviado por email/WhatsApp

3. **Indicadores de Saúde Expandidos**
   - Liquidez corrente
   - Ciclo financeiro
   - EBITDA margin

---

## 🔧 Solução para Categorização (Maior Dor)

### Problema Atual
- 2 horas/semana por cliente
- Trabalho repetitivo
- Propenso a erros

### Solução Proposta: "Auto-Categorização IA"

```
FLUXO:
1. Equipa faz upload do OFX/Excel
2. Sistema parseia transações
3. IA sugere categoria para cada linha
4. Equipa revisa e aprova em batch
5. Sistema aprende com correções
```

### Economia Esperada
| Métrica | Antes | Depois | Economia |
|---------|-------|--------|----------|
| Tempo/cliente/semana | 2h | 30min | **75%** |
| Tempo/10 clientes/mês | 80h | 20h | **60h/mês** |
| Custo operacional | R$ 2.400* | R$ 600 | **R$ 1.800** |

*Considerando R$ 30/hora de custo de mão de obra

---

## 📱 Notificações WhatsApp/Email

### Implementação Sugerida
- **WhatsApp**: API do Twilio ou Z-API (brasileiro)
- **Email**: SendGrid ou Resend

### Tipos de Notificação
1. 🔴 **Crítico**: Fluxo negativo, inadimplência alta
2. 🟠 **Atenção**: Meta próxima do limite, despesa anormal
3. 🟢 **Informativo**: Relatório semanal, meta atingida

---

## 🎯 Proposta de Valor por Persona

### Para o Empresário (Cliente Final)
> "Saiba exatamente onde seu dinheiro está indo e tome decisões com confiança. Receba alertas antes dos problemas acontecerem."

### Para o Contador/Consultor (Sua Equipa)
> "Reduza 75% do tempo de categorização com IA. Foque em análise estratégica, não em trabalho operacional."

---

## 📈 Métricas de Sucesso

### Para o Produto
- NPS > 50
- Churn < 5%/mês
- Tempo médio de sessão > 5 min

### Para a Operação
- Tempo de onboarding < 1 dia
- Tickets de suporte < 2/cliente/mês
- Precisão da categorização IA > 85%

---

## 🚀 Quick Wins (Implementar Primeiro)

1. **Corrigir IA** ✅ (feito)
2. **Adicionar limites de consultas por plano**
3. **Alertas de inadimplência** (alto impacto, fácil)
4. **Categorização com sugestão de IA** (resolve dor da equipa)

---

*Documento criado em Dezembro 2025*
*Versão 1.0*
