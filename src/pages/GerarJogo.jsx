import { useState } from 'react';
import Ball from '../components/Ball';
import StatCard from '../components/StatCard';
import { useFrequencia } from '../hooks/useFrequencia';

export default function GerarJogo() {
  const [jogo, setJogo] = useState([]);
  const [loading, setLoading] = useState(false);
  const { gerarJogo, stats, heat } = useFrequencia();
  const currentStats = jogo.length ? stats(jogo) : null;

  async function handleGenerate() {
    setLoading(true);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 900);
    });
    setJogo(gerarJogo());
    setLoading(false);
  }

  return (
    <div className="pageStack">
      <section className="panel heroPanel generatePanel">
        <div>
          <p className="eyebrow">Sugestao pronta</p>
          <h2>Gere 15 dezenas</h2>
          <p>
            A sugestao mistura numeros que saem mais, numeros na media e numeros que
            saem menos.
          </p>
        </div>
        <button type="button" className="button bigButton" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Montando...' : 'Gerar 15 dezenas'}
        </button>
      </section>

      <section className={`panel resultPanel${loading ? ' isLoading' : ''}`}>
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Resultado</p>
            <h3>{jogo.length ? '15 dezenas sugeridas' : 'Nenhum jogo gerado ainda'}</h3>
          </div>
        </div>

        <div className="resultBalls">
          {jogo.length ? (
            jogo.map((number, index) => (
              <Ball
                key={number}
                n={number}
                heat={heat(number)}
                size={54}
                delay={index * 24}
                show={!loading}
              />
            ))
          ) : (
            <span className="emptyText">Toque no botao azul para gerar.</span>
          )}
        </div>
      </section>

      {currentStats ? (
        <section className="statGrid">
          <StatCard label="Soma" value={currentStats.soma} />
          <StatCard label="Pares" value={currentStats.pares} detail={`${currentStats.impares} impares`} />
          <StatCard label="Primos" value={currentStats.primos} />
          <StatCard
            label="Temperatura"
            value={`${currentStats.quentes}/${currentStats.medios}/${currentStats.frios}`}
            detail="mais / media / menos"
          />
        </section>
      ) : null}

      <section className="notice">
        <strong>Aviso importante</strong>
        <p>
          O LotoZeta apenas organiza informacoes. Loteria continua sendo aleatoria;
          jogue somente valores que nao fazem falta.
        </p>
      </section>
    </div>
  );
}
