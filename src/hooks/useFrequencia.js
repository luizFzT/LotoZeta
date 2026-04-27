import resultados from '../data/resultados.json';
import { NUMBERS, PRICE_PER_GAME } from '../styles/tokens';

const frequencies = resultados.frequencias ?? {};
const values = NUMBERS.map((number) => Number(frequencies[number] ?? 0));
const maxFrequency = Math.max(...values, 1);
const minFrequency = Math.min(...values);

const primes = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);

function formatCurrency(value) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function combination(n, k) {
  if (n < k) return 0;
  let result = 1;
  for (let i = 1; i <= k; i += 1) {
    result = (result * (n - i + 1)) / i;
  }
  return Math.round(result);
}

function weightedPick(pool) {
  const total = pool.reduce((sum, item) => sum + item.weight, 0);
  let target = Math.random() * total;

  for (const item of pool) {
    target -= item.weight;
    if (target <= 0) return item.number;
  }

  return pool[pool.length - 1].number;
}

export function useFrequencia() {
  function norm(number) {
    const spread = maxFrequency - minFrequency;
    if (!spread) return 0.5;
    return (Number(frequencies[number] ?? 0) - minFrequency) / spread;
  }

  function heat(number) {
    const value = norm(number);
    if (value >= 0.72) return 'hot';
    if (value <= 0.28) return 'cold';
    return 'neutral';
  }

  function heatLabel(number) {
    const current = heat(number);
    if (current === 'hot') return 'sai mais';
    if (current === 'cold') return 'sai menos';
    return 'na media';
  }

  function calcDesdobramento(qtd) {
    const jogos = combination(qtd, 15);
    const custo = jogos * PRICE_PER_GAME;
    return {
      dezenas: qtd,
      jogos,
      custo,
      custoFormatado: formatCurrency(custo),
    };
  }

  function stats(numbers) {
    const soma = numbers.reduce((sum, number) => sum + number, 0);
    const pares = numbers.filter((number) => number % 2 === 0).length;
    const quentes = numbers.filter((number) => heat(number) === 'hot').length;
    const frios = numbers.filter((number) => heat(number) === 'cold').length;
    const primos = numbers.filter((number) => primes.has(number)).length;

    return {
      soma,
      pares,
      impares: numbers.length - pares,
      primos,
      quentes,
      medios: numbers.length - quentes - frios,
      frios,
    };
  }

  function gerarJogo() {
    const pool = NUMBERS.map((number) => {
      const currentHeat = heat(number);
      const weight = currentHeat === 'hot' ? 3 : currentHeat === 'neutral' ? 2 : 1;
      return { number, weight };
    });

    const jogo = new Set();
    let guard = 0;

    while (jogo.size < 15 && guard < 250) {
      jogo.add(weightedPick(pool));
      guard += 1;
    }

    if (jogo.size < 15) {
      for (const number of NUMBERS) {
        jogo.add(number);
        if (jogo.size === 15) break;
      }
    }

    return Array.from(jogo).sort((a, b) => a - b);
  }

  return {
    frequencias: frequencies,
    totalSorteios: resultados.totalSorteios ?? 0,
    ultimosSorteios: resultados.ultimosSorteios ?? [],
    atualizadoEm: resultados.atualizadoEm,
    fonte: resultados.fonte,
    norm,
    heat,
    heatLabel,
    stats,
    calcDesdobramento,
    gerarJogo,
    formatCurrency,
    precoAposta: PRICE_PER_GAME,
  };
}
