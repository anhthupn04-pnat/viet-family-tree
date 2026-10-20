"use client";

import React from "react";
import { GitBranch, ShieldCheck, Heart, Sparkles, Users } from "lucide-react";
import { useFamilyStore } from "@/lib/family-store";

export default function LotusFooter() {
  const { members } = useFamilyStore();
  const maxGen = Math.max(...members.map((m) => m.generation || 1), 2);
  const maleCount = members.filter((m) => m.gender === "male").length;
  const femaleCount = members.filter((m) => m.gender === "female").length;

  return (
    <footer className="mt-12 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
            TP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800 text-sm">
                Phan Family Tree Hub
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
                Tộc Phan
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Sơ đồ gia phả trực quan hiện đại & danh mục thành viên
            </p>
          </div>
        </div>

        {/* Live Stats */}
        <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
          <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Tổng thành viên: <strong>{members.length}</strong> ({maleCount} Nam, {femaleCount} Nữ)
            </span>
          </span>
          <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
            <GitBranch className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              Thế hệ: <strong>{maxGen} Đời</strong>
            </span>
          </span>
          <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Sẵn sàng mở rộng 50+ thành viên</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
