
import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

import Swal from 'sweetalert2';

interface Software {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  download_url: string;
  category: string;
}

export default function Softwares() {
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSoftwares();
  }, []);

  const fetchSoftwares = async () => {
    try {
      const res = await fetch('/api/manage-resources?type=softwares');
      if (res.ok) setSoftwares(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">
            USEFUL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b44] to-purple-600">SOFTWARE</span>
        </h1>
        <p className="text-gray-400">Essential tools for your PC and workflow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && [1,2,3].map(i => (
              <div key={i} className="bg-[#1a1a1a]/50 border border-white/5 rounded-2xl h-48 animate-pulse" />
          ))}
          {!loading && softwares.map((sw) => (
              <div 
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
                  
                  <a href={sw.download_url} 
                      onClick={(e) => handleDownload(e, sw.download_url, sw.name)}
                      className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-[#ff6b44] text-white py-3 rounded-xl font-bold text-sm transition-all group-hover:shadow-lg group-hover:shadow-orange-500/20">
                      <Download className="w-4 h-4" />
                      Download Now
                  </a>
              </div>
          ))}
          {!loading && softwares.length === 0 && <div className="col-span-full text-center py-20 text-gray-500">No softwares found.</div>}
      </div>
    </div>
  );
}
