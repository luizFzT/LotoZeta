import { useEffect, useMemo, useState } from 'react';
import Analise from './pages/Analise';
import Desdobrador from './pages/Desdobrador';
import GerarJogo from './pages/GerarJogo';
import EstrategiaG10 from './pages/EstrategiaG10';
import TabBar from './components/TabBar';

const tabs = [
  { id: 'analise', label: 'Numeros', helper: 'Veja as dezenas' },
  { id: 'desdobrador', label: 'Custo', helper: 'Antes de jogar' },
  { id: 'gerar', label: 'Gerar', helper: 'Sugestao pronta' },
  { id: 'g10', label: '4 jogos', helper: 'Monte em passos' },
];

const pageMap = {
  analise: Analise,
  desdobrador: Desdobrador,
  gerar: GerarJogo,
  g10: EstrategiaG10,
};

function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handlePrompt(event) {
      event.preventDefault();
      setPromptEvent(event);
      setVisible(true);
    }

    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  async function install() {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice;
    setVisible(false);
    setPromptEvent(null);
  }

  if (!visible) return null;

  return (
    <div className="installPrompt">
      <div>
        <strong>Instalar LotoZeta</strong>
        <span>Abra como app na tela inicial do celular.</span>
      </div>
      <button type="button" className="button compact" onClick={install}>
        Instalar
      </button>
      <button
        type="button"
        className="iconButton"
        aria-label="Fechar aviso de instalacao"
        onClick={() => setVisible(false)}
      >
        x
      </button>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('analise');
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const ActivePage = pageMap[activeTab];

  const activeMeta = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) ?? tabs[0],
    [activeTab],
  );

  return (
    <div className="appShell">
      <header className="appHeader">
        <div className="brandMark" aria-hidden="true">
          Z
        </div>
        <div>
          <p className="eyebrow">Lotofacil simples</p>
          <h1>LotoZeta</h1>
          <p>{activeMeta.helper}</p>
        </div>
      </header>

      <main className="appMain">
        <ActivePage
          selectedNumbers={selectedNumbers}
          setSelectedNumbers={setSelectedNumbers}
          openTab={setActiveTab}
        />
      </main>

      <InstallPrompt />
      <TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
