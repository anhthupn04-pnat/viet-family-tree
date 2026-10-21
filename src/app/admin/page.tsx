"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { FamilyStoreProvider, useFamilyStore } from "@/lib/family-store";
import Link from "next/link";

function AdminRouteGuardContent() {
  const router = useRouter();
  const { isAdmin } = useFamilyStore();

  useEffect(() => {
    if (isAdmin) {
      router.replace("/?tab=admin");
    }
  }, [isAdmin, router]);

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="w-10 h-10 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-800">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden text-center p-8 animate-in fade-in">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center mx-auto mb-4 text-rose-600">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
          Truy Cập Bị Chặn (403 Forbidden)
        </span>

        <h1 className="text-xl font-bold text-slate-900 mt-3 mb-2">
          Khu Vực Dành Riêng Cho Quản Trị Viên
        </h1>

        <p className="text-xs text-slate-500 leading-relaxed mb-6">
          Bạn đang truy cập với vai trò <strong>Khách vãng lai / Thành viên xem (VIEWER)</strong>. 
          Khu vực Quản trị & Xét duyệt yêu cầu quyền <code>SUPER_ADMIN</code> hoặc <code>TREE_MANAGER</code>.
        </p>

        <div className="space-y-2.5">
          <Link
            href="/login"
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng Nhập Quản Trị Viên</span>
          </Link>

          <Link
            href="/"
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay Về Trang Chủ Xem Phả Hệ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <FamilyStoreProvider>
      <AdminRouteGuardContent />
    </FamilyStoreProvider>
  );
}
