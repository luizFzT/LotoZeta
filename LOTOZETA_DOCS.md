# LotoZeta - Documentacao Completa para Claude Code

> PWA + GitHub Pages + Zeta Brand + Luiz Fuzeta

## 1. Visao Geral

O LotoZeta e um PWA de analise visual da Lotofacil para pessoas nao tecnicas. A ideia e mostrar frequencia historica das dezenas, simular desdobramentos e gerar jogos balanceados com uma experiencia simples o bastante para uso no celular.

O app nao promete premio nem aumento garantido de chance. Ele organiza dados historicos, ajuda a visualizar padroes e transforma estrategias populares em uma interface mais clara.

## 2. Decisoes Refinadas

- Hospedagem: GitHub Pages, sem backend e sem custo fixo.
- Stack: React + Vite + service worker manual.
- Dados: `src/data/resultados.json`, gerado por `scripts/fetch-resultados.js` a partir do XLSX oficial da Caixa e completado pela API oficial de concurso atual.
- Publico: usuario comum, com linguagem simples e botoes grandes.
- Preco base: `R$ 3,50` por aposta simples de 15 numeros, conforme tabela atual da Caixa consultada em 2026-04-27.
- Tom visual: dark SaaS analytics, Zeta Brand, com verde como unico destaque de interface.

## 3. Design System Zeta

```js
export const T = {
  bg: "#0d1117",
  surface: "#161b22",
  surfaceHi: "#1c2128",
  border: "#30363d",
  borderSub: "#21262d",
  accent: "#00c896",
  accentDim: "#00c89620",
  accentMid: "#00c89640",
  hot: "#f78166",
  cold: "#79c0ff",
  gold: "#e3b341",
  text: "#e6edf3",
  textMid: "#8b949e",
  textSub: "#484f58",
  white: "#ffffff",
};
```

Regras:

- Inter para interface geral.
- JetBrains Mono para dezenas, contadores e valores.
- Radius: 8px para cards, 6px para chips, 50% para bolas.
- Botoes e alvos de toque com no minimo 48px.
- Vermelho = sai mais, azul = sai menos, dourado = medio.
- Verde `#00c896` apenas para acao, selecao e destaque principal.

## 4. Arquitetura

```txt
lotozeta/
  public/
    manifest.json
    favicon.svg
    icons/
      icon-192.png
      icon-512.png
  src/
    main.jsx
    App.jsx
    index.css
    styles/tokens.js
    data/resultados.json
    hooks/useFrequencia.js
    components/Ball.jsx
    components/Chip.jsx
    components/StatCard.jsx
    components/TabBar.jsx
    pages/Analise.jsx
    pages/Desdobrador.jsx
    pages/GerarJogo.jsx
    pages/EstrategiaG10.jsx
  scripts/fetch-resultados.js
  .github/workflows/deploy.yml
```

## 5. Telas

### Analise

- Grid 5x5 com as 25 dezenas.
- Filtro por todos, quentes, medios e frios.
- Frequencia absoluta e percentual visual.
- Selecao de ate 20 dezenas para usar no desdobrador.

### Desdobrador

- Escolha de 15 a 20 dezenas.
- Calculo por combinacao `C(n, 15)`.
- Custo estimado usando `R$ 3,50` por jogo simples.
- Tabela comparativa de cobertura e custo.

### Gerar Jogo

- Um botao principal.
- Gera 15 dezenas ponderando quentes, medias e frias.
- Mostra soma, pares, impares, primos e distribuicao de temperatura.
- Exibe aviso de responsabilidade.

### Estrategia G10

- Passo 1: distribuir 25 dezenas em Base (10), A (5), B (5), C (5).
- Passo 2: ver quatro jogos:
  - Jogo 1: Base + A
  - Jogo 2: Base + B
  - Jogo 3: Base + C
  - Jogo 4: A + B + C
- Todos os 25 numeros ficam cobertos em quatro bilhetes.
- Custo estimado atual: `4 x R$ 3,50 = R$ 14,00`.

## 6. PWA

- `display: standalone`.
- Cache de assets e JSON por service worker manual em `public/sw.js`.
- Funciona offline com o ultimo `resultados.json` baixado.
- Mostra botao de instalar quando o navegador expuser `beforeinstallprompt`.

## 7. Deploy

O deploy roda no push para `main`:

1. Instala dependencias.
2. Roda `npm run fetch-data`.
3. Executa `npm run build`.
4. Publica `dist/` pelo GitHub Pages via workflow.

Nota de implementacao: o endpoint de download da Caixa entrega XLSX, nao CSV puro. O script usa `fflate` para abrir o XLSX como ZIP, ler `xl/worksheets/sheet1.xml` e converter as linhas em `resultados.json`. Como esse download historico pode ficar defasado, o script tambem consulta `https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil` e busca concursos faltantes em `https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/{concurso}`. O historico JSON publico fica apenas como fallback se a Caixa falhar.

Nota de UX: a tela de analise deve mostrar `Dados ate Concurso X` usando `ultimoConcurso`, e nao a data de download `atualizadoEm`. A data de download serve para auditoria tecnica, mas nao prova que o historico esta atual.

Nota de seguranca: a primeira versao usava `vite-plugin-pwa`, mas o audit apontou vulnerabilidade alta em dependencias transitivas do Workbox. O MVP ficou com service worker manual para manter PWA sem esse pacote.

URL esperada depois de configurar GitHub Pages:

```txt
https://luizfzt.github.io/LotoZeta/
```

## 8. Prompts Curtos para Continuidade

### Ajustar experiencia mobile

```txt
Revise o LotoZeta pensando em uso por pessoa nao tecnica no celular.
Mantenha Zeta Brand, botoes de 48px, linguagem simples e sem promessas de premio.
Priorize legibilidade, clareza de acao e ausencia de overflow.
```

### Melhorar gerador de jogos

```txt
Melhore o gerador de jogos do LotoZeta sem criar promessa de ganho.
Use frequencia historica apenas como ponderacao e preserve estatisticas visuais:
soma, pares, impares, primos, quentes, medios e frios.
```

### Evoluir dados

```txt
Revise scripts/fetch-resultados.js para ficar mais robusto contra mudancas no CSV da Caixa.
Nao mude a interface. Valide que src/data/resultados.json continua com:
atualizadoEm, totalSorteios, frequencias e ultimosSorteios.
```

## 9. Referencias

- Caixa Lotofacil: https://loterias.caixa.gov.br/Paginas/Lotofacil.aspx
- Endpoint oficial de download: https://servicebus2.caixa.gov.br/portaldeloterias/api/resultados/download?modalidade=Lotof%C3%A1cil
- Endpoint oficial atual: https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil
- Historico JSON fallback: https://raw.githubusercontent.com/guilhermeasn/loteria.json/master/data/lotofacil.json
- Vite GitHub Pages: https://vitejs.dev/guide/static-deploy.html#github-pages
