export type Card = { seme: 'cuori'|'quadri'|'fiori'|'picche', valore: number, coperta: boolean, id?: string };
const semi: Card['seme'][] = ['cuori','quadri','fiori','picche'];
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const s of semi) for (let v = 1; v <= 13; v++) deck.push({ seme: s, valore: v, coperta: true, id: `${s}-${v}` });
  return deck;
}
export function canDropOnFoundation(top: Card | null, card: Card): boolean {
  if (top === null) return card.valore === 1;
  return top.seme === card.seme && card.valore === top.valore + 1;
}
export function isRed(seme: Card['seme']): boolean { return seme === 'cuori' || seme === 'quadri'; }
export function canDropOnTableau(top: Card | null, card: Card): boolean {
  if (top === null) return card.valore === 13;
  return isRed(top.seme) !== isRed(card.seme) && card.valore === top.valore - 1;
}

export type GameState = {
  tableau: Card[][];
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  moves: number;
};

export type FoundationSource = { from: 'waste' } | { from: 'tableau'; col: number };
export type TableauSource =
  | { from: 'waste' }
  | { from: 'foundation'; col: number }
  | { from: 'tableau'; col: number; index: number };

/** Fisher-Yates: restituisce un nuovo mazzo mescolato, non muta l'input. */
export function shuffleDeck(deck: Card[]): Card[] {
  const d = deck.map((c) => ({ ...c }));
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}

/** Distribuisce un Klondike: 7 colonne (1..7 carte, ultima scoperta), resto in stock. */
export function dealGame(deck?: Card[]): GameState {
  const cards = shuffleDeck(deck ?? createDeck());
  const tableau: Card[][] = Array.from({ length: 7 }, () => []);
  let k = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const c = cards[k++];
      c.coperta = row < col; // solo l'ultima di ogni colonna è scoperta
      tableau[col].push(c);
    }
  }
  const stock = cards.slice(k).map((c) => ({ ...c, coperta: true }));
  return { tableau, stock, waste: [], foundations: [[], [], [], []], moves: 0 };
}

function cloneState(s: GameState): GameState {
  return {
    tableau: s.tableau.map((col) => col.map((c) => ({ ...c }))),
    stock: s.stock.map((c) => ({ ...c })),
    waste: s.waste.map((c) => ({ ...c })),
    foundations: s.foundations.map((f) => f.map((c) => ({ ...c }))),
    moves: s.moves,
  };
}

/** Scopre la carta in cima alla colonna tableau se era coperta. */
function flipTop(tableauCol: Card[]): void {
  const top = tableauCol[tableauCol.length - 1];
  if (top && top.coperta) top.coperta = false;
}

/**
 * Pesca 1 carta da stock a waste. Se lo stock è esaurito, ricicla il waste
 * (ordine invertito, coperte) in stock. Limite infinito in MVP.
 */
export function drawFromStock(s: GameState): GameState {
  const next = cloneState(s);
  if (next.stock.length > 0) {
    const c = next.stock.pop()!;
    c.coperta = false;
    next.waste.push(c);
    next.moves += 1;
    return next;
  }
  if (next.waste.length > 0) {
    next.stock = next.waste
      .slice()
      .reverse()
      .map((c) => ({ ...c, coperta: true }));
    next.waste = [];
    next.moves += 1;
  }
  return next;
}

function topOf(pile: Card[]): Card | null {
  return pile.length === 0 ? null : pile[pile.length - 1];
}

/**
 * Sposta la carta in cima (waste o colonna tableau) su una fondazione.
 * Se destPile è omesso sceglie la prima fondazione compatibile.
 */
export function moveToFoundation(
  s: GameState,
  source: FoundationSource,
  destPile?: number,
): { state: GameState; ok: boolean } {
  const card: Card | undefined =
    source.from === 'waste'
      ? (topOf(s.waste) ?? undefined)
      : (topOf(s.tableau[source.col] ?? []) ?? undefined);
  if (!card || card.coperta) return { state: s, ok: false };
  const targets =
    destPile !== undefined
      ? [destPile]
      : s.foundations.map((_, i) => i);
  for (const i of targets) {
    const pile = s.foundations[i];
    if (!pile) continue;
    if (canDropOnFoundation(topOf(pile), card)) {
      const next = cloneState(s);
      const moving =
        source.from === 'waste'
          ? next.waste.pop()!
          : next.tableau[source.col].pop()!;
      next.foundations[i].push(moving);
      if (source.from === 'tableau') flipTop(next.tableau[source.col]);
      next.moves += 1;
      return { state: next, ok: true };
    }
  }
  return { state: s, ok: false };
}

/**
 * Sposta 1 carta (waste / cima fondazione) o una sequenza tableau
 * (da index in poi) sulla colonna tableau destCol.
 */
export function moveToTableau(
  s: GameState,
  source: TableauSource,
  destCol: number,
): { state: GameState; ok: boolean } {
  if (destCol < 0 || destCol > 6) return { state: s, ok: false };
  if (source.from === 'tableau' && source.col === destCol) return { state: s, ok: false };

  let moving: Card[];
  if (source.from === 'waste') {
    const top = topOf(s.waste);
    if (!top) return { state: s, ok: false };
    moving = [top];
  } else if (source.from === 'foundation') {
    const top = topOf(s.foundations[source.col] ?? []);
    if (!top) return { state: s, ok: false };
    moving = [top];
  } else {
    const col = s.tableau[source.col] ?? [];
    if (source.index < 0 || source.index >= col.length) return { state: s, ok: false };
    moving = col.slice(source.index);
    if (moving.length === 0 || moving.some((c) => c.coperta)) return { state: s, ok: false };
  }

  if (!canDropOnTableau(topOf(s.tableau[destCol]), moving[0])) return { state: s, ok: false };

  const next = cloneState(s);
  if (source.from === 'waste') {
    next.waste.pop();
  } else if (source.from === 'foundation') {
    next.foundations[source.col].pop();
  } else {
    next.tableau[source.col] = next.tableau[source.col].slice(0, source.index);
    flipTop(next.tableau[source.col]);
  }
  next.tableau[destCol].push(...moving.map((c) => ({ ...c })));
  next.moves += 1;
  return { state: next, ok: true };
}

/**
 * Tenta di mandare una carta in fondazione (riusa moveToFoundation/canDropOnFoundation).
 * Con source omesso prova in ordine: cima waste, poi cime tableau 0..6.
 */
export function autoFoundation(
  s: GameState,
  source?: FoundationSource,
): { state: GameState; ok: boolean } {
  if (source) return moveToFoundation(s, source);
  const r0 = moveToFoundation(s, { from: 'waste' });
  if (r0.ok) return r0;
  for (let col = 0; col < 7; col++) {
    const r = moveToFoundation(s, { from: 'tableau', col });
    if (r.ok) return r;
  }
  return { state: s, ok: false };
}

/** Vittoria quando tutte le 52 carte sono in fondazione. */
export function isVictory(s: GameState): boolean {
  return s.foundations.reduce((n, f) => n + f.length, 0) === 52;
}
