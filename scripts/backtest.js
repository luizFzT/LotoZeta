import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const dataPath = path.join(rootDir, 'src/data/resultados.json');
const reportPath = path.join(rootDir, 'docs/BACKTEST_LOTOZETA.md');

const NUMBERS = Array.from({ length: 25 }, (_, index) => index + 1);
const PRICE_PER_GAME = 3.5;
const PRIZE_TIERS = [11, 12, 13, 14, 15];
const DEFAULT_MIN_HISTORY = 100;

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const raw = process.argv.find((arg) => arg.startsWith(prefix));
  if (!raw) return fallback;

  const value = Number.parseInt(raw.slice(prefix.length), 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).replace(/[\u00a0\u202f]/g, ' ');
}

function formatNumber(value, digits = 2) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function readSorteios() {
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Arquivo nao encontrado: ${dataPath}`);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const sorteios = Array.isArray(data.sorteios) ? data.sorteios : [];

  if (!sorteios.length) {
    throw new Error('resultados.json nao tem o campo "sorteios". Rode: npm run fetch-data');
  }

  return {
    atualizadoEm: data.atualizadoEm,
    fonte: data.fonte,
    sorteios: sorteios
      .filter((sorteio) => Array.isArray(sorteio.numeros) && sorteio.numeros.length === 15)
      .map((sorteio) => ({
        concurso: Number(sorteio.concurso),
        data: sorteio.data ?? '',
        numeros: [...sorteio.numeros].map(Number).sort((a, b) => a - b),
      }))
      .sort((a, b) => a.concurso - b.concurso),
  };
}

function emptyCounts() {
  return Object.fromEntries(NUMBERS.map((number) => [number, 0]));
}

function addDrawToCounts(counts, draw) {
  for (const number of draw.numeros) {
    counts[number] += 1;
  }
}

function rankedNumbers(counts) {
  return NUMBERS.map((number) => ({ number, count: counts[number] ?? 0 })).sort(
    (a, b) => b.count - a.count || a.number - b.number,
  );
}

function sortedGame(numbers) {
  return [...new Set(numbers)].sort((a, b) => a - b);
}

function jogosMaisFrequentes(counts) {
  return [sortedGame(rankedNumbers(counts).slice(0, 15).map((item) => item.number))];
}

function jogosBalanceadoLotoZeta(counts) {
  const ranked = rankedNumbers(counts).map((item) => item.number);
  const hot = ranked.slice(0, 8);
  const mid = ranked.slice(8, 17);
  const cold = ranked.slice(17);

  return [sortedGame([...hot.slice(0, 7), ...mid.slice(0, 5), ...cold.slice(0, 3)])];
}

function jogosG10Automatico(counts) {
  const ranked = rankedNumbers(counts).map((item) => item.number);
  const base = ranked.slice(0, 10);
  const a = ranked.slice(10, 15);
  const b = ranked.slice(15, 20);
  const c = ranked.slice(20, 25);

  return [
    sortedGame([...base, ...a]),
    sortedGame([...base, ...b]),
    sortedGame([...base, ...c]),
    sortedGame([...a, ...b, ...c]),
  ];
}

const STRATEGIES = [
  {
    id: 'top15',
    name: 'Top 15 historico',
    description: 'Escolhe as 15 dezenas mais frequentes antes do concurso testado.',
    makeGames: jogosMaisFrequentes,
  },
  {
    id: 'lotozeta',
    name: 'Balanceado LotoZeta',
    description: 'Mistura 7 dezenas mais frequentes, 5 intermediarias e 3 menos frequentes.',
    makeGames: jogosBalanceadoLotoZeta,
  },
  {
    id: 'g10',
    name: 'G10 automatico',
    description: 'Monta Base 10 + tres grupos de 5 por frequencia e testa os 4 jogos da estrategia.',
    makeGames: jogosG10Automatico,
  },
];

function createSummary(strategy) {
  return {
    id: strategy.id,
    name: strategy.name,
    description: strategy.description,
    concursos: 0,
    totalGames: 0,
    sumBestHits: 0,
    bestHits: 0,
    drawsWithPrize: 0,
    ticketPrizeHits: Object.fromEntries(PRIZE_TIERS.map((tier) => [tier, 0])),
    bestHitDistribution: Object.fromEntries(Array.from({ length: 16 }, (_, hits) => [hits, 0])),
  };
}

function countHits(game, drawNumbers) {
  return game.reduce((hits, number) => hits + (drawNumbers.has(number) ? 1 : 0), 0);
}

function updateSummary(summary, games, drawNumbers) {
  const hitsByGame = games.map((game) => countHits(game, drawNumbers));
  const best = Math.max(...hitsByGame);

  summary.concursos += 1;
  summary.totalGames += games.length;
  summary.sumBestHits += best;
  summary.bestHits = Math.max(summary.bestHits, best);
  summary.bestHitDistribution[best] += 1;
  if (best >= 11) summary.drawsWithPrize += 1;

  for (const hits of hitsByGame) {
    if (hits >= 11) {
      summary.ticketPrizeHits[hits] += 1;
    }
  }
}

function runBacktest(sorteios, minHistory) {
  if (sorteios.length <= minHistory) {
    throw new Error(
      `Historico insuficiente: ${sorteios.length} sorteios para min-history=${minHistory}.`,
    );
  }

  const counts = emptyCounts();
  const summaries = STRATEGIES.map(createSummary);

  for (let index = 0; index < minHistory; index += 1) {
    addDrawToCounts(counts, sorteios[index]);
  }

  for (let index = minHistory; index < sorteios.length; index += 1) {
    const draw = sorteios[index];
    const drawNumbers = new Set(draw.numeros);

    STRATEGIES.forEach((strategy, strategyIndex) => {
      updateSummary(summaries[strategyIndex], strategy.makeGames(counts), drawNumbers);
    });

    addDrawToCounts(counts, draw);
  }

  return summaries;
}

function buildConsoleRows(summaries) {
  return summaries.map((summary) => ({
    Estrategia: summary.name,
    Concursos: summary.concursos,
    Jogos: summary.totalGames,
    Custo: formatCurrency(summary.totalGames * PRICE_PER_GAME),
    'Media melhor': formatNumber(summary.sumBestHits / summary.concursos),
    Melhor: summary.bestHits,
    'Conc. 11+': summary.drawsWithPrize,
    'Bilhetes 11': summary.ticketPrizeHits[11],
    'Bilhetes 12': summary.ticketPrizeHits[12],
    'Bilhetes 13': summary.ticketPrizeHits[13],
    'Bilhetes 14': summary.ticketPrizeHits[14],
    'Bilhetes 15': summary.ticketPrizeHits[15],
  }));
}

function markdownTable(headers, rows) {
  const header = `| ${headers.join(' | ')} |`;
  const separator = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((row) => `| ${headers.map((key) => row[key]).join(' | ')} |`);
  return [header, separator, ...body].join('\n');
}

function buildReport({ atualizadoEm, fonte, sorteios, minHistory, summaries }) {
  const tested = sorteios.slice(minHistory);
  const first = tested[0];
  const last = tested[tested.length - 1];
  const rows = summaries.map((summary) => ({
    Estrategia: summary.name,
    Concursos: String(summary.concursos),
    'Jogos total': String(summary.totalGames),
    'Custo estimado': formatCurrency(summary.totalGames * PRICE_PER_GAME),
    'Media melhor acerto': formatNumber(summary.sumBestHits / summary.concursos),
    'Melhor acerto': String(summary.bestHits),
    'Concursos 11+': String(summary.drawsWithPrize),
    'Bilhetes 11': String(summary.ticketPrizeHits[11]),
    'Bilhetes 12': String(summary.ticketPrizeHits[12]),
    'Bilhetes 13': String(summary.ticketPrizeHits[13]),
    'Bilhetes 14': String(summary.ticketPrizeHits[14]),
    'Bilhetes 15': String(summary.ticketPrizeHits[15]),
  }));

  const strategyNotes = summaries
    .map((summary) => `- ${summary.name}: ${summary.description}`)
    .join('\n');

  return `# Backtest LotoZeta

Gerado em: ${new Date().toISOString()}

## Base usada

- Fonte: ${fonte}
- Atualizado em: ${atualizadoEm}
- Sorteios no arquivo: ${sorteios.length}
- Janela inicial minima: ${minHistory} concursos
- Concursos testados: ${first.concurso} ate ${last.concurso}
- Preco por jogo simples usado no custo: ${formatCurrency(PRICE_PER_GAME)}

## Metodo

O teste e walk-forward: cada concurso e avaliado usando apenas os concursos anteriores para calcular frequencia. Nao ha uso do resultado futuro para montar o jogo testado.

Nao calcula lucro real, porque o arquivo historico nao inclui rateio por faixa. O relatorio mede acertos e quantidade de bilhetes em faixas premiadas da Lotofacil, de 11 a 15 acertos.

## Estrategias

${strategyNotes}

## Resultado

${markdownTable(
    [
      'Estrategia',
      'Concursos',
      'Jogos total',
      'Custo estimado',
      'Media melhor acerto',
      'Melhor acerto',
      'Concursos 11+',
      'Bilhetes 11',
      'Bilhetes 12',
      'Bilhetes 13',
      'Bilhetes 14',
      'Bilhetes 15',
    ],
    rows,
  )}

## Leitura rapida

- "Concursos 11+" conta concursos em que a estrategia teve pelo menos um jogo com 11 ou mais acertos.
- "Bilhetes 11..15" conta bilhetes individuais. A estrategia G10 testa 4 bilhetes por concurso, por isso esse numero pode crescer mais rapido.
- O resultado serve para comparar comportamento historico, nao para prometer premio.
`;
}

function main() {
  const minHistory = getArg('min-history', DEFAULT_MIN_HISTORY);
  const { atualizadoEm, fonte, sorteios } = readSorteios();
  const summaries = runBacktest(sorteios, minHistory);

  console.log(`Backtest LotoZeta - ${sorteios.length} sorteios, min-history=${minHistory}`);
  console.table(buildConsoleRows(summaries));

  const report = buildReport({ atualizadoEm, fonte, sorteios, minHistory, summaries });
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${report.trimEnd()}\n`, 'utf8');
  console.log(`Relatorio salvo em: ${path.relative(rootDir, reportPath)}`);
}

main();
