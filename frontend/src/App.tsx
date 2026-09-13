import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import BacktestJournal from './pages/BacktestJournal';
import ImportBacktest from './pages/ImportBacktest';
import LiveTracker from './pages/LiveTracker';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <nav className="app-nav">
          <h1>LBS Dashboard</h1>
          <NavLink to="/" end>Backtest Journal</NavLink>
          <NavLink to="/import">Import CSV</NavLink>
          <NavLink to="/live">Live Tracker</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
          <NavLink to="/insights">AI Insights</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        <main className="app-content">
          <Routes>
            <Route path="/" element={<BacktestJournal />} />
            <Route path="/import" element={<ImportBacktest />} />
            <Route path="/live" element={<LiveTracker />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/insights" element={<AIInsights />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
