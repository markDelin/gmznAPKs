export function Footer() {
  return (
    <footer className="py-8 border-t border-white/5 bg-slate-950 text-slate-400 text-sm text-center">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="flex items-center gap-2">
            &copy; {new Date().getFullYear()} GMZN APKs. All rights reserved.
            <a href="/dashboard" className="opacity-0 w-2 h-2 cursor-default selection:bg-transparent text-[1px]" tabIndex={-1}>.</a>
        </p>
        <p className="text-slate-500">Made with ❤️ by <span className="text-indigo-400 font-medium">MCK</span></p>
      </div>
    </footer>
  );
}
