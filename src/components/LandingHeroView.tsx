"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Calendar,
  Scroll,
  MessageSquare,
  Search,
  ArrowRight,
  Sparkles,
  Users,
  Compass,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Award,
  Layers,
  HeartHandshake,
  ShieldCheck,
  Eye,
  PlusCircle,
} from "lucide-react";
import { useFamilyStore } from "@/lib/family-store";

interface LandingHeroViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddMember: () => void;
  onOpenDigitalLibrary: () => void;
  onOpenKinship: () => void;
  onOpenLogin: () => void;
  isElderlyMode: boolean;
}

export default function LandingHeroView({
  onNavigateTab,
  onOpenAddMember,
  onOpenDigitalLibrary,
  onOpenKinship,
  onOpenLogin,
  isElderlyMode,
}: LandingHeroViewProps) {
  const { activeTree, members, isAdmin } = useFamilyStore();
  const [ancestorQuery, setAncestorQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("gan-nhat");

  // Sample Ancestors for the search preview inside the hero card
  const sampleAncestors = [
    { name: "Phan Đình Tiên", title: "Thủy Tổ Đại Tôn (Đời 1)", tag: "1680 - 1754" },
    { name: "Phan Văn Cẩn", title: "Chi Trưởng (Đời 2)", tag: "1715 - 1782" },
    { name: "Phan Khắc Khoan", title: "Cố Thừa Tự (Đời 3)", tag: "1750 - 1820" },
  ];

  const filteredAncestors = sampleAncestors.filter((a) =>
    a.name.toLowerCase().includes(ancestorQuery.toLowerCase())
  );

  return (
    <div
      className={`w-full transition-all duration-300 ${
        isElderlyMode ? "text-base sm:text-lg" : "text-sm"
      }`}
    >
      {/* 1. HERO BANNER - BẢN SẮC HOÀNG GIA & TRUYỀN THỐNG VIỆT NAM */}
      <section className="relative overflow-hidden bg-[#FAF3E0] border-b border-amber-900/15">
        {/* Deep emerald accent stripe on top-right as shown in the mockup */}
        <div className="absolute top-0 right-0 w-full sm:w-1/3 lg:w-1/4 h-full bg-[#0A2E20] -z-0 hidden md:block" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* LEFT COLUMN: HERO TEXT & ACTIONS (7 COLS) */}
            <div className="lg:col-span-7 relative">
              {/* Authentic Bronze Drum (Trống Đồng Đông Sơn) Watermark Pattern */}
              <div
                className="absolute -top-12 -left-12 sm:-top-16 sm:-left-16 w-80 sm:w-96 h-80 sm:h-96 opacity-15 pointer-events-none select-none z-0"
                aria-hidden="true"
              >
                <svg viewBox="0 0 400 400" className="w-full h-full text-amber-800" fill="currentColor">
                  {/* Central Sun */}
                  <circle cx="200" cy="200" r="28" fill="none" stroke="currentColor" strokeWidth="4" />
                  <path d="M200 160 L200 240 M160 200 L240 200 M172 172 L228 228 M172 228 L228 172" stroke="currentColor" strokeWidth="3" />
                  {/* Concentric rings */}
                  <circle cx="200" cy="200" r="55" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6,4" />
                  <circle cx="200" cy="200" r="90" fill="none" stroke="currentColor" strokeWidth="3" />
                  <circle cx="200" cy="200" r="130" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="8,5" />
                  <circle cx="200" cy="200" r="170" fill="none" stroke="currentColor" strokeWidth="3.5" />
                  <circle cx="200" cy="200" r="195" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  {/* Stylized flying cranes (Chim Lạc) */}
                  <path d="M200 30 Q220 50 240 30 Q225 60 200 70 Z" />
                  <path d="M370 200 Q350 220 370 240 Q340 225 330 200 Z" />
                  <path d="M200 370 Q180 350 160 370 Q175 340 200 330 Z" />
                  <path d="M30 200 Q50 180 30 160 Q60 175 70 200 Z" />
                </svg>
              </div>

              {/* Main Headline */}
              <div className="relative z-10 space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 bg-amber-900/10 text-amber-950 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide border border-amber-900/20">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Di Sản Văn Hóa & Huyết Thống Dòng Họ Việt Nam</span>
                </div>

                <h1
                  className={`font-serif font-black text-[#4A0E17] tracking-tight leading-[1.12] ${
                    isElderlyMode
                      ? "text-3xl sm:text-5xl lg:text-6xl"
                      : "text-3xl sm:text-4xl lg:text-5xl"
                  }`}
                >
                  GIA PHẢ SỐ &<br />
                  <span className="text-[#63141F] underline decoration-amber-600/40 decoration-4 underline-offset-8">
                    CỘI NGUỒN DÒNG TỘC
                  </span>
                </h1>

                <p
                  className={`text-[#5A2A2F] font-medium leading-relaxed max-w-xl ${
                    isElderlyMode ? "text-lg sm:text-xl font-bold" : "text-sm sm:text-base"
                  }`}
                >
                  Nơi lưu giữ, kết nối và truyền lại lịch sử muôn đời của mọi dòng họ Việt Nam. Tự động hóa sơ đồ phả hệ, lịch lễ giỗ và tư liệu cổ truyền.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAdmin) {
                        onOpenAddMember();
                      } else {
                        onNavigateTab("tree");
                      }
                    }}
                    className={`inline-flex items-center justify-center gap-2.5 rounded-full font-bold shadow-lg shadow-red-950/20 transition-all active:scale-95 cursor-pointer bg-[#500C13] hover:bg-[#68131C] text-amber-100 border border-amber-500/30 ${
                      isElderlyMode ? "px-8 py-4 text-lg" : "px-6 py-3.5 text-sm sm:text-base"
                    }`}
                  >
                    <span>Khởi tạo cây gia phả</span>
                    <ArrowRight className="w-4 h-4 text-amber-300" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab("tree")}
                    className={`inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all active:scale-95 cursor-pointer bg-white/80 hover:bg-white text-[#500C13] border-2 border-[#500C13] hover:shadow-md ${
                      isElderlyMode ? "px-8 py-4 text-lg" : "px-6 py-3.5 text-sm sm:text-base"
                    }`}
                  >
                    <span>Khám phá bản dùng thử</span>
                  </button>
                </div>

                {/* Sub info */}
                <div className="flex items-center gap-4 text-xs sm:text-sm text-[#73353B] pt-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Cây gia phả: <strong>{activeTree?.name || "Tộc Phan"}</strong></span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-amber-800" />
                    <span>{members.length} thành viên đã lưu trữ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE VISUAL PREVIEW & ANCESTOR SEARCH (5 COLS) */}
            <div className="lg:col-span-5 relative">
              {/* Outer Card with layered gradient */}
              <div className="relative rounded-3xl bg-gradient-to-br from-[#FAF5E8] to-[#EFE2C5] p-3 sm:p-5 shadow-2xl border-2 border-amber-900/25 overflow-hidden">
                
                {/* Header of Preview Card */}
                <div className="flex items-center justify-between pb-3 border-b border-amber-900/15 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="font-bold text-[#4A0E17]">Sơ Đồ Phả Hệ Thông Minh</span>
                  </div>
                  <span className="text-[11px] bg-amber-900/10 text-amber-900 px-2 py-0.5 rounded-full font-medium">
                    Trực quan hóa 2 chiều
                  </span>
                </div>

                {/* Mini Pedigree Tree Graphic Preview */}
                <div
                  onClick={() => onNavigateTab("tree")}
                  className="bg-white/90 rounded-2xl p-4 border border-amber-900/15 mb-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative group"
                  title="Nhấn để mở Cây Gia Phả toàn màn hình"
                >
                  <div className="text-center mb-3">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                      Tổ Tiên Khởi Thủy
                    </span>
                  </div>

                  {/* Level 1: Patriarch */}
                  <div className="flex justify-center mb-3">
                    <div className="px-3.5 py-2 rounded-xl bg-[#500C13] text-amber-100 shadow-sm border border-amber-400/40 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-amber-500/30 flex items-center justify-center font-bold text-xs text-amber-200">
                        T
                      </div>
                      <div>
                        <p className="font-serif font-bold text-xs leading-none">Thủy Tổ Phan Công</p>
                        <p className="text-[9px] text-amber-300/80">Đời 1 • Khởi sắc</p>
                      </div>
                    </div>
                  </div>

                  {/* Connecting lines */}
                  <div className="w-px h-3 bg-amber-800/40 mx-auto" />
                  <div className="w-36 h-px bg-amber-800/40 mx-auto" />
                  <div className="flex justify-between w-36 mx-auto mb-2">
                    <div className="w-px h-2.5 bg-amber-800/40" />
                    <div className="w-px h-2.5 bg-amber-800/40" />
                  </div>

                  {/* Level 2: Children */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-800/20 text-center">
                      <p className="font-serif font-bold text-[11px] text-[#4A0E17]">Phan Văn Cẩn</p>
                      <p className="text-[9px] text-slate-500">Chi Trưởng (Đời 2)</p>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-800/20 text-center">
                      <p className="font-serif font-bold text-[11px] text-[#4A0E17]">Phan Thị Diệu</p>
                      <p className="text-[9px] text-slate-500">Chi Thứ (Đời 2)</p>
                    </div>
                  </div>

                  {/* Hover hint */}
                  <div className="absolute inset-0 bg-[#500C13]/10 backdrop-blur-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-[#500C13] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Nhấn để xem toàn bộ phả đồ</span>
                    </span>
                  </div>
                </div>

                {/* Floating "Tìm kiếm tổ tiên" Card (As seen in User Mockup) */}
                <div className="bg-white rounded-2xl p-3.5 sm:p-4 shadow-xl border border-amber-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#4A0E17] flex items-center gap-1.5">
                      <Search className="w-3.5 h-3.5 text-amber-700" />
                      <span>Tìm kiếm tổ tiên</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">Tra cứu tức thì</span>
                  </div>

                  {/* Search input */}
                  <div className="relative mb-2.5">
                    <input
                      type="text"
                      value={ancestorQuery}
                      onChange={(e) => setAncestorQuery(e.target.value)}
                      placeholder="Nhập tên tổ tiên, tự danh..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#500C13]/30"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  </div>

                  {/* Filter pills */}
                  <div className="flex items-center gap-1.5 mb-2 text-[10px]">
                    {[
                      { id: "gan-nhat", label: "Gần gũi nhất" },
                      { id: "nien-dai", label: "Niên đại" },
                      { id: "nen-tang", label: "Nền tảng" },
                    ].map((pill) => (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setActiveFilter(pill.id)}
                        className={`px-2 py-0.5 rounded-md font-medium cursor-pointer transition-colors ${
                          activeFilter === pill.id
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>

                  {/* Search Result Items */}
                  <div className="space-y-1.5 mb-3 max-h-28 overflow-y-auto">
                    {filteredAncestors.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => onNavigateTab("tree")}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-amber-50/70 border border-transparent hover:border-amber-200 transition-colors cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                            {item.name.charAt(item.name.lastIndexOf(" ") + 1)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 leading-none">{item.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{item.title}</p>
                          </div>
                        </div>
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {item.tag}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Action button */}
                  <button
                    type="button"
                    onClick={() => onNavigateTab("tree")}
                    className="w-full py-2 bg-[#500C13] hover:bg-[#68131C] text-amber-100 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Tra cứu chi tiết trên sơ đồ</span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-300" />
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. SECTION: TÍNH NĂNG NỔI BẬT (HIGHLIGHTED FEATURES) */}
      <section id="features-section" className="py-14 sm:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 border border-amber-200">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Hệ Thống Gia Phả Số Toàn Diện</span>
            </div>
            
            <h2
              className={`font-serif font-black text-slate-900 tracking-tight ${
                isElderlyMode ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"
              }`}
            >
              TÍNH NĂNG NỔI BẬT
            </h2>

            <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              Giải pháp công nghệ hiện đại kết hợp chuẩn mực văn hóa gia phả truyền thống Việt Nam
            </p>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            
            {/* FEATURE 1: Sơ đồ Cây Phả hệ Tự động */}
            <div
              onClick={() => onNavigateTab("tree")}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-700/40 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Visual Mockup Header */}
                <div className="w-full h-40 rounded-2xl bg-gradient-to-br from-amber-50 to-[#FAF5E8] p-3 border border-amber-900/10 flex flex-col justify-center items-center mb-4 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md mb-2">
                    <GitBranch className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2">
                    <span className="w-8 h-2 rounded-full bg-blue-200" />
                    <span className="w-8 h-2 rounded-full bg-amber-300" />
                  </div>
                  <span className="text-[10px] text-amber-900/70 font-semibold mt-2">
                    Thuật toán phả đồ thông minh
                  </span>
                </div>

                <h3
                  className={`font-serif font-bold text-slate-900 mb-1 group-hover:text-[#500C13] transition-colors ${
                    isElderlyMode ? "text-lg" : "text-base"
                  }`}
                >
                  Sơ đồ Cây Phả hệ Tự động
                </h3>
                
                <p className="text-xs font-semibold text-amber-800 mb-2">
                  Visualize expansive graph
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Trực quan hóa phả hệ đa thế hệ theo dạng ngang hoặc dọc, chuẩn phân định huyết thống và dòng dõi.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#500C13]">
                <span>Xem sơ đồ cây</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* FEATURE 2: Lịch Giỗ & Sự kiện Âm lịch */}
            <div
              onClick={() => onNavigateTab("anniversaries")}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-700/40 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Visual Mockup Header */}
                <div className="w-full h-40 rounded-2xl bg-gradient-to-br from-red-50 to-amber-50/70 p-3 border border-red-900/10 flex flex-col justify-center items-center mb-4 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                  <div className="w-12 h-12 rounded-2xl bg-[#500C13] text-amber-200 flex items-center justify-center shadow-md mb-2">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-red-950">Lịch Âm Dương Song Hành</span>
                  <span className="text-[10px] text-red-800/80 mt-1">
                    Nhắc lễ kỵ & giỗ tổ thường niên
                  </span>
                </div>

                <h3
                  className={`font-serif font-bold text-slate-900 mb-1 group-hover:text-[#500C13] transition-colors ${
                    isElderlyMode ? "text-lg" : "text-base"
                  }`}
                >
                  Lịch Giỗ & Sự kiện Âm lịch
                </h3>
                
                <p className="text-xs font-semibold text-amber-800 mb-2">
                  Lịch Giỗ & Âm lịch
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Tự động quy đổi ngày giỗ âm lịch, thông báo giỗ chạp, ngày họp mặt dòng họ và hoạt động tế tự.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#500C13]">
                <span>Mở lịch giỗ tộc</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* FEATURE 3: Số hóa Tư liệu & Di sản */}
            <div
              onClick={onOpenDigitalLibrary}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-700/40 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Visual Mockup Header */}
                <div className="w-full h-40 rounded-2xl bg-gradient-to-br from-amber-100/60 to-[#F4EEDC] p-3 border border-amber-900/15 flex flex-col justify-center items-center mb-4 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                  <div className="w-12 h-12 rounded-2xl bg-amber-700 text-amber-100 flex items-center justify-center shadow-md mb-2">
                    <Scroll className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-amber-950">Sắc Phong & Văn Bia Cổ</span>
                  <span className="text-[10px] text-amber-800/80 mt-1">
                    Tộc ước • Mộc bản • Gia phổ Hán Nôm
                  </span>
                </div>

                <h3
                  className={`font-serif font-bold text-slate-900 mb-1 group-hover:text-[#500C13] transition-colors ${
                    isElderlyMode ? "text-lg" : "text-base"
                  }`}
                >
                  Số hóa Tư liệu & Di sản
                </h3>
                
                <p className="text-xs font-semibold text-amber-800 mb-2">
                  Images old docs, documentary & royal decree
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Bảo tồn hình ảnh sắc phong vua ban, dịch thuật chữ Hán Nôm, văn bia tiến sĩ và tộc ước gia phong.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#500C13]">
                <span>Mở thư viện số</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* FEATURE 4: Đóng góp & Trò chuyện Dòng tộc */}
            <div
              onClick={onOpenKinship}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-amber-700/40 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Visual Mockup Header */}
                <div className="w-full h-40 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-3 border border-emerald-900/10 flex flex-col justify-center items-center mb-4 relative overflow-hidden group-hover:scale-[1.02] transition-transform">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md mb-2">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-emerald-950">Đóng Góp Ý Kiến & Tra Cứu</span>
                  <span className="text-[10px] text-emerald-800/80 mt-1">
                    Kiểm duyệt an toàn • Thuật toán xưng hô
                  </span>
                </div>

                <h3
                  className={`font-serif font-bold text-slate-900 mb-1 group-hover:text-[#500C13] transition-colors ${
                    isElderlyMode ? "text-lg" : "text-base"
                  }`}
                >
                  Đóng góp & Trò chuyện Dòng tộc
                </h3>
                
                <p className="text-xs font-semibold text-amber-800 mb-2">
                  Community & trò chuyện tộc
                </p>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Con cháu thuận tiện đề xuất bổ sung thông tin thế hệ mới, tự động xác định danh xưng họ hàng chuẩn mực.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#500C13]">
                <span>Tra cứu xưng hô & đề xuất</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

          </div>

          {/* NOTE: Phần "TẠI SAO CHỌN CHÚNG TÔI?" đã được bỏ theo đúng yêu cầu của người dùng */}
        </div>
      </section>

      {/* 3. QUICK CALL-TO-ACTION BANNER */}
      <section className="bg-gradient-to-r from-[#4A0E17] via-[#5C151F] to-[#4A0E17] text-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-100">
              Bắt đầu ghi chép & gìn giữ cội nguồn ngay hôm nay
            </h3>
            <p className="text-xs sm:text-sm text-amber-200/80 mt-1">
              Phần mềm hỗ trợ quản lý đa dòng họ, sao lưu liên tục và phân quyền an toàn tuyệt đối.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateTab("tree")}
              className="px-6 py-3 rounded-full bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Mở Cây Phả Hệ
            </button>
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
            >
              Đăng Nhập Quản Trị
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
