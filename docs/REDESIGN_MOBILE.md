# Redesign Mobile do LotoZeta

## Objetivo

Reformular o LotoZeta para parecer mais um app nativo de celular e menos um painel tecnico.
O publico principal sao pessoas comuns, muitas delas mais velhas, entao a prioridade e clareza,
leitura facil e botoes grandes.

## Direcao Visual

O visual deve sair do dark SaaS atual e ir para uma base clara:

- Fundo principal branco ou quase branco.
- Azul como cor de identidade, remetendo ao universo visual da Caixa.
- Verde para dezenas que saem mais.
- Vermelho suave para dezenas que saem menos.
- Amarelo para dezenas neutras ou medias, parecido com a leitura atual da tabela G10.

Sugestao inicial de paleta:

```txt
Fundo:        #F7FAFF
Superficie:   #FFFFFF
Azul Caixa:   #005CA9
Azul claro:   #E8F2FF
Verde mais:   #168A45
Vermelho menos:#D64545
Amarelo medio:#D8A500
Texto forte:  #172033
Texto medio:  #5D6B82
Borda:        #DCE6F2
```

## Regras De Interface

- Fonte maior que a atual, com boa leitura no celular.
- Botoes principais com pelo menos 52px de altura.
- Poucos elementos por tela.
- Textos curtos e diretos.
- Evitar termos muito tecnicos.
- Manter bastante espaco entre botoes e dezenas.
- Usar contraste forte entre texto e fundo.
- A navegacao inferior deve parecer app nativo, com icone e nome curto.

## Nomes Das Abas

Trocar nomes muito tecnicos por nomes mais simples:

```txt
Analise       -> Numeros
Desdobrador   -> Custo
Gerar jogo    -> Gerar
G10           -> 4 jogos
```

## Telas

### Numeros

Tela para ver e escolher dezenas.
Deve mostrar claramente:

- quais dezenas saem mais;
- quais saem menos;
- quais estao na media;
- quantas dezenas o usuario ja escolheu.

### Custo

Tela para o usuario entender quanto vai gastar antes de jogar.
Deve evitar parecer tabela complicada.
O valor final precisa ser o destaque principal.

### Gerar

Tela mais simples do app.
Um botao grande para gerar uma sugestao e as dezenas em destaque.
O aviso de responsabilidade deve continuar, mas com linguagem simples.

### 4 Jogos

Transformar a estrategia G10 em passo a passo guiado.
O usuario deve entender:

1. escolha 10 dezenas base;
2. escolha 5 no grupo A;
3. escolha 5 no grupo B;
4. escolha 5 no grupo C;
5. veja os 4 jogos prontos.

## Ordem Recomendada

1. Definir os novos tokens de cor e tipografia.
2. Reformular a navegacao inferior.
3. Ajustar a tela Numeros.
4. Ajustar Gerar jogo.
5. Ajustar Custo.
6. Ajustar 4 Jogos.
7. Revisar mobile real e PWA instalado.

## Guardrails

- Nao prometer ganho.
- Nao deixar a interface com cara de aposta agressiva.
- Nao usar texto pequeno cinza demais.
- Nao depender de icones por fonte externa.
- Nao esconder a informacao de custo.
- Nao misturar muitas cores fora da regra: azul identidade, verde mais, vermelho menos, amarelo medio.
