"use client";

import React from "react";
import {
  Users,
  GitBranch,
  Building,
  Calendar,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Compass,
  Flower2,
} from "lucide-react";

interface OverviewViewProps {
  stats: {
    totalMembers: number;
    totalBranches: number;
    totalGenerations: number;
    aliveCount: number;
    deceasedCount: number;
    maleCount: number;
    femaleCount: number;
  };
  clan: any;
  onNavigateTab: (tab: string) => void;
  isAdmin: boolean;
}

export default function OverviewView({
  stats,
  clan,
  onNavigateTab,
  isAdmin,
}: OverviewViewProps) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section: Imperial Red (#C62828) & Gold Trim (#E0A926) */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl border-2 border-[#E0A926] bg-gradient-to-br from-[#C62828] via-[#A81F1F] to-[#801313] text-white">
        <div className="absolute inset-0 bg-drum-pattern opacity-10"></div>
        
        {/* Subtle decorative golden corner accents */}
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#E0A926] rounded-tl-xl pointer-events-none opacity-80"></div>
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#E0A926] rounded-tr-xl pointer-events-none opacity-80"></div>
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#E0A926] rounded-bl-xl pointer-events-none opacity-80"></div>
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#E0A926] rounded-br-xl pointer-events-none opacity-80"></div>

        <div className="relative z-10 px-6 py-12 md:py-16 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-black/20 border border-[#E0A926]/50 text-[#FADB7F] px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xs">
            <Flower2 className="w-4 h-4 text-[#F06292]" />
            <span>Di Sản & Huyết Thống Dòng Tộc Việt Nam — Hương Sắc Hoa Sen</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold font-serif text-[#FADB7F] tracking-tight leading-tight drop-shadow-sm">
            {clan?.name || "Gia Phả Phan Tộc Đại Tông"}
          </h1>

          {/* Câu Đối Hoành Phi Cổ Truyền */}
          <div className="max-w-2xl mx-auto py-3 px-6 rounded-2xl bg-black/30 border border-[#E0A926]/40 backdrop-blur-xs shadow-inner">
            <p className="text-[#FADB7F] font-serif italic text-base md:text-lg tracking-wide">
              “{clan?.couplet1 || "Tổ Tiên Công Đức Thiên Niên Thịnh"}”
            </p>
            <p className="text-[#FADB7F] font-serif italic text-base md:text-lg tracking-wide mt-1">
              “{clan?.couplet2 || "Tử Hiếu Tôn Hiền Vạn Đại Vinh"}”
            </p>
          </div>

          <p className="text-amber-100/90 text-xs md:text-sm max-w-3xl mx-auto leading-relaxed">
            {clan?.historySummary ||
              "Gìn giữ cội nguồn, phát huy truyền thống hiếu học, nhân nghĩa và đoàn kết muôn đời. Nền tảng số hóa gia phả hỗ trợ kết nối con cháu bốn phương, minh bạch quỹ họ và tra cứu xưng hô họ hàng chuẩn mực."}
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab("tree")}
              className="px-6 py-3 bg-[#1E5F52] hover:bg-[#16483E] text-white font-bold rounded-2xl text-xs md:text-sm shadow-lg transition-all flex items-center space-x-2 transform hover:-translate-y-0.5 border border-[#E0A926]/60"
            >
              <GitBranch className="w-4 h-4 text-[#FADB7F]" />
              <span>Khám Phá Cây Gia Phả</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab("kinship")}
              className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-2xl text-xs md:text-sm border border-white/30 backdrop-blur-xs transition-all flex items-center space-x-2"
            >
              <Compass className="w-4 h-4 text-[#E0A926]" />
              <span>Tra Cứu Xưng Hô Họ Hàng</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab("anniversaries")}
              className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-2xl text-xs md:text-sm border border-white/30 backdrop-blur-xs transition-all flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4 text-[#F06292]" />
              <span>Lịch Giỗ & Sự Kiện</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thống Kê Nhanh (Key Metrics) with Jade Green & Warm Accents */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC7] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Quy mô dòng họ
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#1E5F52]/10 text-[#1E5F52] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-serif text-[#1E5F52] mt-2">
            {stats.totalMembers}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            {stats.aliveCount} người còn sống • {stats.deceasedCount} bậc tiền bối
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC7] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Số đời thế hệ
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#E0A926] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-serif text-[#C62828] mt-2">
            {stats.totalGenerations} Đời
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            Từ Khởi Tổ Phụ đến con cháu đương đại
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC7] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Số Chi Họ
            </span>
            <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#F06292] flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-serif text-[#1E5F52] mt-2">
            {stats.totalBranches} Chi
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            4 chi họ mẫu ban đầu đã khởi tạo
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC7] shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Tỷ lệ giới tính
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-serif text-stone-800 mt-2">
            {stats.maleCount} / {stats.femaleCount}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            {stats.maleCount} Nam giới • {stats.femaleCount} Nữ giới
          </p>
        </div>
      </div>

      {/* 4 Chi Họ Mẫu Ban Đầu Section */}
      <div className="bg-white rounded-3xl border border-[#E8DEC7] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-lg font-bold font-serif text-[#1E5F52] flex items-center space-x-2">
              <Flower2 className="w-5 h-5 text-[#F06292]" />
              <span>4 Chi Họ Mẫu Khởi Tạo Ban Đầu</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Các nhánh họ vững mạnh được truyền thừa qua nhiều thế hệ tại các vùng miền.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab("branches")}
            className="text-xs font-semibold text-[#1E5F52] hover:text-[#16483E] flex items-center space-x-1"
          >
            <span>Quản lý chi nhánh</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              order: 1,
              title: "Chi 1 - Trưởng Chi",
              leader: "Cụ Phan Văn Định",
              desc: "Trông coi Từ đường chính tại Nga Sơn, Thanh Hóa & Hà Nội.",
              region: "Bắc Bộ",
            },
            {
              order: 2,
              title: "Chi 2 - Chi Giáp",
              leader: "Ông Phan Văn Tường",
              desc: "Phát triển mạnh về kinh thương, kỹ nghệ tại Nghệ An & Đà Nẵng.",
              region: "Trung Bộ",
            },
            {
              order: 3,
              title: "Chi 3 - Chi Ất",
              leader: "Ông Phan Trọng Nghĩa",
              desc: "Tập trung vào khoa cử, học vấn, giáo dục tại Nam Định & Hà Nội.",
              region: "Đồng Bằng",
            },
            {
              order: 4,
              title: "Chi 4 - Chi Bính",
              leader: "Ông Phan Đình Bách",
              desc: "Lập nghiệp tại phương Nam và thủ đô, đóng góp quỹ khuyến học.",
              region: "Nam Bộ",
            },
          ].map((item) => (
            <div
              key={item.order}
              onClick={() => onNavigateTab("branches")}
              className="p-4 rounded-2xl border border-[#E8DEC7] hover:border-[#1E5F52] bg-gradient-to-br from-[#FDFBF7] to-[#FAF7EE] shadow-2xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-full bg-[#1E5F52] text-[#FADB7F] font-serif font-bold text-xs flex items-center justify-center shadow-xs">
                  {item.order}
                </span>
                <span className="text-[10px] font-bold text-[#C62828] bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  {item.region}
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#1E5F52] font-serif group-hover:text-[#16483E]">
                {item.title}
              </h4>
              <p className="text-xs text-stone-600 font-medium mt-1">
                Đứng đầu: {item.leader}
              </p>
              <p className="text-[11px] text-stone-500 mt-1.5 line-clamp-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
