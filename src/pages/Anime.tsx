import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Play, Star, Calendar } from 'lucide-react';

interface Anime {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  banner_image: string;
  genre: string[];
  status: string;
  rating: number;
  total_episodes: number;
}

export default function Anime() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/get-anime')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAnimeList(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredAnime = animeList.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-24 md:pt-32">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-2">
              WATCH <span className="text-[#ff6b44]">ANIME</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Explore my collection of the latest anime</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search anime or genre..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-[#ff6b44] outline-none backdrop-blur-xl transition-all text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Browser Recommendation */}
        <div className="mt-8 p-6 bg-gradient-to-r from-orange-500/10 via-red-500/5 to-transparent rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b44]/10 rounded-full blur-[40px] group-hover:bg-[#ff6b44]/20 transition-colors pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="w-16 h-16 flex-shrink-0 bg-white/5 p-3 rounded-2xl border border-white/10 shadow-inner">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/9d/Brave_lion_icon.svg" alt="Brave Browser" className="w-full h-full object-contain" />
                </div>
                <div className="text-center md:text-left flex-1">
                    <h3 className="text-white font-black text-lg mb-1 uppercase tracking-tight">Better Viewing Experience</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        For the best ad-free experience, I recommend using <span className="text-white font-bold">Brave Browser</span>. It automatically blocks intrusive ads and trackers for a smoother playback.
                    </p>
                </div>
                <a 
                    href="https://brave.com/download/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-[#ff6b44] hover:bg-[#ff5528] text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 hover:scale-105"
                >
                    Get Brave
                </a>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
             <Play className="w-5 h-5 text-[#ff6b44] fill-[#ff6b44]" />
             LATEST UPLOADS
           </h2>
           <div className="flex items-center gap-4">
               {loading && <div className="w-4 h-4 border-2 border-[#ff6b44] border-t-transparent rounded-full animate-spin" />}
               <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{filteredAnime.length} Titles Found</span>
           </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {animeList.length === 0 && loading ? (
             [1,2,3,4,5].map(i => <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl animate-pulse" />)
          ) : (
            filteredAnime.map(anime => (
              <Link 
                key={anime.id} 
                to={`/watch/${anime.id}`}
                className="group relative flex flex-col"
              >
                {/* ... existing link content ... */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/5 shadow-2xl transition-transform group-hover:scale-[1.03] duration-500">
                  <img 
                    src={anime.cover_image} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                    alt={anime.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute top-3 left-3 bg-[#ff6b44] text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-lg z-20">
                    {anime.status}
                  </div>

                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-yellow-400 text-[10px] font-black px-2 py-1 rounded flex items-center gap-1 border border-white/10 z-20">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    {anime.rating}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                     <div className="w-14 h-14 bg-[#ff6b44] rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40">
                       <Play className="w-6 h-6 text-white fill-white ml-1" />
                     </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                     <div className="flex flex-wrap gap-1 mb-2">
                       {anime.genre.slice(0, 2).map(g => (
                         <span key={g} className="text-[9px] bg-white/10 backdrop-blur-md text-white px-1.5 py-0.5 rounded border border-white/10 uppercase font-bold">
                           {g}
                         </span>
                       ))}
                     </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-white font-bold text-sm md:text-base group-hover:text-[#ff6b44] transition-colors truncate">
                    {anime.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {anime.total_episodes} Episodes
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {!loading && filteredAnime.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 mt-8">
             <p className="text-gray-500 font-bold italic">No anime found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
