"use client";

import React, { useState } from "react";
import { X, Lock, Mail, ShieldCheck, KeyRound, Sparkles } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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

    const result = loginAdmin(email, password);
    if (!result.success) {
      setError(result.message || "Email hoặc mật khẩu không chính xác!");
      setLoading(false);
      return;
    }

    setLoading(false);
    onLoginSuccess?.({ email, name: email });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                Đăng Nhập Quản Trị Viên
              </h3>
              <p className="text-xs text-slate-400">
                Phan Family Tree Hub • Ban Trị Sự
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
              {error}
            </div>
          )}

          {/* Quick Preset Buttons for testing */}
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl space-y-2">
            <p className="font-bold text-blue-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Tài khoản mẫu để kiểm thử trên Vercel:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleFillSuperAdmin}
                className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-300 font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
              >
                Super Admin (anhthuphan0102@gmail.com)
              </button>
              <button
                type="button"
                onClick={handleFillSubAdmin}
                className="px-2.5 py-1 bg-white hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-300 font-mono text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
              >
                Ban Trị Sự (admin@tophan.vn)
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

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{loading ? "Đang xác thực..." : "Đăng Nhập"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
