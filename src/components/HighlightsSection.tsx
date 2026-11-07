import { Swords, Coins, Trophy, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useI18n } from "../i18n";

export default function HighlightsSection() {
  const { lang } = useI18n();

  const highlights = [
    {
      step: "01",
      badge: lang === "th" ? "เรท S6E3 แท้ดั้งเดิม" : "Pure S6E3 Rates",
      title: lang === "th" ? "ระบบคลาสสิก Season 6 Ep 3" : "Authentic Season 6 Episode 3 Formula",
      subtitle: lang === "th" ? "EXP 50x • ดร็อป Ex 30% • สมดุลแท้" : "50x EXP • 30% Excellent Drop • Original Balance",
      description: lang === "th"
        ? "ปรับแต่งตามสูตรดั้งเดิม เล่นสนุก จบงานไว เหมาะกับคนวัยทำงาน ทุกการรีเซ็ต อัญมณี และ Master Skill Tree มีค่าเสมอ ไร้ปีกแฟนซี +50,000 สเตตัส มั่นคงยาวนาน"
        : "Tuned faithfully to the classic GMO formula. Fast enough to respect your adult schedule, yet deep enough that every reset, jewel, and Master Skill Tree upgrade feels genuinely earned. Pure nostalgia, refined for competitive longevity.",
      points: lang === "th"
        ? [
            "รีเซ็ตเลเวล 400 คงสเตตัสตามแบบฉบับ S6",
            "ตารางดร็อปไอเทม Kanturu, Raklion และ Vulcanus แท้",
            "7 สายอาชีพดั้งเดิม สมดุลดาเมจและระบบ Combo ชัดเจน",
          ]
        : [
            "Reset at Level 400 with stat retention",
            "Classic drop tables for Kanturu, Raklion & Vulcanus",
            "Original 7 classes with verified duel formulas",
          ],
      icon: Swords,
      glow: "from-amber-500/20 to-orange-500/5",
      accent: "text-amber-300",
      border: "border-amber-400/30",
    },
    {
      step: "02",
      badge: lang === "th" ? "ออนไลน์รับเครดิตฟรี" : "Play-to-Earn Rewards",
      title: lang === "th" ? "ออนไลน์แลกเครดิต & แลก WCoin" : "Online Hours → Credits → WCoins",
      subtitle: lang === "th" ? "1 ชม. = 10 Credits • 100 Credits แลก 50 WCoin" : "1 Hr = 10 Credits • 100 Credits = 50 WCoin",
      description: lang === "th"
        ? "สายฟรีอยู่สบายด้วยระบบ Play-to-Earn เพียงเปิดเกมออนไลน์ไว้ รับทันที 10 Credits ทุกๆ 60 นาที สะสมนำไปแลกเป็น WCoin เพื่อซื้อไอเทมใน Web Shop และ Cash Shop ได้ 100% โดยไม่ต้องเติมเงินจริง"
        : "Free-to-play friendly! Simply stay logged in-game to earn 10 Credits per hour automatically. Convert 100 Credits into 50 WCoin directly on our portal to spend in Cash Shop & Web Shop.",
      points: lang === "th"
        ? [
            "ระบบนับเวลาออนไลน์อัตโนมัติ (Online Check-In) 1 ชม. = 10 Credits",
            "อัตราแลกเปลี่ยนคงที่ 100 Credits แลกได้ 50 WCoin ทันที",
            "นำ WCoin ไปช้อปปิ้งที่ Web Shop (webshop.muorigins.online) ได้จริง",
          ]
        : [
            "Automatic online hour check-in: 1 hour online = 10 Credits",
            "Guaranteed conversion: 100 Credits = 50 WCoins directly",
            "Spend your earned WCoins at Web Shop (webshop.muorigins.online)",
          ],
      icon: Coins,
      glow: "from-purple-500/20 to-violet-500/5",
      accent: "text-purple-300",
      border: "border-purple-400/30",
    },
    {
      step: "03",
      badge: lang === "th" ? "ศึกชิงปราสาทแห่งศักดิ์ศรี" : "Guild Glory",
      title: lang === "th" ? "Castle Siege ทุกวันอาทิตย์" : "Legendary Weekly Castle Siege",
      subtitle: lang === "th" ? "ทุกวันอาทิตย์ 20:00 UTC+7 • วอร์เดือด 300+ คน" : "Sundays at 20:00 UTC+7 • 300+ Active Combatants",
      description: lang === "th"
        ? "สุดยอดสงครามกิลด์วอร์แห่ง Loren Deep นักรบกว่า 300 ชีวิตปะทะกันเพื่อแย่งชิงบัลลังก์ปราสาท กิลด์ผู้ชนะรับสิทธิ์ครอบครอง Land of Trials และส่วนแบ่งภาษีของเซิร์ฟเวอร์"
        : "The pinnacle of MMORPG guild warfare. Over 300 coordinated warriors clash across the three gates of Loren Deep. The victorious alliance captures the throne, gains Land of Trials, and collects marketplace taxes.",
      points: lang === "th"
        ? [
            "เซิร์ฟเวอร์ความเร็วสูง ไร้ปัญหาวอร์แล็ก 100%",
            "กิลด์เจ้าปราสาทรับส่วนแบ่งภาษีตลาดจริงและ Lord's Mix",
            "ระบบตราพันธมิตรกิลด์และบัฟปราสาทสมบูรณ์แบบ",
          ]
        : [
            "Dedicated server hosting with zero siege lag",
            "Real server market tax dividends for the Lord's guild",
            "Lord's Mix creation and exclusive crest recognition",
          ],
      icon: Trophy,
      glow: "from-amber-500/20 to-amber-600/5",
      accent: "text-amber-400",
      border: "border-amber-400/40",
    },
  ];

  return (
    <section id="highlights" className="relative scroll-mt-28 py-20 sm:py-28">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-transparent opacity-60 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-amber-300 uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{lang === "th" ? "3 จุดเด่นหลักของเซิร์ฟเวอร์" : "The Three Pillars of MuOrigins"}</span>
          </div>
          <h2 className="font-display mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
            {lang === "th" ? "สร้างโดยผู้เล่นตัวจริง" : "BUILT FOR VETERANS."} <br />
            <span className="text-gradient-gold">
              {lang === "th" ? "เพื่อสังคมเกมที่มั่นคงและยุติธรรม" : "RESPECTED BY WARRIORS."}
            </span>
          </h2>
          <p className="mt-4 text-base text-white/60 leading-relaxed max-w-2xl mx-auto">
            {lang === "th"
              ? "ไร้ระบบ Pay-to-Win ไม่มีการเสกของหรือขายสเตตัส ทุกอย่างหาได้จากการเล่นในเกมและเวลาออนไลน์ของคุณ"
              : "We stripped away pay-to-win corruption and artificial bloat. What remains is the pure, authentic MU Online Season 6 Episode 3 experience you fell in love with."}
          </p>
        </div>

        {/* 3 Key Highlights Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {highlights.map((h) => {
            const Icon = h.icon;
            return (
              <div
                key={h.step}
                className="fantasy-panel gold-border relative flex flex-col justify-between rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:translate-y-[-4px] hover:border-amber-400/50 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.6)]"
              >
                <div>
                  {/* Top Bar with Number & Badge */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/8">
                    <span className="font-mono text-2xl font-black text-white/25">
                      {h.step}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/70">
                      {h.badge}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="mt-6 flex items-center gap-3.5">
                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border ${h.border} bg-white/5 shadow-md`}>
                      <Icon className={`h-6 w-6 ${h.accent}`} />
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold text-white leading-snug">
                        {h.title}
                      </h3>
                      <p className={`text-xs font-semibold mt-0.5 ${h.accent}`}>
                        {h.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm text-white/70 leading-relaxed">
                    {h.description}
                  </p>

                  {/* Bullet Points */}
                  <ul className="mt-6 space-y-2.5 pt-4 border-t border-white/5">
                    {h.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-white/80">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer Link */}
                <div className="mt-8 pt-4 border-t border-white/8">
                  <a
                    href="#online-rewards"
                    className="group inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    <span>{lang === "th" ? "ดูระบบออนไลน์แลก WCoin" : "View Online Rewards"}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
