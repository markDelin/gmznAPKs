import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Code, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { to: '/', label: 'Home', icon: Tv },
    { to: '/developer', label: 'Developer', icon: Code },
  ];

  const visibleLinks = navLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/85 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
             <div className="relative w-9 h-9 md:w-10 md:h-10 flex flex-shrink-0">
                 <img src="/icon.png" alt="" className="absolute inset-0 w-full h-full blur-[10px] opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 object-cover saturate-200 rounded-xl" />
                 <img src="/icon.png" alt="GMZN Logo" className="relative z-10 w-full h-full group-hover:scale-105 transition-transform duration-500 object-cover rounded-xl shadow-inner border border-white/10" />
             </div>
             <span className="text-white font-black text-xl md:text-2xl tracking-tighter group-hover:text-[#ff6b44] transition-colors duration-300">
               GMZN<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b44] to-purple-600">ANIME</span>
             </span>
          </Link>

            {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {visibleLinks.map(link => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2 hover:-translate-y-0.5 ${isActive(link.to) || (link.to === '/' && (location.pathname.startsWith('/watch') || location.pathname.startsWith('/anime/'))) ? 'text-[#ff6b44]' : 'text-gray-400 hover:text-white'}`}
              >
                {link.icon && <link.icon className="w-4 h-4"/>} {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#ff6b44]/50"
          >
            <AnimatePresence mode="wait">
                <motion.div
                    key={isOpen ? "close" : "menu"}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden bg-[#0f0f0f]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-2">
                {visibleLinks.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                      <Link 
                        to={link.to} 
                        onClick={() => setIsOpen(false)}
                        className={`block px-4 py-3.5 rounded-xl text-sm uppercase tracking-widest font-black transition-all active:scale-[0.98] ${isActive(link.to) || (link.to === '/' && (location.pathname.startsWith('/watch') || location.pathname.startsWith('/anime/'))) ? 'bg-gradient-to-r from-[#ff6b44]/20 to-transparent text-[#ff6b44] border border-[#ff6b44]/20' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}
                      >
                        <div className="flex items-center gap-3">
                           {link.icon && <link.icon className={`w-5 h-5 ${isActive(link.to) ? 'text-[#ff6b44]' : 'text-gray-500'}`}/>} {link.label}
                        </div>
                      </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </nav>
  );
}
