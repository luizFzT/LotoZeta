import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { strFromU8, unzipSync } from 'fflate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const URL_CAIXA =
  'https://servicebus2.caixa.gov.br/portaldeloterias/api/resultados/download?modalidade=Lotof%C3%A1cil';

const URL_FALLBACK_JSON =
  'https://raw.githubusercontent.com/guilhermeasn/loteria.json/master/data/lotofacil.json';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (compatible; LotoZeta/1.0; +https://github.com/luizFzT/lotozeta)',
  Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/plain,*/*',
};

async function fetchBuffer(url) {
  const response = await fetch(url, { headers: HEADERS, redirect: 'follow' });

  if (!response.ok) {
    throw new Error(`Falha HTTP ${response.status} em ${url}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

function decodeXml(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function splitCSVLine(line) {
  const result = [];
  let current = '';
  let quoted = false;

  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if ((char === ';' || char === ',') && !quoted) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function normalizeNumber(value) {
  const parsed = Number.parseInt(String(value).replace(/\D/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(value) {
  const raw = String(value ?? '').trim();
  const asNumber = Number(raw);

  if (Number.isFinite(asNumber) && asNumber > 20000 && asNumber < 70000) {
    const date = new Date(Date.UTC(1899, 11, 30 + asNumber));
    return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  }

  return raw;
}

function parseRowsToSorteios(rows) {
  const sorteios = [];

  for (const row of rows) {
    const concurso = normalizeNumber(row[0]);
    const numeros = row
      .slice(2)
      .map(normalizeNumber)
      .filter((n) => n >= 1 && n <= 25)
      .slice(0, 15)
      .sort((a, b) => a - b);

    if (concurso && numeros.length === 15 && new Set(numeros).size === 15) {
      sorteios.push({
        concurso,
        data: normalizeDate(row[1]),
        numeros,
      });
    }
  }

  return sorteios;
}

function parseCSV(raw) {
  const rows = raw
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(1)
    .map(splitCSVLine)
    .filter((cols) => cols.length >= 17);

  return parseRowsToSorteios(rows);
}

function parseJSON(raw) {
  const data = JSON.parse(raw);
  const sorteios = [];

  for (const [concurso, numeros] of Object.entries(data)) {
    if (!Array.isArray(numeros)) continue;

    const parsedNumbers = numeros
      .map(normalizeNumber)
      .filter((n) => n >= 1 && n <= 25)
      .slice(0, 15)
      .sort((a, b) => a - b);

    if (parsedNumbers.length === 15 && new Set(parsedNumbers).size === 15) {
      sorteios.push({
        concurso: Number(concurso),
        data: '',
        numeros: parsedNumbers,
      });
    }
  }

  return sorteios.sort((a, b) => a.concurso - b.concurso);
}

function parseSharedStrings(xml = '') {
  const shared = [];

  for (const match of xml.matchAll(/<(?:\w+:)?si\b[^>]*>([\s\S]*?)<\/(?:\w+:)?si>/g)) {
    const text = Array.from(match[1].matchAll(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/g))
      .map((part) => decodeXml(part[1]))
      .join('');
    shared.push(text);
  }

  return shared;
}

function columnIndex(cellRef) {
  const letters = String(cellRef).match(/[A-Z]+/)?.[0] ?? '';
  let index = 0;

  for (const letter of letters) {
    index = index * 26 + (letter.charCodeAt(0) - 64);
  }

  return Math.max(0, index - 1);
}

function readCellValue(attrs, body, sharedStrings) {
  const type = attrs.match(/\bt="([^"]+)"/)?.[1];
  const rawValue = body.match(/<(?:\w+:)?v\b[^>]*>([\s\S]*?)<\/(?:\w+:)?v>/)?.[1];
  const inlineValue = body.match(/<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/)?.[1];

  if (type === 's') {
    return sharedStrings[Number(rawValue)] ?? '';
  }

  if (type === 'inlineStr') {
    return decodeXml(inlineValue ?? '');
  }

  return decodeXml(rawValue ?? inlineValue ?? '');
}

function parseXLSX(buffer) {
  const entries = unzipSync(buffer);
  const sheetFile = entries['xl/worksheets/sheet1.xml'];

  if (!sheetFile) {
    throw new Error('XLSX sem xl/worksheets/sheet1.xml.');
  }

  const sheet = strFromU8(sheetFile);
  const sharedStrings = parseSharedStrings(
    entries['xl/sharedStrings.xml'] ? strFromU8(entries['xl/sharedStrings.xml']) : '',
  );
  const rows = [];

  for (const rowMatch of sheet.matchAll(/<(?:\w+:)?row\b[^>]*>([\s\S]*?)<\/(?:\w+:)?row>/g)) {
    const row = [];
    let fallbackIndex = 0;

    for (const cellMatch of rowMatch[1].matchAll(/<(?:\w+:)?c\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?c>/g)) {
      const attrs = cellMatch[1];
      const ref = attrs.match(/\br="([^"]+)"/)?.[1];
      const index = ref ? columnIndex(ref) : fallbackIndex;
      row[index] = readCellValue(attrs, cellMatch[2], sharedStrings);
      fallbackIndex = index + 1;
    }

    rows.push(row);
  }

  return parseRowsToSorteios(rows);
}

function parseSource(buffer) {
  const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b;

  if (isZip) {
    return parseXLSX(buffer);
  }

  const text = new TextDecoder('utf-8').decode(buffer).trim();

  if (text.startsWith('{') || text.startsWith('[')) {
    return parseJSON(text);
  }

  return parseCSV(text);
}

function calcularFrequencias(sorteios) {
  const frequencias = {};
  for (let i = 1; i <= 25; i += 1) frequencias[i] = 0;

  for (const sorteio of sorteios) {
    for (const numero of sorteio.numeros) {
      frequencias[numero] += 1;
    }
  }

  return frequencias;
}

async function getSorteios() {
  const sources = [
    { label: 'Caixa XLSX oficial', url: URL_CAIXA },
    { label: 'historico JSON publico', url: URL_FALLBACK_JSON },
  ];

  for (const source of sources) {
    try {
      console.log(`Buscando resultados: ${source.label}...`);
      const buffer = await fetchBuffer(source.url);
      const sorteios = parseSource(buffer);

      if (sorteios.length) {
        return { sorteios, fonte: source.url };
      }

      console.warn(`${source.label} respondeu, mas sem sorteios validos.`);
    } catch (error) {
      console.warn(`${source.label} indisponivel: ${error.message}`);
    }
  }

  throw new Error('Nenhuma fonte retornou sorteios validos.');
}

async function main() {
  const { sorteios, fonte } = await getSorteios();
  const sorteiosOrdenados = [...sorteios].sort((a, b) => a.concurso - b.concurso);
  const frequencias = calcularFrequencias(sorteiosOrdenados);
  const output = {
    atualizadoEm: new Date().toISOString(),
    fonte,
    totalSorteios: sorteiosOrdenados.length,
    frequencias,
    ultimosSorteios: sorteiosOrdenados.slice(-10).reverse(),
    sorteios: sorteiosOrdenados,
  };

  const outPath = path.join(__dirname, '../src/data/resultados.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  const [maisSorteado, vezes] = Object.entries(frequencias).sort((a, b) => b[1] - a[1])[0];
  console.log(`${sorteiosOrdenados.length} sorteios processados.`);
  console.log(`Numero mais sorteado: ${maisSorteado} (${vezes} vezes).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
