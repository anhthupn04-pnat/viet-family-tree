"use client";

import React from "react";
import { X, Building2, MapPin, BookOpen, Calendar, Sparkles, ScrollText, Users } from "lucide-react";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  clan: any;
}

export default function HistoryModal({ isOpen, onClose, clan }: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FCFBF7] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#C59B27]/40 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#8B1E1E] via-[#A91B1B] to-[#681313] text-white flex items-center justify-between border-b-2 border-[#E0A926]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-amber-200">
                Lịch Sử Từ Đường & Gốc Tích Dòng Họ
              </h2>
              <p className="text-[11px] text-amber-100/70">
                Gia phả dòng họ — Cội nguồn tiên tổ truyền thừa muôn đời
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-100/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-stone-800 text-sm">
          {/* Câu đối cổ truyền thống */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-[#E0A926]/40 p-4 rounded-xl text-center shadow-xs">
            <p className="text-xs font-bold text-[#8B1E1E] uppercase tracking-widest mb-1.5 flex items-center justify-center space-x-1.5">
              <ScrollText className="w-4 h-4 text-[#8B1E1E]" />
              <span>Câu đối đại môn Từ Đường</span>
            </p>
            <div className="font-serif text-base sm:text-lg font-bold text-[#8B1E1E] space-y-1">
              <p>“{clan?.couplet1 || "Tổ Tiên Công Đức Thiên Niên Thịnh"}”</p>
              <p className="text-[#C59B27]">—</p>
              <p>“{clan?.couplet2 || "Tử Hiếu Tôn Hiền Vạn Đại Vinh"}”</p>
            </div>
          </div>

          {/* Vị trí Từ đường & Quê quán phát tích */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center space-x-2 text-[#1E5F52] font-bold text-xs mb-2">
                <MapPin className="w-4 h-4 text-[#C62828]" />
                <span>Quê hương phát tích</span>
              </div>
              <p className="font-medium text-stone-800">
                {clan?.originLocation || "Nga Sơn, Thanh Hóa & Thừa Thiên Huế, Việt Nam"}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Địa bàn phân bố: {clan?.mainRegion || "Miền Bắc - Miền Trung - Miền Nam"}
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <div className="flex items-center space-x-2 text-[#1E5F52] font-bold text-xs mb-2">
                <Building2 className="w-4 h-4 text-[#E0A926]" />
                <span>Từ Đường / Nhà thờ họ</span>
              </div>
              <p className="font-medium text-stone-800">
                {clan?.ancestralHall || "Từ Đường Dòng Họ, Xã Nga Điền, Huyện Nga Sơn, Tỉnh Thanh Hóa"}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                Nơi thờ tự Cụ Khởi Tổ Phan Thạnh & các bậc tiên liệt
              </p>
            </div>
          </div>

          {/* Tóm lược Lịch sử dòng họ */}
          <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-3">
            <h3 className="font-serif font-bold text-[#1E5F52] text-base flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#E0A926]" />
              <span>Gốc tích & Lịch sử truyền thừa</span>
            </h3>
            <p className="text-stone-700 leading-relaxed text-justify">
              {clan?.historySummary ||
                "Dòng họ có cội nguồn truyền thống lâu đời, đời đời truyền thừa tinh thần cần cù, hiếu học và phụng sự quê hương đất nước. Cụ Khởi tổ Phan Thạnh cùng phu nhân Trần Thị Hoàng khai hoang lập ấp, định cư và phát triển con cháu qua các thời kỳ lịch sử. Trải qua các cuộc kháng chiến bảo vệ Tổ quốc, dòng họ tự hào có Liệt sĩ Phan Tấn Thìn cùng các người con ưu tú cống hiến vì non sông đất nước."}
            </p>
            <p className="text-stone-700 leading-relaxed text-justify">
              Ngày nay, hậu duệ các chi họ phát triển mạnh mẽ khắp mọi miền Tổ quốc, giữ gìn nền nếp gia phong, đùm bọc gắn kết tình tự huyết thống và tiếp bước tiền nhân rạng danh dòng tộc.
            </p>
          </div>

          {/* Các chi nhánh tiêu biểu */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <h4 className="font-semibold text-[#1E5F52] text-xs uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
              <Users className="w-4 h-4" />
              <span>Các chi phái tiêu biểu</span>
            </h4>
            <ul className="space-y-2 text-xs text-stone-700">
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E5F52] mt-1.5 shrink-0"></span>
                <span><strong>Chi 1 (Trưởng Chi):</strong> Nhánh con trưởng Liệt sĩ Phan Tấn Thìn, gắn liền tổ quán và trông coi Từ đường.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E5F52] mt-1.5 shrink-0"></span>
                <span><strong>Chi 2 (Chi Giáp):</strong> Nhánh con thứ Cụ Trần Đăng Thích và Cụ Bà Lê Thị Lan, phát triển hậu duệ đời III.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E5F52] mt-1.5 shrink-0"></span>
                <span><strong>Chi 3 (Chi Nữ Phái):</strong> Nhánh Bà Trần Thị Ánh Tuyết, kết nối con cháu phương Nam.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-100 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#8B1E1E] hover:bg-[#701616] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
