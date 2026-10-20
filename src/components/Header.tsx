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
  Eye,
  Calendar,
  Compass,
  Search,
  X,
  RotateCcw,
  Sparkles,
  Bell,
} from "lucide-react";
import { Member } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenAddMember: () => void;
  onFocusMember?: (memberId: string) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onOpenLogin,
  onOpenAddMember,
  onFocusMember,
}: HeaderProps) {
  const {
    members,
    resetToSeedData,
    isAdmin,
    currentAdmin,
    logoutAdmin,
    pendingCount,
  } = useFamilyStore();

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

  const navItems = [
    { id: "tree", label: "Sơ đồ Cây Phả Hệ", icon: GitBranch },
    { id: "members", label: "Danh Sách Thành Viên (Bảng)", icon: Users },
    { id: "anniversaries", label: "Lịch Lễ Giỗ & Sự Kiện", icon: Calendar },
    { id: "kinship", label: "Tra Cứu Xưng Hô", icon: Compass },
  ];

  if (isAdmin) {
    navItems.push({
      id: "admin",
      label: "Kiểm Duyệt & Quản Trị",
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
                    "Bạn có chắc muốn khôi phục dữ liệu gốc Đời 1 (Cụ Phan Thạnh & Trần Thị Hoàng) và Đời 2 (9 người con) cùng các sự kiện mẫu?"
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

            {/* Notification Bell (for Admin or general pending queue) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className="relative p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700 cursor-pointer"
                title={`${pendingCount} yêu cầu đang chờ phê duyệt`}
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Login / Admin User Badge */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-blue-950/80 text-blue-200 px-2.5 py-0.5 rounded-lg border border-blue-800 text-[11px]">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-semibold text-white hidden md:inline">
                    {currentAdmin?.name}
                  </span>
                  <span className="bg-blue-600 text-white font-bold text-[9px] px-1.5 rounded">
                    {currentAdmin?.role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logoutAdmin}
                  className="flex items-center gap-1 text-slate-400 hover:text-rose-300 text-[11px] px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Đăng xuất quyền quản trị"
                >
                  <LogOut className="w-3 h-3" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập Admin</span>
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
              Sơ đồ gia phả trực quan, lịch tộc & kiểm duyệt đổi mới
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
              placeholder="Tìm theo họ tên, SĐT, biệt danh, năm sinh..."
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
                        {m.phone ? ` • SĐT: ${m.phone}` : ""}
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
            className={`inline-flex items-center gap-1.5 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer ${
              isAdmin ? "bg-slate-900 hover:bg-slate-800" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAdmin ? "+ Thêm thành viên (Trực tiếp)" : "+ Đề xuất thành viên"}</span>
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
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1 animate-pulse">
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
