export type Session = { codice: string, gameId: string, nickname: string, ultimoAccesso: string };
export function saveLocalSession(s: Session): void {
  const raw = localStorage.getItem('lostime-sessions') ?? '[]';
  const arr = JSON.parse(raw) as Session[];
  const next = [s, ...arr.filter(x => x.codice !== s.codice)].slice(0, 10);
  localStorage.setItem('lostime-sessions', JSON.stringify(next));
}
export function getLocalSessions(): Session[] {
  try { return JSON.parse(localStorage.getItem('lostime-sessions') ?? '[]'); } catch { return []; }
}
