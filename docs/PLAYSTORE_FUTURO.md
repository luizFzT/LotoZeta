# Caminho Futuro Para Play Store

## Resumo

O LotoZeta ja tem uma boa base para virar app de celular: e um PWA em React/Vite,
tem manifesto, icones, service worker, layout mobile e build funcionando.

Mesmo assim, ele ainda nao esta pronto para ser enviado diretamente para a Play Store.
A Play Store exige um app Android empacotado, normalmente no formato `.aab`
Android App Bundle.

## Decisao Recomendada

Para o LotoZeta, o caminho mais indicado e usar Capacitor.

Motivo:

- o app ja e React/Vite;
- a experiencia precisa parecer app nativo;
- os dados principais podem continuar dentro do app;
- nao depende tanto de validacao de dominio como no modelo TWA;
- facilita testar instalado em Android real antes de publicar.

## Alternativa

Tambem seria possivel usar TWA, Trusted Web Activity, para publicar o PWA como app.

Porem esse caminho exige:

- site HTTPS estavel;
- dominio proprio ou bem configurado;
- arquivo `assetlinks.json`;
- verificacao de propriedade entre site e app;
- mais cuidado com cache e comportamento do navegador.

Para este projeto, TWA fica como alternativa, nao como primeira escolha.

## O Que Falta Para Play Store

Antes de publicar, ainda sera necessario:

- adicionar Capacitor ao projeto;
- gerar projeto Android;
- configurar nome do app, pacote e versao;
- gerar icones finais em todos os tamanhos;
- gerar `.aab` assinado;
- testar instalado em celular Android real;
- criar politica de privacidade;
- preencher o formulario Data Safety no Play Console;
- preparar screenshots da loja;
- preparar descricao curta e descricao completa;
- revisar regras de loteria para nao parecer promessa de ganho.

## Guardrails Para Publicacao

- Nao prometer aumento garantido de chance.
- Nao usar linguagem agressiva de aposta.
- Deixar claro que e uma ferramenta de organizacao estatistica.
- Manter custo das apostas sempre visivel quando houver simulacao.
- Manter a experiencia simples para pessoas mais velhas.
- Testar em celular real antes de gerar versao final.

## Ordem Futura Recomendada

1. Finalizar o redesign mobile.
2. Testar o PWA no celular.
3. Adicionar Capacitor.
4. Rodar o app instalado em Android.
5. Corrigir problemas de tela cheia, teclado, safe area e icones.
6. Gerar build Android `.aab`.
7. Preparar Play Console.
8. Publicar primeiro em teste interno.
9. So depois enviar para producao.

## Estado Atual

O app ainda deve ser tratado como PWA mobile-first.
A mudanca para Play Store e viavel, mas deve ser feita em uma etapa separada,
depois que a interface mobile estiver estavel.
