import { useState } from 'react';
import {
  autoFoundation,
  dealGame,
  drawFromStock,
  isRed,
  isVictory,
  moveToFoundation,
  moveToTableau,
  type Card,
  type FoundationSource,
  type GameState,
  type TableauSource,
} from './solitaireEngine';

const RANK: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const SUIT: Record<Card['seme'], string> = { cuori: '♥', quadri: '♦', fiori: '♣', picche: '♠' };
const SUIT_NAME: Record<Card['seme'], string> = { cuori: 'cuori', quadri: 'quadri', fiori: 'fiori', picche: 'picche' };

function label(c: Card): string {
  return `${RANK[c.valore] ?? c.valore}${SUIT[c.seme]}`;
}

function sameSel(a: TableauSource | null, b: TableauSource | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** Converte una selezione in sorgente fondazione (solo carte singole in cima). */
function toFoundationSource(sel: TableauSource, game: GameState): FoundationSource | null {
  if (sel.from === 'waste') return { from: 'waste' };
  if (sel.from === 'foundation') return null;
  const col = game.tableau[sel.col] ?? [];
  if (sel.index !== col.length - 1) return null; // solo la cima può andare in fondazione
  return { from: 'tableau', col: sel.col };
}

const cardBtn: React.CSSProperties = {
  minHeight: 56,
  minWidth: 48,
  borderRadius: 10,
  border: '2px solid #444',
  background: '#fff',
  fontSize: 20,
  fontWeight: 700,
  cursor: 'pointer',
  padding: '8px 4px',
  touchAction: 'manipulation',
};

export function SolitaireBoard() {
  const [game, setGame] = useState<GameState>(() => dealGame());
  const [selected, setSelected] = useState<TableauSource | null>(null);
  const [msg, setMsg] = useState('');

  const won = isVictory(game);

  function newGame() {
    setGame(dealGame());
    setSelected(null);
    setMsg('');
  }

  function onStock() {
    if (won) return;
    const recycling = game.stock.length === 0 && game.waste.length > 0;
    setGame(drawFromStock(game));
    setSelected(null);
    setMsg(recycling ? 'Stock riciclato.' : '');
  }

  function select(sel: TableauSource) {
    setSelected((prev) => (sameSel(prev, sel) ? null : sel));
  }

  function onWasteClick() {
    const top = game.waste[game.waste.length - 1];
    if (!top) return;
    if (selected && selected.from === 'waste' && (selected as { from: string }).from === 'waste') {
      setSelected(null);
      return;
    }
    if (selected) {
      setMsg('Il waste non è una destinazione: tocca una colonna o una fondazione.');
      return;
    }
    select({ from: 'waste' });
  }

  function onWasteDouble() {
    const r = autoFoundation(game, { from: 'waste' });
    if (r.ok) {
      setGame(r.state);
      setSelected(null);
      setMsg('');
    } else setMsg('Nessuna fondazione disponibile per questa carta.');
  }

  function onTableauCard(col: number, index: number) {
    const card = game.tableau[col][index];
    if (!card || card.coperta) return;
    const self: TableauSource = { from: 'tableau', col, index };
    if (!selected) {
      select(self);
      return;
    }
    if (sameSel(selected, self)) {
      setSelected(null);
      return;
    }
    const r = moveToTableau(game, selected, col);
    if (r.ok) {
      setGame(r.state);
      setSelected(null);
      setMsg('');
    } else {
      // Ritenta selezionando la carta appena toccata
      setSelected(self);
      setMsg('Mossa non valida: scala discendente alternando i colori.');
    }
  }

  function onTableauEmpty(col: number) {
    if (!selected) return;
    const r = moveToTableau(game, selected, col);
    if (r.ok) {
      setGame(r.state);
      setSelected(null);
      setMsg('');
    } else setMsg('Mossa non valida: su colonna vuota solo un Re.');
  }

  function onTableauDouble(col: number) {
    const pile = game.tableau[col];
    if (pile.length === 0) return;
    const r = autoFoundation(game, { from: 'tableau', col });
    if (r.ok) {
      setGame(r.state);
      setSelected(null);
      setMsg('');
    } else setMsg('Nessuna fondazione disponibile per questa carta.');
  }

  function onFoundationClick(col: number) {
    const pile = game.foundations[col];
    if (!selected) {
      if (pile.length > 0) select({ from: 'foundation', col });
      return;
    }
    if (selected.from === 'foundation') {
      if (selected.col === col) setSelected(null);
      else setMsg('Non si sposta da fondazione a fondazione: tocca una colonna.');
      return;
    }
    const src = toFoundationSource(selected, game);
    if (!src) {
      setMsg('Solo la carta in cima può andare in fondazione.');
      return;
    }
    const r = moveToFoundation(game, src, col);
    if (r.ok) {
      setGame(r.state);
      setSelected(null);
      setMsg('');
    } else setMsg('Mossa non valida: fondazioni per seme da Asso a Re.');
  }

  function onAutoAll() {
    let cur = game;
    for (let i = 0; i < 60; i++) {
      const r = autoFoundation(cur);
      if (!r.ok) break;
      cur = r.state;
    }
    if (cur !== game) {
      setGame(cur);
      setSelected(null);
      setMsg('');
    } else setMsg('Niente da fondare al momento.');
  }

  function describeSel(sel: TableauSource): string {
    if (sel.from === 'waste') {
      const t = game.waste[game.waste.length - 1];
      return t ? label(t) : '';
    }
    if (sel.from === 'foundation') {
      const t = game.foundations[sel.col][game.foundations[sel.col].length - 1];
      return t ? label(t) : '';
    }
    const c = game.tableau[sel.col][sel.index];
    return c ? label(c) : '';
  }

  const selDesc = selected ? describeSel(selected) : '';

  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 960 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Solitario</h2>
        <span aria-live="polite">Mosse: {game.moves}</span>
        <button type="button" onClick={newGame} style={{ minHeight: 44, borderRadius: 10, padding: '0 16px', cursor: 'pointer' }}>
          Nuova partita
        </button>
        <button type="button" onClick={onAutoAll} disabled={won} style={{ minHeight: 44, borderRadius: 10, padding: '0 16px', cursor: 'pointer' }}>
          Fonda tutto
        </button>
      </div>

      {won && (
        <div role="status" style={{ borderRadius: 12, padding: 12, background: '#14532d', color: '#fff', fontWeight: 700 }}>
          Vittoria! Tutte le 52 carte sono in fondazione in {game.moves} mosse. <button type="button" onClick={newGame} style={{ minHeight: 44, borderRadius: 10, padding: '0 16px', cursor: 'pointer' }}>Rigioca</button>
        </div>
      )}

      {msg && !won && (
        <div role="status" style={{ borderRadius: 12, padding: 8, background: '#3a2a00', color: '#ffe9a8' }}>
          {msg}
        </div>
      )}

      {selected && !won && <div aria-live="polite">Selezionata: {selDesc} — tocca una destinazione.</div>}

      {/* Riga superiore: stock, waste, fondazioni */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <button
          type="button"
          onClick={onStock}
          aria-label={game.stock.length > 0 ? `Pesca dal mazzo, ${game.stock.length} carte` : 'Ricicla gli scarti nel mazzo'}
          style={{ ...cardBtn, background: game.stock.length > 0 ? '#1d4ed8' : '#333', color: '#fff' }}
        >
          {game.stock.length > 0 ? `🂠 ${game.stock.length}` : '↻'}
        </button>
        {game.waste.length === 0 ? (
          <div style={{ ...cardBtn, background: '#eee', color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>—</div>
        ) : (
          (() => {
            const top = game.waste[game.waste.length - 1];
            const isSel = selected?.from === 'waste';
            return (
              <button
                type="button"
                onClick={onWasteClick}
                onDoubleClick={onWasteDouble}
                aria-label={`Scarto ${label(top)} ${SUIT_NAME[top.seme]}, tocca per selezionare, doppio tocco per fondazione`}
                style={{ ...cardBtn, color: isRed(top.seme) ? '#c00' : '#111', outline: isSel ? '3px solid #f59e0b' : 'none' }}
              >
                {label(top)}
              </button>
            );
          })()
        )}
        <div style={{ flex: 1 }} />
        {game.foundations.map((pile, i) => {
          const top = pile[pile.length - 1];
          return (
            <button
              key={i}
              type="button"
              onClick={() => onFoundationClick(i)}
              aria-label={top ? `Fondazione ${i + 1}: ${label(top)}, tocca per spostare` : `Fondazione ${i + 1} vuota (serve un Asso)`}
              style={{ ...cardBtn, background: '#f5f5f5', color: top && isRed(top.seme) ? '#c00' : '#111' }}
            >
              {top ? label(top) : 'A?'}
            </button>
          );
        })}
      </div>

      {/* Tableau: 7 colonne responsive */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(48px, 1fr))', gap: 8, overflowX: 'auto' }}>
        {game.tableau.map((pile, col) => (
          <div key={col} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 48 }}>
            {pile.length === 0 ? (
              <button
                type="button"
                onClick={() => onTableauEmpty(col)}
                aria-label={`Colonna ${col + 1} vuota (solo Re)`}
                style={{ ...cardBtn, background: '#e8e8e8', color: '#666', fontSize: 14 }}
              >
                K?
              </button>
            ) : (
              pile.map((c, index) =>
                c.coperta ? (
                  <div key={c.id ?? index} style={{ ...cardBtn, background: '#1e3a8a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default' }} aria-hidden>
                    🂠
                  </div>
                ) : (
                  (() => {
                    const isSel =
                      (selected?.from === 'tableau' && selected.col === col && selected.index === index) ||
                      (selected?.from === 'waste' && false);
                    const isTop = index === pile.length - 1;
                    return (
                      <button
                        key={c.id ?? index}
                        type="button"
                        onClick={() => onTableauCard(col, index)}
                        onDoubleClick={isTop ? () => onTableauDouble(col) : undefined}
                        aria-label={`${label(c)} ${SUIT_NAME[c.seme]}, colonna ${col + 1}${isTop ? ', doppio tocco per fondazione' : ''}`}
                        style={{ ...cardBtn, color: isRed(c.seme) ? '#c00' : '#111', outline: isSel ? '3px solid #f59e0b' : 'none' }}
                      >
                        {label(c)}
                      </button>
                    );
                  })()
                ),
              )
            )}
          </div>
        ))}
      </div>

      <p style={{ opacity: 0.75, margin: 0 }}>
        Come giocare: tocca il mazzo per pescare • tocca una carta e poi la destinazione • doppio tocco per mandare in fondazione.
      </p>
    </div>
  );
}
