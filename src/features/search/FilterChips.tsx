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
    <div className="lt-quick-filters" role="group" aria-label="filtri">
      {list.map((t) => {
        const on = active.includes(t);
        return (
          <button
            key={t}
            type="button"
            onClick={() => onToggle(t)}
            aria-pressed={on}
            className="lt-chip"
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}
