import { Link } from "react-router-dom";
import {
  Coins,
  Clock,
  ArrowRightLeft,
  Sparkles,
  Swords,
} from "lucide-react";
import { useUserDashboard } from "../../context/UserDashboardContext";

export default function UserOverviewPage() {
  const { username, availableHours, credits, wcoin, mainCharacter } = useUserDashboard();

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent p-6 sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5" /> Player Dashboard
            </div>
            <h1 className="font-display mt-2 text-2xl font-black text-white sm:text-3xl">
              ยินดีต้อนรับ, <span className="text-gradient-gold">@{username}</span>
            </h1>
            <p className="mt-1 text-xs text-slate-300">
              บัญชีผู้เล่น eGiS-MU Season 6 Episode 3 • ตัวละครหลัก: <strong>{mainCharacter}</strong> (Blade Master Lv.400)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/user/exchange"
              className="btn-shine flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffb52e] to-[#ff8a3c] px-5 py-3 text-xs font-extrabold text-[#090d16] shadow-lg shadow-amber-500/25 transition hover:brightness-110"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span>ไปที่หน้าแลกเครดิต (Redeem)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-emerald-400/20 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">ชั่วโมงออนไลน์สะสม</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-display mt-2 text-3xl font-black text-emerald-400">{availableHours} ชม.</div>
          <div className="mt-1 text-[11px] text-slate-400">แลกได้ {availableHours * 5} Credits</div>
        </div>

        <div className="rounded-3xl border border-amber-400/20 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">เครดิตปัจจุบัน</span>
            <Coins className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-display mt-2 text-3xl font-black text-amber-300">{credits.toLocaleString()} Cr</div>
          <div className="mt-1 text-[11px] text-slate-400">อัตรา 100 Credits = 50 WCoin</div>
        </div>

        <div className="rounded-3xl border border-purple-400/20 bg-white/[0.02] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">WCoin คงเหลือ</span>
            <Sparkles className="h-4 w-4 text-purple-400" />
          </div>
          <div className="font-display mt-2 text-3xl font-black text-purple-300">{wcoin.toLocaleString()} WC</div>
          <div className="mt-1 text-[11px] text-slate-400">ซื้อไอเทมใน Cash Shop</div>
        </div>
      </div>

      {/* Character Profile Snapshot */}
      <div className="rounded-3xl border border-white/10 bg-[#090d18]/70 p-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Swords className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white">ข้อมูลตัวละครในไอดี</h2>
              <p className="text-xs text-slate-400">เชื่อมต่อกับ OpenMU S6E3 Database</p>
            </div>
          </div>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
            สถานะปกติ (Active)
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-slate-400 text-[11px]">ชื่อตัวละคร</span>
            <div className="font-bold text-white font-mono mt-0.5">{mainCharacter}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-slate-400 text-[11px]">อาชีพ</span>
            <div className="font-bold text-amber-300 mt-0.5">Blade Master (3rd)</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-slate-400 text-[11px]">เลเวล & รีเซ็ต</span>
            <div className="font-bold text-emerald-400 font-mono mt-0.5">Lv.400 (18 Resets)</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <span className="text-slate-400 text-[11px]">กิลด์สังกัด</span>
            <div className="font-bold text-purple-300 font-mono mt-0.5">VENDETTA</div>
          </div>
        </div>
      </div>
    </div>
  );
}
