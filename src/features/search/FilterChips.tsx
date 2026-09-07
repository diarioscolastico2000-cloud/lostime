export const FILTER_TAGS = [
  'single',
  '2-giocatori',
  'multiplayer',
  'codice-stanza',
  'quiz',
  'scacchi',
  'carte',
  'parole',
  'spazio',
  'cielo',
  'mare',
  'mappa',
  'scienza',
  '5-min',
  '15-min',
  'no-account',
  'mobile',
  'italiano',
  'link-esterno',
] as const;

export function FilterChips({
  tags,
  active,
  onToggle,
}: {
  tags?: readonly string[];
  active: string[];
  onToggle: (tag: string) => void;
}) {
  const list = tags ?? FILTER_TAGS;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="group" aria-label="filtri">
      {list.map((t) => {
        const on = active.includes(t);
        return (
          <button
            key={t}
            onClick={() => onToggle(t)}
            aria-pressed={on}
            style={{
              minHeight: 40, borderRadius: 999, padding: '8px 14px',
              background: on ? '#FFD23F' : '#1e1e2a', color: on ? '#1a1a1a' : '#fff',
              border: '1px solid #333', fontWeight: on ? 700 : 400,
            }}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
