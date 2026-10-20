"use client";

import React, { useState } from "react";
import {
  Users,
  GitBranch,
  Search,
  Calendar,
  BookOpen,
  DollarSign,
  ShieldCheck,
  Home,
  PlusCircle,
  LogIn,
  LogOut,
  UserCheck,
  Eye,
  Sliders,
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
  onOpenCreateBranch: () => void;
  onOpenAddMember: () => void;
  clanName?: string;
}

export default function Header({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchRole,
  onOpenLogin,
  onOpenCreateClan,
  onOpenCreateBranch,
  onOpenAddMember,
  clanName = "Gia Phả Phan Tộc Đại Tông",
}: HeaderProps) {
  const isAdmin = currentUser.role === "ADMIN";

  const navItems = [
    { id: "overview", label: "Trang Chủ", icon: Home },
    { id: "tree", label: "Cây Gia Phả", icon: GitBranch },
    { id: "members", label: "Thành Viên", icon: Users },
    { id: "branches", label: "Chi Họ & Nhánh", icon: Sliders },
    { id: "kinship", label: "Tra Cứu Xưng Hô", icon: Search },
    { id: "anniversaries", label: "Lịch Giỗ & Sự Kiện", icon: Calendar },
    { id: "documents", label: "Tư Liệu Cổ", icon: BookOpen },
    { id: "funds", label: "Quỹ Dòng Họ", icon: DollarSign },
  ];

  if (isAdmin) {
    navItems.push({ id: "admin", label: "Quản Trị & Duyệt", icon: ShieldCheck });
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#E5DAC6] shadow-sm">
      {/* Top Bar: Dòng họ info, Role Badge & Switcher */}
      <div className="bg-[#8B1E1E] text-white px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Câu đối & Tên dòng họ */}
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#C59B27] animate-pulse"></span>
            <span className="font-semibold tracking-wide text-amber-200">
              {clanName}
            </span>
            <span className="hidden sm:inline text-amber-100/70">|</span>
            <span className="hidden sm:inline italic text-amber-100/90 font-serif">
              “Tổ Tiên Công Đức Thiên Niên Thịnh — Tử Hiếu Tôn Hiền Vạn Đại Vinh”
            </span>
          </div>

          {/* Role Switcher & User Status */}
          <div className="flex items-center space-x-3">
            {/* Chuyển đổi giao diện Khách ⇄ Admin nhanh chóng */}
            <div className="flex items-center bg-[#721515] rounded-full p-0.5 border border-amber-400/40">
              <button
                type="button"
                onClick={() => onSwitchRole("GUEST")}
                className={`px-2.5 py-1 rounded-full flex items-center space-x-1 transition-all ${
                  !isAdmin
                    ? "bg-[#C59B27] text-[#24150b] font-bold shadow-sm"
                    : "text-amber-200/80 hover:text-white"
                }`}
                title="Chuyển sang giao diện Khách thăm quan"
              >
                <Eye className="w-3 h-3" />
                <span>Giao diện Khách</span>
              </button>
              <button
                type="button"
                onClick={() => onSwitchRole("ADMIN")}
                className={`px-2.5 py-1 rounded-full flex items-center space-x-1 transition-all ${
                  isAdmin
                    ? "bg-[#C59B27] text-[#24150b] font-bold shadow-sm"
                    : "text-amber-200/80 hover:text-white"
                }`}
                title="Chuyển sang giao diện Quản Trị Viên (anhthuphan0102@gmail.com)"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Giao diện Admin</span>
              </button>
            </div>

            {/* User status */}
            {isAdmin ? (
              <div className="flex items-center space-x-2 bg-amber-400/20 text-amber-200 px-2.5 py-1 rounded border border-amber-400/30">
                <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                <span className="font-medium truncate max-w-[140px]">
                  anhthuphan0102@gmail.com
                </span>
                <span className="bg-[#C59B27] text-[#24150b] font-bold px-1.5 py-0.2 rounded text-[10px]">
                  ADMIN
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center space-x-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 px-2.5 py-1 rounded border border-amber-300/30 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Đăng nhập Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div
          onClick={() => setActiveTab("overview")}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#8B1E1E] to-[#5C1515] border border-[#C59B27] flex items-center justify-center text-amber-300 font-serif font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            GP
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-bold tracking-tight text-[#8B1E1E] font-serif">
                Gia Phả Việt
              </span>
              <span className="text-xs bg-[#C59B27]/20 text-[#8B1E1E] border border-[#C59B27]/50 px-1.5 py-0.5 rounded font-mono font-medium">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-stone-500 -mt-0.5">
              VietFamilyTree — Di Sản & Huyết Thống Muôn Đời
            </p>
          </div>
        </div>

        {/* Action Buttons for Admin & User */}
        <div className="flex items-center space-x-2">
          {isAdmin && (
            <>
              <button
                type="button"
                onClick={onOpenCreateBranch}
                className="hidden md:inline-flex items-center space-x-1.5 bg-[#FAF7EE] hover:bg-[#F4EEDC] text-[#8B1E1E] border border-[#C59B27]/60 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#C59B27]" />
                <span>Tạo nhánh mới</span>
              </button>

              <button
                type="button"
                onClick={onOpenAddMember}
                className="inline-flex items-center space-x-1.5 bg-[#8B1E1E] hover:bg-[#721515] text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>Thêm thành viên</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onOpenCreateClan}
            className="inline-flex items-center space-x-1.5 bg-[#C59B27] hover:bg-[#B0881F] text-[#24150B] font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all"
            title="Khởi tạo thông tin gia phả mới"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khởi tạo gia phả</span>
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="border-t border-[#EFE8D8] bg-[#FAF7EE]/60 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 py-2.5 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#8B1E1E] text-[#8B1E1E] font-bold bg-white/70 shadow-sm"
                    : "border-transparent text-stone-600 hover:text-[#8B1E1E] hover:border-[#C59B27]/50"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-[#8B1E1E]" : "text-stone-400"
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
