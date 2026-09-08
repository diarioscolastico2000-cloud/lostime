import { Outlet, Link, NavLink } from 'react-router-dom';
import { OnlineBanner } from '../shared/OnlineBanner';

const NAV = [
  { to: '/curiosita', label: 'Curiosità' },
  { to: '/cielo', label: 'Cielo' },
  { to: '/giochi', label: 'Giochi' },
  { to: '/sessioni', label: 'Sessioni' },
];

export function Layout() {
  return (
    <div className="app-dark">
      <a className="lt-skip" href="#contenuto">
        Salta al contenuto
      </a>
      <OnlineBanner />
      <header className="lt-header">
        <div className="lt-header-inner">
          <Link to="/" className="lt-logo" aria-label="LosTime — home">
            Los<span className="lt-logo-accent">Time</span>
            <span className="lt-logo-dot" aria-hidden="true" />
          </Link>
          <nav className="lt-nav" aria-label="Navigazione principale">
            {NAV.map((v) => (
              <NavLink
                key={v.to}
                to={v.to}
                className={({ isActive }) => `lt-nav-link${isActive ? ' active' : ''}`}
              >
                {v.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main id="contenuto">
        <Outlet />
      </main>
    </div>
  );
}
