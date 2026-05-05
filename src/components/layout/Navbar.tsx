
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Code, Monitor, BookOpen, ShoppingBag, Smartphone, Tv } from 'lucide-react';

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
             <div className="relative w-8 h-8 flex flex-shrink-0">
                 <img src="/icon.png" alt="" className="absolute inset-0 w-full h-full blur-[8px] opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all object-cover saturate-150 rounded-xl" />
                 <img src="/icon.png" alt="GMZN Logo" className="relative z-10 w-full h-full group-hover:scale-110 transition-transform object-cover rounded-xl shadow-inner border border-white/10" />
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
              Home
            </Link>
            <Link 
              to="/store" 
              className={`text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${isActive('/store') ? 'text-[#ff6b44]' : 'text-gray-400 hover:text-white'}`}
            >
              <ShoppingBag className="w-4 h-4"/> Store
            </Link>
            <Link 
              to="/anime" 
              className={`text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${isActive('/anime') || location.pathname.startsWith('/watch') ? 'text-[#ff6b44]' : 'text-gray-400 hover:text-white'}`}
            >
              <Tv className="w-4 h-4"/> Anime
            </Link>
            <Link 
              to="/apps" 
              className={`text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${isActive('/apps') ? 'text-[#ff6b44]' : 'text-gray-400 hover:text-white'}`}
            >
              <Smartphone className="w-4 h-4"/> Apps
            </Link>
            <Link 
              to="/softwares" 
              className={`text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${isActive('/softwares') ? 'text-[#ff6b44]' : 'text-gray-400 hover:text-white'}`}
            >
              <Monitor className="w-4 h-4"/> Softwares
            </Link>
             <Link 
              to="/tutorials" 
              className={`text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${isActive('/tutorials') ? 'text-[#ff6b44]' : 'text-gray-400 hover:text-white'}`}
            >
              <BookOpen className="w-4 h-4"/> Tutorials
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
                 Home
              </div>
            </Link>
            <Link 
              to="/store" 
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-bold ${isActive('/store') ? 'bg-[#ff6b44]/10 text-[#ff6b44]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                 <ShoppingBag className="w-5 h-5"/> Store
              </div>
            </Link>
            <Link 
              to="/anime" 
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-bold ${isActive('/anime') ? 'bg-[#ff6b44]/10 text-[#ff6b44]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                 <Tv className="w-5 h-5"/> Anime
              </div>
            </Link>
            <Link 
              to="/apps" 
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-bold ${isActive('/apps') ? 'bg-[#ff6b44]/10 text-[#ff6b44]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                 <Smartphone className="w-5 h-5"/> Apps
              </div>
            </Link>
             <Link 
              to="/softwares" 
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-bold ${isActive('/softwares') ? 'bg-[#ff6b44]/10 text-[#ff6b44]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                 <Monitor className="w-5 h-5"/> Softwares
              </div>
            </Link>
             <Link 
              to="/tutorials" 
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-3 rounded-lg text-base font-bold ${isActive('/tutorials') ? 'bg-[#ff6b44]/10 text-[#ff6b44]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <div className="flex items-center gap-3">
                 <BookOpen className="w-5 h-5"/> Tutorials
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
