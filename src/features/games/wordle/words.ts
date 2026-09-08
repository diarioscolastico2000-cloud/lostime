/** Parole italiane da 5 lettere, MAIUSCOLE senza accenti. Comuni e verificabili. */

export const WORDS: string[] = [
  'ACQUA', 'AIUTO', 'ALBUM', 'AMICO', 'AMORE',
  'ANIMA', 'AROMA', 'ASINO', 'BANCO', 'BARCA',
  'BORSA', 'BOSCO', 'BRANO', 'BURRO', 'CALZA',
  'CAMPO', 'CANTO', 'CARNE', 'CARTA', 'CERCO',
  'CIELO', 'CLIMA', 'ROSSO', 'VERDE', 'CITTA',
  'CONTO', 'CORSO', 'COSTA', 'FORNO', 'CUORE',
  'SOLDI', 'DENTE', 'LIBRO', 'DOLCE', 'DONNA',
  'OPERA', 'FORZA', 'ESAME', 'NOTTE', 'PASTA',
  'MADRE', 'PADRE', 'NONNA', 'NONNO', 'MAMMA',
  'FIGLI', 'PIZZA', 'GIOIA', 'FESTA', 'FUOCO',
  'FIORE', 'FIUME', 'PORTO', 'PRATO', 'FOLLA',
  'FORMA', 'PENNA', 'CALMA', 'CALDO', 'PESCA',
  'MIELE', 'FUNGO', 'GATTO', 'TORTA', 'GENTE',
  'GIOCO', 'GOMMA', 'GRANO', 'GUIDA', 'PONTE',
  'LATTE', 'TURNO', 'LEGNO', 'LENTO', 'LUOGO',
  'TRENO', 'AEREO', 'GONNA', 'GAMBA', 'TESTA',
  'OCCHI', 'ISOLA', 'SPESA', 'METRO', 'MONDO',
  'COLLE', 'VALLE', 'MUSEO', 'RUOTA', 'CONTE',
  'NUOVO', 'AGLIO', 'VENTO', 'TEMPO', 'ONORE',
  'TOSSE', 'LOTTA', 'BANCA', 'SEDIA', 'FRASE',
  'PARCO', 'PORTA', 'VETRO', 'PAESE', 'LAPIS',
  'TAZZA', 'PESCE', 'PIANO', 'BASSO', 'PISTA',
  'POLLO', 'ZUCCA', 'POSTO', 'VERSO', 'COPPA',
  'MUTUO', 'PRIMO', 'ODORE', 'VIDEO', 'RAZZO',
  'REGNO', 'MOUSE', 'CAFFE', 'SONNO', 'SUONO',
  'SPORT', 'BAGNO', 'SERPE', 'SFIDA', 'SOGNO',
  'BALLO', 'SPINA', 'ARENA', 'TENDA', 'TERRA',
  'TORRE', 'ULIVO', 'MOTEL', 'SOPRA', 'SOTTO',
  'VILLA', 'BIRRA', 'ZAINO', 'VESPA', 'ZUPPA',
];

/** Normalizza un input: maiuscole, trim. */
export function normalizeWord(s: string): string {
  return s.trim().toUpperCase();
}

/**
 * Parola del giorno deterministica dalla data (giorno UTC).
 * Stessa data -> stessa parola, senza server.
 */
export function pickDaily(date: Date = new Date()): string {
  const days = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000,
  );
  const idx = ((days % WORDS.length) + WORDS.length) % WORDS.length;
  return WORDS[idx];
}

/** Parola casuale. `rand` iniettabile per test deterministici. */
export function pickRandom(rand: () => number = Math.random): string {
  const idx = Math.floor(rand() * WORDS.length) % WORDS.length;
  return WORDS[idx];
}
