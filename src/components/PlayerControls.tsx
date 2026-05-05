import { 
  Maximize, Minimize, Moon, Sun, 
  SkipForward, PlayCircle, Scissors
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface PlayerControlsProps {
  autoPlay: boolean;
  setAutoPlay: (v: boolean) => void;
  autoNext: boolean;
  setAutoNext: (v: boolean) => void;
  autoSkip: boolean;
  setAutoSkip: (v: boolean) => void;
  isExpanded: boolean;
  toggleExpand: () => void;
  isFocus: boolean;
  toggleFocus: () => void;
}

const ControlButton = ({ 
  active = false, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  active?: boolean; 
  onClick: () => void; 
  icon: LucideIcon; 
  label: string 
}) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 md:px-2 py-3 md:py-1 text-xs font-bold transition-colors touch-manipulation ${
      active ? 'text-[#ff6b44]' : 'text-gray-400 hover:text-white'
    }`}
  >
    <Icon className={`w-5 h-5 md:w-4 md:h-4 ${active ? 'fill-current' : ''}`} />
    <span className="hidden md:inline">{label}</span>
  </button>
);

export function PlayerControls({
  autoPlay, setAutoPlay,
  autoNext, setAutoNext,
  autoSkip, setAutoSkip,
  isExpanded, toggleExpand,
  isFocus, toggleFocus
}: PlayerControlsProps) {

  return (
    <div className="bg-[#1a1a1a] p-3 rounded-b-xl border-x border-b border-white/5 flex flex-wrap items-center justify-between gap-y-3">
        
        {/* Left Side: View Controls */}
        <div className="flex items-center gap-4 border-r border-white/5 pr-4">
             <ControlButton 
                onClick={toggleExpand} 
                icon={isExpanded ? Minimize : Maximize} 
                label={isExpanded ? "Collapse" : "Expand"} 
             />
             <ControlButton 
                onClick={toggleFocus} 
                icon={isFocus ? Sun : Moon} 
                label="Focus" 
                active={isFocus}
             />
        </div>

        {/* Center: Playback Toggles */}
        <div className="flex items-center gap-4 flex-1 justify-center">
             <ControlButton 
                onClick={() => setAutoNext(!autoNext)} 
                icon={SkipForward} 
                label="AutoNext" 
                active={autoNext}
             />
             <ControlButton 
                onClick={() => setAutoPlay(!autoPlay)} 
                icon={PlayCircle} 
                label="AutoPlay" 
                active={autoPlay}
             />
             <ControlButton 
                onClick={() => setAutoSkip(!autoSkip)} 
                icon={Scissors} 
                label="AutoSkip" 
                active={autoSkip}
             />
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-4 border-l border-white/5 pl-4">
             {/* Removed Bookmark, W2G, Report as requested */}
        </div>
    </div>
  );
}
