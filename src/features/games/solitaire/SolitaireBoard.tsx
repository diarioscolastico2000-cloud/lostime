import { useState } from 'react';
import { createDeck } from './solitaireEngine';
export function SolitaireBoard() {
  const [deck] = useState(() => createDeck());
  return (<div><h2>Solitario</h2><p>Carte: {deck.length}</p><p>MVP: pesca e trascina semplificato, fondazioni per seme dal basso verso l'alto.</p></div>);
}
