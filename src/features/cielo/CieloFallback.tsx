export function CieloFallback({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div>
      <h2>Cielo non disponibile ({error})</h2>
      <p>Quota OpenSky finita o offline. Intanto traccia qui:</p>
      <ul>
        <li>
          <a href="https://www.flightradar24.com" target="_blank" rel="noreferrer">
            FlightRadar24
          </a>
        </li>
        <li>
          <a href="https://globe.adsbexchange.com" target="_blank" rel="noreferrer">
            ADS-B Exchange
          </a>
        </li>
      </ul>
      <button onClick={onRetry}>Riprova</button>
    </div>
  );
}
