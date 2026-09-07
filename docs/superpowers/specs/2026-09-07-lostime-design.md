# LosTime - Hub passa-tempo - Design Doc

**Data:** 2026-09-07
**Stato:** approvato a sezioni dall'utente, in attesa review file
**Goal:** sito pubblico, veloce da mobile/PC, gratis da ospitare, dove "perdere tempo" tra curiosità, giochi base e quiz, con lobby leggera senza account e stanze a codice condivisibile.
**Architettura:** SPA Vite + React + TypeScript + React Router, Realtime via Supabase free-tier, hosting Vercel gratis con deploy da GitHub, dominio custom rimandato a fase successiva.
**Tech Stack:** Vite 5, React 18, TypeScript 5, React Router 6, Supabase JS 2 (Postgres + Realtime), Leaflet + OpenStreetMap per mappa, OpenSky Network per aerei live, chess.js + react-chessboard per scacchi, Framer Motion leggera per animazioni, localStorage per nickname e preferenze.

## Global Constraints
- Costo zero MVP: solo tier gratuiti Vercel + Supabase + OpenSky + OSM.
- Nessun account: solo nickname in localStorage + codice stanza 6 caratteri come password implicita.
- Mobile-first, target <2s su 4G, tap target >=40px, dark di default.
- Privacy: niente elenco globale lobby, chi conosce il codice entra, RLS Supabase per codice.
- Lingua UI MVP: italiano.

---

## 1. Scope MVP

### Dentro MVP
1. Home `/` con hero, barra ricerca per preferenze, griglia cards curiosità + giochi.
2. Vetrina curiosità `/curiosita` guidata da `curiosities.json`, card con link esterno ed embed dove consentito.
3. Cielo live `/cielo`: mappa Leaflet + aerei live OpenSky su bbox Italia/Europa, refresh 12s, popup dettagli, fallback a link esterni se API down.
4. Giochi single: Solitario Klondike base `/giochi/solitario`, Quiz single `/giochi/quiz` da `quiz.json`.
5. Multiplayer lobby leggera: Tris 2 giocatori `/giochi/tris` + Scacchi completi 2 giocatori `/giochi/scacchi`, entrambi su stessa Lobby generica X-giocatori.
6. Stanza: `/r/:codice` scorciatoia + `/giochi/:gameId/r/:codice` forma estesa, stati attesa/in-gioco/finita, copia-link, rigioca stessa stanza.
7. Ricerca per preferenze: testo + filtri categoria, n. giocatori, durata, tag, da `content.json` unico.
8. 404 giocosa, gestione errori rete giocosa, auto-reconnect lobby.

### Fuori MVP (fase 2)
- Dominio custom lostime.com o alternative, SEO avanzata, lobby pubbliche elencabili, storico sessioni `/sessioni` oltre stub, account e classifiche globali, chat in stanza, spettatori, orologio scacchi pro e AI, app native, quiz multiplayer.

## 2. Rotte

- `/` Home
- `/curiosita` lista, `/curiosita/:id` dettaglio predisposto futuro
- `/cielo` mappa aerei live
- `/giochi` hub, `/giochi/:gameId` con gameId in `solitario | tris | scacchi | quiz`
- `/r/:codice` scorciatoia stanza, risolve gameId da DB e redirect a forma estesa
- `/giochi/:gameId/r/:codice` stanza estesa
- `/sessioni` stub vuoto fase 2 per storico locale e lobby aperte
- `*` 404

Regole: codice = 6 char A-Z0-9 maiuscole, nickname 2-16 char, gameId validato da registry, codice sconosciuto porta a 404 con CTA crea lobby.

## 3. Componenti e cartelle

Struttura predisposta per lobby e sessioni future:

- `src/app/` router, layout, providers Supabase, error boundary
- `src/features/search/` `searchIndex.ts`, `useSearch()`, `SearchBar.tsx`, `FilterChips.tsx`
- `src/features/curiosities/` `curiosities.json`, `CuriosityCard.tsx`, `CuriosityGrid.tsx`
- `src/features/cielo/` `CieloMap.tsx`, `useFlights(bbox)`, `opensky.ts`, `FlightPopup.tsx`, `CieloFallback.tsx`
- `src/features/games/registry.ts` mappa gameId a { titolo, minPlayers, maxPlayers, durataMin, tags, componente, copertina }
- `src/features/games/solitaire/` `SolitaireBoard.tsx`, `solitaireEngine.ts`
- `src/features/games/tictactoe/` `TicTacToeBoard.tsx`, `tictactoeEngine.ts`
- `src/features/games/chess/` `ChessBoard.tsx`, wrapper attorno a chess.js, `chessEngine.ts` per fen/pgn/turno/vincitore
- `src/features/quiz/` `quiz.json`, `QuizPlayer.tsx`, `quizEngine.ts`
- `src/features/lobby/` `lobbyApi.ts` create/join/get, `useLobby(codice)`, `Lobby.tsx`, `NicknameInput.tsx`, `ShareLink.tsx`, `lobby.types.ts`
- `src/features/sessions/` `session.types.ts` e stub `useLocalSessions()` per fase 2, nessuna UI attiva in MVP oltre salvataggio locale ultima stanza
- `src/shared/` UI primitives Button, Card, Input, Modal, Toast, hooks useLocalStorage, useCopy

Ogni gioco comunica con Lobby solo tramite interfaccia: `getInitialState()`, `applyMove(state, move, player)`, `isGameOver(state)`. Lobby non conosce regole specifiche.

## 4. Data flow

### 4.1 Contenuti statici
`content.json` unisce curiosità + giochi per ricerca: `{ id, tipo: curiosita|gioco, gameId?, titolo, descrizione, tags[], players:{min,max}, durataMin, cover, linkEsterno?, rottaInterna? }`. `curiosities.json` dettaglio cards, `quiz.json` domande `{ domanda, scelte[4], correttaIndex, spiegazione }`.

### 4.2 Lobby realtime Supabase
Tabelle:
- `lobbies(codice TEXT PK, game_id TEXT, max_players INT, stato TEXT attesa|in-gioco|finita, created_at, updated_at)`
- `lobby_players(id UUID PK, lobby_codice FK, nickname TEXT, ordine INT 0..max-1, online BOOL, last_seen)`
- `game_states(lobby_codice PK FK, turno TEXT, payload JSONB, versione INT, updated_at)`

Flusso Tris e Scacchi identico, cambia solo payload:
- Tris payload `{ board: (null|'X'|'O')[9], next: 'X'|'O' }`
- Scacchi payload `{ fen: string, pgn: string, next: 'w'|'b', status: 'attesa|scacco|matto|patta', lastMove?: {from,to} }`

Azioni:
- createLobby(gameId) genera codice, inserisce lobby attesa, inserisce player ordine 0, ritorna codice.
- joinLobby(codice, nickname) se esiste e non piena inserisce player ordine successivo, se piena ritorna errore LOBBY_FULL, se non esiste NOT_FOUND.
- Sottoscrizione Realtime su `lobbies:codice=X`, `lobby_players:codice=X`, `game_states:codice=X`. Quando count players == max_players, primo giocatore imposta stato in-gioco.
- Mossa: client valida localmente con engine, poi update ottimistico UI + update Supabase con versione+1. Conflitto versione: ricarica stato server vince, toast riprova.
- Rigioca: reset payload a iniziale stessa stanza, stato in-gioco.
- Abbandono: heartbeat 15s update last_seen, dopo 60s offline marcato offline, se tutti offline 10min lobby resta ma non elencata.

RLS: policy select/insert/update limitate a righe con lobby_codice conosciuto via parametro, niente list all. Service key mai esposta, solo anon key.

### 4.3 Cielo live
`opensky.ts` chiama `https://opensky-network.org/api/states/all?lamin=...&lomin=...&lamax=...&lomax=...` con bbox da viewport mappa clampata a Europa per quota. Poll 12s, abort precedente, cache 1 ciclo. Mapping a `{ icao24, callsign, lat, lon, alt, vel, heading }`. Marker Leaflet cluster leggero custom senza plugin pesanti in MVP, max 400 marker visibili, oltre raggruppa per griglia. Click apre popup con dati + link tracking esterno. Errore/quota/429 porta a `CieloFallback` con cards esterne FlightRadar e simili + bottone riprova. Nessun dato salvato su DB in MVP.

## 5. UX e stile
Giocoso-minimale, dark default, accento giallo #FFD23F e viola #7C5CFF, font Nunito o Baloo 2 via Google Fonts, raggio 16px, ombre morbide. Home hero con headline Perdi tempo bene, search prominente, sezioni Continua a esplorare e Giochi in 2. Lobby mostra avatar iniziali, badge turno tuo, confetti CSS alla vittoria senza librerie pesanti. Accessibilità: contrasto AA, focus visibile, bottoni con aria-label, scacchiera navigabile con lista mosse testuale.

## 6. Error handling
- Codice stanza non trovato: pagina 404 stanza con CTA crea nuova lobby stesso gioco.
- Lobby piena: messaggio piena con CTA crea altra.
- Nickname duplicato stessa lobby: suffisso automatico -2 con toast.
- Perdita rete lobby: banner riprovo, mosse in coda disabilitate fino a riconnessione, stato da Realtime alla ripresa.
- OpenSky 429 o timeout: fallback link + retry con backoff 5s,15s,30s.
- Supabase down: pagina giochi multiplayer con stato manutenzione, single e curiosità restano funzionanti.
- Validazione scacchi illegale: shake scacchiera + motivo da chess.js, nessuna scrittura DB.

## 7. Testing e successo
Criteri B approvati: chiunque da link Vercel apre <2s su 4G, cerca carte 2 giocatori e trova Tris e Scacchi, gioca Solitario offline dopo primo load, crea lobby Tris e gioca con amico senza account, apre /cielo e vede aerei su Italia, gioca Scacchi con matto rilevato.

Test manuali MVP: home mobile e desktop, ricerca con filtri, solitario vittoria e auto-complete seme, quiz punteggio, tris vittoria pareggio rigioca, scacchi partita completa con arrocco e promozione via chess.js, lobby codice errato, lobby piena, disconnessione e reconnect, opensky mock down con fallback, throttling 4G.

## 8. Self-review placeholder
Nessun TBD o TODO. Interfacce definite in lobby.types, session.types, registry. Nomi coerenti codice in inglese snake per DB, camel per TS. Scope singolo MVP con scacchi e cielo inclusi come richiesto, dominio e fase 2 esclusi esplicitamente.
