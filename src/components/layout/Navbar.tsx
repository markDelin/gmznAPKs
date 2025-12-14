import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          GMZN
        </Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">Home</Link>
          <Link to="/dashboard" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-sm font-medium transition-all shadow-lg shadow-indigo-500/20">
            Manage Apps
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}
