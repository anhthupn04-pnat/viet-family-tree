"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  Users,
  ArrowRightLeft,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Info,
  Calendar,
  GitBranch,
} from "lucide-react";
import { MOCK_MEMBERS } from "@/lib/mockData";
import { getLocalMembers } from "@/lib/treeStorage";
import { calculateKinship, KinshipMember, KinshipResult } from "@/lib/kinship";

export default function KinshipCalculatorPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [memberAId, setMemberAId] = useState<string>("");
  const [memberBId, setMemberBId] = useState<string>("");
  const [result, setResult] = useState<KinshipResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const local = getLocalMembers();
    const list = local && local.length > 0 ? local : MOCK_MEMBERS;
    setMembers(list);

    // Pre-select first 2 members if available
    if (list.length >= 2) {
      setMemberAId(list[0].id);
      setMemberBId(list[1].id);
    }
  }, []);

  const handleCalculate = (aId = memberAId, bId = memberBId) => {
    if (!aId || !bId) {
      setError("Vui lòng chọn đủ 2 thành viên cần đối chiếu quan hệ.");
      setResult(null);
      return;
    }

    if (aId === bId) {
      setError("Vui lòng chọn 2 thành viên khác nhau.");
      setResult(null);
      return;
    }

    setError(null);

    try {
      const kinshipMembers: KinshipMember[] = members.map((m) => ({
        id: m.id,
        fullName: m.fullName,
        gender: (m.gender || "MALE").toUpperCase(),
        generation: m.generation || 1,
        fatherId: m.fatherId,
        motherId: m.motherId,
        branchId: m.branchId,
        branchName: m.branchName,
        birthSolar: m.birthSolar,
      }));

      const res = calculateKinship(aId, bId, kinshipMembers);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Không thể tính toán xưng hô.");
      setResult(null);
    }
  };

  useEffect(() => {
    if (memberAId && memberBId && memberAId !== memberBId && members.length > 0) {
      handleCalculate(memberAId, memberBId);
    }
  }, [memberAId, memberBId, members.length]);

  const handleSwap = () => {
    const temp = memberAId;
    setMemberAId(memberBId);
    setMemberBId(temp);
  };

  const memberA = members.find((m) => m.id === memberAId);
  const memberB = members.find((m) => m.id === memberBId);

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-stone-800 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#701212] via-[#8B1D1D] to-[#5A0E0E] text-white px-4 sm:px-8 py-3.5 shadow-md border-b-2 border-[#E0A926]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
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
              <Compass className="w-5 h-5 text-amber-300" />
              <h1 className="font-serif font-bold text-base sm:text-lg text-amber-100">
                Công Cụ Tra Cứu Quan Hệ Xưng Hô Họ Hàng Chuẩn Việt Nam
              </h1>
            </div>
          </div>

          <Link
            href="/events"
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#3B1100] bg-gradient-to-r from-[#FADB7F] via-[#E0A926] to-[#C9911C] hover:brightness-105 shadow-md transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-[#8B1D1D]" />
            <span className="hidden sm:inline">Lịch Lễ Giỗ</span>
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Intro Card */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#8B1D1D]">
            Thuật Toán Xác Định Bậc Quan Hệ & Tổ Tiên Chung (LCA)
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Hệ thống tìm kiếm đường đi phả hệ ngắn nhất giữa 2 người, xác định tổ tiên chung gần nhất và đề xuất danh xưng truyền thống tôn ti trật tự theo văn hóa người Việt.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* Person A Selector */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
                Thành Viên Thứ Nhất (Người xưng hô)
              </label>
              <select
                value={memberAId}
                onChange={(e) => setMemberAId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 focus:border-[#8B1D1D] bg-stone-50 font-serif font-bold text-sm text-stone-900 focus:outline-none transition-all cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} {m.nickname ? `(${m.nickname})` : ""} &bull; Đời {m.generation} ({m.gender === "FEMALE" ? "Nữ" : "Nam"})
                  </option>
                ))}
              </select>

              {memberA && (
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>{memberA.fullName}</span>
                    <span className="text-[10px] bg-blue-200/70 px-1.5 py-0.5 rounded">
                      Đời {memberA.generation}
                    </span>
                  </div>
                  {memberA.nickname && (
                    <div className="italic text-amber-800">&ldquo;{memberA.nickname}&rdquo;</div>
                  )}
                  <div className="text-stone-500 text-[11px]">
                    {memberA.branchName || "Chi họ chính"} &bull; {memberA.gender === "FEMALE" ? "Nữ giới" : "Nam giới"}
                  </div>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={handleSwap}
                title="Đổi chiều xưng hô"
                className="p-3 rounded-full bg-amber-100 hover:bg-amber-200 text-[#8B1D1D] border border-amber-300 shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ArrowRightLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Person B Selector */}
            <div className="md:col-span-5 space-y-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">
                Thành Viên Thứ Hai (Người được gọi)
              </label>
              <select
                value={memberBId}
                onChange={(e) => setMemberBId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-300 focus:border-[#8B1D1D] bg-stone-50 font-serif font-bold text-sm text-stone-900 focus:outline-none transition-all cursor-pointer"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} {m.nickname ? `(${m.nickname})` : ""} &bull; Đời {m.generation} ({m.gender === "FEMALE" ? "Nữ" : "Nam"})
                  </option>
                ))}
              </select>

              {memberB && (
                <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-200/60 text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center justify-between">
                    <span>{memberB.fullName}</span>
                    <span className="text-[10px] bg-rose-200/70 px-1.5 py-0.5 rounded">
                      Đời {memberB.generation}
                    </span>
                  </div>
                  {memberB.nickname && (
                    <div className="italic text-amber-800">&ldquo;{memberB.nickname}&rdquo;</div>
                  )}
                  <div className="text-stone-500 text-[11px]">
                    {memberB.branchName || "Chi họ chính"} &bull; {memberB.gender === "FEMALE" ? "Nữ giới" : "Nam giới"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className="pt-6 border-t-2 border-amber-500/20 space-y-6 animate-in fade-in">
              {/* Highlight call box */}
              <div className="bg-gradient-to-r from-amber-50 via-amber-100/60 to-amber-50 rounded-2xl p-6 border-2 border-amber-400 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-amber-300">
                  <div className="space-y-1">
                    <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
                      {result.memberA.name} gọi {result.memberB.name} là:
                    </span>
                    <div className="text-2xl sm:text-3xl font-serif font-extrabold text-[#8B1D1D] pt-1">
                      &ldquo;{result.howACallsB}&rdquo;
                    </div>
                  </div>

                  <div className="space-y-1 pt-4 sm:pt-0 sm:pl-6">
                    <span className="text-xs uppercase font-bold text-stone-500 tracking-wider">
                      {result.memberB.name} gọi {result.memberA.name} là:
                    </span>
                    <div className="text-2xl sm:text-3xl font-serif font-extrabold text-blue-900 pt-1">
                      &ldquo;{result.howBCallsA}&rdquo;
                    </div>
                  </div>
                </div>
              </div>

              {/* LCA & Relationship Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-stone-500 block uppercase font-bold text-[10px]">
                    Tổ Tiên Chung Gần Nhất (LCA)
                  </span>
                  <div className="font-serif font-bold text-sm text-[#8B1D1D]">
                    {result.commonAncestor ? result.commonAncestor.name : "Trực hệ / Khởi tổ"}
                  </div>
                  {result.commonAncestor && (
                    <div className="text-stone-500 text-[11px]">
                      Thế hệ Đời thứ {result.commonAncestor.generation}
                    </div>
                  )}
                </div>

                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-stone-500 block uppercase font-bold text-[10px]">
                    Tính Chất Quan Hệ
                  </span>
                  <div className="font-bold text-sm text-stone-800">
                    {result.relationshipType === "TRỰC_HỆ"
                      ? "Trực hệ huyết thống"
                      : result.relationshipType === "BÀNG_HỆ"
                      ? "Bàng hệ (Cùng cụ/ông bà)"
                      : "Quan hệ hôn phối"}
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    Cách biệt: {Math.abs(result.generationDiff)} đời
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-stone-500 block uppercase font-bold text-[10px]">
                    Bậc Quan Hệ Dòng Họ
                  </span>
                  <div className="font-bold text-sm text-emerald-800">
                    Bậc {result.degreeOfSeparation || 1}
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    Phạm vi 5 đời (Ngũ đại tùng đường)
                  </div>
                </div>
              </div>

              {/* Explanation Note */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong>Giải thích chuẩn tắc gia phong:</strong>
                  <p>{result.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
