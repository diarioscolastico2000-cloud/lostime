import { Outlet, Link } from 'react-router-dom';
import { OnlineBanner } from '../shared/OnlineBanner';
export function Layout() {
  return (<div className="app-dark"><OnlineBanner /><header><Link to="/">LosTime</Link><nav><Link to="/curiosita">Curiosità</Link><Link to="/cielo">Cielo</Link><Link to="/giochi">Giochi</Link></nav></header><main><Outlet /></main></div>);
}
