import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Package } from 'lucide-react';

const INITIAL_APPS = [
  { id: 1, name: "Spotify Premium", version: "8.8.4", size: "85 MB", category: "Music" },
  { id: 2, name: "Netflix Mod", version: "10.2.1", size: "120 MB", category: "Entertainment" },
  { id: 3, name: "Lightroom Pro", version: "9.0.0", size: "95 MB", category: "Photography" },
];

export default function Dashboard() {
  const [apps] = useState(INITIAL_APPS);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Manage your APK library.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium cursor-pointer shadow-lg shadow-indigo-500/20">
          <Plus className="w-5 h-5" />
          Add New App
        </button>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-slate-400 text-sm font-medium">
            <div className="col-span-5">App Name</div>
            <div className="col-span-2">Version</div>
            <div className="col-span-2">Category</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-1 text-right">Actions</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {apps.map((app) => (
            <motion.div 
              key={app.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors"
            >
              <div className="col-span-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-white font-medium">{app.name}</span>
              </div>
              <div className="col-span-2 text-slate-300">{app.version}</div>
              <div className="col-span-2 text-slate-300">{app.category}</div>
              <div className="col-span-2 text-slate-300">{app.size}</div>
              <div className="col-span-1 flex items-center justify-end gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-400 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
