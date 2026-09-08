import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { checkWin } from '../games/tictactoe/tictactoeEngine';

export type TrisCell = null | 'X' | 'O';
// Nota: `(null|'X'|'O')[9]` non è sintassi TS valida (sarebbe un indexed-access),
// quindi la board è una tupla esplicita di 9 celle.
export type GamePayload = {
  board: [TrisCell, TrisCell, TrisCell, TrisCell, TrisCell, TrisCell, TrisCell, TrisCell, TrisCell];
};

export function emptyTrisPayload(): GamePayload {
  return { board: Array<TrisCell>(9).fill(null) as GamePayload['board'] };
}

export function applyTrisMove(payload: GamePayload, index: number): GamePayload | null {
  if (!Number.isInteger(index) || index < 0 || index > 8) return null;
  const board = payload?.board;
  if (!Array.isArray(board) || board.length !== 9) return null;
  // Partita finita (vittoria o pareggio): blocco.
  if (checkWin([...board])) return null;
  // Cella piena: blocco.
  if (board[index] !== null) return null;
  const x = board.filter((v: TrisCell) => v === 'X').length;
  const o = board.filter((v: TrisCell) => v === 'O').length;
  const turno: 'X' | 'O' = x <= o ? 'X' : 'O';
  const next = [...board] as GamePayload['board'];
  next[index] = turno;
  return { board: next };
}

export function useGameState(codice: string): {
  payload: GamePayload;
  versione: number;
  inviaMossa: (index: number) => Promise<void>;
} {
  const [payload, setPayload] = useState<GamePayload>(() => emptyTrisPayload());
  const [versione, setVersione] = useState<number>(0);

  useEffect(() => {
    let alive = true;
    if (!codice) return;

    // Senza Supabase: tutto locale, nessun errore.
    if (!isSupabaseConfigured) {
      setPayload(emptyTrisPayload());
      setVersione(1);
      return;
    }

    supabase
      .from('game_states')
      .select('*')
      .eq('lobby_codice', codice)
      .single()
      .then(async ({ data, error }) => {
        if (!alive) return;
        if (error || !data) {
          // Riga mancante: crea stato iniziale (turno X, board vuota, versione 1).
          const init = emptyTrisPayload();
          const { data: ins, error: errIns } = await supabase
            .from('game_states')
            .upsert(
              { lobby_codice: codice, turno: 'X', payload: init, versione: 1 },
              { onConflict: 'lobby_codice' },
            )
            .select()
            .single();
          if (!alive) return;
          if (!errIns && ins) {
            const row = ins as unknown as { payload?: GamePayload; versione?: number };
            setPayload(row.payload ?? init);
            setVersione(typeof row.versione === 'number' ? row.versione : 1);
          } else {
            setPayload(init);
            setVersione(1);
          }
          return;
        }
        const row = data as unknown as { payload?: GamePayload; versione?: number };
        setPayload(row.payload ?? emptyTrisPayload());
        setVersione(typeof row.versione === 'number' ? row.versione : 1);
      });

    const ch = supabase
      .channel('game-state-' + codice)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_states',
          filter: `lobby_codice=eq.${codice}`,
        },
        (p) => {
          if (!alive) return;
          const row = (p as unknown as { new?: { payload?: GamePayload; versione?: number } }).new;
          if (!row) return;
          if (row.payload) setPayload(row.payload);
          if (typeof row.versione === 'number') setVersione(row.versione);
        },
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [codice]);

  async function inviaMossa(index: number): Promise<void> {
    const next = applyTrisMove(payload, index);
    if (!next) return;
    const nuovaVersione = versione + 1;
    // Update ottimistico locale (vale anche senza Supabase).
    setPayload(next);
    setVersione(nuovaVersione);
    if (!isSupabaseConfigured) return;
    const x = next.board.filter((v: TrisCell) => v === 'X').length;
    const o = next.board.filter((v: TrisCell) => v === 'O').length;
    const turno: 'X' | 'O' = x <= o ? 'X' : 'O';
    await supabase.from('game_states').upsert(
      { lobby_codice: codice, turno, payload: next, versione: nuovaVersione },
      { onConflict: 'lobby_codice' },
    );
  }

  return { payload, versione, inviaMossa };
}
