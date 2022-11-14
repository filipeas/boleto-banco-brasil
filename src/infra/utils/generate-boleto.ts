import fs from 'fs';
import path from 'path';
import pdf from 'html-pdf';
import handlebars from 'handlebars';
import JSBarcode from 'jsbarcode';
import { DOMImplementation, XMLSerializer } from 'xmldom';
import svg64 from 'svg64';
import { generateLink } from './generate-link';
import { formatDate } from './format-date';

/*
#################################################
FUNÇÃO DO MÓDULO 10 RETIRADA DO PHPBOLETO
ESTA FUNÇÃO PEGA O DÍGITO VERIFICADOR DO PRIMEIRO, SEGUNDO
E TERCEIRO CAMPOS DA LINHA DIGITÁVEL
#################################################
*/
function modulo10(num: string) {
  let numtotal10 = '0';
  let fator = 2;

  const numeros: number[] = [];
  const parcial10: number[] = [];
  for (let i = num.length; i > 0; i--) {
    numeros[i] = Number(num.substr(i - 1, 1));
    parcial10[i] = numeros[i] * fator;
    numtotal10 = `${numtotal10}${parcial10[i]}`;
    if (fator === 2) {
      fator = 1;
    } else {
      fator = 2;
    }
  }

  let soma = 0;
  for (let i = numtotal10.length; i > 0; i--) {
    numeros[i] = Number(numtotal10.substr(i - 1, 1));
    soma += numeros[i];
  }
  const resto = soma % 10;
  let digito = 10 - resto;
  if (resto === 0) {
    digito = 0;
  }

  return digito;
}

/*
#################################################
FUNÇÃO DO MÓDULO 11 RETIRADA DO PHPBOLETO
MODIFIQUEI ALGUMAS COISAS...
ESTA FUNÇÃO PEGA O DÍGITO VERIFICADOR:
NOSSONUMERO
AGENCIA
CONTA
CAMPO 4 DA LINHA DIGITÁVEL
#################################################
*/
function modulo11(num: string, base = 9, r = 0) {
  let soma = 0;
  let fator = 2;

  const numeros: number[] = [];
  const parcial: number[] = [];
  for (let i = num.length; i > 0; i--) {
    numeros[i] = Number(num.substr(i - 1, 1));
    parcial[i] = numeros[i] * fator;
    soma += parcial[i];
    if (fator === base) {
      fator = 1;
    }
    fator++;
  }

  if (r === 0) {
    soma *= 10;
    let digito: string | number = soma % 11;

    // corrigido
    if (digito === 10) {
      digito = 'X';
    }

    /*
    alterado por mim, Daniel Schultz
    Vamos explicar:
    O módulo 11 só gera os digitos verificadores do nossonumero,
    agencia, conta e digito verificador com codigo de barras (aquele que fica sozinho e triste na linha digitável)
    só que é foi um rolo...pq ele nao podia resultar em 0, e o pessoal do phpboleto se esqueceu disso...
    No BB, os dígitos verificadores podem ser X ou 0 (zero) para agencia, conta e nosso numero,
    mas nunca pode ser X ou 0 (zero) para a linha digitável, justamente por ser totalmente numérica.
    Quando passamos os dados para a função, fica assim:
    Agencia = sempre 4 digitos
    Conta = até 8 dígitos
    Nosso número = de 1 a 17 digitos
    A unica variável que passa 17 digitos é a da linha digitada, justamente por ter 43 caracteres
    Entao vamos definir ai embaixo o seguinte...
    se (strlen($num) == 43) { não deixar dar digito X ou 0 }
    */

    if (num.length === 43) {
      // então estamos checando a linha digitável
      if (digito === 0 || digito === 'X' || digito > 9) {
        digito = 1;
      }
    }
    return digito;
  }

  if (r === 1) {
    const resto = soma % 11;
    return resto;
  }

  return '';
}

function geraCodigoBanco(numero: string) {
  const parte1 = numero.substr(0, 3);
  const parte2 = modulo11(parte1);
  return `${parte1}-${parte2}`;
}

function _dateToDays(year: string, month: string, day: string) {
  let century = Number(year.substr(0, 2));
  let newYear = Number(year.substr(2, 2));
  let newMonth = Number(month);
  if (newMonth > 2) {
    newMonth -= 3;
  } else {
    newMonth += 9;
    if (newYear) {
      newYear--;
    } else {
      newYear = 99;
      century--;
    }
  }

  return (
    Math.floor((146097 * century) / 4) +
    Math.floor((1461 * newYear) / 4) +
    Math.floor((153 * newMonth + 2) / 5) +
    Number(day) +
    1721119
  );
}

function fatorVencimento(data: string) {
  const newData = data.split('/');
  const ano = newData[2];
  const mes = newData[1];
  const dia = newData[0];
  return Math.abs(_dateToDays('1997', '10', '07') - _dateToDays(ano, mes, dia));
}

/*
Montagem da linha digitável - Função tirada do PHPBoleto
Não mudei nada
*/
function montaLinhaDigitavel(linha: string) {
  // Posição 	Conteúdo
  // 1 a 3    Número do banco
  // 4        Código da Moeda - 9 para Real
  // 5        Digito verificador do Código de Barras
  // 6 a 19   Valor (12 inteiros e 2 decimais)
  // 20 a 44  Campo Livre definido por cada banco

  // 1. Campo - composto pelo código do banco, código da moéda, as cinco primeiras posições
  // do campo livre e DV (modulo10) deste campo
  const ap1 = linha.substr(0, 4);
  const ap2 = linha.substr(19, 5);
  const ap3 = modulo10(`${ap1}${ap2}`);
  const ap4 = `${ap1}${ap2}${ap3}`;
  const ap5 = ap4.substr(0, 5);
  const ap6 = ap4.substr(5);
  const campo1 = `${ap5}${ap6}`;

  // 2. Campo - composto pelas posiçoes 6 a 15 do campo livre
  // e livre e DV (modulo10) deste campo
  const bp1 = linha.substr(24, 10);
  const bp2 = modulo10(bp1);
  const bp3 = `${bp1}${bp2}`;
  const bp4 = bp3.substr(0, 5);
  const bp5 = bp3.substr(5);
  const campo2 = `${bp4}${bp5}`;

  // 3. Campo composto pelas posicoes 16 a 25 do campo livre
  // e livre e DV (modulo10) deste campo
  const cp1 = linha.substr(34, 10);
  const cp2 = modulo10(cp1);
  const cp3 = `${cp1}${cp2}`;
  const cp4 = cp3.substr(0, 5);
  const cp5 = cp3.substr(5);
  const campo3 = `${cp4}${cp5}`;

  // 4. Campo - digito verificador do codigo de barras
  const campo4 = linha.substr(4, 1);

  // 5. Campo composto pelo valor nominal pelo valor nominal do documento, sem
  // indicacao de zeros a esquerda e sem edicao (sem ponto e virgula). Quando se
  // tratar de valor zerado, a representacao deve ser 000 (tres zeros).
  const campo5 = linha.substr(5, 14);

  return `${campo1} ${campo2} ${campo3} ${campo4} ${campo5}`;
}

function formataNumero(
  numero: string,
  loop: number,
  insert: number,
  tipo = 'geral',
): string {
  let newNumero = numero;
  if (tipo === 'geral') {
    newNumero = numero.replace(',', '');
    while (newNumero.length < loop) {
      newNumero = `${insert}${newNumero}`;
    }
  }

  if (tipo === 'valor') {
    /*
    retira as virgulas
    formata o numero
    preenche com zeros
    */
    newNumero = numero.replace(',', '');
    while (newNumero.length < loop) {
      newNumero = `${insert}${newNumero}`;
    }
  }

  if (tipo === 'convenio') {
    newNumero = numero;
    while (newNumero.length < loop) {
      newNumero = `${newNumero}${insert}`;
    }
  }

  return newNumero;
}

// Carteira 18 com Convênio de 7 dígitos
function formatacaoConvenio7(
  codigobanco: string,
  nummoeda: string,
  fatorvencimento: string,
  valor: string,
  livrezeros: string,
  convenio: string,
  nossonumero: string,
  carteira: string,
) {
  const newConvenio = formataNumero(convenio, 7, 0, 'convenio');

  // Nosso número de até 10 dígitos
  let newNossoNumero = formataNumero(nossonumero, 10, 0);
  const dv = modulo11(
    `${codigobanco}${nummoeda}${fatorvencimento}${valor}${livrezeros}${newConvenio}${newNossoNumero}${carteira}`,
  );
  const linha = `${codigobanco}${nummoeda}${dv}${fatorvencimento}${valor}${livrezeros}${newConvenio}${newNossoNumero}${carteira}`;
  newNossoNumero = `${newConvenio}${newNossoNumero}`;
  return newNossoNumero;
  // Não existe DV na composição do nosso-número para convênios de sete posições
}

type IRequest = {
  codigoBarraNumerico: string;
  // linhaDigitavel: string;
  bbConvenio: string;
  bbWallet: string;
  // bbWalletVariation: string;
  agencia: string;
  conta: string;
  total: number;
  numeroBoleto: string;
  dataVencimento: string;
  nomeComprador: string;
  cepCliente: string;
  // cpfComprador: string;
  enderecoComprador: string;
  cidadeComprador: string;
  // bairroComprador: string;
  estadoComprador: string;
};

export async function generateBoleto({
  numeroBoleto,
  codigoBarraNumerico,
  // linhaDigitavel,
  bbConvenio,
  bbWallet,
  agencia,
  conta,
  // bbWalletVariation,
  total,
  dataVencimento,
  nomeComprador,
  cepCliente,
  // cpfComprador,
  enderecoComprador,
  cidadeComprador,
  // bairroComprador,
  estadoComprador,
}: IRequest): Promise<string> {
  const codigoBanco = '001';
  const numMoeda = '9';
  const valor = total.toLocaleString('pt-br', {
    minimumFractionDigits: 2,
  });
  const dataBoleto = {
    // nosso_numero: numBoleto,
    numero_documento: numeroBoleto, // Num do pedido ou do documento
    data_vencimento: dataVencimento, // Data de Vencimento do Boleto - REGRA: Formato DD/MM/AAAA
    data_documento: formatDate(new Date(), 'dd/MM/yyyy'), // Data de emissão do Boleto
    data_processamento: formatDate(new Date(), 'dd/MM/yyyy'), // Data de processamento do boleto (opcional)
    valor_boleto: valor, // Valor do Boleto - REGRA: Com vírgula e sempre com duas casas depois da virgula

    codigo_barras: codigoBarraNumerico,
    // linha_digitavel: linhaDigitavel,

    // DADOS DO SEU CLIENTE
    sacado: nomeComprador,
    endereco1: enderecoComprador,
    endereco2: `${cidadeComprador} - ${estadoComprador} - CEP: ${cepCliente}`,

    // INFORMACOES PARA O CLIENTE
    demonstrativo1: '',
    demonstrativo2: '',
    demonstrativo3: '',

    // INSTRUÇÕES PARA O CAIXA
    instrucoes1: '- Sr. Caixa, não receber após o vencimento',
    instrucoes2: '',
    instrucoes3: '',
    instrucoes4: '',

    // DADOS OPCIONAIS DE ACORDO COM O BANCO OU CLIENTE
    quantidade: '',
    valor_unitario: '',
    aceite: 'N',
    especie: 'R$',
    especie_doc: 'DM',

    // ---------------------- DADOS FIXOS DE CONFIGURAÇÃO DO SEU BOLETO --------------- //

    // DADOS DA SUA CONTA - BANCO DO BRASIL
    agencia, // Num da agencia, sem digito
    conta, // Num da conta, sem digito

    // DADOS PERSONALIZADOS - BANCO DO BRASIL
    convenio: bbConvenio, // Num do convênio - REGRA: 6 ou 7 ou 8 dígitos
    contrato: '999999', // Num do seu contrato
    carteira: bbWallet,
    variacao_carteira: '', // Variação da Carteira, com traço (opcional)

    // TIPO DO BOLETO
    formatacao_convenio: '7', // REGRA: 8 p/ Convênio c/ 8 dígitos, 7 p/ Convênio c/ 7 dígitos, ou 6 se Convênio c/ 6 dígitos
    formatacao_nosso_numero: '2', // REGRA: Usado apenas p/ Convênio c/ 6 dígitos: informe 1 se for NossoNúmero de até 5 dígitos ou 2 para opção de até 17 dígitos

    // SEUS DADOS
    identificacao: '',
    cpf_cnpj: '32.063.701/0001-66',
    endereco: '',
    cidade_uf: 'Teresina / PI',
    cedente: 'M & F COMERCIO DE LIVROS E ALIMENTOS LTDA',

    linha_digitavel: montaLinhaDigitavel(codigoBarraNumerico),
    agencia_codigo: `${agencia}-${modulo11(agencia)} / ${conta}-${modulo11(
      conta,
    )}`,
    nosso_numero: formatacaoConvenio7(
      codigoBanco,
      numMoeda,
      String(fatorVencimento(dataVencimento)),
      formataNumero(String(valor), 10, 0, 'valor'),
      '000000',
      bbConvenio,
      numeroBoleto,
      bbWallet,
    ),
    codigo_banco_com_dv: geraCodigoBanco(codigoBanco),
  };

  const templatePath = path.resolve(
    __dirname,
    '..',
    '..',
    'application',
    'views',
    'banco-do-brasil',
    'boleto.hbs',
  );

  // gerando barcode
  const xmlSerializer = new XMLSerializer();
  const document = new DOMImplementation().createDocument(
    'http://www.w3.org/1999/xhtml',
    'html',
    null,
  );
  const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  JSBarcode(svgNode, dataBoleto.linha_digitavel, {
    xmlDocument: document,
    height: 50,
    width: 1,
    displayValue: false,
  });

  const svgText = xmlSerializer.serializeToString(svgNode);

  const b64 = svg64(svgText);

  const templateHtml = fs.readFileSync(templatePath).toString('utf-8');
  const templateHTML = handlebars.compile(templateHtml);
  const html = templateHTML({ dataBoleto, barcode: b64 });
  // const html = templateHTML({ data, images });

  const pdfRootPath = path.resolve(
    __dirname,
    '..',
    '..',
    '..',
    'tmp',
    'uploads',
    'boletos',
  );

  if (!fs.existsSync(pdfRootPath)) {
    fs.mkdirSync(pdfRootPath, { recursive: true });
  }
  
  const milis = new Date().getTime();
  const pdfPath = path.join(pdfRootPath, `boleto-${milis}.pdf`);
  
  pdf
    .create(html, {
      format: 'A4',
      // width: '22cm',
      // height: '29.7cm',
    })
    .toFile(pdfPath, (err, fileData) => {
      console.log(`Salvando PDF. ${err} - ${fileData}`);
      if (err) return console.log(err);
      console.log('Pdf generated.');
      return fileData;
    });

  return generateLink('boletos', `boleto-${milis}.pdf`);
}