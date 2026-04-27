import { useMemo, useState } from 'react';
import Ball from '../components/Ball';
import Chip from '../components/Chip';
import StatCard from '../components/StatCard';
import { useFrequencia } from '../hooks/useFrequencia';
import { NUMBERS } from '../styles/tokens';

const options = [15, 16, 17, 18, 19, 20];

export default function Desdobrador({ selectedNumbers, setSelectedNumbers, openTab }) {
  const initial = Math.min(20, Math.max(15, selectedNumbers.length || 15));
  const [qtd, setQtd] = useState(initial);
  const { calcDesdobramento, heat, precoAposta } = useFrequencia();
  const selectedCalc = calcDesdobramento(qtd);

  const comparison = useMemo(
    () => options.map((option) => calcDesdobramento(option)),
    [calcDesdobramento],
  );

  function fillFromSelected() {
    if (selectedNumbers.length >= 15) {
      setQtd(Math.min(20, selectedNumbers.length));
      return;
    }

    setSelectedNumbers(NUMBERS.slice(0, 15));
    setQtd(15);
  }

  return (
    <div className="pageStack">
      <section className="panel heroPanel">
        <div>
          <p className="eyebrow">Antes de pagar</p>
          <h2>Veja quanto vai custar</h2>
          <p>
            Escolha quantas dezenas quer usar. O LotoZeta mostra quantos jogos seriam
            feitos e o valor estimado.
          </p>
        </div>
        <div className="statGrid compactStats">
          <StatCard label="Dezenas" value={qtd} />
          <StatCard label="Jogos" value={selectedCalc.jogos.toLocaleString('pt-BR')} />
          <StatCard label="Custo" value={selectedCalc.custoFormatado} tone="accent" />
        </div>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Simulador</p>
            <h3>Quantas dezenas?</h3>
          </div>
          <strong className="monoValue">{qtd}</strong>
        </div>

        <input
          className="range"
          type="range"
          min="15"
          max="20"
          value={qtd}
          onChange={(event) => setQtd(Number(event.target.value))}
          aria-label="Quantidade de dezenas"
        />

        <div className="toolbar">
          {options.map((option) => (
            <Chip key={option} active={qtd === option} onClick={() => setQtd(option)}>
              {option} dezenas
            </Chip>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Sua selecao</p>
            <h3>{selectedNumbers.length || 0} numeros escolhidos</h3>
          </div>
          <button type="button" className="button secondary" onClick={fillFromSelected}>
            Usar escolha
          </button>
        </div>
        <div className="miniBallRow">
          {selectedNumbers.length ? (
            selectedNumbers.map((number) => (
              <Ball key={number} n={number} size={40} heat={heat(number)} selected />
            ))
          ) : (
            <span className="emptyText">Monte sua escolha na aba Numeros.</span>
          )}
        </div>
        <button type="button" className="textButton" onClick={() => openTab('analise')}>
          Escolher numeros
        </button>
      </section>

      <section className="panel">
        <div className="sectionHeader">
          <div>
            <p className="eyebrow">Comparativo</p>
            <h3>Mais dezenas aumentam o valor</h3>
          </div>
          <span className="smallText">
            Aposta simples: {precoAposta.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>

        <div className="costTable">
          {comparison.map((item) => {
            const width = Math.min(100, (item.jogos / comparison.at(-1).jogos) * 100);
            return (
              <div key={item.dezenas} className={item.dezenas === qtd ? 'isActive' : ''}>
                <span>{item.dezenas} dezenas</span>
                <strong>{item.jogos.toLocaleString('pt-BR')} jogos</strong>
                <em>{item.custoFormatado}</em>
                <div className="barTrack" aria-hidden="true">
                  <div className="barFill" style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
