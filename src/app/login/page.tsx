"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { FamilyStoreProvider, useFamilyStore } from "@/lib/family-store";
import Link from "next/link";

function LoginPageContent() {
  const router = useRouter();
  const { loginAdmin } = useFamilyStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowForgotNotice(false);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Vui lòng nhập email quản trị.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError("Định dạng email không hợp lệ (ví dụ: admin@example.com).");
      return;
    }

    if (!password) {
      setError("Vui lòng nhập mật khẩu tài khoản.");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((res) => setTimeout(res, 350));
      const res = loginAdmin(cleanEmail, password);
      if (!res.success) {
        setError(res.message || "Email hoặc mật khẩu không chính xác!");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi trong quá trình đăng nhập.");
      setIsSubmitting(false);
    }
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
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">Đăng Nhập Quản Trị Viên</h1>
            <p className="text-xs text-slate-400 mt-1">
              Phan Family Tree Hub • Cổng Quản Trị Phả Hệ
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs" noValidate>
            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {showForgotNotice && (
              <div className="p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-200 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  Để đặt lại mật khẩu, vui lòng liên hệ với <strong>Super Admin</strong> hoặc Ban Trị Sự.
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="login-page-email" className="block font-semibold text-slate-700">
                Email Quản Trị
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="login-page-email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-page-password" className="block font-semibold text-slate-700">
                Mật Khẩu
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="login-page-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-800">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isSubmitting}
                  className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="font-medium">Ghi nhớ đăng nhập</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotNotice(!showForgotNotice)}
                className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer text-xs disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Đăng Nhập Vào Hệ Thống</span>
                </>
              )}
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
