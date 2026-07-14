import { HashRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { PracticeList } from './pages/PracticeList';
import { Practice } from './pages/Practice';
import { CanvasFree } from './pages/CanvasFree';
import { Read } from './pages/Read';
import { Convert } from './pages/Convert';
import { SignDetail } from './pages/SignDetail';

export function App() {
  return (
    <HashRouter>
      <header className="app-header">
        <NavLink to="/" className="brand">
          <span className="cuneiform">𒀭</span> mesopota
        </NavLink>
        <nav>
          <NavLink to="/practice">習字</NavLink>
          <NavLink to="/canvas">自由書き</NavLink>
          <NavLink to="/read">読み取り</NavLink>
          <NavLink to="/convert">変換</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<PracticeList />} />
          <Route path="/practice/:id" element={<Practice />} />
          <Route path="/canvas" element={<CanvasFree />} />
          <Route path="/read" element={<Read />} />
          <Route path="/convert" element={<Convert />} />
          <Route path="/signs/:id" element={<SignDetail />} />
        </Routes>
      </main>
    </HashRouter>
  );
}
