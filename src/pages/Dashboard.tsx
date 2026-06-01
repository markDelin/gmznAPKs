import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit2, Upload,
  Code, X, Menu,
  LogOut, Tv, List, ArrowLeft, Search, Film, Eye, Hash, Star, Download, Layers, Radio
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
const MySwal = withReactContent(Swal);

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
  anime_id: number;
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

interface DeveloperProfile {
  id?: number;
  name: string;
  bio: string;
  avatar_url: string;
  role: string;
  social_links: {
    github?: string;
    twitter?: string;
    website?: string;
  };
}

interface ApiSearchResult {
  mal_id: number;
  title: string;
  title_english: string;
  synopsis: string;
  cover_image: string;
  banner_image: string;
  genre: string[];
  rating: number;
  status: string;
  total_episodes: number;
  year: number;
  type: string;
}

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) => (
  <div className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-white/10">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{label}</p>
    </div>
  </div>
);

const ImageSelector = ({ label, value, onChange }: { label: string; value?: string; onChange: (base64: string) => void }) => (
  <div>
    <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">{label}</label>
    <label className="block w-full h-32 border-2 border-dashed border-white/10 hover:border-[#ff6b44]/50 rounded-2xl cursor-pointer relative overflow-hidden bg-[#0f0f0f] group transition-all">
      {value ? (
        <>
          <img src={value} className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <span className="bg-black/80 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-2"><Upload className="w-3 h-3" /> Change Image</span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500 group-hover:text-[#ff6b44] transition-colors">
          <Upload className="w-6 h-6" />
          <span className="text-xs font-bold tracking-wider">CLICK TO UPLOAD</span>
        </div>
      )}
      <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const base64 = await convertToBase64(file);
          onChange(base64);
        }
      }} />
    </label>
  </div>
);

const AnimeForm = ({ initialData, onSubmit, onCancel }: { initialData: Partial<Anime> | null; onSubmit: (data: Partial<Anime>) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState(initialData || {
    title: '', description: '', cover_image: '', banner_image: '', genre: [], status: 'ongoing', rating: 0, total_episodes: 0
  });

  const genres = [
    'Action', 'Adventure', 'Avant Garde', 'Boys Love', 'Comedy', 'Drama', 'Ecchi',
    'Fantasy', 'Girls Love', 'Gourmet', 'Horror', 'Isekai', 'Iyashikei', 'Josei',
    'Kids', 'Magic', 'Mecha', 'Military', 'Music', 'Mystery', 'Parody', 'Psychological',
    'Romance', 'Samurai', 'School', 'Sci-Fi', 'Seinen', 'Shoujo', 'Shounen',
    'Slice of Life', 'Space', 'Sports', 'Super Power', 'Supernatural', 'Suspense', 'Vampire'
  ];

  const toggleGenre = (g: string) => {
    const current = formData.genre || [];
    setFormData({ ...formData, genre: current.includes(g) ? current.filter(x => x !== g) : [...current, g] });
  };

  return (
    <div className="text-left space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Title</label>
          <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Status</label>
          <select className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
            value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as any })}>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Description</label>
        <textarea className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors h-24 resize-none"
          value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ImageSelector label="Cover Image" value={formData.cover_image} onChange={val => setFormData({ ...formData, cover_image: val })} />
        <ImageSelector label="Banner Image" value={formData.banner_image} onChange={val => setFormData({ ...formData, banner_image: val })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Rating</label>
          <input type="number" step="0.1" className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
            value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })} />
        </div>
        <div>
          <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Total Episodes</label>
          <input type="number" className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
            value={formData.total_episodes} onChange={e => setFormData({ ...formData, total_episodes: parseInt(e.target.value) })} />
        </div>
      </div>
      <div>
        <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Genres</label>
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar">
          {genres.map(g => (
            <button key={g} onClick={() => toggleGenre(g)} className={`px-2 py-1 text-[10px] font-bold rounded uppercase border transition-all ${formData.genre?.includes(g) ? 'bg-[#ff6b44] border-[#ff6b44] text-white' : 'border-white/10 text-gray-500 hover:border-white/30'}`}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button onClick={onCancel} className="px-6 py-2.5 text-gray-400 hover:text-white text-sm font-medium transition-colors">Cancel</button>
        <button onClick={() => onSubmit(formData)} className="px-8 py-2.5 bg-gradient-to-r from-[#ff6b44] to-[#ff5528] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all">Save Anime</button>
      </div>
    </div>
  );
};

const EpisodeForm = ({ initialData, animeId, onSubmit, onCancel }: { initialData: Partial<Episode> | null; animeId: number; onSubmit: (data: Partial<Episode>) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState(initialData || {
    anime_id: animeId, episode_number: 1, title: '', video_url: '', video_url_2: '', video_url_dub: '', video_url_dub_2: '', video_url_tagalog: '', video_url_tagalog_2: '', thumbnail_url: '', season_number: 1, subtitle_sub_url: '', subtitle_dub_url: '', subtitle_tagalog_url: ''
  });

  return (
    <div className="text-left space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Season</label>
          <input type="number" className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
            value={formData.season_number} onChange={e => setFormData({ ...formData, season_number: parseInt(e.target.value) })} />
        </div>
        <div>
          <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Episode #</label>
          <input type="number" className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
            value={formData.episode_number} onChange={e => setFormData({ ...formData, episode_number: parseInt(e.target.value) })} />
        </div>
        <div>
          <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Title</label>
          <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
            value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. The Beginning" />
        </div>
      </div>

      <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Video Sources</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-blue-400 font-black uppercase mb-1.5 block">Sub Server 1 (Main)</label>
            <input className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#ff6b44] outline-none transition-colors"
              value={formData.video_url} onChange={e => setFormData({ ...formData, video_url: e.target.value })} placeholder="Paste link..." />
          </div>
          <div>
            <label className="text-[10px] text-blue-400 font-black uppercase mb-1.5 block">Sub Server 2 (Mirror)</label>
            <input className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#ff6b44] outline-none transition-colors"
              value={formData.video_url_2} onChange={e => setFormData({ ...formData, video_url_2: e.target.value })} placeholder="Paste link..." />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-[#ff6b44] font-black uppercase mb-1 block">Dub Server 1</label>
            <input className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#ff6b44] outline-none transition-colors"
              value={formData.video_url_dub} onChange={e => setFormData({ ...formData, video_url_dub: e.target.value })} placeholder="Paste link..." />
          </div>
          <div>
            <label className="text-[10px] text-[#ff6b44] font-black uppercase mb-1 block">Dub Server 2</label>
            <input className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#ff6b44] outline-none transition-colors"
              value={formData.video_url_dub_2} onChange={e => setFormData({ ...formData, video_url_dub_2: e.target.value })} placeholder="Paste link..." />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] text-green-400 font-black uppercase mb-1.5 block">Tagalog Server 1</label>
            <input className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#ff6b44] outline-none transition-colors"
              value={formData.video_url_tagalog} onChange={e => setFormData({ ...formData, video_url_tagalog: e.target.value })} placeholder="Paste link..." />
          </div>
          <div>
            <label className="text-[10px] text-green-400 font-black uppercase mb-1.5 block">Tagalog Server 2</label>
            <input className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#ff6b44] outline-none transition-colors"
              value={formData.video_url_tagalog_2} onChange={e => setFormData({ ...formData, video_url_tagalog_2: e.target.value })} placeholder="Paste link..." />
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider">Subtitles (VTT URL)</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] text-blue-400 font-black uppercase mb-1.5 block">Sub</label>
            <input className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#ff6b44] outline-none transition-colors placeholder:text-gray-600"
              value={formData.subtitle_sub_url} onChange={e => setFormData({ ...formData, subtitle_sub_url: e.target.value })} placeholder="https://example.com/sub.vtt" />
          </div>
          <div>
            <label className="text-[10px] text-[#ff6b44] font-black uppercase mb-1.5 block">Dub</label>
            <input className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#ff6b44] outline-none transition-colors placeholder:text-gray-600"
              value={formData.subtitle_dub_url} onChange={e => setFormData({ ...formData, subtitle_dub_url: e.target.value })} placeholder="https://example.com/dub.vtt" />
          </div>
          <div>
            <label className="text-[10px] text-green-400 font-black uppercase mb-1.5 block">Tagalog</label>
            <input className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-[#ff6b44] outline-none transition-colors placeholder:text-gray-600"
              value={formData.subtitle_tagalog_url} onChange={e => setFormData({ ...formData, subtitle_tagalog_url: e.target.value })} placeholder="https://example.com/tgl.vtt" />
          </div>
        </div>
      </div>

      <ImageSelector label="Thumbnail (Optional)" value={formData.thumbnail_url} onChange={val => setFormData({ ...formData, thumbnail_url: val })} />
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <button onClick={onCancel} className="px-6 py-2.5 text-gray-400 hover:text-white text-sm font-medium transition-colors">Cancel</button>
        <button onClick={() => onSubmit(formData)} className="px-8 py-2.5 bg-gradient-to-r from-[#ff6b44] to-[#ff5528] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all">Save Episode</button>
      </div>
    </div>
  );
};

const DeveloperForm = ({ initialData, onSubmit }: { initialData: DeveloperProfile; onSubmit: (data: DeveloperProfile) => void }) => {
  const [formData, setFormData] = useState(initialData);

  return (
    <div className="text-left space-y-4 max-w-2xl mx-auto">
      <div>
        <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Name</label>
        <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
          value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Bio</label>
        <textarea className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors h-24 resize-none"
          value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
      </div>
      <div>
        <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Role</label>
        <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
          value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
      </div>
      <ImageSelector label="Avatar" value={formData.avatar_url} onChange={val => setFormData({ ...formData, avatar_url: val })} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Github URL</label>
          <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
            value={formData.social_links?.github || ''} onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, github: e.target.value } })} />
        </div>
        <div>
          <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Twitter URL</label>
          <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
            value={formData.social_links?.twitter || ''} onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })} />
        </div>
        <div>
          <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Website URL</label>
          <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
            value={formData.social_links?.website || ''} onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, website: e.target.value } })} />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={() => onSubmit(formData)} className="px-8 py-2.5 bg-gradient-to-r from-[#ff6b44] to-[#ff5528] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all">
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'anime' | 'developer'>('anime');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  const [anime, setAnime] = useState<Anime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Import state
  const [importOpen, setImportOpen] = useState(false);
  const [importQuery, setImportQuery] = useState('');
  const [importResults, setImportResults] = useState<ApiSearchResult[]>([]);
  const [importLoading, setImportLoading] = useState(false);

  // Batch add state
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchStart, setBatchStart] = useState(1);
  const [batchEnd, setBatchEnd] = useState(12);
  const [batchSeason, setBatchSeason] = useState(1);
  const [batchSubUrl, setBatchSubUrl] = useState('');

  // Episode search
  const [epSearch, setEpSearch] = useState('');

  // TMDB Discovery
  const [tmdbLoading, setTmdbLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('adminPassword');
    if (saved) { setPassword(saved); setAuthenticated(true); }
  }, []);

  useEffect(() => {
    if (authenticated) {
      switch (activeTab) {
        case 'developer': fetchDeveloper(); break;
        case 'anime': fetchAnime(); break;
      }
    }
  }, [authenticated, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('adminPassword', password);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminPassword');
    setAuthenticated(false);
    setPassword('');
  };

  const getPassword = () => localStorage.getItem('adminPassword') || '';

  const confirmDelete = async (action: () => void) => {
    const result = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff6b44',
      cancelButtonColor: '#333',
      confirmButtonText: 'Yes, delete it!',
      background: '#1a1a1a',
      color: '#fff'
    });
    if (result.isConfirmed) action();
  };

  const fetchAnime = async () => {
    setLoading(true);
    const res = await fetch('/api/get-anime');
    if (res.ok) setAnime(await res.json());
    setLoading(false);
  };

  const fetchEpisodes = async (animeId: number) => {
    const res = await fetch(`/api/get-episodes?anime_id=${animeId}`);
    if (res.ok) setEpisodes(await res.json());
  };

  const fetchDeveloper = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/manage-developer', { headers: { 'x-admin-password': getPassword() } });
      if (res.ok) {
        const data = await res.json();
        setDeveloper(Object.keys(data).length === 0
          ? { name: '', bio: '', role: '', avatar_url: '', social_links: {} }
          : data);
      } else {
        setDeveloper({ name: '', bio: '', role: '', avatar_url: '', social_links: {} });
      }
    } catch {
      setDeveloper({ name: '', bio: '', role: '', avatar_url: '', social_links: {} });
    } finally {
      setLoading(false);
    }
  };

  const apiAction = async (url: string, method: string, body: unknown, onSuccess: () => void, successMessage = 'Operation Successful!', silentToast = false) => {
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-admin-password': getPassword() },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        if (!silentToast) {
          await MySwal.fire({
            icon: 'success', title: 'Success!', text: successMessage, background: '#1a1a1a',
            color: '#fff', confirmButtonColor: '#ff6b44', timer: 1500, timerProgressBar: true
          });
        }
        onSuccess();
        return true;
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.message || `Server Error ${res.status}`);
      }
    } catch (err: unknown) {
      if (!silentToast) {
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong.';
        MySwal.fire({ icon: 'error', title: 'Action Failed', text: errorMessage, background: '#1a1a1a', color: '#fff', confirmButtonColor: '#d33' });
      }
      return false;
    }
  };

  // --- Import from MyAnimeList ---
  const searchImport = useCallback(async () => {
    if (!importQuery.trim()) return;
    setImportLoading(true);
    try {
      const res = await fetch(`/api/search-anime?q=${encodeURIComponent(importQuery)}`);
      const data = await res.json();
      setImportResults(data.results || []);
    } catch {
      setImportResults([]);
    } finally {
      setImportLoading(false);
    }
  }, [importQuery]);

  const handleImport = (result: ApiSearchResult) => {
    const animeData: Partial<Anime> = {
      title: result.title,
      description: result.synopsis?.slice(0, 500) || '',
      cover_image: result.cover_image || '',
      banner_image: result.banner_image || '',
      genre: result.genre || [],
      rating: result.rating || 0,
      status: result.status || 'upcoming',
      total_episodes: result.total_episodes || 0,
    };

    setImportOpen(false);
    setImportQuery('');
    setImportResults([]);

    // Open create modal with pre-filled data
    MySwal.fire({
      title: '', padding: 0, showConfirmButton: false, background: 'transparent',
      html: (
        <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-2xl border border-white/10 shadow-2xl w-[95vw] sm:w-[85vw] md:w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-5 h-5 text-[#ff6b44]" />
            <h3 className="text-xl font-black text-white">Imported: {result.title}</h3>
          </div>
          <AnimeForm initialData={animeData} onCancel={() => Swal.close()} onSubmit={data => apiAction('/api/manage-anime', 'POST', data, fetchAnime, 'Anime Imported!')} />
        </div>
      )
    });
  };

  // --- Batch Episode Add ---
  const handleBatchAdd = async () => {
    const count = batchEnd - batchStart + 1;
    if (count < 1 || count > 100) {
      MySwal.fire({ icon: 'error', title: 'Invalid range', text: 'Max 100 episodes per batch', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#ff6b44' });
      return;
    }

    setBatchOpen(false);

    MySwal.fire({
      title: `Add ${count} Episodes?`,
      text: `Season ${batchSeason}, Episodes ${batchStart}-${batchEnd}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ff6b44',
      cancelButtonColor: '#333',
      confirmButtonText: 'Create All',
      background: '#1a1a1a',
      color: '#fff'
    }).then(async (result) => {
      if (!result.isConfirmed || !selectedAnime) return;

      let success = 0;
      let fail = 0;

      for (let ep = batchStart; ep <= batchEnd; ep++) {
        const body: Partial<Episode> = {
          anime_id: selectedAnime.id,
          episode_number: ep,
          season_number: batchSeason,
          title: '',
          video_url: batchSubUrl ? batchSubUrl.replace('{ep}', String(ep)) : '',
          video_url_2: '',
          video_url_dub: '',
          video_url_dub_2: '',
          video_url_tagalog: '',
          video_url_tagalog_2: '',
          thumbnail_url: '',
        };

        const ok = await apiAction('/api/manage-episode', 'POST', body, () => {}, '', true);
        if (ok) success++; else fail++;
      }

      await fetchEpisodes(selectedAnime.id);
      fetchAnime();

      MySwal.fire({
        icon: fail === 0 ? 'success' : 'warning',
        title: `${success} Episodes Added`,
        text: fail > 0 ? `${fail} failed` : '',
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#ff6b44'
      });
    });
  };

  // --- Quick Add Next Episode ---
  const quickAddNext = async () => {
    if (!selectedAnime) return;
    const maxEp = episodes.length > 0 ? Math.max(...episodes.map(e => e.episode_number || 0)) : 0;
    const lastSeason = episodes.length > 0 ? episodes[episodes.length - 1].season_number || 1 : 1;

    const lastEp = episodes.find(e => e.episode_number === maxEp && e.season_number === lastSeason);

    const body: Partial<Episode> = {
      anime_id: selectedAnime.id,
      episode_number: maxEp + 1,
      season_number: lastSeason,
      title: '',
      video_url: lastEp?.video_url || '',
      video_url_2: lastEp?.video_url_2 || '',
      video_url_dub: lastEp?.video_url_dub || '',
      video_url_dub_2: lastEp?.video_url_dub_2 || '',
      video_url_tagalog: lastEp?.video_url_tagalog || '',
      video_url_tagalog_2: lastEp?.video_url_tagalog_2 || '',
      thumbnail_url: lastEp?.thumbnail_url || '',
    };

    const ok = await apiAction('/api/manage-episode', 'POST', body, () => {
      fetchEpisodes(selectedAnime.id);
      fetchAnime();
    }, `Episode ${maxEp + 1} Added!`);

    if (ok) {
      setAnime(prev => prev.map(a => a.id === selectedAnime.id ? { ...a, total_episodes: Math.max(a.total_episodes, maxEp + 1) } : a));
    }
  };

  // --- TMDB Auto-Discover Episodes ---
  const discoverFromTMDB = async () => {
    if (!selectedAnime) return;

    const confirm = await MySwal.fire({
      title: 'Auto-Discover from TMDB?',
      text: `Search TMDB for "${selectedAnime.title}" and create all episodes with EzvidAPI embed URLs`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#ff6b44',
      cancelButtonColor: '#333',
      confirmButtonText: 'Start Discovery',
      background: '#1a1a1a',
      color: '#fff'
    });

    if (!confirm.isConfirmed) return;

    setTmdbLoading(true);

    MySwal.fire({
      title: '',
      padding: 0,
      showConfirmButton: false,
      background: 'transparent',
      allowOutsideClick: false,
      html: (
        <div className="bg-[#1a1a1a] p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl w-[90vw] max-w-sm mx-auto text-center">
          <div className="w-12 h-12 border-4 border-[#ff6b44] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <h3 className="text-lg font-black text-white mb-2">Discovering Episodes</h3>
          <p className="text-gray-500 text-sm font-medium" id="tmdb-progress">Searching TMDB for "{selectedAnime.title}"...</p>
          <div className="mt-5 h-2 bg-white/10 rounded-full overflow-hidden">
            <div id="tmdb-progress-bar" className="h-full bg-gradient-to-r from-[#ff6b44] to-purple-500 rounded-full transition-all" style={{ width: '0%' }} />
          </div>
        </div>
      )
    });

    try {
      const res = await fetch(`/api/tmdb-episodes?q=${encodeURIComponent(selectedAnime.title)}`);
      if (!res.ok) throw new Error('TMDB search failed');

      const tmdbData = await res.json();
      const existingEps = new Set(episodes.map(e => `${e.season_number || 1}-${e.episode_number}`));
      const seasonEpisodes = tmdbData.seasons.flatMap((s: { season_number: number; episodes: any[] }) =>
        s.episodes.map((ep: any) => ({ ...ep, season_number: s.season_number }))
      );
      const totalToProcess = seasonEpisodes.filter((ep: any) => !existingEps.has(`${ep.season_number}-${ep.episode_number}`)).length;
      const totalToSkip = seasonEpisodes.length - totalToProcess;
      let created = 0;
      let processed = 0;

      const progressEl = document.getElementById('tmdb-progress');
      const barEl = document.getElementById('tmdb-progress-bar');

      for (const season of tmdbData.seasons) {
        for (const ep of season.episodes) {
          const key = `${season.season_number}-${ep.episode_number}`;
          if (existingEps.has(key)) continue;

          if (progressEl) progressEl.textContent = `Creating Episode ${ep.episode_number} (Season ${season.season_number})...`;
          if (barEl && totalToProcess > 0) barEl.style.width = `${Math.round((processed / totalToProcess) * 100)}%`;

          const embedUrl = `https://ezvidapi.com/embed/tv/${tmdbData.tmdb_id}/${season.season_number}/${ep.episode_number}`;
          const body: Partial<Episode> = {
            anime_id: selectedAnime.id,
            episode_number: ep.episode_number,
            season_number: season.season_number,
            title: ep.title || '',
            video_url: embedUrl,
            video_url_2: '',
            video_url_dub: '',
            video_url_dub_2: '',
            video_url_tagalog: '',
            video_url_tagalog_2: '',
            thumbnail_url: ep.still_path || '',
          };

          const ok = await apiAction('/api/manage-episode', 'POST', body, () => {}, '', true);
          if (ok) created++;
          processed++;
        }
      }

      await fetchEpisodes(selectedAnime.id);
      fetchAnime();

      Swal.close();
      MySwal.fire({
        icon: created > 0 ? 'success' : 'info',
        title: `${created} Episodes Created`,
        text: `${totalToSkip} already exist${created > 0 ? `. Open the Watch page to auto-fetch video sources.` : ''}`,
        background: '#1a1a1a',
        color: '#fff',
        confirmButtonColor: '#ff6b44'
      });
    } catch (err: unknown) {
      Swal.close();
      const msg = err instanceof Error ? err.message : 'Failed to discover episodes';
      MySwal.fire({ icon: 'error', title: 'TMDB Discovery Failed', text: msg, background: '#1a1a1a', color: '#fff', confirmButtonColor: '#d33' });
    } finally {
      setTmdbLoading(false);
    }
  };

  const openAnimeModal = (item: Partial<Anime> | null) => {
    MySwal.fire({
      title: '', padding: 0, showConfirmButton: false, background: 'transparent',
      html: (
        <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-2xl border border-white/10 shadow-2xl w-[95vw] sm:w-[85vw] md:w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            {item ? <Edit2 className="w-5 h-5 text-[#ff6b44]" /> : <Plus className="w-5 h-5 text-[#ff6b44]" />}
            {item ? 'Edit Anime' : 'New Anime Title'}
          </h3>
          <AnimeForm initialData={item} onCancel={() => Swal.close()} onSubmit={data => apiAction('/api/manage-anime', item?.id ? 'PUT' : 'POST', { ...data, id: item?.id }, fetchAnime, 'Anime Saved!')} />
        </div>
      )
    });
  };

  const openEpisodeModal = (animeId: number, item: Partial<Episode> | null) => {
    let initialEpisodeData = item;

    if (!item) {
      const maxEp = episodes.length > 0 ? Math.max(...episodes.map(e => e.episode_number || 0)) : 0;
      const lastSeason = episodes.length > 0 ? episodes[episodes.length - 1].season_number || 1 : 1;

      initialEpisodeData = {
        anime_id: animeId,
        episode_number: maxEp + 1,
        season_number: lastSeason,
        title: '',
        video_url: '',
        video_url_2: '',
        video_url_dub: '',
        video_url_dub_2: '',
        video_url_tagalog: '',
        video_url_tagalog_2: '',
        thumbnail_url: '',
        subtitle_sub_url: '',
        subtitle_dub_url: '',
        subtitle_tagalog_url: '',
        id: 0,
      };
    }

    MySwal.fire({
      title: '', padding: 0, showConfirmButton: false, background: 'transparent',
      html: (
        <div className="bg-[#1a1a1a] p-4 sm:p-6 rounded-2xl border border-white/10 shadow-2xl w-[95vw] sm:w-[85vw] md:w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
            {item ? <Edit2 className="w-5 h-5 text-[#ff6b44]" /> : <Plus className="w-5 h-5 text-[#ff6b44]" />}
            {item ? 'Edit Episode' : 'Add New Episode'}
          </h3>
          <EpisodeForm animeId={animeId} initialData={initialEpisodeData} onCancel={() => Swal.close()} onSubmit={data => apiAction('/api/manage-episode', item?.id ? 'PUT' : 'POST', { ...data, id: item?.id, anime_id: animeId }, () => { fetchEpisodes(animeId); fetchAnime(); }, item?.id ? 'Episode Saved!' : 'Episode Added!')} />
        </div>
      )
    });
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 shadow-2xl text-center">
          <div className="w-20 h-20 mx-auto mb-6 relative flex items-center justify-center group">
            <img src="/icon.png" alt="" className="absolute inset-0 w-full h-full blur-xl opacity-60 transition-opacity saturate-150 rounded-3xl" />
            <img src="/icon.png" alt="Admin Logo" className="w-full h-full object-cover relative z-10 rounded-3xl shadow-inner border border-white/10" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Admin Access</h1>
          <p className="text-gray-500 text-sm mb-6">Enter secure credentials to manage content.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Passkey" className="w-full bg-[#0f0f0f] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#ff6b44] outline-none transition-colors"
              value={password} onChange={e => setPassword(e.target.value)} />
            <button className="w-full bg-[#ff6b44] hover:bg-[#ff5528] text-white font-bold py-3 rounded-lg transition-transform hover:scale-[1.02]">
              Authenticate
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredAnime = anime.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEpisodes = anime.reduce((sum, a) => sum + (a.total_episodes || 0), 0);

  const filteredEpisodes = episodes.filter(e =>
    String(e.episode_number).includes(epSearch) ||
    (e.title || '').toLowerCase().includes(epSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 flex relative overflow-hidden">
      {/* Import Modal */}
      {importOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setImportOpen(false); setImportResults([]); }} />
          <div className="relative bg-[#1a1a1a] w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl max-h-[80vh] flex flex-col z-10">
            <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#1a1a1a] rounded-t-2xl z-10">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-[#ff6b44]" /> Import from MyAnimeList
              </h3>
              <button onClick={() => { setImportOpen(false); setImportResults([]); }} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 border-b border-white/5">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Search anime title..."
                  className="flex-1 bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-all placeholder:text-gray-500"
                  value={importQuery}
                  onChange={e => setImportQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchImport()}
                />
                <button onClick={searchImport} disabled={importLoading} className="px-6 py-2.5 bg-[#ff6b44] text-white font-bold rounded-xl hover:bg-[#ff5528] transition-colors disabled:opacity-50 flex items-center gap-2">
                  {importLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {importResults.length === 0 && !importLoading && (
                <p className="text-gray-500 text-center py-12 font-medium">Search for an anime to import</p>
              )}
              {importResults.map((result) => (
                <div key={result.mal_id} className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 flex gap-4 items-start hover:border-[#ff6b44]/30 transition-all">
                  <img src={result.cover_image} alt={result.title} className="w-16 h-24 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-sm truncate">{result.title}</h4>
                    <p className="text-gray-500 text-xs line-clamp-2 mt-1">{result.synopsis?.slice(0, 200)}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.genre.slice(0, 4).map(g => (
                        <span key={g} className="text-[8px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded uppercase font-bold">{g}</span>
                      ))}
                      <span className="text-[8px] bg-yellow-500/10 text-yellow-400 px-1.5 py-0.5 rounded uppercase font-bold">★ {result.rating}</span>
                      <span className="text-[8px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold">{result.total_episodes} EP</span>
                    </div>
                  </div>
                  <button onClick={() => handleImport(result)} className="shrink-0 px-4 py-2 bg-[#ff6b44] text-white font-bold rounded-xl text-xs hover:bg-[#ff5528] transition-all flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5" /> Import
                  </button>
                </div>
              ))}
              {importLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-[#ff6b44] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch Add Modal */}
      {batchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setBatchOpen(false)} />
          <div className="relative bg-[#1a1a1a] w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 z-10">
            <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#ff6b44]" /> Batch Add Episodes
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">From Episode</label>
                  <input type="number" min={1} className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
                    value={batchStart} onChange={e => setBatchStart(parseInt(e.target.value) || 1)} />
                </div>
                <div>
                  <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">To Episode</label>
                  <input type="number" min={1} className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
                    value={batchEnd} onChange={e => setBatchEnd(parseInt(e.target.value) || 12)} />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Season</label>
                <input type="number" min={1} className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors"
                  value={batchSeason} onChange={e => setBatchSeason(parseInt(e.target.value) || 1)} />
              </div>
              <div>
                <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1.5 block">Sub URL Pattern (use {`{ep}`} for episode number)</label>
                <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#ff6b44] outline-none transition-colors placeholder:text-gray-600"
                  value={batchSubUrl} onChange={e => setBatchSubUrl(e.target.value)} placeholder="https://example.com/ep-{ep}" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setBatchOpen(false)} className="px-6 py-2.5 text-gray-400 hover:text-white text-sm font-medium transition-colors">Cancel</button>
                <button onClick={handleBatchAdd} className="px-6 py-2.5 bg-gradient-to-r from-[#ff6b44] to-[#ff5528] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all">
                  Add {batchEnd - batchStart + 1} Episodes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      )}

      <aside className={`fixed h-screen bg-[#1a1a1a] border-r border-white/5 transition-all duration-300 z-50 ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'} flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 flex-shrink-0">
                <img src="/icon.png" alt="" className="absolute inset-0 w-full h-full blur-[6px] opacity-70 saturate-150 rounded-xl" />
                <img src="/icon.png" alt="Logo" className="relative z-10 w-full h-full object-cover rounded-xl shadow-inner border border-white/10" />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-white">GMZN<span className="text-[#ff6b44]">ANIME</span></h1>
            </div>
          ) : (
            <div className="relative w-8 h-8 mx-auto hidden lg:flex">
              <img src="/icon.png" alt="" className="absolute inset-0 w-full h-full blur-[6px] opacity-70 saturate-150 rounded-xl" />
              <img src="/icon.png" alt="Logo" className="relative z-10 w-full h-full object-cover rounded-xl shadow-inner border border-white/10" />
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {[
            { id: 'anime' as const, label: 'Anime Manager', icon: Tv },
            { id: 'developer' as const, label: 'Developer Profile', icon: Code }
          ].sort((a, b) => a.id === activeTab ? -1 : b.id === activeTab ? 1 : 0).map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5" />
            <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>Logout</span>
          </button>
        </div>
      </aside>

      <main className={`flex-1 p-4 lg:p-10 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} w-full`}>
        <div className="sticky top-0 z-30 bg-[#0f0f0f]/80 backdrop-blur-xl pt-4 pb-6 -mt-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-[#1a1a1a] rounded-lg text-white lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-1 capitalize">{activeTab.replace('_', ' ')} Manager</h2>
              <p className="text-gray-500 text-xs md:text-sm">Manage your content ecosystem.</p>
            </div>
          </div>
          <div className="flex gap-4">
            {activeTab === 'anime' && (
              <>
                <button onClick={() => setImportOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors">
                  <Download className="w-5 h-5" />
                  <span>Import</span>
                </button>
                <button onClick={() => openAnimeModal(null)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                  <Plus className="w-5 h-5" />
                  <span>Create New</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6 min-h-[600px] relative">
          {loading && (
            <div className="absolute top-4 right-4 z-50">
              <div className="w-5 h-5 border-2 border-[#ff6b44] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {activeTab === 'anime' && (
            <div className="space-y-8">
              {!selectedAnime ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Film} label="Total Anime" value={anime.length} color="bg-blue-500/20 text-blue-400" />
                    <StatCard icon={Hash} label="Total Episodes" value={totalEpisodes} color="bg-green-500/20 text-green-400" />
                    <StatCard icon={Star} label="Avg Rating" value={anime.length ? (anime.reduce((s, a) => s + a.rating, 0) / anime.length).toFixed(1) : '0'} color="bg-yellow-500/20 text-yellow-400" />
                    <StatCard icon={Eye} label="Ongoing" value={anime.filter(a => a.status === 'ongoing').length} color="bg-[#ff6b44]/20 text-[#ff6b44]" />
                  </div>

                  <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search anime..."
                      className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[#ff6b44] outline-none transition-all text-sm placeholder:text-gray-500"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAnime.map(a => (
                      <div key={a.id} className="group bg-[#0f0f0f] rounded-2xl overflow-hidden border border-white/5 hover:border-[#ff6b44]/40 transition-all flex flex-col">
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <img src={a.cover_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className="absolute top-3 left-3">
                            <span className={`text-[9px] font-black px-2 py-1 rounded uppercase ${a.status === 'ongoing' ? 'bg-green-500/20 text-green-400' : a.status === 'completed' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{a.status}</span>
                          </div>
                          <div className="absolute bottom-3 left-3 flex gap-2">
                            <button onClick={() => openAnimeModal(a)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-blue-400 backdrop-blur-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                            <button onClick={() => confirmDelete(() => apiAction('/api/manage-anime', 'DELETE', { id: a.id }, fetchAnime))} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-red-400 backdrop-blur-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-white line-clamp-1 flex-1">{a.title}</h3>
                            <span className="text-yellow-400 text-xs font-bold flex items-center gap-1 ml-2"><Star className="w-3 h-3 fill-yellow-400" />{a.rating}</span>
                          </div>
                          <button
                            onClick={() => { setSelectedAnime(a); fetchEpisodes(a.id); }}
                            className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-[#ff6b44] text-gray-300 hover:text-white rounded-xl transition-all font-bold text-xs"
                          >
                            <List className="w-4 h-4" /> Manage Episodes
                          </button>
                        </div>
                      </div>
                    ))}
                    {filteredAnime.length === 0 && !loading && (
                      <div className="col-span-full py-12 text-center text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10 uppercase font-black tracking-widest text-xs">
                        No anime found
                      </div>
                    )}
                    <button onClick={() => openAnimeModal(null)} className="aspect-[16/9] border-2 border-dashed border-white/5 hover:border-[#ff6b44]/40 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#ff6b44] transition-all">
                      <Plus className="w-8 h-8" />
                      <span className="font-bold text-xs uppercase tracking-widest">Add New Anime</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <button onClick={() => setSelectedAnime(null)} className="flex items-center gap-2 text-gray-500 hover:text-white font-bold text-sm transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Back to Anime List
                    </button>
                    <div className="flex gap-2">
                      <button onClick={quickAddNext} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors">
                        <Plus className="w-4 h-4" /> Quick Add Next
                      </button>
                      <button onClick={() => setBatchOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors">
                        <Layers className="w-4 h-4" /> Batch
                      </button>
                      <button onClick={discoverFromTMDB} disabled={tmdbLoading} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50">
                        {tmdbLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Radio className="w-4 h-4" />}
                        TMDB
                      </button>
                      <button onClick={() => openEpisodeModal(selectedAnime.id, null)} className="flex items-center gap-2 px-4 py-2 bg-[#ff6b44] text-white font-bold rounded-xl hover:bg-[#ff5528] transition-colors shadow-lg shadow-orange-500/20">
                        <Plus className="w-4 h-4" /> Add Episode
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 flex gap-6 items-center">
                    <img src={selectedAnime.cover_image} className="w-24 h-24 rounded-2xl object-cover" />
                    <div>
                      <h2 className="text-2xl font-black text-white">{selectedAnime.title}</h2>
                      <p className="text-gray-500 text-sm max-w-xl line-clamp-2">{selectedAnime.description}</p>
                      <div className="flex gap-2 mt-2">
                        {selectedAnime.genre.slice(0, 4).map(g => (
                          <span key={g} className="text-[9px] bg-white/5 text-gray-400 px-2 py-0.5 rounded uppercase font-bold">{g}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Episode search */}
                  <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search episodes..."
                      className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:border-[#ff6b44] outline-none transition-all text-xs placeholder:text-gray-500"
                      value={epSearch}
                      onChange={e => setEpSearch(e.target.value)}
                    />
                  </div>

                  <div className="space-y-8">
                    {Array.from(new Set(filteredEpisodes.map(e => e.season_number || 1))).sort((a, b) => a - b).map(season => {
                      const seasonEps = filteredEpisodes.filter(e => (e.season_number || 1) === season);
                      if (seasonEps.length === 0) return null;
                      return (
                        <div key={season} className="space-y-4 mb-8 last:mb-0">
                          <div className="flex items-center gap-4">
                            <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest">Season {season}</h3>
                            <div className="h-[1px] flex-1 bg-white/5" />
                            <span className="text-[10px] text-gray-600 font-bold">{seasonEps.length} episodes</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {seasonEps.map(ep => (
                              <div key={ep.id} className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff6b44]/20 to-transparent rounded-xl flex items-center justify-center font-black text-[#ff6b44] shrink-0 border border-[#ff6b44]/10">
                                    {ep.episode_number}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-white truncate text-sm">{ep.title || `Episode ${ep.episode_number}`}</h4>
                                    <div className="flex gap-2 items-center mt-1">
                                      <div className="flex gap-1">
                                        <span className={`text-[7px] font-black uppercase px-1 rounded ${ep.video_url ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-gray-500/10 text-gray-500'}`}>S1</span>
                                        <span className={`text-[7px] font-black uppercase px-1 rounded ${ep.video_url_2 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-gray-500/10 text-gray-500'}`}>S2</span>
                                      </div>
                                      <div className="w-[1px] h-2 bg-white/10 mx-1" />
                                      <div className="flex gap-1">
                                        <span className={`text-[7px] font-black uppercase px-1 rounded ${ep.video_url_dub ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-gray-500/10 text-gray-500'}`}>D1</span>
                                        <span className={`text-[7px] font-black uppercase px-1 rounded ${ep.video_url_dub_2 ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 'bg-gray-500/10 text-gray-500'}`}>D2</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => openEpisodeModal(selectedAnime.id, ep)} className="p-2 hover:bg-white/5 rounded-lg text-blue-400 transition-colors"><Edit2 className="w-3 h-3" /></button>
                                  <button onClick={() => confirmDelete(() => apiAction('/api/manage-episode', 'DELETE', { id: ep.id }, () => fetchEpisodes(selectedAnime.id)))} className="p-2 hover:bg-white/5 rounded-lg text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                    {episodes.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10 uppercase font-black tracking-widest text-xs">
                        No episodes yet — click "Add Episode", "Batch", or "Quick Add Next"
                      </div>
                    )}
                    {episodes.length > 0 && filteredEpisodes.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10 uppercase font-black tracking-widest text-xs">
                        No episodes match your search
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="flex justify-center">
              {developer && <DeveloperForm initialData={developer} onSubmit={data => apiAction('/api/manage-developer', 'POST', data, fetchDeveloper, 'Profile Updated!')} />}
              {!developer && (
                <div className="flex flex-col items-center gap-4 py-12">
                  <p className="text-gray-500 text-sm">Failed to load profile</p>
                  <button onClick={fetchDeveloper} className="px-4 py-2 bg-[#ff6b44] text-white font-bold rounded-xl text-xs hover:bg-[#ff5528] transition-colors">Retry</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
