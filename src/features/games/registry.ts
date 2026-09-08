export type GameId = 'solitario' | 'tris' | 'scacchi' | 'quiz' | 'v2048';

export type GameMeta = {
  titolo: string;
  minPlayers: number;
  maxPlayers: number;
  durataMin: number;
  tags: string[];
  copertina: string;
  rotta: string;
  descrizione: string;
};

/** Giochi interni MVP — restano la fonte per validazione gameId nelle lobby. */
export const GAMES: Record<GameId, { titolo: string; maxPlayers: number; minPlayers: number; durataMin: number }> = {
  solitario: { titolo: 'Solitario', maxPlayers: 1, minPlayers: 1, durataMin: 10 },
  tris: { titolo: 'Tris', maxPlayers: 2, minPlayers: 2, durataMin: 3 },
  scacchi: { titolo: 'Scacchi', maxPlayers: 2, minPlayers: 2, durataMin: 20 },
  quiz: { titolo: 'Quiz', maxPlayers: 1, minPlayers: 1, durataMin: 5 },
  v2048: { titolo: '2048', maxPlayers: 1, minPlayers: 1, durataMin: 5 },
};

/** Registry esteso per Home / Hub / ricerca — collegato a content.json. */
export const GAME_REGISTRY: Record<GameId, GameMeta> = {
  solitario: {
    titolo: 'Solitario Klondike', minPlayers: 1, maxPlayers: 1, durataMin: 10,
    tags: ['carte', 'classico', 'single', 'no-account', 'mobile', 'italiano', '5-min', '15-min'],
    copertina: '/covers/solitario.png', rotta: '/giochi/solitario',
    descrizione: "Ordina i semi dall'Asso al Re. Offline dopo il primo load.",
  },
  tris: {
    titolo: 'Tris 2 giocatori', minPlayers: 2, maxPlayers: 2, durataMin: 3,
    tags: ['2-giocatori', 'multiplayer', 'codice-stanza', 'no-account', 'mobile', 'italiano', '5-min'],
    copertina: '/covers/tris.png', rotta: '/giochi/tris',
    descrizione: 'Stanza codice 6 char, X vs O, rigioca stessa stanza.',
  },
  scacchi: {
    titolo: 'Scacchi 2 giocatori', minPlayers: 2, maxPlayers: 2, durataMin: 20,
    tags: ['2-giocatori', 'multiplayer', 'codice-stanza', 'no-account', 'mobile', 'italiano', '15-min'],
    copertina: '/covers/scacchi.png', rotta: '/giochi/scacchi',
    descrizione: 'Regole complete: arrocco, en passant, promozione, matto e patta.',
  },
  quiz: {
    titolo: 'Quiz veloce', minPlayers: 1, maxPlayers: 1, durataMin: 5,
    tags: ['single', 'quiz', 'no-account', 'mobile', 'italiano', '5-min'],
    copertina: '/covers/quiz.png', rotta: '/giochi/quiz',
    descrizione: 'Domande IT a risposta multipla con spiegazione e punteggio.',
  },
  v2048: {
    titolo: '2048', minPlayers: 1, maxPlayers: 1, durataMin: 5,
    tags: ['single', 'veloce', 'no-account', 'mobile', 'italiano', '5-min'],
    copertina: '/covers/2048.png', rotta: '/giochi/2048',
    descrizione: 'Unisci i numeri fino a 2048. Single, immediato, senza account, perfetto da mobile.',
  },
};

export function isGameId(v: string): v is GameId {
  return (Object.keys(GAMES) as string[]).includes(v);
}

export function getGameMeta(gameId: string): GameMeta | undefined {
  return isGameId(gameId) ? GAME_REGISTRY[gameId] : undefined;
}
