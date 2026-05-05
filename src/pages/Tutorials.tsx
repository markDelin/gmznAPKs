
import { useState, useEffect } from 'react';
import { PlayCircle, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Tutorial {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
  duration: string;
}

export default function Tutorials() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutorials();
  }, []);

  const fetchTutorials = async () => {
    try {
        const res = await fetch('/api/manage-resources?type=tutorials');
        if (res.ok) setTutorials(await res.json());
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
            VIDEO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b44] to-purple-600">TUTORIALS</span>
        </h1>
        <p className="text-gray-400">Learn tips, tricks, and guides.</p>
      </div>

      {loading ? (
        <div className="loader-container min-h-[50vh]">
            <div className="ld-rh3">
                <div></div>
                <div></div>
            </div>
        </div>
      ) : (
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
    </div>
  );
}
