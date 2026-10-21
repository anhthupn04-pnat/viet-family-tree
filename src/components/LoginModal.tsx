"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { useFamilyStore } from "@/lib/family-store";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (adminUser: any) => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const { loginAdmin } = useFamilyStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setShowForgotNotice(false);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Vui lòng nhập địa chỉ email quản trị.");
      return;
    }

    // Validate email format
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
      // Async transition delay for smooth UX
      await new Promise((res) => setTimeout(res, 350));
      const result = loginAdmin(cleanEmail, password);

      if (!result.success) {
        setError(result.message || "Email hoặc mật khẩu không chính xác. Vui lòng thử lại!");
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onLoginSuccess?.({ email: cleanEmail, name: cleanEmail });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi trong quá trình xác thực đăng nhập.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Đăng Nhập Quản Trị Viên
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cổng Quản Trị & Kiểm Duyệt Gia Phả
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs" noValidate>
          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Forgot Password Helper Notice */}
          {showForgotNotice && (
            <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-xl border border-blue-200 flex items-start gap-2 animate-in fade-in duration-150">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                Để đặt lại mật khẩu, vui lòng liên hệ trực tiếp với{" "}
                <strong>Super Admin</strong> hoặc Ban Trị Sự phụ trách dòng họ.
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label htmlFor="admin-email" className="block font-semibold text-slate-700">
              Email Quản Trị
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="admin-email"
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
                className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div className="space-y-1.5">
            <label htmlFor="admin-password" className="block font-semibold text-slate-700">
              Mật Khẩu
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                name="password"
                autoComplete="current-password"
                required
                placeholder="Nhập mật khẩu quản trị..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                className="w-full pl-9 pr-10 py-2.5 text-xs text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Auxiliary Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-800">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isSubmitting}
                className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="font-medium">Ghi nhớ đăng nhập</span>
            </label>

            <button
              type="button"
              onClick={() => setShowForgotNotice(!showForgotNotice)}
              className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer hover:underline transition-colors"
            >
              Quên mật khẩu?
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
