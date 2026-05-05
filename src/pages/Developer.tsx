
import { useState, useEffect } from 'react';
import { Github, Twitter, Globe, Code, Terminal, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Developer() {
  const [profile, setProfile] = useState<{name?: string, bio?: string, role?: string, avatar_url?: string, social_links?: {github?: string, twitter?: string, website?: string}} | null>(null);

  useEffect(() => {
    fetch('/api/manage-developer')
        .then(res => res.json())
        .then(data => setProfile(data))
        .catch(err => console.error(err));
  }, []);

  if (!profile) return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="loader-container min-h-[50vh]">
            <div className="ld-rh3">
                <div></div>
                <div></div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="max-w-4xl w-full">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1a1a1a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden">
                
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b44]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#ff6b44] to-purple-600 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity" />
                        <img 
                            src={profile.avatar_url || 'https://via.placeholder.com/150'} 
                            alt={profile.name} 
                            className="relative w-40 h-40 md:w-56 md:h-56 rounded-full object-cover border-4 border-[#1a1a1a] shadow-2xl" 
                        />
                         <div className="absolute bottom-2 right-2 bg-[#1a1a1a] p-2 rounded-full border border-white/10 text-green-400 shadow-xl">
                            <Terminal className="w-5 h-5" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#ff6b44] text-xs font-bold uppercase tracking-wider mb-4">
                            <Code className="w-3 h-3" /> {profile.role || 'Developer'}
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
                            {profile.name}
                        </h1>
                        
                        <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-xl mx-auto md:mx-0">
                            {profile.bio || 'Building things for the web.'}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            {profile.social_links?.github && (
                                <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-white text-white hover:text-black rounded-xl transition-all hover:-translate-y-1">
                                    <Github className="w-5 h-5" />
                                </a>
                            )}
                            {profile.social_links?.twitter && (
                                <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-[#1DA1F2] text-white rounded-xl transition-all hover:-translate-y-1">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            )}
                            {profile.social_links?.website && (
                                <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-[#ff6b44] text-white rounded-xl transition-all hover:-translate-y-1">
                                    <Globe className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tech Stack Decor / Info */}
                <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap justify-center md:justify-start gap-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                     <span className="flex items-center gap-2 text-xs font-bold text-white uppercase"><Cpu className="w-4 h-4" /> Tech Architecture</span>
                     {/* Add icons or text for tech stack if desired */}
                </div>

            </motion.div>
        </div>
    </div>
  );
}
