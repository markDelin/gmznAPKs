export function Footer() {
  return (
    <footer className="py-8 border-t border-white/5 bg-[#0a0a0a] text-gray-500 text-sm text-center">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="flex items-center gap-2 font-medium tracking-wide">
            &copy; {new Date().getFullYear()} GMZN Anime. All rights reserved.
            <a href="/dashboard" className="opacity-0 w-2 h-2 cursor-default selection:bg-transparent text-[1px]" tabIndex={-1}>.</a>
        </p>
        <p className="font-medium tracking-wide">Made with ❤️ by <span className="text-[#ff6b44] font-bold">MCK</span></p>
      </div>
    </footer>
  );
}
