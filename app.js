const form = document.getElementById('fiscal-form');
const fiscalsBody = document.getElementById('fiscais-body');
const contadorFuncao = document.getElementById('contador-funcao');
let fiscais = [];

// Quotas necessárias para cada função
const quotasNecessarias = {
    Representante: 1,
    'Fiscal de Sala': 1,
    'Fiscal de Corredor': 1,
    ASD: 1,
    Porteiro: 2
};

// Mostra o campo "Operação" se o banco for a Caixa Econômica Federal
document.getElementById('banco').addEventListener('change', (e) => {
    const operacaoContainer = document.getElementById('operacao-container');
    if (e.target.value === 'caixa-economica') {
        operacaoContainer.classList.remove('hidden');
    } else {
        operacaoContainer.classList.add('hidden');
    }
});

// Adiciona um fiscal à lista ao enviar o formulário
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const funcao = form.funcao.value;

    // Verifica se a quota necessária para a função foi alcançada
    const quantidadeAtual = fiscais.filter(f => f.funcao === funcao).length;
    const quantidadeNecessaria = quotasNecessarias[funcao];

    if (quantidadeAtual >= quantidadeNecessaria) {
        alert(`Limite de ${quantidadeNecessaria} fiscais para a função "${funcao}" já foi alcançado.`);
        return; // Não adiciona o fiscal
    }

    const newFiscal = {
      nome: form.nome.value,
      cpf: form.cpf.value,
      dataNascimento: form['data-nascimento'].value,
      celular: form.celular.value,
      email: form.email.value,
      banco: form.banco.value,
      agencia: form.agencia.value,
      conta: form.conta.value,
      operacao: form.operacao.value || '', // Adicionando string vazia caso não seja informado
      funcao: funcao,
  };

    fiscais.push(newFiscal);
    updateTable();
    updateCounter();
    form.reset();
});

// Atualiza a tabela com os fiscais cadastrados
function updateTable() {
  fiscalsBody.innerHTML = '';
  fiscais.forEach((fiscal, index) => { // Adicione o index como parâmetro
      // Formatar a data de nascimento para DD/MM/AAAA
      const dataNascimentoFormatada = formatarData(fiscal.dataNascimento);
      
      const row = `<tr>
          <td class="py-2 px-4 border">${index + 1}</td> <!-- Mostra a ordem -->
          <td class="py-2 px-4 border">${fiscal.nome}</td>
          <td class="py-2 px-4 border">${fiscal.funcao}</td>
          <td class="py-2 px-4 border">${fiscal.cpf}</td>
          <td class="py-2 px-4 border">${dataNascimentoFormatada}</td>
          <td class="py-2 px-4 border">${fiscal.celular}</td>
          <td class="py-2 px-4 border">${fiscal.email}</td>
          <td class="py-2 px-4 border">${fiscal.banco}</td>
          <td class="py-2 px-4 border">${fiscal.agencia}</td>
          <td class="py-2 px-4 border">${fiscal.conta}</td>
          <td class="py-2 px-4 border">${fiscal.operacao}</td>
      </tr>`;
      fiscalsBody.innerHTML += row;
  });
}

// Função para formatar a data de nascimento
function formatarData(data) {
    const [ano, mes, dia] = data.split('-'); // separa a data no formato YYYY-MM-DD
    return `${dia}/${mes}/${ano}`; // retorna no formato DD/MM/YYYY
}

// Inicializa o contador com as quotas necessárias
function initializeCounter() {
    let html = '';
    Object.keys(quotasNecessarias).forEach(funcao => {
        const quantidadeNecessaria = quotasNecessarias[funcao];
        html += `<p>${funcao.charAt(0).toUpperCase() + funcao.slice(1)}: 0 (Faltando: ${quantidadeNecessaria})</p>`;
    });
    contadorFuncao.innerHTML = html;
}
// Exporta os dados cadastrados para um arquivo Excel
document.getElementById('export-btn').addEventListener('click', () => {
  // Verifica se há fiscais cadastrados
  if (fiscais.length === 0) {
      alert("Não há dados para exportar!");
      return;
  }

  // Cria um novo workbook
  const wb = XLSX.utils.book_new();

  // Formata os dados para exportação
  const dadosExportacao = fiscais.map((fiscal, index) => ({
      Ord: index + 1,
      Nome: fiscal.nome,
      Função: fiscal.funcao,
      CPF: fiscal.cpf,
      "Data de Nasc.": formatarData(fiscal.dataNascimento),
      Celular: fiscal.celular,
      Email: fiscal.email,
      Banco: fiscal.banco,
      Agência: fiscal.agencia,
      "Conta Corrente": fiscal.conta,
      Operação: fiscal.operacao
  }));

  // Converte os dados em uma planilha
  const ws = XLSX.utils.json_to_sheet(dadosExportacao);

  // Adiciona a planilha ao workbook
  XLSX.utils.book_append_sheet(wb, ws, "Fiscais");

  // Gera o arquivo Excel e inicia o download
  XLSX.writeFile(wb, "fiscais_cadastrados.xlsx");
});



// Atualiza o contador com as informações dos fiscais
function updateCounter() {
  const contadorAtual = {};
  fiscais.forEach(fiscal => {
      const funcao = fiscal.funcao;
      if (!contadorAtual[funcao]) {
          contadorAtual[funcao] = 0;
      }
      contadorAtual[funcao]++;
  });

  let html = '';
  let totalFiscais = 0; // Variável para contar o total de fiscais

  Object.keys(quotasNecessarias).forEach(funcao => {
      const quantidadeNecessaria = quotasNecessarias[funcao];
      const quantidadeAtual = contadorAtual[funcao] || 0;
      const faltando = quantidadeNecessaria - quantidadeAtual;

      totalFiscais += quantidadeAtual; // Atualiza o total de fiscais

      if (faltando <= 0) {
          // Se a quantidade necessária foi alcançada
          html += `<p class="concluido">${funcao.charAt(0).toUpperCase() + funcao.slice(1)}: ${quantidadeAtual} (Concluído)</p>`;
      } else {
          // Se ainda faltam fiscais
          html += `<p class="faltando">${funcao.charAt(0).toUpperCase() + funcao.slice(1)}: ${quantidadeAtual} (Faltando: ${faltando})</p>`;
      }
  });

  // Adiciona o total de fiscais
  html += `<p>Total de Fiscais: ${totalFiscais}</p>`;
  contadorFuncao.innerHTML = html;
}
// Inicializa o contador quando a página é carregada
initializeCounter();


