"use client";

import React, { useState } from "react";
import { X, Sparkles, Building, Globe, MapPin, Compass } from "lucide-react";

interface CreateClanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newClan: any) => void;
}

export default function CreateClanModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateClanModalProps) {
  const [name, setName] = useState("Gia phả dòng họ");
  const [couplet1, setCouplet1] = useState("");
  const [couplet2, setCouplet2] = useState("");
  const [originLocation, setOriginLocation] = useState("");
  const [mainRegion, setMainRegion] = useState("Miền Bắc");
  const [slug, setSlug] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [allowMemberInvite, setAllowMemberInvite] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    // Tự sinh slug
    const autoSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setSlug(autoSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên gia phả dòng họ.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/clans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          couplet1,
          couplet2,
          originLocation: originLocation || "Chưa xác định",
          mainRegion,
          slug: slug || "gia-pha-" + Date.now(),
          isPublic,
          allowMemberInvite,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo gia phả mới.");
      }

      onSuccess(data.clan);
      onClose();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-[#C59B27]/40 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FAF7EE] to-white border-b border-[#EFE8D8] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#8B1E1E] flex items-center space-x-2">
              <Building className="w-5 h-5 text-[#C59B27]" />
              <span>Tạo Gia Phả Mới</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Điền thông tin để tạo gia phả mới cho dòng họ của bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Tên gia phả */}
          <div>
            <label className="block text-xs font-semibold text-stone-800 mb-1">
              Tên gia phả <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Gia phả dòng họ Nguyễn, Gia phả họ Phan..."
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
            />
          </div>

          {/* Câu đối 1 */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Câu đối 1 (tùy chọn)
            </label>
            <input
              type="text"
              value={couplet1}
              onChange={(e) => setCouplet1(e.target.value)}
              placeholder="Nhập câu đối đầu tiên (tùy chọn)"
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Ví dụ: Tổ Tiên Công Đức Thiên Niên Thịnh
            </p>
          </div>

          {/* Câu đối 2 */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Câu đối 2 (tùy chọn)
            </label>
            <input
              type="text"
              value={couplet2}
              onChange={(e) => setCouplet2(e.target.value)}
              placeholder="Nhập câu đối thứ hai (tùy chọn)"
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Ví dụ: Tử Hiếu Tôn Hiền Vạn Đại Vinh
            </p>
          </div>

          {/* Nơi khởi nguồn & Khu vực sinh sống */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nơi khởi nguồn (Quê tổ)
              </label>
              <input
                type="text"
                value={originLocation}
                onChange={(e) => setOriginLocation(e.target.value)}
                placeholder="Ví dụ: Nga Sơn, Thanh Hóa"
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Khu vực sinh sống chủ đạo
              </label>
              <select
                value={mainRegion}
                onChange={(e) => setMainRegion(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
              >
                <option value="Miền Bắc">Miền Bắc</option>
                <option value="Miền Trung">Miền Trung</option>
                <option value="Miền Nam">Miền Nam</option>
                <option value="Toàn quốc & Hải ngoại">Toàn quốc & Hải ngoại</option>
              </select>
            </div>
          </div>

          {/* Đường dẫn gia phả */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Đường dẫn Gia phả (Slug URL)
            </label>
            <div className="flex items-center">
              <span className="bg-stone-100 text-stone-500 border border-r-0 border-stone-300 px-3 py-2 text-xs rounded-l-lg font-mono">
                giaphaviet.vn/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="gia-pha-dong-ho-phan"
                className="w-full px-3.5 py-2 text-sm font-mono border border-stone-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 border border-stone-200 rounded-xl flex items-center justify-between bg-stone-50/50">
              <div>
                <p className="text-xs font-semibold text-stone-800">Công khai gia phả</p>
                <p className="text-[11px] text-stone-500">
                  Cho phép mọi người xem gia phả này
                </p>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-[#8B1E1E] accent-[#8B1E1E] rounded cursor-pointer"
              />
            </div>

            <div className="p-3 border border-stone-200 rounded-xl flex items-center justify-between bg-stone-50/50">
              <div>
                <p className="text-xs font-semibold text-stone-800">
                  Cho phép mời thành viên
                </p>
                <p className="text-[11px] text-stone-500">
                  Thành viên có thể mời người khác tham gia
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowMemberInvite}
                onChange={(e) => setAllowMemberInvite(e.target.checked)}
                className="w-4 h-4 text-[#8B1E1E] accent-[#8B1E1E] rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-stone-100">
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
              className="px-5 py-2 bg-[#1E40AF] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center space-x-1.5"
            >
              {loading ? (
                <span>Đang khởi tạo...</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tạo gia phả</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
