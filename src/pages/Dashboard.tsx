
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Upload, LayoutDashboard, 
  Smartphone, Monitor, BookOpen, Code, X, Menu,
  LogOut, Award, ExternalLink, Copy, Check
} from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

// --- Interfaces ---

interface CredlySubmission {
  id: number;
  name: string;
  badges: { title: string; url: string; }[];
  created_at: string;
}

interface AppData {
  id: number;
  name: string;
  version: string;
  size: string;
  category: string;
  download_url: string;
  icon_url?: string;
  tags?: string[];
  previous_versions?: { version: string; download_url: string; }[];
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

const AppForm = ({ initialData, onSubmit, onCancel }: { initialData: Partial<AppData> | null, onSubmit: (data: any) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<AppData>>(initialData || {
        name: '', version: '', size: '', category: 'Tools', download_url: '', icon_url: '', tags: []
    });

    const categories = ['Tools', 'Streaming', 'Games', 'Music', 'Productivity'];
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

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                <button onClick={() => onSubmit(formData)} className="px-6 py-2 bg-[#ff6b44] hover:bg-[#ff5528] text-white rounded font-bold text-sm shadow-lg shadow-orange-500/20">
                    Save
                </button>
            </div>
        </div>
    );
};

const SoftwareForm = ({ initialData, onSubmit, onCancel }: { initialData: Partial<Software> | null, onSubmit: (data: any) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '', description: '', icon_url: '', download_url: '', category: 'Utility'
    });

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
                 <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                    value={formData.icon_url} onChange={e => setFormData({...formData, icon_url: e.target.value})} />
             </div>
             <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                <button onClick={() => onSubmit(formData)} className="px-6 py-2 bg-[#ff6b44] hover:bg-[#ff5528] text-white rounded font-bold text-sm">Save</button>
            </div>
        </div>
    )
}

const TutorialForm = ({ initialData, onSubmit, onCancel }: { initialData: Partial<Tutorial> | null, onSubmit: (data: any) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState(initialData || {
        title: '', description: '', thumbnail_url: '', video_url: '', category: 'General', duration: '10:00'
    });

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
                 <input className="w-full bg-[#0f0f0f] border border-white/10 rounded p-2 text-white focus:border-[#ff6b44] outline-none"
                    value={formData.thumbnail_url} onChange={e => setFormData({...formData, thumbnail_url: e.target.value})} />
             </div>
             <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={onCancel} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
                <button onClick={() => onSubmit(formData)} className="px-6 py-2 bg-[#ff6b44] hover:bg-[#ff5528] text-white rounded font-bold text-sm">Save</button>
            </div>
        </div>
    )
}

const DeveloperForm = ({ initialData, onSubmit }: { initialData: DeveloperProfile, onSubmit: (data: any) => void }) => {
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
  const [activeTab, setActiveTab] = useState<'apps' | 'softwares' | 'tutorials' | 'developer' | 'submissions'>('submissions'); 
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Data States
  const [apps, setApps] = useState<AppData[]>([]);
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [credlySubmissions, setCredlySubmissions] = useState<CredlySubmission[]>([]);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('adminPassword');
    if (saved) { setPassword(saved); setAuthenticated(true); }
  }, []);

  useEffect(() => {
    if (authenticated) {
        if (activeTab === 'apps') fetchApps();
        if (activeTab === 'softwares') fetchResources('softwares');
        if (activeTab === 'tutorials') fetchResources('tutorials');
        if (activeTab === 'developer') fetchDeveloper();
        if (activeTab === 'submissions') fetchSubmissions();
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
  }

  const getPassword = () => localStorage.getItem('adminPassword') || '';

  // API Call wrappers
  const fetchApps = async () => { const res = await fetch('/api/get-apps', {headers:{'x-admin-password':getPassword()}}); if(res.ok) setApps(await res.json()); };
  const fetchResources = async (type: 'softwares' | 'tutorials') => { 
      const res = await fetch(`/api/manage-resources?type=${type}`, {headers:{'x-admin-password':getPassword()}}); 
      if(res.ok) {
          if (type === 'softwares') setSoftwares(await res.json());
          else setTutorials(await res.json());
      }
  };
  const fetchDeveloper = async () => { 
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
      } catch (e) {
         setDeveloper({ name: '', bio: '', role: '', avatar_url: '', social_links: {} });
      }
  };
  const fetchSubmissions = async () => { const res = await fetch('/api/manage-credly', {headers:{'x-admin-password':getPassword()}}); if(res.ok) setCredlySubmissions(await res.json()); };


  // Action Handlers
  const apiAction = async (url: string, method: string, body: any, onSuccess: () => void, successMessage: string = 'Operation Successful!') => {
      try {
          const res = await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json', 'x-admin-password': getPassword() },
              body: JSON.stringify(body)
          });
          
          if(res.ok) { 
              await MySwal.fire({
                  icon: 'success', title: 'Success!', text: successMessage, background: '#1a1a1a',
                  color: '#fff', confirmButtonColor: '#ff6b44', timer: 1500, timerProgressBar: true
              });
              onSuccess(); 
              return true; 
          }
          throw new Error('API Error');
      } catch (err) { 
          MySwal.fire({ icon: 'error', title: 'Action Failed', text: 'Something went wrong.', background: '#1a1a1a', color: '#fff', confirmButtonColor: '#d33' }); 
          return false; 
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
                  <AppForm initialData={app} onCancel={Swal.close} onSubmit={data => apiAction('/api/manage-app', app?.id ? 'PUT' : 'POST', {...data, id: app?.id}, () => { fetchApps(); }, app?.id ? 'App Updated!' : 'App Created!')} />
              </div>
          )
      });
  };

  const openResourceModal = (type: 'softwares' | 'tutorials', item: any | null) => {
       MySwal.fire({
          title: '', padding: 0, showConfirmButton: false, background: 'transparent',
          html: (
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 shadow-2xl w-[85vw] md:w-full max-w-lg mx-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
                  <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2 capitalize">
                       {item ? <Edit2 className="w-5 h-5 text-[#ff6b44]" /> : <Plus className="w-5 h-5 text-[#ff6b44]" />}
                       {item ? `Edit ${type.slice(0, -1)}` : `New ${type.slice(0, -1)}`}
                  </h3>
                  {type === 'softwares' ? (
                      <SoftwareForm initialData={item} onCancel={Swal.close} onSubmit={data => apiAction(`/api/manage-resources?type=softwares`, item?.id ? 'PUT' : 'POST', {...data, id: item?.id}, () => fetchResources('softwares'), 'Saved!')} />
                  ) : (
                      <TutorialForm initialData={item} onCancel={Swal.close} onSubmit={data => apiAction(`/api/manage-resources?type=tutorials`, item?.id ? 'PUT' : 'POST', {...data, id: item?.id}, () => fetchResources('tutorials'), 'Saved!')} />
                  )}
              </div>
          )
      });
  }

  const viewSubmission = (sub: CredlySubmission) => {
      const template = `
<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
      <th style="background-color: #f2f2f2;">Badge Title</th>
      <th style="background-color: #f2f2f2;">Badge URL</th>
    </tr>
  </thead>
  <tbody>
    ${sub.badges.map(b => `
    <tr>
      <td>${b.title}</td>
      <td><a href="${b.url}" target="_blank">${b.url}</a></td>
    </tr>
    `).join('')}
  </tbody>
</table>`;

      MySwal.fire({
          title: '', padding: 0, showConfirmButton: false, background: 'transparent',
          html: (
              <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 shadow-2xl w-[85vw] md:w-full max-w-2xl mx-auto max-h-[85vh] overflow-y-auto custom-scrollbar text-left">
                  <div className="flex justify-between items-center mb-6">
                      <div>
                          <h3 className="text-xl font-black text-white">{sub.name}</h3>
                          <p className="text-sm text-gray-500">{new Date(sub.created_at).toLocaleString()}</p>
                      </div>
                      <button onClick={Swal.close} className="p-2 hover:bg-white/10 rounded-full text-white"><X className="w-5 h-5"/></button>
                  </div>

                  <div className="space-y-4 mb-6">
                      {sub.badges.map((b, i) => (
                          <div key={i} className="bg-[#0f0f0f] p-3 rounded-lg border border-white/5 flex justify-between items-center">
                              <span className="font-bold text-white text-sm">{b.title}</span>
                              <a href={b.url} target="_blank" className="text-[#ff6b44] hover:underline text-xs flex items-center gap-1">
                                  Link <ExternalLink className="w-3 h-3"/>
                              </a>
                          </div>
                      ))}
                  </div>
                  
                  <div className="bg-[#0f0f0f] border border-white/5 rounded-lg p-3 relative group">
                      <pre className="text-[10px] text-gray-400 overflow-x-auto p-2 custom-scrollbar max-h-40">
                          {template}
                      </pre>
                      <button onClick={() => { navigator.clipboard.writeText(template); Swal.showValidationMessage('Copied!'); }} className="absolute top-2 right-2 p-1.5 bg-[#ff6b44] text-white rounded hover:bg-[#ff5528] opacity-0 group-hover:opacity-100 transition-opacity">
                          <Copy className="w-3 h-3" />
                      </button>
                  </div>
              </div>
          )
      });
  }


  if (!authenticated) {
       return (
           <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
               <div className="w-full max-w-sm bg-[#1a1a1a] p-8 rounded-2xl border border-white/5 shadow-2xl text-center">
                   <div className="w-16 h-16 bg-[#ff6b44] rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-orange-500/20">
                       <LayoutDashboard className="w-8 h-8 text-white" />
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
                     <h1 className="text-xl font-black tracking-tighter text-white">GMZN<span className="text-[#ff6b44]">ADMIN</span></h1>
                 ) : (
                     <span className="text-[#ff6b44] font-black text-xl mx-auto hidden lg:inline">G</span>
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
                  <button onClick={() => { setActiveTab('submissions'); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'submissions' ? 'bg-[#ff6b44] text-white shadow-lg shadow-orange-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                     <Award className="w-5 h-5" />
                     <span className={`font-bold text-sm ${!sidebarOpen && 'lg:hidden'}`}>Submissions</span>
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
                     {(activeTab !== 'developer' && activeTab !== 'submissions') && (
                        <button onClick={() => activeTab === 'apps' ? openAppModal(null) : openResourceModal(activeTab as any, null)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                            <Plus className="w-5 h-5" />
                            <span>Create New</span>
                        </button>
                     )}
                 </div>
             </div>

             {/* Content Area */}
             <div className="bg-[#1a1a1a] rounded-2xl border border-white/5 p-6 min-h-[600px]">
                 
                 {/* APPS VIEW */}
                 {activeTab === 'apps' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {apps.map((app: AppData) => (
                             <div key={app.id} className="group bg-[#0f0f0f] rounded-xl p-4 border border-white/5 hover:border-[#ff6b44]/50 transition-all">
                                 <div className="flex items-start justify-between mb-4">
                                     <img src={app.icon_url} className="w-14 h-14 rounded-xl bg-[#1a1a1a] object-cover shadow-lg" />
                                     <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => openAppModal(app)} className="p-2 hover:bg-white/10 rounded text-blue-400"><Edit2 className="w-4 h-4" /></button>
                                         <button onClick={() => apiAction('/api/manage-app', 'DELETE', {id:app.id}, fetchApps)} className="p-2 hover:bg-white/10 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
                                     </div>
                                 </div>
                                 <h3 className="font-bold text-white text-lg mb-1 truncate">{app.name}</h3>
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
                                         <button onClick={() => apiAction('/api/manage-resources?type=softwares', 'DELETE', {id:sw.id}, () => fetchResources('softwares'))} className="p-2 hover:bg-white/10 rounded text-red-400"><Trash2 className="w-4 h-4" /></button>
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
                                          <button onClick={() => apiAction('/api/manage-resources?type=tutorials', 'DELETE', {id:tut.id}, () => fetchResources('tutorials'))} className="p-1.5 bg-black/60 hover:bg-black/80 rounded text-red-400 backdrop-blur-sm"><Trash2 className="w-3 h-3" /></button>
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
                                 <p className="text-center text-gray-500">Loading profile data...</p>
                                 <button onClick={fetchDeveloper} className="text-xs text-[#ff6b44] hover:underline">Retry / Initialize</button>
                             </div>
                         )}
                     </div>
                 )}

                 {/* SUBMISSIONS VIEW */}
                 {activeTab === 'submissions' && (
                     <div className="space-y-4">
                         {credlySubmissions.map((sub: CredlySubmission) => (
                             <div key={sub.id} onClick={() => viewSubmission(sub)} className="group bg-[#0f0f0f] rounded-xl p-4 border border-white/5 hover:border-[#ff6b44]/50 transition-all cursor-pointer flex justify-between items-center">
                                 <div>
                                     <h3 className="font-bold text-white text-lg mb-1">{sub.name}</h3>
                                     <p className="text-xs text-gray-500">{new Date(sub.created_at).toLocaleString()}</p>
                                 </div>
                                 <div className="flex items-center gap-4">
                                     <span className="text-xs font-bold bg-white/5 px-3 py-1 rounded-full text-gray-400 group-hover:text-white transition-colors">{sub.badges.length} Badges</span>
                                     <Award className="w-5 h-5 text-gray-600 group-hover:text-[#ff6b44] transition-colors" />
                                 </div>
                             </div>
                         ))}
                         {credlySubmissions.length === 0 && (
                             <div className="text-center py-20 text-gray-500">No submissions yet.</div>
                         )}
                     </div>
                 )}

             </div>
         </main>
    </div>
  );
}
