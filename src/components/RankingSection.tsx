import { useState, useMemo, useEffect, useCallback } from "react";
import { Trophy, Shield, Search, ChevronLeft, ChevronRight, Crown, Filter, RefreshCw } from "lucide-react";
import { CharacterRankItem, GuildRankItem } from "../data";
import { useI18n } from "../i18n";
import { fetchCharacterRankings, fetchGuildRankings } from "../services/dbApi";

const CLASS_BADGES: Record<string, { bg: string; text: string; border: string; name: string }> = {
  DK: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", name: "Dark Knight" },
  DW: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", name: "Dark Wizard" },
  ELF: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30", name: "Fairy Elf" },
  MG: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", name: "Magic Gladiator" },
  DL: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", name: "Dark Lord" },
  SUM: { bg: "bg-pink-500/15", text: "text-pink-400", border: "border-pink-500/30", name: "Summoner" },
  RF: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", name: "Rage Fighter" },
};

export default function RankingSection() {
  const { lang } = useI18n();
  const [activeTab, setActiveTab] = useState<"characters" | "guilds">("characters");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState<CharacterRankItem[]>([]);
  const [guilds, setGuilds] = useState<GuildRankItem[]>([]);
  const pageSize = 10;

  // Load from database API
  const loadDatabaseData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [chars, glds] = await Promise.all([
        fetchCharacterRankings(searchQuery, selectedClass),
        fetchGuildRankings(searchQuery),
      ]);
      setCharacters(chars);
      setGuilds(glds);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedClass]);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Filtered Characters
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const matchSearch =
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.guild.toLowerCase().includes(searchQuery.toLowerCase());
      const matchClass = selectedClass === "ALL" || char.classShort === selectedClass;
      return matchSearch && matchClass;
    });
  }, [characters, searchQuery, selectedClass]);

  // Filtered Guilds
  const filteredGuilds = useMemo(() => {
    return guilds.filter((guild) => {
      return (
        guild.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guild.master.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [guilds, searchQuery]);

  // Pagination for characters
  const totalCharPages = Math.ceil(filteredCharacters.length / pageSize) || 1;
  const paginatedCharacters = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCharacters.slice(start, start + pageSize);
  }, [filteredCharacters, currentPage]);

  // Pagination for guilds
  const totalGuildPages = Math.ceil(filteredGuilds.length / pageSize) || 1;
  const paginatedGuilds = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredGuilds.slice(start, start + pageSize);
  }, [filteredGuilds, currentPage]);

  const handleTabChange = (tab: "characters" | "guilds") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 font-mono text-xs font-black text-black shadow-lg shadow-amber-500/40">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 font-mono text-xs font-black text-black shadow-lg shadow-slate-300/30">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 font-mono text-xs font-black text-amber-200 shadow-md">
          3
        </span>
      );
    }
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 font-mono text-xs font-bold text-white/60">
        {rank}
      </span>
    );
  };

  return (
    <section id="ranking" className="relative scroll-mt-28 py-16 sm:py-24">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial from-purple-900/10 via-transparent to-transparent opacity-50 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <Trophy className="h-3.5 w-3.5" />
              <span>{lang === "th" ? "หอเกียรติยศ Season 6 Episode 3" : "Season 6 Episode 3 Hall of Fame"}</span>
            </div>
            <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {lang === "th" ? "อันดับ" : "SERVER"}{" "}
              <span className="text-gradient-gold">{lang === "th" ? "เซิร์ฟเวอร์" : "RANKINGS"}</span>
            </h2>
            <p className="mt-1 text-sm text-white/60">
              {lang === "th"
                ? "ตารางอันดับผู้เล่นและกิลด์ชั้นนำ อัปเดตข้อมูลแบบเรียลไทม์ตรงจากฐานข้อมูลเซิร์ฟเวอร์"
                : "Live leaderboard synchronized with official server database. Updated in real time."}
            </p>
          </div>

          {/* Tab Switcher (Segmented Control) */}
          <div className="flex items-center rounded-2xl border border-white/10 bg-[#0e1424] p-1.5 self-start md:self-auto">
            <button
              onClick={() => handleTabChange("characters")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                activeTab === "characters"
                  ? "bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] text-[#090d16] shadow-md shadow-amber-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Trophy className="h-4 w-4" />
              {lang === "th" ? "อันดับตัวละคร" : "Top Characters"}
            </button>
            <button
              onClick={() => handleTabChange("guilds")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                activeTab === "guilds"
                  ? "bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] text-[#090d16] shadow-md shadow-amber-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Shield className="h-4 w-4" />
              {lang === "th" ? "อันดับกิลด์" : "Top Guilds"}
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="fantasy-panel gold-border mb-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box & Refresh */}
          <div className="flex items-center gap-2 flex-1 sm:max-w-md">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-white/40">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={
                  activeTab === "characters"
                    ? (lang === "th" ? "ค้นหาชื่อตัวละคร หรือ กิลด์…" : "Search character name or guild…")
                    : (lang === "th" ? "ค้นหาชื่อกิลด์ หรือ หัวหน้ากิลด์…" : "Search guild name or master…")
                }
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs font-medium text-white outline-none placeholder:text-white/35 focus:border-amber-400/50"
              />
            </div>

            <button
              onClick={loadDatabaseData}
              disabled={isLoading}
              title={lang === "th" ? "รีเฟรชข้อมูลจากฐานข้อมูล" : "Sync with database"}
              aria-label={lang === "th" ? "รีเฟรชข้อมูลจากฐานข้อมูล" : "Sync with database"}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-amber-300 transition disabled:opacity-40"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>

          {/* Class Filter (Characters Tab Only) */}
          {activeTab === "characters" && (
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-[11px] font-semibold text-white/50 flex items-center gap-1 mr-1">
                <Filter className="h-3 w-3" />
                {lang === "th" ? "อาชีพ:" : "Class:"}
              </span>
              {["ALL", "DK", "DW", "ELF", "MG", "DL", "SUM", "RF"].map((cls) => (
                <button
                  key={cls}
                  onClick={() => {
                    setSelectedClass(cls);
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    selectedClass === cls
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                      : "bg-white/5 text-white/60 hover:text-white border border-white/5"
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Table Container */}
        <div className="fantasy-panel gold-border overflow-hidden rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)]">
          {activeTab === "characters" ? (
            /* Characters Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/50">
                    <th scope="col" className="py-4 pl-6 pr-3">{lang === "th" ? "อันดับ" : "Rank"}</th>
                    <th scope="col" className="py-4 px-4">{lang === "th" ? "ชื่อตัวละคร" : "Character"}</th>
                    <th scope="col" className="py-4 px-4">{lang === "th" ? "อาชีพ" : "Class"}</th>
                    <th scope="col" className="py-4 px-4">{lang === "th" ? "กิลด์" : "Guild"}</th>
                    <th scope="col" className="py-4 px-4 text-center">{lang === "th" ? "เลเวล / มาสเตอร์" : "Level / Master"}</th>
                    <th scope="col" className="py-4 px-4 text-center">{lang === "th" ? "รีเซ็ต (GR)" : "Resets (GR)"}</th>
                    <th scope="col" className="py-4 pl-4 pr-6 text-right">{lang === "th" ? "สถานะ" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-white/50">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                          <span>{lang === "th" ? "กำลังโหลดอันดับจากเซิร์ฟเวอร์…" : "Loading rankings from server…"}</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedCharacters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-white/40">
                        {searchQuery
                          ? (lang === "th" ? `ไม่พบตัวละครที่ตรงกับ "${searchQuery}"` : `No characters found matching "${searchQuery}"`)
                          : (lang === "th" ? "ยังไม่มีข้อมูลตัวละครจากเซิร์ฟเวอร์" : "No characters found on server")}
                      </td>
                    </tr>
                  ) : (
                    paginatedCharacters.map((char) => {
                      const badge = CLASS_BADGES[char.classShort] || CLASS_BADGES.DK;
                      return (
                        <tr
                          key={char.name}
                          className="transition-colors hover:bg-white/[0.04] group"
                        >
                          {/* Rank */}
                          <td className="py-3.5 pl-6 pr-3 whitespace-nowrap">
                            {getRankBadge(char.rank)}
                          </td>

                          {/* Character Name */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                              {char.name}
                            </span>
                          </td>

                          {/* Class */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-bold ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              <span>{char.classShort}</span>
                              <span className="text-[10px] opacity-75 font-normal hidden lg:inline">
                                • {char.className || badge.name}
                              </span>
                            </span>
                          </td>

                          {/* Guild */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs text-white/70">
                            {char.guild ? (
                              <span className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-amber-400" />
                                {char.guild}
                              </span>
                            ) : (
                              <span className="text-white/30">—</span>
                            )}
                          </td>

                          {/* Level */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-center font-mono">
                            <span className="text-white font-bold">{char.level}</span>
                            <span className="text-xs text-purple-400 ml-1">+{char.masterLevel}</span>
                          </td>

                          {/* Resets */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-center font-mono">
                            <span className="text-amber-300 font-bold">{char.resets}</span>
                            <span className="text-[11px] text-white/40 ml-1">({char.grandResets} GR)</span>
                          </td>

                          {/* Online Status */}
                          <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                char.isOnline ? "text-emerald-400" : "text-white/40"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  char.isOnline ? "bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" : "bg-white/20"
                                }`}
                              />
                              <span>{char.isOnline ? "Online" : "Offline"}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Guilds Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-white/50">
                    <th scope="col" className="py-4 pl-6 pr-3">{lang === "th" ? "อันดับ" : "Rank"}</th>
                    <th scope="col" className="py-4 px-4">{lang === "th" ? "กิลด์" : "Guild"}</th>
                    <th scope="col" className="py-4 px-4">{lang === "th" ? "หัวหน้ากิลด์" : "Guild Master"}</th>
                    <th scope="col" className="py-4 px-4 text-center">{lang === "th" ? "สมาชิก" : "Members"}</th>
                    <th scope="col" className="py-4 px-4 text-center">{lang === "th" ? "รีเซ็ตรวม" : "Total Resets"}</th>
                    <th scope="col" className="py-4 px-4 text-center">{lang === "th" ? "คะแนนกิลด์" : "Guild Score"}</th>
                    <th scope="col" className="py-4 pl-4 pr-6 text-right">{lang === "th" ? "สถานะวอร์" : "Siege Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-white/50">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                          <span>{lang === "th" ? "กำลังโหลดอันดับจากเซิร์ฟเวอร์…" : "Loading rankings from server…"}</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedGuilds.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-white/40">
                        {searchQuery
                          ? (lang === "th" ? `ไม่พบกิลด์ที่ตรงกับ "${searchQuery}"` : `No guilds found matching "${searchQuery}"`)
                          : (lang === "th" ? "ยังไม่มีข้อมูลกิลด์จากเซิร์ฟเวอร์" : "No guilds found on server")}
                      </td>
                    </tr>
                  ) : (
                    paginatedGuilds.map((guild) => (
                      <tr
                        key={guild.name}
                        className="transition-colors hover:bg-white/[0.04] group"
                      >
                        {/* Rank */}
                        <td className="py-3.5 pl-6 pr-3 whitespace-nowrap">
                          {getRankBadge(guild.rank)}
                        </td>

                        {/* Guild Name */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="flex items-center gap-2 font-bold text-white group-hover:text-amber-300 transition-colors">
                            <span className="grid h-6 w-6 place-items-center rounded bg-amber-400/10 border border-amber-400/30 text-amber-300">
                              <Shield className="h-3.5 w-3.5" />
                            </span>
                            {guild.name}
                          </span>
                        </td>

                        {/* Guild Master */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-white/80">
                          {guild.master}
                        </td>

                        {/* Members */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center font-mono text-xs text-white/70">
                          {guild.members}
                        </td>

                        {/* Total Resets */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center font-mono font-bold text-amber-300">
                          {guild.totalResets.toLocaleString()}
                        </td>

                        {/* Score */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center font-mono text-xs text-white/70">
                          {guild.score.toLocaleString()}
                        </td>

                        {/* Siege Status */}
                        <td className="py-3.5 pl-4 pr-6 whitespace-nowrap text-right">
                          {guild.siegeStatus === "Castle Lord" ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-300 shadow-sm shadow-amber-500/20">
                              <Crown className="h-3.5 w-3.5 text-amber-300" />
                              Castle Lord
                            </span>
                          ) : guild.siegeStatus === "Challenger" ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-purple-400/30 bg-purple-400/10 px-2 py-0.5 text-xs font-semibold text-purple-300">
                              Challenger
                            </span>
                          ) : (
                            <span className="text-xs text-white/40">Alliance</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 text-xs text-white/60">
            <div>
              {activeTab === "characters" ? (
                <span>
                  {lang === "th"
                    ? `แสดง ${filteredCharacters.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} ถึง ${Math.min(currentPage * pageSize, filteredCharacters.length)} จากทั้งหมด ${filteredCharacters.length} ตัวละคร`
                    : `Showing ${filteredCharacters.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filteredCharacters.length)} of ${filteredCharacters.length} Warriors`}
                </span>
              ) : (
                <span>
                  {lang === "th"
                    ? `แสดง ${filteredGuilds.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} ถึง ${Math.min(currentPage * pageSize, filteredGuilds.length)} จากทั้งหมด ${filteredGuilds.length} กิลด์`
                    : `Showing ${filteredGuilds.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to ${Math.min(currentPage * pageSize, filteredGuilds.length)} of ${filteredGuilds.length} Guilds`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous Page"
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 font-mono text-white">
                {currentPage} / {activeTab === "characters" ? totalCharPages : totalGuildPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(activeTab === "characters" ? totalCharPages : totalGuildPages, p + 1)
                  )
                }
                disabled={
                  currentPage >= (activeTab === "characters" ? totalCharPages : totalGuildPages)
                }
                aria-label="Next Page"
                className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 transition hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
