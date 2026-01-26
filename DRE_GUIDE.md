# 📊 Guia: Como Alimentar o DRE (Demonstrativo de Resultado)

## 🎯 O Que é o DRE?

O DRE (Demonstrativo de Resultado do Exercício) é uma visão **gerencial** das finanças, diferente do **fluxo de caixa**.

### **Diferença:**

**Fluxo de Caixa (padrão):**
```
Entradas: R$ 50.000
Saídas:   R$ 30.000
Saldo:    R$ 20.000
```

**DRE Gerencial:**
```
(+) Receita Bruta:           R$ 50.000
(-) Custos Variáveis:        R$ 10.000
(=) Margem de Contribuição:  R$ 40.000
(-) Despesas Fixas:          R$ 20.000
(=) EBITDA:                  R$ 20.000
(+/-) Investimentos:         R$ -5.000
(=) Resultado Líquido:       R$ 15.000
```

---

## 📝 Como Configurar (Aba CATEGORIAS)

### **Estrutura da Aba CATEGORIAS:**

| Coluna A: Categoria | Coluna B: Grupo DRE |
|---------------------|---------------------|
| Vendas | Receita |
| Serviços | Receita |
| CMV | Custo Variável |
| Matéria Prima | Custo Variável |
| Salários | Despesa Fixa |
| Aluguel | Despesa Fixa |
| Marketing | Despesa Fixa |
| TI | Despesa Fixa |
| Equipamentos | Investimento |
| Software | Investimento |
| Juros Recebidos | Não Operacional |
| Multas | Não Operacional |

### **Grupos DRE Disponíveis:**

1. **Receita** - Faturamento, vendas
2. **Custo Variável** - Custos que variam com produção (CMV, matéria-prima)
3. **Despesa Fixa** - Custos fixos mensais (salários, aluguel)
4. **Investimento** - Compra de ativos, equipamentos
5. **Não Operacional** - Receitas/despesas fora da operação (juros, multas)

---

## 🔧 Exemplo Prático

### **1. Cliente: Empresa de Consultoria**

**Aba CATEGORIAS:**
```
Categoria           | Grupo DRE
--------------------|------------------
Consultoria         | Receita
Treinamentos        | Receita
Freelancers         | Custo Variável
Salário CLT         | Despesa Fixa
Escritório          | Despesa Fixa
Marketing           | Despesa Fixa
Notebook            | Investimento
Software            | Investimento
```

**Resultado no DRE:**
```
(+) Receita Bruta:          R$ 80.000 (Consultoria + Treinamentos)
(-) Custos Variáveis:       R$ 15.000 (Freelancers)
(=) Margem Contribuição:    R$ 65.000
(-) Despesas Fixas:         R$ 35.000 (Salários + Escritório + Mkt)
(=) EBITDA:                 R$ 30.000
(+/-) Investimentos:        R$ -8.000 (Notebook + Software)
(=) Resultado Líquido:      R$ 22.000
```

### **2. Cliente: E-commerce**

**Aba CATEGORIAS:**
```
Categoria              | Grupo DRE
-----------------------|------------------
Vendas Online          | Receita
Custo Produto          | Custo Variável
Frete                  | Custo Variável
Embalagem              | Custo Variável
Salários               | Despesa Fixa
Aluguel Galpão         | Despesa Fixa
Marketing Digital      | Despesa Fixa
Sistema ERP            | Investimento
```

---

## ✅ Checklist de Configuração

Para cada cliente novo:

1. [ ] Listar todas as categorias que ele usa
2. [ ] Classificar cada uma em um Grupo DRE
3. [ ] Preencher aba CATEGORIAS
4. [ ] Testar no dashboard (toggle Caixa/DRE)
5. [ ] Validar valores com cliente

---

## 🎨 Visualizando no Dashboard

### **Passo 1: Acessar Dashboard**
Cliente acessa URL do dashboard

### **Passo 2: Ativar Modo DRE**
Toggle "Caixa / DRE Gerencial" → Clicar em "DRE Gerencial"

### **Passo 3: Visualizar**
Tabela vertical com todas as linhas do DRE

---

## 🔍 Troubleshooting

### **Problema: Categoria não aparece no DRE**
**Solução:** Verifique se categoria está mapeada na aba CATEGORIAS

### **Problema: Valores incorretos**
**Solução:** 
1. Verifique tipo de transação (Entrada/Saída)
2. Confirme classificação na aba CATEGORIAS
3. Execute `testData()` para ver validação

### **Problema: DRE não aparece**
**Solução:**
1. Confirme que aba CATEGORIAS existe
2. Verifique se há pelo menos 1 mapeamento
3. Toggle deve estar visível no dashboard

---

## 📊 Boas Práticas

1. **Padronize Categorias**: Use sempre os mesmos nomes
2. **Revise Trimestralmente**: Ajuste classificações se necessário
3. **Documente**: Mantenha lista de qual categoria vai para qual grupo
4. **Treine Cliente**: Explique diferença entre Caixa e DRE

---

**Versão**: 1.0  
**Para**: Equipe de Consultoria
