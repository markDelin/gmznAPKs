
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Code, Monitor, BookOpen, ShoppingBag, Smartphone, Tv } from 'lucide-react';
import { useSettings } from '../../App';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const { homepageLayout } = useSettings();

  const navLinks = [
    { to: '/', label: 'Home', layout: 'apps' },
    { to: '/store', label: 'Store', icon: ShoppingBag, layout: 'store' },
    { to: '/anime', label: 'Anime', icon: Tv, layout: 'anime' },
    { to: '/apps', label: 'Apps', icon: Smartphone, layout: 'apps' },
    { to: '/softwares', label: 'Softwares', icon: Monitor, layout: 'apps' },
    { to: '/tutorials', label: 'Tutorials', icon: BookOpen, layout: 'apps' },
    { to: '/developer', label: 'Developer', icon: Code },
  ];

  const visibleLinks = navLinks.filter(link => !link.layout || link.layout === homepageLayout);

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
            {visibleLinks.map(link => (
              <Link 
                key={link.to}
                to={link.to} 
                className={`text-sm font-bold uppercase tracking-wide transition-colors flex items-center gap-2 ${isActive(link.to) || (link.to === '/anime' && location.pathname.startsWith('/watch')) ? 'text-[#ff6b44]' : 'text-gray-400 hover:text-white'}`}
              >
                {link.icon && <link.icon className="w-4 h-4"/>} {link.label}
              </Link>
            ))}
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
            {visibleLinks.map(link => (
              <Link 
                key={link.to}
                to={link.to} 
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 rounded-lg text-base font-bold ${isActive(link.to) ? 'bg-[#ff6b44]/10 text-[#ff6b44]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
              >
                <div className="flex items-center gap-3">
                   {link.icon && <link.icon className="w-5 h-5"/>} {link.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
