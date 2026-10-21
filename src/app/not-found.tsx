import React from "react";
import Link from "next/link";
import { Home, GitBranch, Landmark, AlertTriangle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-white">
      {/* Background radial glow */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 sm:p-10 text-center space-y-6 backdrop-blur-md">
        {/* Icon & 404 Badge */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-amber-500/10 border border-amber-400/30 text-amber-400 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
            <Landmark className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Mã Lỗi 404 • Không Tìm Thấy Trang
          </span>
        </div>

        {/* Heading & Explanations */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Đường Dẫn Bị Lỗi Hoặc Không Tồn Tại
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            Liên kết bạn vừa bấm có thể đã bị đổi tên, bị gỡ bỏ, hoặc đường dẫn chưa chính xác.
          </p>
          <p className="text-[11px] text-amber-300/80 font-medium">
            Quý khách có thể quay về Trang Chủ Gia Phả Chung để xem thông tin cội nguồn dòng họ và danh mục phả hệ.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Về Trang Chủ Gia Phả</span>
          </Link>

          <Link
            href="/?tab=tree"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span>Xem Sơ Đồ Cây</span>
          </Link>
        </div>

        {/* Footer note */}
        <div className="pt-4 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            Hệ thống Quản lý Gia phả Số & Cội Nguồn Dòng Tộc Việt Nam
          </p>
        </div>
      </div>
    </div>
  );
}
