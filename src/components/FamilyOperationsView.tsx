"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Bell,
  Coins,
  Plus,
  Trash2,
  MapPin,
  Clock,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Tag,
  Building,
} from "lucide-react";
import { TreeAnniversary, TreeEvent, TreeFund } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";
import { lunarToSolar } from "@/utils/lunar";

interface FamilyOperationsViewProps {
  treeId: string;
  treeName: string;
}

export default function FamilyOperationsView({
  treeId,
  treeName,
}: FamilyOperationsViewProps) {
  const { currentAdmin } = useFamilyStore();
  const [subTab, setSubTab] = useState<"anniversaries" | "events" | "funds">("anniversaries");

  // 1. Anniversaries State
  const [anniversaries, setAnniversaries] = useState<TreeAnniversary[]>([]);
  const [annLoading, setAnnLoading] = useState(false);
  const [showAddAnnModal, setShowAddAnnModal] = useState(false);
  const [newAnnTitle, setNewAnnTitle] = useState("");
  const [newAnnLunarDay, setNewAnnLunarDay] = useState<number>(15);
  const [newAnnLunarMonth, setNewAnnLunarMonth] = useState<number>(3);
  const [newAnnLocation, setNewAnnLocation] = useState("Từ đường dòng họ");
  const [newAnnNotes, setNewAnnNotes] = useState("");
  const [annSolarPreview, setAnnSolarPreview] = useState("");

  // 2. Events State
  const [events, setEvents] = useState<TreeEvent[]>([]);
  const [eventLoading, setEventLoading] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventCategory, setNewEventCategory] = useState<"NEWS" | "CEREMONY" | "MEETING" | "FEAST">("CEREMONY");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventContent, setNewEventContent] = useState("");

  // 3. Funds State
  const [funds, setFunds] = useState<TreeFund[]>([]);
  const [fundSummary, setFundSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [fundLoading, setFundLoading] = useState(false);
  const [showAddFundModal, setShowAddFundModal] = useState(false);
  const [newFundType, setNewFundType] = useState<"INCOME" | "EXPENSE">("INCOME");
  const [newFundAmount, setNewFundAmount] = useState<string>("");
  const [newFundTitle, setNewFundTitle] = useState("");
  const [newFundPerson, setNewFundPerson] = useState("");
  const [newFundDate, setNewFundDate] = useState(new Date().toISOString().split("T")[0]);
  const [newFundNotes, setNewFundNotes] = useState("");

  // Toast / Status state
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showStatus = (type: "success" | "error", text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  // Auto calculate Solar preview for anniversary
  useEffect(() => {
    try {
      const year = new Date().getFullYear();
      const solar = lunarToSolar(newAnnLunarDay, newAnnLunarMonth, year);
      if (solar) {
        setAnnSolarPreview(`${String(solar.day).padStart(2, "0")}/${String(solar.month).padStart(2, "0")}/${solar.year}`);
      }
    } catch {
      setAnnSolarPreview("");
    }
  }, [newAnnLunarDay, newAnnLunarMonth]);

  // Fetch Anniversaries
  const fetchAnniversaries = useCallback(async () => {
    setAnnLoading(true);
    try {
      const res = await fetch(`/api/trees/${treeId}/anniversaries`, {
        headers: { "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com" },
      });
      if (res.ok) {
        const data = await res.json();
        setAnniversaries(data.anniversaries || []);
      }
    } catch (e) {
      console.warn("fetchAnniversaries error:", e);
    } finally {
      setAnnLoading(false);
    }
  }, [treeId, currentAdmin]);

  // Fetch Events
  const fetchEvents = useCallback(async () => {
    setEventLoading(true);
    try {
      const res = await fetch(`/api/trees/${treeId}/events`, {
        headers: { "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com" },
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (e) {
      console.warn("fetchEvents error:", e);
    } finally {
      setEventLoading(false);
    }
  }, [treeId, currentAdmin]);

  // Fetch Funds
  const fetchFunds = useCallback(async () => {
    setFundLoading(true);
    try {
      const res = await fetch(`/api/trees/${treeId}/funds`, {
        headers: { "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com" },
      });
      if (res.ok) {
        const data = await res.json();
        setFunds(data.funds || []);
        if (data.summary) setFundSummary(data.summary);
      }
    } catch (e) {
      console.warn("fetchFunds error:", e);
    } finally {
      setFundLoading(false);
    }
  }, [treeId, currentAdmin]);

  useEffect(() => {
    if (subTab === "anniversaries") fetchAnniversaries();
    else if (subTab === "events") fetchEvents();
    else if (subTab === "funds") fetchFunds();
  }, [subTab, fetchAnniversaries, fetchEvents, fetchFunds]);

  // Handlers for Anniversaries
  const handleAddAnniversary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim()) return;

    try {
      const res = await fetch(`/api/trees/${treeId}/anniversaries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com",
        },
        body: JSON.stringify({
          title: newAnnTitle.trim(),
          lunarDay: Number(newAnnLunarDay),
          lunarMonth: Number(newAnnLunarMonth),
          location: newAnnLocation.trim() || undefined,
          notes: newAnnNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi khi lưu ngày giỗ");

      showStatus("success", data.message || "Đã thêm ngày giỗ thành công!");
      setShowAddAnnModal(false);
      setNewAnnTitle("");
      setNewAnnNotes("");
      fetchAnniversaries();
    } catch (err: any) {
      showStatus("error", err.message || "Lỗi lưu ngày giỗ");
    }
  };

  const handleDeleteAnniversary = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ngày giỗ "${title}" khỏi Lịch Kỵ Nhật?`)) return;
    try {
      const res = await fetch(`/api/trees/${treeId}/anniversaries/${id}`, {
        method: "DELETE",
        headers: { "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com" },
      });
      if (res.ok) {
        showStatus("success", "Đã xóa ngày giỗ thành công!");
        fetchAnniversaries();
      }
    } catch (err: any) {
      showStatus("error", "Lỗi xóa ngày giỗ: " + err.message);
    }
  };

  // Handlers for Events
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventContent.trim()) return;

    try {
      const res = await fetch(`/api/trees/${treeId}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com",
        },
        body: JSON.stringify({
          title: newEventTitle.trim(),
          category: newEventCategory,
          eventDate: newEventDate.trim() || undefined,
          location: newEventLocation.trim() || undefined,
          content: newEventContent.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi khi đăng tin sự kiện");

      showStatus("success", data.message || "Đã đăng sự kiện thành công!");
      setShowAddEventModal(false);
      setNewEventTitle("");
      setNewEventContent("");
      fetchEvents();
    } catch (err: any) {
      showStatus("error", err.message || "Lỗi đăng tin sự kiện");
    }
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sự kiện "${title}"?`)) return;
    try {
      const res = await fetch(`/api/trees/${treeId}/events/${id}`, {
        method: "DELETE",
        headers: { "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com" },
      });
      if (res.ok) {
        showStatus("success", "Đã xóa sự kiện thành công!");
        fetchEvents();
      }
    } catch (err: any) {
      showStatus("error", "Lỗi xóa sự kiện: " + err.message);
    }
  };

  // Handlers for Funds
  const handleAddFund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFundTitle.trim() || !newFundPerson.trim() || !newFundAmount) return;

    try {
      const res = await fetch(`/api/trees/${treeId}/funds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com",
        },
        body: JSON.stringify({
          type: newFundType,
          amount: parseFloat(newFundAmount),
          title: newFundTitle.trim(),
          contributorOrRecipient: newFundPerson.trim(),
          date: newFundDate,
          notes: newFundNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi khi ghi nhận quỹ");

      showStatus("success", data.message || "Đã ghi nhận giao dịch thành công!");
      setShowAddFundModal(false);
      setNewFundTitle("");
      setNewFundAmount("");
      setNewFundPerson("");
      setNewFundNotes("");
      fetchFunds();
    } catch (err: any) {
      showStatus("error", err.message || "Lỗi ghi nhận quỹ");
    }
  };

  const handleDeleteFund = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bản ghi thu chi "${title}"?`)) return;
    try {
      const res = await fetch(`/api/trees/${treeId}/funds/${id}`, {
        method: "DELETE",
        headers: { "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com" },
      });
      if (res.ok) {
        showStatus("success", "Đã xóa bản ghi quỹ thành công!");
        fetchFunds();
      }
    } catch (err: any) {
      showStatus("error", "Lỗi xóa bản ghi quỹ: " + err.message);
    }
  };

  return (
    <div className="space-y-4">
      {/* Scope Alert Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
            <h3 className="font-bold text-slate-900 text-sm">
              Quản Trị Hoạt Động Dòng Họ — {treeName}
            </h3>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Phạm vi quản lý độc quyền theo gia phả (Lịch Kỵ Nhật, Sự Kiện & Quỹ dòng họ).
          </p>
        </div>

        {/* Sub-tab Pill Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl shadow-2xs border border-slate-200">
          <button
            type="button"
            onClick={() => setSubTab("anniversaries")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "anniversaries"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Lịch Kỵ Nhật ({anniversaries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("events")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "events"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Sự Kiện & Tin Tức ({events.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("funds")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "funds"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Thu - Chi Quỹ</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. LỊCH KỴ NHẬT (ANNIVERSARIES) */}
      {/* ========================================================================= */}
      {subTab === "anniversaries" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh Sách Ngày Giỗ Tổ & Tiền Nhân Trong Gia Phả
            </h4>
            <button
              type="button"
              onClick={() => setShowAddAnnModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Ngày Giỗ</span>
            </button>
          </div>

          {annLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Đang tải Lịch Kỵ Nhật...</div>
          ) : anniversaries.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Chưa có ngày giỗ nào được tạo cho gia phả này. Hãy bấm &ldquo;Thêm Ngày Giỗ&rdquo; để khởi tạo.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {anniversaries.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {ann.title}
                      </h5>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                      <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                        Âm lịch: Ngày {ann.lunarDay} tháng {ann.lunarMonth}
                      </span>
                      {ann.solarDate && (
                        <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded font-medium">
                          Dương lịch (Năm nay): {ann.solarDate}
                        </span>
                      )}
                    </div>

                    {ann.location && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-1">
                        <MapPin className="w-3 h-3 text-rose-500" />
                        <span>{ann.location}</span>
                      </p>
                    )}

                    {ann.notes && (
                      <p className="text-[11px] text-slate-500 italic pt-0.5">
                        &ldquo;{ann.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteAnniversary(ann.id, ann.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Xóa ngày giỗ này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SỰ KIỆN / THÔNG BÁO (EVENTS) */}
      {/* ========================================================================= */}
      {subTab === "events" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh Sách Tin Tức, Chạp Họ, Tảo Mộ, Họp Dòng Tộc
            </h4>
            <button
              type="button"
              onClick={() => setShowAddEventModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Đăng Sự Kiện</span>
            </button>
          </div>

          {eventLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Đang tải sự kiện...</div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Chưa có sự kiện nào được đăng cho gia phả này.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all flex items-start justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          ev.category === "CEREMONY"
                            ? "bg-purple-100 text-purple-800"
                            : ev.category === "FEAST"
                            ? "bg-amber-100 text-amber-800"
                            : ev.category === "MEETING"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {ev.category === "CEREMONY"
                          ? "Lễ / Tảo Mộ"
                          : ev.category === "FEAST"
                          ? "Chạp Họ / Tiệc"
                          : ev.category === "MEETING"
                          ? "Họp Mặt"
                          : "Thông Báo"}
                      </span>
                      <h5 className="font-bold text-slate-900 text-sm">
                        {ev.title}
                      </h5>
                    </div>

                    <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                      {ev.content}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                      {ev.eventDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>Ngày tổ chức: {ev.eventDate}</span>
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{ev.location}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(ev.id, ev.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Xóa sự kiện này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. THU - CHI QUỸ DÒNG HỌ (FUNDS) */}
      {/* ========================================================================= */}
      {subTab === "funds" && (
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Tổng Thu Đóng Góp</p>
                <p className="text-base font-extrabold text-emerald-700">
                  {fundSummary.totalIncome.toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Tổng Chi Hoạt Động</p>
                <p className="text-base font-extrabold text-rose-700">
                  {fundSummary.totalExpense.toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Số Dư Quỹ Hiện Tại</p>
                <p className={`text-base font-extrabold ${fundSummary.balance >= 0 ? "text-indigo-700" : "text-rose-700"}`}>
                  {fundSummary.balance.toLocaleString("vi-VN")} đ
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sổ Cái Ghi Nhận Thu Chi ({funds.length} giao dịch)
            </h4>
            <button
              type="button"
              onClick={() => setShowAddFundModal(true)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ghi Nhận Giao Dịch</span>
            </button>
          </div>

          {fundLoading ? (
            <div className="p-8 text-center text-xs text-slate-500">Đang tải sổ quỹ...</div>
          ) : funds.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              Chưa có khoản thu chi nào được ghi nhận cho gia phả này.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="p-3">Ngày</th>
                      <th className="p-3">Khoản Mục</th>
                      <th className="p-3">Loại</th>
                      <th className="p-3">Số Tiền</th>
                      <th className="p-3">Người Đóng / Người Nhận</th>
                      <th className="p-3">Ghi Chú</th>
                      <th className="p-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {funds.map((f) => (
                      <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{f.date}</td>
                        <td className="p-3 font-bold text-slate-900">{f.title}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.type === "INCOME"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {f.type === "INCOME" ? "+ THU" : "- CHI"}
                          </span>
                        </td>
                        <td
                          className={`p-3 font-mono font-bold whitespace-nowrap ${
                            f.type === "INCOME" ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {f.type === "INCOME" ? "+" : "-"}
                          {f.amount.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="p-3 text-slate-700">{f.contributorOrRecipient}</td>
                        <td className="p-3 text-slate-500 italic max-w-xs truncate">{f.notes || "—"}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteFund(f.id, f.title)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Xóa giao dịch này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: THÊM NGÀY GIỖ */}
      {/* ========================================================================= */}
      {showAddAnnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Thêm Ngày Giỗ Vào Lịch Kỵ Nhật</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tự động tính toán ngày Dương lịch tương ứng theo lịch vạn niên.
            </p>

            <form onSubmit={handleAddAnniversary} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên ngày giỗ / Lễ *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lễ Giỗ Cụ Khởi Tổ Phúc Thiện"
                  value={newAnnTitle}
                  onChange={(e) => setNewAnnTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày Âm (1 - 30) *</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={newAnnLunarDay}
                    onChange={(e) => setNewAnnLunarDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tháng Âm (1 - 12) *</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    required
                    value={newAnnLunarMonth}
                    onChange={(e) => setNewAnnLunarMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {annSolarPreview && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-semibold flex items-center justify-between">
                  <span>Dương lịch tương ứng năm nay:</span>
                  <span className="font-mono font-bold text-blue-700">{annSolarPreview}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Địa điểm tổ chức</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Từ đường Tộc Phan, Điện Bàn"
                  value={newAnnLocation}
                  onChange={(e) => setNewAnnLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú nghi thức</label>
                <input
                  type="text"
                  placeholder="Lễ vật, dâng hương, con cháu tề tựu..."
                  value={newAnnNotes}
                  onChange={(e) => setNewAnnNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAnnModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Lưu Vào Lịch Giỗ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ĐĂNG SỰ KIỆN */}
      {/* ========================================================================= */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Đăng Sự Kiện / Thông Báo Dòng Họ</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tin tức về chạp họ, tảo mộ, khánh thành từ đường hoặc họp họ.
            </p>

            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiêu đề sự kiện *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thông báo lễ Tảo mộ Tiết Thanh Minh 2026"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thể loại</label>
                  <select
                    value={newEventCategory}
                    onChange={(e: any) => setNewEventCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="CEREMONY">Lễ / Tảo Mộ</option>
                    <option value="FEAST">Chạp Họ / Tiệc</option>
                    <option value="MEETING">Họp Mặt</option>
                    <option value="NEWS">Thông Báo Chung</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày tổ chức</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Địa điểm</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Khu lăng mộ tổ tộc Phan, Điện Bàn"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nội dung chi tiết *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Chi tiết chương trình, thời gian tập trung, công việc chuẩn bị..."
                  value={newEventContent}
                  onChange={(e) => setNewEventContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Đăng Tin Sự Kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GHI NHẬN THU CHI QUỸ */}
      {/* ========================================================================= */}
      {showAddFundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Ghi Nhận Thu / Chi Quỹ Dòng Họ</h3>
            <p className="text-xs text-slate-500 mb-4">
              Cập nhật thu đóng góp hoặc chi phí tu sửa, in ấn gia phả.
            </p>

            <form onSubmit={handleAddFund} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Loại giao dịch *</label>
                  <select
                    value={newFundType}
                    onChange={(e: any) => setNewFundType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="INCOME">Thu: Đóng góp / Công đức</option>
                    <option value="EXPENSE">Chi: Tu sửa / Hoạt động họ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số tiền (VNĐ) *</label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    required
                    placeholder="Ví dụ: 1000000"
                    value={newFundAmount}
                    onChange={(e) => setNewFundAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Khoản mục / Nội dung *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đóng góp tu sửa mái từ đường"
                  value={newFundTitle}
                  onChange={(e) => setNewFundTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {newFundType === "INCOME" ? "Người đóng góp *" : "Người nhận chi *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Họ tên người giao dịch"
                    value={newFundPerson}
                    onChange={(e) => setNewFundPerson(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày giao dịch *</label>
                  <input
                    type="date"
                    required
                    value={newFundDate}
                    onChange={(e) => setNewFundDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ghi chú bổ sung</label>
                <input
                  type="text"
                  placeholder="Số phiếu thu/chi, thông tin chuyển khoản..."
                  value={newFundNotes}
                  onChange={(e) => setNewFundNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddFundModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Ghi Vào Sổ Quỹ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
