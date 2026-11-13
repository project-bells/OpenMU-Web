const CLASS_BY_NUMBER = new Map([
  [0, { classId: "dw", className: "Dark Wizard", classShort: "DW" }],
  [1, { classId: "dw", className: "Soul Master", classShort: "SM" }],
  [2, { classId: "dw", className: "Grand Master", classShort: "GM" }],
  [3, { classId: "dw", className: "Grand Master", classShort: "GM" }],
  [4, { classId: "dk", className: "Dark Knight", classShort: "DK" }],
  [6, { classId: "dk", className: "Blade Knight", classShort: "BK" }],
  [7, { classId: "dk", className: "Blade Master", classShort: "BM" }],
  [8, { classId: "elf", className: "Fairy Elf", classShort: "ELF" }],
  [10, { classId: "elf", className: "Muse Elf", classShort: "ME" }],
  [11, { classId: "elf", className: "High Elf", classShort: "HE" }],
  [12, { classId: "mg", className: "Magic Gladiator", classShort: "MG" }],
  [13, { classId: "mg", className: "Duel Master", classShort: "DM" }],
  [16, { classId: "dk", className: "Dark Knight", classShort: "DK" }],
  [17, { classId: "dk", className: "Blade Knight", classShort: "BK" }],
  [18, { classId: "dk", className: "Blade Master", classShort: "BM" }],
  [19, { classId: "dk", className: "Blade Master", classShort: "BM" }],
  [20, { classId: "sum", className: "Summoner", classShort: "SUM" }],
  [22, { classId: "sum", className: "Bloody Summoner", classShort: "BS" }],
  [23, { classId: "sum", className: "Dimension Master", classShort: "DMS" }],
  [24, { classId: "rf", className: "Rage Fighter", classShort: "RF" }],
  [25, { classId: "rf", className: "Fist Master", classShort: "FM" }],
  [32, { classId: "elf", className: "Fairy Elf", classShort: "ELF" }],
  [33, { classId: "elf", className: "Muse Elf", classShort: "ME" }],
  [34, { classId: "elf", className: "High Elf", classShort: "HE" }],
  [35, { classId: "elf", className: "High Elf", classShort: "HE" }],
  [48, { classId: "mg", className: "Magic Gladiator", classShort: "MG" }],
  [49, { classId: "mg", className: "Duel Master", classShort: "DM" }],
  [50, { classId: "mg", className: "Duel Master", classShort: "DM" }],
  [64, { classId: "dl", className: "Dark Lord", classShort: "DL" }],
  [65, { classId: "dl", className: "Lord Emperor", classShort: "LE" }],
  [66, { classId: "dl", className: "Lord Emperor", classShort: "LE" }],
  [80, { classId: "sum", className: "Summoner", classShort: "SUM" }],
  [81, { classId: "sum", className: "Bloody Summoner", classShort: "BS" }],
  [82, { classId: "sum", className: "Dimension Master", classShort: "DMS" }],
  [83, { classId: "sum", className: "Dimension Master", classShort: "DMS" }],
  [96, { classId: "rf", className: "Rage Fighter", classShort: "RF" }],
  [97, { classId: "rf", className: "Fist Master", classShort: "FM" }],
  [98, { classId: "rf", className: "Fist Master", classShort: "FM" }],
]);

const CLASS_BY_NAME = new Map([
  ["dark wizard", { classId: "dw", className: "Dark Wizard", classShort: "DW" }],
  ["soul master", { classId: "dw", className: "Soul Master", classShort: "SM" }],
  ["grand master", { classId: "dw", className: "Grand Master", classShort: "GM" }],
  ["dark knight", { classId: "dk", className: "Dark Knight", classShort: "DK" }],
  ["blade knight", { classId: "dk", className: "Blade Knight", classShort: "BK" }],
  ["blade master", { classId: "dk", className: "Blade Master", classShort: "BM" }],
  ["fairy elf", { classId: "elf", className: "Fairy Elf", classShort: "ELF" }],
  ["muse elf", { classId: "elf", className: "Muse Elf", classShort: "ME" }],
  ["high elf", { classId: "elf", className: "High Elf", classShort: "HE" }],
  ["magic gladiator", { classId: "mg", className: "Magic Gladiator", classShort: "MG" }],
  ["duel master", { classId: "mg", className: "Duel Master", classShort: "DM" }],
  ["dark lord", { classId: "dl", className: "Dark Lord", classShort: "DL" }],
  ["lord emperor", { classId: "dl", className: "Lord Emperor", classShort: "LE" }],
  ["summoner", { classId: "sum", className: "Summoner", classShort: "SUM" }],
  ["bloody summoner", { classId: "sum", className: "Bloody Summoner", classShort: "BS" }],
  ["dimension master", { classId: "sum", className: "Dimension Master", classShort: "DMS" }],
  ["rage fighter", { classId: "rf", className: "Rage Fighter", classShort: "RF" }],
  ["fist master", { classId: "rf", className: "Fist Master", classShort: "FM" }],
]);

export function normalizeCharacterClass(raw) {
  if (!raw || typeof raw !== "object") {
    return { classId: "dk", className: "Dark Knight", classShort: "DK" };
  }

  const numCandidates = [raw.classNumber, raw.ClassNumber, raw.characterClassNumber, raw.CharacterClassNumber];
  for (const numVal of numCandidates) {
    if (numVal !== null && numVal !== undefined && numVal !== "") {
      const n = Number(numVal);
      if (Number.isInteger(n) && CLASS_BY_NUMBER.has(n)) {
        return CLASS_BY_NUMBER.get(n);
      }
    }
  }

  const name = String(raw.className ?? raw.ClassName ?? raw.characterClass ?? raw.CharacterClass ?? "").trim().toLowerCase();
  if (name && CLASS_BY_NAME.has(name)) {
    return CLASS_BY_NAME.get(name);
  }

  if (typeof raw.classId === "string" && raw.classShort && raw.className) {
    return { classId: raw.classId, className: raw.className, classShort: raw.classShort };
  }

  return { classId: "dk", className: "Dark Knight", classShort: "DK" };
}

export function normalizeCharacterRankingItem(raw, index = 0) {
  const cls = normalizeCharacterClass(raw);
  const level = Math.max(1, Math.floor(Number(raw.level ?? raw.Level ?? 1) || 1));
  const masterLevel = Math.max(0, Math.floor(Number(raw.masterLevel ?? raw.MasterLevel ?? 0) || 0));
  const resets = Math.max(0, Math.floor(Number(raw.resets ?? raw.Resets ?? 0) || 0));
  const grandResets = Math.max(0, Math.floor(Number(raw.grandResets ?? raw.GrandResets ?? 0) || 0));
  const guildRaw = raw.guild ?? raw.Guild ?? raw.guildName ?? raw.GuildName ?? null;
  const guild = typeof guildRaw === "string" && guildRaw.trim() ? guildRaw.trim() : null;

  return {
    rank: Math.max(1, Math.floor(Number(raw.rank ?? raw.Rank ?? index + 1) || index + 1)),
    name: String(raw.name ?? raw.Name ?? raw.characterName ?? `Character-${index + 1}`),
    classId: cls.classId,
    className: cls.className,
    classShort: cls.classShort,
    level,
    masterLevel,
    resets,
    grandResets,
    guild,
    isOnline: Boolean(raw.isOnline ?? raw.IsOnline ?? raw.online ?? raw.Online ?? false),
  };
}

