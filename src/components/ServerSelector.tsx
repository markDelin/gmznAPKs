
import { MessageSquare, Mic } from 'lucide-react';

interface ServerSelectorProps {
    currentEpisodeNumber: number;
    currentServer: string;
    setServer: (s: string) => void;
    currentAudio: 'sub' | 'dub';
    setAudio: (a: 'sub' | 'dub') => void;
}

export function ServerSelector({ currentEpisodeNumber, currentServer, setServer, currentAudio, setAudio, hasSub, hasDub }: ServerSelectorProps & { hasSub: boolean, hasDub: boolean }) {
  return (
    <div className="bg-[#0f0f0f] border border-white/5 rounded-xl p-4 space-y-4">
        
        {/* Type Selection */}
        <div className="flex items-center justify-between">
            <h3 className="text-sm text-gray-400">You are watching <span className="text-[#ff6b44] font-bold">Episode {currentEpisodeNumber}</span></h3>
            <div className="flex bg-[#1a1a1a] rounded-lg p-1 gap-1">
                {hasSub && (
                    <button onClick={() => setAudio('sub')} className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded transition-colors ${currentAudio === 'sub' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                        <MessageSquare className="w-3 h-3" /> Sub
                    </button>
                )}
                {hasDub && (
                    <button onClick={() => setAudio('dub')} className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded transition-colors ${currentAudio === 'dub' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}>
                        <Mic className="w-3 h-3" /> Dub
                    </button>
                )}
            </div>
        </div>

        {/* Server List */}
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-500 uppercase w-16">Server:</span>
                <div className="flex flex-wrap gap-2">
                    {['Abyss.to'].map(server => (
                        <button 
                            key={server}
                            onClick={() => setServer(server)}
                            className={`px-4 py-2 text-xs font-bold rounded transition-colors ${currentServer === server ? 'bg-[#ff6b44] text-white hover:bg-[#ff5528]' : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#333]'}`}
                        >
                            {server}
                        </button>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="text-[10px] text-gray-600 italic">
            If the current server doesn't work, please try other servers associated with different audio types.
        </div>
    </div>
  );
}
