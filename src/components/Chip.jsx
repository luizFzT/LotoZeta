export default function Chip({ active = false, children, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className={`chip${active ? ' isActive' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
