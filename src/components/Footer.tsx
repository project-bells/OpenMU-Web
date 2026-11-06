export default function Footer({ onRegister }: { onRegister: () => void }) {
  return (
    <footer className="border-t border-white/10 bg-[#070a11]">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
        <div><p className="font-display text-lg font-black text-white">OPEN<span className="text-amber-400">MU</span></p><p className="mt-1 text-xs text-white/40">Community server powered by the open-source OpenMU project.</p></div>
        <div className="flex items-center gap-4 text-sm"><button onClick={onRegister} className="font-semibold text-amber-300">Create account</button><a href="#download" className="font-semibold text-white/70">Download</a><a href="https://github.com/MUnique/OpenMU" target="_blank" rel="noopener noreferrer" className="font-semibold text-white/70">OpenMU</a></div>
      </div>
    </footer>
  );
}
