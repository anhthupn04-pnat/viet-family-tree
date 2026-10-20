"use client";

import React from "react";
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
  pendingCount?: number;
  clanName?: string;
}

// Stylized Golden Dragon SVG motif
const GoldenDragon = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 100 60"
    className={`w-12 h-8 sm:w-16 sm:h-10 text-[#E0A926] shrink-0 drop-shadow-sm ${
      flip ? "scale-x-[-1]" : ""
    }`}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Stylized Vietnamese Royal Dragon (Rồng Thời Lý/Lê) */}
    <path
      d="M10 45 C 20 40, 25 25, 38 28 C 45 30, 48 42, 60 40 C 72 38, 76 20, 85 18 C 92 16, 96 22, 94 28 C 90 38, 78 48, 65 50 C 50 52, 45 44, 35 48 C 25 52, 18 55, 10 45 Z"
      fill="currentColor"
      opacity="0.95"
    />
    <path
      d="M85 18 C 88 12, 95 10, 98 14 C 100 18, 96 24, 92 24 C 88 24, 84 20, 85 18 Z"
      fill="#FADB7F"
    />
    <path
      d="M92 16 C 98 8, 88 4, 82 8 C 78 11, 80 15, 84 14 Z"
      fill="#E0A926"
    />
    <circle cx="89" cy="18" r="2" fill="#C62828" />
    <path
      d="M25 35 C 28 30, 34 32, 33 37 C 32 42, 27 40, 25 35 Z"
      fill="#FADB7F"
      opacity="0.7"
    />
    <path
      d="M48 35 C 52 30, 58 32, 57 37 C 56 42, 50 40, 48 35 Z"
      fill="#FADB7F"
      opacity="0.7"
    />
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
  pendingCount = 0,
  clanName = "Gia phả dòng họ",
}: HeaderProps) {
  const isAdmin = currentUser.role === "ADMIN";

  // Focused Navigation: Tree view, Members list, and Admin approval dashboard
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
      <div className="relative bg-gradient-to-r from-[#8E1515] via-[#C62828] to-[#8E1515] text-white border-b-2 border-[#E0A926] shadow-md px-3 py-2 overflow-hidden">
        {/* Subtle decorative scroll edge rings */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-[#E0A926] opacity-40"></div>
        <div className="absolute right-0 top-0 bottom-0 w-3 bg-[#E0A926] opacity-40"></div>

        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 relative z-10">
          {/* Main Title Scroll flanked by Dual Dragons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <GoldenDragon flip={false} />

            {/* Scroll text container */}
            <div className="bg-black/25 px-3 py-1 rounded-xl border border-[#E0A926]/40 backdrop-blur-xs flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#E0A926] animate-pulse"></span>
              <span className="font-bold tracking-wide text-[#FADB7F] font-serif text-xs sm:text-sm">
                Gia phả dòng họ
              </span>
              <span className="hidden md:inline text-amber-200/50">|</span>
              <span className="hidden md:inline italic text-amber-100/90 text-xs font-serif">
                “Tổ Tiên Công Đức Thiên Niên Thịnh — Tử Hiếu Tôn Hiền Vạn Đại Vinh”
              </span>
            </div>

            <GoldenDragon flip={true} />
          </div>

          {/* Quick Role Switcher, Pending Bell & Identity */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notification Bell with Badge for Admin */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className="relative p-1.5 rounded-full bg-[#5A0D0D] border border-[#E0A926]/40 text-[#FADB7F] hover:bg-[#6e1212] transition-colors"
                title={`Bảng kiểm duyệt: ${pendingCount} yêu cầu đang chờ`}
              >
                <Bell className="w-4 h-4" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#E0A926] text-[#24150B] font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Switch role toggle */}
            <div className="flex items-center bg-[#5A0D0D] rounded-full p-0.5 border border-[#E0A926]/50 shadow-inner">
              <button
                type="button"
                onClick={() => onSwitchRole("GUEST")}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center space-x-1.5 transition-all ${
                  !isAdmin
                    ? "bg-[#E0A926] text-[#24150B] font-bold shadow-md"
                    : "text-amber-200 hover:text-white"
                }`}
                title="Chế độ Thành viên / Khách"
              >
                <Eye className="w-3 h-3" />
                <span>Khách/Thành viên</span>
              </button>

              <button
                type="button"
                onClick={() => onSwitchRole("ADMIN")}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold flex items-center space-x-1.5 transition-all ${
                  isAdmin
                    ? "bg-[#E0A926] text-[#24150B] font-bold shadow-md"
                    : "text-amber-200 hover:text-white"
                }`}
                title="Chế độ Tổng Quản Trị"
              >
                <ShieldCheck className="w-3 h-3 text-[#C62828]" />
                <span>Admin</span>
              </button>
            </div>

            {/* Status indicator */}
            {isAdmin ? (
              <div className="hidden sm:flex items-center space-x-1.5 bg-[#E0A926]/20 text-[#FADB7F] px-2.5 py-1 rounded-lg border border-[#E0A926]/40 text-xs">
                <UserCheck className="w-3.5 h-3.5 text-[#E0A926]" />
                <span className="font-mono text-[11px]">anhthuphan0102@gmail.com</span>
                <span className="bg-[#E0A926] text-[#24150B] font-bold text-[9px] px-1 rounded ml-1">
                  ADMIN
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center space-x-1 bg-[#F06292]/20 hover:bg-[#F06292]/30 text-pink-100 px-2.5 py-1 rounded-lg border border-[#F06292]/40 text-xs transition-all shadow-xs"
              >
                <LogIn className="w-3 h-3 text-[#F06292]" />
                <span>Đăng nhập Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. MAIN LOGO & ACTION BAR */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand with Lotus Pink & Jade Green accents */}
        <div
          onClick={() => setActiveTab("tree")}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          {/* Logo icon with Jade Green (#1E5F52) & Gold border */}
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
              VietFamilyTree — Quản Lý Phả Hệ & Trực Hệ Dòng Họ
            </p>
          </div>
        </div>

        {/* Action Buttons with RBAC */}
        <div className="flex items-center space-x-2">
          {/* Admin Exclusive: Invite Link Button */}
          {isAdmin && onOpenInvite && (
            <button
              type="button"
              onClick={onOpenInvite}
              className="inline-flex items-center space-x-1.5 bg-[#FAF7EE] hover:bg-[#F5EEDC] text-[#1E5F52] border border-[#E0A926] px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all"
              title="Tạo liên kết bảo mật mời thành viên"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#E0A926]" />
              <span className="hidden sm:inline">Mời thành viên</span>
            </button>
          )}

          {/* Add Member Button: Available to all, but status is handled by role */}
          <button
            type="button"
            onClick={onOpenAddMember}
            className="inline-flex items-center space-x-1.5 bg-[#1E5F52] hover:bg-[#16483E] text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all border border-[#E0A926]/40"
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#FADB7F]" />
            <span>{isAdmin ? "Thêm thành viên" : "Đóng góp thành viên"}</span>
          </button>

          {/* Admin Exclusive: "Tạo Gia Phả Mới" - ONLY Admin can see & use this */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenCreateClan}
              className="inline-flex items-center space-x-1.5 bg-[#C62828] hover:bg-[#A91B1B] text-white font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-md transition-all border border-[#E0A926]/50"
              title="Khởi tạo một gia phả dòng họ mới"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FADB7F]" />
              <span>Tạo Gia Phả Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. NAVIGATION TABS (Focused Minimalist Scope) */}
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
                className={`flex items-center space-x-1.5 py-2.5 px-4 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
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
