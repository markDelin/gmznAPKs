
import { useState, useEffect } from 'react';
import { Search, ShieldCheck, Smartphone, Download, Loader2, X, FileText, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';

interface AppData {
  id: number;
  name: string;
  version: string;
  size: string;
  category: string;
  download_url: string;
  icon_url?: string;
  whats_new?: string;
  description?: string;
  tags?: string[];
  previous_versions?: { version: string, download_url: string, size: string }[];
  is_pinned?: boolean;
}

interface RequestData {
  username: string;
  app_name: string;
}

export default function Home() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);

  // App Specific State
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState<RequestData>({ username: '', app_name: '' });
  const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
      setLoading(true);
      try {
          const res = await fetch('/api/get-apps');
          if(res.ok) {
              const data = await res.json();
              setApps(data.map((a: AppData & { previous_versions: string | object }) => ({
                  ...a, 
                  previous_versions: typeof a.previous_versions === 'string' ? JSON.parse(a.previous_versions) : a.previous_versions
              })));
          }
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  const appCategories = ['All', ...Array.from(new Set(apps.map(a => a.category)))];
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || app.category === filter;
    return matchesSearch && matchesFilter;
  });

  const handleRequestSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setRequestStatus('submitting');
      try {
          const res = await fetch('/api/request-app', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestForm)
          });
          if (res.ok) {
              setRequestStatus('success');
              setTimeout(() => {
                  setShowRequestModal(false);
                  setRequestStatus('idle');
                  setRequestForm({ username: '', app_name: '' });
              }, 2000);
          } else {
              setRequestStatus('error');
          }
      } catch {
          setRequestStatus('error');
      }
  };

  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>, url: string, name: string) => {
      e.preventDefault();
      Swal.fire({
          title: 'Starting Download...',
          text: `Downloading ${name}`,
          icon: 'success',
          background: '#1a1a1a',
          color: '#fff',
          timer: 2000,
          showConfirmButton: false
      }).then(() => {
          window.open(url, '_blank');
      });
  };

  const AppCard = ({ app }: { app: AppData }) => (
    <div 
      onClick={() => setSelectedApp(app)}
      className="relative group bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer p-5"
    >
        {/* Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative z-10 flex items-start justify-between mb-4">
            <div className="relative">
                <div className="rounded-2xl overflow-hidden bg-slate-800 shadow-lg w-16 h-16">
                    {app.icon_url ? (
                        <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                             <Smartphone className="w-8 h-8" />
                        </div>
                    )}
                </div>
                {app.tags?.includes('Modded') && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                        MOD
                    </div>
                )}
            </div>
             <button className="p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-xl transition-all duration-300">
                 <Download className="w-5 h-5" />
             </button>
        </div>

        <div className="relative z-10">
             <div className="flex flex-wrap gap-2 mb-2">
                 <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-medium border border-white/5 uppercase tracking-wide">
                     {app.category}
                 </span>
                 {app.tags?.map(tag => (
                     <span key={tag} className={`px-2 py-0.5 rounded-md text-[10px] font-medium border border-white/5 ${tag === 'Premium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-slate-800 text-slate-300'}`}>
                         {tag}
                     </span>
                 ))}
             </div>

             <h3 className="font-bold text-white mb-1 truncate text-lg group-hover:text-indigo-400 transition-colors">
                 {app.name}
             </h3>
             
             <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 font-mono">
                 <span className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                     v{app.version}
                 </span>
                 <span>{app.size}</span>
             </div>

             <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Updated recently</span>
                  {app.previous_versions && app.previous_versions.length > 0 && (
                     <span className="text-[10px] text-indigo-400 hover:underline cursor-pointer">
                         + {app.previous_versions.length} versions
                     </span>
                  )}
             </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-12 text-left">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
            GMZN<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b44] to-purple-600">APKS</span>
        </h1>
        <p className="text-gray-400">Your trusted source for premium and modded applications.</p>
      </div>

      <div className="space-y-8">
           {/* Search & Filter */}
           <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        className="w-full bg-[#1a1a1a] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-[#ff6b44] outline-none"
                        placeholder="Search apps..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto custom-scrollbar">
                    {appCategories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${filter === cat ? 'bg-[#ff6b44] border-[#ff6b44] text-white' : 'border-white/10 text-gray-400 hover:border-white/30'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
           </div>

           {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 h-48 animate-pulse" />
                    ))}
                </div>
           ) : (
               <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredApps.map(app => <AppCard key={app.id} app={app} />)}
                   </div>
                   
                   {filteredApps.length === 0 && (
                        <div className="text-center py-20 text-gray-500">No apps found matching your criteria.</div>
                   )}
               </div>
           )}

            <button 
                onClick={() => setShowRequestModal(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-indigo-900/40 hover:scale-110 transition-all z-40 group"
                title="Request App"
            >
                <ShieldCheck className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </button>
      </div>

      {/* --- MODALS --- */}
      <AnimatePresence>
            {selectedApp && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    onClick={() => setSelectedApp(null)}
                >
                     <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 10 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }} 
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        className="bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative h-[65vh] md:h-auto md:max-h-[85vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                     >
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="relative h-24 md:h-32 bg-gradient-to-br from-[#ff6b44]/20 via-purple-500/10 to-transparent flex-shrink-0">
                                 <button onClick={() => setSelectedApp(null)} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors z-50">
                                     <X className="w-5 h-5" />
                                 </button>
                            </div>
                        
                            <div className="px-5 pb-6 md:px-8 md:pb-8 -mt-12 relative z-10 mb-6">
                                <div className="flex flex-col md:flex-row gap-5 md:gap-6">
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-[#1a1a1a] rounded-3xl border border-white/10 shadow-2xl shadow-[#ff6b44]/20 overflow-hidden flex-shrink-0 relative group">
                                         {selectedApp.icon_url ? (
                                            <>
                                                <img src={selectedApp.icon_url} className="absolute inset-0 w-full h-full blur-lg opacity-50 transition-opacity saturate-150 rounded-3xl" alt="" />
                                                <img src={selectedApp.icon_url} className="w-full h-full object-cover relative z-10 rounded-3xl shadow-inner border border-white/5" alt={selectedApp.name} />
                                            </>
                                         ) : (
                                             <div className="w-full h-full flex items-center justify-center text-slate-500"><Smartphone className="w-10 h-10"/></div>
                                         )}
                                    </div>
                                    
                                    <div className="flex-1 pt-12">
                                         <div className="flex flex-wrap gap-2 mb-2">
                                             {selectedApp.tags?.map(t => (
                                                 <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-[#ff6b44]/10 text-[#ff6b44] border border-[#ff6b44]/20">{t}</span>
                                             ))}
                                         </div>
                                         <h2 className="text-3xl font-bold text-white mb-1">{selectedApp.name}</h2>
                                         <div className="flex items-center gap-4 text-sm text-slate-400">
                                             <span>v{selectedApp.version}</span>
                                             <span>•</span>
                                             <span>{selectedApp.size}</span>
                                             <span>•</span>
                                             <span>{selectedApp.category}</span>
                                         </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-2 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-6 pt-0">
                                <div className="space-y-4">
                                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                         <FileText className="w-4 h-4" /> Description
                                     </h3>
                                     <p className="text-slate-300 leading-relaxed text-sm">
                                         {selectedApp.description || "Download the official application safely and securely."}
                                     </p>
                                </div>
                                <div className="space-y-4">
                                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                         <Clock className="w-4 h-4" /> Recent Updates
                                     </h3>
                                     <div className="space-y-3">
                                         <div className="p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 shadow-inner">
                                             <div className="flex justify-between items-center mb-1">
                                                 <span className="font-bold text-[#ff6b44]">v{selectedApp.version}</span>
                                                 <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">Current</span>
                                             </div>
                                         </div>
                                          {selectedApp.previous_versions?.map((v, i) => (
                                             <div key={i} className="flex justify-between items-center p-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5">
                                                 <span className="text-sm font-medium text-gray-300">v{v.version}</span>
                                                 <a href={v.download_url} onClick={(e) => handleDownload(e, v.download_url, `${selectedApp.name} v${v.version}`)} className="text-xs font-bold text-[#ff6b44] hover:text-[#ff5528] px-3 py-1.5 bg-[#ff6b44]/10 rounded-lg hover:bg-[#ff6b44]/20 transition-colors">Download</a>
                                             </div>
                                         ))}
                                     </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-5 border-t border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl flex gap-4 shrink-0 z-20">
                            <a href={selectedApp.download_url} onClick={(e) => handleDownload(e, selectedApp.download_url, selectedApp.name)} className="flex-1 py-4 bg-gradient-to-r from-[#ff6b44] to-[#ff5528] text-white rounded-2xl font-black text-lg text-center flex items-center justify-center gap-2 shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-transform">
                                <Download className="w-5 h-5" /> Download APK
                            </a>
                        </div>
                     </motion.div>
                </motion.div>
            )}
             
            {showRequestModal && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
                    >
                        <button onClick={() => setShowRequestModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                        
                        {requestStatus === 'success' ? (
                             <div className="text-center py-8">
                                 <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                     <CheckCircle className="w-8 h-8" />
                                 </div>
                                 <h3 className="text-2xl font-bold text-white mb-2">Request Sent!</h3>
                             </div>
                        ) : (
                            <>
                                <h2 className="text-2xl font-bold text-white mb-6">Request an App</h2>
                                <form onSubmit={handleRequestSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">App Name</label>
                                        <input 
                                            required 
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                                            placeholder="e.g. Spotify Premium"
                                            value={requestForm.app_name}
                                            onChange={e => setRequestForm({...requestForm, app_name: e.target.value})}
                                        />
                                    </div>
                                    <button 
                                        disabled={requestStatus === 'submitting'}
                                        type="submit" 
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                                    >
                                        {requestStatus === 'submitting' ? <Loader2 className="animate-spin w-5 h-5"/> : 'Submit Request'}
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
      </AnimatePresence>
    </div>
  );
}
