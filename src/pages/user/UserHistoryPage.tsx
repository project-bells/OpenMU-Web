import { History, Clock, CheckCircle2, ArrowRightLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserDashboard } from "../../context/UserDashboardContext";

export default function UserHistoryPage() {
  const { history } = useUserDashboard();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
            <History className="h-3.5 w-3.5" /> ประวัติย้อนหลัง
          </div>
          <h1 className="font-display mt-2 text-2xl font-black text-white sm:text-3xl">
            ประวัติการแลกเครดิต (Exchange Logs)
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            บันทึกการแลกชั่วโมงออนไลน์เป็นเครดิตทั้งหมดของบัญชีนี้
          </p>
        </div>

        <Link
          to="/user/exchange"
          className="btn-shine flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:brightness-110"
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span>แลกเครดิตเพิ่ม</span>
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#090d18]/70 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">วันที่ / เวลา (DATE & TIME)</th>
                <th className="px-5 py-3.5 text-center">ชั่วโมงที่ใช้ (HOURS USED)</th>
                <th className="px-5 py-3.5 text-right">เครดิตที่ได้รับ (CREDITS EARNED)</th>
                <th className="px-5 py-3.5 text-center">สถานะ (STATUS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    ยังไม่มีประวัติการทำรายการ
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id} className="transition hover:bg-white/[0.02]">
                    <td className="px-5 py-3.5 font-mono text-slate-300">{item.timestamp}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-mono font-bold text-emerald-300">
                        <Clock className="h-3 w-3" />
                        {item.hoursUsed} ชม.
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-mono font-bold text-amber-300">
                      +{item.creditsReceived.toLocaleString()} Credits
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
