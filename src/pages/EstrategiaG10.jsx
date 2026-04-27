import { useMemo, useState } from 'react';
import Ball from '../components/Ball';
import Chip from '../components/Chip';
import StatCard from '../components/StatCard';
import { useFrequencia } from '../hooks/useFrequencia';
import { NUMBERS, PRICE_PER_GAME, T } from '../styles/tokens';

const groupsConfig = [
  { id: 'base', label: 'Base', short: 'Base', limit: 10, color: T.accent, desc: '10 fixos' },
  { id: 'a', label: 'Grupo A', short: 'A', limit: 5, color: T.hot, desc: '5 numeros' },
  { id: 'b', label: 'Grupo B', short: 'B', limit: 5, color: T.cold, desc: '5 numeros' },
  { id: 'c', label: 'Grupo C', short: 'C', limit: 5, color: T.gold, desc: '5 numeros' },
];

const emptyGroups = {
  base: [],
  a: [],
  b: [],
  c: [],
};

const combinations = [
  { label: 'Jogo 1', groups: ['base', 'a'], helper: 'Base + A' },
  { label: 'Jogo 2', groups: ['base', 'b'], helper: 'Base + B' },
  { label: 'Jogo 3', groups: ['base', 'c'], helper: 'Base + C' },
  { label: 'Jogo 4', groups: ['a', 'b', 'c'], helper: 'A + B + C' },
];

function nextIncompleteGroup(groups) {
  return groupsConfig.find((group) => groups[group.id].length < group.limit)?.id ?? 'base';
}

function GrupoBadge({ group, count }) {
  return (
    <div className="grupoBadge" style={{ '--group-color': group.color }}>
      <span aria-hidden="true" />
      <strong>{group.label}</strong>
      <em>
        {count}/{group.limit}
      </em>
    </div>
  );
}

const heatMeta = {
  hot: { label: 'sai mais', color: T.hot },
  neutral: { label: 'na media', color: T.gold },
  cold: { label: 'sai menos', color: T.cold },
};

function HeatBall({ number, numberHeat, group, size = 48, selected = false }) {
  const meta = heatMeta[numberHeat] ?? heatMeta.neutral;

  return (
    <div className="heatBallWrap" style={{ '--heat-color': meta.color }}>
      <Ball
        n={number}
        size={size}
        heat={numberHeat}
        color={group?.color}
        selected={selected}
        label={`Numero ${number}, ${meta.label}${group ? `, ${group.label}` : ''}`}
      />
      <span className="heatDot" aria-hidden="true" />
    </div>
  );
}

function countHeat(numbers, heat) {
  return numbers.reduce(
    (acc, number) => {
      acc[heat(number)] += 1;
      return acc;
    },
    { hot: 0, neutral: 0, cold: 0 },
  );
}

export default function EstrategiaG10() {
  const [step, setStep] = useState('montar');
  const [activeGroup, setActiveGroup] = useState('base');
  const [groups, setGroups] = useState(emptyGroups);
  const { heat, formatCurrency, stats } = useFrequencia();

  const assignment = useMemo(() => {
    const map = new Map();
    for (const group of groupsConfig) {
      for (const number of groups[group.id]) {
        map.set(number, group.id);
      }
    }
    return map;
  }, [groups]);

  const complete = groupsConfig.every((group) => groups[group.id].length === group.limit);
  const totalSelected = groupsConfig.reduce((sum, group) => sum + groups[group.id].length, 0);

  const games = useMemo(
    () =>
      combinations.map((combo) => ({
        ...combo,
        numbers: combo.groups.flatMap((groupId) => groups[groupId]).sort((x, y) => x - y),
      })),
    [groups],
  );

  const activeConfig = getGroup(activeGroup);

  function getGroup(id) {
    return groupsConfig.find((group) => group.id === id);
  }

  function reset() {
    setGroups({ base: [], a: [], b: [], c: [] });
    setActiveGroup('base');
    setStep('montar');
  }

  function toggleNumber(number) {
    setGroups((current) => {
      const currentAssignment = groupsConfig.find((group) => current[group.id].includes(number))?.id;
      const next = {
        base: [...current.base],
        a: [...current.a],
        b: [...current.b],
        c: [...current.c],
      };

      if (currentAssignment) {
        next[currentAssignment] = next[currentAssignment].filter((item) => item !== number);
        setActiveGroup(currentAssignment);
        return next;
      }

      const group = getGroup(activeGroup);
      if (!group || next[group.id].length >= group.limit) return current;

      next[group.id] = [...next[group.id], number].sort((x, y) => x - y);

      if (next[group.id].length === group.limit) {
        setActiveGroup(nextIncompleteGroup(next));
      }

      return next;
    });
  }

  return (
    <div className="pageStack">
      <section className="panel heroPanel">
        <div>
          <p className="eyebrow">4 jogos guiados</p>
          <h2>Monte grupos passo a passo</h2>
          <p>
            Escolha 10 numeros de base e depois tres grupos de 5. No final, o app
            mostra os 4 jogos prontos.
          </p>
        </div>
        <div className="statGrid compactStats">
          <StatCard label="Selecionados" value={`${totalSelected}/25`} />
          <StatCard label="Custo" value={formatCurrency(4 * PRICE_PER_GAME)} tone="accent" />
        </div>
      </section>

      <section className="stepSwitch" aria-label="Passos da estrategia">
        <Chip active={step === 'montar'} onClick={() => setStep('montar')}>
          1. Escolher
        </Chip>
        <Chip active={step === 'jogos'} onClick={() => complete && setStep('jogos')} disabled={!complete}>
          2. Ver jogos
        </Chip>
      </section>

      {step === 'montar' ? (
        <>
          <section className="panel g10ActivePanel">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">Adicionando ao grupo</p>
                <h3>
                  {groups[activeGroup].length < activeConfig.limit
                    ? `Faltam ${activeConfig.limit - groups[activeGroup].length} em ${activeConfig.label}`
                    : `${activeConfig.label} completo`}
                </h3>
              </div>
              <button type="button" className="button secondary" onClick={reset}>
                Limpar
              </button>
            </div>

            <div className="groupPicker">
              {groupsConfig.map((group) => {
                const count = groups[group.id].length;
                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`groupButton${activeGroup === group.id ? ' isActive' : ''}`}
                    onClick={() => setActiveGroup(group.id)}
                    style={{ '--group-color': group.color }}
                  >
                    <span>{group.short}</span>
                    <strong>
                      {count}/{group.limit}
                    </strong>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="g10Grid" aria-label="Distribuicao dos numeros">
            {NUMBERS.map((number) => {
              const groupId = assignment.get(number);
              const group = groupId ? getGroup(groupId) : null;
              const faded = !group && totalSelected > 0;
              const numberHeat = heat(number);
              const heatInfo = heatMeta[numberHeat] ?? heatMeta.neutral;
              return (
                <button
                  key={number}
                  type="button"
                  className={`g10Cell${group ? ' isAssigned' : ''}${faded ? ' isFaded' : ''}`}
                  onClick={() => toggleNumber(number)}
                  style={{ '--group-color': group?.color ?? T.textSub }}
                >
                  <HeatBall number={number} numberHeat={numberHeat} group={group} size={50} />
                  <span className="heatBadge" style={{ '--heat-color': heatInfo.color }}>
                    {heatInfo.label}
                  </span>
                  <span className="groupLabel">{group ? `GRP ${group.short}` : 'livre'}</span>
                </button>
              );
            })}
          </section>

          <section className="panel">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">Resumo</p>
                <h3>Grupos montados</h3>
              </div>
              <button
                type="button"
                className="button"
                disabled={!complete}
                onClick={() => setStep('jogos')}
              >
                {complete ? 'Ver jogos' : `Faltam ${25 - totalSelected}`}
              </button>
            </div>

            <div className="groupSummary">
              {groupsConfig.map((group) => {
                const heatCount = countHeat(groups[group.id], heat);

                return (
                  <article key={group.id} style={{ '--group-color': group.color }}>
                    <div>
                      <strong>{group.label}</strong>
                      <span>
                        {groups[group.id].length}/{group.limit}
                      </span>
                    </div>
                    <div className="miniBallRow">
                      {groups[group.id].map((number) => (
                        <HeatBall
                          key={number}
                          number={number}
                          numberHeat={heat(number)}
                          group={group}
                          size={34}
                        />
                      ))}
                    </div>
                    <div className="heatMiniStats" aria-label={`Temperatura do ${group.label}`}>
                      <span style={{ '--heat-color': T.hot }}>{heatCount.hot} sai mais</span>
                      <span style={{ '--heat-color': T.gold }}>{heatCount.neutral} media</span>
                      <span style={{ '--heat-color': T.cold }}>{heatCount.cold} sai menos</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="legendRow" aria-label="Legenda dos grupos">
            {groupsConfig.map((group) => (
              <GrupoBadge key={group.id} group={group} count={groups[group.id].length} />
            ))}
          </section>

          <section className="g10Games">
            {games.map((game) => {
              const gameStats = stats(game.numbers);
              return (
                <article key={game.label} className="panel gameCard">
                  <div className="sectionHeader">
                    <div>
                      <p className="eyebrow">{game.helper}</p>
                      <h3>{game.label}</h3>
                    </div>
                    <div className="comboDots" aria-hidden="true">
                      {game.groups.map((groupId) => {
                        const group = getGroup(groupId);
                        return <span key={groupId} style={{ '--group-color': group.color }} />;
                      })}
                    </div>
                  </div>

                  <div className="resultBalls compact">
                    {game.numbers.map((number) => {
                      const group = getGroup(assignment.get(number));
                      return (
                        <HeatBall
                          key={number}
                          number={number}
                          numberHeat={heat(number)}
                          group={group}
                          size={42}
                        />
                      );
                    })}
                  </div>

                  <div className="gameStats">
                    <span>Soma {gameStats.soma}</span>
                    <span>{gameStats.pares} pares</span>
                    <span>{gameStats.impares} impares</span>
                    <span>{gameStats.quentes} sai mais</span>
                    <span>{gameStats.frios} sai menos</span>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="notice">
            <strong>Como ler a estrategia</strong>
            <p>
              Os tres primeiros jogos usam a Base. O quarto jogo junta A, B e C para
              cobrir o restante.
            </p>
          </section>

          <button type="button" className="button secondary fullButton" onClick={() => setStep('montar')}>
            Refazer grupos
          </button>
        </>
      )}
    </div>
  );
}
