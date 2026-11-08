import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Trophy,
  Shield,
  Search,
  ChevronLeft,
  ChevronRight,
  Crown,
  Filter,
  RefreshCw,
} from "lucide-react";
import { CharacterRankItem, GuildRankItem } from "../data";
import { useI18n } from "../i18n";
import { fetchCharacterRankings, fetchGuildRankings } from "../services/dbApi";

const CLASS_BADGES: Record<string, { bg: string; text: string; border: string; name: string }> = {
  // Dark Knight Lineage
  DK: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", name: "Dark Knight" },
  BK: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", name: "Blade Knight" },
  BM: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", name: "Blade Master" },
  // Dark Wizard Lineage
  DW: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", name: "Dark Wizard" },
  SM: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", name: "Soul Master" },
  GM: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30", name: "Grand Master" },
  // Fairy Elf Lineage
  ELF: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30", name: "Fairy Elf" },
  FE: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30", name: "Fairy Elf" },
  ME: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30", name: "Muse Elf" },
  HE: { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30", name: "High Elf" },
  // Magic Gladiator Lineage
  MG: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", name: "Magic Gladiator" },
  DM: { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", name: "Duel Master" },
  // Dark Lord Lineage
  DL: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", name: "Dark Lord" },
  LE: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", name: "Lord Emperor" },
  // Summoner Lineage
  SUM: { bg: "bg-pink-500/15", text: "text-pink-400", border: "border-pink-500/30", name: "Summoner" },
  BS: { bg: "bg-pink-500/15", text: "text-pink-400", border: "border-pink-500/30", name: "Bloody Summoner" },
  DMS: { bg: "bg-pink-500/15", text: "text-pink-400", border: "border-pink-500/30", name: "Dimension Master" },
  // Rage Fighter Lineage
  RF: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", name: "Rage Fighter" },
  FM: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", name: "Fist Master" },
};

const LINEAGE_BADGES: Record<string, { bg: string; text: string; border: string; name: string }> = {
  dk: CLASS_BADGES.DK,
  dw: CLASS_BADGES.DW,
  elf: CLASS_BADGES.ELF,
  mg: CLASS_BADGES.MG,
  dl: CLASS_BADGES.DL,
  sum: CLASS_BADGES.SUM,
  rf: CLASS_BADGES.RF,
};

export default function RankingSection() {
  const { t } = useI18n();
  const rk = t.ranking;
  const [activeTab, setActiveTab] = useState<"characters" | "guilds">("characters");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [characters, setCharacters] = useState<CharacterRankItem[]>([]);
  const [guilds, setGuilds] = useState<GuildRankItem[]>([]);
  const pageSize = 10;

  // Load from database API with real-time refresh
  const loadDatabaseData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
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
      if (!silent) setIsLoading(false);
    }
  }, [searchQuery, selectedClass]);

  useEffect(() => {
    loadDatabaseData(false);
    const interval = setInterval(() => loadDatabaseData(true), 15000);
    return () => clearInterval(interval);
  }, [loadDatabaseData]);

  // Filtered Characters (supports all 1st/2nd/3rd class evolutions via classId lineage + classShort)
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        char.name.toLowerCase().includes(q) ||
        char.className.toLowerCase().includes(q) ||
        (char.guild && char.guild.toLowerCase().includes(q));
      const matchClass =
        selectedClass === "ALL" ||
        char.classId.toUpperCase() === selectedClass ||
        char.classShort.toUpperCase() === selectedClass;
      return matchSearch && matchClass;
    });
  }, [characters, searchQuery, selectedClass]);

  // Filtered Guilds
  const filteredGuilds = useMemo(() => {
    return guilds.filter((guild) => {
      const q = searchQuery.toLowerCase();
      return (
        !q ||
        guild.name.toLowerCase().includes(q) ||
        guild.master.toLowerCase().includes(q)
      );
    });
  }, [guilds, searchQuery]);

  const totalCharPages = Math.ceil(filteredCharacters.length / pageSize) || 1;
  const paginatedCharacters = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCharacters.slice(start, start + pageSize);
  }, [filteredCharacters, currentPage]);

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

  const charFrom = filteredCharacters.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const charTo = Math.min(currentPage * pageSize, filteredCharacters.length);
  const guildFrom = filteredGuilds.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const guildTo = Math.min(currentPage * pageSize, filteredGuilds.length);

  return (
    <section id="ranking" className="relative scroll-mt-28 py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-radial from-purple-900/10 via-transparent to-transparent opacity-50" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-semibold text-amber-300">
              <Trophy className="h-3.5 w-3.5" />
              <span>{rk.badge}</span>
            </div>
            <h2 className="font-display mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
              {rk.h2a} <span className="text-gradient-gold">{rk.h2b}</span>
            </h2>
            <p className="mt-1 text-sm text-white/60">{rk.sub}</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center self-start rounded-2xl border border-white/10 bg-[#0e1424] p-1.5 md:self-auto">
            <button
              onClick={() => handleTabChange("characters")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                activeTab === "characters"
                  ? "bg-gradient-to-r from-[#d4af37] to-[#ff8a3c] text-[#090d16] shadow-md shadow-amber-500/20"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Trophy className="h-4 w-4" />
              {rk.tabChars}
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
              {rk.tabGuilds}
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="fantasy-panel gold-border mb-6 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2 sm:max-w-md">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={activeTab === "characters" ? rk.searchChars : rk.searchGuilds}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-xs font-medium text-white outline-none placeholder:text-white/35 focus:border-amber-400/50"
              />
            </div>

            <button
              onClick={() => loadDatabaseData(false)}
              disabled={isLoading}
              title={rk.syncBtn}
              aria-label={rk.syncBtn}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-amber-300 disabled:opacity-40"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            </button>
          </div>

          {/* Class Filter */}
          {activeTab === "characters" && (
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <span className="mr-1 flex items-center gap-1 text-[11px] font-semibold text-white/50">
                <Filter className="h-3 w-3" />
                {rk.classFilter}
              </span>
              {[
                { key: "ALL", label: rk.allFilter },
                { key: "DK", label: "DK / BM" },
                { key: "DW", label: "DW / GM" },
                { key: "ELF", label: "ELF / HE" },
                { key: "MG", label: "MG / DM" },
                { key: "DL", label: "DL / LE" },
                { key: "SUM", label: "SUM / DMS" },
                { key: "RF", label: "RF / FM" },
              ].map((cls) => (
                <button
                  key={cls.key}
                  onClick={() => {
                    setSelectedClass(cls.key);
                    setCurrentPage(1);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    selectedClass === cls.key
                      ? "border border-amber-400/40 bg-amber-400/20 text-amber-300"
                      : "border border-white/5 bg-white/5 text-white/60 hover:text-white"
                  }`}
                >
                  {cls.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Table Container */}
        <div className="fantasy-panel gold-border overflow-hidden rounded-3xl shadow-[0_20px_50px_-15px_rgba(0,0,0,0.7)]">
          {activeTab === "characters" ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold tracking-wider text-white/50 uppercase">
                    <th scope="col" className="py-4 pr-3 pl-6">
                      {rk.colRank}
                    </th>
                    <th scope="col" className="px-4 py-4">
                      {rk.colChar}
                    </th>
                    <th scope="col" className="px-4 py-4">
                      {rk.colClass}
                    </th>
                    <th scope="col" className="px-4 py-4">
                      {rk.colGuild}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      {rk.colLevel}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      {rk.colResets}
                    </th>
                    <th scope="col" className="py-4 pr-6 pl-4 text-right">
                      {rk.colStatus}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-white/50">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                          <span>{rk.loading}</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedCharacters.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-white/40">
                        {searchQuery
                          ? rk.noCharsMatch.replace("{q}", searchQuery)
                          : rk.noCharsServer}
                      </td>
                    </tr>
                  ) : (
                    paginatedCharacters.map((char) => {
                      const shortKey = (char.classShort || "").toUpperCase();
                      const idKey = (char.classId || "").toLowerCase();
                      const badge =
                        CLASS_BADGES[shortKey] ||
                        LINEAGE_BADGES[idKey] ||
                        CLASS_BADGES.DK;
                      const displayClassName = char.className || badge.name;
                      const displayLevel =
                        typeof char.level === "number" && Number.isFinite(char.level)
                          ? char.level
                          : 1;
                      const displayMasterLevel =
                        typeof char.masterLevel === "number" && Number.isFinite(char.masterLevel)
                          ? char.masterLevel
                          : 0;
                      const displayResets =
                        typeof char.resets === "number" && Number.isFinite(char.resets)
                          ? char.resets
                          : 0;
                      const displayGrandResets =
                        typeof char.grandResets === "number" && Number.isFinite(char.grandResets)
                          ? char.grandResets
                          : 0;

                      return (
                        <tr
                          key={`${char.rank}-${char.name}`}
                          className="group transition-colors hover:bg-white/[0.04]"
                        >
                          {/* Rank */}
                          <td className="py-3.5 pr-3 pl-6 whitespace-nowrap">
                            {getRankBadge(char.rank)}
                          </td>

                          {/* Character Name */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span className="font-bold text-white transition-colors group-hover:text-amber-300">
                              {char.name}
                            </span>
                          </td>

                          {/* Class (Always visible on all viewports with exact evolution name) */}
                          <td className="px-4 py-3.5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              <span className="font-mono">{char.classShort || "DK"}</span>
                              <span className="text-[11px] font-medium opacity-90">
                                • {displayClassName}
                              </span>
                            </span>
                          </td>

                          {/* Guild */}
                          <td className="px-4 py-3.5 text-xs whitespace-nowrap text-white/70">
                            {char.guild ? (
                              <span className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-amber-400" />
                                {char.guild}
                              </span>
                            ) : (
                              <span className="text-white/30">—</span>
                            )}
                          </td>

                          {/* Level & Master Level */}
                          <td className="px-4 py-3.5 text-center font-mono whitespace-nowrap">
                            <span className="font-bold text-white">Lv. {displayLevel}</span>
                            {displayMasterLevel > 0 && (
                              <span className="ml-1.5 rounded bg-purple-500/15 px-1.5 py-0.5 text-xs font-semibold text-purple-300">
                                +{displayMasterLevel} ML
                              </span>
                            )}
                          </td>

                          {/* Resets */}
                          <td className="px-4 py-3.5 text-center font-mono whitespace-nowrap">
                            <span className="font-bold text-amber-300">{displayResets}</span>
                            <span className="ml-1 text-[11px] text-white/40">
                              ({displayGrandResets} GR)
                            </span>
                          </td>

                          {/* Online Status */}
                          <td className="py-3.5 pr-6 pl-4 text-right whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                                char.isOnline ? "text-emerald-400" : "text-white/40"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  char.isOnline
                                    ? "animate-pulse bg-emerald-400 shadow-sm shadow-emerald-400/50"
                                    : "bg-white/20"
                                }`}
                              />
                              <span>{char.isOnline ? rk.online : rk.offline}</span>
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
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-xs font-semibold tracking-wider text-white/50 uppercase">
                    <th scope="col" className="py-4 pr-3 pl-6">
                      {rk.colRank}
                    </th>
                    <th scope="col" className="px-4 py-4">
                      {rk.colGuildName}
                    </th>
                    <th scope="col" className="px-4 py-4">
                      {rk.colMaster}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      {rk.colMembers}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      {rk.colTotalResets}
                    </th>
                    <th scope="col" className="px-4 py-4 text-center">
                      {rk.colScore}
                    </th>
                    <th scope="col" className="py-4 pr-6 pl-4 text-right">
                      {rk.colSiegeStatus}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-white/50">
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
                          <span>{rk.loading}</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedGuilds.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-sm text-white/40">
                        {searchQuery
                          ? rk.noGuildsMatch.replace("{q}", searchQuery)
                          : rk.noGuildsServer}
                      </td>
                    </tr>
                  ) : (
                    paginatedGuilds.map((guild) => (
                      <tr
                        key={guild.name}
                        className="group transition-colors hover:bg-white/[0.04]"
                      >
                        <td className="py-3.5 pr-3 pl-6 whitespace-nowrap">
                          {getRankBadge(guild.rank)}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="flex items-center gap-2 font-bold text-white transition-colors group-hover:text-amber-300">
                            <span className="grid h-6 w-6 place-items-center rounded border border-amber-400/30 bg-amber-400/10 text-amber-300">
                              <Shield className="h-3.5 w-3.5" />
                            </span>
                            {guild.name}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-xs whitespace-nowrap text-white/80">
                          {guild.master}
                        </td>

                        <td className="px-4 py-3.5 text-center font-mono text-xs whitespace-nowrap text-white/70">
                          {guild.members}
                        </td>

                        <td className="px-4 py-3.5 text-center font-mono font-bold whitespace-nowrap text-amber-300">
                          {guild.totalResets.toLocaleString()}
                        </td>

                        <td className="px-4 py-3.5 text-center font-mono text-xs whitespace-nowrap text-white/70">
                          {guild.score.toLocaleString()}
                        </td>

                        <td className="py-3.5 pr-6 pl-4 text-right whitespace-nowrap">
                          {guild.siegeStatus === "Castle Lord" ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-300 shadow-sm shadow-amber-500/20">
                              <Crown className="h-3.5 w-3.5 text-amber-300" />
                              {rk.castleLord}
                            </span>
                          ) : guild.siegeStatus === "Alliance" ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 text-xs font-semibold text-cyan-300">
                              {rk.alliance}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-md border border-purple-400/30 bg-purple-400/10 px-2 py-0.5 text-xs font-semibold text-purple-300">
                              {rk.challenger}
                            </span>
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
          <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 px-6 py-4 text-xs text-white/60 sm:flex-row">
            <div>
              <span>
                {activeTab === "characters"
                  ? rk.showingChars
                      .replace("{from}", String(charFrom))
                      .replace("{to}", String(charTo))
                      .replace("{total}", String(filteredCharacters.length))
                  : rk.showingGuilds
                      .replace("{from}", String(guildFrom))
                      .replace("{to}", String(guildTo))
                      .replace("{total}", String(filteredGuilds.length))}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label={rk.prevPage}
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
                aria-label={rk.nextPage}
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
