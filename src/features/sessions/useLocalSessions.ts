import { useCallback, useState } from 'react';
import { getLocalSessions, saveLocalSession, type Session } from './session.types';

export function readNickname(): string {
  try {
    return localStorage.getItem('lostime-nick') ?? '';
  } catch {
    return '';
  }
}

/** Salva l'ultima stanza visitata (stub fase 2, solo locale). */
export function recordRoomVisit(codice: string, gameId: string): void {
  try {
    saveLocalSession({
      codice,
      gameId,
      nickname: readNickname(),
      ultimoAccesso: new Date().toISOString(),
    });
  } catch {
    /* privacy mode: ignora */
  }
}

export function useLocalSessions() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      return getLocalSessions();
    } catch {
      return [];
    }
  });
  const refresh = useCallback(() => {
    try {
      setSessions(getLocalSessions());
    } catch {
      setSessions([]);
    }
  }, []);
  const clear = useCallback(() => {
    try {
      localStorage.removeItem('lostime-sessions');
    } catch {
      /* ignora */
    }
    setSessions([]);
  }, []);
  return { sessions, refresh, clear, record: recordRoomVisit };
}
