function migrarDadosLegados() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetOrigem = ss.getSheetByName('IMPORTAR');
  const sheetDestino = ss.getSheetByName('TRANSACOES');
  const sheetContas = ss.getSheetByName('CONTAS');

  if (!sheetOrigem || !sheetDestino || !sheetContas) {
    Browser.msgBox('ERRO CRÍTICO: Verifique se as abas IMPORTAR, TRANSACOES e CONTAS existem.');
    return;
  }

  // --- 1. CRIAR MAPA DE CONTAS (NOME -> ID) ---
  // Lê a aba CONTAS para saber qual ID pertence a qual nome (ex: "Nubank" -> "acc_01")
  const lastRowContas = Math.max(2, sheetContas.getLastRow());
  const dadosContas = sheetContas.getRange(2, 1, lastRowContas - 1, 2).getValues();
  const mapaContas = {};
  
  dadosContas.forEach(linha => {
    const id = String(linha[0]).trim();
    const nome = String(linha[1]).trim().toLowerCase(); // Normaliza para minúsculo
    if (id && nome) mapaContas[nome] = id;
  });

  // --- 2. LER DADOS DA ABA IMPORTAR ---
  const lastRowOrigem = sheetOrigem.getLastRow();
  if (lastRowOrigem < 2) {
    Browser.msgBox('A aba IMPORTAR parece estar vazia.');
    return;
  }
  
  // Lê colunas A até F (Data, Descrição, Valor, Ref, Objeto, Plan)
  const dadosAntigos = sheetOrigem.getRange(2, 1, lastRowOrigem - 1, 6).getValues();
  
  const novasTransacoes = [];
  const erros = [];
  let ignorados = 0;

  // --- 3. PROCESSAR LINHA POR LINHA ---
  dadosAntigos.forEach((linha, index) => {
    try {
      // Mapeamento das colunas da aba IMPORTAR
      let data = linha[0];        // Col A
      let descricao = linha[1];   // Col B
      let valorRaw = linha[2];    // Col C
      let refConta = linha[3];    // Col D (Nome da Conta)
      let objetoCat = linha[4];   // Col E (Categoria)
      let planSub = linha[5];     // Col F (Subcategoria)
      
      // Validação básica: Se não tem Data nem Valor, ignora a linha
      if (!data && !valorRaw) {
        ignorados++;
        return;
      }

      // A. Formatar Data
      const dataFormatada = formatarDataParaBanco(data);

      // B. Definir Tipo (Entrada/Saída) e Valor Absoluto
      let tipo = "Entrada";
      let valorFinal = parseFloat(valorRaw);
      
      if (valorFinal < 0) {
        tipo = "Saída";
        valorFinal = Math.abs(valorFinal); // Tira o sinal de menos
      }

      // C. Encontrar o ID da Conta
      if (!refConta) throw new Error("Nome da conta (Ref) está vazio.");
      
      const nomeContaBusca = String(refConta).trim().toLowerCase();
      const accountId = mapaContas[nomeContaBusca];

      if (!accountId) {
        throw new Error(`Conta "${refConta}" não encontrada na aba CONTAS. Cadastre-a lá primeiro.`);
      }

      // D. Montar a linha final para a aba TRANSACOES
      // Ordem: Data, Tipo, Categoria, Subcat, Valor, AccountId, Status, Descricao
      novasTransacoes.push([
        dataFormatada,           // A: Data
        tipo,                    // B: Tipo
        objetoCat || "Outros",   // C: Categoria (OBJETO)
        planSub || "",           // D: Subcategoria (Plan)
        valorFinal,              // E: Valor
        accountId,               // F: AccountId
        "Concluído",             // G: Status
        descricao                // H: Descrição
      ]);

    } catch (e) {
      erros.push(`Linha ${index + 2}: ${e.message}`);
    }
  });

  // --- 4. GRAVAR NO DESTINO ---
  if (novasTransacoes.length > 0) {
    const startRow = sheetDestino.getLastRow() + 1;
    sheetDestino.getRange(startRow, 1, novasTransacoes.length, 8).setValues(novasTransacoes);
    
    let msg = `✅ Sucesso!\n${novasTransacoes.length} transações importadas.`;
    
    if (erros.length > 0) {
      msg += `\n\n⚠️ Atenção: ${erros.length} linhas com erro não foram importadas.`;
      msg += `\n(Verifique o Log de Execução para detalhes ou corrija os nomes das contas)`;
      console.log("ERROS DE IMPORTAÇÃO:", erros); // Mostra no console do Apps Script
    }
    
    Browser.msgBox(msg);
  } else {
    Browser.msgBox(`Nenhuma transação válida para importar.\nErros: ${erros.length}`);
    if (erros.length > 0) console.log(erros);
  }
}

// --- HELPER: Formata data para YYYY-MM-DD ou mantém se for string ---
function formatarDataParaBanco(dateInput) {
  if (!dateInput) return "";
  if (dateInput instanceof Date) {
    const y = dateInput.getFullYear();
    const m = String(dateInput.getMonth() + 1).padStart(2, '0');
    const d = String(dateInput.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // Se for string, tenta garantir que não quebre, mas ideal é vir como Objeto Data do Sheets
  return dateInput;
}