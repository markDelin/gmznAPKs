import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader2 } from 'lucide-react';

interface AppData {
  id: number;
  name: string;
  version: string;
  size: string;
  category: string;
  download_url: string;
  icon_url?: string;
  whats_new?: string;
}

export default function Home() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/.netlify/functions/get-apps')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setApps(data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative px-6 py-20 md:py-32 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-slate-950 to-slate-950 -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
              Premium APKs
            </span>
            <br />
            <span className="text-indigo-500">Simplified.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            Download your favorite premium apps without the hassle. Secure, fast, and always up to date.
          </p>
        </motion.div>
      </section>

      {/* Grid Section */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-white">Trending Apps</h2>
          {/* <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">View All</button> */}
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin"/></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:bg-slate-900/80 transition-all hover:border-indigo-500/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl overflow-hidden shrink-0">
                    {app.icon_url && (app.icon_url.startsWith('http') || app.icon_url.startsWith('data:')) ? <img src={app.icon_url} alt="" className="w-full h-full object-cover"/> : "📦"}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {app.category}
                    </span>
                    {app.whats_new && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 uppercase tracking-wide">
                        Updated
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">{app.name}</h3>
                  <p className="text-sm text-slate-500">Version {app.version} • {app.size}</p>
                  
                  {app.whats_new && (
                    <div className="mt-3 p-2 rounded bg-white/5 text-xs text-slate-400 line-clamp-2">
                      <strong className="text-indigo-400 block mb-0.5">What's New:</strong>
                      {app.whats_new}
                    </div>
                  )}
                </div>

                <a href={app.download_url} target="_blank" rel="noopener noreferrer" className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors group-hover:bg-indigo-600 group-hover:text-white cursor-pointer decoration-0">
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </motion.div>
            ))}
            {apps.length === 0 && <div className="col-span-full text-center text-slate-500">No apps available yet.</div>}
          </div>
        )}
      </section>
    </div>
  );
}
