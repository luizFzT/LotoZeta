const icons = {
  analise: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="17" cy="7" r="2.5" />
      <circle cx="7" cy="17" r="2.5" />
      <circle cx="17" cy="17" r="2.5" />
    </svg>
  ),
  desdobrador: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="3" />
      <path d="M8 8h8" />
      <path d="M8 13h2" />
      <path d="M14 13h2" />
      <path d="M8 17h2" />
      <path d="M14 17h2" />
    </svg>
  ),
  gerar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15.5l-1.6-4.7L6 9.2l4.4-1.6L12 3z" />
      <path d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
      <path d="M5 14.5l.6 1.6 1.6.6-1.6.6L5 19l-.6-1.7-1.6-.6 1.6-.6.6-1.6z" />
    </svg>
  ),
  g10: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h7" />
      <path d="M4 12h7" />
      <path d="M4 18h7" />
      <path d="M15 5h5v5h-5z" />
      <path d="M15 14h5v5h-5z" />
    </svg>
  ),
};

export default function TabBar({ tabs, activeTab, onChange }) {
  return (
    <nav className="tabBar" aria-label="Navegacao principal">
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          className={`tabButton${activeTab === tab.id ? ' isActive' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="tabIcon">{icons[tab.id]}</span>
          <strong>{tab.label}</strong>
          <span className="tabHelper">{tab.helper}</span>
        </button>
      ))}
    </nav>
  );
}
