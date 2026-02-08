
import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipForward, Settings, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
  introStart?: number;
  introEnd?: number;
  outroStart?: number;
  outroEnd?: number;
  episodeId?: string | number;
}

export function VideoPlayer({ src, poster, onEnded, autoPlay = false, introStart = 0, introEnd = 0, outroStart = 0, outroEnd = 0, episodeId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  // Autoplay must be muted to work reliably in modern browsers
  const [isMuted, setIsMuted] = useState(autoPlay); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showSkipOutro, setShowSkipOutro] = useState(false);

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [newIntroStart, setNewIntroStart] = useState(introStart);
  const [newIntroEnd, setNewIntroEnd] = useState(introEnd);
  const [newOutroStart, setNewOutroStart] = useState(outroStart);
  const [newOutroEnd, setNewOutroEnd] = useState(outroEnd);
  const [isSaving, setIsSaving] = useState(false);

  // Determine if src is likely an embed (iframe) vs direct video
  // Logic: If it contains known embed domains OR DOES NOT end in a standard video extension, treat as embed.
  const isEmbed = src.includes('youtube.com') || 
                  src.includes('vimeo.com') || 
                  src.includes('dailymotion.com') || 
                  src.includes('embed') || 
                  !/\.(mp4|webm|ogg|m3u8|mov|mkv)$/i.test(src.split('?')[0]);

  // Monitor time for Skip buttons (Only for direct video)
  useEffect(() => {
    if (!isEmbed && currentTime > 0 && !isEditMode) {
        // Intro Logic
        if (introEnd > 0 && currentTime >= introStart && currentTime < introEnd) {
            setShowSkipIntro(true);
        } else {
            setShowSkipIntro(false);
        }

        // Outro Logic
        if (outroStart > 0 && currentTime >= outroStart && (outroEnd === 0 || currentTime < outroEnd)) {
            setShowSkipOutro(true);
        } else {
            setShowSkipOutro(false);
        }
    } else {
        setShowSkipIntro(false);
        setShowSkipOutro(false);
    }
  }, [currentTime, introStart, introEnd, outroStart, outroEnd, isEmbed, isEditMode]);

  // Force Autoplay on Mount (Reliability Fix)
  useEffect(() => {
      if (autoPlay && videoRef.current) {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
              playPromise.catch(error => {
                  console.log("Autoplay prevented:", error);
              });
          }
      }
  }, [src]); // Re-run when source changes to ensure new video plays

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skipIntro = () => {
      if (videoRef.current && introEnd > 0) {
          videoRef.current.currentTime = introEnd; 
      }
  };

  const skipOutro = () => {
      if (videoRef.current) {
          if (outroEnd > 0) {
              videoRef.current.currentTime = outroEnd;
          } else {
              videoRef.current.currentTime = videoRef.current.duration - 0.5;
          }
      }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
            videoRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  const handleTimeUpdate = () => {
      if (videoRef.current) {
          setCurrentTime(videoRef.current.currentTime);
          setDuration(videoRef.current.duration);
      }
  };

  const saveTimings = async () => {
      if (!episodeId) return;
      setIsSaving(true);
      try {
          await fetch('/api/update-timings', {
              method: 'POST',
              body: JSON.stringify({
                  episode_id: episodeId,
                  intro_start: newIntroStart,
                  intro_end: newIntroEnd,
                  outro_start: newOutroStart,
                  outro_end: newOutroEnd
              })
          });
          setIsEditMode(false);
          // Ideally we should update parent state here, but re-fetching will happen on navigation
          // We can just alert for now as requested "save automatically in database"
          alert('Timings saved! They will apply to everyone.');
      } catch (err) {
          console.error(err);
          alert('Failed to save timings');
      } finally {
          setIsSaving(false);
      }
  };

  if (isEmbed) {
       // Attempt autoplay params for embeds
      const embedSrc = src.includes('?') ? `${src}&autoplay=1&muted=1` : `${src}?autoplay=1&muted=1`;
      
      return (
          <div className="relative group bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-video">
               <iframe 
                   src={embedSrc} 
                   className="w-full h-full" 
                   frameBorder="0" 
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                   allowFullScreen
               />
          </div>
      );
  }

  return (
    <div className="relative group bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 aspect-video">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onClick={togglePlay}
        onEnded={onEnded}
        autoPlay={autoPlay}
        muted={isMuted} // Muted required for autoplay
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
      />
      
      {/* Skip Buttons Overlay */}
      <AnimatePresence>
          {showSkipIntro && !isEditMode && (
              <motion.button
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                onClick={skipIntro}
                className="absolute bottom-20 left-6 z-20 px-6 py-2 bg-white text-black font-bold rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                  <SkipForward className="w-4 h-4" /> Skip Intro
              </motion.button>
          )}
          {showSkipOutro && !isEditMode && (
               <motion.button
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onClick={skipOutro} 
                className="absolute bottom-20 right-6 z-20 px-6 py-2 bg-white text-black font-bold rounded-full flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
              >
                  <SkipForward className="w-4 h-4" /> Next Episode
              </motion.button>
          )}
      </AnimatePresence>

      {/* Edit Mode Overlay */}
      {isEditMode && (
          <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 bg-black/80 p-4 rounded-xl border border-white/20 backdrop-blur-md">
              <h4 className="text-white font-bold text-sm mb-2">Edit Timings (Crowdsource)</h4>
              <div className="grid grid-cols-2 gap-2">
                   <button onClick={() => setNewIntroStart(currentTime)} className="px-3 py-1 bg-gray-700 text-xs text-white rounded hover:bg-gray-600">
                       Set Intro Start: {newIntroStart.toFixed(1)}s
                   </button>
                   <button onClick={() => setNewIntroEnd(currentTime)} className="px-3 py-1 bg-gray-700 text-xs text-white rounded hover:bg-gray-600">
                       Set Intro End: {newIntroEnd.toFixed(1)}s
                   </button>
                   <button onClick={() => setNewOutroStart(currentTime)} className="px-3 py-1 bg-gray-700 text-xs text-white rounded hover:bg-gray-600">
                       Set Outro Start: {newOutroStart.toFixed(1)}s
                   </button>
                   <button onClick={() => setNewOutroEnd(currentTime)} className="px-3 py-1 bg-gray-700 text-xs text-white rounded hover:bg-gray-600">
                       Set Outro End: {newOutroEnd.toFixed(1)}s
                   </button>
              </div>
              <div className="flex gap-2 mt-2">
                   <button onClick={saveTimings} disabled={isSaving} className="flex-1 py-1 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-500 flex items-center justify-center gap-1">
                       <Save className="w-3 h-3" /> Save for Everyone
                   </button>
                   <button onClick={() => setIsEditMode(false)} className="px-3 py-1 bg-red-600/50 text-white text-xs rounded hover:bg-red-600">
                       Cancel
                   </button>
              </div>
          </div>
      )}

      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
        
        {/* Progress Bar (Simple) */}
        <div className="w-full bg-white/20 h-1 rounded-full mb-4 cursor-pointer overflow-hidden" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            if (videoRef.current) videoRef.current.currentTime = pos * videoRef.current.duration;
        }}>
            <div className="bg-purple-500 h-full" style={{ width: `${(currentTime / duration) * 100}%` }} />
        </div>

        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <button 
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center text-white transition-all"
                >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
                </button>
                
                <button 
                  onClick={toggleMute}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                 <div className="text-xs text-gray-300 font-mono">
                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / 
                    {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                 </div>
            </div>

            <div className="flex items-center gap-2">
                 {/* Edit Timings Button */}
                 {episodeId && !isEmbed && (
                     <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`p-2 rounded-full transition-colors ${isEditMode ? 'text-purple-400 bg-white/10' : 'text-gray-300 hover:text-white'}`}
                        title="Edit Timings"
                     >
                         <Settings className="w-5 h-5" />
                     </button>
                 )}

                <button 
                  onClick={toggleFullscreen}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                >
                    {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
            </div>
        </div>
      </div>

      {/* Center Play Button on Initial/Pause */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-purple-600/90 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm animate-pulse">
                <Play className="w-8 h-8 text-white ml-2 fill-white" />
            </div>
        </div>
      )}
    </div>
  );
}
