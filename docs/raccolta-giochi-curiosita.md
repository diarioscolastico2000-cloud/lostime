# LosTime — Raccolta giochi, siti e curiosità + specifiche link

> Documento operativo per popolare `content.json`, `curiosities.json`, `quiz.json`.
> File pronti in `docs/data/`: `content.json` (33 voci), `curiosities.json` (12 card), `quiz.json` (15 domande).
> Destinazione finale nel codice: `src/features/games/registry.ts`, `src/features/curiosities/curiosities.json`, `src/features/quiz/quiz.json`, `src/features/search/content.json`.

Regole valide per tutte le voci: **costo zero, senza account obbligatorio, mobile-friendly, italiano dove possibile**.
`rottaInterna` = pagina tua (spec MVP). `linkEsterno` = si apre in nuova scheda con avviso “stai uscendo da LosTime”.

---

## A. Giochi interni — i tuoi 4 MVP (rottaInterna)

| # | Titolo | Rotta | Giocatori | Durata | Descrizione breve | Stato |
|---|---|---|---|---|---|---|
| 1 | Solitario Klondike | `/giochi/solitario` | 1 | 10 min | Ordina i semi Asso→Re. Offline dopo primo load | MVP single |
| 2 | Tris 2 giocatori | `/giochi/tris` | 2 | 3 min | Stanza codice 6 char, X vs O, rigioca stessa stanza | MVP lobby |
| 3 | Scacchi 2 giocatori | `/giochi/scacchi` | 2 | 20 min | FEN/PGN, arrocco/en passant/promozione, matto/patta | MVP lobby |
| 4 | Quiz veloce | `/giochi/quiz` | 1 | 5 min | 15 domande IT con spiegazione, punteggio locale | MVP single |

Interfaccia engine comune (da spec): `getInitialState()`, `applyMove(state, move, player)`, `isGameOver(state)`.

---

## B. Giochi esterni consigliati — card con linkEsterno

Tutti testati come filosofia “click e giochi, niente signup per iniziare”.

### B1. Tavola sinottica

| Nome | Link | Giocatori | Durata | Account? | ITA? | Mobile | Embed iframe? | Perché su LosTime |
|---|---|---|---|---|---|---|---|---|
| Lichess | https://lichess.org | 1–2 | 15 min | No per vs CPU | Sì | Sì | No (X-Frame vietato) → link | Allenamento scacchi quando amico non c'è |
| Puzzle Storm | https://lichess.org/storm | 1 | 3 min | No | Sì | Sì | No → link | Passa-tempo record da 3 min |
| Gartic Phone | https://garticphone.com | 4–30 | 15 min | No, stanza via link | Sì | Sì | No → link | Stesso pattern lobby a codice tuo |
| Skribbl.io | https://skribbl.io | 2–12 | 10 min | No, stanza privata | Sì | Sì | No → link | Alternativa disegno al Tris |
| CityGuessr | https://www.cityguessr.com | 1 | 5 min | No | Parziale | Sì | No → link | Geo-guess gratis (GeoGuessr ora chiede account) |
| 2048 | https://play2048.co | 1 | 5 min | No | — (numeri) | Sì | Sì possibile ma meglio link | Riempi-tempo single perfetto |
| TETR.IO | https://tetr.io | 1 (+multi con account) | 5 min | No per Quick Play | EN | Sì | No → link | Tetris moderno; specifica “multi richiede account gratis” |
| Slither.io | https://slither.io | 1 (arena shared) | 5 min | No | — | Sì | No → link | .io immediato |
| Minesweeper Online | https://minesweeper.online | 1 | 5 min | No | Sì | Sì | No → link | Classico + daily |
| Sudoku | https://sudoku.com | 1 | 10 min | No | Sì | Sì | No → link | Sfida giorno, facile→esperto |
| Dino runner | https://chromedino.com | 1 | 2 min | No | — | Sì | Sì possibile ma meglio link | 2-min killer |
| Wordle IT | https://pietroppeter.github.io/wordle-it/ | 1 | 4 min | No | Sì | Sì | Sì (open source) ma meglio link | Parola del giorno IT |

### B2. Schede dettagliate (copia in `content.json`)

**1. Lichess — https://lichess.org**
- Tipo: gioco esterno. Players 1–2. Durata 15. Tags: `scacchi,single,no-account,mobile,italiano,link-esterno`.
- Pro: gratis, open source, no ads invasivi, puzzle/allenamento infiniti, IT completo.
- Contro: multiplayer online richiede account gratis → per MVP linka solo “vs computer / puzzle”.
- Cover suggerita: `/covers/lichess.png`. Attribuzione non richiesta ma gradita.

**2. Puzzle Storm — https://lichess.org/storm**
- Tipo: gioco esterno. 1P, 3 min. Tags: `scacchi,single,veloce,no-account`.
- Pro: loop perfetto “perdi tempo bene”, record personale senza salvataggio.
- Nota: EN/IT automatico da lingua browser.

**3. Gartic Phone — https://garticphone.com**
- Tipo: gioco esterno party. 4–30P, 15 min. Tags: `multiplayer,codice-stanza,no-account,italiano`.
- Pro: stanze via link come le tue `/r/:codice`, nessun signup, ITA. Miglior esempio da studiare per UX lobby.
- Contro: serve minimo 4 per divertirsi → segnalo in descrizione.

**4. Skribbl.io — https://skribbl.io**
- Tipo: gioco esterno party. 2–12P, 10 min. Tags simili a sopra.
- Pro: stanze private con codice, ITA, leggero su 4G.

**5. CityGuessr — https://www.cityguessr.com**
- Tipo: gioco esterno geo. 1P, 5 min.
- Pro: gratis senza account (GeoGuessr originale ora paywalled). Ottimo per sezione “Esplora”.
- Contro: UI parzialmente EN → metti tag `inglese` se filtri per lingua.

**6. 2048 — https://play2048.co**
- Tipo: gioco esterno single. 1P, 5 min. Open source MIT (https://github.com/gabrielecirulli/2048).
- Pro: potresti persino self-hostarlo in `/giochi/2048` in fase 2 senza problemi di licenza.

**7–12.** TETR.IO / Slither / Minesweeper / Sudoku / Dino / Wordle IT: vedi tabella B1. Tutti con `linkEsterno`, `durataMin` 2–10, `players {min:1,max:1}` tranne party già detti. Per Wordle IT preferisci il clone open `pietroppeter.github.io/wordle-it` (gratis, no ads) al NYT originale EN.

> Banner consigliato su ogni card esterna: “Si apre su sito esterno • gratis • senza account”.

---

## C. Siti curiosità / esplora — card con linkEsterno (+ 1 interna)

| Nome | Link | Cosa fai in 2 min | Account? | ITA? | Mobile | Perché su LosTime |
|---|---|---|---|---|---|---|
| Cielo live (tua) | `/cielo` | Aerei sopra Italia live 12s | No | Sì | Sì | Core MVP, Leaflet+OpenSky |
| Radio Garden | https://radio.garden/ | Ruoti il globo, ascolti radio live | No | — (audio mondo) | Sì | Ipnosi passa-tempo #1 |
| Windy | https://www.windy.com | Vento/pioggia animati | No base | Sì | Sì | Meteo wow collegato a /cielo |
| MarineTraffic | https://www.marinetraffic.com | Navi live come aerei ma mare | No base | Parziale | Sì | Gemello di /cielo |
| ISS Tracker NASA | https://spotthestation.nasa.gov/tracking_map.cfm | Dov'è la ISS ora + passaggi Italia | No | EN (semplice) | Sì | Spazio reale live |
| Stellarium Web | https://stellarium-web.org/ | Cielo sopra di te, costellazioni | No | Parziale | Sì | Sera + Light Pollution = combo |
| Solar System Scope | https://www.solarsystemscope.com | Sistema solare 3D | No base | EN | Sì | Bello su desktop, ok mobile |
| Scale of Universe | https://scaleofuniverse.com | Scorri atomo→galassie | No | EN (poche parole) | Sì | Viralissimo |
| 100k Stars | https://stars.chromeexperiments.withgoogle.com/ | 100mila stelle 3D | No | — | Desktop meglio | Wow desktop |
| Skyline Webcams | https://www.skylinewebcams.com/it/ | Piazze/spiagge/vulcani live | No | Sì | Sì | 2-min Italia |
| INGV Terremoti | https://terremoti.ingv.it/ | Terremoti Italia real-time | No | Sì | Sì | Fonte ufficiale, mappa |
| Light Pollution Map | https://www.lightpollutionmap.info | Dove vedere stelle vicino a te | No | EN semplice | Sì | Serata osservazione |
| Cavi sottomarini | https://www.submarinecablemap.com/ | Internet sotto il mare | No | EN semplice | Sì | “Non lo sapevo!” garantito |
| APOD NASA | https://apod.nasa.gov/ | Foto spazio del giorno | No | EN + traduci tu | Sì | Card giornaliera + API gratis |
| Wikipedia casuale | https://it.wikipedia.org/wiki/Speciale:PaginaCasuale | Voce IT a sorpresa | No | Sì | Sì | Bottone “sorprendimi” |
| Focus curiosità | https://www.focus.it/curiosita | Articoli brevi IT | No | Sì | Sì | Tono da copiare per tue card |

Dettagli embed/licenze:
- Radio Garden / Windy / MarineTraffic / Stellarium: **no iframe** → solo link esterno.
- APOD: testo+immagine riusabili con credit via API `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY` (1000 req/ora).
- Wikipedia: riusabile con attribuzione via `https://it.wikipedia.org/api/rest_v1/page/summary/{titolo}` + `origin=*` per CORS.
- INGV: dati aperti, cita fonte.
- OSM/Leaflet: attribution `© OpenStreetMap contributors` obbligatoria in `/cielo`.

---

## D. Curiosità testuali pronte (già in `curiosities.json`)

12 card IT con fonte, pronte per `CuriosityCard.tsx`. Esempi:

1. **Miele eterno** — commestibile dopo 3000 anni → https://it.wikipedia.org/wiki/Miele
2. **Polpo 3 cuori / sangue blu** → https://it.wikipedia.org/wiki/Octopoda
3. **Banane radioattive** (potassio-40, BED) → https://en.wikipedia.org/wiki/Banana_equivalent_dose
4. **Fulmine 5× Sole** (~30000 °C) → https://it.wikipedia.org/wiki/Fulmine
5. **Squali prima degli alberi** → https://it.wikipedia.org/wiki/Selachimorpha
6. **ISS 27600 km/h, 16 albe/giorno** → https://spotthestation.nasa.gov/tracking_map.cfm
7. **Cuore gambero in testa** → https://it.wikipedia.org/wiki/Caridea
8. **Luna +3,8 cm/anno, addio eclissi tra 600M anni** → https://it.wikipedia.org/wiki/Luna
9. **Sangue mai blu (vene sì in apparenza)** → https://www.focus.it/curiosita
10. **Saturno galleggerebbe** → https://it.wikipedia.org/wiki/Saturno_(astronomia)
11. **Pietre di sole vichinghe** → https://it.wikipedia.org/wiki/Pietra_del_sole_(archeologia)
12. **Tardigradi 10 giorni nello spazio** → https://it.wikipedia.org/wiki/Tardigrada

Vedi `docs/data/curiosities.json` per testi completi (2–3 frasi l'uno).

---

## E. Quiz pronti (già in `quiz.json`)

15 domande IT a 4 risposte con `correttaIndex` + `spiegazione`. Coprono spazio, natura, storia, geografia, scacchi, Tris. Formato:

```json
{ "domanda": "...", "scelte": ["A","B","C","D"], "correttaIndex": 0, "spiegazione": "..." }
```

---

## F. Come collegare tutto al codice

**1. `content.json` unico per ricerca** — schema già tuo:
```json
{ "id": "lichess", "tipo": "gioco", "titolo": "...", "descrizione": "...",
  "tags": ["scacchi","single","no-account"], "players": {"min":1,"max":2},
  "durataMin": 15, "cover": "/covers/lichess.png",
  "linkEsterno": "https://lichess.org" }
```
Regole: o `rottaInterna` o `linkEsterno`, mai entrambi. `gameId` solo per i 4 interni (`solitario|tris|scacchi|quiz`).

**2. Tags standard consigliati** (usa questi per `FilterChips`):
`single, 2-giocatori, multiplayer, codice-stanza, carte, scacchi, parole, quiz, geografia, spazio, cielo, mare, musica, mappa, scienza, storia, natura, tech, veloce, 5-min, 15-min, no-account, mobile, italiano, inglese, link-esterno`

**3. Cover**: metti placeholder `/covers/*.png` 800×450, `loading=lazy`, fallback emoji se manca.

**4. Card esterna**: titolo + descrizione + badge `esterno • gratis • no account` + `target=_blank rel=noopener` + toast “stai uscendo da LosTime”.

**5. Ordine home consigliato MVP**: Hero → SearchBar → “Giochi in 2” (Tris, Scacchi, Gartic, Skribbl) → “5 minuti” (Quiz, 2048, Dino, Storm, CityGuessr) → “Esplora live” (/cielo, Radio Garden, ISS, Windy, Webcam) → “Curiosità” (grid da curiosities.json).

---

## G. Cosa mettere subito vs dopo

**Subito (MVP, costo zero):** 4 interni + 6 esterni leggeri (Lichess Storm, 2048, Dino, CityGuessr, Wordle IT, Minesweeper) + 8 esplora (Radio Garden, Windy, ISS, Stellarium, APOD, Wiki casuale, INGV, Skyline) + 12 curiosità + 15 quiz. Totale ~30 card: home piena senza appesantire.

**Fase 2:** Gartic/Skribbl in evidenza party, TETR.IO multi, MarineTraffic premium, account/classifiche, chat stanza, PWA 2048 self-hostato, puzzle Lichess giornalieri.

---

*Fonti verificate 2026-09-07: docs Vercel Vite, Supabase Realtime/Limits/Pricing, OpenSky REST, Leaflet, chess.js, react-chessboard, OpenTDB, NASA APOD, MediaWiki API. Link esterni “no account” verificati come free-to-try senza signup obbligatorio alla home; se un sito cambia paywall, la card resta valida come link con badge.*
