import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { LobbyState } from './lobby.types';
export function useLobby(codice: string) {
  const [lobby, setLobby] = useState<LobbyState | null>(null);
  useEffect(() => {
    let alive = true;
    supabase.from('lobbies').select('*').eq('codice', codice).single().then(({ data }) => {
      if (!alive || !data) return;
      supabase.from('lobby_players').select('*').eq('lobby_codice', codice).then(({ data: pl }) => {
        if (!alive) return;
        setLobby({ codice, gameId: (data as any).game_id, maxPlayers: (data as any).max_players, stato: (data as any).stato, giocatori: ((pl as any[] | null) ?? []).map(p => ({ nickname: p.nickname, ordine: p.ordine })) });
      });
    });
    const ch = supabase.channel('lobby-' + codice)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_states', filter: `lobby_codice=eq.${codice}` }, () => {})
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [codice]);
  return { lobby };
}
