"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  PlusCircle,
  Bell,
  CheckCircle,
  Info,
} from "lucide-react";

interface Anniversary {
  id: string;
  title: string;
  lunarDay: number;
  lunarMonth: number;
  location?: string | null;
  description?: string | null;
  daysRemaining: number;
  isToday: boolean;
  isUpcoming: boolean;
  member?: {
    id: string;
    fullName: string;
    generation: number;
    branch?: { branchName: string };
  };
}

interface ClanEventItem {
  id: string;
  title: string;
  category: string;
  content: string;
  eventDate?: string | null;
  location?: string | null;
}

interface AnniversariesViewProps {
  isAdmin: boolean;
}

export default function AnniversariesView({ isAdmin }: AnniversariesViewProps) {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [events, setEvents] = useState<ClanEventItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [title, setTitle] = useState("");
  const [lunarDay, setLunarDay] = useState(1);
  const [lunarMonth, setLunarMonth] = useState(1);
  const [location, setLocation] = useState("Từ Đường Phan Tộc");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resAnn, resEv] = await Promise.all([
        fetch("/api/anniversaries"),
        fetch("/api/events"),
      ]);
      const dataAnn = await resAnn.json();
      const dataEv = await resEv.json();
      if (dataAnn.anniversaries) setAnniversaries(dataAnn.anniversaries);
      if (dataEv.events) setEvents(dataEv.events);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/anniversaries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          lunarDay: Number(lunarDay),
          lunarMonth: Number(lunarMonth),
          location,
          description,
        }),
      });
      if (!res.ok) throw new Error("Không thể thêm ngày giỗ.");
      setShowAddAnnModal(false);
      setTitle("");
      fetchData();
    } catch (err: any) {
      alert(err.message || "Lỗi khi thêm ngày giỗ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#8B1E1E] to-[#601313] rounded-2xl p-6 text-white shadow-traditional flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Âm Lịch & Tế Tự Dòng Họ</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-amber-100">
            Lịch Giỗ Tổ Tiên & Sự Kiện Dòng Tộc
          </h2>
          <p className="text-amber-100/80 text-xs md:text-sm mt-1 max-w-2xl">
            Tự động tính toán ngày giỗ theo Lịch Âm Việt Nam, hỗ trợ nhắc giỗ các cụ tiền nhân và theo dõi các ngày hội tụ, tế tự tại Từ đường.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowAddAnnModal(true)}
            className="px-4 py-2.5 bg-[#C59B27] hover:bg-[#B0881F] text-[#24150B] font-bold rounded-xl text-xs md:text-sm shadow-md transition-all flex items-center space-x-2 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm ngày giỗ mới</span>
          </button>
        )}
      </div>

      {/* Grid: Lịch giỗ & Sự kiện */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Danh sách ngày giỗ âm lịch */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#C59B27]" />
            <span>Lịch Giỗ Các Bậc Tiền Nhân (Sắp xếp theo ngày gần nhất)</span>
          </h3>

          {loading ? (
            <div className="text-center py-12 text-stone-400 text-xs">
              Đang tính toán lịch âm...
            </div>
          ) : anniversaries.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
              Chưa có lịch giỗ nào được cập nhật.
            </div>
          ) : (
            <div className="space-y-3">
              {anniversaries.map((ann) => (
                <div
                  key={ann.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    ann.isToday
                      ? "border-red-500 bg-red-50/50"
                      : ann.isUpcoming
                      ? "border-[#C59B27] bg-[#FAF7EE]/50"
                      : "border-[#E8DEC7]"
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    {/* Date Block */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8B1E1E] to-[#681313] text-white flex flex-col items-center justify-center font-bold shrink-0 shadow-sm">
                      <span className="text-xs font-serif text-amber-200">ÂM</span>
                      <span className="text-base font-bold -mt-1">
                        {ann.lunarDay}/{ann.lunarMonth}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-serif font-bold text-sm text-stone-900">
                          {ann.title}
                        </h4>
                        {ann.isToday && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                            HÔM NAY
                          </span>
                        )}
                        {ann.isUpcoming && !ann.isToday && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            Sắp tới ({ann.daysRemaining} ngày nữa)
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-stone-500 mt-1 flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>{ann.location || "Từ Đường Phan Tộc"}</span>
                      </p>

                      {ann.description && (
                        <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                          {ann.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Countdown Badge */}
                  <div className="shrink-0 text-right sm:self-center">
                    <span className="text-xs font-semibold text-[#8B1E1E] bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg inline-flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C59B27]" />
                      <span>
                        {ann.isToday
                          ? "Hôm nay chính giỗ"
                          : `Còn ${ann.daysRemaining} ngày`}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Sự kiện & Tin tức dòng họ */}
        <div className="space-y-4">
          <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center space-x-2">
            <Bell className="w-5 h-5 text-[#8B1E1E]" />
            <span>Sự Kiện & Tin Tức Dòng Họ</span>
          </h3>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl border border-[#E8DEC7] p-4 shadow-sm hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="bg-[#8B1E1E]/10 text-[#8B1E1E] font-bold text-[10px] px-2 py-0.5 rounded">
                    {ev.category === "MEETING"
                      ? "HỌP MẶT"
                      : ev.category === "CEREMONY"
                      ? "LỄ TẾ TỰ"
                      : "THÔNG BÁO"}
                  </span>
                  {ev.eventDate && (
                    <span className="text-[10px] text-stone-400">
                      {new Date(ev.eventDate).toLocaleDateString("vi-VN")}
                    </span>
                  )}
                </div>

                <h4 className="font-serif font-bold text-sm text-stone-900">
                  {ev.title}
                </h4>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {ev.content}
                </p>

                {ev.location && (
                  <p className="text-[11px] text-stone-400 flex items-center space-x-1 pt-1 border-t border-stone-100">
                    <MapPin className="w-3 h-3" />
                    <span>{ev.location}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Thêm Ngày Giỗ */}
      {showAddAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#C59B27]/40 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#FAF7EE] to-white border-b border-[#EFE8D8] flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#8B1E1E] flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#C59B27]" />
                <span>Thêm Ngày Giỗ Mới</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAnnModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAnn} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tên Lễ Giỗ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Giỗ Cụ Phan Văn..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Ngày Âm (1 - 30)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={lunarDay}
                    onChange={(e) => setLunarDay(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tháng Âm (1 - 12)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={lunarMonth}
                    onChange={(e) => setLunarMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Địa Điểm Tổ Chức
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Từ Đường Phan Tộc..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ghi Chú Nghi Lễ
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Lễ cúng hoa quả, mâm cỗ mặn..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddAnnModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 rounded-lg hover:bg-stone-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#8B1E1E] hover:bg-[#721515] text-white text-xs font-semibold rounded-lg shadow-md"
                >
                  {submitting ? "Đang lưu..." : "Lưu ngày giỗ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
