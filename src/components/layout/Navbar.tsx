
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Menu, X, Code, Layers, Award } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
             <div className="bg-[#ff6b44] text-black font-black text-xl w-8 h-8 flex items-center justify-center rounded-lg shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
               G
             </div>
             <span className="text-white font-black text-lg tracking-tight group-hover:text-[#ff6b44] transition-colors">
               GMZN<span className="text-[#ff6b44]">APKS</span>
             </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${isActive('/') ? 'text-[#ff6b44]' : 'text-gray-400 hover:text-white'}`}
            >
              <Award className="w-4 h-4"/> Badges
            </Link>
            <Link 
              to="/resources" 
              className={`text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${isActive('/resources') ? 'text-[#ff6b44]' : 'text-gray-400 hover:text-white'}`}
            >
              <Layers className="w-4 h-4"/> Resources
            </Link>
            <Link 
              to="/developer" 
              className={`text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${isActive('/developer') ? 'text-[#ff6b44]' : 'text-gray-400 hover:text-white'}`}
            >
              <Code className="w-4 h-4"/> Developer
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#1a1a1a] border-b border-white/5 animate-in slide-in-from-top-4">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link 
              to="/" 
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-bold ${isActive('/') ? 'bg-[#ff6b44]/10 text-[#ff6b44]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                 <LayoutGrid className="w-5 h-5"/> Apps
              </div>
            </Link>
            <Link 
              to="/resources" 
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-bold ${isActive('/resources') ? 'bg-[#ff6b44]/10 text-[#ff6b44]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
               <div className="flex items-center gap-3">
                 <Layers className="w-5 h-5"/> Resources
               </div>
            </Link>
             <Link 
              to="/developer" 
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-bold ${isActive('/developer') ? 'bg-[#ff6b44]/10 text-[#ff6b44]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
               <div className="flex items-center gap-3">
                 <Code className="w-5 h-5"/> Developer
               </div>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
