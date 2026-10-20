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
  Calendar,
  Compass,
  Search,
  X,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Member } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";

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
  onOpenAddMember: () => void;
  onOpenAnniversaries?: () => void;
  onOpenKinship?: () => void;
  onFocusMember?: (memberId: string) => void;
  pendingCount?: number;
}

export default function Header({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchRole,
  onOpenLogin,
  onOpenAddMember,
  onOpenAnniversaries,
  onOpenKinship,
  onFocusMember,
  pendingCount = 0,
}: HeaderProps) {
  const { members, resetToSeedData } = useFamilyStore();
  const isAdmin = currentUser.role === "ADMIN";

  // Search autocomplete state
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
    return members
      .filter((m) => {
        const nameMatch = m.fullName.toLowerCase().includes(q);
        const nickMatch = m.nickname && m.nickname.toLowerCase().includes(q);
        const birthMatch = m.birthDate && m.birthDate.includes(q);
        return nameMatch || nickMatch || birthMatch;
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

  const navItems = [
    { id: "tree", label: "Sơ đồ Cây Phả Hệ", icon: GitBranch },
    { id: "members", label: "Danh Sách Thành Viên (Bảng)", icon: Users },
    { id: "anniversaries", label: "Lịch Lễ Giỗ", icon: Calendar },
    { id: "kinship", label: "Tra Cứu Xưng Hô", icon: Compass },
  ];

  if (isAdmin) {
    navItems.push({
      id: "admin",
      label: "Bảng Kiểm Duyệt",
      icon: ShieldCheck,
    });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* 1. TOP UTILITY BAR (Clean, Modern, Slate) */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand Subtitle */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white tracking-wide">
              PHAN FAMILY TREE HUB
            </span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="text-slate-300 hidden sm:inline text-[11px]">
              Quản lý Sơ đồ Gia phả & Danh mục Thành viên Tộc Phan
            </span>
          </div>

          {/* Quick Actions & Role Switcher */}
          <div className="flex items-center gap-2.5">
            {/* Reset to Seed Data */}
            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    "Bạn có chắc muốn khôi phục dữ liệu gốc Đời 1 (Cụ Phan Thạnh & Trần Thị Hoàng) và Đời 2 (9 người con)?"
                  )
                ) {
                  resetToSeedData();
                }
              }}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors border border-slate-700 cursor-pointer active:scale-95"
              title="Khôi phục lại dữ liệu ban đầu Đời 1 và 9 người con Đời 2"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Khôi phục gốc (Đời 1 & 9 con)</span>
            </button>

            {/* Role switch toggle */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => onSwitchRole("GUEST")}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all ${
                  !isAdmin
                    ? "bg-slate-700 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Khách</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole("ADMIN")}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium flex items-center gap-1 transition-all ${
                  isAdmin
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Quản trị</span>
              </button>
            </div>

            {/* Login or User badge */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-blue-950/60 text-blue-200 px-2.5 py-0.5 rounded-lg border border-blue-800/60 text-[11px]">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono text-[10px] hidden md:inline">
                  {currentUser.email}
                </span>
                <span className="bg-blue-600 text-white font-bold text-[9px] px-1.5 rounded">
                  ADMIN
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded text-[11px] transition-colors"
              >
                <LogIn className="w-3 h-3 text-slate-400" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER (Title, Search, Add Member Button) */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => setActiveTab("tree")}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-blue-700 transition-colors">
            TP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                Phan Family Tree Hub
              </span>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2 py-0.5 rounded-full">
                Tộc Phan
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Sơ đồ gia phả & danh mục thành viên trực quan
            </p>
          </div>
        </div>

        {/* Global Member Search */}
        <div ref={searchRef} className="relative flex-1 max-w-md min-w-[240px]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder="Tìm theo họ tên, biệt danh, năm sinh..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 divide-y divide-slate-100">
              <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Kết quả ({searchResults.length})</span>
                <span className="text-slate-400 font-normal">
                  Click để định vị trên cây
                </span>
              </div>
              {searchResults.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleSelectSearchResult(m)}
                  className="px-3 py-2.5 hover:bg-blue-50/70 cursor-pointer flex items-center justify-between transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] text-white shrink-0 ${
                        m.gender === "male" ? "bg-blue-600" : "bg-rose-500"
                      }`}
                    >
                      {m.fullName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-900 leading-tight">
                        {m.fullName}
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Đời {m.generation}
                        {m.orderInFamily ? ` • Con thứ ${m.orderInFamily}` : ""}
                        {m.birthDate ? ` • NS: ${m.birthDate}` : ""}
                        {m.isAlive === false ? " (Đã mất)" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {m.nickname || (m.gender === "male" ? "Nam" : "Nữ")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Member Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAddMember}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Thêm thành viên</span>
          </button>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="border-t border-slate-200 bg-slate-50/60 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-blue-600 text-blue-600 bg-white shadow-2xs rounded-t-lg"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-blue-600" : "text-slate-400"
                  }`}
                />
                <span>{item.label}</span>
                {item.id === "admin" && pendingCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
