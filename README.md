# GMZN Anime Portal

A modern, streaming-focused web platform for browsing, discovering, and watching anime. Built with React, TypeScript, and Tailwind CSS, powered by Supabase and deployed on Netlify.

## Features

### 🎬 Anime Catalog
- Browse an extensive collection of anime with cover images, ratings, genres, and status indicators
- Search by title or genre with real-time filtering
- Sort by latest, top-rated, or alphabetical order
- Skeleton loading states and image fallbacks

### 📄 Anime Info Pages
- Dedicated detail page for every anime with banner hero section
- Full description, genre tags, rating, episode count, and status
- **Watch Now** button as primary call-to-action
- Continue Watching progress bar
- Bookmark/save to list functionality
- Episode grid with watched indicators and season selector

### ▶️ Video Player
- Multi-server support (Sub, Dub, Tagalog audio tracks)
- Server 1 / Server 2 fallback for each audio mode
- Auto-detection and fetching of video sources via EzvidAPI
- Subtitle support (VTT) with auto-fetch from OpenSubtitles
- Inline subtitle rendering with time-synced display
- Episode navigation (prev/next), grid and list episode views
- Bookmark toggle, watch history tracking with localStorage
- Direct video (.mp4, .m3u8, .webm) and iframe embed support

### 🔐 Admin Dashboard
- Password-authenticated admin panel at `/dashboard`
- Full CRUD for anime titles (cover, banner, genres, rating, status)
- Episode management with batch add, quick next episode, and TMDB auto-discovery
- Episode form with Sub/Dub/Tagalog URLs, server mirrors, and subtitle VTT URLs
- **Import from MyAnimeList**: search and import anime with cover, synopsis, and metadata
- **TMDB Episode Discovery**: auto-create episodes from TMDB with EzvidAPI embed URLs
- Developer profile management with social links
- Statistics cards (total anime, episodes, avg rating, ongoing count)

### 👤 User Features
- Continue Watching section on homepage
- Bookmark / My List system
- Watch history persisted in localStorage
- Episode progress tracking across sessions

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Routing** | React Router v7 |
| **Styling** | Tailwind CSS v4, Framer Motion |
| **Icons** | Lucide React |
| **Backend** | Netlify Functions (TypeScript) |
| **Database** | Supabase (PostgreSQL) |
| **Hosting** | Netlify |
| **APIs** | Jikan (MyAnimeList), TMDB, OpenSubtitles, EzvidAPI |

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/markDelin/gmznAPKS.git
cd gmzn-anime

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://...
ADMIN_PASSWORD=your_admin_password

PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

TMDB_BEARER_TOKEN=your_tmdb_bearer_token
OPENSUBTITLES_API_KEY=your_opensubtitles_key
```

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
gmzn-anime/
├── netlify/
│   ├── functions/          # Netlify serverless functions (API)
│   │   ├── manage-anime.ts # CRUD for anime titles
│   │   ├── manage-episode.ts # CRUD for episodes
│   │   ├── get-anime.ts    # Fetch anime (single or list)
│   │   ├── get-episodes.ts # Fetch episodes by anime_id
│   │   ├── search-anime.ts # MyAnimeList search integration
│   │   ├── anime-embed.ts  # EzvidAPI video source resolution
│   │   ├── search-subtitles.ts # OpenSubtitles subtitle search
│   │   ├── tmdb-episodes.ts # TMDB episode auto-discovery
│   │   └── utils/
│   │       ├── db.ts       # Database connection
│   │       └── cors.ts     # CORS headers
│   └── toml
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx   # Top navigation bar
│   │   │   └── Footer.tsx   # Site footer
│   │   └── ScrollToTop.tsx  # Route scroll reset
│   ├── pages/
│   │   ├── Anime.tsx        # Homepage / catalog
│   │   ├── AnimeInfo.tsx    # Anime detail + info page
│   │   ├── WatchAnime.tsx   # Video player page
│   │   ├── Dashboard.tsx    # Admin management panel
│   │   ├── Developer.tsx    # Developer/credits page
│   │   └── Login.tsx        # User login page
│   ├── App.tsx              # Root component with routing
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles + Tailwind
├── public/                  # Static assets
├── index.html
├── netlify.toml             # Netlify deployment config
├── vite.config.ts
├── package.json
└── README.md
```

## API Endpoints

All API routes are served via Netlify Functions at `/api/*`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/get-anime` | GET | Fetch all anime or single by `?id=` |
| `/api/get-episodes` | GET | Fetch episodes by `?anime_id=` |
| `/api/manage-anime` | POST/PUT | Create or update anime |
| `/api/manage-episode` | POST/PUT | Create or update episode |
| `/api/search-anime` | GET | Search MyAnimeList by `?q=` |
| `/api/anime-embed` | GET | Resolve video source via EzvidAPI |
| `/api/search-subtitles` | GET | Search subtitles via OpenSubtitles |
| `/api/tmdb-episodes` | GET | Discover episodes from TMDB |

## Deployment

The project is configured for **Netlify** deployment:

1. Push to GitHub
2. Connect repository in Netlify
3. Set environment variables in Netlify dashboard
4. Deploy (auto-deploys on push to main branch)

The `netlify.toml` handles:
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- SPA redirect: all routes → `/index.html`

## License

&copy; 2026 GMZN Anime. All rights reserved.
