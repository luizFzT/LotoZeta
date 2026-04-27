import { T } from '../styles/tokens';

const heatColor = {
  hot: { border: T.hot, bg: `${T.hot}18`, text: T.hot },
  cold: { border: T.cold, bg: `${T.cold}18`, text: T.cold },
  neutral: { border: T.gold, bg: `${T.gold}18`, text: T.gold },
};

export default function Ball({
  n,
  size = 48,
  selected = false,
  onClick,
  delay = 0,
  show = true,
  heat = 'neutral',
  color,
  label,
}) {
  const base = color
    ? { border: color, bg: `${color}22`, text: color }
    : heatColor[heat] ?? heatColor.neutral;

  const colors = selected
    ? { border: T.accent, bg: T.accentDim, text: T.accent }
    : base;

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      className="ball"
      onClick={onClick}
      aria-label={label ?? `Numero ${n}`}
      style={{
        '--ball-size': `${size}px`,
        '--ball-border': colors.border,
        '--ball-bg': colors.bg,
        '--ball-text': colors.text,
        '--ball-delay': `${delay}ms`,
        '--ball-scale': show ? '1' : '0.6',
        '--ball-opacity': show ? 1 : 0,
        '--ball-shadow': selected
          ? `0 0 0 1px ${T.accent}30, 0 0 14px ${T.accent}22`
          : 'none',
      }}
    >
      {String(n).padStart(2, '0')}
    </Component>
  );
}
