import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import Home from './pages/Home.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Login from './pages/Login.tsx';

function App(): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
