import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Upload, 
  Smartphone, Monitor, BookOpen, Code, X, Menu,
  LogOut, ShoppingCart, CheckCircle, Users, Store, Settings,
  Eye, EyeOff, Inbox, Tv, List, ArrowLeft
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useSettings } from '../App';

const MySwal = withReactContent(Swal);

// --- Interfaces ---

interface Order {
  id: number;
  name: string;
  quantity: number;
  created_at: string;
  status: boolean;
}

interface Seller {
  id: number;
  username: string;
}

interface RequestData {
  id: number;
  username: string;
  app_name: string;
  created_at: string;
  status: string;
}

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
  thumbnail_url: string;
}


interface AppData {
  id: number;
  name: string;
  version: string;
  size: string;
  category: string;
  download_url: string;
  icon_url?: string;
  description?: string;
  whats_new?: string;
  tags?: string[];
  previous_versions?: { version: string; download_url: string; }[];
  is_hidden?: boolean;
}

interface Software {
  id: number;
  name: string;
  description: string;
  icon_url: string;
  download_url: string;
  category: string;
}

interface Tutorial {
  id: number;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  category: string;
  duration: string;
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

interface Seller {
  id: number;
  username: string;
  created_at: string;
}

// --- Helper: File to Base64 ---
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- Form Components ---

const AppForm = ({ initialData, onSubmit, onCancel }: { initialData: Partial<AppData> | null, onSubmit: (data: Partial<AppData>) => void, onCancel: () => void }) => {
    // Safely parse previous_versions if it's a string from the DB
    let parsedVersions = [];
    try {
        if (typeof initialData?.previous_versions === 'string') {
            parsedVersions = JSON.parse(initialData.previous_versions);
        } else if (Array.isArray(initialData?.previous_versions)) {
            parsedVersions = initialData.previous_versions;
        }
    } catch {
        parsedVersions = [];
    }

    const [formData, setFormData] = useState(initialData ? { ...initialData, previous_versions: parsedVersions } : {
        name: '', version: '', size: '', category: 'Utility', download_url: '', icon_url: '', 
        description: '', whats_new: '', tags: [], previous_versions: [], is_hidden: false
    });

    const categories = ['Tools', 'Streaming', 'Games', 'Music', 'Productivity', 'Original Apps'];
    const availableTags = ['Premium', 'No Ads', 'Modded', 'Patched', 'Unlocked'];

    const toggleTag = (tag: string) => {
        const currentTags = formData.tags || [];
        setFormData({ 
            ...formData, 
            tags: currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag] 
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'icon_url') => {
        const file = e.target.files?.[0];
        if (file) {
             const base64 = await convertToBase64(file);
             setFormData({ ...formData, [field]: base64 });
        }
    };

    const addVersion = () => {
        setFormData({
            ...formData,
            previous_versions: [...(formData.previous_versions || []), { version: '', download_url: '' }]
        });
    };

    const updateVersion = (index: number, field: 'version' | 'download_url', value: string) => {
        const newVersions = [...(formData.previous_versions || [])];
        newVersions[index] = { ...newVersions[index], [field]: value };
        setFormData({ ...formData, previous_versions: newVersions });
    };

    const removeVersion = (index: number) => {
        const newVersions = [...(formData.previous_versions || [])];
        newVersions.splice(index, 1);
        setFormData({ ...formData, previous_versions: newVersions });
    };

    return (
        <div className="text-left space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">App Name</label>
                     <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Version</label>
                     <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} />
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Size</label>
                     <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
                </div>
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Category</label>
                     <select className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                </div>
            </div>
            <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Download URL</label>
                 <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                    value={formData.download_url} onChange={e => setFormData({...formData, download_url: e.target.value})} />
            </div>
            <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Icon</label>
                 <div className="flex gap-2">
                     <input className="flex-1 bg-[#0f0f0f] border border-white/10 rounded p-2 text-white text-xs"
                        value={formData.icon_url} onChange={e => setFormData({...formData, icon_url: e.target.value})} placeholder="URL..." />
                     <label className="bg-[#ff6b44] text-white p-2 rounded cursor-pointer hover:bg-[#ff5528]">
                        <Upload className="w-4 h-4" />
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'icon_url')} />
                     </label>
                 </div>
            </div>
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Description</label>
                 <textarea className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none h-20"
                    value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
             </div>
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">What's New</label>
                 <textarea className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none h-16"
                    value={formData.whats_new || ''} onChange={e => setFormData({...formData, whats_new: e.target.value})} />
             </div>
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Tags</label>
                 <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                        <button key={tag} onClick={() => toggleTag(tag)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${formData.tags?.includes(tag) ? 'bg-[#ff6b44] border-[#ff6b44] text-white' : 'border-white/20 text-gray-400 hover:border-white'}`}>
                            {tag}
                        </button>
                    ))}
                 </div>
            </div>

            <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-[#ff6b44] font-bold uppercase block">Previous Versions</label>
                    <button onClick={addVersion} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-bold bg-indigo-500/10 px-2 py-1 rounded transition-colors">
                        <Plus className="w-3 h-3" /> Add Version
                    </button>
                </div>
                <div className="space-y-2">
                    {formData.previous_versions?.map((ver: {version: string, download_url: string}, idx: number) => (
                        <div key={idx} className="flex items-start gap-2 bg-white/5 p-2 rounded border border-white/10">
                             <div className="flex-1 space-y-2">
                                <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-1.5 text-white text-xs focus:border-[#ff6b44] outline-none"
                                   placeholder="Version (e.g. 1.0.0)" value={ver.version} onChange={e => updateVersion(idx, 'version', e.target.value)} />
                                <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-1.5 text-white text-xs focus:border-[#ff6b44] outline-none"
                                   placeholder="Download URL" value={ver.download_url} onChange={e => updateVersion(idx, 'download_url', e.target.value)} />
                             </div>
                             <button onClick={() => removeVersion(idx)} className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded h-fit">
                                 <X className="w-4 h-4" />
                             </button>
                        </div>
                    ))}
                    {(!formData.previous_versions || formData.previous_versions.length === 0) && (
                        <div className="text-xs text-slate-500 italic text-center py-2 bg-white/5 rounded border border-white/5">
                            No previous versions listed.
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                <button onClick={() => onSubmit(formData)} className="px-6 py-2 bg-[#ff6b44] hover:bg-[#ff5528] text-white rounded font-bold text-sm shadow-lg shadow-orange-500/20">
                    Save
                </button>
            </div>
        </div>
    );
};

const SoftwareForm = ({ initialData, onSubmit, onCancel }: { initialData: Partial<Software> | null, onSubmit: (data: Partial<Software>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '', description: '', icon_url: '', download_url: '', category: 'Utility'
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'icon_url') => {
        const file = e.target.files?.[0];
        if (file) {
             const base64 = await convertToBase64(file);
             setFormData({ ...formData, [field]: base64 });
        }
    };

    return (
        <div className="text-left space-y-4">
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Name</label>
                 <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             </div>
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Description</label>
                 <textarea className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none h-24"
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Category</label>
                     <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Editor, DevTool" />
                </div>
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Download URL</label>
                     <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.download_url} onChange={e => setFormData({...formData, download_url: e.target.value})} />
                </div>
             </div>
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Icon URL</label>
                 <div className="flex gap-2">
                     <input className="flex-1 bg-[#0f0f0f] border border-white/10 rounded p-2 text-white text-xs"
                        value={formData.icon_url} onChange={e => setFormData({...formData, icon_url: e.target.value})} placeholder="URL..." />
                     <label className="bg-[#ff6b44] text-white p-2 rounded cursor-pointer hover:bg-[#ff5528]">
                        <Upload className="w-4 h-4" />
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'icon_url')} />
                     </label>
                 </div>
             </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                <button onClick={() => onSubmit(formData)} className="px-6 py-2 bg-[#ff6b44] hover:bg-[#ff5528] text-white rounded font-bold text-sm">Save</button>
            </div>
        </div>
    )
}

const SellerForm = ({ onSubmit, onCancel }: { onSubmit: (data: any) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({ username: '', passkey: '' });
    
    return (
        <div className="text-left space-y-4">
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Username</label>
                 <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-white focus:border-[#ff6b44] outline-none" placeholder="e.g. john_doe" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})} />
             </div>
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Passkey</label>
                 <input className="w-full bg-[#0f0f0f] border border-white/10 rounded-xl p-3 text-white focus:border-[#ff6b44] outline-none" placeholder="Enter secure password" type="password" value={formData.passkey} onChange={e => setFormData({...formData, passkey: e.target.value})} />
             </div>
             <div className="flex justify-end gap-3 pt-4">
                <button onClick={onCancel} className="px-5 py-2 text-gray-400 hover:text-white font-medium">Cancel</button>
                <button disabled={!formData.username || !formData.passkey} onClick={() => onSubmit(formData)} className="px-5 py-2 bg-[#ff6b44] hover:bg-[#ff5528] text-white rounded-lg font-bold shadow-lg shadow-orange-500/20 disabled:opacity-50">Create Vendor</button>
            </div>
        </div>
    )
}

const TutorialForm = ({ initialData, onSubmit, onCancel }: { initialData: Partial<Tutorial> | null, onSubmit: (data: Partial<Tutorial>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState(initialData || {
        title: '', description: '', thumbnail_url: '', video_url: '', category: 'General', duration: '10:00'
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail_url') => {
        const file = e.target.files?.[0];
        if (file) {
             const base64 = await convertToBase64(file);
             setFormData({ ...formData, [field]: base64 });
        }
    };

    return (
        <div className="text-left space-y-4">
             <div>
                  <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Title</label>
                  <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                     value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
             </div>
             <div>
                  <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Description</label>
                  <textarea className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none h-24"
                     value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Category</label>
                     <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Duration</label>
                     <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </div>
             </div>
             <div>
                  <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Video/Link URL</label>
                  <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                     value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} />
             </div>
              <div>
                  <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Thumbnail URL</label>
                  <div className="flex gap-2">
                      <input className="flex-1 bg-[#0f0f0f] border border-white/10 rounded p-2 text-white text-xs"
                         value={formData.thumbnail_url} onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} placeholder="URL..." />
                      <label className="bg-[#ff6b44] text-white p-2 rounded cursor-pointer hover:bg-[#ff5528]">
                         <Upload className="w-4 h-4" />
                         <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'thumbnail_url')} />
                      </label>
                  </div>
              </div>
             <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                <button onClick={() => onSubmit(formData)} className="px-6 py-2 bg-[#ff6b44] hover:bg-[#ff5528] text-white rounded font-bold text-sm">Save</button>
            </div>
        </div>
    );
}

const AnimeForm = ({ initialData, onSubmit, onCancel }: { initialData: Partial<Anime> | null, onSubmit: (data: Partial<Anime>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState(initialData || {
        title: '', description: '', cover_image: '', banner_image: '', genre: [], status: 'ongoing', rating: 0, total_episodes: 0
    });

    const genres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural'];

    const toggleGenre = (g: string) => {
        const current = formData.genre || [];
        setFormData({ ...formData, genre: current.includes(g) ? current.filter(x => x !== g) : [...current, g] });
    };

    return (
        <div className="text-left space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Title</label>
                     <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Status</label>
                     <select className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="upcoming">Upcoming</option>
                     </select>
                </div>
             </div>
             <div>
                  <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Description</label>
                  <textarea className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none h-24"
                     value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Cover Image URL</label>
                     <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.cover_image} onChange={e => setFormData({...formData, cover_image: e.target.value})} />
                </div>
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Banner Image URL</label>
                     <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.banner_image} onChange={e => setFormData({...formData, banner_image: e.target.value})} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Rating</label>
                     <input type="number" step="0.1" className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.rating} onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})} />
                </div>
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Total Episodes</label>
                     <input type="number" className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.total_episodes} onChange={e => setFormData({...formData, total_episodes: parseInt(e.target.value)})} />
                </div>
             </div>
             <div>
                  <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Genres</label>
                  <div className="flex flex-wrap gap-2">
                      {genres.map(g => (
                          <button key={g} onClick={() => toggleGenre(g)} className={`px-2 py-1 text-[10px] font-bold rounded uppercase border transition-all ${formData.genre?.includes(g) ? 'bg-[#ff6b44] border-[#ff6b44] text-white' : 'border-white/10 text-gray-500 hover:border-white/30'}`}>
                              {g}
                          </button>
                      ))}
                  </div>
             </div>
             <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                <button onClick={() => onSubmit(formData)} className="px-6 py-2 bg-[#ff6b44] hover:bg-[#ff5528] text-white rounded font-bold text-sm">Save Anime</button>
            </div>
        </div>
    );
};

const EpisodeForm = ({ initialData, animeId, onSubmit, onCancel }: { initialData: Partial<Episode> | null, animeId: number, onSubmit: (data: Partial<Episode>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState(initialData || {
        anime_id: animeId, episode_number: 1, title: '', video_url: '', video_url_2: '', video_url_dub: '', video_url_dub_2: '', thumbnail_url: ''
    });

    return (
        <div className="text-left space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Episode Number</label>
                     <input type="number" className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.episode_number} onChange={e => setFormData({...formData, episode_number: parseInt(e.target.value)})} />
                </div>
                <div>
                     <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Title (Optional)</label>
                     <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. The Beginning" />
                </div>
             </div>
             
             <div className="space-y-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label className="text-[10px] text-blue-400 font-black uppercase mb-1 block">Sub Server 1 (Main)</label>
                         <input className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none text-[10px]"
                            value={formData.video_url} onChange={e => setFormData({...formData, video_url: e.target.value})} placeholder="Paste link..." />
                    </div>
                    <div>
                         <label className="text-[10px] text-blue-400 font-black uppercase mb-1 block">Sub Server 2 (Mirror)</label>
                         <input className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none text-[10px]"
                            value={formData.video_url_2} onChange={e => setFormData({...formData, video_url_2: e.target.value})} placeholder="Paste link..." />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                         <label className="text-[10px] text-[#ff6b44] font-black uppercase mb-1 block">Dub Server 1</label>
                         <input className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none text-[10px]"
                            value={formData.video_url_dub} onChange={e => setFormData({...formData, video_url_dub: e.target.value})} placeholder="Paste link..." />
                    </div>
                    <div>
                         <label className="text-[10px] text-[#ff6b44] font-black uppercase mb-1 block">Dub Server 2</label>
                         <input className="w-full bg-[#0a0a0a] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none text-[10px]"
                            value={formData.video_url_dub_2} onChange={e => setFormData({...formData, video_url_dub_2: e.target.value})} placeholder="Paste link..." />
                    </div>
                </div>
             </div>

             <div>
                  <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Thumbnail URL (Optional)</label>
                  <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                     value={formData.thumbnail_url} onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} />
             </div>
             <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                <button onClick={() => onSubmit(formData)} className="px-6 py-2 bg-[#ff6b44] hover:bg-[#ff5528] text-white rounded font-bold text-sm">Save Episode</button>
            </div>
        </div>
    );
};

const DeveloperForm = ({ initialData, onSubmit }: { initialData: DeveloperProfile, onSubmit: (data: DeveloperProfile) => void }) => {
    const [formData, setFormData] = useState(initialData);

    return (
        <div className="text-left space-y-4 max-w-2xl mx-auto">
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Name</label>
                 <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
             </div>
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Bio</label>
                 <textarea className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none h-24"
                    value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
             </div>
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Role</label>
                 <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
             </div>
             <div>
                 <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Avatar URL</label>
                 <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                    value={formData.avatar_url} onChange={e => setFormData({...formData, avatar_url: e.target.value})} />
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Github URL</label>
                    <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.social_links?.github || ''} onChange={e => setFormData({...formData, social_links: {...formData.social_links, github: e.target.value}})} />
                 </div>
                 <div>
                    <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Twitter URL</label>
                    <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.social_links?.twitter || ''} onChange={e => setFormData({...formData, social_links: {...formData.social_links, twitter: e.target.value}})} />
                 </div>
                 <div>
                    <label className="text-xs text-[#ff6b44] font-bold uppercase mb-1 block">Website URL</label>
                    <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                        value={formData.social_links?.website || ''} onChange={e => setFormData({...formData, social_links: {...formData.social_links, website: e.target.value}})} />
                 </div>
             </div>

             <div className="flex justify-end pt-4">
                <button onClick={() => onSubmit(formData)} className="px-6 py-2 bg-[#ff6b44] hover:bg-[#ff5528] text-white rounded font-bold text-sm shadow-lg shadow-orange-500/20">
                    Save Profile
                </button>
            </div>
        </div>
    )
}

// --- Dashboard Layout ---

export default function Dashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<'apps' | 'softwares' | 'tutorials' | 'developer' | 'orders' | 'sellers' | 'settings' | 'requests' | 'anime'>('apps'); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const { homepageLayout, setHomepageLayout } = useSettings();
  
  // Data States
  const [apps, setApps] = useState<AppData[]>([]);
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [anime, setAnime] = useState<Anime[]>([]);
  const [selectedAnime, setSelectedAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [rj45Stock, setRj45Stock] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('adminPassword');
    if (saved) { setPassword(saved); setAuthenticated(true); }
  }, []);

  useEffect(() => {
    if (authenticated) {
        switch(activeTab) {
          case 'apps': fetchApps(); break;
          case 'softwares': fetchResources('softwares'); break;
          case 'tutorials': fetchResources('tutorials'); break;
          case 'developer': fetchDeveloper(); break;
          case 'orders': fetchOrders(); break;
          case 'sellers': fetchSellers(); break;
          case 'requests': fetchRequests(); break;
          case 'anime': fetchAnime(); break;
          case 'settings': fetchSettings(); break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
  }

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
      if (result.isConfirmed) {
          action();
      }
  };

  // API Call wrappers
  const fetchApps = async () => { 
      setLoading(true);
      const res = await fetch('/api/get-apps', {headers:{'x-admin-password':getPassword()}}); 
      if(res.ok) {
          const data = await res.json();
          setApps(data.map((a: AppData & { previous_versions: string | object }) => ({
              ...a, 
              previous_versions: typeof a.previous_versions === 'string' ? JSON.parse(a.previous_versions) : a.previous_versions
          })));
      } 
      setLoading(false);
  };
  const fetchResources = async (type: 'softwares' | 'tutorials') => { 
      setLoading(true);
      const res = await fetch(`/api/manage-resources?type=${type}`, {headers:{'x-admin-password':getPassword()}}); 
      if(res.ok) {
          if (type === 'softwares') setSoftwares(await res.json());
          else setTutorials(await res.json());
      }
      setLoading(false);
  };
  const fetchRequests = async () => {
      setLoading(true);
      const res = await fetch('/api/get-requests', {headers:{'x-admin-password':getPassword()}});
      if(res.ok) setRequests(await res.json());
      setLoading(false);
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
        const res = await fetch('/api/manage-developer', {headers:{'x-admin-password':getPassword()}}); 
        if(res.ok) {
            const data = await res.json();
            // If empty object returned, initialize with defaults so form renders
            if (Object.keys(data).length === 0) {
                 setDeveloper({ name: '', bio: '', role: '', avatar_url: '', social_links: {} });
            } else {
                 setDeveloper(data); 
            }
        } else {
            // Fallback for error (table missing etc) - allows retry or manual entry
             setDeveloper({ name: '', bio: '', role: '', avatar_url: '', social_links: {} });
        }
      } catch {
         setDeveloper({ name: '', bio: '', role: '', avatar_url: '', social_links: {} });
      } finally {
         setLoading(false);
      }
  };



  const fetchSettings = async () => {
       try {
           const res = await fetch('/api/get-settings');
           if (res.ok) {
               const data = await res.json();
               if (data.rj45_stock !== undefined) {
                   setRj45Stock(parseInt(data.rj45_stock, 10));
               }
           }
       } catch (err) {
           console.error('Failed to fetch settings', err);
       }
  };

  const fetchOrders = async (silent = false) => {
      if (!silent) setLoading(true);
      const res = await fetch('/api/manage-orders', {headers:{'x-admin-password':getPassword()}});
      if(res.ok) {
          const data = await res.json();
          setOrders(data);
      }
      if (!silent) setLoading(false);
  };

  const fetchSellers = async (silent = false) => {
      if (!silent) setLoading(true);
      const res = await fetch('/api/manage-sellers', {headers:{'x-admin-password':getPassword()}});
      if(res.ok) {
          const data = await res.json();
          setSellers(data);
      }
      if (!silent) setLoading(false);
  };

  const removeSeller = async (id: number) => {
      await apiAction('/api/manage-sellers', 'DELETE', { id }, () => fetchSellers(true), 'Seller Removed Successfully');
  };

  // Action Handlers
  const apiAction = async (url: string, method: string, body: unknown, onSuccess: () => void, successMessage: string = 'Operation Successful!', silentToast = false) => {
      try {
          const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json', 'x-admin-password': getPassword() },
              body: JSON.stringify(body)
          });
          
          if(res.ok) { 
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

  const handleEditStock = async () => {
        const { value: newStock } = await MySwal.fire({
            title: 'Edit RJ45 Stocks',
            input: 'number',
            inputLabel: 'Available Stocks (Current: ' + (rj45Stock !== null ? rj45Stock : 'Not Set') + ')',
            inputValue: rj45Stock?.toString() || '0',
            showCancelButton: true,
            confirmButtonColor: '#ff6b44',
            background: '#1a1a1a',
            color: '#fff',
            inputValidator: (value) => {
                if (!value || parseInt(value, 10) < 0) {
                    return 'Please enter a valid positive number';
                }
            }
        });

        if (newStock !== undefined) {
            await apiAction('/api/update-settings', 'POST', { key: 'rj45_stock', value: newStock.toString() }, fetchSettings, 'Stocks Updated!');
        }
  };




  const toggleAppVisibility = async (app: AppData) => {
      // Optimistic logic: flip state before API check
      const previousState = [...apps];
      setApps(apps.map((a: AppData) => a.id === app.id ? { ...a, is_hidden: !app.is_hidden } : a));

      // Fire API action silently so we do not freeze UI, but popup standard toasts
      const success = await apiAction('/api/manage-app', 'PUT', 
          { ...app, is_hidden: !app.is_hidden }, 
          () => {}, // Empty callback since we optimistic update
          app.is_hidden ? 'App is now visible!' : 'App hidden from public!'
      );

      // Rollback if DB failed
      if (!success) {
          setApps(previousState);
      }
  };

  // --- Modal Openers ---
  const openAppModal = (app: Partial<AppData> | null) => {
      MySwal.fire({
          title: '', padding: 0, showConfirmButton: false, background: 'transparent',
          html: (
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 shadow-2xl w-[85vw] md:w-full max-w-lg mx-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                       {app ? <Edit2 className="w-5 h-5 text-[#ff6b44]" /> : <Plus className="w-5 h-5 text-[#ff6b44]" />}
                       {app ? 'Edit Application' : 'New Application'}
                  </h3>
                  <AppForm initialData={app} onCancel={() => Swal.close()} onSubmit={data => apiAction('/api/manage-app', app?.id ? 'PUT' : 'POST', {...data, id: app?.id}, () => { fetchApps(); }, app?.id ? 'App Updated!' : 'App Created!')} />
              </div>
          )
      });
  };

  const openResourceModal = (type: 'softwares' | 'tutorials', item: Software | Tutorial | null) => {
       MySwal.fire({
          title: '', padding: 0, showConfirmButton: false, background: 'transparent',
          html: (
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 shadow-2xl w-[85vw] md:w-full max-w-lg mx-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2 capitalize">
                       {item ? <Edit2 className="w-5 h-5 text-[#ff6b44]" /> : <Plus className="w-5 h-5 text-[#ff6b44]" />}
                       {item ? `Edit ${type.slice(0, -1)}` : `New ${type.slice(0, -1)}`}
                  </h3>
                  {type === 'softwares' ? (
                      <SoftwareForm initialData={item} onCancel={() => Swal.close()} onSubmit={data => apiAction(`/api/manage-resources?type=softwares`, item?.id ? 'PUT' : 'POST', {...data, id: item?.id}, () => fetchResources('softwares'), 'Saved!')} />
                  ) : (
                      <TutorialForm initialData={item} onCancel={() => Swal.close()} onSubmit={data => apiAction(`/api/manage-resources?type=tutorials`, item?.id ? 'PUT' : 'POST', {...data, id: item?.id}, () => fetchResources('tutorials'), 'Saved!')} />
                  )}
              </div>
          )
      });
  }

  const openAnimeModal = (item: Partial<Anime> | null) => {
      MySwal.fire({
          title: '', padding: 0, showConfirmButton: false, background: 'transparent',
          html: (
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 shadow-2xl w-[85vw] md:w-full max-w-lg mx-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                       {item ? <Edit2 className="w-5 h-5 text-[#ff6b44]" /> : <Plus className="w-5 h-5 text-[#ff6b44]" />}
                       {item ? 'Edit Anime' : 'New Anime Title'}
                  </h3>
                  <AnimeForm initialData={item} onCancel={() => Swal.close()} onSubmit={data => apiAction('/api/manage-anime', item?.id ? 'PUT' : 'POST', {...data, id: item?.id}, fetchAnime, 'Anime Saved!')} />
              </div>
          )
      });
  };

  const openEpisodeModal = (animeId: number, item: Partial<Episode> | null) => {
      MySwal.fire({
          title: '', padding: 0, showConfirmButton: false, background: 'transparent',
          html: (
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 shadow-2xl w-[85vw] md:w-full max-w-lg mx-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                       {item ? <Edit2 className="w-5 h-5 text-[#ff6b44]" /> : <Plus className="w-5 h-5 text-[#ff6b44]" />}
                       {item ? 'Edit Episode' : 'Add New Episode'}
                  </h3>
                  <EpisodeForm animeId={animeId} initialData={item} onCancel={() => Swal.close()} onSubmit={data => apiAction('/api/manage-episode', item?.id ? 'PUT' : 'POST', {...data, id: item?.id, anime_id: animeId}, () => fetchEpisodes(animeId), 'Episode Saved!')} />
              </div>
          )
      });
  };

  const openSellerModal = () => {
       MySwal.fire({
          title: '', padding: 0, showConfirmButton: false, background: 'transparent',
          html: (
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 shadow-2xl w-[85vw] md:w-full max-w-lg mx-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                       <Store className="w-5 h-5 text-[#ff6b44]" /> Create New Vendor
                  </h3>
                  <SellerForm onCancel={() => Swal.close()} onSubmit={data => apiAction(`/api/manage-sellers`, 'POST', data, () => fetchSellers(true), 'Vendor Created Successfully!')} />
              </div>
          )
      });
  }


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
       )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-gray-200 flex relative overflow-hidden">
         {/* --- Mobile Backdrop --- */}
         {sidebarOpen && (
             <div onClick={() => setSidebarOpen(false)} className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
         )}

         {/* --- Sidebar --- */}
         <aside className={`fixed h-screen bg-[#1a1a1a] border-r border-white/5 transition-all duration-300 z-50 ${sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-20'} flex flex-col`}>
             <div className="p-6 flex items-center justify-between">
                 {sidebarOpen ? (
                     <div className="flex items-center gap-2">
                         <div className="relative w-8 h-8 flex-shrink-0">
                             <img src="/icon.png" alt="" className="absolute inset-0 w-full h-full blur-[6px] opacity-70 saturate-150 rounded-xl" />
                             <img src="/icon.png" alt="Logo" className="relative z-10 w-full h-full object-cover rounded-xl shadow-inner border border-white/10" />
                         </div>
                         <h1 className="text-xl font-black tracking-tighter text-white">GMZN<span className="text-[#ff6b44]">ADMIN</span></h1>
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

             <nav className="flex-1 px-4 space-y-2">
                 <button onClick={() => { setActiveTab('apps'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'apps' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                     <Smartphone className="w-5 h-5" />
                     <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>Applications</span>
                 </button>
                 <button onClick={() => { setActiveTab('softwares'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'softwares' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                     <Monitor className="w-5 h-5" />
                     <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>Softwares</span>
                 </button>
                 <button onClick={() => { setActiveTab('tutorials'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'tutorials' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                     <BookOpen className="w-5 h-5" />
                     <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>Tutorials</span>
                 </button>
                  <button onClick={() => { setActiveTab('developer'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'developer' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                     <Code className="w-5 h-5" />
                     <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>Developer</span>
                 </button>
                 <button onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'orders' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                     <ShoppingCart className="w-5 h-5" />
                     <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>RJ45 Orders</span>
                 </button>
                 <button onClick={() => { setActiveTab('sellers'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'sellers' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                     <Users className="w-5 h-5" />
                     <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>Sellers</span>
                 </button>
                 <button onClick={() => { setActiveTab('requests'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'requests' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                     <Inbox className="w-5 h-5" />
                     <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>App Requests</span>
                 </button>
                 <button onClick={() => { setActiveTab('anime'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'anime' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                     <Tv className="w-5 h-5" />
                     <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>Anime Manager</span>
                 </button>

                 <button onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'settings' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                     <Settings className="w-5 h-5" />
                     <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>Settings</span>
                 </button>

             </nav>

             <div className="p-4 border-t border-white/5">
                 <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                     <LogOut className="w-5 h-5" />
                     <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>Logout</span>
                 </button>
             </div>
         </aside>

         {/* --- Main Content --- */}
         <main className={`flex-1 p-4 lg:p-10 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} w-full`}>
             
             {/* Header */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
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
                     {activeTab !== 'developer' && activeTab !== 'orders' && activeTab !== 'requests' && (
                        <button onClick={() => {
                            if (activeTab === 'sellers') {
                                 MySwal.fire({
                                     title: 'Add New Seller',
                                     html: `
                                         <input id="swal-input1" class="swal2-input bg-slate-800 text-white border-white/10" placeholder="Username (e.g. mck_shop)">
                                         <input id="swal-input2" class="swal2-input bg-slate-800 text-white border-white/10" placeholder="Passkey (e.g. secret123)">
                                     `,
                                     background: '#0f172a',
                                     color: '#fff',
                                     confirmButtonColor: '#ff6b44',
                                     showCancelButton: true,
                                     preConfirm: () => {
                                         const username = (document.getElementById('swal-input1') as HTMLInputElement).value;
                                         const passkey = (document.getElementById('swal-input2') as HTMLInputElement).value;
                                         if (!username || !passkey) {
                                             MySwal.showValidationMessage('Please enter both username and passkey');
                                         }
                                         return { username, passkey };
                                     }
                                 }).then((result) => {
                                     if (result.isConfirmed) {
                                         apiAction('/api/manage-sellers', 'POST', result.value, fetchSellers, 'Seller Added');
                                     }
                                 });
                            } else {
                                activeTab === 'apps' ? openAppModal(null) : openResourceModal(activeTab as 'softwares' | 'tutorials', null)
                            }
                        }} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                            <Plus className="w-5 h-5" />
                            <span>Create New</span>
                        </button>
                     )}
                 </div>
             </div>

             {/* Content Area */}
             <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6 min-h-[600px]">
                 
                 {loading ? (
                     <div className="flex flex-col items-center justify-center min-h-[500px]">
                         <div className="loader-container min-h-[30vh]">
                             <div className="ld-rh3">
                                 <div></div>
                                 <div></div>
                             </div>
                         </div>
                     </div>
                 ) : (
                     <>
                 {/* APPS VIEW */}
                 {activeTab === 'apps' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {apps.map((app: AppData) => (
                             <div key={app.id} className={`group bg-[#0f0f0f] rounded-xl p-4 border transition-all ${app.is_hidden ? 'border-red-500/20 opacity-70' : 'border-white/5 hover:border-[#ff6b44]/50'}`}>
                                 <div className="flex items-start justify-between mb-4">
                                     <img src={app.icon_url} className={`w-14 h-14 rounded-xl bg-[#1a1a1a] object-cover shadow-lg ${app.is_hidden ? 'grayscale' : ''}`} />
                                     <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                         <button 
                                            onClick={() => toggleAppVisibility(app)} 
                                            className={`p-2 rounded transition-colors ${app.is_hidden ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'hover:bg-white/10 text-gray-400'}`}
                                            title={app.is_hidden ? "Show App" : "Hide App"}
                                         >
                                            {app.is_hidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                         </button>
                                         <button onClick={() => openAppModal(app)} className="p-2 hover:bg-white/10 rounded text-blue-400" title="Edit App"><Edit2 className="w-4 h-4" /></button>
                                         <button onClick={() => confirmDelete(() => apiAction('/api/manage-app', 'DELETE', {id:app.id}, fetchApps))} className="p-2 hover:bg-white/10 rounded text-red-400" title="Delete App"><Trash2 className="w-4 h-4" /></button>
                                     </div>
                                 </div>
                                 <h3 className="font-bold text-white text-lg mb-1 truncate flex items-center gap-2">
                                    {app.name} 
                                    {app.is_hidden && <span className="text-[10px] px-1.5 py-0.5 bg-red-500/10 text-red-500 rounded uppercase font-bold tracking-widest">Hidden</span>}
                                 </h3>
                                 <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                                     <span className="bg-white/5 px-2 py-0.5 rounded">{app.version}</span>
                                     <span>{app.size}</span>
                                 </div>
                                 <div className="flex flex-wrap gap-1">
                                     {app.tags?.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-[#ff6b44]/10 text-[#ff6b44] rounded uppercase font-bold">{t}</span>)}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}

                 {/* SOFTWARES VIEW */}
                 {activeTab === 'softwares' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {softwares.map((sw: Software) => (
                             <div key={sw.id} className="group bg-[#0f0f0f] rounded-xl p-4 border border-white/5 hover:border-[#ff6b44]/50 transition-all">
                                 <div className="flex items-start justify-between mb-4">
                                     <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg p-2 border border-white/5">
                                         <img src={sw.icon_url} className="w-full h-full object-contain" />
                                     </div>
                                     <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => openResourceModal('softwares', sw)} className="p-2 hover:bg-white/10 rounded text-blue-400"><Edit2 className="w-4 h-4" /></button>
                                         <button onClick={() => confirmDelete(() => apiAction('/api/manage-resources?type=softwares', 'DELETE', {id:sw.id}, () => fetchResources('softwares')))} className="p-2 hover:bg-white/10 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
                                     </div>
                                 </div>
                                 <h3 className="font-bold text-white text-lg mb-1 truncate">{sw.name}</h3>
                                 <p className="text-gray-500 text-xs line-clamp-2 mb-2">{sw.description}</p>
                                 <span className="text-[10px] px-1.5 py-0.5 bg-[#ff6b44]/10 text-[#ff6b44] rounded uppercase font-bold">{sw.category}</span>
                             </div>
                         ))}
                     </div>
                 )}

                 {/* TUTORIALS VIEW */}
                 {activeTab === 'tutorials' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {tutorials.map((tut: Tutorial) => (
                             <div key={tut.id} className="group bg-[#0f0f0f] rounded-xl p-4 border border-white/5 hover:border-[#ff6b44]/50 transition-all">
                                 <div className="relative aspect-video bg-[#1a1a1a] rounded-lg mb-4 overflow-hidden">
                                     <img src={tut.thumbnail_url} className="w-full h-full object-cover opacity-80" />
                                     <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => openResourceModal('tutorials', tut)} className="p-1.5 bg-black/60 hover:bg-black/80 rounded text-blue-400 backdrop-blur-sm"><Edit2 className="w-3 h-3" /></button>
                                          <button onClick={() => confirmDelete(() => apiAction('/api/manage-resources?type=tutorials', 'DELETE', {id:tut.id}, () => fetchResources('tutorials')))} className="p-1.5 bg-black/60 hover:bg-black/80 rounded text-red-400 backdrop-blur-sm"><Trash2 className="w-3 h-3" /></button>
                                     </div>
                                 </div>
                                 <h3 className="font-bold text-white text-base mb-1 truncate">{tut.title}</h3>
                                 <div className="flex items-center justify-between text-xs text-gray-500">
                                     <span>{tut.category}</span>
                                     <span>{tut.duration}</span>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}

                 {/* DEVELOPER VIEW */}
                  {activeTab === 'developer' && (
                     <div className="flex justify-center">
                         {developer && <DeveloperForm initialData={developer} onSubmit={data => apiAction('/api/manage-developer', 'POST', data, fetchDeveloper, 'Profile Updated!')} />}
                         {!developer && (
                             <div className="flex flex-col items-center gap-4">
                                 <button onClick={fetchDeveloper} className="text-xs text-[#ff6b44] hover:underline">Retry / Initialize</button>
                             </div>
                         )}
                     </div>
                 )}

                 {/* REQUESTS VIEW */}
                 {activeTab === 'requests' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {requests.length === 0 ? (
                              <div className="col-span-full p-8 text-center text-slate-500 bg-white/5 rounded-xl border border-white/10">
                                  No user requests found.
                              </div>
                          ) : (
                             requests.map((req) => (
                                 <div key={req.id} className={`group bg-[#0f0f0f] rounded-xl p-5 border ${req.status === 'completed' ? 'border-emerald-500/30 opacity-60' : 'border-white/5'} transition-all hover:border-[#ff6b44]/40 relative overflow-hidden`}>
                                     {req.status === 'completed' && <div className="absolute top-0 right-0 p-2 bg-emerald-500/10 text-emerald-500 rounded-bl-xl text-[10px] font-bold uppercase">Completed</div>}
                                     <div className="flex justify-between items-start mb-2">
                                         <h3 className="font-bold text-white text-lg pr-12 truncate" title={req.app_name}>{req.app_name}</h3>
                                     </div>
                                     <p className="text-gray-400 text-sm mb-4">By: <span className="font-semibold text-gray-300">{req.username || 'Anonymous'}</span></p>
                                     <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                         <span className="text-[10px] text-gray-500">{new Date(req.created_at).toLocaleDateString()}</span>
                                         <div className="flex gap-2">
                                             {req.status !== 'completed' && (
                                                <button onClick={() => apiAction('/api/manage-request', 'POST', {id: req.id, action: 'complete'}, fetchRequests)} className="p-1.5 hover:bg-emerald-500/10 rounded text-emerald-400" title="Mark Completed"><CheckCircle className="w-4 h-4" /></button>
                                             )}
                                             <button onClick={() => confirmDelete(() => apiAction('/api/manage-request', 'POST', {id: req.id, action: 'delete'}, fetchRequests))} className="p-1.5 hover:bg-red-500/10 rounded text-red-500" title="Delete Request"><Trash2 className="w-4 h-4" /></button>
                                         </div>
                                     </div>
                                 </div>
                             ))
                         )}
                     </div>
                 )}

                 {/* ANIME VIEW */}
                 {activeTab === 'anime' && (
                     <div className="space-y-8">
                         {!selectedAnime ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                 {anime.map(a => (
                                     <div key={a.id} className="group bg-[#0f0f0f] rounded-2xl overflow-hidden border border-white/5 hover:border-[#ff6b44]/40 transition-all flex flex-col">
                                         <div className="relative aspect-[16/9] overflow-hidden">
                                             <img src={a.cover_image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                             <div className="absolute bottom-3 left-3 flex gap-2">
                                                 <button onClick={() => openAnimeModal(a)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-blue-400 backdrop-blur-md transition-colors"><Edit2 className="w-4 h-4" /></button>
                                                 <button onClick={() => confirmDelete(() => apiAction('/api/manage-anime', 'DELETE', {id: a.id}, fetchAnime))} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-red-400 backdrop-blur-md transition-colors"><Trash2 className="w-4 h-4" /></button>
                                             </div>
                                         </div>
                                         <div className="p-4 flex-1 flex flex-col justify-between">
                                             <h3 className="font-bold text-white mb-2 line-clamp-1">{a.title}</h3>
                                             <button 
                                                 onClick={() => { setSelectedAnime(a); fetchEpisodes(a.id); }}
                                                 className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-[#ff6b44] text-gray-300 hover:text-white rounded-xl transition-all font-bold text-xs"
                                             >
                                                 <List className="w-4 h-4" /> Manage Episodes
                                             </button>
                                         </div>
                                     </div>
                                 ))}
                                 <button onClick={() => openAnimeModal(null)} className="aspect-[16/9] border-2 border-dashed border-white/5 hover:border-[#ff6b44]/40 rounded-2xl flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#ff6b44] transition-all">
                                     <Plus className="w-8 h-8" />
                                     <span className="font-bold text-xs uppercase tracking-widest">Add New Anime</span>
                                 </button>
                             </div>
                         ) : (
                             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                 <div className="flex items-center justify-between">
                                     <button onClick={() => setSelectedAnime(null)} className="flex items-center gap-2 text-gray-500 hover:text-white font-bold text-sm transition-colors">
                                         <ArrowLeft className="w-4 h-4" /> Back to Anime List
                                     </button>
                                     <button onClick={() => openEpisodeModal(selectedAnime.id, null)} className="flex items-center gap-2 px-4 py-2 bg-[#ff6b44] text-white font-bold rounded-xl hover:bg-[#ff5528] transition-colors shadow-lg shadow-orange-500/20">
                                         <Plus className="w-4 h-4" /> Add Episode
                                     </button>
                                 </div>
                                 
                                 <div className="bg-[#0f0f0f] border border-white/5 rounded-3xl p-6 flex gap-6 items-center">
                                     <img src={selectedAnime.cover_image} className="w-24 h-24 rounded-2xl object-cover" />
                                     <div>
                                         <h2 className="text-2xl font-black text-white">{selectedAnime.title}</h2>
                                         <p className="text-gray-500 text-sm max-w-xl line-clamp-2">{selectedAnime.description}</p>
                                     </div>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                     {episodes.map(ep => (
                                         <div key={ep.id} className="bg-[#0f0f0f] border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                                             <div className="flex items-center gap-4 overflow-hidden">
                                                 <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-black text-[#ff6b44] shrink-0">
                                                     {ep.episode_number}
                                                 </div>
                                                 <div className="overflow-hidden">
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
                                                 <button onClick={() => confirmDelete(() => apiAction('/api/manage-episode', 'DELETE', {id: ep.id}, () => fetchEpisodes(selectedAnime.id)))} className="p-2 hover:bg-white/5 rounded-lg text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                             </div>
                                         </div>
                                     ))}
                                     {episodes.length === 0 && (
                                         <div className="col-span-full py-12 text-center text-gray-500 bg-white/5 rounded-3xl border border-dashed border-white/10 uppercase font-black tracking-widest text-xs">
                                             No episodes added yet
                                         </div>
                                     )}
                                 </div>
                             </div>
                         )}
                     </div>
                 )}

                 {/* ORDERS VIEW */}
                 {activeTab === 'orders' && (
                     <div className="space-y-6">
                         {/* Totals Summary */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-white/10">
                              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
                                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-500" />
                                  <p className="text-sm text-slate-400 font-medium mb-1">Total Pieces Ordered</p>
                                  <h3 className="text-3xl font-black text-white">{orders.reduce((acc, order) => acc + order.quantity, 0)} <span className="text-lg text-slate-500">pcs</span></h3>
                              </div>
                              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-lg">
                                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                                  <p className="text-sm text-slate-400 font-medium mb-1">Total Pending Payment</p>
                                  <h3 className="text-3xl font-black text-white">₱{orders.filter(o => !o.status).reduce((acc, order) => acc + order.quantity, 0) * 2}</h3>
                              </div>
                              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden group shadow-lg flex flex-col justify-between">
                                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                                  <div>
                                      <p className="text-sm text-slate-400 font-medium mb-1">Available Stocks</p>
                                      <h3 className="text-3xl font-black text-white">{rj45Stock !== null ? rj45Stock : '...'}</h3>
                                  </div>
                                  <button onClick={handleEditStock} className="mt-4 px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-sm font-bold self-start transition-colors border border-orange-500/20">
                                      Edit Stocks
                                  </button>
                              </div>
                         </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {orders.length === 0 ? (
                            <div className="col-span-full p-8 text-center text-slate-500 bg-white/5 rounded-xl border border-white/10">
                                No orders found.
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div key={order.id} className={`bg-slate-900 border ${order.status ? 'border-emerald-500/30 opacity-70' : 'border-white/10'} rounded-2xl p-6 relative overflow-hidden group shadow-lg transition-all`}>
                                    {/* Accent line */}
                                    <div className={`absolute top-0 left-0 w-full h-1 ${order.status ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-sky-500'}`} />
                                    
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div>
                                            <p className="text-xs text-slate-400 font-medium mb-1">
                                                {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                            <h3 className="text-lg font-bold text-white truncate pr-4" title={order.name}>
                                                {order.name}
                                            </h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => apiAction('/api/manage-orders', 'PUT', {id: order.id, status: !order.status}, () => fetchOrders(true), '', true)} className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-colors shadow-sm ${order.status ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400'}`} title={order.status ? "Mark as Pending" : "Mark as Received"}>
                                                <CheckCircle className={`w-4 h-4 transition-transform ${order.status ? 'scale-100 opacity-100' : 'opacity-50'}`} />
                                            </button>
                                            <button 
                                                onClick={() => confirmDelete(() => apiAction('/api/manage-orders', 'DELETE', {id: order.id}, fetchOrders, 'Order Deleted'))} 
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors shadow-sm"
                                                title="Delete Order"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-end justify-between mt-6 relative z-10">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Quantity / Payment</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-indigo-400 leading-none">{order.quantity}</span>
                                                <span className="text-sm font-semibold text-indigo-500/50">pcs</span>
                                                <span className="text-xl font-bold text-emerald-400 ml-2">₱{order.quantity * 2}</span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                                            <ShoppingCart className="w-5 h-5 text-indigo-400" />
                                        </div>
                                    </div>
                                    
                                    {/* Subtle background glow */}
                                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-indigo-500/5 rounded-full blur-[30px] group-hover:bg-indigo-500/10 transition-colors pointer-events-none" />
                                </div>
                            ))
                        )}
                     </div>
                     </div>
                 )}

                 {/* SELLERS VIEW */}
                 {activeTab === 'sellers' && (
                     <div className="space-y-6">
                         <div className="flex justify-between items-center bg-[#1a1a1a] p-6 rounded-3xl border border-white/5">
                             <div>
                                 <h2 className="text-xl font-black text-white mb-2">Manage Sellers</h2>
                                 <p className="text-sm text-gray-500">Create vendor accounts that can list products on the marketplace.</p>
                             </div>
                             <div className="flex gap-6 items-center">
                                 <div className="font-bold flex flex-col items-end">
                                     <span className="text-2xl text-emerald-400 leading-none">{sellers.length}</span>
                                     <span className="text-[10px] text-gray-500 uppercase tracking-widest">Active Vendors</span>
                                 </div>
                                 <button onClick={openSellerModal} className="px-6 py-3 bg-gradient-to-r from-[#ff6b44] to-[#ff5528] text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 hover:scale-105 transition-transform flex items-center gap-2">
                                     <Plus className="w-4 h-4" /> Add Vendor
                                 </button>
                             </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             {sellers.length === 0 ? (
                                 <div className="col-span-full py-16 text-center text-gray-500 bg-[#1a1a1a] rounded-3xl border border-white/5">
                                     No seller accounts registered yet.
                                 </div>
                             ) : (
                                 sellers.map(seller => (
                                     <div key={seller.id} className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-[#ff6b44]/30 transition-all shadow-lg flex flex-col justify-between min-h-[160px]">
                                         <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6b44]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#ff6b44]/15 transition-colors" />
                                         
                                         <div>
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 mb-4 shadow-inner">
                                                <Store className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <h3 className="font-black text-white text-lg truncate relative z-10" title={seller.username}>{seller.username}</h3>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Vendor ID: #{seller.id}</p>
                                         </div>
                                         
                                         <div className="mt-6 flex justify-end relative z-10">
                                            <button 
                                                onClick={() => confirmDelete(() => removeSeller(seller.id))}
                                                className="w-10 h-10 flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors shrink-0"
                                                title="Revoke Seller Access"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                         </div>
                                     </div>
                                 ))
                             )}
                         </div>
                     </div>
                 )}

                 {/* SETTINGS VIEW */}
                 {activeTab === 'settings' && (
                     <div className="space-y-6 max-w-2xl">
                         <div className="bg-[#1a1a1a] border border-white/5 rounded-3xl p-6 relative overflow-hidden shadow-lg">
                              <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2"><Settings className="w-5 h-5 text-[#ff6b44]" /> Site Settings</h2>
                              <p className="text-sm text-gray-500 mb-8">Manage global application configurations and options.</p>

                              <div className="space-y-6">
                                  {/* Homepage Layout Toggle */}
                                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                                      <div>
                                          <p className="text-white font-bold text-sm">Default Homepage</p>
                                          <p className="text-xs text-gray-400">Which view loads on the main '/' route.</p>
                                      </div>
                                      <div className="flex bg-[#0f0f0f] border border-white/10 rounded-lg p-1">
                                          <button 
                                              onClick={() => {
                                                  apiAction('/api/update-settings', 'POST', { key: 'homepage_layout', value: 'apps' }, () => setHomepageLayout('apps'), 'Homepage updated to Apps');
                                              }}
                                              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${homepageLayout === 'apps' ? 'bg-[#ff6b44] text-white' : 'text-gray-500 hover:text-white'}`}
                                          >
                                              Apps Center
                                          </button>
                                          <button 
                                              onClick={() => {
                                                  apiAction('/api/update-settings', 'POST', { key: 'homepage_layout', value: 'store' }, () => setHomepageLayout('store'), 'Homepage updated to Store');
                                              }}
                                              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${homepageLayout === 'store' ? 'bg-[#ff6b44] text-white' : 'text-gray-500 hover:text-white'}`}
                                          >
                                              Partner Store
                                          </button>
                                          <button 
                                              onClick={() => {
                                                  apiAction('/api/update-settings', 'POST', { key: 'homepage_layout', value: 'anime' }, () => setHomepageLayout('anime'), 'Homepage updated to Anime');
                                              }}
                                              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${homepageLayout === 'anime' ? 'bg-[#ff6b44] text-white' : 'text-gray-500 hover:text-white'}`}
                                          >
                                              Anime Section
                                          </button>
                                      </div>
                                  </div>

                                  {/* RJ45 Stocks */}
                                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                                      <div>
                                          <p className="text-white font-bold text-sm">RJ45 Connector Stocks</p>
                                          <p className="text-xs text-gray-400">Current active stock: {rj45Stock !== null ? rj45Stock : '...'}</p>
                                      </div>
                                      <button onClick={handleEditStock} className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 rounded-lg text-xs font-bold transition-colors border border-orange-500/20">
                                          Edit Stocks
                                      </button>
                                  </div>
                              </div>
                         </div>
                     </div>
                 )}
                     </>
                 )}
            </div>
         </main>
    </div>
  );
}
