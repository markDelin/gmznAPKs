import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Bookmark, BookmarkCheck, ChevronLeft, List, LayoutGrid, Film, AlertCircle, Tv, ChevronRight } from 'lucide-react';
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

interface Episode {
  id: number;
  episode_number: number;
  title: string;
  video_url: string;
  season_number: number;
  thumbnail_url: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } }
};

const statusColors: Record<string, string> = {
  ongoing: 'bg-green-500/20 text-green-400 border-green-500/30',
  completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  upcoming: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export default function AnimeInfo() {
  const { animeId } = useParams();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [watchHistory, setWatchHistory] = useState<Record<string, { episodeNumber: number }>>({});

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/get-anime?id=${animeId}`).then(res => res.json()),
      fetch(`/api/get-episodes?anime_id=${animeId}`).then(res => res.json())
    ])
      .then(([animeData, episodesData]) => {
        if (!animeData.error) setAnime(animeData);
        if (Array.isArray(episodesData)) {
          setEpisodes(episodesData);
          if (episodesData.length > 0) {
            setSelectedSeason(episodesData[0].season_number || 1);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [animeId]);

  useEffect(() => {
    const bks = JSON.parse(localStorage.getItem('animeBookmarks') || '[]');
    setIsBookmarked(bks.includes(Number(animeId)));
    const history = JSON.parse(localStorage.getItem('watchHistory') || '{}');
    setWatchHistory(history);
  }, [animeId]);

  const toggleBookmark = () => {
    const id = Number(animeId);
    let bookmarks = JSON.parse(localStorage.getItem('animeBookmarks') || '[]');
    if (bookmarks.includes(id)) {
      bookmarks = bookmarks.filter((b: number) => b !== id);
      setIsBookmarked(false);
    } else {
      bookmarks.push(id);
      setIsBookmarked(true);
    }
    localStorage.setItem('animeBookmarks', JSON.stringify(bookmarks));
  };

  const seasons = Array.from(new Set(episodes.map(ep => ep.season_number || 1))).sort((a, b) => a - b);

  const filteredEpisodes = episodes.filter(ep => (ep.season_number || 1) === selectedSeason);

  const latestEpisode = episodes.reduce((max, ep) => ep.episode_number > max.episode_number ? ep : max, episodes[0]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#ff6b44] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center bg-white/5 rounded-3xl border border-white/10 p-12 max-w-md">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-bold text-xl mb-2">Anime Not Found</p>
          <p className="text-gray-600 text-sm mb-6">This title doesn't exist or was removed.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff6b44] text-white font-bold rounded-xl hover:bg-[#ff5528] transition-all">
            <ChevronLeft className="w-4 h-4" /> Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const history = watchHistory[anime.id];
  const progress = history ? Math.min(100, (history.episodeNumber / (anime.total_episodes || 1)) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 z-0">
        <img
          src={anime.banner_image || anime.cover_image}
          className="w-full h-full object-cover opacity-15 blur-3xl scale-110"
          alt=""
        />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 md:pt-32 pb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest transition-all group mb-6"
          >
            <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
            Back to Browse
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="md:col-span-1"
            >
              <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50 group">
                <img
                  src={anime.cover_image}
                  alt={anime.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${statusColors[anime.status] || 'bg-white/10 text-gray-400'}`}>
                    {anime.status}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
              className="md:col-span-2 flex flex-col justify-center"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    {anime.title}
                  </h1>
                </div>
                <button
                  onClick={toggleBookmark}
                  className={`shrink-0 p-3 rounded-2xl transition-all border ${
                    isBookmarked
                      ? 'bg-[#ff6b44]/10 text-[#ff6b44] border-[#ff6b44]/20'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-xl text-sm font-bold">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  {anime.rating}
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl text-sm font-bold">
                  <Tv className="w-4 h-4" />
                  {anime.total_episodes} Episodes
                </div>
                <div className="flex items-center gap-1.5 text-gray-400 bg-white/5 px-3 py-1.5 rounded-xl text-sm font-bold">
                  <Calendar className="w-4 h-4" />
                  {anime.status.charAt(0).toUpperCase() + anime.status.slice(1)}
                </div>
                {history && (
                  <div className="flex items-center gap-1.5 text-[#ff6b44] bg-[#ff6b44]/10 px-3 py-1.5 rounded-xl text-sm font-bold">
                    <Play className="w-4 h-4 fill-[#ff6b44]" />
                    Ep {history.episodeNumber}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mt-5">
                {anime.genre.map(g => (
                  <span key={g} className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl bg-white/5 text-gray-300 border border-white/10">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-gray-400 text-sm md:text-base leading-relaxed mt-6 line-clamp-4 md:line-clamp-none">
                {anime.description || 'No description available.'}
              </p>

              {progress > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> Progress
                    </span>
                    <span className="text-xs text-[#ff6b44] font-bold">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#ff6b44] to-orange-400 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  to={`/watch/${anime.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#ff6b44] to-[#ff5528] text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.02] transition-all duration-300 group"
                >
                  <Play className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
                  Watch Now
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                {latestEpisode && (
                  <Link
                    to={`/watch/${anime.id}?ep=${latestEpisode.episode_number}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 text-gray-300 font-bold text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition-all"
                  >
                    <Film className="w-4 h-4" />
                    Latest: Ep {latestEpisode.episode_number}
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {episodes.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-4 md:p-8 shadow-2xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#ff6b44]/20 rounded-xl flex items-center justify-center">
                    <List className="w-5 h-5 text-[#ff6b44]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Episodes</h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{episodes.length} Total</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {seasons.length > 1 && (
                    <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
                      {seasons.map(s => (
                        <button
                          key={s}
                          onClick={() => setSelectedSeason(s)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                            selectedSeason === s
                              ? 'bg-[#ff6b44] text-white shadow-md shadow-orange-500/20'
                              : 'text-gray-500 hover:text-white'
                          }`}
                        >
                          S{s}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => setViewStyle('grid')}
                      className={`p-2 rounded-lg transition-all ${viewStyle === 'grid' ? 'bg-white/10 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewStyle('list')}
                      className={`p-2 rounded-lg transition-all ${viewStyle === 'list' ? 'bg-white/10 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {viewStyle === 'grid' ? (
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-1.5">
                  {filteredEpisodes.map(ep => {
                    const isWatched = history && history.episodeNumber >= ep.episode_number;
                    return (
                      <motion.div key={ep.id} variants={itemVariants}>
                        <Link
                          to={`/watch/${anime.id}?ep=${ep.episode_number}`}
                          className={`flex items-center justify-center w-full rounded-lg border transition-all duration-200 group ${
                            isWatched
                              ? 'bg-[#ff6b44]/10 border-[#ff6b44]/20 hover:border-[#ff6b44]/40'
                              : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                          }`}
                          style={{ aspectRatio: '3/4', minHeight: 0 }}
                        >
                          <span className={`font-bold text-xs leading-none ${isWatched ? 'text-[#ff6b44]' : 'text-gray-400 group-hover:text-white transition-colors'}`}>
                            {ep.episode_number}
                          </span>
                          {ep.thumbnail_url && (
                            <img src={ep.thumbnail_url} alt="" className="w-full h-full object-cover rounded-lg opacity-0 group-hover:opacity-20 transition-opacity absolute inset-0" />
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredEpisodes.map(ep => {
                    const isWatched = history && history.episodeNumber >= ep.episode_number;
                    return (
                      <motion.div key={ep.id} variants={itemVariants}>
                        <Link
                          to={`/watch/${anime.id}?ep=${ep.episode_number}`}
                          className={`flex items-center gap-4 p-3 md:p-4 rounded-2xl border transition-all group ${
                            isWatched
                              ? 'bg-[#ff6b44]/5 border-[#ff6b44]/10 hover:border-[#ff6b44]/20'
                              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                            isWatched ? 'bg-[#ff6b44] text-white' : 'bg-black/40 text-gray-500 group-hover:text-white transition-colors'
                          }`}>
                            {ep.episode_number}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm md:text-base font-bold truncate ${isWatched ? 'text-white' : 'text-gray-300 group-hover:text-white transition-colors'}`}>
                              {ep.title || `Episode ${ep.episode_number}`}
                            </p>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                              {isWatched ? (
                                <span className="text-[#ff6b44]">Watched</span>
                              ) : (
                                <span>Season {ep.season_number || 1}</span>
                              )}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-[#ff6b44]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:scale-110">
                            <Play className="w-4 h-4 text-[#ff6b44] fill-[#ff6b43]" />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {filteredEpisodes.length === 0 && (
                <div className="text-center py-12">
                  <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 font-bold text-sm uppercase tracking-wider">No episodes available yet</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
