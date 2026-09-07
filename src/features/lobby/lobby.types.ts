export type LobbyState = { codice: string, gameId: string, maxPlayers: number, giocatori: { nickname: string, ordine: number }[], stato: 'attesa'|'in-gioco'|'finita' };
