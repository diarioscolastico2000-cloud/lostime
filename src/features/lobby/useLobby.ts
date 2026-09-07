import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { LobbyState } from './lobby.types';

export type LobbyStatus = 'caricamento' | 'pronta' | 'non-trovata' | 'offline' | 'errore';

export function useLobby(codice: string) {
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  const [stato, setStato] = useState<LobbyStatus>('caricamento');
  const [online, setOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setStato('offline');
      return;
    }
    supabase.from('lobbies').select('*').eq('codice', codice).single().then(({ data, error }) => {
      if (!alive) return;
      if (error || !data) {
        setStato('non-trovata');
        return;
      }
      supabase.from('lobby_players').select('*').eq('lobby_codice', codice).then(({ data: pl, error: errPl }) => {
        if (!alive) return;
        if (errPl) {
          setStato('errore');
          return;
        }
        setLobby({ codice, gameId: (data as any).game_id, maxPlayers: (data as any).max_players, stato: (data as any).stato, giocatori: ((pl as any[] | null) ?? []).map(p => ({ nickname: p.nickname, ordine: p.ordine })) });
        setStato('pronta');
      });
    });
    const ch = supabase.channel('lobby-' + codice)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_states', filter: `lobby_codice=eq.${codice}` }, () => {})
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [codice, online]);
  return { lobby, stato, online };
}
