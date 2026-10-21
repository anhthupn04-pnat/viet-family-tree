"use client";

import React, { useState } from "react";
import {
  GitBranch,
  Users,
  MapPin,
  Calendar,
  Compass,
  BookOpen,
  LogIn,
  Share2,
  Check,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  Landmark,
  Heart,
  Search,
  ExternalLink,
  Layers,
  Info,
} from "lucide-react";
import { Tree } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";

interface ClanHomeViewProps {
  onSelectTab: (tab: string) => void;
  onOpenLogin: () => void;
}

/**
 * Trích xuất Họ từ tên cây gia phả (ví dụ: "Gia Phả Tộc Phan (Quảng Nam)" -> "Họ Phan")
 */
function extractSurname(name: string): string {
  if (!name) return "Dòng Họ";
  const match = name.match(/(?:Tộc|Họ|Gia Phả Tộc|Gia Phả Họ)\s+([^\s()]+)/i);
  if (match && match[1]) {
    return `Họ ${match[1]}`;
  }
  const clean = name.replace(/^Gia Phả\s*/i, "").trim();
  return clean ? clean.split(" ")[0] : "Dòng Họ";
}

export default function ClanHomeView({
  onSelectTab,
  onOpenLogin,
}: ClanHomeViewProps) {
  const {
    trees,
    activeTree,
    activeTreeId,
    setActiveTreeId,
    members,
    events,
    isAdmin,
    currentAdmin,
  } = useFamilyStore();

  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCopyLink = async (t: Tree) => {
    const slug = t.shareSlug || t.slug || t.id;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = `${origin}/share/${slug}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedSlug(t.id);
      setTimeout(() => setCopiedSlug(null), 2500);
    } catch {}
  };

  const currentSurname = extractSurname(activeTree.name);
  const maxGeneration = members.length > 0
    ? Math.max(...members.map((m) => m.generation || 1))
    : 1;

  const maleCount = members.filter((m) => m.gender === "male").length;
  const femaleCount = members.filter((m) => m.gender === "female").length;

  // Lọc các cây gia phả nếu người dùng tìm kiếm
  const filteredTrees = trees.filter((t) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase().trim();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.originLocation && t.originLocation.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full bg-slate-900/5 min-h-[calc(100vh-64px)] pb-16">
      {/* 1. HERO BANNER - BẢN SẮC TRUYỀN THỐNG VIỆT NAM */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800 shadow-xl">
        {/* Họa tiết trang trí nền */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          {/* Câu đối gia tộc truyền thống */}
          <div className="flex flex-col items-center justify-center text-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wider uppercase mb-3 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cổng Thông Tin Gia Phả Dòng Họ Việt Nam</span>
            </span>

            <p className="font-serif italic text-sm sm:text-base text-amber-200/90 tracking-wide max-w-2xl">
              "Tổ Tiên Công Đức Thiên Niên Thịnh — Tử Hiếu Tôn Hiền Vạn Đại Vinh"
            </p>
          </div>

          {/* Khối tiêu đề gia phả trung tâm */}
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {activeTree.name}
            </h1>

            {/* Thông tin cơ bản then chốt: Gia Tộc + Họ + Địa Chỉ */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-300 pt-2">
              {/* Họ dòng tộc */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 font-bold text-amber-300">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>Dòng Họ: <strong>{currentSurname}</strong></span>
              </div>

              {/* Địa chỉ quê quán */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-200 font-medium">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>Quê quán / Từ đường: <strong>{activeTree.originLocation || "Việt Nam"}</strong></span>
              </div>

              {/* Quy mô nhân khẩu */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-200 font-medium">
                <Users className="w-4 h-4 text-blue-400" />
                <span>Quy mô: <strong>{members.length} nhân khẩu</strong></span>
              </div>
            </div>

            {/* Lời tựa / Mô tả gia phả */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl mx-auto pt-2 font-normal">
              {activeTree.description ||
                "Cây gia phả số hóa giúp con cháu muôn phương tưởng nhớ cội nguồn, tra cứu huyết thống, kết nối tình thân và lưu truyền gia phong muôn đời."}
            </p>

            {/* Các nút hành động chính */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
              <button
                type="button"
                onClick={() => onSelectTab("tree")}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-blue-500/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <GitBranch className="w-4 h-4" />
                <span>Xem Sơ Đồ Cây Phả Hệ</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab("members")}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs sm:text-sm border border-slate-700 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Users className="w-4 h-4 text-blue-400" />
                <span>Danh Sách Nhân Khẩu</span>
              </button>

              {!isAdmin && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng Nhập Quản Trị</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. KHỐI THẺ THỐNG KÊ CHI TIẾT CỦA GIA PHẢ HIỆN TẠI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Gia tộc & Họ */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Tộc Họ Phát Tích
            </span>
            <div className="mt-2">
              <div className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                {currentSurname}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                {activeTree.originLocation || "Việt Nam"}
              </p>
            </div>
          </div>

          {/* Card 2: Quy mô */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Quy Mô Dòng Họ
            </span>
            <div className="mt-2">
              <div className="text-lg sm:text-xl font-bold text-blue-600">
                {members.length} Nhân Khẩu
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {maleCount} Nam • {femaleCount} Nữ
              </p>
            </div>
          </div>

          {/* Card 3: Thế hệ */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Thế Hệ Truyền Thừa
            </span>
            <div className="mt-2">
              <div className="text-lg sm:text-xl font-bold text-emerald-600">
                {maxGeneration} Đời / Thế Hệ
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Nối tiếp phả hệ
              </p>
            </div>
          </div>

          {/* Card 4: Chia sẻ */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Liên Kết Chia Sẻ
            </span>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => handleCopyLink(activeTree)}
                className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedSlug === activeTree.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã Chép Link</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Sao Chép Link</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 mt-1 text-center truncate">
                /share/{activeTree.shareSlug || activeTree.slug || activeTree.id}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. KHỐI DANH SÁCH CÁC CÂY GIA PHẢ TRONG HỆ THỐNG (CỔNG GIA PHẢ CHUNG) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  Danh Mục Các Cây Gia Phả Trên Hệ Thống
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Lựa chọn cây gia phả của gia tộc bạn để tra cứu sơ đồ phả hệ và thông tin nhân khẩu.
              </p>
            </div>

            {/* Tìm kiếm gia phả */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tên dòng họ, quê quán..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
              />
            </div>
          </div>

          {/* Grid các cây gia phả */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrees.map((treeItem) => {
              const isCurrent = treeItem.id === activeTreeId;
              const surname = extractSurname(treeItem.name);

              return (
                <div
                  key={treeItem.id}
                  className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                    isCurrent
                      ? "border-blue-500 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-md"
                      : "border-slate-200 hover:border-slate-300 bg-white hover:shadow-md"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                            isCurrent
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {surname.slice(3, 4) || "G"}
                        </div>
                        <div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {surname}
                          </span>
                          {isCurrent && (
                            <span className="ml-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Đang xem
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyLink(treeItem)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Sao chép link chia sẻ gia phả này"
                      >
                        {copiedSlug === treeItem.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                        {treeItem.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {treeItem.originLocation || "Việt Nam"}
                        </span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {treeItem.description || "Gia phả truyền thống dòng tộc."}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {treeItem.id === activeTreeId ? members.length : treeItem.memberCount || 0} nhân khẩu
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => setActiveTreeId(treeItem.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                        >
                          Chọn Cây
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTreeId(treeItem.id);
                          onSelectTab("tree");
                        }}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Xem Sơ Đồ</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. KHỐI TIỆN ÍCH DÀNH CHO CON CHÁU DÒNG TỘC */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tiện ích 1: Lịch giỗ tổ */}
          <div
            onClick={() => onSelectTab("anniversaries")}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Lịch Lễ Giỗ & Sự Kiện Dòng Họ
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Theo dõi ngày kỵ giỗ tiền nhân tổ tiên theo Âm lịch để con cháu tề tựu hương khói phụng tự.
            </p>
          </div>

          {/* Tiện ích 2: Tra cứu quan hệ xưng hô */}
          <div
            onClick={() => onSelectTab("kinship")}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Tra Cứu Quan Hệ Xưng Hô
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Tính toán thứ bậc trên - dưới chuẩn phong tục Việt Nam: Chú, Bác, Cô, Cậu, Thím, Dượng.
            </p>
          </div>

          {/* Tiện ích 3: Sơ đồ phả hệ */}
          <div
            onClick={() => onSelectTab("tree")}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Sơ Đồ Cây Phả Hệ Trực Quan
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Khám phá phả đồ huyết thống tương tác nhiều thế hệ, phân bố chi phái khoa học và trực quan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
