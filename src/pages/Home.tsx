import React, { useState, useEffect } from 'react';
import { Copy, Check, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Badge {
  title: string;
  url: string;
}

export default function Home() {
  const [name, setName] = useState('');
  const [badges, setBadges] = useState<Badge[]>(Array(6).fill({ title: '', url: '' }));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check for cookie
    const match = document.cookie.match(new RegExp('(^| )user_name=([^;]+)'));
    if (match) setName(decodeURIComponent(match[2]));
  }, []);

  const handleBadgeChange = (index: number, field: keyof Badge, value: string) => {
    const newBadges = [...badges];
    newBadges[index] = { ...newBadges[index], [field]: value };
    setBadges(newBadges);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Filter out empty badges
    const validBadges = badges.filter(b => b.title.trim() && b.url.trim());

    try {
      // 1. Save to DB
      const res = await fetch('/api/manage-credly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, badges: validBadges })
      });

      if (!res.ok) throw new Error('Failed to submit');

      // 2. Set Cookie (1 year)
      document.cookie = `user_name=${encodeURIComponent(name)}; path=/; max-age=31536000`;

      // 3. Generate HTML Template
      const template = generateTemplate(validBadges);
      setGeneratedHtml(template);
      setSubmitted(true);

    } catch (error) {
      console.error(error);
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTemplate = (validBadges: Badge[]) => {
    return `
<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
      <th style="background-color: #f2f2f2;">Badge Title</th>
      <th style="background-color: #f2f2f2;">Badge URL</th>
    </tr>
  </thead>
  <tbody>
    ${validBadges.map(b => `
    <tr>
      <td>${b.title}</td>
      <td><a href="${b.url}" target="_blank">${b.url}</a></td>
    </tr>
    `).join('')}
  </tbody>
</table>
`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-3xl w-full shadow-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Ready to Copy!</h2>
            <p className="text-slate-400">Your badges have been saved and formatted.</p>
          </div>

          <div className="bg-[#0f0f0f] border border-white/10 rounded-xl p-4 mb-6 relative group">
            <pre className="text-xs text-slate-300 overflow-x-auto p-4 custom-scrollbar max-h-64">
              {generatedHtml}
            </pre>
            <button 
              onClick={copyToClipboard}
              className="absolute top-4 right-4 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex justify-center gap-4">
            <button 
              onClick={() => { setSubmitted(false); setGeneratedHtml(''); }}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
            >
              Create New
            </button>
             <button 
              onClick={copyToClipboard}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              {copied ? 'Copied!' : 'Copy Template Code'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Credly Badge <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Builder</span></h1>
          <p className="text-slate-400">Enter your badge details below to generate a formatted template.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8 shadow-2xl">
          
          <div className="mb-8">
            <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Full Name</label>
            <input 
              required
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none transition-all focus:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
              placeholder="e.g. Juan Dela Cruz"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between mb-2">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Badges (Title & Link)</label>
               <span className="text-[10px] text-slate-600">6 Slots Available</span>
            </div>
            
            {badges.map((badge, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-800/30 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-colors">
                <input 
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                  placeholder={`Badge Title #${idx + 1}`}
                  value={badge.title}
                  onChange={e => handleBadgeChange(idx, 'title', e.target.value)}
                />
                <input 
                  className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none placeholder:text-slate-600"
                  placeholder="https://www.credly.com/..."
                  value={badge.url}
                  onChange={e => handleBadgeChange(idx, 'url', e.target.value)}
                />
              </div>
            ))}
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || !name}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/40 hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="animate-spin w-5 h-5" /> Generating...</>
            ) : (
              <><Send className="w-5 h-5" /> Submit & Generate Template</>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
