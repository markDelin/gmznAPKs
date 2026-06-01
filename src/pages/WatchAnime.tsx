import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { Play, ArrowLeft, ChevronRight, SkipBack, SkipForward, Bookmark, BookmarkCheck, List, LayoutGrid, Search, Loader, Subtitles } from 'lucide-react';

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
  video_url_tagalog: string;
  video_url_tagalog_2: string;
  thumbnail_url: string;
  season_number: number;
  subtitle_sub_url: string;
  subtitle_dub_url: string;
  subtitle_tagalog_url: string;
}

export default function WatchAnime() {
  const { animeId } = useParams();
  const [searchParams] = useSearchParams();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [viewMode, setViewMode] = useState<'sub' | 'dub' | 'tagalog'>('sub');
  const [serverIndex, setServerIndex] = useState<1 | 2>(1);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');
  const [fetchingSource, setFetchingSource] = useState(false);
  const [autoFetch, setAutoFetch] = useState(false);
  const [availableSources, setAvailableSources] = useState<{ url: string; type: string }[]>([]);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [subEnabled, setSubEnabled] = useState(false);
  const [subCues, setSubCues] = useState<{ start: number; end: number; text: string }[]>([]);
  const [currentCue, setCurrentCue] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetch(`/api/get-anime?id=${animeId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setAnime(data);
      })
      .catch(console.error);

    fetch(`/api/get-episodes?anime_id=${animeId}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          if (data.length > 0) {
            setEpisodes(data);
            const epParam = searchParams.get('ep');
            let targetEpisode: Episode | null = null;

            if (epParam) {
              targetEpisode = data.find(e => e.episode_number === parseInt(epParam)) || null;
            }

            if (!targetEpisode) {
              const history = JSON.parse(localStorage.getItem('watchHistory') || '{}');
              const lastWatched = history[animeId as string];
              if (lastWatched) {
                targetEpisode = data.find(e => e.id === lastWatched.episodeId) || data[0];
              } else {
                targetEpisode = data[0];
              }
            }

            if (targetEpisode) {
              setCurrentEpisode(targetEpisode);
              setSelectedSeason(targetEpisode.season_number || 1);
            }
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [animeId, searchParams]);

  useEffect(() => {
    if (!currentEpisode) return;

    const hasSub = Boolean(currentEpisode.video_url || currentEpisode.video_url_2);
    const hasDub = Boolean(currentEpisode.video_url_dub || currentEpisode.video_url_dub_2);
    const hasTagalog = Boolean(currentEpisode.video_url_tagalog || currentEpisode.video_url_tagalog_2);

    if (viewMode === 'sub' && !hasSub) {
      if (hasDub) setViewMode('dub');
      else if (hasTagalog) setViewMode('tagalog');
    } else if (viewMode === 'dub' && !hasDub) {
      if (hasSub) setViewMode('sub');
      else if (hasTagalog) setViewMode('tagalog');
    } else if (viewMode === 'tagalog' && !hasTagalog) {
      if (hasSub) setViewMode('sub');
      else if (hasDub) setViewMode('dub');
    }

    const isSub = viewMode === 'sub';
    const isDub = viewMode === 'dub';
    const isTagalog = viewMode === 'tagalog';

    let hasS1 = false;
    let hasS2 = false;

    if (isSub) {
      hasS1 = !!currentEpisode.video_url;
      hasS2 = !!currentEpisode.video_url_2;
    } else if (isDub) {
      hasS1 = !!currentEpisode.video_url_dub;
      hasS2 = !!currentEpisode.video_url_dub_2;
    } else if (isTagalog) {
      hasS1 = !!currentEpisode.video_url_tagalog;
      hasS2 = !!currentEpisode.video_url_tagalog_2;
    }

    if (serverIndex === 1 && !hasS1 && hasS2) {
      setServerIndex(2);
    } else if (serverIndex === 2 && !hasS2 && hasS1) {
      setServerIndex(1);
    }
  }, [currentEpisode, viewMode, serverIndex]);

  useEffect(() => {
    if (currentEpisode) {
      setSelectedSeason(currentEpisode.season_number || 1);
    }
  }, [currentEpisode]);

  useEffect(() => {
    if (animeId) {
      const bookmarks = JSON.parse(localStorage.getItem('animeBookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(Number(animeId)));
    }
  }, [animeId]);

  useEffect(() => {
    if (currentEpisode && animeId) {
      const history = JSON.parse(localStorage.getItem('watchHistory') || '{}');
      history[animeId] = {
        episodeId: currentEpisode.id,
        episodeNumber: currentEpisode.episode_number,
        timestamp: Date.now()
      };
      localStorage.setItem('watchHistory', JSON.stringify(history));
    }
  }, [currentEpisode, animeId]);

  const toggleBookmark = () => {
    if (!animeId) return;
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

  const getCurrentUrl = () => {
    if (!currentEpisode) return '';
    const isSub = viewMode === 'sub';
    const isDub = viewMode === 'dub';
    const isTagalog = viewMode === 'tagalog';

    if (serverIndex === 1) {
      if (isSub) return currentEpisode.video_url;
      if (isDub) return currentEpisode.video_url_dub;
      if (isTagalog) return currentEpisode.video_url_tagalog;
    } else {
      if (isSub) return currentEpisode.video_url_2;
      if (isDub) return currentEpisode.video_url_dub_2;
      if (isTagalog) return currentEpisode.video_url_tagalog_2;
    }
    return '';
  };

  const fetchVideoSource = async (index = 0) => {
    if (!anime || !currentEpisode) return;
    setFetchingSource(true);

    try {
      const res = await fetch(
        `/api/anime-embed?q=${encodeURIComponent(anime.title)}&s=${currentEpisode.season_number || 1}&ep=${currentEpisode.episode_number}`
      );
      const data = await res.json();

      if (data.sources?.length) {
        setAvailableSources(data.sources);
        const src = data.sources[index] || data.sources[0];
        if (src) {
          setCurrentEpisode(prev => prev ? { ...prev, video_url: src.url } : prev);
          setEpisodes(prev =>
            prev.map(ep => ep.id === currentEpisode.id ? { ...ep, video_url: src.url } : ep)
          );
          setSourceIndex(index);
        }
      } else if (data.embed_url) {
        setCurrentEpisode(prev => prev ? { ...prev, video_url: data.embed_url } : prev);
        setEpisodes(prev =>
          prev.map(ep => ep.id === currentEpisode.id ? { ...ep, video_url: data.embed_url } : ep)
        );
      }
    } catch (err) {
      console.error('Failed to fetch video source:', err);
    } finally {
      setFetchingSource(false);
    }
  };

  const cycleSource = () => {
    if (availableSources.length < 2) return;
    const next = (sourceIndex + 1) % availableSources.length;
    const src = availableSources[next];
    if (src && currentEpisode) {
      setCurrentEpisode(prev => prev ? { ...prev, video_url: src.url } : prev);
      setEpisodes(prev =>
        prev.map(ep => ep.id === currentEpisode.id ? { ...ep, video_url: src.url } : ep)
      );
      setSourceIndex(next);
    }
  };

  // Auto-fetch when episode has no source
  useEffect(() => {
    if (currentEpisode && !getCurrentUrl() && !fetchingSource) {
      fetchVideoSource(0);
    }
  }, [currentEpisode?.id]);

  // Reset sources on episode change
  useEffect(() => {
    setAvailableSources([]);
    setSourceIndex(0);
  }, [currentEpisode?.id]);

  // --- Subtitles ---
  const isDirectVideo = (url: string) => /\.(mp4|m3u8|webm|ogg|mkv)(\?|$)/i.test(url);

  const [autoSubUrl, setAutoSubUrl] = useState('');
  const [autoSubLoading, setAutoSubLoading] = useState(false);
  const autoSubAttempted = useRef(false);
  const autoSubAbort = useRef<AbortController>();

  const getSubUrl = () => {
    if (!currentEpisode) return '';
    const dbUrl = viewMode === 'sub' ? currentEpisode.subtitle_sub_url
      : viewMode === 'dub' ? currentEpisode.subtitle_dub_url
      : currentEpisode.subtitle_tagalog_url;
    return dbUrl || autoSubUrl;
  };

  const hasSubs = !!getSubUrl();

  const fetchAutoSubtitles = useCallback(async () => {
    if (!anime || !currentEpisode || autoSubUrl || autoSubAttempted.current) return;
    const dbUrl = viewMode === 'sub' ? currentEpisode.subtitle_sub_url
      : viewMode === 'dub' ? currentEpisode.subtitle_dub_url
      : currentEpisode.subtitle_tagalog_url;
    if (dbUrl) return;

    autoSubAttempted.current = true;
    setAutoSubLoading(true);
    autoSubAbort.current?.abort();
    const controller = new AbortController();
    autoSubAbort.current = controller;

    try {
      const res = await fetch(
        `/api/search-subtitles?q=${encodeURIComponent(anime.title)}&s=${currentEpisode.season_number || 1}&ep=${currentEpisode.episode_number}&lang=en`,
        { signal: controller.signal }
      );
      if (!res.ok) return;
      const data = await res.json();
      const first = data.subtitles?.[0];
      if (first?.data_url) {
        setAutoSubUrl(first.data_url);
        setSubEnabled(true);
      }
    } catch {
      // Silently fail
    } finally {
      setAutoSubLoading(false);
    }
  }, [anime?.title, currentEpisode?.id, viewMode]);

  useEffect(() => {
    fetchAutoSubtitles();
  }, [fetchAutoSubtitles]);

  useEffect(() => {
    autoSubAttempted.current = false;
    autoSubAbort.current?.abort();
    setAutoSubUrl('');
    setAutoSubLoading(false);
    setSubEnabled(false);
    setCurrentCue('');
    setSubCues([]);
  }, [currentEpisode?.id]);

  const parseVTT = (text: string) => {
    const cues: { start: number; end: number; text: string }[] = [];
    const blocks = text.split(/\n\n+/);
    for (const block of blocks) {
      const lines = block.trim().split('\n');
      if (lines.length < 2) continue;
      const timeLine = lines.find(l => l.includes('-->'));
      if (!timeLine) continue;
      const [startStr, , endStr] = timeLine.split(/\s+/);
      const toSeconds = (s: string) => {
        const parts = s.replace(',', '.').split(':');
        if (parts.length === 3) return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        if (parts.length === 2) return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
        return parseFloat(parts[0]);
      };
      const start = toSeconds(startStr);
      const end = toSeconds(endStr);
      const text = lines.filter(l => !l.startsWith('WEBVTT') && !l.includes('-->') && !/^\d+$/.test(l.trim())).join('\n').trim();
      if (text) cues.push({ start, end, text });
    }
    return cues;
  };

  const loadSubtitles = useCallback(async () => {
    const url = getSubUrl();
    if (!url) { setSubCues([]); setCurrentCue(''); return; }
    try {
      const res = await fetch(url);
      const text = await res.text();
      setSubCues(parseVTT(text));
    } catch {
      setSubCues([]);
    }
  }, [currentEpisode?.id, viewMode, autoSubUrl]);

  useEffect(() => {
    if (subEnabled) loadSubtitles();
    else { setCurrentCue(''); setSubCues([]); }
  }, [subEnabled, loadSubtitles]);

  const cueIndexRef = useRef(0);

  const syncSubsForVideo = () => {
    const video = videoRef.current;
    if (!video || subCues.length === 0) { setCurrentCue(''); return; }
    const time = video.currentTime;
    for (let i = 0; i < subCues.length; i++) {
      if (time >= subCues[i].start && time <= subCues[i].end) {
        if (cueIndexRef.current !== i) cueIndexRef.current = i;
        setCurrentCue(subCues[i].text);
        return;
      }
    }
    setCurrentCue('');
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !subEnabled || subCues.length === 0) return;
    const handler = () => syncSubsForVideo();
    video.addEventListener('timeupdate', handler);
    return () => video.removeEventListener('timeupdate', handler);
  }, [subEnabled, subCues]);

  const toggleSubtitles = () => {
    if (!hasSubs) return;
    const next = !subEnabled;
    setSubEnabled(next);
    if (next) loadSubtitles();
  };

  if (loading || !anime) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#ff6b44] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 z-0">
        <img src={anime.banner_image} className="w-full h-full object-cover opacity-10 blur-3xl scale-110" alt="" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">

        <div className="flex items-center justify-between mb-8 transition-all">
          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            <Link to="/anime" className="p-2.5 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl md:rounded-2xl transition-all border border-white/5 hover:border-white/20">
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-xl md:text-3xl font-black tracking-tight truncate">{anime.title}</h1>
              <p className="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-0.5">
                {anime.status} <ChevronRight className="w-3 h-3" /> Ep {currentEpisode?.episode_number || '...'}
              </p>
            </div>
          </div>

          <button
            onClick={toggleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
              isBookmarked
                ? 'bg-[#ff6b44]/10 text-[#ff6b44] border-[#ff6b44]/20 hover:bg-[#ff6b44]/20'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span className="hidden sm:inline">{isBookmarked ? 'Bookmarked' : 'Add to List'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">

            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group transition-all duration-500">
                {currentEpisode ? (() => {
                  const currentUrl = getCurrentUrl();

                  if (currentUrl && isDirectVideo(currentUrl)) {
                    const subUrl = getSubUrl();
                    return (
                      <div className="relative w-full h-full">
                        <video
                          ref={videoRef}
                          src={currentUrl}
                          className="w-full h-full"
                          controls
                          crossOrigin="anonymous"
                        >
                          {subUrl && <track kind="subtitles" src={subUrl} srcLang="en" label="English" default />}
                        </video>
                        {subEnabled && !subUrl && currentCue && (
                          <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none z-20 px-4">
                            <span className="bg-black/80 text-white text-sm md:text-base px-4 py-2 rounded-xl text-center max-w-xl backdrop-blur-md shadow-xl border border-white/10">
                              {currentCue}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  } else if (currentUrl) {
                    return (
                      <div className="relative w-full h-full">
                        <iframe
                          src={currentUrl}
                          className="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                          title={`Episode ${currentEpisode.episode_number}`}
                        />
                        {availableSources.length > 1 && (
                          <div className="absolute top-3 right-3 z-20">
                            <button
                              onClick={(e) => { e.stopPropagation(); cycleSource(); }}
                              className="px-3 py-1.5 bg-black/70 text-white text-[9px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md border border-white/10 hover:bg-black/90 transition-all flex items-center gap-1.5"
                            >
                              Source {sourceIndex + 1}/{availableSources.length}
                            </button>
                          </div>
                        )}
                        {subEnabled && currentCue && (
                          <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-20 px-4">
                            <span className="bg-black/80 text-white text-sm md:text-base px-4 py-2 rounded-xl text-center max-w-xl backdrop-blur-md shadow-xl border border-white/10">
                              {currentCue}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  } else if (fetchingSource) {
                    return (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#0a0a0a]">
                        <Loader className="w-12 h-12 text-[#ff6b44] animate-spin mb-4" />
                        <p className="text-[#ff6b44] font-black uppercase tracking-widest text-lg">Finding Source...</p>
                        <p className="text-gray-500 text-sm mt-2 font-medium">Searching for video sources via EzvidAPI</p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#0a0a0a]">
                        <Play className="w-16 h-16 text-red-500/30 mb-4" />
                        <p className="text-red-400 font-black uppercase tracking-widest text-lg">No Video Source</p>
                        <p className="text-gray-500 text-sm mt-2 font-medium">No video URL is stored for this episode.</p>
                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={() => fetchVideoSource()}
                            disabled={fetchingSource}
                            className="px-6 py-3 bg-[#ff6b44] text-white font-bold rounded-xl hover:bg-[#ff5528] transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                          >
                            {fetchingSource ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            Find Source
                          </button>
                          {availableSources.length > 1 && (
                            <button
                              onClick={cycleSource}
                              className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
                            >
                              Switch Source ({sourceIndex + 1}/{availableSources.length})
                            </button>
                          )}
                          <button
                            onClick={() => setAutoFetch(true)}
                            className="px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
                          >
                            Auto-Fetch All
                          </button>
                        </div>
                      </div>
                    );
                  }
                })() : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#0a0a0a]">
                    <Play className="w-16 h-16 text-gray-800 mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest">No episode selected or available</p>
                  </div>
                )}
              </div>

              {currentEpisode && (() => {
                const currentEpIndex = episodes.findIndex(e => e.id === currentEpisode.id);
                const prevEp = currentEpIndex > 0 ? episodes[currentEpIndex - 1] : null;
                const nextEp = currentEpIndex >= 0 && currentEpIndex < episodes.length - 1 ? episodes[currentEpIndex + 1] : null;

                const hasSub = Boolean(currentEpisode.video_url || currentEpisode.video_url_2);
                const hasDub = Boolean(currentEpisode.video_url_dub || currentEpisode.video_url_dub_2);
                const hasTagalog = Boolean(currentEpisode.video_url_tagalog || currentEpisode.video_url_tagalog_2);

                const isSub = viewMode === 'sub';
                const isDub = viewMode === 'dub';

                const hasS1 = isSub ? !!currentEpisode.video_url : (isDub ? !!currentEpisode.video_url_dub : !!currentEpisode.video_url_tagalog);
                const hasS2 = isSub ? !!currentEpisode.video_url_2 : (isDub ? !!currentEpisode.video_url_dub_2 : !!currentEpisode.video_url_tagalog_2);

                return (
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4 md:p-6 bg-white/5 rounded-3xl border border-white/5 shadow-inner">
                    <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block px-1">Audio</span>
                        <div className="bg-black/20 p-1 rounded-xl border border-white/5 flex items-center gap-1">
                          <button
                            onClick={() => setViewMode('tagalog')}
                            disabled={!hasTagalog}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                              viewMode === 'tagalog'
                                ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/20'
                                : hasTagalog
                                  ? 'text-gray-500 hover:text-white'
                                  : 'text-gray-800 cursor-not-allowed opacity-30'
                            }`}
                          >
                            Tagalog
                          </button>
                          <button
                            onClick={() => setViewMode('sub')}
                            disabled={!hasSub}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                              viewMode === 'sub'
                                ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/20'
                                : hasSub
                                  ? 'text-gray-500 hover:text-white'
                                  : 'text-gray-800 cursor-not-allowed opacity-30'
                            }`}
                          >
                            Sub
                          </button>
                          <button
                            onClick={() => setViewMode('dub')}
                            disabled={!hasDub}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                              viewMode === 'dub'
                                ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/20'
                                : hasDub
                                  ? 'text-gray-500 hover:text-white'
                                  : 'text-gray-800 cursor-not-allowed opacity-30'
                            }`}
                          >
                            Dub
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block px-1">Servers</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setServerIndex(1)}
                            disabled={!hasS1}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                              serverIndex === 1
                                ? 'bg-white/10 text-white border-white/20'
                                : hasS1
                                  ? 'text-gray-500 border-white/5 hover:border-white/20 hover:text-white'
                                  : 'text-gray-800 border-transparent cursor-not-allowed opacity-30'
                            }`}
                          >
                            Server 1
                          </button>
                          <button
                            onClick={() => setServerIndex(2)}
                            disabled={!hasS2}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                              serverIndex === 2
                                ? 'bg-white/10 text-white border-white/20'
                                : hasS2
                                  ? 'text-gray-500 border-white/5 hover:border-white/20 hover:text-white'
                                  : 'text-gray-800 border-transparent cursor-not-allowed opacity-30'
                            }`}
                          >
                            Server 2
                          </button>
                        </div>
                      </div>

                      {availableSources.length > 1 && (
                        <div className="space-y-2">
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block px-1">Source</span>
                          <button
                            onClick={cycleSource}
                            className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 bg-white/10 text-white border border-white/20 hover:bg-white/20"
                          >
                            {sourceIndex + 1}/{availableSources.length}
                          </button>
                        </div>
                      )}

                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block px-1">Subs</span>
                        <button
                          onClick={toggleSubtitles}
                          disabled={!hasSubs && !autoSubLoading}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                            subEnabled
                              ? 'bg-white/10 text-white border border-white/20 shadow'
                              : hasSubs
                                ? 'text-gray-500 hover:text-white border border-transparent hover:border-white/20'
                                : autoSubLoading
                                  ? 'text-gray-500 border border-white/5'
                                  : 'text-gray-800 border-transparent cursor-not-allowed opacity-30'
                          }`}
                        >
                          {autoSubLoading ? (
                            <div className="w-3.5 h-3.5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Subtitles className={`w-3.5 h-3.5 ${subEnabled ? 'text-[#ff6b44]' : ''}`} />
                          )}
                          {autoSubLoading ? '...' : 'CC'}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-4 md:pt-0 border-t border-white/5 md:border-none">
                      <button
                        onClick={() => prevEp && setCurrentEpisode(prevEp)}
                        disabled={!prevEp}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          prevEp
                            ? 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
                            : 'text-gray-800 cursor-not-allowed opacity-30'
                        }`}
                      >
                        <SkipBack className="w-3.5 h-3.5" />
                        <span>Prev</span>
                      </button>
                      <button
                        onClick={() => nextEp && setCurrentEpisode(nextEp)}
                        disabled={!nextEp}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          nextEp
                            ? 'bg-[#ff6b44] hover:bg-[#ff5528] text-white shadow-lg shadow-orange-500/20'
                            : 'bg-white/5 text-gray-800 cursor-not-allowed opacity-30'
                        }`}
                      >
                        <span>Next</span>
                        <SkipForward className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <Play className="w-5 h-5 text-[#ff6b44] fill-[#ff6b44]" />
                  EPISODES
                </h2>
                <span className="text-xs text-gray-500 font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">{episodes.length}</span>
              </div>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
                <button
                  onClick={() => setViewStyle('grid')}
                  className={`p-1.5 rounded-md transition-colors ${viewStyle === 'grid' ? 'bg-white/10 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewStyle('list')}
                  className={`p-1.5 rounded-md transition-colors ${viewStyle === 'list' ? 'bg-white/10 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {(() => {
              const seasons = Array.from(new Set(episodes.map(ep => ep.season_number || 1))).sort((a, b) => a - b);
              if (seasons.length <= 1) return null;
              return (
                <div className="flex flex-wrap gap-2 pb-2">
                  {seasons.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeason(s)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        selectedSeason === s
                          ? 'bg-white/10 text-white border border-white/20'
                          : 'text-gray-500 hover:text-white border border-transparent'
                      }`}
                    >
                      Season {s}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Auto-Fetch indicator */}
            {autoFetch && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl">
                <Loader className="w-3 h-3 text-green-400 animate-spin" />
                <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Auto-fetching sources</span>
              </div>
            )}

            <div className={`gap-2 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar ${viewStyle === 'grid' ? 'grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6' : 'flex flex-col'}`}>
              {episodes.filter(ep => (ep.season_number || 1) === selectedSeason).map(ep => {
                const hasSource = Boolean(ep.video_url || ep.video_url_2 || ep.video_url_dub || ep.video_url_dub_2 || ep.video_url_tagalog || ep.video_url_tagalog_2);
                return (
                  <button
                    key={ep.id}
                    onClick={() => setCurrentEpisode(ep)}
                    className={`transition-all text-left ${
                      viewStyle === 'grid'
                        ? `aspect-square flex items-center justify-center rounded-xl border p-1 relative ${
                            currentEpisode?.id === ep.id
                              ? 'bg-[#ff6b44] border-[#ff6b44] shadow-lg shadow-orange-500/20 text-white'
                              : hasSource
                                ? 'bg-white/5 border-white/5 hover:border-white/20 text-gray-400 hover:text-white'
                                : 'bg-white/5 border-white/5 text-gray-600 hover:text-gray-400 opacity-60'
                          }`
                        : `w-full flex items-center gap-4 p-3 rounded-xl border ${
                            currentEpisode?.id === ep.id
                              ? 'bg-[#ff6b44]/10 border-[#ff6b44]/30 text-white'
                              : hasSource
                                ? 'bg-white/5 border-white/5 hover:border-white/20 text-gray-400 hover:text-white'
                                : 'bg-white/5 border-white/5 text-gray-600 opacity-60'
                          }`
                    }`}
                    title={ep.title || `Episode ${ep.episode_number}`}
                  >
                    {viewStyle === 'grid' ? (
                      <>
                        <span className="font-black text-xs">{ep.episode_number}</span>
                        {!hasSource && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />}
                      </>
                    ) : (
                      <>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-xs ${currentEpisode?.id === ep.id ? 'bg-[#ff6b44] text-white' : 'bg-black/40 text-gray-500'}`}>
                          {ep.episode_number}
                        </div>
                        <div className="flex flex-col flex-1 truncate">
                          <span className={`text-sm font-bold truncate ${currentEpisode?.id === ep.id ? 'text-white' : 'text-gray-300'}`}>
                            {ep.title || `Episode ${ep.episode_number}`}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest font-bold mt-0.5 flex items-center gap-1">
                            {hasSource ? (
                              <span className="text-green-500">Source Ready</span>
                            ) : (
                              <span className="text-red-500">No Source</span>
                            )}
                          </span>
                        </div>
                        {currentEpisode?.id === ep.id && <Play className="w-4 h-4 text-[#ff6b44] fill-[#ff6b44]" />}
                      </>
                    )}
                  </button>
                );
              })}
              {episodes.length === 0 && (
                <div className={`${viewStyle === 'grid' ? 'col-span-6' : 'w-full'} p-8 text-center bg-white/5 rounded-3xl border border-dashed border-white/10`}>
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
