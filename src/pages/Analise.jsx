import { useMemo, useState } from 'react';
import Ball from '../components/Ball';
import Chip from '../components/Chip';
import StatCard from '../components/StatCard';
import { useFrequencia } from '../hooks/useFrequencia';
import { NUMBERS } from '../styles/tokens';

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'hot', label: 'Sai mais' },
  { id: 'neutral', label: 'Na media' },
  { id: 'cold', label: 'Sai menos' },
];

export default function Analise({ selectedNumbers, setSelectedNumbers, openTab }) {
  const [filter, setFilter] = useState('all');
  const { frequencias, totalSorteios, norm, heat, heatLabel, atualizadoEm } = useFrequencia();
  const selectedPreview = selectedNumbers.slice(0, 5);
  const hiddenSelected = selectedNumbers.length - selectedPreview.length;

  const numbers = useMemo(
    () => NUMBERS.filter((number) => filter === 'all' || heat(number) === filter),
    [filter, heat],
  );

  function toggleNumber(number) {
    setSelectedNumbers((current) => {
      if (current.includes(number)) {
        return current.filter((item) => item !== number);
      }

      if (current.length >= 20) return current;
      return [...current, number].sort((a, b) => a - b);
    });
  }

  const updatedLabel = atualizadoEm
    ? new Date(atualizadoEm).toLocaleDateString('pt-BR')
    : 'sem data';

  return (
    <div className="pageStack">
      <section className="panel heroPanel">
        <div>
          <p className="eyebrow">Numeros da Lotofacil</p>
          <h2>Escolha suas dezenas com calma</h2>
          <p>
            Verde mostra o que mais apareceu, amarelo fica na media e vermelho mostra
            o que saiu menos.
          </p>
        </div>
        <div className="statGrid compactStats">
          <StatCard label="Sorteios usados" value={totalSorteios.toLocaleString('pt-BR')} />
          <StatCard label="Atualizado" value={updatedLabel} />
        </div>
      </section>

      <section className="toolbar" aria-label="Filtros de frequencia">
        {filters.map((item) => (
          <Chip key={item.id} active={filter === item.id} onClick={() => setFilter(item.id)}>
            {item.label}
          </Chip>
        ))}
      </section>

      <section className="numberMap" aria-label="Mapa das dezenas">
        {numbers.map((number, index) => {
          const currentHeat = heat(number);
          const percentage = Math.round(norm(number) * 100);
          const selected = selectedNumbers.includes(number);

          return (
            <article key={number} className={`numberCard heat-${currentHeat}`}>
              <Ball
                n={number}
                heat={currentHeat}
                selected={selected}
                onClick={() => toggleNumber(number)}
                delay={index * 12}
                label={`Numero ${number}, ${heatLabel(number)}`}
              />
              <div className="numberMeta">
                <strong>{heatLabel(number)}</strong>
                <span>{frequencias[number] ?? 0} vezes</span>
                <div className="barTrack" aria-hidden="true">
                  <div className="barFill" style={{ width: `${percentage}%` }} />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="selectionPanel">
        <div>
          <p className="eyebrow">Sua escolha</p>
          <strong>{selectedNumbers.length}/20 dezenas</strong>
        </div>
        <div className="miniBallRow">
          {selectedNumbers.length ? (
            <>
              {selectedPreview.map((number) => (
                <Ball key={number} n={number} size={32} selected heat={heat(number)} />
              ))}
              {hiddenSelected > 0 ? <span className="moreSelected">+{hiddenSelected}</span> : null}
            </>
          ) : (
            <span className="emptyText">Toque nos numeros acima.</span>
          )}
        </div>
        <div className="actionRow">
          <button
            type="button"
            className="button compact secondary"
            onClick={() => setSelectedNumbers([])}
            disabled={!selectedNumbers.length}
          >
            Limpar
          </button>
          <button
            type="button"
            className="button compact"
            onClick={() => openTab('desdobrador')}
            disabled={selectedNumbers.length < 15}
          >
            Ver custo
          </button>
        </div>
      </section>
    </div>
  );
}
