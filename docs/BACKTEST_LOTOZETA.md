# Backtest LotoZeta

Gerado em: 2026-04-27T23:28:42.285Z

## Base usada

- Fonte: https://servicebus2.caixa.gov.br/portaldeloterias/api/resultados/download?modalidade=Lotof%C3%A1cil
- Atualizado em: 2026-04-27T23:27:46.512Z
- Sorteios no arquivo: 3596
- Janela inicial minima: 100 concursos
- Concursos testados: 101 ate 3596
- Preco por jogo simples usado no custo: R$ 3,50

## Metodo

O teste e walk-forward: cada concurso e avaliado usando apenas os concursos anteriores para calcular frequencia. Nao ha uso do resultado futuro para montar o jogo testado.

Nao calcula lucro real, porque o arquivo historico nao inclui rateio por faixa. O relatorio mede acertos e quantidade de bilhetes em faixas premiadas da Lotofacil, de 11 a 15 acertos.

## Estrategias

- Top 15 historico: Escolhe as 15 dezenas mais frequentes antes do concurso testado.
- Balanceado LotoZeta: Mistura 7 dezenas mais frequentes, 5 intermediarias e 3 menos frequentes.
- G10 automatico: Monta Base 10 + tres grupos de 5 por frequencia e testa os 4 jogos da estrategia.

## Resultado

| Estrategia | Concursos | Jogos total | Custo estimado | Media melhor acerto | Melhor acerto | Concursos 11+ | Bilhetes 11 | Bilhetes 12 | Bilhetes 13 | Bilhetes 14 | Bilhetes 15 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Top 15 historico | 3496 | 3496 | R$ 12.236,00 | 9,03 | 14 | 388 | 330 | 54 | 3 | 1 | 0 |
| Balanceado LotoZeta | 3496 | 3496 | R$ 12.236,00 | 9,05 | 13 | 399 | 329 | 65 | 5 | 0 | 0 |
| G10 automatico | 3496 | 13984 | R$ 48.944,00 | 10,39 | 14 | 1337 | 1267 | 234 | 15 | 2 | 0 |

## Leitura rapida

- "Concursos 11+" conta concursos em que a estrategia teve pelo menos um jogo com 11 ou mais acertos.
- "Bilhetes 11..15" conta bilhetes individuais. A estrategia G10 testa 4 bilhetes por concurso, por isso esse numero pode crescer mais rapido.
- O resultado serve para comparar comportamento historico, nao para prometer premio.
