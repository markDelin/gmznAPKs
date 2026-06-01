import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Play, Star, Calendar, Bookmark, Clock, Film, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
};

function SkeletonCard() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[2/3] bg-white/5 rounded-2xl" />
      <div className="mt-4 space-y-2">
        <div className="h-4 bg-white/5 rounded-lg w-3/4" />
        <div className="h-3 bg-white/5 rounded-lg w-1/2" />
      </div>
    </div>
  );
}

function ImageWithFallback({ src, alt, className }: { src: string; alt: string; className: string }) {
  const [error, setError] = useState(false);
  return error ? (
    <div className={`${className} flex items-center justify-center bg-white/5`}>
      <Film className="w-8 h-8 text-gray-600" />
    </div>
  ) : (
    <img src={src} alt={alt} className={className} onError={() => setError(true)} />
  );
}

export default function Anime() {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [watchHistory, setWatchHistory] = useState<Record<string, { episodeNumber: number }>>({});
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'bookmarked'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'az'>('latest');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/get-anime')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAnimeList(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('watchHistory') || '{}');
    setWatchHistory(history);
    const bks = JSON.parse(localStorage.getItem('animeBookmarks') || '[]');
    setBookmarks(bks);
  }, []);

  const watchedIds = Object.keys(watchHistory).map(Number);
  const continueWatching = animeList.filter(a => watchedIds.includes(a.id)).slice(0, 5);

  let filteredAnime = animeList.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.genre.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (filterMode === 'bookmarked') {
    filteredAnime = filteredAnime.filter(a => bookmarks.includes(a.id));
  }

  filteredAnime.sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    return b.id - a.id;
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 pt-20 md:pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-2">
              WATCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b44] to-orange-400">ANIME</span>
            </h1>
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Explore my collection of the latest anime</p>
          </div>

          <div className="relative w-full md:w-80 lg:w-96 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search anime or genre..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#ff6b44] outline-none backdrop-blur-xl transition-all text-sm placeholder:text-gray-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && filterMode === 'all' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-[#ff6b44]/20 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-[#ff6b44]" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-wider">Continue Watching</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar -mx-4 sm:mx-0 px-4 sm:px-0">
            {continueWatching.map(anime => {
              const history = watchHistory[anime.id];
              const progress = Math.min(100, ((history?.episodeNumber || 1) / (anime.total_episodes || 1)) * 100);
              return (
                  <Link
                    key={anime.id}
                    to={`/anime/${anime.id}`}
                    className="flex-shrink-0 w-36 md:w-44 group"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/5 shadow-lg transition-transform group-hover:scale-[1.03] duration-300">
                    <ImageWithFallback
                      src={anime.cover_image}
                      alt={anime.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white font-bold text-xs truncate drop-shadow-lg">{anime.title}</p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div className="h-full bg-[#ff6b44] transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-[#0a0a0a]/90 p-3 md:p-4 rounded-2xl border border-white/5 backdrop-blur-xl sticky top-20 z-40 shadow-2xl">
          <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 flex-shrink-0 pl-2">
            <Play className="w-5 h-5 text-[#ff6b44] fill-[#ff6b44]" />
            {filterMode === 'bookmarked' ? 'MY LIST' : 'LATEST UPLOADS'}
          </h2>
          <div className="flex overflow-x-auto items-center gap-3 md:gap-4 w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
            {loading && <div className="w-4 h-4 border-2 border-[#ff6b44] border-t-transparent rounded-full animate-spin flex-shrink-0" />}

            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 flex-shrink-0">
              <button onClick={() => setFilterMode('all')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all duration-300 ${filterMode === 'all' ? 'bg-[#ff6b44] text-white shadow-md shadow-orange-500/20 scale-105' : 'text-gray-400 hover:text-white'}`}>All</button>
              <button onClick={() => setFilterMode('bookmarked')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition-all duration-300 ${filterMode === 'bookmarked' ? 'bg-[#ff6b44] text-white shadow-md shadow-orange-500/20 scale-105' : 'text-gray-400 hover:text-white'}`}><Bookmark className="w-3.5 h-3.5" /> List</button>
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs font-bold text-white uppercase outline-none focus:border-[#ff6b44] cursor-pointer flex-shrink-0 appearance-none"
            >
              <option value="latest" className="bg-[#0a0a0a]">Latest</option>
              <option value="rating" className="bg-[#0a0a0a]">Top Rated</option>
              <option value="az" className="bg-[#0a0a0a]">A-Z</option>
            </select>

            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest flex-shrink-0 ml-auto pr-2">{filteredAnime.length} Titles</span>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={filterMode + sortBy + searchQuery}
        >
          {loading ? (
            Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            filteredAnime.map(anime => {
              const history = watchHistory[anime.id];
              return (
                <motion.div key={anime.id} variants={cardVariants}>
                  <Link
                    to={`/anime/${anime.id}`}
                    className="group relative flex flex-col"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border border-white/5 shadow-2xl transition-transform group-hover:scale-[1.03] duration-500">
                      <ImageWithFallback
                        src={anime.cover_image}
                        alt={anime.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
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
                        <div className="w-14 h-14 bg-[#ff6b44] rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/40 transition-transform group-hover:scale-110 duration-300">
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

                      {history && (
                        <div className="absolute bottom-0 left-0 h-1 bg-[#ff6b44] z-30 transition-all" style={{ width: `${Math.min(100, (history.episodeNumber / (anime.total_episodes || 1)) * 100)}%` }} />
                      )}
                    </div>

                    <div className="mt-4">
                      <h3 className="text-white font-bold text-sm md:text-base group-hover:text-[#ff6b44] transition-colors line-clamp-1">
                        {anime.title}
                      </h3>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {anime.total_episodes} Ep
                        </span>
                        {history && (
                          <span className="flex items-center gap-1 text-[#ff6b44] font-bold">
                            <Play className="w-3 h-3" /> Ep {history.episodeNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {!loading && filteredAnime.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 mt-8 flex flex-col items-center gap-4"
          >
            <AlertCircle className="w-12 h-12 text-gray-600" />
            <p className="text-gray-500 font-bold text-lg">No anime found</p>
            <p className="text-gray-600 text-sm">Try adjusting your search or filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setFilterMode('all'); searchRef.current?.focus(); }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
