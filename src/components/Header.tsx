"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  GitBranch,
  ShieldCheck,
  PlusCircle,
  LogIn,
  UserCheck,
  Eye,
  Sparkles,
  UserPlus,
  Bell,
  Search,
  Calendar,
  Building2,
  X,
  ChevronDown,
  LogOut,
} from "lucide-react";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: {
    email: string;
    name: string;
    role: "ADMIN" | "BRANCH_MANAGER" | "MEMBER" | "GUEST";
  };
  onSwitchRole: (role: "ADMIN" | "GUEST") => void;
  onOpenLogin: () => void;
  onOpenCreateClan: () => void;
  onOpenCreateBranch?: () => void;
  onOpenAddMember: () => void;
  onOpenInvite?: () => void;
  onOpenHistory?: () => void;
  onOpenAnniversaries?: () => void;
  onFocusMember?: (memberId: string) => void;
  allMembers?: any[];
  pendingCount?: number;
  clanName?: string;
}

// Stylized Golden Vietnamese Dragon (Rồng Hoàng Kim thời Lý - Lê)
const GoldenDragon = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 100 60"
    className={`w-10 h-7 sm:w-14 sm:h-9 text-[#E0A926] shrink-0 drop-shadow-sm transition-transform ${
      flip ? "scale-x-[-1]" : ""
    }`}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 45 C 20 40, 25 25, 38 28 C 45 30, 48 42, 60 40 C 72 38, 76 20, 85 18 C 92 16, 96 22, 94 28 C 90 38, 78 48, 65 50 C 50 52, 45 44, 35 48 C 25 52, 18 55, 10 45 Z"
      fill="currentColor"
      opacity="0.95"
    />
    <path
      d="M85 18 C 88 12, 95 10, 98 14 C 100 18, 96 24, 92 24 C 88 24, 84 20, 85 18 Z"
      fill="#FADB7F"
    />
    <path d="M92 16 C 98 8, 88 4, 82 8 C 78 11, 80 15, 84 14 Z" fill="#E0A926" />
    <circle cx="89" cy="18" r="2" fill="#C62828" />
  </svg>
);

export default function Header({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchRole,
  onOpenLogin,
  onOpenCreateClan,
  onOpenCreateBranch,
  onOpenAddMember,
  onOpenInvite,
  onOpenHistory,
  onOpenAnniversaries,
  onFocusMember,
  allMembers = [],
  pendingCount = 0,
  clanName = "Gia phả dòng họ",
}: HeaderProps) {
  const isAdmin = currentUser.role === "ADMIN";

  // Global search autocomplete state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return allMembers
      .filter((m) => {
        const nameMatch = m.fullName.toLowerCase().includes(q);
        const courtesyMatch = m.courtesyName && m.courtesyName.toLowerCase().includes(q);
        const codeMatch = m.memberCode && m.memberCode.toLowerCase().includes(q);
        const birthMatch = m.birthSolar && m.birthSolar.includes(q);
        const branchMatch = m.branchName && m.branchName.toLowerCase().includes(q);
        return nameMatch || courtesyMatch || codeMatch || birthMatch || branchMatch;
      })
      .slice(0, 6);
  }, [searchTerm, allMembers]);

  const handleSelectSearchResult = (member: any) => {
    setIsSearchOpen(false);
    setSearchTerm("");
    if (activeTab !== "tree") {
      setActiveTab("tree");
    }
    if (onFocusMember) {
      onFocusMember(member.id);
    }
  };

  const navItems = [
    { id: "tree", label: "Cây Gia Phả", icon: GitBranch },
    { id: "members", label: "Danh Sách Thành Viên", icon: Users },
  ];

  if (isAdmin) {
    navItems.push({
      id: "admin",
      label: "Bảng Kiểm Duyệt",
      icon: ShieldCheck,
    });
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-[#E8DEC7] shadow-sm">
      {/* 1. TOP SCROLL BANNER: Imperial Red (#C62828) & Gold Trim (#E0A926) flanked by Dual Golden Dragons */}
      <div className="relative bg-gradient-to-r from-[#8E1515] via-[#C62828] to-[#8E1515] text-white border-b-2 border-[#E0A926] shadow-md px-3 py-1.5 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 relative z-10">
          {/* Main Title Scroll flanked by Dual Dragons */}
          <div className="flex items-center space-x-2">
            <GoldenDragon flip={false} />
            <div className="bg-black/25 px-3 py-1 rounded-xl border border-[#E0A926]/40 backdrop-blur-xs flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#E0A926] animate-pulse"></span>
              <span className="font-bold tracking-wider text-[#FADB7F] font-serif text-xs sm:text-sm uppercase">
                Gia phả dòng họ
              </span>
              <span className="hidden md:inline text-amber-200/50">|</span>
              <span className="hidden md:inline italic text-amber-100/90 text-xs font-serif">
                “Tổ Tiên Công Đức Thiên Niên Thịnh — Tử Hiếu Tôn Hiền Vạn Đại Vinh”
              </span>
            </div>
            <GoldenDragon flip={true} />
          </div>

          {/* Quick Shortcuts: Lịch giỗ, Lịch sử từ đường, Role Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Lối tắt 1: Lịch giỗ & Sự kiện tháng này */}
            {onOpenAnniversaries && (
              <button
                type="button"
                onClick={onOpenAnniversaries}
                className="flex items-center space-x-1.5 bg-[#5A0D0D] hover:bg-[#6e1212] border border-[#E0A926]/50 text-amber-100 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shadow-xs"
                title="Xem các ngày giỗ kỵ nhật & sự kiện dòng họ"
              >
                <Calendar className="w-3.5 h-3.5 text-[#E0A926]" />
                <span className="hidden sm:inline">Lịch giỗ họ</span>
              </button>
            )}

            {/* Lối tắt 2: Lịch sử từ đường */}
            {onOpenHistory && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center space-x-1.5 bg-[#5A0D0D] hover:bg-[#6e1212] border border-[#E0A926]/50 text-amber-100 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shadow-xs"
                title="Xem gốc tích, câu đối và nhà thờ họ"
              >
                <Building2 className="w-3.5 h-3.5 text-[#E0A926]" />
                <span className="hidden sm:inline">Lịch sử từ đường</span>
              </button>
            )}

            {/* Lối tắt 3: Kiểm duyệt (Admin Badge) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className="relative flex items-center space-x-1 bg-[#5A0D0D] hover:bg-[#6e1212] border border-[#E0A926]/50 text-amber-100 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shadow-xs"
                title="Bảng kiểm duyệt duyệt hồ sơ đóng góp"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#E0A926]" />
                <span className="hidden sm:inline">Duyệt</span>
                {pendingCount > 0 && (
                  <span className="bg-[#E0A926] text-[#24150B] font-extrabold text-[10px] px-1.5 rounded-full ml-0.5">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Role switch pill */}
            <div className="flex items-center bg-[#5A0D0D] rounded-full p-0.5 border border-[#E0A926]/50 shadow-inner">
              <button
                type="button"
                onClick={() => onSwitchRole("GUEST")}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center space-x-1 transition-all ${
                  !isAdmin
                    ? "bg-[#E0A926] text-[#24150B] font-bold shadow-xs"
                    : "text-amber-200 hover:text-white"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Khách</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole("ADMIN")}
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center space-x-1 transition-all ${
                  isAdmin
                    ? "bg-[#E0A926] text-[#24150B] font-bold shadow-xs"
                    : "text-amber-200 hover:text-white"
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-[#C62828]" />
                <span>Admin</span>
              </button>
            </div>

            {/* Login / Profile */}
            {isAdmin ? (
              <div className="flex items-center space-x-1.5 bg-[#E0A926]/20 text-[#FADB7F] px-2.5 py-1 rounded-full border border-[#E0A926]/40 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-[#E0A926]" />
                <span className="font-mono text-[11px] hidden lg:inline">anhthuphan0102@gmail.com</span>
                <span className="bg-[#E0A926] text-[#24150B] font-bold text-[9px] px-1.5 rounded">
                  ADMIN
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center space-x-1 bg-[#F06292]/20 hover:bg-[#F06292]/30 text-pink-100 px-2.5 py-1 rounded-full border border-[#F06292]/40 text-xs transition-all shadow-xs"
              >
                <LogIn className="w-3 h-3 text-[#F06292]" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN LOGO, GLOBAL SEARCH & ACTION BAR */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab("tree")}
          className="flex items-center space-x-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E5F52] to-[#2B7A6A] border-2 border-[#E0A926] flex items-center justify-center text-[#FADB7F] font-serif font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            GP
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold font-serif text-[#1E5F52] tracking-tight">
                Gia phả dòng họ
              </span>
              <span className="text-[10px] bg-[#FCE4EC] text-[#C62828] border border-[#F06292]/40 font-bold px-1.5 py-0.2 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F06292]"></span>
                <span>Chính Tông</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-500 -mt-0.5">
              Hệ Thống Quản Lý Phả Hệ & Trực Hệ Chuẩn Văn Hóa Việt Nam
            </p>
          </div>
        </div>

        {/* Global Search with Autocomplete Dropdown */}
        <div ref={searchRef} className="relative flex-1 max-w-md min-w-[240px]">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Tìm kiếm theo tên, năm sinh, chi họ..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1E5F52]/30 focus:border-[#1E5F52] transition-all shadow-2xs"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-[#E0A926]/40 overflow-hidden z-50 animate-fade-in divide-y divide-stone-100">
              <div className="px-3 py-1.5 bg-amber-50/70 border-b border-amber-200/50 text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center justify-between">
                <span>Kết quả tìm kiếm ({searchResults.length})</span>
                <span className="text-stone-400 font-normal">Click để định vị trên cây</span>
              </div>
              {searchResults.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelectSearchResult(m)}
                  className="px-3 py-2 hover:bg-emerald-50/60 cursor-pointer flex items-center justify-between transition-colors text-xs"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 text-white shadow-2xs ${
                        m.gender === "MALE" ? "bg-[#1E5F52]" : "bg-[#9C274E]"
                      }`}
                    >
                      {m.fullName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-bold text-stone-900 font-serif leading-tight">
                        {m.fullName}
                      </h5>
                      <p className="text-[10px] text-stone-500">
                        {m.birthOrder ? `${m.birthOrder} • ` : ""}
                        Đời thứ {m.generation}
                        {m.birthSolar ? ` • ${m.birthSolar.slice(0, 4)}` : ""}
                        {m.isAlive === false ? " (Đã mất)" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                    {m.branchName || "Chi họ"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons: Add Member & Create Clan */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Admin Exclusive: Invite Button */}
          {isAdmin && onOpenInvite && (
            <button
              type="button"
              onClick={onOpenInvite}
              className="inline-flex items-center space-x-1.5 bg-[#FAF7EE] hover:bg-[#F5EEDC] text-[#1E5F52] border border-[#E0A926] px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#E0A926]" />
              <span className="hidden sm:inline">Mời thành viên</span>
            </button>
          )}

          {/* Add member button */}
          <button
            type="button"
            onClick={onOpenAddMember}
            className="inline-flex items-center space-x-1.5 bg-[#1E5F52] hover:bg-[#16483E] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all border border-[#E0A926]/40"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#FADB7F]" />
            <span>{isAdmin ? "Thêm người" : "Đóng góp thành viên"}</span>
          </button>

          {/* Admin Exclusive: Create New Clan */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenCreateClan}
              className="inline-flex items-center space-x-1.5 bg-[#C62828] hover:bg-[#A91B1B] text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-md transition-all border border-[#E0A926]/50"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FADB7F]" />
              <span className="hidden sm:inline">Tạo Gia Phả Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="border-t border-[#E8DEC7] bg-[#FDFBF7] px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 py-2 px-4 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#1E5F52] text-[#1E5F52] font-bold bg-[#E6F4F1] rounded-t-lg shadow-2xs"
                    : "border-transparent text-stone-600 hover:text-[#1E5F52] hover:bg-stone-50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-[#1E5F52]" : "text-stone-400"
                  }`}
                />
                <span>{item.label}</span>
                {item.id === "admin" && pendingCount > 0 && (
                  <span className="bg-[#C62828] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                    {pendingCount}
                  </span>
                )}
                {item.id === "tree" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E5F52]"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
