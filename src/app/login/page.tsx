"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, KeyRound, Sparkles, ArrowLeft } from "lucide-react";
import { FamilyStoreProvider, useFamilyStore } from "@/lib/family-store";
import Link from "next/link";

function LoginPageContent() {
  const router = useRouter();
  const { loginAdmin, isAdmin, currentAdmin } = useFamilyStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFillSuperAdmin = () => {
    setEmail("anhthuphan0102@gmail.com");
    setPassword("010204");
    setError(null);
  };

  const handleFillSubAdmin = () => {
    setEmail("admin@tophan.vn");
    setPassword("admin123");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = loginAdmin(email, password);
    if (!res.success) {
      setError(res.message || "Email hoặc mật khẩu không chính xác!");
      setLoading(false);
      return;
    }

    setLoading(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Cây Phả Hệ</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 bg-slate-900 text-white text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">Đăng Nhập Quản Trị Viên</h1>
            <p className="text-xs text-slate-400 mt-1">
              Phan Family Tree Hub • Cổng Kiểm Duyệt Phả Hệ
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 font-medium">
                {error}
              </div>
            )}

            {/* Presets */}
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl space-y-2">
              <p className="font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Tài khoản kiểm thử nhanh:</span>
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={handleFillSuperAdmin}
                  className="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-300 font-mono text-[11px] font-semibold text-left transition-all cursor-pointer shadow-2xs"
                >
                  Super Admin: anhthuphan0102@gmail.com / 010204
                </button>
                <button
                  type="button"
                  onClick={handleFillSubAdmin}
                  className="px-2.5 py-1.5 bg-white hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-300 font-mono text-[11px] font-semibold text-left transition-all cursor-pointer shadow-2xs"
                >
                  Ban Trị Sự: admin@tophan.vn / admin123
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Quản Trị
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="admin@tophan.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-xs"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? "Đang xác thực..." : "Đăng Nhập Vào Hệ Thống"}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <FamilyStoreProvider>
      <LoginPageContent />
    </FamilyStoreProvider>
  );
}
