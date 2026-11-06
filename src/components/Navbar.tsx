import { Download, Menu, UserPlus, X } from "lucide-react";
import { useState } from "react";

export default function Navbar({ onRegister }: { onRegister: () => void }) {
  const [open, setOpen] = useState(false);
  const links = [["Status", "#status"], ["Classes", "#classes"], ["Register", "#register"], ["Download", "#download"]];
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#090d16]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6" aria-label="Main navigation">
        <a href="#top" className="font-display text-xl font-black text-white">OPEN<span className="text-amber-400">MU</span></a>
        <div className="hidden items-center gap-7 md:flex">{links.map(([label, href]) => <a key={href} href={href} className="text-sm font-semibold text-white/70 hover:text-amber-300">{label}</a>)}</div>
        <div className="hidden gap-2 md:flex"><a href="#download" className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-white" aria-label="Download"><Download className="h-4 w-4" /></a><button onClick={onRegister} className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-extrabold text-black"><UserPlus className="h-4 w-4" /> Create account</button></div>
        <button onClick={() => setOpen(!open)} className="grid h-10 w-10 place-items-center text-white md:hidden" aria-expanded={open} aria-label="Toggle menu">{open ? <X /> : <Menu />}</button>
      </nav>
      {open && <div className="border-t border-white/10 bg-[#090d16] px-4 py-4 md:hidden">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-white/5 py-3 font-semibold text-white/80">{label}</a>)}<button onClick={() => { setOpen(false); onRegister(); }} className="mt-4 w-full rounded-lg bg-amber-400 px-4 py-3 font-extrabold text-black">Create account</button></div>}
    </header>
  );
}
