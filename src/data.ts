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
  { id: "dk", name: "Dark Knight", title: "Blade Master", stats: { STR: 95, AGI: 60, VIT: 88, ENE: 25 }, skills: ["Twisting Slash", "Death Stab", "Greater Fortitude", "Combo System"], image: "/images/class-dk.jpg", color: "#ff5a3c", icon: "Sword" },
  { id: "dw", name: "Dark Wizard", title: "Soul Master", stats: { STR: 20, AGI: 55, VIT: 45, ENE: 98 }, skills: ["Evil Spirit", "Hellfire", "Teleport", "Mana Shield"], image: "/images/class-dw.jpg", color: "#8b5cf6", icon: "Sparkles" },
  { id: "elf", name: "Fairy Elf", title: "Muse Elf", stats: { STR: 55, AGI: 92, VIT: 50, ENE: 80 }, skills: ["Greater Damage", "Greater Defense", "Heal", "Penetration"], image: "/images/class-elf.jpg", color: "#38e1ff", icon: "Heart" },
  { id: "dl", name: "Dark Lord", title: "Lord Emperor", stats: { STR: 80, AGI: 65, VIT: 75, ENE: 70, CMD: 96 }, skills: ["Fire Burst", "Force Wave", "Summon Pets", "Critical Damage+"], image: "/images/class-dl.jpg", color: "#f5c451", icon: "Crown" },
  { id: "mg", name: "Magic Gladiator", title: "Duel Master", stats: { STR: 85, AGI: 70, VIT: 60, ENE: 85 }, skills: ["Gigantic Storm", "Fire Slash", "Power Slash", "Mana Shield"], image: "/images/class-dk.jpg", color: "#ff8a3c", icon: "Flame" },
  { id: "sum", name: "Summoner", title: "Bloody Summoner", stats: { STR: 25, AGI: 60, VIT: 55, ENE: 92 }, skills: ["Berserker", "Weakness", "Chain Lightning", "Sleep"], image: "/images/class-dw.jpg", color: "#ec4899", icon: "Moon" },
  { id: "rf", name: "Rage Fighter", title: "Fist Master", stats: { STR: 90, AGI: 85, VIT: 82, ENE: 30 }, skills: ["Dark Side", "Dragon Punch", "Ignore Defense", "Charge"], image: "/images/class-dl.jpg", color: "#22c55e", icon: "Zap" },
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
