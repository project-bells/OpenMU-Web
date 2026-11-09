import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit,
  ShieldCheck,
  UserCheck,
  UserX,
  X,
  Check,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

export interface ManagedUser {
  id: string;
  username: string;
  email: string;
  role: "Admin GM" | "VIP" | "Moderator" | "Player";
  status: "Active" | "Banned";
  characters: string;
  level: number;
  resets: number;
  credits: number;
  wcoin: number;
  lastLogin: string;
  ipAddress: string;
  banReason?: string;
  notes?: string;
}

const INITIAL_USERS: ManagedUser[] = [
  {
    id: "u-1",
    username: "admin",
    email: "gm.ares@egis-mu.com",
    role: "Admin GM",
    status: "Active",
    characters: "GM_Ares (BM Lv.400)",
    level: 400,
    resets: 50,
    credits: 1500,
    wcoin: 800,
    lastLogin: "2 นาทีที่แล้ว",
    ipAddress: "127.0.0.1",
    notes: "Senior GameMaster",
  },
  {
    id: "u-2",
    username: "lorencia_pro",
    email: "lorencia.pvp@gmail.com",
    role: "VIP",
    status: "Active",
    characters: "BladeKnight_X (BM Lv.400)",
    level: 400,
    resets: 18,
    credits: 1450,
    wcoin: 700,
    lastLogin: "10 นาทีที่แล้ว",
    ipAddress: "171.96.12.45",
    notes: "Top Rank BK Fighter",
  },
  {
    id: "u-3",
    username: "magic_wizard",
    email: "grandmaster.th@hotmail.com",
    role: "Player",
    status: "Active",
    characters: "GrandMaster_99 (GM Lv.398)",
    level: 398,
    resets: 14,
    credits: 320,
    wcoin: 150,
    lastLogin: "25 นาทีที่แล้ว",
    ipAddress: "182.232.88.19",
  },
  {
    id: "u-4",
    username: "elf_archer",
    email: "muse.fairy@yahoo.com",
    role: "VIP",
    status: "Active",
    characters: "HighElf_Fairy (HE Lv.365)",
    level: 365,
    resets: 12,
    credits: 890,
    wcoin: 450,
    lastLogin: "1 ชั่วโมงที่แล้ว",
    ipAddress: "49.228.104.72",
    notes: "Guild Master of VENDETTA",
  },
  {
    id: "u-5",
    username: "dark_summoner",
    email: "bloody.curse@outlook.com",
    role: "Player",
    status: "Active",
    characters: "BloodySum_TH (BS Lv.340)",
    level: 340,
    resets: 8,
    credits: 280,
    wcoin: 100,
    lastLogin: "3 ชั่วโมงที่แล้ว",
    ipAddress: "124.120.55.80",
  },
  {
    id: "u-6",
    username: "rage_fighter",
    email: "brawler.fist@gmail.com",
    role: "Player",
    status: "Active",
    characters: "FistMaster_KO (FM Lv.310)",
    level: 310,
    resets: 6,
    credits: 190,
    wcoin: 50,
    lastLogin: "5 ชั่วโมงที่แล้ว",
    ipAddress: "110.168.32.14",
  },
  {
    id: "u-7",
    username: "speed_hacker_99",
    email: "bot01@shady-server.net",
    role: "Player",
    status: "Banned",
    characters: "FastDK_Bot (DK Lv.150)",
    level: 150,
    resets: 1,
    credits: 0,
    wcoin: 0,
    lastLogin: "2 วันที่แล้ว",
    ipAddress: "103.22.180.99",
    banReason: "ใช้โปรแกรมโกง Speedhack (ตรวจจับโดย GameGuard)",
  },
  {
    id: "u-8",
    username: "castle_conqueror",
    email: "vendetta.leader@egis-mu.com",
    role: "Moderator",
    status: "Active",
    characters: "LordEmperor_V (LE Lv.400)",
    level: 400,
    resets: 25,
    credits: 2500,
    wcoin: 1200,
    lastLogin: "30 นาทีที่แล้ว",
    ipAddress: "58.8.112.90",
    notes: "Castle Lord Assistant",
  },
  {
    id: "u-9",
    username: "pk_demon_th",
    email: "redhead.killer@mu.in.th",
    role: "Player",
    status: "Active",
    characters: "RedOutlaw (BM Lv.380)",
    level: 380,
    resets: 15,
    credits: 620,
    wcoin: 210,
    lastLogin: "4 ชั่วโมงที่แล้ว",
    ipAddress: "223.24.101.44",
    notes: "Lorencia Arena Outlaw (PK Level 3)",
  },
  {
    id: "u-10",
    username: "dupe_exploiter_x",
    email: "exploit.bug@trashmail.org",
    role: "Player",
    status: "Banned",
    characters: "GlitchSM (SM Lv.200)",
    level: 200,
    resets: 2,
    credits: 50,
    wcoin: 0,
    lastLogin: "5 วันที่แล้ว",
    ipAddress: "194.26.29.11",
    banReason: "พยายามใช้บั๊กปั๊มไอเทมในคลัง (Duplication Exploit)",
  },
  {
    id: "u-11",
    username: "mu_veteran_2003",
    email: "classic.mu2003@gmail.com",
    role: "VIP",
    status: "Active",
    characters: "OldSchoolBK (BM Lv.400)",
    level: 400,
    resets: 32,
    credits: 3400,
    wcoin: 1800,
    lastLogin: "1 วันที่แล้ว",
    ipAddress: "115.87.210.33",
    notes: "ผู้เล่นเก่ายุค 2003 • ซื้อ VIP Platinum 30 วัน",
  },
  {
    id: "u-12",
    username: "streamer_th",
    email: "twitch.th@streamer.tv",
    role: "VIP",
    status: "Active",
    characters: "StreamElf (HE Lv.375)",
    level: 375,
    resets: 16,
    credits: 1800,
    wcoin: 950,
    lastLogin: "6 ชั่วโมงที่แล้ว",
    ipAddress: "171.99.45.12",
    notes: "Official Community Partner",
  },
];

type SortKey = "username" | "email" | "role" | "level" | "credits" | "wcoin" | "status" | "lastLogin";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Banned">("All");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [sortKey, setSortKey] = useState<SortKey>("username");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [editModalUser, setEditModalUser] = useState<ManagedUser | null>(null);
  const [editCredits, setEditCredits] = useState(0);
  const [editWcoin, setEditWcoin] = useState(0);
  const [editEmail, setEditEmail] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [roleModalUser, setRoleModalUser] = useState<ManagedUser | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<ManagedUser["role"]>("Player");

  const [banModalUser, setBanModalUser] = useState<ManagedUser | null>(null);
  const [banReasonInput, setBanReasonInput] = useState("การใช้โปรแกรมช่วยเล่น / บอท");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter & Search
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.characters.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.ipAddress.includes(searchQuery);

      const matchStatus = statusFilter === "All" ? true : u.status === statusFilter;
      const matchRole = roleFilter === "All" ? true : u.role === roleFilter;

      return matchSearch && matchStatus && matchRole;
    });
  }, [users, searchQuery, statusFilter, roleFilter]);

  // Sort
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let valA: any = a[sortKey];
      let valB: any = b[sortKey];

      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Open Edit Modal
  const openEdit = (u: ManagedUser) => {
    setEditModalUser(u);
    setEditCredits(u.credits);
    setEditWcoin(u.wcoin);
    setEditEmail(u.email);
    setEditNotes(u.notes || "");
  };

  const saveEdit = () => {
    if (!editModalUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editModalUser.id
          ? {
              ...u,
              credits: editCredits,
              wcoin: editWcoin,
              email: editEmail,
              notes: editNotes,
            }
          : u
      )
    );
    showToast(`อัปเดตข้อมูลผู้เล่น ${editModalUser.username} เรียบร้อยแล้ว`);
    setEditModalUser(null);
  };

  // Open Role Modal
  const openRoleModal = (u: ManagedUser) => {
    setRoleModalUser(u);
    setSelectedNewRole(u.role);
  };

  const saveRole = () => {
    if (!roleModalUser) return;
    setUsers((prev) =>
      prev.map((u) => (u.id === roleModalUser.id ? { ...u, role: selectedNewRole } : u))
    );
    showToast(`เปลี่ยน Role ของ @${roleModalUser.username} เป็น "${selectedNewRole}" สำเร็จ`);
    setRoleModalUser(null);
  };

  // Open Ban Modal
  const openBanModal = (u: ManagedUser) => {
    setBanModalUser(u);
    setBanReasonInput(u.banReason || "การใช้โปรแกรมช่วยเล่น / บอท");
  };

  const toggleBanStatus = () => {
    if (!banModalUser) return;
    const isCurrentlyBanned = banModalUser.status === "Banned";
    const nextStatus: ManagedUser["status"] = isCurrentlyBanned ? "Active" : "Banned";

    setUsers((prev) =>
      prev.map((u) =>
        u.id === banModalUser.id
          ? {
              ...u,
              status: nextStatus,
              banReason: isCurrentlyBanned ? undefined : banReasonInput,
            }
          : u
      )
    );

    showToast(
      isCurrentlyBanned
        ? `ปลดแบนผู้เล่น @${banModalUser.username} เรียบร้อยแล้ว (สถานะ Active)`
        : `ระงับการใช้งาน @${banModalUser.username} เรียบร้อยแล้ว (สถานะ Banned)`
    );
    setBanModalUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-950/90 px-4 py-3 text-xs font-bold text-emerald-200 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-black text-white sm:text-3xl">
            User Management <span className="text-amber-400">(ระบบจัดการผู้เล่น)</span>
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Data Grid แสดงรายชื่อผู้เล่น ค้นหา กรองสถานะ จัดเรียง และจัดการสิทธิ์แบบทันที
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-300">
            ผู้เล่นทั้งหมด: <strong className="text-amber-400">{users.length}</strong> คน
          </span>
          <button
            onClick={() => setUsers(INITIAL_USERS)}
            title="รีเซ็ตข้อมูล Mock เริ่มต้น"
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>รีเซ็ตตาราง</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="glass-strong rounded-2xl border border-white/10 p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อผู้ใช้ (Username), อีเมล หรือตัวละคร…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 focus:border-amber-400/60 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#090d18] py-2.5 pr-8 pl-3.5 text-xs text-slate-200 focus:border-amber-400/60 focus:outline-none"
              >
                <option value="All">ทุกสถานะ (Status: All)</option>
                <option value="Active">🟢 สถานะปกติ (Active)</option>
                <option value="Banned">🔴 ถูกระงับ (Banned)</option>
              </select>
              <Filter className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#090d18] py-2.5 pr-8 pl-3.5 text-xs text-slate-200 focus:border-amber-400/60 focus:outline-none"
              >
                <option value="All">ทุกระดับสิทธิ์ (Role: All)</option>
                <option value="Admin GM">👑 Admin GM</option>
                <option value="VIP">⭐ VIP Member</option>
                <option value="Moderator">🛡️ Moderator</option>
                <option value="Player">⚔️ ผู้เล่นทั่วไป (Player)</option>
              </select>
              <Filter className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Data Grid Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#090d18]/70 shadow-xl backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            {/* Table Header with Sortable Buttons */}
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th
                  onClick={() => handleSort("username")}
                  className="cursor-pointer px-4 py-3.5 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ผู้เล่น / USERNAME</span>
                    {sortKey === "username" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-amber-400" /> : <ArrowDown className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("email")}
                  className="cursor-pointer px-4 py-3.5 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>อีเมล (EMAIL)</span>
                    {sortKey === "email" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-amber-400" /> : <ArrowDown className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("role")}
                  className="cursor-pointer px-4 py-3.5 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ระดับสิทธิ์ (ROLE)</span>
                    {sortKey === "role" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-amber-400" /> : <ArrowDown className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("level")}
                  className="cursor-pointer px-4 py-3.5 transition hover:bg-white/[0.04] hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>ตัวละครหลัก / LEVEL</span>
                    {sortKey === "level" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-amber-400" /> : <ArrowDown className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("credits")}
                  className="cursor-pointer px-4 py-3.5 text-right transition hover:bg-white/[0.04] hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>CREDITS</span>
                    {sortKey === "credits" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-amber-400" /> : <ArrowDown className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("wcoin")}
                  className="cursor-pointer px-4 py-3.5 text-right transition hover:bg-white/[0.04] hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>WCOIN</span>
                    {sortKey === "wcoin" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-amber-400" /> : <ArrowDown className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </div>
                </th>

                <th
                  onClick={() => handleSort("status")}
                  className="cursor-pointer px-4 py-3.5 text-center transition hover:bg-white/[0.04] hover:text-white"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>สถานะ (STATUS)</span>
                    {sortKey === "status" ? (
                      sortDirection === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-amber-400" /> : <ArrowDown className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <ArrowUpDown className="h-3 w-3 opacity-40" />
                    )}
                  </div>
                </th>

                <th className="px-4 py-3.5 text-right font-extrabold text-amber-400">
                  ACTIONS (จัดการ)
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-white/5">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 text-slate-600" />
                      <p className="text-sm font-semibold">ไม่พบผู้เล่นที่ตรงกับเงื่อนไขการค้นหา</p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setStatusFilter("All");
                          setRoleFilter("All");
                        }}
                        className="mt-1 text-xs font-bold text-amber-400 hover:underline"
                      >
                        ล้างตัวกรองทั้งหมด
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedUsers.map((u) => {
                  const isBanned = u.status === "Banned";
                  return (
                    <tr
                      key={u.id}
                      className={`transition ${
                        isBanned
                          ? "bg-rose-950/10 opacity-75 hover:bg-rose-950/20"
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Username */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`grid h-8 w-8 place-items-center rounded-xl font-bold ${
                              u.role === "Admin GM"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : u.role === "VIP"
                                ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                                : "bg-white/5 text-slate-300"
                            }`}
                          >
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                              <span>{u.username}</span>
                              {u.role === "Admin GM" && (
                                <span className="rounded bg-rose-500/20 px-1 py-0.2 text-[9px] text-rose-300 font-sans">
                                  GM
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">IP: {u.ipAddress}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 font-mono text-slate-300">
                        {u.email}
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            u.role === "Admin GM"
                              ? "border border-rose-500/50 bg-rose-500/15 text-rose-300"
                              : u.role === "VIP"
                              ? "border border-amber-400/50 bg-amber-400/15 text-amber-300"
                              : u.role === "Moderator"
                              ? "border border-blue-400/50 bg-blue-500/15 text-blue-300"
                              : "border border-white/10 bg-white/5 text-slate-400"
                          }`}
                        >
                          {u.role === "VIP" && <Sparkles className="h-2.5 w-2.5" />}
                          {u.role}
                        </span>
                      </td>

                      {/* Characters & Level */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-200">{u.characters}</div>
                        <div className="text-[10px] text-amber-400 font-mono">
                          Resets: {u.resets} ครั้ง
                        </div>
                      </td>

                      {/* Credits */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-amber-300">
                        {u.credits.toLocaleString()}
                      </td>

                      {/* WCoin */}
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-purple-300">
                        {u.wcoin.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            isBanned
                              ? "border border-rose-500/50 bg-rose-500/20 text-rose-300"
                              : "border border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isBanned ? "bg-rose-400" : "bg-emerald-400"
                            }`}
                          />
                          {u.status}
                        </span>
                      </td>

                      {/* Actions: Edit, Change Role, Ban */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1. Edit Button */}
                          <button
                            onClick={() => openEdit(u)}
                            title="แก้ไขข้อมูลผู้เล่น / ยอด Credits & WCoin"
                            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition hover:border-amber-400/40 hover:bg-amber-400/15 hover:text-white"
                          >
                            <Edit className="h-3 w-3 text-amber-400" />
                            <span>Edit</span>
                          </button>

                          {/* 2. Change Role Button */}
                          <button
                            onClick={() => openRoleModal(u)}
                            title="ปรับเปลี่ยนระดับสิทธิ์ (Role)"
                            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition hover:border-blue-400/40 hover:bg-blue-500/15 hover:text-white"
                          >
                            <UserCheck className="h-3 w-3 text-blue-400" />
                            <span>Role</span>
                          </button>

                          {/* 3. Ban / Unban Button */}
                          <button
                            onClick={() => openBanModal(u)}
                            title={isBanned ? "ปลดการระงับบัญชี" : "ระงับการใช้งานบัญชี (Ban)"}
                            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-bold transition ${
                              isBanned
                                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                                : "border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                            }`}
                          >
                            {isBanned ? (
                              <>
                                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                                <span>Unban</span>
                              </>
                            ) : (
                              <>
                                <UserX className="h-3 w-3 text-rose-400" />
                                <span>Ban</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Grid Footer Bar */}
        <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-slate-400">
          <div>
            แสดงผล <strong className="text-white">{sortedUsers.length}</strong> จาก{" "}
            <strong className="text-white">{users.length}</strong> บัญชีผู้เล่น
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px]">S6E3 OpenMU Engine Data Grid</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. EDIT MODAL (Confirm changes to Credits, WCoin, Email, Notes) */}
      {/* ============================================================== */}
      {editModalUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={() => setEditModalUser(null)}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          />
          <div className="glass-strong gold-border-glow relative z-10 w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-amber-400" />
                <h3 className="font-display text-base font-bold text-white">
                  แก้ไขข้อมูลผู้เล่น: <span className="text-amber-400">@{editModalUser.username}</span>
                </h3>
              </div>
              <button
                onClick={() => setEditModalUser(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="mb-1 block font-semibold text-slate-300">อีเมล (Email)</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white focus:border-amber-400/60 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-semibold text-amber-300">Credits สะสม</label>
                  <input
                    type="number"
                    min={0}
                    value={editCredits}
                    onChange={(e) => setEditCredits(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 font-mono text-white focus:border-amber-400/60 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-semibold text-purple-300">WCoin คงเหลือ</label>
                  <input
                    type="number"
                    min={0}
                    value={editWcoin}
                    onChange={(e) => setEditWcoin(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 font-mono text-white focus:border-purple-400/60 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-semibold text-slate-300">หมายเหตุ GM (Internal Notes)</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="บันทึกข้อมูลเพิ่มเติมเกี่ยวกับผู้เล่นนี้…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-white focus:border-amber-400/60 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setEditModalUser(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="btn-shine rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-2 text-xs font-bold text-slate-950 hover:brightness-110"
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CHANGE ROLE MODAL */}
      {/* ============================================================== */}
      {roleModalUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={() => setRoleModalUser(null)}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          />
          <div className="glass-strong gold-border-glow relative z-10 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-400" />
                <h3 className="font-display text-base font-bold text-white">
                  เปลี่ยนสิทธิ์ (Role): @{roleModalUser.username}
                </h3>
              </div>
              <button
                onClick={() => setRoleModalUser(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-3 text-xs text-slate-300">
              เลือกระดับสิทธิ์ใหม่สำหรับผู้เล่นนี้ สิทธิ์จะมีผลทันทีในระบบ:
            </p>

            <div className="space-y-2">
              {(["Player", "VIP", "Moderator", "Admin GM"] as ManagedUser["role"][]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedNewRole(r)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left text-xs transition ${
                    selectedNewRole === r
                      ? "border-amber-400 bg-amber-400/20 text-white shadow-sm ring-1 ring-amber-400/50"
                      : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20"
                  }`}
                >
                  <span className="font-bold">{r}</span>
                  {selectedNewRole === r && <Check className="h-4 w-4 text-amber-400" />}
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={saveRole}
                className="btn-shine rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-xs font-bold text-white hover:brightness-110"
              >
                ยืนยันการเปลี่ยน Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. BAN / UNBAN CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {banModalUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={() => setBanModalUser(null)}
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          />
          <div className="glass-strong relative z-10 w-full max-w-md rounded-3xl border border-rose-500/40 p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                  banModalUser.status === "Banned"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                }`}
              >
                {banModalUser.status === "Banned" ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <AlertTriangle className="h-6 w-6" />
                )}
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-white">
                  {banModalUser.status === "Banned"
                    ? "ยืนยันการปลดแบนผู้เล่น (Unban User)"
                    : "ยืนยันการระงับบัญชีผู้เล่น (Ban User)"}
                </h3>
                <p className="text-xs text-slate-400">
                  บัญชีเป้าหมาย: <span className="font-mono font-bold text-white">@{banModalUser.username}</span>
                </p>
              </div>
            </div>

            {banModalUser.status !== "Banned" ? (
              <div className="mt-4 space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  เมื่อระงับบัญชี ผู้เล่นจะไม่สามารถเข้าเกมและหน้าเว็บได้ จนกว่า GM จะทำการปลดแบน:
                </p>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-300">
                    เหตุผลในการแบน (Reason for Suspension)
                  </label>
                  <input
                    type="text"
                    value={banReasonInput}
                    onChange={(e) => setBanReasonInput(e.target.value)}
                    placeholder="เช่น ใช้โปรแกรมช่วยเล่น, พูดจาไม่สุภาพ, ปั๊มไอเทม"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs text-white focus:border-rose-400/60 focus:outline-none"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {[
                      "การใช้โปรแกรมช่วยเล่น / บอท",
                      "ตรวจพบ Speedhack โดย GameGuard",
                      "พยายามบั๊กปั๊มไอเทม (Dupe)",
                      "พฤติกรรม Toxic / ละเมิดกฎเซิร์ฟเวอร์",
                    ].map((reason) => (
                      <button
                        key={reason}
                        type="button"
                        onClick={() => setBanReasonInput(reason)}
                        className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-slate-400 hover:text-white"
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
                <p>
                  ผู้เล่นนี้ถูกระงับเมื่อ:{" "}
                  <span className="text-rose-300 font-medium">{banModalUser.banReason || "ไม่ระบุเหตุผล"}</span>
                </p>
                <p className="mt-1 text-[11px] text-emerald-300">
                  การกดปลดแบนจะคืนสถานะเป็น Active และอนุญาตให้ล็อกอินเข้าเล่นเกมตามปกติ
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setBanModalUser(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={toggleBanStatus}
                className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:brightness-110 ${
                  banModalUser.status === "Banned"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20"
                    : "bg-gradient-to-r from-rose-600 to-red-600 shadow-rose-500/20"
                }`}
              >
                {banModalUser.status === "Banned" ? "ยืนยันปลดแบน" : "ยืนยันระงับบัญชี (BAN)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
