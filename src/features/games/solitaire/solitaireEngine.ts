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
