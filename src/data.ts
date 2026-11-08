// Language-independent data. All text lives in src/i18n/locales/*.

export const NAV_KEYS = [
  { key: "rates", href: "#rates" },
  { key: "classes", href: "#classes" },
  { key: "siege", href: "#siege" },
  { key: "events", href: "#events" },
  { key: "vip", href: "#vip" },
  { key: "faq", href: "#faq" },
] as const;

export const SERVERS = ["Origins-1", "Origins-2", "Origins-3", "Arena"];

export const RATE_META = [
  { icon: "Zap", value: "50x" },
  { icon: "Gem", value: "30%" },
  { icon: "Shield", value: "0 P2W" },
  { icon: "Swords", value: "S6E3" },
  { icon: "Flame", value: "SAT" },
  { icon: "Bug", value: "24/7" },
];

export type ClassId = "dk" | "dw" | "elf" | "dl" | "mg" | "sum" | "rf";

export const CLASSES: {
  id: ClassId;
  name: string;
  title: string;
  stats: Record<string, number>;
  skills: string[];
  image: string;
  color: string;
  icon: string;
}[] = [
  { id: "dk", name: "Dark Knight", title: "Blade Master", stats: { STR: 95, AGI: 60, VIT: 88, ENE: 25 }, skills: ["Twisting Slash", "Death Stab", "Greater Fortitude", "Combo System"], image: "/assets/aistudio/Dark_Knight_4c045d6b.jpg", color: "#ff5a3c", icon: "Sword" },
  { id: "dw", name: "Dark Wizard", title: "Soul Master", stats: { STR: 20, AGI: 55, VIT: 45, ENE: 98 }, skills: ["Evil Spirit", "Hellfire", "Teleport", "Mana Shield"], image: "/assets/aistudio/Dark_Wizard_ba533c69.jpg", color: "#8b5cf6", icon: "Sparkles" },
  { id: "elf", name: "Fairy Elf", title: "Muse Elf", stats: { STR: 55, AGI: 92, VIT: 50, ENE: 80 }, skills: ["Greater Damage", "Greater Defense", "Heal", "Penetration"], image: "/assets/aistudio/Fairy_Elf_85b3e6a6.jpg", color: "#38e1ff", icon: "Heart" },
  { id: "dl", name: "Dark Lord", title: "Lord Emperor", stats: { STR: 80, AGI: 65, VIT: 75, ENE: 70, CMD: 96 }, skills: ["Fire Burst", "Force Wave", "Summon Pets", "Critical Damage+"], image: "/assets/aistudio/Dark_Lord_0763a816.jpg", color: "#f5c451", icon: "Crown" },
  { id: "mg", name: "Magic Gladiator", title: "Duel Master", stats: { STR: 85, AGI: 70, VIT: 60, ENE: 85 }, skills: ["Gigantic Storm", "Fire Slash", "Power Slash", "Mana Shield"], image: "/assets/aistudio/Magic_Gladiator_f6113e09.jpg", color: "#ff8a3c", icon: "Flame" },
  { id: "sum", name: "Summoner", title: "Bloody Summoner", stats: { STR: 25, AGI: 60, VIT: 55, ENE: 92 }, skills: ["Berserker", "Weakness", "Chain Lightning", "Sleep"], image: "/assets/aistudio/Summoner_21307bf2.jpg", color: "#ec4899", icon: "Moon" },
  { id: "rf", name: "Rage Fighter", title: "Fist Master", stats: { STR: 90, AGI: 85, VIT: 82, ENE: 30 }, skills: ["Dark Side", "Dragon Punch", "Ignore Defense", "Charge"], image: "/assets/aistudio/Rage_Fighte_cd980204.jpg", color: "#22c55e", icon: "Zap" },
];

export const EVENTS = [
  { name: "Blood Castle", icon: "Droplet", hot: true },
  { name: "Devil Square", icon: "Flame", hot: true },
  { name: "Chaos Castle", icon: "Swords", hot: false },
  { name: "Illusion Temple", icon: "Eye", hot: false },
  { name: "Crywolf Fortress", icon: "Shield", hot: true },
  { name: "Kanturu Invasion", icon: "Skull", hot: false },
];

export const TESTIMONIALS = [
  { name: "xX_DarkHero_Xx", avatar: "DH", stars: 5 },
  { name: "MuseQueen", avatar: "MQ", stars: 5 },
  { name: "ComboGod", avatar: "CG", stars: 5 },
  { name: "NoLifeWizard", avatar: "NW", stars: 5 },
  { name: "LordStryker", avatar: "LS", stars: 5 },
  { name: "Y2KTamer", avatar: "YT", stars: 5 },
];

export const PRICING = [
  { price: "€0", highlight: false },
  { price: "€9.99", highlight: true },
  { price: "€19.99", highlight: false },
];

export interface CharacterRankItem {
  rank: number;
  name: string;
  classId: ClassId;
  className: string;
  classShort: string;
  level: number;
  masterLevel: number;
  resets: number;
  grandResets: number;
  guild: string;
  isOnline: boolean;
}

export const MOCK_CHARACTERS: CharacterRankItem[] = [
  { rank: 1, name: "xX_Khaos_Xx", classId: "dk", className: "Blade Master", classShort: "DK", level: 400, masterLevel: 250, resets: 98, grandResets: 4, guild: "VENDETTA", isOnline: true },
  { rank: 2, name: "SoulReaper", classId: "dw", className: "Grand Master", classShort: "DW", level: 400, masterLevel: 245, resets: 95, grandResets: 4, guild: "VENDETTA", isOnline: true },
  { rank: 3, name: "QueenElf", classId: "elf", className: "High Elf", classShort: "ELF", level: 400, masterLevel: 240, resets: 93, grandResets: 3, guild: "IronGuard", isOnline: true },
  { rank: 4, name: "LordViper", classId: "dl", className: "Lord Emperor", classShort: "DL", level: 400, masterLevel: 238, resets: 91, grandResets: 3, guild: "VENDETTA", isOnline: false },
  { rank: 5, name: "ComboMaster", classId: "dk", className: "Blade Master", classShort: "DK", level: 400, masterLevel: 230, resets: 89, grandResets: 3, guild: "Nemesis", isOnline: true },
  { rank: 6, name: "StormBringer", classId: "mg", className: "Duel Master", classShort: "MG", level: 400, masterLevel: 228, resets: 87, grandResets: 3, guild: "Immortals", isOnline: false },
  { rank: 7, name: "DarkIllusion", classId: "dw", className: "Grand Master", classShort: "DW", level: 400, masterLevel: 225, resets: 86, grandResets: 2, guild: "OldSchool", isOnline: true },
  { rank: 8, name: "FistOfDoom", classId: "rf", className: "Fist Master", classShort: "RF", level: 400, masterLevel: 220, resets: 84, grandResets: 2, guild: "Nemesis", isOnline: true },
  { rank: 9, name: "BloodCurse", classId: "sum", className: "Dimension Master", classShort: "SUM", level: 400, masterLevel: 218, resets: 82, grandResets: 2, guild: "IronGuard", isOnline: false },
  { rank: 10, name: "ArchangelDK", classId: "dk", className: "Blade Master", classShort: "DK", level: 400, masterLevel: 215, resets: 80, grandResets: 2, guild: "Phoenix", isOnline: true },
  { rank: 11, name: "LunarGoddess", classId: "elf", className: "High Elf", classShort: "ELF", level: 400, masterLevel: 210, resets: 79, grandResets: 2, guild: "OldSchool", isOnline: true },
  { rank: 12, name: "TitanLord", classId: "dl", className: "Lord Emperor", classShort: "DL", level: 400, masterLevel: 205, resets: 77, grandResets: 2, guild: "Immortals", isOnline: false },
  { rank: 13, name: "NovaIgnite", classId: "dw", className: "Grand Master", classShort: "DW", level: 400, masterLevel: 200, resets: 75, grandResets: 1, guild: "Phoenix", isOnline: true },
  { rank: 14, name: "BladeStorm", classId: "mg", className: "Duel Master", classShort: "MG", level: 400, masterLevel: 198, resets: 74, grandResets: 1, guild: "AfterLife", isOnline: false },
  { rank: 15, name: "IronKnuckle", classId: "rf", className: "Fist Master", classShort: "RF", level: 400, masterLevel: 195, resets: 72, grandResets: 1, guild: "Reborn", isOnline: true },
  { rank: 16, name: "HexWeaver", classId: "sum", className: "Dimension Master", classShort: "SUM", level: 400, masterLevel: 190, resets: 70, grandResets: 1, guild: "AfterLife", isOnline: false },
  { rank: 17, name: "DragonSlayer", classId: "dk", className: "Blade Master", classShort: "DK", level: 400, masterLevel: 185, resets: 68, grandResets: 1, guild: "Genesis", isOnline: true },
  { rank: 18, name: "StarGazer", classId: "elf", className: "High Elf", classShort: "ELF", level: 400, masterLevel: 180, resets: 66, grandResets: 1, guild: "DragonHeart", isOnline: true },
  { rank: 19, name: "AbyssWalker", classId: "dl", className: "Lord Emperor", classShort: "DL", level: 400, masterLevel: 175, resets: 65, grandResets: 1, guild: "Genesis", isOnline: false },
  { rank: 20, name: "ThunderSlash", classId: "mg", className: "Duel Master", classShort: "MG", level: 400, masterLevel: 170, resets: 63, grandResets: 1, guild: "DragonHeart", isOnline: true },
];

export interface GuildRankItem {
  rank: number;
  name: string;
  master: string;
  score: number;
  totalResets: number;
  members: string;
  siegeStatus: "Castle Lord" | "Challenger" | "Alliance";
}

export const MOCK_GUILDS: GuildRankItem[] = [
  { rank: 1, name: "VENDETTA", master: "LordViper", score: 58420, totalResets: 1480, members: "39/40", siegeStatus: "Castle Lord" },
  { rank: 2, name: "IronGuard", master: "QueenElf", score: 51200, totalResets: 1290, members: "38/40", siegeStatus: "Challenger" },
  { rank: 3, name: "Nemesis", master: "ComboMaster", score: 47800, totalResets: 1180, members: "40/40", siegeStatus: "Challenger" },
  { rank: 4, name: "Immortals", master: "StormBringer", score: 42300, totalResets: 1040, members: "37/40", siegeStatus: "Alliance" },
  { rank: 5, name: "OldSchool", master: "DarkIllusion", score: 38900, totalResets: 960, members: "36/40", siegeStatus: "Alliance" },
  { rank: 6, name: "Phoenix", master: "ArchangelDK", score: 35100, totalResets: 890, members: "35/40", siegeStatus: "Alliance" },
  { rank: 7, name: "AfterLife", master: "BladeStorm", score: 31400, totalResets: 810, members: "34/40", siegeStatus: "Alliance" },
  { rank: 8, name: "Reborn", master: "IronKnuckle", score: 28600, totalResets: 740, members: "32/40", siegeStatus: "Alliance" },
  { rank: 9, name: "Genesis", master: "DragonSlayer", score: 25400, totalResets: 690, members: "30/40", siegeStatus: "Alliance" },
  { rank: 10, name: "DragonHeart", master: "StarGazer", score: 22100, totalResets: 620, members: "28/40", siegeStatus: "Alliance" },
];

export interface SystemSpec {
  component: string;
  minimum: string;
  recommended: string;
}

export const SYSTEM_SPECS: SystemSpec[] = [
  { component: "Operating System", minimum: "Windows 7 / 8 / 10 / 11 (32 or 64-bit)", recommended: "Windows 10 / 11 (64-bit)" },
  { component: "Processor (CPU)", minimum: "Intel Pentium 4 2.0 GHz or AMD Athlon XP", recommended: "Intel Core i3 / i5 or AMD Ryzen 3 / 5" },
  { component: "Memory (RAM)", minimum: "2 GB RAM", recommended: "4 GB RAM or more" },
  { component: "Graphics (GPU)", minimum: "NVIDIA GeForce 6600 or AMD Radeon 9600", recommended: "NVIDIA GeForce GTX 750 / AMD Radeon R7" },
  { component: "DirectX", minimum: "DirectX 9.0c Compatible", recommended: "DirectX 11 / 12" },
  { component: "Storage Space", minimum: "5 GB free hard drive space", recommended: "10 GB SSD free space" },
  { component: "Network", minimum: "Broadband Internet (Ping < 150ms)", recommended: "Fiber Internet (Ping < 50ms)" },
];

export const DOWNLOAD_MIRRORS = [
  {
    name: "Google Drive Mirror",
    speed: "High Speed CDN",
    host: "Google Cloud Storage",
    size: "2.1 GB",
    link: "https://drive.google.com",
    badge: "Most Popular",
  },
  {
    name: "Mega.nz Mirror",
    speed: "Encrypted High Bandwidth",
    host: "Mega Cloud",
    size: "2.1 GB",
    link: "https://mega.nz",
    badge: "Unlimited",
  },
  {
    name: "MediaFire Mirror",
    speed: "Direct One-Click",
    host: "MediaFire Global",
    size: "2.1 GB",
    link: "https://www.mediafire.com",
    badge: "No Captcha",
  },
];

