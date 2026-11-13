import { useState } from "react";
import { History, Coins, Clock, Gem, Wallet } from "lucide-react";
import { useUserDashboard } from "../../context/UserDashboardContext";

type TabType = "ledger" | "redemptions" | "exchanges" | "orders";

export default function UserHistoryPage() {
  const { ledger, redemptions, exchanges, orders } = useUserDashboard();
  const [tab, setTab] = useState<TabType>("ledger");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-black text-white">
            ประวัติการทำรายการทั้งหมด <span className="text-amber-400">(Audit Ledger)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            บันทึกธุรกรรมทั้งหมดจาก PostgreSQL (`web.wallet_ledger`, `online_time_redemptions`, `credit_exchanges`, `topup_orders`)
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "ledger" as const, label: `สมุดบัญชี (${ledger.length})`, icon: Coins },
            { id: "redemptions" as const, label: `เวลาออนไลน์ (${redemptions.length})`, icon: Clock },
            { id: "exchanges" as const, label: `แลก WCoinC (${exchanges.length})`, icon: Gem },
            { id: "orders" as const, label: `เติมเงิน (${orders.length})`, icon: Wallet },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  tab === item.id
                    ? "border-amber-400 bg-amber-400/20 text-amber-300"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#090d18]/75 shadow-xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.02] px-6 py-4">
          <History className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white">
            {tab === "ledger" && "สมุดบันทึกรายการ Credits (Immutable Wallet Ledger)"}
            {tab === "redemptions" && "ประวัติการแลกเวลาออนไลน์เป็น Credits"}
            {tab === "exchanges" && "ประวัติการแลก Credits เป็น WCoinC"}
            {tab === "orders" && "ประวัติคำสั่งซื้อเติมเงิน Top-Up"}
          </h2>
        </div>

        <div className="overflow-x-auto">
          {tab === "ledger" && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase text-slate-400">
                  <th className="px-5 py-3">เวลา</th>
                  <th className="px-5 py-3">ประเภท</th>
                  <th className="px-5 py-3">รายละเอียด</th>
                  <th className="px-5 py-3 text-right">จำนวน</th>
                  <th className="px-5 py-3 text-right">คงเหลือหลังทำรายการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ledger.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      ยังไม่มีประวัติรายการในสมุดบัญชี
                    </td>
                  </tr>
                ) : (
                  ledger.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.02]">
                      <td className="px-5 py-3 font-mono text-[11px] text-slate-300">
                        {new Date(row.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-5 py-3 font-mono text-[11px] text-sky-300">{row.entryType}</td>
                      <td className="px-5 py-3 text-slate-200">{row.description}</td>
                      <td
                        className={`px-5 py-3 text-right font-mono font-bold ${
                          row.amount >= 0 ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {row.amount >= 0 ? `+${row.amount.toLocaleString()}` : row.amount.toLocaleString()} Cr
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-amber-300">
                        {row.balanceAfter.toLocaleString()} Cr
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === "redemptions" && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase text-slate-400">
                  <th className="px-5 py-3">เวลา</th>
                  <th className="px-5 py-3 text-center">ชั่วโมงที่ใช้</th>
                  <th className="px-5 py-3 text-right">เครดิตที่ได้รับ</th>
                  <th className="px-5 py-3 text-right">Checkpoint สะสม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {redemptions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-500">
                      ยังไม่มีประวัติการแลกเวลาออนไลน์
                    </td>
                  </tr>
                ) : (
                  redemptions.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-3 font-mono text-[11px] text-slate-300">
                        {new Date(r.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-5 py-3 text-center font-mono text-emerald-300">{r.hoursRedeemed} ชม.</td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-amber-300">
                        +{r.creditsAwarded.toLocaleString()} Cr
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-slate-400">
                        {Math.floor(r.checkpointSecondsAfter / 3600)} ชม.
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === "exchanges" && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase text-slate-400">
                  <th className="px-5 py-3">เวลา</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3 text-right">Credits</th>
                  <th className="px-5 py-3 text-right">WCoinC</th>
                  <th className="px-5 py-3 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {exchanges.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      ยังไม่มีประวัติการแลก Credits เป็น WCoinC
                    </td>
                  </tr>
                ) : (
                  exchanges.map((ex) => (
                    <tr key={ex.id}>
                      <td className="px-5 py-3 font-mono text-[11px] text-slate-300">
                        {new Date(ex.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-5 py-3 font-mono text-[11px] text-slate-400">{ex.openmuReference}</td>
                      <td className="px-5 py-3 text-right font-mono text-amber-300">-{ex.creditsSpent} Cr</td>
                      <td className="px-5 py-3 text-right font-mono font-bold text-purple-300">+{ex.wcoinGranted} WC</td>
                      <td className="px-5 py-3 text-center font-mono text-emerald-300">{ex.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === "orders" && (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase text-slate-400">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">ช่องทาง</th>
                  <th className="px-5 py-3 text-right">ยอด THB</th>
                  <th className="px-5 py-3 text-right">Credits + WCoin</th>
                  <th className="px-5 py-3 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      ยังไม่มีประวัติการเติมเงิน
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="px-5 py-3 font-mono text-[11px] text-white">{ord.id}</td>
                      <td className="px-5 py-3 font-mono text-slate-300">{ord.provider}</td>
                      <td className="px-5 py-3 text-right font-mono text-white">฿{ord.amountThb.toLocaleString()}</td>
                      <td className="px-5 py-3 text-right font-mono text-amber-300">
                        +{ord.creditsToGrant.toLocaleString()} Cr / +{ord.wcoinToGrant.toLocaleString()} WC
                      </td>
                      <td className="px-5 py-3 text-center font-mono text-emerald-300">{ord.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
