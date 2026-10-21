"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Users,
  GitBranch,
  ShieldCheck,
  PlusCircle,
  LogIn,
  LogOut,
  UserCheck,
  Calendar,
  Compass,
  Search,
  X,
  Sparkles,
  Bell,
  ChevronDown,
  Upload,
  BookOpen,
  Scroll,
  Heart,
  Landmark,
} from "lucide-react";
import { Member } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenAddMember: () => void;
  onOpenQuickImport?: () => void;
  onOpenDigitalLibrary?: () => void;
  onOpenKinship?: () => void;
  onFocusMember?: (memberId: string) => void;
  isElderlyMode: boolean;
  onToggleElderlyMode: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenAddMember,
  onOpenQuickImport,
  onOpenDigitalLibrary,
  onOpenKinship,
  onFocusMember,
  isElderlyMode,
  onToggleElderlyMode,
}: HeaderProps) {
  const {
    members,
    isAdmin,
    isSuperAdmin,
    currentAdmin,
    logoutAdmin,
    pendingCount,
    trees,
    activeTreeId,
    activeTree,
    setActiveTreeId,
    canCreateTree,
    canBulkImport,
  } = useFamilyStore();

  // Search autocomplete state
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTreeDropdownOpen, setIsTreeDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const treeDropdownRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (
        treeDropdownRef.current &&
        !treeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsTreeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = React.useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return members
      .filter((m) => {
        const nameMatch = m.fullName.toLowerCase().includes(q);
        const nickMatch = m.nickname && m.nickname.toLowerCase().includes(q);
        const birthMatch = m.birthDate && m.birthDate.includes(q);
        const phoneMatch = m.phone && m.phone.includes(q);
        return nameMatch || nickMatch || birthMatch || phoneMatch;
      })
      .slice(0, 8);
  }, [searchTerm, members]);

  const handleSelectSearchResult = (member: Member) => {
    setIsSearchOpen(false);
    setSearchTerm("");
    if (activeTab !== "tree") {
      setActiveTab("tree");
    }
    if (onFocusMember) {
      onFocusMember(member.id);
    }
  };

  const handleNavClick = (tabId: string) => {
    if (tabId === "features") {
      if (activeTab !== "home") {
        setActiveTab("home");
      }
      setTimeout(() => {
        const el = document.getElementById("features-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return;
    }

    if (tabId === "library") {
      if (onOpenDigitalLibrary) onOpenDigitalLibrary();
      return;
    }

    if (tabId === "guide") {
      if (onOpenKinship) onOpenKinship();
      return;
    }

    setActiveTab(tabId);
  };

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* 1. TOP CULTURAL HEADER BAR (Matching user's design image) */}
      <div className="bg-[#450A0A] text-amber-50 px-4 sm:px-6 py-2.5 sm:py-3 border-b border-amber-900/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand Logo & Title */}
          <div
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-amber-200 text-[#450A0A] flex items-center justify-center font-bold shadow-md shadow-amber-950/40 group-hover:scale-105 transition-transform">
              {/* Golden Tree Emblem */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 fill-current">
                <path d="M12 2C7.58 2 4 5.58 4 10c0 3.31 2.02 6.16 4.93 7.37.04.25.07.63.07 1.13v1.5h6v-1.5c0-.5.03-.88.07-1.13C17.98 16.16 20 13.31 20 10c0-4.42-3.58-8-8-8zm0 2c3.31 0 6 2.69 6 6 0 2.22-1.21 4.16-3 5.19V14h-2v-2h-2v2H9v1.19c-1.79-1.03-3-2.97-3-5.19 0-3.31 2.69-6 6-6z" />
              </svg>
            </div>
            
            <div className="hidden xs:block">
              <span className="font-serif font-black text-amber-100 text-sm sm:text-base tracking-wider block leading-tight">
                GIA PHẢ SỐ
              </span>
              <span className="text-[10px] text-amber-300/80 tracking-widest uppercase block">
                {activeTree?.name || "Đại Việt Cội Nguồn"}
              </span>
            </div>
          </div>

          {/* Navigation Links (As seen in the uploaded design) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm font-semibold">
            <button
              type="button"
              onClick={() => handleNavClick("home")}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeTab === "home"
                  ? "bg-amber-500/20 text-amber-200 font-bold"
                  : "text-amber-100/90 hover:text-white hover:bg-white/10"
              }`}
            >
              Trang chủ
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("features")}
              className="px-3 py-1.5 rounded-full text-amber-100/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Tính năng
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("tree")}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeTab === "tree"
                  ? "bg-amber-500/20 text-amber-200 font-bold"
                  : "text-amber-100/90 hover:text-white hover:bg-white/10"
              }`}
            >
              Khám phá
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("library")}
              className="px-3 py-1.5 rounded-full text-amber-100/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Thư viện
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("guide")}
              className="px-3 py-1.5 rounded-full text-amber-100/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Hướng dẫn
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("members")}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeTab === "members"
                  ? "bg-amber-500/20 text-amber-200 font-bold"
                  : "text-amber-100/90 hover:text-white hover:bg-white/10"
              }`}
            >
              Danh sách
            </button>

            <button
              type="button"
              onClick={() => handleNavClick("anniversaries")}
              className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                activeTab === "anniversaries"
                  ? "bg-amber-500/20 text-amber-200 font-bold"
                  : "text-amber-100/90 hover:text-white hover:bg-white/10"
              }`}
            >
              Lịch giỗ
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNavClick("admin")}
                className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer relative ${
                  activeTab === "admin"
                    ? "bg-amber-500/20 text-amber-200 font-bold"
                    : "text-amber-100/90 hover:text-white hover:bg-white/10"
                }`}
              >
                Quản trị
                {pendingCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}
          </nav>

          {/* Right Action Tools: Elderly Mode, Login, Register */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            
            {/* Elderly Mode Switch (Exactly as in the design) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs text-amber-200/90 font-medium hidden sm:inline select-none">
                Elderly Mode / Chế độ dễ dùng
              </span>
              <button
                type="button"
                onClick={onToggleElderlyMode}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  isElderlyMode ? "bg-amber-400" : "bg-black/40 border border-white/20"
                }`}
                title="Bật/Tắt chế độ cỡ chữ to và dễ nhìn cho người lớn tuổi"
                aria-label="Toggle Elderly Mode"
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    isElderlyMode ? "translate-x-5 bg-[#450A0A]" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Login Button (Dark maroon with thin golden border) */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-amber-500/20 text-amber-200 px-2.5 py-1 rounded-full border border-amber-400/30 hidden md:inline">
                  {currentAdmin?.name || "Admin"}
                </span>
                <button
                  type="button"
                  onClick={logoutAdmin}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#2F0606] hover:bg-[#200404] text-rose-300 border border-rose-900/40 transition-colors cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-[#320606] hover:bg-[#200404] text-amber-100 border border-amber-700/50 shadow-xs transition-colors cursor-pointer"
              >
                Đăng nhập
              </button>
            )}

            {/* Register / Action Button (Warm golden pill button) */}
            <button
              type="button"
              onClick={onOpenAddMember}
              className="px-3.5 sm:px-5 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 shadow-md shadow-amber-950/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {isAdmin ? "+ Thêm thành viên" : "Đăng ký"}
            </button>

          </div>

        </div>
      </div>

      {/* 2. SUB-BAR: QUICK SEARCH & TREE SWITCHER (When exploring trees/members) */}
      {activeTab !== "home" && (
        <div className="bg-[#FAF7EE] px-4 py-2 border-b border-amber-900/10 shadow-2xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Tree Switcher */}
            <div ref={treeDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsTreeDropdownOpen(!isTreeDropdownOpen)}
                className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-900/15 hover:border-amber-700 font-semibold text-slate-800 transition-colors cursor-pointer"
              >
                <Landmark className="w-3.5 h-3.5 text-amber-800" />
                <span>{activeTree?.name || "Chọn Cây Gia Phả"}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isTreeDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden py-1">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                    Danh Sách Cây Gia Phả
                  </div>
                  {trees.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setActiveTreeId(t.id);
                        setIsTreeDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                        t.id === activeTreeId
                          ? "bg-amber-50 text-amber-900 font-bold"
                          : "hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span>{t.name}</span>
                      <span className="text-[10px] text-slate-400">{t.memberCount || 0} người</span>
                    </button>
                  ))}
                  {canCreateTree && (
                    <div className="p-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => {
                          setIsTreeDropdownOpen(false);
                          setActiveTab("admin");
                        }}
                        className="w-full py-1.5 bg-[#450A0A] hover:bg-[#5C151F] text-amber-100 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Tạo Cây Gia Phả Mới</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Search */}
            <div ref={searchRef} className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Tìm thành viên theo tên, năm sinh, SĐT..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-amber-900/15 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#450A0A]/30"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />

              {/* Search dropdown results */}
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100">
                  {searchResults.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectSearchResult(m)}
                      className="p-2.5 hover:bg-amber-50/70 cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900">{m.fullName}</p>
                        <p className="text-[10px] text-slate-500">Đời {m.generation} {m.birthDate ? `• NS: ${m.birthDate}` : ""}</p>
                      </div>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {m.gender === "male" ? "Nam" : "Nữ"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Import Button */}
            {canBulkImport && onOpenQuickImport && (
              <button
                type="button"
                onClick={onOpenQuickImport}
                className="inline-flex items-center gap-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-900/20 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-amber-800" />
                <span className="hidden sm:inline">Nhập nhanh (JSON)</span>
              </button>
            )}

          </div>
        </div>
      )}
    </header>
  );
}
