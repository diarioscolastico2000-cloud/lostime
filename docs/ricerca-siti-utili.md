# LosTime — Ricerca siti utili per il progetto

Data: 2026-09-07
Obiettivo: raccogliere tutti i siti/documentazioni/API gratis che servono davvero per l'MVP (Vite + React + TS + Supabase + Vercel + Leaflet/OSM + OpenSky + chess.js).

Legenda priorità:
- 🔴 MUST MVP = ti serve subito
- 🟡 UTILE = ti velocizza / migliora qualità
- 🔵 FALLBACK / ESTERNO = link da mostrare in UI quando API down, o ispirazione
- ⚪ FASE 2 = buono a sapersi dopo MVP

---

## 1. Fondamenta — Vite, React, Hosting gratis

### 🔴 Vite — https://vite.dev/guide/ / https://v5.vite.dev
Docs ufficiali. Sezioni chiave per te: `Building for Production`, `Env Variables`, `Static Deploy`.
Perché: il tuo stack è Vite 5. Ricorda `import.meta.env` con prefisso `VITE_` per chiave Supabase anon.

### 🔴 React — https://react.dev/
Reference hooks (`useEffect` per poll OpenSky 12s + cleanup abort, `useMemo` per griglia marker).

### 🔴 TypeScript — https://www.typescriptlang.org/docs/
Handbook + `tsconfig` strict. Utile per tipizzare `lobby.types.ts`, `session.types.ts`, payload Tris/Scacchi.

### 🔴 React Router 6 — https://reactrouter.com/
Ti serve per `/`, `/curiosita`, `/cielo`, `/giochi/:gameId`, `/r/:codice`, `/giochi/:gameId/r/:codice`, `*` 404.
Nota Vercel SPA: serve `vercel.json` con rewrite a `/index.html` altrimenti deep-link `/r/ABC123` dà 404 su refresh.

### 🔴 Vercel — https://vercel.com/docs/frameworks/frontend/vite + https://vercel.com/pricing
- Guida Vite on Vercel: https://vercel.com/docs/frameworks/frontend/vite (verificata: spiega `vercel.json` rewrites, env `VITE_*`, preview per PR).
- Free tier: 100GB bandwidth, build 6000 min/mese, domini `*.vercel.app` gratis. Perfetto per <2s su 4G se fai code-splitting per rotta.
- Da fare: connetti GitHub → Vercel → deploy automatico da `main`.

### 🔴 GitHub — https://github.com / https://docs.github.com/
Deploy da GitHub richiesto dal design doc. Usa Actions solo se vuoi CI `tsc + build` prima del merge.

---

## 2. Backend realtime — Supabase (lobby Tris/Scacchi senza account)

### 🔴 Supabase Realtime overview — https://supabase.com/docs/guides/realtime
Spiega i 3 modi: `Broadcast` (messaggi volatili), `Presence` (chi è online), `Postgres Changes` (INSERT/UPDATE/DELETE via websocket). Per LosTime:
- MVP semplice: `Postgres Changes` su `lobbies`, `lobby_players`, `game_states` filtrate per `codice=X` → meno codice.
- Scala meglio: `Broadcast` + trigger `realtime.broadcast_changes()` → consigliato da Supabase per giochi multiplayer. Valuta switch se hai lag con >50 stanze attive.

### 🔴 Postgres Changes + RLS — https://supabase.com/docs/guides/realtime/postgres-changes
Ricetta copia-incolla: crea tabella → `enable row level security` → `grant select on ... to anon` → `alter publication supabase_realtime add table ...` → `supabase.channel().on('postgres_changes', ...)`.
Critico per privacy “chi conosce il codice entra, niente list-all”.

### 🔴 Limiti Realtime Free — https://supabase.com/docs/guides/realtime/limits
Free: 200 connessioni concorrenti, 2M messaggi/mese, max 256KB per messaggio. Bastano per MVP (stanze da 2). Se sfori: passa a `Broadcast` che pesa meno di `Postgres Changes`.

### 🔴 Pricing / Pausa progetti — https://supabase.com/pricing
Free: 500MB DB, 5GB egress, 50k MAU, 2 progetti attivi. **Attenzione: progetti free in pausa dopo 1 settimana di inattività.** Per demo evita figuracce: fai un cron/ping o upgrade manuale prima di far provare a qualcuno. Tieni anon-key nel frontend, mai service_role.

### 🟡 Supabase JS v2 — https://supabase.com/docs/reference/javascript/introduction
`createClient`, `channel`, `presence`, `auth.setSession`. Usa `@supabase/supabase-js@2`.

### ⚪ Alternative se Supabase down (piano B, non MVP)
- Ably — https://ably.com/docs — free 6M msg/mese, ottimo per giochi.
- Pusher Channels — https://pusher.com/channels — free 200k msg/giorno.
- Firebase Realtime — https://firebase.google.com/docs/database — ma vendor lock-in, RLS meno espressiva.

---

## 3. Cielo live — mappa + aerei

### 🔴 OpenSky REST API docs — https://openskynetwork.github.io/opensky-api/rest.html
Endpoint MVP: `GET https://opensky-network.org/api/states/all?lamin=...&lomin=...&lamax=...&lomax=...`
- Risoluzione 10s anon, 5s autenticato. Solo OAuth2 client-credentials (Basic deprecata).
- Crediti: anon 400/giorno, standard 4000/giorno, feeder 8000/giorno. Costo per bbox: ≤25°² = 1 credito, 25-100°² = 2, 100-400°² = 3, globale = 4. **Italia intera ~ 7° lat × 10° lon ≈ 70°² = 2 crediti/call.** Con poll 12s = 7200 call/giorno → impossibile anon! Devi: clampare bbox a viewport, cache 1 ciclo, ridurre a Europa/Nord-Italia in MVP, o creare account OpenSky gratis per 4000 crediti + fallback.
- Docs alternative: https://opensky-network.org/data/api + FAQ https://opensky-network.org/about/faq (uso non-commerciale ok, commerciale serve consenso).

### 🔴 Leaflet — https://leafletjs.com/ + https://leafletjs.com/reference.html + https://leafletjs.com/examples/quick-start/
Lib da 42KB, perfetta per <2s. Usa `L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' })`.
Per React: wrapper `react-leaflet` — https://react-leaflet.js.org/ (non in spec ma ti evita bridge manuale Leaflet↔React).

### 🔴 OpenStreetMap Tile Policy — https://operations.osmfoundation.org/policies/tiles/
Obbligatoria: attribution visibile, no scraping massivo, max zoom 19, cache lato client. Se sfori traffico usa provider free alternativo: CartoDB `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png` (perfetto per dark default #FFD23F/#7C5CFF).

### 🔵 Fallback esterni da mettere in `CieloFallback.tsx`
- FlightRadar24 — https://www.flightradar24.com — link tracking `https://www.flightradar24.com/{callsign}`.
- ADS-B Exchange mappa — https://globe.adsbexchange.com/ — ottima copertura ma **API ora a pagamento enterprise**: https://www.adsbexchange.com/data-products/ — usala solo come link esterno, non come API MVP.
- OpenSky Explorer — https://opensky-network.org/network/explorer — viewer ufficiale gratis.

---

## 4. Giochi — Scacchi, Solitario, Tris, Quiz

### 🔴 chess.js — https://github.com/jhlywa/chess.js + docs https://jhlywa.github.io/chess.js + npm https://www.npmjs.com/package/chess.js
Fa tutto tranne AI: `new Chess()`, `move({from,to,promotion})`, `fen()`, `pgn()`, `isCheckmate()`, `isStalemate()`, `isDraw()`, `turn()`. Usalo per validazione locale prima di scrivere su Supabase + shake se mossa illegale. Versione moderna: `npm i chess.js` (v1.x, ESM + tipi inclusi).

### 🔴 react-chessboard — https://github.com/Clariity/react-chessboard + npm https://www.npmjs.com/package/react-chessboard
Componente drag&drop, responsive, mobile-friendly, accessibile. Props chiave: `position={fen}`, `onPieceDrop`, `boardOrientation`, `customDarkSquareStyle`. 40k download/sett. Perfetto con chess.js: `onPieceDrop` → `chess.move()` → se ok aggiorna `fen` + Supabase.

### 🟡 Lichess API + Database — https://lichess.org/api + https://database.lichess.org/
- Gratis, open-source, senza key per uso base. Ispirazione UX per scacchi 2P, lista mosse testuale, promozione/arrocco.
- Puzzle giornalieri scaricabili gratis per fase 2 (AI/allenamento). Per MVP ti basta studiare UX, non integrare.

### 🟡 Open Trivia DB — https://opentdb.com/api_config.php
API JSON gratis senza key: `https://opentdb.com/api.php?amount=10&type=multiple`. Limiti: 1 cat/call, max 50/call, 1 req/5s per IP, licenza CC BY-SA 4.0. **Problema: solo inglese.** Per MVP italiano usa `quiz.json` artigianale come da spec, e OpenTDB solo come fonte da tradurre/curare.

### 🟡 Solitario Klondike rules — https://en.wikipedia.org/wiki/Klondike_(solitaire)
Nessuna lib necessaria, engine custom `solitaireEngine.ts`. Se vuoi reference open: cerca `react-solitaire` su GitHub per shuffle, pile, auto-complete seme. Mantieni offline-first dopo primo load (Service Worker Vite PWA — https://vite-pwa-org.netlify.app/).

### 🔵 Ispirazioni giochi casual gratis
- BoardGame.io — https://boardgame.io/ — framework turni multiplayer (overkill MVP ma utile fase 2 quiz multiplayer).
- Focus Giochi — https://www.focus.it/ — tono curiosità italiano.

---

## 5. Curiosità — contenuti embeddabili gratis

### 🔴 Wikipedia API (IT) — https://www.mediawiki.org/wiki/API:Main_page
- REST: `https://it.wikipedia.org/api/rest_v1/page/summary/{titolo}` → titolo + estratto + immagine per `CuriosityCard`.
- Action API: `https://it.wikipedia.org/w/api.php?action=query&format=json&origin=*` per ricerca.
Gratis, CORS abilitato con `origin=*`, attribuzione richiesta. Perfetto per curiosità verificabili.

### 🟡 NASA APOD — https://api.nasa.gov/
`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY` → foto astronomica del giorno + spiegazione. Gratis, 1000 req/ora con DEMO_KEY. Ottima card “cielo/spazio” collegata a `/cielo`.

### 🟡 Openverse (immagini CC) — https://wordpress.org/openverse/ + API https://api.openverse.org/v1/
Copertine gratis con licenza chiara per `content.json.cover`. Alternativa: Wikimedia Commons — https://commons.wikimedia.org/wiki/Main_Page

### 🟡 YouTube Embed — https://developers.google.com/youtube/player_parameters
Embed consentito con `https://www.youtube.com/embed/{id}`. Attenzione: alcuni video bloccano embed → prevedi fallback link esterno come da spec.

### 🟡 API curiosità fun (inglese, da tradurre)
- Numbers API — http://numbersapi.com/ → `http://numbersapi.com/random/trivia?json`
- Useless Facts — https://uselessfacts.jsph.pl/ (+ API json)
- Cat Facts — https://catfact.ninja/fact
Usale come seed per `curiosities.json`, non live in produzione (uptime ballerino).

### 🔵 Focus.it — https://www.focus.it/
Miglior tono italiano per curiosità scientifiche. Non ha API, ma ottimo per scrittura card + link esterno.

---

## 6. UI/UX — stile giocoso-minimale dark

### 🔴 Google Fonts Nunito + Baloo 2 — https://fonts.google.com/specimen/Nunito + https://fonts.google.com/specimen/Baloo+2
Spec richiede Nunito o Baloo 2 via Google Fonts. Usa `display=swap`, preload, subset latin. Entrambi rounded, leggibili mobile, contrasto AA su dark.

### 🔴 Motion (ex Framer Motion) — https://motion.dev/docs/react + npm https://www.npmjs.com/package/framer-motion
`npm i motion` poi `import { motion, AnimatePresence } from 'motion/react'`. Usala leggera: fade cards, slide lobby, shake scacchiera mossa illegale. Evita animazioni layout pesanti su mappa (già costosa).

### 🟡 Tailwind CSS — https://tailwindcss.com/docs
Non in spec ma standard con Vite. Se vuoi restare ultra-leggero usa CSS Modules + variabili `--accent-yellow:#FFD23F --accent-purple:#7C5CFF --radius:16px`. Altrimenti Tailwind accelera tap-target ≥40px, dark default, responsive.

### 🟡 canvas-confetti — https://www.npmjs.com/package/canvas-confetti
Spec dice “confetti CSS senza librerie pesanti” → implementa CSS tuo. Se cambi idea, questa pesa 3KB ed è la più leggera.

### 🟡 WCAG + a11y — https://www.w3.org/WAI/standards-guidelines/wcag/ + https://github.com/jsx-eslint/eslint-plugin-jsx-a11y
Checklist MVP: contrasto AA, focus visibile, `aria-label` bottoni, scacchiera con lista mosse testuale (già in spec).

---

## 7. Qualità, performance, monitoraggio gratis

### 🟡 PageSpeed + Lighthouse — https://pagespeed.web.dev/ + https://developer.chrome.com/docs/lighthouse
Target spec <2s su 4G. Testa link Vercel mobile + desktop. Tips: code-split per rotta, Leaflet lazy solo su `/cielo`, immagini `loading=lazy`, font `preload`.

### 🟡 Web Vitals — https://web.dev/articles/vitals
LCP <2.5s, INP <200ms, CLS <0.1. Supabase Realtime non deve bloccare first paint: home/curiosità/solitario funzionano anche se Supabase down.

### 🟡 UptimeRobot — https://uptimerobot.com/
Monitor gratis 50 url/5min per accorgerti se Supabase/OpenSky down prima degli utenti.

### 🟡 Sentry — https://sentry.io/pricing/
Free 5k errori/mese. Utile per catturare `LOBBY_FULL`, `NOT_FOUND`, 429 OpenSky in produzione.

### 🟡 Vite PWA — https://vite-pwa-org.netlify.app/
Per “Solitario offline dopo primo load” (criterio successo B). Plugin `vite-plugin-pwa` + cache `quiz.json`, `curiosities.json`, board statica.

---

## 8. Piano d'azione consigliato (ordine)

1. **Oggi:** apri account Supabase + Vercel + GitHub, crea progetto Vite TS, prova `vercel.json` rewrite, `supabase-js` connect.
2. **Cielo:** crea account OpenSky (per 4000 crediti), implementa `opensky.ts` con bbox viewport + abort + fallback FlightRadar/ADS-B link.
3. **Scacchi:** `npm i chess.js react-chessboard`, prototipa `ChessBoard.tsx` locale con matto/patta/arrocco/promozione, poi collega a `game_states.fen/pgn`.
4. **Contenuti:** compila `content.json`, `curiosities.json` (Wikipedia IT + NASA APOD come fonti), `quiz.json` (traduci 30-50 domande OpenTDB).
5. **UI:** Fonts + Motion leggera + confetti CSS, testa Lighthouse mobile.
6. **Fase 2:** dominio, Lichess puzzle, chat stanza, classifiche, PWA completa.

---

## 9. Tabella rapida copia-incolla

| Area | Sito | URL | Costo MVP |
|---|---|---|---|
| Deploy SPA | Vercel Vite guide | https://vercel.com/docs/frameworks/frontend/vite | gratis |
| Backend | Supabase Realtime | https://supabase.com/docs/guides/realtime | gratis |
| DB changes | Postgres Changes | https://supabase.com/docs/guides/realtime/postgres-changes | gratis |
| Limiti | Realtime Limits | https://supabase.com/docs/guides/realtime/limits | — |
| Prezzi | Supabase Pricing | https://supabase.com/pricing | free poi $25 |
| Voli | OpenSky REST | https://openskynetwork.github.io/opensky-api/rest.html | gratis non-comm |
| Mappa | Leaflet | https://leafletjs.com/ | gratis |
| Tiles policy | OSM Policy | https://operations.osmfoundation.org/policies/tiles/ | gratis con attribution |
| Fallback mappa | ADS-B Exchange | https://globe.adsbexchange.com/ | link gratis, API a pagamento |
| Scacchi logic | chess.js | https://github.com/jhlywa/chess.js | gratis MIT |
| Scacchiera UI | react-chessboard | https://github.com/Clariity/react-chessboard | gratis MIT |
| Ispirazione | Lichess API | https://lichess.org/api | gratis |
| Quiz EN | OpenTDB | https://opentdb.com/api_config.php | gratis CC BY-SA |
| Curiosità IT | Wikipedia API | https://www.mediawiki.org/wiki/API:Main_page | gratis |
| Spazio | NASA APOD | https://api.nasa.gov/ | gratis DEMO_KEY |
| Immagini | Openverse | https://wordpress.org/openverse/ | gratis CC |
| Font | Nunito / Baloo 2 | https://fonts.google.com/specimen/Nunito | gratis |
| Animazioni | Motion | https://motion.dev/docs/react | gratis MIT |
| Perf | PageSpeed | https://pagespeed.web.dev/ | gratis |
| Offline | Vite PWA | https://vite-pwa-org.netlify.app/ | gratis |

> Nota OpenSky critica: con poll 12s su bbox Italia (~2 crediti) bruci 4000 crediti in ~6-7 ore. Prevedi account + cache + riduzione bbox a viewport + fallback come da spec, altrimenti pagina `/cielo` va in 429 a metà giornata.
