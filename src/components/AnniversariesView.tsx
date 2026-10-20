"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  PlusCircle,
  Bell,
  CheckCircle,
  Info,
  CalendarDays,
  Send,
  X,
  ShieldCheck,
} from "lucide-react";
import { useFamilyStore } from "@/lib/family-store";
import { lunarToSolar } from "@/utils/lunar";
import { EventItem } from "@/types/family";

interface AnniversariesViewProps {
  isAdmin?: boolean;
}

export default function AnniversariesView({ isAdmin = false }: AnniversariesViewProps) {
  const { events, addEventDirect, submitChangeRequest } = useFamilyStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"death_anniversary" | "feast" | "gathering">("death_anniversary");
  const [lunarDay, setLunarDay] = useState(15);
  const [lunarMonth, setLunarMonth] = useState(3);
  const [location, setLocation] = useState("Từ Đường Tộc Phan, Quảng Nam");
  const [description, setDescription] = useState("");

  // Submitter details for guests
  const [submitterName, setSubmitterName] = useState("");
  const [submitterPhone, setSubmitterPhone] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  // Compute calculated solar dates and days remaining for events
  const enrichedEvents = events.map((ev) => {
    let solarDateStr = ev.solarDate;
    let daysRemaining = 999;

    if (ev.lunarDate) {
      const parts = ev.lunarDate.split("/");
      if (parts.length >= 2) {
        const lDay = parseInt(parts[0], 10);
        const lMonth = parseInt(parts[1], 10);
        if (!isNaN(lDay) && !isNaN(lMonth)) {
          const solar = lunarToSolar(lDay, lMonth, currentYear);
          solarDateStr = `${solar.year}-${solar.month.toString().padStart(2, "0")}-${solar.day
            .toString()
            .padStart(2, "0")}`;

          const targetDate = new Date(solar.year, solar.month - 1, solar.day);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const diffMs = targetDate.getTime() - today.getTime();
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }
      }
    }

    return {
      ...ev,
      calculatedSolarDate: solarDateStr,
      daysRemaining,
    };
  }).sort((a, b) => a.daysRemaining - b.daysRemaining);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const lunarDateStr = `${lunarDay.toString().padStart(2, "0")}/${lunarMonth.toString().padStart(2, "0")}`;
    const solar = lunarToSolar(lunarDay, lunarMonth, currentYear);
    const solarDateStr = `${solar.year}-${solar.month.toString().padStart(2, "0")}-${solar.day
      .toString()
      .padStart(2, "0")}`;

    const eventPayload: Omit<EventItem, "id"> = {
      title: title.trim(),
      type,
      lunarDate: lunarDateStr,
      solarDate: solarDateStr,
      location: location.trim(),
      description: description.trim(),
      status: isAdmin ? "approved" : "pending",
    };

    if (isAdmin) {
      addEventDirect(eventPayload);
      setToastMsg("Đã thêm sự kiện / ngày giỗ trực tiếp vào lịch tộc!");
    } else {
      if (!submitterName.trim() || !submitterPhone.trim()) {
        alert("Vui lòng nhập Họ tên và Số điện thoại người gửi đề xuất!");
        return;
      }

      submitChangeRequest({
        actionType: "ADD_EVENT",
        submitterName: submitterName.trim(),
        submitterPhone: submitterPhone.trim(),
        data: eventPayload,
      });

      setToastMsg(
        "Yêu cầu của bạn đã được gửi thành công và đang đợi Ban trị sự (Admin) kiểm duyệt trước khi áp dụng lên cây phả hệ."
      );
    }

    setShowAddModal(false);
    setTitle("");
    setDescription("");
    setTimeout(() => setToastMsg(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <button type="button" onClick={() => setToastMsg(null)} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">
              Lịch Lễ Giỗ & Sự Kiện Tộc Phan
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              Năm {currentYear}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Hệ thống tự động quy đổi ngày giỗ Âm lịch của tiền nhân sang ngày Dương lịch tương ứng của
            năm hiện tại để con cháu tiện sắp xếp công việc tề tựu.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start md:self-auto transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAdmin ? "+ Thêm Lễ Giỗ / Sự Kiện" : "+ Đề Xuất Sự Kiện Mới"}</span>
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {enrichedEvents.map((ev) => {
          const isDeath = ev.type === "death_anniversary";
          const isFeast = ev.type === "feast";
          const isToday = ev.daysRemaining === 0;
          const isPast = ev.daysRemaining < 0;

          return (
            <div
              key={ev.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isToday
                  ? "border-amber-400 bg-amber-50/30 ring-2 ring-amber-400/30"
                  : isDeath
                  ? "border-slate-200 hover:border-blue-300"
                  : "border-slate-200 hover:border-emerald-300"
              }`}
            >
              <div>
                {/* Event Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      isDeath
                        ? "bg-rose-100 text-rose-800"
                        : isFeast
                        ? "bg-blue-100 text-blue-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {isDeath ? "Lễ Giỗ Tiền Nhân" : isFeast ? "Hội Làng & Tiệc Tộc" : "Tảo Mộ / Họp Mặt"}
                  </span>

                  {/* Countdown Badge */}
                  {isToday ? (
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full animate-pulse">
                      Hôm Nay!
                    </span>
                  ) : isPast ? (
                    <span className="text-[11px] text-slate-400">Đã diễn ra</span>
                  ) : (
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      Còn {ev.daysRemaining} ngày
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2">{ev.title}</h3>

                {/* Dates display: Lunar vs Solar */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-3 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ngày Âm lịch truyền thống:</span>
                    <span className="font-bold text-blue-800 font-mono text-xs">
                      {ev.lunarDate ? `${ev.lunarDate} Âm lịch` : "Chưa rõ"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Ngày Dương lịch năm {currentYear}:</span>
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      {ev.calculatedSolarDate}
                    </span>
                  </div>
                </div>

                {ev.location && (
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{ev.location}</span>
                  </p>
                )}

                {ev.description && (
                  <p className="text-xs text-slate-500 leading-relaxed italic">{ev.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Propose Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">
                  {isAdmin ? "Thêm Ngày Giỗ / Sự Kiện Mới" : "Đề Xuất Sự Kiện Lễ Giỗ Mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              {!isAdmin && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2.5">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Thông tin người gửi đề xuất:</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Họ và tên bạn *"
                      value={submitterName}
                      onChange={(e) => setSubmitterName(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Số điện thoại *"
                      value={submitterPhone}
                      onChange={(e) => setSubmitterPhone(e.target.value)}
                      className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tiêu đề sự kiện / Ngày giỗ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lễ Giỗ Tiền Nhân Khởi Tổ Phan Thạnh"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Loại sự kiện</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="death_anniversary">Lễ Giỗ Tiền Nhân (Âm lịch)</option>
                  <option value="feast">Tiệc Tộc & Họp Mặt Đầu Xuân</option>
                  <option value="gathering">Tảo Mộ Thanh Minh</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày Âm lịch</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={lunarDay}
                    onChange={(e) => setLunarDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tháng Âm lịch</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={lunarMonth}
                    onChange={(e) => setLunarMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Địa điểm tổ chức</label>
                <input
                  type="text"
                  placeholder="Từ Đường Tộc Phan, Quảng Nam"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mô tả / Lưu ý</label>
                <textarea
                  rows={2}
                  placeholder="Thời gian làm lễ, đóng góp phẩm vật..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAdmin ? "Thêm Trực Tiếp" : "Gửi Đề Xuất Phê Duyệt"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
