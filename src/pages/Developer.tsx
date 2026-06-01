import { useState, useEffect } from 'react';
import { Github, Twitter, Globe, Code, Terminal, Mail, MapPin, Star, ExternalLink, BookOpen, Trophy, Award, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
};

const skills = [
  { name: 'React', level: 95, color: '#61DAFB' },
  { name: 'TypeScript', level: 90, color: '#3178C6' },
  { name: 'Tailwind CSS', level: 92, color: '#06B6D4' },
  { name: 'Node.js', level: 85, color: '#339933' },
  { name: 'Supabase', level: 80, color: '#3ECF8E' },
  { name: 'PostgreSQL', level: 78, color: '#4169E1' },
];

const projects = [
  {
    title: 'GMZN Anime',
    description: 'Full-stack anime streaming platform with multi-server video support, admin dashboard, TMDB integration, and MyAnimeList import.',
    tech: ['React', 'TypeScript', 'Tailwind', 'Supabase', 'Netlify'],
    url: 'https://gmzn.dpdns.org',
  },
  {
    title: 'Episode Discovery Engine',
    description: 'Auto-discovers episodes from TMDB, resolves video sources via EzvidAPI, and fetches subtitles from OpenSubtitles.',
    tech: ['Netlify Functions', 'TMDB API', 'EzvidAPI', 'TypeScript'],
    url: null,
  },
  {
    title: 'Admin Dashboard',
    description: 'Full CRUD management for anime titles and episodes with batch operations, MyAnimeList import, and developer profile management.',
    tech: ['React', 'SweetAlert2', 'Netlify Functions', 'Supabase'],
    url: null,
  },
];

export default function Developer() {
  const [profile, setProfile] = useState<{
    name?: string;
    bio?: string;
    role?: string;
    avatar_url?: string;
    social_links?: { github?: string; twitter?: string; website?: string };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSkill, setActiveSkill] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/manage-developer')
      .then(res => res.json())
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#ff6b44] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Loading</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center bg-white/5 rounded-3xl border border-white/10 p-12 max-w-md">
        <Terminal className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 font-bold text-xl mb-2">No Profile Found</p>
        <p className="text-gray-600 text-sm">Visit the admin dashboard to create a developer profile.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff6b44]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <motion.div
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#ff6b44] text-[10px] font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" /> Developer
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
            {profile.name}
          </h1>

          <div className="flex items-center justify-center gap-4 text-gray-500 text-sm mb-6">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Remote</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="flex items-center gap-1.5"><Code className="w-3.5 h-3.5" /> {profile.role || 'Full-Stack Developer'}</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full" />
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Available</span>
          </div>

          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {profile.bio || 'Building things for the web.'}
          </p>

          <div className="flex items-center justify-center gap-3 mt-8">
            {profile.social_links?.github && (
              <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer"
                className="p-3.5 bg-white/5 hover:bg-white hover:text-black rounded-2xl border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1 group">
                <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            )}
            {profile.social_links?.twitter && (
              <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer"
                className="p-3.5 bg-white/5 hover:bg-[#1DA1F2] rounded-2xl border border-white/10 transition-all hover:-translate-y-1 group">
                <Twitter className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            )}
            {profile.social_links?.website && (
              <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer"
                className="p-3.5 bg-white/5 hover:bg-[#ff6b44] rounded-2xl border border-white/10 transition-all hover:-translate-y-1 group">
                <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </a>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-[#ff6b44] to-purple-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">About</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Who I Am</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-tr from-[#ff6b44] to-purple-600 rounded-3xl blur opacity-50 group-hover:opacity-80 transition-all duration-500" />
                <img
                  src={profile.avatar_url || 'https://via.placeholder.com/300'}
                  alt={profile.name}
                  className="relative w-full aspect-square rounded-3xl object-cover border-2 border-white/10 shadow-2xl"
                />
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-xl">
                  <Terminal className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Code, label: 'Lines of Code', value: '50k+', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                { icon: BookOpen, label: 'Projects', value: '10+', color: 'text-green-400', bg: 'bg-green-500/10' },
                { icon: Trophy, label: 'Experience', value: '3+ Years', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                { icon: Award, label: 'Stack Mastery', value: 'Full-Stack', color: 'text-[#ff6b44]', bg: 'bg-[#ff6b44]/10' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all hover:-translate-y-0.5"
                >
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-[#ff6b44] to-purple-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">Skills</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Tech Stack</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onMouseEnter={() => setActiveSkill(i)}
                onMouseLeave={() => setActiveSkill(null)}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all cursor-default"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-bold text-sm">{skill.name}</span>
                  <span className="text-xs font-black text-gray-500">{skill.level}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: activeSkill === i ? `${skill.level}%` : `${skill.level}%` }}
                    transition={{ duration: 1, ease: 'easeOut' as const }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${skill.color}, ${skill.color}88)` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-1 h-8 bg-gradient-to-b from-[#ff6b44] to-purple-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider">Projects</h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Featured Work</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="group bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:border-[#ff6b44]/30 transition-all hover:-translate-y-1 flex flex-col"
              >
                <div className="flex-1">
                  <div className="w-10 h-10 bg-[#ff6b44]/10 rounded-2xl flex items-center justify-center mb-4">
                    <Code className="w-5 h-5 text-[#ff6b44]" />
                  </div>
                  <h3 className="text-lg font-black text-white mb-2 group-hover:text-[#ff6b44] transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.tech.map(t => (
                      <span key={t} className="text-[9px] bg-white/5 text-gray-400 px-2 py-1 rounded-lg font-bold uppercase tracking-wider border border-white/5">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[#ff6b44] text-xs font-bold uppercase tracking-widest hover:gap-3 transition-all">
                    Visit Project <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden bg-gradient-to-br from-[#ff6b44]/10 to-purple-500/10 border border-white/10 rounded-3xl p-8 md:p-12 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b44]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <Star className="w-10 h-10 text-[#ff6b44] mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Let's Build Something</h2>
              <p className="text-gray-400 max-w-lg mx-auto mb-8">
                Interested in collaborating or have a project in mind? Let's connect.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {profile.social_links?.github && (
                  <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-white transition-all hover:-translate-y-0.5">
                    <Github className="w-5 h-5" /> GitHub
                  </a>
                )}
                {profile.social_links?.twitter && (
                  <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 border border-[#1DA1F2]/20 rounded-2xl text-sm font-bold text-white transition-all hover:-translate-y-0.5">
                    <Twitter className="w-5 h-5" /> Twitter
                  </a>
                )}
                {profile.social_links?.website && (
                  <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#ff6b44] to-[#ff5528] rounded-2xl text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5">
                    <Globe className="w-5 h-5" /> Website <ChevronRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
