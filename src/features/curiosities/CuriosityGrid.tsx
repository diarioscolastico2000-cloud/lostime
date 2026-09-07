import curiosities from './curiosities.json';
import { CuriosityCard } from './CuriosityCard';

export type CuriosityItem = {
  id: string;
  titolo: string;
  testo?: string;
  descrizione?: string;
  fonteNome?: string;
  fonteUrl?: string;
  link?: string;
  tags?: string[];
  categoria?: string;
};

export function getCuriosities(): CuriosityItem[] {
  return curiosities as CuriosityItem[];
}

/** Griglia mobile-first per /curiosita: 1 col mobile, auto-fit desktop. */
export function CuriosityGrid({ items }: { items?: CuriosityItem[] }) {
  const list = items ?? getCuriosities();
  return (
    <div
      style={{
        display: 'grid', gap: 12,
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
      }}
    >
      {list.map((c) => (
        <CuriosityCard
          key={c.id}
          titolo={c.titolo}
          testo={c.testo ?? c.descrizione}
          descrizione={c.descrizione}
          fonteNome={c.fonteNome}
          fonteUrl={c.fonteUrl ?? c.link}
          link={c.link}
          tags={c.tags}
          categoria={c.categoria}
        />
      ))}
    </div>
  );
}
