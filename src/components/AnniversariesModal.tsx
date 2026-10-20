"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Flower2,
  Bell,
  Star,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";

interface AnniversariesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onOpenAddMember?: () => void;
}

export default function AnniversariesModal({
  isOpen,
  onClose,
  isAdmin,
}: AnniversariesModalProps) {
  const [anniversaries, setAnniversaries] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const loadData = async () => {
      try {
        setLoading(true);
        const [resA, resE] = await Promise.all([
          fetch("/api/anniversaries"),
          fetch("/api/events"),
        ]);
        const dataA = await resA.json();
        const dataE = await resE.json();
        if (dataA.anniversaries) setAnniversaries(dataA.anniversaries);
        if (dataE.events) setEvents(dataE.events);
      } catch (err) {
        console.error("Error fetching anniversaries:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FCFBF7] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#C59B27]/40 overflow-hidden transform transition-all max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#8B1E1E] via-[#A91B1B] to-[#681313] text-white flex items-center justify-between border-b-2 border-[#E0A926]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-200">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-amber-200">
                Lịch Giỗ Kỵ Nhật & Sự Kiện Dòng Họ
              </h2>
              <p className="text-[11px] text-amber-100/70">
                Đồng bộ âm lịch chuẩn — Tưởng nhớ tiên tổ & gắn kết tình thân
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Notification Alert for Next Upcoming Anniversary */}
          {anniversaries.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-[#E0A926] p-4 rounded-xl flex items-start space-x-3 shadow-xs">
              <div className="p-2 bg-[#8B1E1E] text-[#FADB7F] rounded-lg shrink-0 mt-0.5">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[#8B1E1E] uppercase tracking-wider">
                  Thông báo Lễ giỗ gần nhất
                </p>
                <h4 className="font-serif font-bold text-stone-900 text-sm mt-0.5">
                  {anniversaries[0].title}
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  Ngày {anniversaries[0].lunarDay} tháng {anniversaries[0].lunarMonth} Âm lịch —{" "}
                  {anniversaries[0].location || "Từ đường dòng họ"}
                </p>
              </div>
              <div className="bg-[#8B1E1E] text-white px-2.5 py-1.5 rounded-lg text-center shrink-0">
                <span className="block text-[10px] uppercase font-bold text-amber-200">Còn</span>
                <span className="font-extrabold text-sm">{anniversaries[0].daysRemaining || 0}</span>
                <span className="block text-[9px] text-amber-100">ngày</span>
              </div>
            </div>
          )}

          {/* Danh sách ngày giỗ kỵ nhật truyền thống */}
          <div>
            <h3 className="font-serif font-bold text-[#1E5F52] text-base mb-3 flex items-center space-x-2">
              <Flower2 className="w-4 h-4 text-[#F06292]" />
              <span>Các ngày Kỵ nhật trong năm (Âm lịch)</span>
            </h3>

            {loading ? (
              <div className="py-8 text-center text-stone-500 text-xs">Đang tải lịch giỗ...</div>
            ) : (
              <div className="space-y-3">
                {anniversaries.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 bg-white rounded-xl border border-stone-200 hover:border-[#E0A926] transition-all flex items-center justify-between shadow-2xs group"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E5F52] to-[#2B7A6A] text-[#FADB7F] flex flex-col items-center justify-center font-serif shadow-xs shrink-0">
                        <span className="text-[10px] text-amber-200/80 -mb-0.5">Tháng</span>
                        <span className="text-base font-extrabold leading-tight">
                          {ann.lunarMonth}
                        </span>
                        <span className="text-[9px] text-amber-100/70">Mùng {ann.lunarDay}</span>
                      </div>

                      <div>
                        <h4 className="font-bold text-stone-900 text-sm font-serif group-hover:text-[#1E5F52] transition-colors">
                          {ann.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>
                              {ann.lunarDay}/{ann.lunarMonth} Âm lịch
                            </span>
                          </span>
                          {ann.location && (
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3 text-[#C62828]" />
                              <span>{ann.location}</span>
                            </span>
                          )}
                        </div>
                        {ann.description && (
                          <p className="text-[11px] text-stone-600 italic mt-1">
                            {ann.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      <span className="inline-block text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Còn {ann.daysRemaining || 0} ngày
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sự kiện dòng họ & Tế tự */}
          <div>
            <h3 className="font-serif font-bold text-[#1E5F52] text-base mb-3 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#E0A926]" />
              <span>Lễ Hội & Sự Kiện Tế Tự Thường Niên</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase bg-[#FCE4EC] text-[#C62828] px-2 py-0.5 rounded">
                  Rằm tháng Giêng
                </span>
                <h4 className="font-bold text-stone-900 text-sm mt-1.5 font-serif">
                  Đại Lễ Chạp Họ & Bái Tổ Đầu Xuân
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  Tập trung con cháu bái vọng tiền nhân, khen thưởng con em hiếu học và mừng thọ các cụ cao niên.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] font-bold uppercase bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded">
                  Tiết Thanh Minh (Tháng 3 ÂL)
                </span>
                <h4 className="font-bold text-stone-900 text-sm mt-1.5 font-serif">
                  Tảo Mộ & Tu Bổ Mộ Phần Tiên Tổ
                </h4>
                <p className="text-xs text-stone-600 mt-1">
                  Đoàn thể thanh niên và các chi tập hợp tu tạo cảnh quan lăng mộ, thắp hương tri ân cội nguồn.
                </p>
              </div>
            </div>
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
