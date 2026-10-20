"use client";

import React, { useState } from "react";
import { X, Lock, Mail, ShieldCheck, KeyRound, Sparkles } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFillAdmin = () => {
    setEmail("anhthuphan0102@gmail.com");
    setPassword("01022004");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Đăng nhập thất bại.");
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi đăng nhập.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-[#C59B27]/40 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#8B1E1E] to-[#681313] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-amber-200">
                Đăng Nhập Quản Trị Viên
              </h2>
              <p className="text-[11px] text-amber-100/70">
                Gia Phả Việt — VietFamilyTree
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-100/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Quick preset for Admin */}
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-900 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Tài khoản Quản trị chỉ định:</span>
              </p>
              <p className="text-[11px] text-amber-800 font-mono mt-0.5">
                anhthuphan0102@gmail.com / 010204
              </p>
            </div>
            <button
              type="button"
              onClick={handleFillAdmin}
              className="px-2.5 py-1 bg-[#8B1E1E] hover:bg-[#721515] text-white text-[11px] font-semibold rounded-md shadow-sm transition-all"
            >
              Điền nhanh
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Quản Trị
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anhthuphan0102@gmail.com"
                className="w-full pl-9 pr-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Mật Khẩu
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (010204)"
                className="w-full pl-9 pr-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#8B1E1E] hover:bg-[#721515] text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center space-x-1.5"
            >
              {loading ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
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
