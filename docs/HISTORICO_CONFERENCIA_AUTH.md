# Historico De Jogos, Conferencia E Login

## Ideia

Adicionar uma area para o usuario guardar os jogos gerados pelo LotoZeta e depois
conferir esses jogos contra um concurso da Lotofacil informado manualmente.

Fluxo desejado:

1. usuario gera ou monta um jogo;
2. app salva esse jogo no historico;
3. depois do sorteio, usuario informa o numero do concurso;
4. app busca o resultado daquele concurso;
5. app mostra quantos acertos cada jogo teve.

## Viabilidade

A ideia e viavel.

Porem existem dois niveis diferentes de implementacao:

- versao simples: salvar historico somente no celular, sem login;
- versao completa: salvar historico em banco de dados com login social.

Para o produto final, a versao completa faz mais sentido se a meta for Play Store
e uso continuo por varios usuarios.

## Estado Atual Do App

Hoje o app usa `src/data/resultados.json`.

Esse arquivo ja tem:

- numero do concurso;
- data;
- dezenas sorteadas;
- frequencias historicas.

Mas no estado atual ele guarda apenas os 10 sorteios mais recentes em
`ultimosSorteios`.

Consequencia:

- da para conferir concursos recentes;
- nao da para conferir qualquer concurso antigo sem ampliar a base de resultados;
- para a feature ficar boa, o app precisa salvar ou buscar o historico completo
  de concursos.

## Pilar 0: Confianca Nos Dados Da Caixa

Antes de historico, login, premium ou Play Store, a base de resultados precisa ser
tratada como fundacao do produto.

O app nao pode entregar resultado falso, nem atualizar dados de forma silenciosa se
a fonte falhar ou vier com formato inesperado.

O que precisa existir antes da camada premium:

- importacao oficial da Caixa com validacao forte;
- bloqueio contra sobrescrever dados bons com dados incompletos;
- validacao de concursos duplicados;
- validacao de sequencia de concursos;
- validacao de 15 dezenas unicas entre 1 e 25 na Lotofacil;
- registro da fonte usada;
- registro de data e hora da importacao;
- registro do ultimo concurso importado;
- aviso visual quando a base estiver desatualizada;
- fallback apenas com aviso claro, nunca escondido.

### Historico Oficial Vs Janela De Analise

Existem dois usos diferentes para os dados:

```txt
Historico oficial
- usado para conferir jogos;
- nao deve apagar concursos antigos;
- precisa guardar tudo que foi importado com seguranca.

Janela de analise
- usada para calcular frequencia e montar sugestoes;
- pode usar somente os ultimos 6 meses;
- quando entra concurso novo, sai o mais antigo da janela;
- isso nao apaga o concurso do historico oficial.
```

Essa separacao e importante para confianca.

Para conferencia, o app precisa conseguir comparar contra o concurso informado pelo
usuario. Para sugestao de jogos, a janela movel de 6 meses pode ser melhor do que
usar o historico inteiro, porque deixa a leitura mais recente.

### Estrutura Da Janela De 6 Meses

A regra recomendada:

```txt
draw_results
- guarda todos os concursos oficiais importados.

analysis_window
- pega apenas concursos dos ultimos 6 meses.
- recalcula frequencias usadas no app.
- entra concurso novo, sai o concurso mais antigo fora da janela.
```

No PWA atual isso pode comecar como arquivo JSON gerado no build.
No futuro com banco, isso vira consulta ou tabela calculada no backend.

## Funcionalidades Sugeridas

### 1. Salvar Jogo

Cada jogo salvo deve guardar:

- dezenas escolhidas;
- origem do jogo: gerado, manual, G10 ou custo/desdobramento;
- data em que foi criado;
- nome opcional do jogo;
- concurso esperado, se o usuario quiser preencher depois.

### 2. Historico

Nova tela ou aba para listar jogos salvos.

Informacoes principais:

- dezenas do jogo;
- data de criacao;
- status: aguardando conferencia, conferido ou sem concurso;
- quantidade de acertos quando ja conferido.

### 3. Conferir Por Concurso

O usuario informa o numero do concurso.

O app deve:

- buscar o resultado daquele concurso;
- comparar as dezenas do usuario com as dezenas sorteadas;
- mostrar acertos;
- destacar visualmente as dezenas acertadas.

Exemplo:

```txt
Concurso 3596
Acertos: 11/15
Dezenas acertadas: 01, 02, 03, 04...
```

### 4. Login

Se o historico for salvo na nuvem, precisa ter login.

Providers desejados:

- Google;
- Facebook;
- Apple.

O login deve ser simples e opcional no inicio. O usuario pode testar o app sem conta,
mas para guardar historico na nuvem ele precisa entrar.

## Monetizacao Futura E Plano Premium

Essa feature abre caminho para cobrar um valor pequeno pelo servico no futuro.
Isso nao significa cobrar agora. A ideia e estruturar o produto para poder cobrar
quando o valor estiver claro e a confianca dos dados estiver madura.

Motivo:

- historico em nuvem gera custo de banco;
- login social gera responsabilidade de manutencao;
- conferencia automatica exige base de resultados mais completa;
- sincronizacao entre dispositivos deixa de ser apenas PWA local;
- o usuario passa a ter um servico continuo, nao apenas uma tela de gerar jogo.

Modelo sugerido:

```txt
Gratis
- ver frequencia das dezenas;
- gerar jogo simples;
- calcular custo;
- usar estrategia 4 jogos;
- salvar poucos jogos apenas no celular.

Premium
- salvar historico na nuvem;
- acessar historico em outro celular;
- conferir jogos por numero de concurso;
- ver acertos de cada jogo salvo;
- organizar jogos por concurso;
- backup automatico;
- futuras notificacoes de conferencia.
```

O preco deve ser baixo, com posicionamento simples:

```txt
Plano Premium
Guarde seus jogos, confira resultados e mantenha tudo salvo na sua conta.
```

O Premium nao deve prometer ganho. Ele deve vender conveniencia, organizacao,
historico e conferencia.

## Outras Loterias No Premium

Tambem e possivel usar o Premium para outras modalidades, como Quina e Mega-Sena.

Isso e viavel, mas precisa ser tratado como suporte multi-loteria, nao como apenas
mais um botao.

Cada modalidade tem regras proprias:

```txt
Lotofacil
- dezenas de 1 a 25;
- jogo simples com 15 dezenas.

Mega-Sena
- dezenas de 1 a 60;
- jogo simples com 6 dezenas.

Quina
- dezenas de 1 a 80;
- jogo simples com 5 dezenas.
```

Para jogos aleatorios, o custo tecnico e baixo. O app so precisa conhecer:

- intervalo de dezenas;
- quantidade minima por jogo;
- quantidade maxima permitida;
- preco da aposta simples;
- forma de conferir acertos.

O que aumenta o trabalho e:

- buscar resultados de cada modalidade;
- manter historico atualizado por modalidade;
- ajustar telas para nao confundir pessoas mais velhas;
- salvar no banco qual modalidade pertence a cada jogo;
- conferir cada jogo usando a regra correta.

## Vai Ficar Caro Demais?

No comeco, provavelmente nao.

O custo de banco para salvar jogos simples tende a ser baixo, porque cada jogo e
apenas uma lista pequena de numeros. O que pode pesar mais nao e armazenamento,
mas manutencao:

- login;
- banco;
- importacao dos resultados;
- backup;
- suporte;
- Play Store;
- cobranca;
- possiveis notificacoes futuras.

Recomendacao:

- comecar Premium apenas com Lotofacil;
- estruturar o banco ja preparado para varias modalidades;
- liberar Mega-Sena e Quina depois, como expansao;
- evitar cobrar separado por modalidade no inicio;
- usar um plano unico barato para "historico e conferencia".

Assim o produto nao fica complexo cedo demais, mas a arquitetura ja nao nasce
travada apenas na Lotofacil.

## Cuidados Com A Cobranca

- O app gratuito precisa continuar util.
- O Premium deve ser vendido como organizacao e historico, nao como vantagem para ganhar.
- A tela de pagamento nao deve parecer aposta.
- O usuario precisa entender por que existe custo: conta, backup, banco e conferencia.
- Antes de cobrar, precisa ter politica de privacidade e termos basicos.
- Se publicar na Play Store, avaliar cobranca via Google Play Billing.

## Estrutura De Banco Recomendada

Uma estrutura simples seria:

```txt
users
- id
- email
- display_name
- avatar_url
- provider
- created_at

saved_games
- id
- user_id
- lottery_type
- numbers
- source
- label
- target_contest
- created_at
- updated_at

draw_results
- lottery_type
- contest_number
- draw_date
- numbers
- source
- imported_at
- source_hash
- validation_status

data_import_runs
- id
- lottery_type
- source
- started_at
- finished_at
- status
- contests_found
- first_contest
- last_contest
- error_message

analysis_windows
- id
- lottery_type
- window_months
- first_contest
- last_contest
- draw_count
- frequencies
- calculated_at

game_checks
- id
- user_id
- saved_game_id
- lottery_type
- contest_number
- hits
- hit_numbers
- checked_at
```

## Opcoes De Backend

### Supabase

Boa opcao para este projeto.

Vantagens:

- banco Postgres;
- auth social;
- regras por usuario;
- bom para historico e consultas;
- funciona bem com React.

### Firebase

Tambem e viavel.

Vantagens:

- auth social forte;
- facil para app mobile;
- Firestore pode guardar historico por usuario.

Ponto de atencao:

- modelagem relacional fica menos natural do que em Postgres.

## Recomendacao Inicial

Nao migrar tudo direto para banco agora.

Ordem mais segura:

1. reforcar a importacao da Caixa e as validacoes dos concursos;
2. separar historico oficial de janela de analise de 6 meses;
3. ampliar `resultados.json` para conter mais concursos ou gerar uma base completa;
4. criar historico local usando `localStorage` ou `IndexedDB`;
5. adicionar tela de historico;
6. adicionar conferencia por concurso usando os resultados oficiais salvos;
7. validar se a feature realmente faz sentido no uso real;
8. so depois adicionar login e banco;
9. deixar premium apenas como estrutura futura, nao como cobranca inicial.

## Quando Migrar Para Banco

Migrar para banco quando pelo menos uma destas condicoes for verdadeira:

- usuario precisa recuperar historico em outro celular;
- app sera publicado na Play Store;
- sera necessario login;
- sera necessario backup;
- historico local ficou limitado;
- vai existir notificacao ou sincronizacao futura.

## Riscos E Cuidados

- Nao prometer premio ou aumento garantido de chance.
- Deixar claro que a conferencia apenas compara numeros.
- Proteger dados pessoais se houver login.
- Criar politica de privacidade antes de publicar com login.
- Evitar pedir login antes do usuario entender valor do app.
- Apple login pode ser obrigatorio em alguns cenarios se houver outros logins sociais
  em app iOS no futuro.

## Veredito

A feature e boa e combina com o produto.

Ela aumenta o valor do LotoZeta porque transforma o app de gerador visual em
historico pessoal de jogos e conferencias.

Mas a implementacao deve ser faseada:

1. confianca dos dados da Caixa;
2. historico completo de resultados;
3. janela de analise de 6 meses;
4. historico local de jogos;
5. conferencia por concurso;
6. login e banco;
7. premium futuro;
8. sincronizacao entre dispositivos.
