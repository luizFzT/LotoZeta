export default function StatCard({ label, value, detail, tone = 'default' }) {
  return (
    <section className={`statCard tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <p>{detail}</p> : null}
    </section>
  );
}
