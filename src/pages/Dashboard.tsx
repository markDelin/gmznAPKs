import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Package, X, Loader2 } from 'lucide-react';

interface AppData {
  id: number;
  name: string;
  version: string;
  size: string;
  category: string;
  download_url: string;
  icon_url?: string;
}

export default function Dashboard() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<AppData>>({ category: 'Utility' });
  const navigate = useNavigate();

  const getPassword = () => localStorage.getItem('admin_password');

  const fetchApps = async () => {
    try {
      const res = await fetch('/.netlify/functions/get-apps');
      if (res.ok) {
        const data = await res.json();
        setApps(data);
      }
    } catch (error) {
      console.error('Failed to fetch', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const pwd = getPassword();
    if (!pwd) {
      navigate('/login');
      return;
    }
    fetchApps();
  }, [navigate]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.download_url) return;

    try {
      const res = await fetch('/.netlify/functions/manage-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': getPassword() || '',
        },
        body: JSON.stringify(newItem),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setNewItem({ category: 'Utility' });
        fetchApps(); // Refresh list
      } else {
        alert('Failed to add app. Check password.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this app?')) return;
    try {
      const res = await fetch('/.netlify/functions/manage-app', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': getPassword() || '',
        },
        body: JSON.stringify({ id }),
      });
      if (res.ok) fetchApps();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-indigo-500"><Loader2 className="animate-spin w-8 h-8" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Manage your APK library.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium cursor-pointer shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-5 h-5" />
          Add New App
        </button>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-slate-400 text-sm font-medium bg-white/5">
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
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  {app.icon_url && app.icon_url.length < 5 ? app.icon_url : <Package className="w-5 h-5" />}
                </div>
                <div className="truncate">
                  <span className="text-white font-medium block truncate">{app.name}</span>
                </div>
              </div>
              <div className="col-span-2 text-slate-300">{app.version}</div>
              <div className="col-span-2 text-slate-300">{app.category}</div>
              <div className="col-span-2 text-slate-300">{app.size}</div>
              <div className="col-span-1 flex items-center justify-end gap-2">
                <button 
                  onClick={() => handleDelete(app.id)}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {apps.length === 0 && (
            <div className="p-8 text-center text-slate-500">No apps found. Add one to get started.</div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Add New App</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <input required placeholder="App Name" className="bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white" value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                   <input required placeholder="Version (e.g. 1.0)" className="bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white" value={newItem.version || ''} onChange={e => setNewItem({...newItem, version: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <input required placeholder="Size (e.g. 50 MB)" className="bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white" value={newItem.size || ''} onChange={e => setNewItem({...newItem, size: e.target.value})} />
                   <input required placeholder="Category" className="bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white" value={newItem.category || ''} onChange={e => setNewItem({...newItem, category: e.target.value})} />
                </div>
                <input required placeholder="Download URL" className="bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white w-full" value={newItem.download_url || ''} onChange={e => setNewItem({...newItem, download_url: e.target.value})} />
                <input placeholder="Icon Emoji or URL" className="bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white w-full" value={newItem.icon_url || ''} onChange={e => setNewItem({...newItem, icon_url: e.target.value})} />
                
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg mt-4">Add Application</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
