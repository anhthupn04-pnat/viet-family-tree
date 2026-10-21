"use client";

import React, { useState } from "react";
import {
  X,
  Send,
  UserPlus,
  Edit3,
  AlertTriangle,
  CheckCircle2,
  Phone,
  User,
  HeartHandshake,
  Calendar,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Member, SuggestionType } from "@/types/family";

interface CrowdsourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMember?: Member | null;
  treeId: string;
  defaultType?: SuggestionType;
  onSuccessToast?: (msg: string) => void;
}

export default function CrowdsourceModal({
  isOpen,
  onClose,
  targetMember,
  treeId,
  defaultType = "EDIT_INFO",
  onSuccessToast,
}: CrowdsourceModalProps) {
  const [suggestionType, setSuggestionType] = useState<SuggestionType>(
    targetMember ? defaultType : "ADD_CHILD"
  );
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderRelation, setSenderRelation] = useState("");

  // Proposed Data
  const [fullName, setFullName] = useState(targetMember ? targetMember.fullName : "");
  const [gender, setGender] = useState<"male" | "female" | "other">(
    targetMember ? targetMember.gender : "male"
  );
  const [birthDate, setBirthDate] = useState(targetMember?.birthDate || "");
  const [deathDate, setDeathDate] = useState(targetMember?.deathDate || "");
  const [isAlive, setIsAlive] = useState(targetMember ? targetMember.isAlive : true);
  const [phone, setPhone] = useState(targetMember?.phone || "");
  const [address, setAddress] = useState(targetMember?.address || "");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!senderName.trim()) {
      setError("Vui lòng nhập Họ tên người gửi đề xuất.");
      return;
    }

    if (!senderPhone.trim()) {
      setError("Vui lòng cung cấp số điện thoại để Ban trị sự liên hệ xác minh.");
      return;
    }

    if (suggestionType === "ADD_CHILD" && !fullName.trim()) {
      setError("Vui lòng nhập Họ và tên thành viên con/cháu mới.");
      return;
    }

    setIsSubmitting(true);

    const proposedPayload = {
      fullName: fullName.trim() || targetMember?.fullName,
      gender,
      birthDate: birthDate.trim() || undefined,
      deathDate: !isAlive ? deathDate.trim() || undefined : undefined,
      isAlive,
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      notes: notes.trim() || undefined,
      senderRelation: senderRelation.trim() || undefined,
    };

    try {
      const res = await fetch(`/api/public/trees/${treeId}/suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetMemberId: targetMember?.id || null,
          senderName: senderName.trim(),
          senderPhone: senderPhone.trim(),
          suggestionType,
          proposedData: proposedPayload,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gửi đề xuất không thành công.");
      }

      setIsSuccess(true);
      if (onSuccessToast) {
        onSuccessToast("Đã gửi đề xuất thành công! Ban trị sự sẽ kiểm duyệt và cập nhật.");
      }
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Lỗi khi gửi đề xuất.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Đề Xuất Đóng Góp Phả Hệ
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cộng đồng con cháu chung tay gìn giữ & bổ sung gia phả
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-slate-900 text-base">Gửi Đề Xuất Thành Công!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Cảm ơn tấm lòng hướng về nguồn cội của bạn. Ban trị sự dòng họ sẽ đối soát tư liệu và phê duyệt sớm nhất.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 font-medium">
                {error}
              </div>
            )}

            {/* Target Member Banner */}
            {targetMember && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2.5 text-blue-900">
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                    Thành viên tham chiếu
                  </span>
                  <span className="font-bold text-slate-900">{targetMember.fullName}</span> (Đời {targetMember.generation} - {targetMember.gender === "male" ? "Nam" : "Nữ"})
                </div>
              </div>
            )}

            {/* Suggestion Type Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setSuggestionType("EDIT_INFO")}
                className={`py-2 px-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  suggestionType === "EDIT_INFO"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sửa thông tin</span>
              </button>
              <button
                type="button"
                onClick={() => setSuggestionType("ADD_CHILD")}
                className={`py-2 px-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  suggestionType === "ADD_CHILD"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Thêm con/cháu</span>
              </button>
              <button
                type="button"
                onClick={() => setSuggestionType("REPORT_ERROR")}
                className={`py-2 px-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  suggestionType === "REPORT_ERROR"
                    ? "bg-white text-rose-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Báo sai sót</span>
              </button>
            </div>

            {/* Proposed Content */}
            <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                {suggestionType === "ADD_CHILD" ? "Thông tin con / cháu mới" : "Nội dung cần cập nhật"}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {suggestionType === "ADD_CHILD" ? "Họ và tên con/cháu *" : "Họ và tên chính xác"}
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phan Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {suggestionType === "ADD_CHILD" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Giới tính</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tình trạng</label>
                    <select
                      value={isAlive ? "alive" : "deceased"}
                      onChange={(e) => setIsAlive(e.target.value === "alive")}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="alive">Còn sống</option>
                      <option value="deceased">Đã tạ thế</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày / Năm sinh</label>
                  <input
                    type="text"
                    placeholder="VD: 1985 hoặc 15/06/1985"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isAlive ? "Nơi ở hiện nay" : "Ngày mất / Mộ phần"}
                  </label>
                  <input
                    type="text"
                    placeholder={isAlive ? "Tỉnh / Thành phố" : "Âm lịch hoặc địa điểm an táng"}
                    value={isAlive ? address : deathDate}
                    onChange={(e) => (isAlive ? setAddress(e.target.value) : setDeathDate(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Chi tiết nội dung đề xuất / Lý do chỉnh sửa *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ghi rõ chi tiết sai sót, thông tin cần bổ sung hoặc tài liệu chứng minh..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Sender Information */}
            <div className="space-y-3 bg-blue-50/30 p-3.5 rounded-xl border border-blue-200/70">
              <div className="font-bold text-blue-900 text-[11px] uppercase tracking-wider">
                Thông tin người gửi (Để Ban Trị Sự đối chiếu)
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Họ tên của bạn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Phan Văn Bình"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số điện thoại liên lạc *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0912..."
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mối quan hệ với người này / dòng họ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Con trưởng, cháu nội, người cùng chi phái..."
                  value={senderRelation}
                  onChange={(e) => setSenderRelation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Đang gửi đề xuất..." : "Gửi Đề Xuất Phê Duyệt"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
