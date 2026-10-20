"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  Flower2,
  Users,
  Compass,
  ArrowLeft,
  ChevronRight,
  Flame,
  Cake,
  PartyPopper,
  Bell,
  Heart,
} from "lucide-react";
import { MOCK_MEMBERS, MOCK_EVENTS } from "@/lib/mockData";
import { getDaysUntilAnniversary, solarToLunar, formatVietnameseDate } from "@/utils/lunar";
import { getLocalMembers } from "@/lib/treeStorage";

interface UpcomingEvent {
  id: string;
  title: string;
  category: "ANNIVERSARY" | "CLAN_MEETING" | "LONGEVITY" | "BIRTHDAY";
  personName?: string;
  nickname?: string;
  generation?: number;
  solarDateStr: string;
  lunarDateStr: string;
  daysRemaining: number;
  isToday: boolean;
  isUpcoming: boolean; // within 30 days
  location?: string;
  note?: string;
}

export default function AncestralCalendarPage() {
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [nearestAnniversary, setNearestAnniversary] = useState<UpcomingEvent | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ANNIVERSARY" | "CLAN" | "BIRTHDAY">("ALL");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // 1. Get members list (from localStorage or mockData)
    const local = getLocalMembers();
    const members = local && local.length > 0 ? local : MOCK_MEMBERS;
    const currentYear = new Date().getFullYear();

    const computedEvents: UpcomingEvent[] = [];

    // 2. Add deceased ancestors' death anniversaries
    members.forEach((m) => {
      if (!m.isAlive) {
        let lDay = (m as any).deathLunarDay;
        let lMonth = (m as any).deathLunarMonth;

        if (!lDay && m.deathLunar) {
          const parts = m.deathLunar.split("/");
          if (parts.length >= 2) {
            lDay = parseInt(parts[0], 10);
            lMonth = parseInt(parts[1], 10);
          }
        }

        if (lDay && lMonth) {
          const ann = getDaysUntilAnniversary(lDay, lMonth);
          const solarFormatted = `${ann.solarDate.day.toString().padStart(2, "0")}/${ann.solarDate.month
            .toString()
            .padStart(2, "0")}/${ann.solarDate.year}`;

          computedEvents.push({
            id: `ann-${m.id}`,
            title: `Lễ Giỗ (Kỵ nhật) ${m.fullName}`,
            category: "ANNIVERSARY",
            personName: m.fullName,
            nickname: m.nickname || undefined,
            generation: m.generation,
            solarDateStr: solarFormatted,
            lunarDateStr: `Ngày ${lDay} tháng ${lMonth} Âm lịch`,
            daysRemaining: ann.daysRemaining,
            isToday: ann.isToday,
            isUpcoming: ann.isUpcoming,
            location: m.burialPlace || "Từ Đường Dòng Họ",
            note: m.courtesyName ? `Tên chữ: ${m.courtesyName}` : undefined,
          });
        }
      } else {
        // Living member birthdays
        if (m.birthSolar) {
          const bDate = new Date(m.birthSolar);
          if (!isNaN(bDate.getTime())) {
            const thisYearBday = new Date(currentYear, bDate.getMonth(), bDate.getDate());
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            if (thisYearBday.getTime() < now.getTime()) {
              thisYearBday.setFullYear(currentYear + 1);
            }
            const diffDays = Math.ceil(
              (thisYearBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            const age = currentYear - bDate.getFullYear();

            computedEvents.push({
              id: `bday-${m.id}`,
              title: age >= 70 ? `Lễ Mừng Thọ ${m.fullName} (${age} tuổi)` : `Sinh nhật ${m.fullName}`,
              category: age >= 70 ? "LONGEVITY" : "BIRTHDAY",
              personName: m.fullName,
              nickname: m.nickname || undefined,
              generation: m.generation,
              solarDateStr: `${thisYearBday.getDate().toString().padStart(2, "0")}/${(
                thisYearBday.getMonth() + 1
              )
                .toString()
                .padStart(2, "0")}/${thisYearBday.getFullYear()}`,
              lunarDateStr: "Theo Dương lịch",
              daysRemaining: diffDays,
              isToday: diffDays === 0,
              isUpcoming: diffDays > 0 && diffDays <= 30,
              location: m.currentResidence || "Gia đình",
            });
          }
        }
      }
    });

    // 3. Add Clan Events
    MOCK_EVENTS.forEach((e: any) => {
      let daysRem = 15;
      let solarFormatted = "Đầu xuân";

      if (e.lunarDay && e.lunarMonth) {
        const ann = getDaysUntilAnniversary(e.lunarDay, e.lunarMonth);
        solarFormatted = `${ann.solarDate.day.toString().padStart(2, "0")}/${ann.solarDate.month
          .toString()
          .padStart(2, "0")}/${ann.solarDate.year}`;
        daysRem = ann.daysRemaining;
      } else if (e.solarDate) {
        const d = new Date(e.solarDate);
        if (!isNaN(d.getTime())) {
          const now = new Date();
          daysRem = Math.max(0, Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          solarFormatted = d.toLocaleDateString("vi-VN");
        }
      }

      computedEvents.push({
        id: `clan-${e.id}`,
        title: e.title,
        category: "CLAN_MEETING",
        solarDateStr: solarFormatted,
        lunarDateStr:
          e.lunarDay && e.lunarMonth
            ? `Ngày ${e.lunarDay} tháng ${e.lunarMonth} Âm lịch`
            : "Đầu xuân",
        daysRemaining: daysRem,
        isToday: daysRem === 0,
        isUpcoming: daysRem <= 30,
        location: e.location || "Từ đường tổ quán",
        note: e.note || undefined,
      });
    });

    // Sort by days remaining ascending
    computedEvents.sort((a, b) => a.daysRemaining - b.daysRemaining);
    setEvents(computedEvents);

    // Find nearest anniversary
    const nearest = computedEvents.find((e) => e.category === "ANNIVERSARY");
    if (nearest) {
      setNearestAnniversary(nearest);
    }
  }, []);

  // Live Countdown timer
  useEffect(() => {
    if (!nearestAnniversary) return;

    const timer = setInterval(() => {
      const parts = nearestAnniversary.solarDateStr.split("/");
      if (parts.length === 3) {
        const targetDate = new Date(
          parseInt(parts[2], 10),
          parseInt(parts[1], 10) - 1,
          parseInt(parts[0], 10),
          8,
          0,
          0
        );
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setTimeLeft({ days, hours, minutes, seconds });
        } else {
          setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nearestAnniversary]);

  const filteredEvents = events.filter((e) => {
    if (filter === "ANNIVERSARY") return e.category === "ANNIVERSARY";
    if (filter === "CLAN") return e.category === "CLAN_MEETING";
    if (filter === "BIRTHDAY") return e.category === "BIRTHDAY" || e.category === "LONGEVITY";
    return true;
  });

  const next30DaysEvents = filteredEvents.filter((e) => e.daysRemaining <= 30);

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-stone-800 flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <header className="bg-gradient-to-r from-[#701212] via-[#8B1D1D] to-[#5A0E0E] text-white px-4 sm:px-8 py-3.5 shadow-md border-b-2 border-[#E0A926]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-amber-300" />
              <span>Về Cây Phả Hệ</span>
            </Link>
            <span className="text-amber-300/40">|</span>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-300" />
              <h1 className="font-serif font-bold text-base sm:text-lg text-amber-100">
                Lịch Lễ Giỗ, Sự Kiện & Sinh Nhật Con Cháu
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/kinship"
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#3B1100] bg-gradient-to-r from-[#FADB7F] via-[#E0A926] to-[#C9911C] hover:brightness-105 shadow-md transition-all flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-[#8B1D1D]" />
              <span className="hidden sm:inline">Tra Cứu Xưng Hô</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* HERO SECTION: Nearest Anniversary Countdown Timer */}
        {nearestAnniversary && (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-[#E0A926] bg-gradient-to-br from-[#8B1D1D] via-[#A82525] to-[#601212] text-white p-6 sm:p-10">
            {/* Background lotus glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Info */}
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-300/30">
                  <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>NGÀY GIỖ GẦN NHẤT ĐANG ĐẾN</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-amber-100 tracking-tight">
                  {nearestAnniversary.personName}
                </h2>

                {nearestAnniversary.nickname && (
                  <p className="text-lg text-amber-300 italic font-serif">
                    &ldquo;{nearestAnniversary.nickname}&rdquo;
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-amber-100/90 pt-1">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-amber-300" />
                    <span>Dương lịch: <strong>{nearestAnniversary.solarDateStr}</strong></span>
                  </div>
                  <span className="text-amber-300/40">&bull;</span>
                  <div className="flex items-center gap-1.5">
                    <Flower2 className="w-4 h-4 text-rose-300" />
                    <span>Âm lịch: <strong>{nearestAnniversary.lunarDateStr}</strong></span>
                  </div>
                  <span className="text-amber-300/40">&bull;</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-300" />
                    <span>{nearestAnniversary.location}</span>
                  </div>
                </div>
              </div>

              {/* Right Live Countdown Display */}
              <div className="lg:col-span-5 bg-black/35 backdrop-blur-md rounded-2xl p-5 border border-amber-300/30 shadow-inner">
                <p className="text-xs uppercase font-bold text-amber-200 tracking-widest text-center mb-3">
                  Thời Gian Đếm Ngược Đến Giỗ
                </p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-300">
                      {timeLeft.days}
                    </div>
                    <div className="text-[10px] text-amber-100/70 uppercase">Ngày</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-300">
                      {timeLeft.hours.toString().padStart(2, "0")}
                    </div>
                    <div className="text-[10px] text-amber-100/70 uppercase">Giờ</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-300">
                      {timeLeft.minutes.toString().padStart(2, "0")}
                    </div>
                    <div className="text-[10px] text-amber-100/70 uppercase">Phút</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-400 animate-pulse">
                      {timeLeft.seconds.toString().padStart(2, "0")}
                    </div>
                    <div className="text-[10px] text-amber-100/70 uppercase">Giây</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "ALL"
                  ? "bg-[#8B1D1D] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Tất cả sự kiện ({events.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("ANNIVERSARY")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "ANNIVERSARY"
                  ? "bg-[#8B1D1D] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Ngày giỗ kỵ nhật
            </button>
            <button
              type="button"
              onClick={() => setFilter("CLAN")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "CLAN"
                  ? "bg-[#8B1D1D] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Lễ hội & Họp họ
            </button>
            <button
              type="button"
              onClick={() => setFilter("BIRTHDAY")}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filter === "BIRTHDAY"
                  ? "bg-[#8B1D1D] text-white shadow-sm"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Mừng thọ & Sinh nhật
            </button>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Thuật toán tự động quy đổi Âm lịch sang ngày Dương lịch chính xác năm {new Date().getFullYear()}
          </div>
        </div>

        {/* Section 1: Upcoming in 30 Days */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-amber-600/30 pb-2">
            <Bell className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Sự Kiện Sắp Diễn Ra Trong 30 Ngày Tới ({next30DaysEvents.length})
            </h3>
          </div>

          {next30DaysEvents.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 text-stone-500 text-sm">
              Không có lễ giỗ hay sự kiện nào trong 30 ngày tới. Bạn có thể xem danh sách toàn niên biểu bên dưới.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {next30DaysEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          evt.category === "ANNIVERSARY"
                            ? "bg-amber-100 text-amber-900 border border-amber-300"
                            : evt.category === "CLAN_MEETING"
                            ? "bg-blue-100 text-blue-900 border border-blue-300"
                            : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        }`}
                      >
                        {evt.category === "ANNIVERSARY"
                          ? "KỴ NHẬT"
                          : evt.category === "CLAN_MEETING"
                          ? "HỌP HỌ"
                          : "MỪNG THỌ"}
                      </span>

                      <span className="text-xs font-bold text-[#8B1D1D] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                        {evt.isToday ? "HÔM NAY" : `Còn ${evt.daysRemaining} ngày`}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-base text-stone-900 leading-snug">
                      {evt.title}
                    </h4>

                    {evt.nickname && (
                      <p className="text-xs text-amber-700 italic">
                        &ldquo;{evt.nickname}&rdquo;
                      </p>
                    )}

                    <div className="space-y-1 text-xs text-stone-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-stone-400" />
                        <span>Dương: <strong>{evt.solarDateStr}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Flower2 className="w-3.5 h-3.5 text-rose-500" />
                        <span>Âm: <strong>{evt.lunarDateStr}</strong></span>
                      </div>
                      {evt.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: All Events / Annual Calendar */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center gap-2 border-b-2 border-amber-600/30 pb-2">
            <Clock className="w-5 h-5 text-amber-700" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Toàn Bộ Lịch Lễ Giỗ & Cột Mốc Trong Năm ({filteredEvents.length})
            </h3>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 shadow-md divide-y divide-stone-100 overflow-hidden">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                      evt.category === "ANNIVERSARY"
                        ? "bg-amber-100 text-amber-900"
                        : evt.category === "CLAN_MEETING"
                        ? "bg-blue-100 text-blue-900"
                        : "bg-rose-100 text-rose-900"
                    }`}
                  >
                    {evt.category === "ANNIVERSARY" ? (
                      <Flower2 className="w-5 h-5 text-amber-700" />
                    ) : evt.category === "CLAN_MEETING" ? (
                      <Users className="w-5 h-5 text-blue-700" />
                    ) : (
                      <Cake className="w-5 h-5 text-rose-700" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-stone-900">
                      {evt.title}
                    </h4>
                    {evt.nickname && (
                      <p className="text-xs text-amber-700 italic">
                        &ldquo;{evt.nickname}&rdquo;
                      </p>
                    )}
                    <p className="text-xs text-stone-500 mt-0.5">
                      {evt.location} {evt.note ? `&bull; ${evt.note}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:text-right shrink-0">
                  <div>
                    <div className="text-xs font-bold text-stone-800">
                      {evt.solarDateStr}
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {evt.lunarDateStr}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      evt.daysRemaining <= 30
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {evt.isToday ? "Hôm nay" : `Sau ${evt.daysRemaining} ngày`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
