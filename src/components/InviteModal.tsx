"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Copy,
  Check,
  Link as LinkIcon,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  Clock,
} from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clanName?: string;
  adminEmail?: string;
}

export default function InviteModal({
  isOpen,
  onClose,
  clanName = "Gia phả dòng họ",
  adminEmail = "anhthuphan0102@gmail.com",
}: InviteModalProps) {
  const [role, setRole] = useState<"MEMBER" | "GUEST">("MEMBER");
  const [email, setEmail] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingInvites, setExistingInvites] = useState<any[]>([]);

  const fetchExistingInvites = async () => {
    try {
      const res = await fetch("/api/invites");
      const data = await res.json();
      if (data.invites) {
        setExistingInvites(data.invites);
      }
    } catch (e) {
      console.error("Error fetching invites:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExistingInvites();
      setGeneratedLink("");
      setCopied(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          email: email.trim() || undefined,
          creatorEmail: adminEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo liên kết mời.");
      }

      const origin = typeof window !== "undefined" ? window.location.origin : "https://viet-family-tree.vercel.app";
      const fullLink = `${origin}/?invite=${data.token}`;
      setGeneratedLink(fullLink);
      fetchExistingInvites();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo mã mời.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (linkToCopy: string) => {
    navigator.clipboard.writeText(linkToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FDFBF7] rounded-3xl shadow-2xl max-w-lg w-full border-2 border-[#E0A926]/50 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#8E1515] via-[#C62828] to-[#8E1515] text-white flex items-center justify-between border-b-2 border-[#E0A926]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E0A926]/20 border border-[#E0A926]/40 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-[#FADB7F]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#FADB7F]">
                Mời Thành Viên Vào Gia Phả
              </h3>
              <p className="text-[11px] text-amber-100/80 font-serif">
                {clanName} — Tạo Liên Kết Chia Sẻ Bảo Mật
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleGenerateInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Vai trò khi tham gia qua link
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("MEMBER")}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-start space-x-2.5 ${
                    role === "MEMBER"
                      ? "border-[#1E5F52] bg-[#E6F4F1] shadow-xs ring-1 ring-[#1E5F52]"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <Users
                    className={`w-4 h-4 mt-0.5 ${
                      role === "MEMBER" ? "text-[#1E5F52]" : "text-stone-400"
                    }`}
                  />
                  <div>
                    <span className="font-bold text-xs text-[#1E5F52] block">
                      Thành viên (Member)
                    </span>
                    <span className="text-[10px] text-stone-500 leading-tight block mt-0.5">
                      Xem gia phả & gửi đề xuất thêm người/ngày giỗ (chờ duyệt)
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("GUEST")}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-start space-x-2.5 ${
                    role === "GUEST"
                      ? "border-[#C62828] bg-[#FCE4EC] shadow-xs ring-1 ring-[#C62828]"
                      : "border-stone-200 hover:border-stone-300 bg-white"
                  }`}
                >
                  <Sparkles
                    className={`w-4 h-4 mt-0.5 ${
                      role === "GUEST" ? "text-[#C62828]" : "text-stone-400"
                    }`}
                  />
                  <div>
                    <span className="font-bold text-xs text-[#C62828] block">
                      Khách thăm quan
                    </span>
                    <span className="text-[10px] text-stone-500 leading-tight block mt-0.5">
                      Chỉ xem dữ liệu đã được công khai và phê duyệt
                    </span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Gửi tới Email người nhận (Tùy chọn)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  placeholder="ví dụ: conchau@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#1E5F52]"
                />
              </div>
              <p className="text-[10px] text-stone-400 mt-1">
                Để trống nếu bạn chỉ muốn tạo liên kết chia sẻ tự do qua Zalo / Facebook / Tin nhắn.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-[#1E5F52] to-[#2B7A6A] hover:from-[#16483E] hover:to-[#1E5F52] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-2 border border-[#E0A926]/40 disabled:opacity-60"
            >
              <LinkIcon className="w-4 h-4 text-[#FADB7F]" />
              <span>{loading ? "Đang tạo liên kết..." : "Tạo Liên Kết Mời Mới"}</span>
            </button>
          </form>

          {/* Newly Generated Link Display */}
          {generatedLink && (
            <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-400/50 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Đường dẫn mời đã sẵn sàng:</span>
                </span>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-semibold px-2 py-0.5 rounded-full">
                  Hiệu lực 30 ngày
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white p-2 rounded-xl border border-emerald-200">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="w-full text-xs font-mono text-stone-700 bg-transparent focus:outline-hidden select-all"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(generatedLink)}
                  className="px-3 py-1.5 bg-[#1E5F52] hover:bg-[#16483E] text-white rounded-lg text-xs font-semibold shrink-0 flex items-center space-x-1 transition-all shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-amber-300" />
                      <span>Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-emerald-700">
                Gửi liên kết này cho người thân dòng họ. Khi mở link, người dùng sẽ tự động nhận quyền đóng góp vào gia phả!
              </p>
            </div>
          )}

          {/* List of Previous Invites */}
          {existingInvites.length > 0 && (
            <div className="border-t border-[#E8DEC7] pt-4">
              <h4 className="text-xs font-bold text-stone-700 font-serif mb-2 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>Các liên kết mời đã tạo gần đây ({existingInvites.length})</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {existingInvites.map((inv) => {
                  const origin = typeof window !== "undefined" ? window.location.origin : "https://viet-family-tree.vercel.app";
                  const invUrl = `${origin}/?invite=${inv.token}`;
                  return (
                    <div
                      key={inv.id}
                      className="p-2.5 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              inv.role === "MEMBER"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {inv.role}
                          </span>
                          {inv.email && (
                            <span className="text-[11px] text-stone-600 truncate">
                              {inv.email}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[10px] text-stone-400 truncate mt-0.5">
                          {invUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(invUrl)}
                        className="p-1.5 text-stone-500 hover:text-[#1E5F52] hover:bg-emerald-50 rounded-lg transition-colors shrink-0"
                        title="Sao chép liên kết"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#FAF7EE] border-t border-[#E8DEC7] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded-xl transition-colors shadow-2xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
