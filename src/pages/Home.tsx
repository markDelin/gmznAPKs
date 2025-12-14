import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

const APPS = [
  { id: 1, name: "Spotify Premium", version: "8.8.4", size: "85 MB", category: "Music", icon: "🎵" },
  { id: 2, name: "Netflix Mod", version: "10.2.1", size: "120 MB", category: "Entertainment", icon: "🎬" },
  { id: 3, name: "Lightroom Pro", version: "9.0.0", size: "95 MB", category: "Photography", icon: "📸" },
  { id: 4, name: "YouTube Vanced", version: "17.03", size: "65 MB", category: "Video", icon: "📺" },
  { id: 5, name: "PicsArt Gold", version: "22.5", size: "70 MB", category: "Design", icon: "🎨" },
  { id: 6, name: "InShot Pro", version: "1.9", size: "55 MB", category: "Video Editor", icon: "✂️" },
];

export default function Home() {
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
          <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">View All</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {APPS.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative p-6 bg-slate-900/50 border border-white/5 rounded-2xl hover:bg-slate-900/80 transition-all hover:border-indigo-500/30 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative flex items-start justify-between">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                  {app.icon}
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {app.category}
                </span>
              </div>
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">{app.name}</h3>
                <p className="text-sm text-slate-500">Version {app.version} • {app.size}</p>
              </div>

              <button className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-colors group-hover:bg-indigo-600 group-hover:text-white cursor-pointer">
                <Download className="w-4 h-4" />
                Download
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
