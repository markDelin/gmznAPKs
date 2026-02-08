import { useState, useEffect } from 'react';
import { Monitor, BookOpen, Download, ExternalLink, PlayCircle, Clock, Smartphone, Search, Zap, ShieldCheck, Loader2, X, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Interfaces ---
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

interface Software {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  download_url: string;
  category: string;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
  duration: string;
}

interface RequestData {
  username: string;
  app_name: string;
}

export default function Resources() {
  const [activeTab, setActiveTab] = useState<'apps' | 'softwares' | 'tutorials'>('apps');
  const [apps, setApps] = useState<AppData[]>([]);
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  // App Specific State
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState<RequestData>({ username: '', app_name: '' });
  const [requestStatus, setRequestStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
      setLoading(true);
      try {
          // Fetch all resources in parallel
          const [appsRes, softRes, tutRes] = await Promise.all([
              fetch('/api/get-apps'),
              fetch('/api/manage-resources?type=softwares'),
              fetch('/api/manage-resources?type=tutorials')
          ]);
          
          if(appsRes.ok) setApps(await appsRes.json());
          if(softRes.ok) setSoftwares(await softRes.json());
          if(tutRes.ok) setTutorials(await tutRes.json());
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  // --- App Logic ---
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
      } catch (error) {
          setRequestStatus('error');
      }
  };

  const AppCard = ({ app }: { app: AppData }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
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
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                RESOURCES <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b44] to-purple-600">HUB</span>
            </h1>
            <p className="text-gray-400">Essential tools, apps, and guides for your journey.</p>
          </div>
          
          <div className="flex bg-[#1a1a1a] p-1 rounded-xl border border-white/5 overflow-x-auto max-w-full">
              <button 
                onClick={() => setActiveTab('apps')}
                className={`px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'apps' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white'}`}>
                <Smartphone className="w-4 h-4" />
                Apps
              </button>
              <button 
                onClick={() => setActiveTab('softwares')}
                className={`px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'softwares' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white'}`}>
                <Monitor className="w-4 h-4" />
                Softwares
              </button>
              <button 
                onClick={() => setActiveTab('tutorials')}
                className={`px-6 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'tutorials' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white'}`}>
                <BookOpen className="w-4 h-4" />
                Tutorials
              </button>
          </div>
      </div>

      {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
              {[1,2,3].map(i => <div key={i} className="h-48 bg-[#1a1a1a] rounded-xl" />)}
          </div>
      ) : (
          <>
          {/* APPS CONTENT */}
          {activeTab === 'apps' && (
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

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredApps.map(app => <AppCard key={app.id} app={app} />)}
                   </div>
                   
                   {filteredApps.length === 0 && (
                        <div className="text-center py-20 text-gray-500">No apps found matching your criteria.</div>
                   )}

                   {/* Request FAB */}
                    <button 
                        onClick={() => setShowRequestModal(true)}
                        className="fixed bottom-8 right-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold shadow-2xl shadow-indigo-900/40 hover:scale-105 transition-all flex items-center gap-2 z-40"
                    >
                        <ShieldCheck className="w-5 h-5" /> Request App
                    </button>
              </div>
          )}

          {/* SOFTWARES CONTENT */}
          {activeTab === 'softwares' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {softwares.map((sw, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={sw.id} 
                        className="group bg-[#1a1a1a]/50 hover:bg-[#1a1a1a] border border-white/5 hover:border-[#ff6b44]/30 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-black/40 p-2 border border-white/5">
                                <img src={sw.icon_url} alt={sw.name} className="w-full h-full object-contain rounded-xl" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 text-gray-400 px-2 py-1 rounded-md border border-white/5 group-hover:border-[#ff6b44]/20 group-hover:text-[#ff6b44] transition-colors">{sw.category}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#ff6b44] transition-colors">{sw.name}</h3>
                        <p className="text-sm text-gray-400 mb-6 line-clamp-2">{sw.description}</p>
                        
                        <a href={sw.download_url} target="_blank" rel="noopener noreferrer" 
                            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-[#ff6b44] text-white py-3 rounded-xl font-bold text-sm transition-all group-hover:shadow-lg group-hover:shadow-orange-500/20">
                            <Download className="w-4 h-4" />
                            Download Now
                        </a>
                    </motion.div>
                ))}
                {softwares.length === 0 && <div className="col-span-full text-center py-20 text-gray-500">No softwares found.</div>}
            </div>
          )}
          
          {/* TUTORIALS CONTENT */}
          {activeTab === 'tutorials' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tutorials.map((tut, idx) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={tut.id} 
                        className="group bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/5 hover:border-[#ff6b44]/30 transition-all hover:-translate-y-1">
                        <div className="relative aspect-video bg-black/50">
                            <img src={tut.thumbnail_url} alt={tut.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                                <PlayCircle className="w-12 h-12 text-[#ff6b44] fill-white/10" />
                            </div>
                            <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-xs font-bold text-white rounded flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {tut.duration}
                            </span>
                        </div>
                        
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                 <span className="text-[10px] font-bold uppercase text-[#ff6b44]">{tut.category}</span>
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-[#ff6b44] transition-colors">{tut.title}</h3>
                            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{tut.description}</p>
                            
                            <a href={tut.video_url} target="_blank" rel="noopener noreferrer" 
                                className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-white transition-colors">
                                Watch Tutorial <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </motion.div>
                ))}
                 {tutorials.length === 0 && <div className="col-span-full text-center py-20 text-gray-500">No tutorials found.</div>}
            </div>
          )}
          </>
      )}

      {/* --- MODALS (Reused from App logic) --- */}
      <AnimatePresence>
            {/* App Details Modal */}
            {selectedApp && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    onClick={() => setSelectedApp(null)}
                >
                     <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative h-[65vh] md:h-auto md:max-h-[85vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                     >
                        {/* Modal Header/Banner */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {/* Modal Header/Banner */}
                            <div className="relative h-24 md:h-32 bg-gradient-to-br from-indigo-900/50 to-purple-900/50 flex-shrink-0">
                                 <button onClick={() => setSelectedApp(null)} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-50">
                                     <X className="w-5 h-5" />
                                 </button>
                            </div>
                        
                            <div className="px-5 pb-6 md:px-8 md:pb-8 -mt-12 relative z-10 mb-6">
                                <div className="flex flex-col md:flex-row gap-5 md:gap-6">
                                {/* Icon */}
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-800 rounded-2xl border-4 border-slate-900 shadow-xl overflow-hidden flex-shrink-0">
                                     {selectedApp.icon_url ? (
                                        <img src={selectedApp.icon_url} className="w-full h-full object-cover" />
                                     ) : (
                                         <div className="w-full h-full flex items-center justify-center text-slate-500"><Smartphone className="w-10 h-10"/></div>
                                     )}
                                </div>
                                
                                {/* Header Info */}
                                <div className="flex-1 pt-12">
                                     <div className="flex flex-wrap gap-2 mb-2">
                                         {selectedApp.tags?.map(t => (
                                             <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{t}</span>
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

                            {/* Information Tabs/Sections */}
                            <div className="mt-2 md:mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div className="space-y-4">
                                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                         <FileText className="w-4 h-4" /> Description
                                     </h3>
                                     <p className="text-slate-300 leading-relaxed text-sm">
                                         {selectedApp.description || "Unlock the full potential of this application with our premium mod. Enjoy ad-free experience, unlocked features, and unlimited access. Download safely and securely."}
                                     </p>
                                </div>
                                <div className="space-y-4">
                                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                         <Clock className="w-4 h-4" /> Recent Updates
                                     </h3>
                                     <div className="space-y-3">
                                         <div className="p-3 bg-slate-800/50 rounded-lg border border-white/5">
                                             <div className="flex justify-between items-center mb-1">
                                                 <span className="font-bold text-indigo-300">v{selectedApp.version}</span>
                                                 <span className="text-[10px] text-slate-500">Current</span>
                                             </div>
                                             <p className="text-xs text-slate-400">Latest version with all premium features unlocked and performance improvements.</p>
                                         </div>
                                         {selectedApp.previous_versions?.map((v, i) => (
                                             <div key={i} className="flex justify-between items-center p-3 bg-slate-800/30 rounded-lg border border-white/5">
                                                 <span className="text-sm text-slate-400">v{v.version}</span>
                                                 <a href={v.download_url} className="text-xs text-indigo-400 hover:text-indigo-300">Download</a>
                                             </div>
                                         ))}
                                          {!selectedApp.previous_versions?.length && (
                                              <div className="text-xs text-slate-600 italic">No older versions available.</div>
                                          )}
                                     </div>
                                </div>
                            </div>

                        </div>
                        
                        {/* Sticky Footer Actions */}
                        <div className="p-4 border-t border-white/5 bg-slate-900/95 backdrop-blur-sm flex gap-4 shrink-0 z-20">
                            <a href={selectedApp.download_url} target="_blank" rel="noopener noreferrer" className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-center flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform">
                                <Download className="w-5 h-5" /> Download APK
                            </a>
                             <button className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors">
                                <ShieldCheck className="w-5 h-5" />
                            </button>
                        </div>
                     </motion.div>
                </motion.div>
            )}
             {/* Request Modal */}
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
                                 <p className="text-slate-400">We'll review your request shortly.</p>
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
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Your Name (Optional)</label>
                                        <input 
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"
                                            placeholder="Anonymous"
                                            value={requestForm.username}
                                            onChange={e => setRequestForm({...requestForm, username: e.target.value})}
                                        />
                                    </div>
                                    <button 
                                        disabled={requestStatus === 'submitting'}
                                        type="submit" 
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
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
