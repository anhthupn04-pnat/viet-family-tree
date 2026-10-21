"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw, AlertTriangle, Landmark } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-white">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 sm:p-10 text-center space-y-6 backdrop-blur-md">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mb-3">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Đã Xảy Ra Sự Cố
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Có Lỗi Khi Xử Lý Yêu Cầu
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Hệ thống gặp sự cố tạm thời khi tải trang này. Bạn có thể thử tải lại hoặc quay về Trang Chủ Gia Phả.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Thử Tải Lại</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang Chủ Gia Phả</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
