import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, ArrowLeft, ChevronRight } from 'lucide-react';

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
  video_url_2: string;
  video_url_dub: string;
  video_url_dub_2: string;
  thumbnail_url: string;
}

export default function WatchAnime() {
  const { animeId } = useParams();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [viewMode, setViewMode] = useState<'sub' | 'dub'>('sub');
  const [serverIndex, setServerIndex] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch Anime Details
    fetch(`/api/get-anime?id=${animeId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setAnime(data);
      })
      .catch(console.error);

    // Fetch Episodes
    fetch(`/api/get-episodes?anime_id=${animeId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEpisodes(data);
          if (data.length > 0) setCurrentEpisode(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [animeId]);

  // Auto-switch server and audio mode if the current selection is unavailable
  useEffect(() => {
    if (!currentEpisode) return;
    
    // 1. Auto-switch viewMode (sub/dub) if current has no servers but the other does
    const hasSub = Boolean(currentEpisode.video_url || currentEpisode.video_url_2);
    const hasDub = Boolean(currentEpisode.video_url_dub || currentEpisode.video_url_dub_2);
    
    if (viewMode === 'sub' && !hasSub && hasDub) {
      setViewMode('dub');
    } else if (viewMode === 'dub' && !hasDub && hasSub) {
      setViewMode('sub');
    }

    // 2. Auto-switch server if the current server is missing but the other exists
    const isSub = viewMode === 'sub';
    const hasS1 = isSub ? !!currentEpisode.video_url : !!currentEpisode.video_url_dub;
    const hasS2 = isSub ? !!currentEpisode.video_url_2 : !!currentEpisode.video_url_dub_2;

    if (serverIndex === 1 && !hasS1 && hasS2) {
      setServerIndex(2);
    } else if (serverIndex === 2 && !hasS2 && hasS1) {
      setServerIndex(1);
    }
  }, [currentEpisode, viewMode, serverIndex]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-[#ff6b44] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!anime) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
       <h1 className="text-3xl font-black text-white mb-4">ANIME NOT FOUND</h1>
       <Link to="/anime" className="flex items-center gap-2 text-[#ff6b44] font-bold hover:underline">
         <ArrowLeft className="w-5 h-5" /> Back to Anime List
       </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Background Banner */}
      <div className="fixed inset-0 z-0">
        <img src={anime.banner_image} className="w-full h-full object-cover opacity-10 blur-3xl scale-110" alt="" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center gap-4 mb-8">
           <Link to="/anime" className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/5">
             <ArrowLeft className="w-5 h-5" />
           </Link>
           <div>
             <h1 className="text-2xl md:text-3xl font-black tracking-tight">{anime.title}</h1>
             <p className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
               {anime.status} <ChevronRight className="w-3 h-3" /> Episode {currentEpisode?.episode_number || '...'}
             </p>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Player & Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Player Container */}
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group">
                 {currentEpisode ? (
                   (() => {
                     const isSub = viewMode === 'sub';
                     const currentUrl = serverIndex === 1 
                       ? (isSub ? currentEpisode.video_url : currentEpisode.video_url_dub)
                       : (isSub ? currentEpisode.video_url_2 : currentEpisode.video_url_dub_2);

                     if (currentUrl) {
                       return (
                         <iframe 
                           src={currentUrl} 
                           className="w-full h-full" 
                           frameBorder="0" 
                           allowFullScreen
                           title={`Episode ${currentEpisode.episode_number}`}
                         />
                       );
                     } else {
                       return (
                         <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#0a0a0a]">
                            <Play className="w-16 h-16 text-red-500/30 mb-4" />
                            <p className="text-red-400 font-black uppercase tracking-widest text-lg">Server Locked</p>
                            <p className="text-gray-500 text-sm mt-2 font-medium">No video source is available for this selection.</p>
                         </div>
                       );
                     }
                   })()
                 ) : (
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#0a0a0a]">
                      <Play className="w-16 h-16 text-gray-800 mb-4" />
                      <p className="text-gray-500 font-bold uppercase tracking-widest">No episode selected or available</p>
                   </div>
                 )}
              </div>

              {/* Sub/Dub & Server Toggle */}
              {currentEpisode && (() => {
                const currentEpIndex = episodes.findIndex(e => e.id === currentEpisode.id);
                const prevEp = currentEpIndex > 0 ? episodes[currentEpIndex - 1] : null;
                const nextEp = currentEpIndex >= 0 && currentEpIndex < episodes.length - 1 ? episodes[currentEpIndex + 1] : null;

                const isSub = viewMode === 'sub';
                const hasSub = Boolean(currentEpisode.video_url || currentEpisode.video_url_2);
                const hasDub = Boolean(currentEpisode.video_url_dub || currentEpisode.video_url_dub_2);
                const hasS1 = isSub ? !!currentEpisode.video_url : !!currentEpisode.video_url_dub;
                const hasS2 = isSub ? !!currentEpisode.video_url_2 : !!currentEpisode.video_url_dub_2;

                return (
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Sub/Dub Selector */}
                      <div className="bg-white/5 p-1 rounded-2xl border border-white/5 flex items-center gap-1">
                        <button 
                          onClick={() => setViewMode('sub')}
                          disabled={!hasSub}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            viewMode === 'sub' 
                              ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/20' 
                              : hasSub
                                ? 'text-gray-500 hover:text-white'
                                : 'text-gray-800 cursor-not-allowed opacity-30'
                          }`}
                        >
                          <Play className={`w-3 h-3 ${viewMode === 'sub' ? 'fill-white' : ''}`} /> SUB
                        </button>
                        <button 
                          onClick={() => setViewMode('dub')}
                          disabled={!hasDub}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            viewMode === 'dub' 
                              ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/20' 
                              : hasDub 
                                ? 'text-gray-500 hover:text-white' 
                                : 'text-gray-800 cursor-not-allowed opacity-30'
                          }`}
                        >
                          <Play className={`w-3 h-3 ${viewMode === 'dub' ? 'fill-white' : ''}`} /> DUB
                        </button>
                      </div>

                      {/* Server Selection */}
                      <div className="bg-white/5 p-1 rounded-2xl border border-white/5 flex items-center gap-1">
                        <button 
                          onClick={() => setServerIndex(1)}
                          disabled={!hasS1}
                          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            serverIndex === 1 
                              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                              : hasS1
                                ? 'text-gray-500 hover:text-white'
                                : 'text-gray-800 cursor-not-allowed opacity-30'
                          }`}
                        >
                          Server 1
                        </button>
                        <button 
                          onClick={() => setServerIndex(2)}
                          disabled={!hasS2}
                          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            serverIndex === 2 
                              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                              : hasS2
                                ? 'text-gray-500 hover:text-white' 
                                : 'text-gray-800 cursor-not-allowed opacity-30'
                          }`}
                        >
                          Server 2
                        </button>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => prevEp && setCurrentEpisode(prevEp)}
                         disabled={!prevEp}
                         className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${prevEp ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10' : 'bg-transparent text-gray-700 cursor-not-allowed'}`}
                       >
                         <ChevronRight className="w-4 h-4 rotate-180" /> Prev Ep
                       </button>
                       <button 
                         onClick={() => nextEp && setCurrentEpisode(nextEp)}
                         disabled={!nextEp}
                         className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${nextEp ? 'bg-[#ff6b44] hover:bg-[#ff5528] text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 border border-white/5 text-gray-700 cursor-not-allowed'}`}
                       >
                         Next Ep <ChevronRight className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Sidebar: Episode Selection */}
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#ff6b44] fill-[#ff6b44]" />
                  EPISODES
                </h2>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">{episodes.length} Total</span>
             </div>

             <div className="space-y-3 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {episodes.map(ep => (
                  <button 
                    key={ep.id}
                    onClick={() => setCurrentEpisode(ep)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all text-left ${currentEpisode?.id === ep.id ? 'bg-[#ff6b44] border-[#ff6b44] shadow-lg shadow-orange-500/20' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                  >
                    <div className="relative w-24 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-black/40 border border-white/10">
                       <img src={ep.thumbnail_url || anime.cover_image} className="w-full h-full object-cover opacity-80" alt="" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <Play className={`w-4 h-4 ${currentEpisode?.id === ep.id ? 'text-white fill-white' : 'text-[#ff6b44] fill-[#ff6b44]'}`} />
                       </div>
                    </div>
                    <div>
                       <h3 className={`font-bold text-sm line-clamp-1 ${currentEpisode?.id === ep.id ? 'text-white' : 'text-gray-200'}`}>
                         Ep. {ep.episode_number}
                       </h3>
                       <p className={`text-[10px] font-medium line-clamp-1 ${currentEpisode?.id === ep.id ? 'text-white/70' : 'text-gray-500'}`}>
                         {ep.title || `Episode ${ep.episode_number}`}
                       </p>
                    </div>
                  </button>
                ))}
                {episodes.length === 0 && (
                  <div className="p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                    <p className="text-gray-500 text-xs font-bold italic uppercase tracking-widest">Episodes coming soon</p>
                  </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
