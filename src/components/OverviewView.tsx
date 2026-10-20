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
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#C59B27]/40 bg-[#8B1E1E] text-white">
        <div className="absolute inset-0 bg-drum-pattern opacity-15"></div>
        <div className="relative z-10 px-6 py-12 md:py-16 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 border border-amber-300/40 text-amber-200 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Di Sản & Huyết Thống Dòng Tộc Việt Nam</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold font-serif text-amber-100 tracking-tight leading-tight">
            {clan?.name || "Gia Phả Phan Tộc Đại Tông"}
          </h1>

          {/* Câu Đối Hoành Phi */}
          <div className="max-w-2xl mx-auto py-3 px-6 rounded-2xl bg-black/25 border border-amber-400/30 backdrop-blur-sm shadow-inner">
            <p className="text-amber-200 font-serif italic text-base md:text-lg tracking-wide">
              “{clan?.couplet1 || "Tổ Tiên Công Đức Thiên Niên Thịnh"}”
            </p>
            <p className="text-amber-200 font-serif italic text-base md:text-lg tracking-wide mt-1">
              “{clan?.couplet2 || "Tử Hiếu Tôn Hiền Vạn Đại Vinh"}”
            </p>
          </div>

          <p className="text-amber-100/80 text-xs md:text-sm max-w-3xl mx-auto leading-relaxed">
            {clan?.historySummary ||
              "Gìn giữ cội nguồn, phát huy truyền thống hiếu học, nhân nghĩa và đoàn kết muôn đời. Nền tảng số hóa gia phả hỗ trợ kết nối con cháu bốn phương, minh bạch quỹ họ và tra cứu xưng hô họ hàng chuẩn mực."}
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab("tree")}
              className="px-6 py-3 bg-[#C59B27] hover:bg-[#B0881F] text-[#24150B] font-bold rounded-xl text-xs md:text-sm shadow-lg transition-all flex items-center space-x-2 transform hover:-translate-y-0.5"
            >
              <GitBranch className="w-4 h-4" />
              <span>Khám Phá Cây Gia Phả</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab("kinship")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs md:text-sm border border-white/30 backdrop-blur-sm transition-all flex items-center space-x-2"
            >
              <Compass className="w-4 h-4 text-amber-300" />
              <span>Tra Cứu Xưng Hô Họ Hàng</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab("anniversaries")}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs md:text-sm border border-white/30 backdrop-blur-sm transition-all flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Lịch Giỗ & Sự Kiện</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thống Kê Nhanh (Key Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC7] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Quy mô dòng họ
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#8B1E1E] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-serif text-stone-900 mt-2">
            {stats.totalMembers}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            {stats.aliveCount} người còn sống • {stats.deceasedCount} bậc tiền bối
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC7] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Số đời thế hệ
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#C59B27] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-serif text-stone-900 mt-2">
            {stats.totalGenerations} Đời
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            Từ Khởi Tổ Phụ đến con cháu đương đại
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC7] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Số Chi Họ Mẫu
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <GitBranch className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-serif text-stone-900 mt-2">
            {stats.totalBranches} Chi
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            4 chi họ lớn ban đầu phân bổ toàn quốc
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC7] shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Phát tích cội nguồn
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <p className="text-base font-bold font-serif text-stone-900 mt-3 line-clamp-1">
            {clan?.originLocation || "Nga Sơn, Thanh Hóa"}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            Từ đường Phan Tộc phụng thờ hương hỏa
          </p>
        </div>
      </div>

      {/* Chi Tiết Từ Đường & Lịch Sử */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Từ Đường dòng họ */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-[#E8DEC7] p-6 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-[#8B1E1E]">
            <Building className="w-5 h-5 text-[#C59B27]" />
            <h3 className="font-serif font-bold text-xl text-stone-900">
              Nhà Thờ Họ & Từ Đường Cổ Tự
            </h3>
          </div>

          <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
            Từ đường Phan Tộc tọa lạc tại xã Nga Điền, huyện Nga Sơn, tỉnh Thanh Hóa. Trải qua hàng trăm năm với bao thăng trầm thời đại, con cháu bốn phương đã chung tay trùng tu 5 gian gỗ lim bề thế, hoành phi câu đối sơn son thếp vàng, bia đá ghi danh các bậc tiền hiền.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#FAF7EE] rounded-xl border border-[#E8DEC7]">
              <span className="text-[11px] font-bold text-[#8B1E1E] uppercase block mb-1">
                Địa điểm phụng tự
              </span>
              <p className="text-xs text-stone-700">
                {clan?.ancestralHall || "Từ Đường Phan Tộc, Làng Nga Điền, Nga Sơn, Thanh Hóa"}
              </p>
            </div>

            <div className="p-3 bg-[#FAF7EE] rounded-xl border border-[#E8DEC7]">
              <span className="text-[11px] font-bold text-[#8B1E1E] uppercase block mb-1">
                Đại lễ giỗ tổ hàng năm
              </span>
              <p className="text-xs text-stone-700">
                Mùng 2 tháng 7 âm lịch (Đại Lễ Giỗ Cụ Khởi Tổ Phan Công Diệu)
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onNavigateTab("documents")}
              className="text-xs font-semibold text-[#8B1E1E] hover:underline flex items-center space-x-1"
            >
              <span>Xem tư liệu văn bia & sắc phong cổ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Quyền lợi theo vai trò (Khách vs Admin) */}
        <div className="bg-[#FAF7EE] rounded-2xl border border-[#C59B27]/40 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <ShieldCheck className="w-5 h-5 text-[#8B1E1E]" />
              <h4 className="font-serif font-bold text-base text-stone-900">
                Phân Quyền Hệ Thống
              </h4>
            </div>

            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Hệ thống áp dụng chính sách bảo vệ dữ liệu cá nhân theo tiêu chuẩn:
            </p>

            <ul className="space-y-2.5 text-xs text-stone-700">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E1E] mt-1.5 shrink-0"></span>
                <span>
                  <strong>Khách thăm quan:</strong> Xem cây gia phả công khai, tra cứu xưng hô, ẩn thông tin số điện thoại người còn sống.
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B1E1E] mt-1.5 shrink-0"></span>
                <span>
                  <strong>Quản trị viên (Admin):</strong> Toàn quyền tạo thêm chi nhánh, thêm sửa xóa thành viên, duyệt thay đổi, quản lý quỹ họ.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-[#E8DEC7]">
            <p className="text-[11px] text-stone-500">
              Tài khoản quản trị hiện tại:
            </p>
            <p className="text-xs font-bold font-mono text-[#8B1E1E] mt-0.5">
              anhthuphan0102@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
