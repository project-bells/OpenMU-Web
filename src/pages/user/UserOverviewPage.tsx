import { useState, FormEvent } from "react";
import {
  User,
  Coins,
  Clock,
  Sparkles,
  Swords,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  Skull,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { useUserDashboard } from "../../context/UserDashboardContext";
import {
  addStatsAction,
  changePasswordAction,
  clearPkAction,
  resetCharacterAction,
  resetStatsAction,
} from "../../services/dbApi";

export default function UserOverviewPage() {
  const {
    username,
    account,
    availableHours,
    credits,
    wcoin,
    pendingWcoin,
    mainCharacter,
    characters,
    refreshSummary,
  } = useUserDashboard();

  const [busyChar, setBusyChar] = useState<string | null>(null);
  const [charMsg, setCharMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const [addStatsTarget, setAddStatsTarget] = useState<string | null>(null);
  const [statsForm, setStatsForm] = useState({ str: 0, agi: 0, vit: 0, ene: 0, lead: 0 });

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [repeatPass, setRepeatPass] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const handleCharOp = async (charName: string, fn: () => Promise<{ success: boolean; message: string }>) => {
    setBusyChar(charName);
    setCharMsg(null);
    const res = await fn();
    setBusyChar(null);
    setCharMsg({ ok: res.success, text: res.message });
    if (res.success) {
      await refreshSummary();
    }
  };

  const handleAddStats = async (charName: string) => {
    await handleCharOp(charName, () => addStatsAction(charName, statsForm));
    setStatsForm({ str: 0, agi: 0, vit: 0, ene: 0, lead: 0 });
    setAddStatsTarget(null);
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg(null);
    const res = await changePasswordAction(oldPass, newPass, repeatPass);
    setPassLoading(false);
    setPassMsg({ ok: res.success, text: res.message });
    if (res.success) {
      setOldPass("");
      setNewPass("");
      setRepeatPass("");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-[#0d1323] via-[#090d18] to-[#070a13] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl font-black text-slate-950 shadow-lg shadow-amber-500/30">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-black text-white">@{username}</h1>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                    account?.state === "Normal"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-400/40"
                  }`}
                >
                  {account?.state || "Normal"}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    account?.isOnline
                      ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30"
                      : "bg-white/5 text-slate-400 border-white/10"
                  }`}
                >
                  {account?.isOnline ? "กำลังออนไลน์ในเกม" : "ออฟไลน์ (พร้อมจัดการตัวละคร)"}
                </span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <Swords className="h-3.5 w-3.5 text-amber-400" /> ตัวละครหลัก: {mainCharacter}
                </span>
                {account?.email && (
                  <>
                    <span>•</span>
                    <span>{account.email}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs">
              <div className="text-[10px] text-slate-400">ชั่วโมงพร้อมแลก</div>
              <div className="font-mono text-sm font-black text-emerald-300">{availableHours} ชม.</div>
            </div>
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs">
              <div className="text-[10px] text-amber-200/80">เครดิต</div>
              <div className="font-mono text-sm font-black text-amber-300">{credits.toLocaleString()} Cr</div>
            </div>
            <div className="rounded-xl border border-purple-400/30 bg-purple-400/10 px-3 py-2 text-xs">
              <div className="text-[10px] text-purple-200/80">WCoinC</div>
              <div className="font-mono text-sm font-black text-purple-300">
                {wcoin.toLocaleString()} WC
                {pendingWcoin > 0 ? ` (+${pendingWcoin})` : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-[#090d18]/80 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>สถานะความปลอดภัย</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-display mt-2 text-xl font-black text-emerald-400">
            {account?.state === "Normal" ? "Active & Verified" : account?.state}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">ตรวจสอบจากฐานข้อมูล OpenMU โดยตรง</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#090d18]/80 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>เวลาออนไลน์รอแลก</span>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="font-display mt-2 text-xl font-black text-white">{availableHours} ชั่วโมง</div>
          <div className="mt-1 text-[11px] text-slate-500">แลกได้ทันที {(availableHours * 5).toLocaleString()} เครดิต</div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#090d18]/80 p-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>กระเป๋าเงินรวม</span>
            <Coins className="h-4 w-4 text-amber-400" />
          </div>
          <div className="font-display mt-2 text-xl font-black text-amber-300">
            {credits.toLocaleString()} Cr / {wcoin.toLocaleString()} WC
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <Sparkles className="mr-1 inline h-3 w-3 text-purple-400" />
            อัตราแลก 100 Cr = 50 WCoinC
          </div>
        </div>
      </div>

      {/* Character Self-Service Section */}
      <div className="rounded-3xl border border-white/10 bg-[#090d18]/80 p-6 shadow-xl">
        <div className="flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-white">จัดการตัวละคร (Character Management)</h2>
            <p className="text-xs text-slate-400">
              ใช้กฎของเซิร์ฟเวอร์จริง (ต้องออกจากเกมก่อน Reset / PK Clear / Add Stats / Reset Stats)
            </p>
          </div>
          {account?.isOnline && (
            <span className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-1.5 text-xs font-bold text-amber-200">
              กรุณาออกจากเกมก่อนทำรายการจัดการตัวละคร
            </span>
          )}
        </div>

        {charMsg && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-2xl border p-3 text-xs font-bold ${
              charMsg.ok
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/15 text-rose-300"
            }`}
          >
            {charMsg.ok ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{charMsg.text}</span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {characters.length === 0 ? (
            <div className="col-span-full py-10 text-center text-xs text-slate-500">
              ยังไม่มีตัวละครในบัญชีนี้ กรุณาเข้าเกมเพื่อสร้างตัวละคร
            </div>
          ) : (
            characters.map((char) => {
              const isBusy = busyChar === char.name;
              const disabled = Boolean(account?.isOnline) || isBusy;
              return (
                <div key={char.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-amber-400" />
                        <span className="font-display text-base font-black text-white">{char.name}</span>
                        <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-amber-300">
                          {char.classShort}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span>Lv.{char.lvl}</span>
                        {char.masterlvl > 0 && <span>• ML.{char.masterlvl}</span>}
                        <span>• Resets: <strong className="text-white">{char.resets}</strong></span>
                        <span>• Free Pts: <strong className="text-emerald-300">{char.levelUpPoints}</strong></span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-300">
                      <MapPin className="h-3 w-3 text-amber-400" />
                      {char.mapName}
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-1.5 rounded-xl bg-black/30 p-2.5 text-center font-mono text-[11px]">
                    <div><div className="text-[9px] text-slate-500">STR</div><div className="text-white font-bold">{char.strength}</div></div>
                    <div><div className="text-[9px] text-slate-500">AGI</div><div className="text-white font-bold">{char.agility}</div></div>
                    <div><div className="text-[9px] text-slate-500">VIT</div><div className="text-white font-bold">{char.vitality}</div></div>
                    <div><div className="text-[9px] text-slate-500">ENE</div><div className="text-white font-bold">{char.energy}</div></div>
                    <div><div className="text-[9px] text-slate-500">CMD</div><div className="text-white font-bold">{char.leadership}</div></div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleCharOp(char.name, () => resetCharacterAction(char.name))}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/15 py-2 text-xs font-bold text-amber-200 hover:bg-amber-500/25 disabled:opacity-40"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reset Character
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleCharOp(char.name, () => clearPkAction(char.name))}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-400/30 bg-rose-500/15 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/25 disabled:opacity-40"
                    >
                      <Skull className="h-3.5 w-3.5" /> PK Clear ({char.pkLevel})
                    </button>
                    <button
                      type="button"
                      disabled={disabled || char.levelUpPoints <= 0}
                      onClick={() => setAddStatsTarget(addStatsTarget === char.name ? null : char.name)}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/15 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-40"
                    >
                      <PlusCircle className="h-3.5 w-3.5" /> Add Stats
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => handleCharOp(char.name, () => resetStatsAction(char.name))}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 disabled:opacity-40"
                    >
                      Reset Stats
                    </button>
                  </div>

                  {addStatsTarget === char.name && (
                    <div className="space-y-2 rounded-xl border border-emerald-400/30 bg-emerald-950/20 p-3">
                      <div className="text-[11px] font-bold text-emerald-300">
                        แจกพอยต์คงเหลือ: {char.levelUpPoints.toLocaleString()}
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {(["str", "agi", "vit", "ene", "lead"] as const).map((key) => (
                          <div key={key}>
                            <label className="block text-[9px] uppercase text-slate-400">{key}</label>
                            <input
                              type="number"
                              min={0}
                              value={statsForm[key] || ""}
                              onChange={(e) =>
                                setStatsForm((prev) => ({
                                  ...prev,
                                  [key]: Math.max(0, parseInt(e.target.value, 10) || 0),
                                }))
                              }
                              className="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-1 font-mono text-xs text-white"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleAddStats(char.name)}
                        className="w-full rounded-lg bg-emerald-400 py-1.5 text-xs font-extrabold text-slate-950"
                      >
                        ยืนยันแจกพอยต์
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Password Change Section */}
      <div className="rounded-3xl border border-white/10 bg-[#090d18]/80 p-6 shadow-xl">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <KeyRound className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">เปลี่ยนรหัสผ่านบัญชีเกม (ต้องออกจากเกมก่อน)</h2>
        </div>

        <form onSubmit={handlePasswordSubmit} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            type="password"
            required
            placeholder="รหัสผ่านปัจจุบัน"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
          <input
            type="password"
            required
            placeholder="รหัสผ่านใหม่ (6+ ตัวอักษร)"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <input
              type="password"
              required
              placeholder="ยืนยันรหัสผ่านใหม่"
              value={repeatPass}
              onChange={(e) => setRepeatPass(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={passLoading || Boolean(account?.isOnline)}
              className="shrink-0 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 disabled:opacity-40"
            >
              {passLoading ? "..." : "เปลี่ยนรหัส"}
            </button>
          </div>
        </form>

        {passMsg && (
          <div
            className={`mt-3 rounded-xl border p-2.5 text-xs font-bold ${
              passMsg.ok
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                : "border-rose-500/40 bg-rose-500/15 text-rose-300"
            }`}
          >
            {passMsg.text}
          </div>
        )}
      </div>
    </div>
  );
}
