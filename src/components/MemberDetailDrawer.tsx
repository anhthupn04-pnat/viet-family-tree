"use client";

import React from "react";
import {
  X,
  User,
  Heart,
  Calendar,
  MapPin,
  Phone,
  ShieldAlert,
  Search,
  Edit,
  Trash2,
  FileText,
  Users,
  Compass,
} from "lucide-react";
import { formatVietnameseDate } from "@/lib/lunar";

interface MemberDetailDrawerProps {
  member: any | null;
  onClose: () => void;
  isAdmin: boolean;
  onEdit: (member: any) => void;
  onDelete: (id: string, name: string) => void;
  onKinshipSearch: (memberId: string) => void;
  onProposeChange: (member: any) => void;
}

export default function MemberDetailDrawer({
  member,
  onClose,
  isAdmin,
  onEdit,
  onDelete,
  onKinshipSearch,
  onProposeChange,
}: MemberDetailDrawerProps) {
  if (!member) return null;

  const isMale = member.gender === "MALE";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#C59B27]/40 overflow-hidden transform transition-all duration-300">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-[#8B1E1E] to-[#601313] p-6 text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div
              className={`w-16 h-16 rounded-full border-2 border-[#C59B27] flex items-center justify-center text-xl font-bold font-serif shadow-md ${
                isMale ? "bg-blue-900/60 text-blue-200" : "bg-pink-900/60 text-pink-200"
              }`}
            >
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span>{member.fullName.charAt(0)}</span>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-[#C59B27] text-[#24150b] text-[10px] font-bold px-2 py-0.5 rounded">
                  Đời thứ {member.generation}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    member.isAlive
                      ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                      : "bg-white/20 text-white/80"
                  }`}
                >
                  {member.isAlive ? "Còn sống" : "Đã khuất"}
                </span>
              </div>

              <h2 className="text-xl font-bold font-serif text-amber-100 mt-1">
                {member.fullName}
              </h2>
              <p className="text-xs text-amber-200/80 italic">
                {member.courtesyName || (isMale ? "Nam giới" : "Nữ giới")}
              </p>
            </div>
          </div>
        </div>

        {/* Details list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-stone-700">
          {/* Mã thành viên & Chi họ */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">
                Mã gia phả
              </span>
              <span className="font-mono font-semibold text-stone-800">
                {member.memberCode}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">
                Thuộc Chi Họ
              </span>
              <span className="font-semibold text-[#8B1E1E]">
                {member.branch?.branchName || member.branchName || "Chưa phân chi"}
              </span>
            </div>
          </div>

          {/* Ngày sinh / ngày mất */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1">
              <Calendar className="w-4 h-4 text-[#C59B27]" />
              <span>Thời Gian Dương Lịch & Âm Lịch</span>
            </h4>
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-1.5">
              <p>
                <strong>Ngày sinh:</strong>{" "}
                {formatVietnameseDate(member.birthSolar, member.birthLunar)}
              </p>
              {!member.isAlive && (
                <p>
                  <strong>Ngày quy tiên (mất):</strong>{" "}
                  {formatVietnameseDate(member.deathSolar, member.deathLunar)}
                </p>
              )}
            </div>
          </div>

          {/* Quan hệ trực hệ: Cha, Mẹ, Vợ/Chồng, Con cái */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1">
              <Users className="w-4 h-4 text-[#8B1E1E]" />
              <span>Huyết Thống & Hôn Phối</span>
            </h4>
            <div className="space-y-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <p>
                <strong>Thân phụ (Cha):</strong>{" "}
                {member.father ? (
                  <span className="text-blue-700 font-semibold">{member.father.fullName}</span>
                ) : (
                  <span className="text-stone-400">Chưa rõ</span>
                )}
              </p>
              <p>
                <strong>Thân mẫu (Mẹ):</strong>{" "}
                {member.mother ? (
                  <span className="text-pink-700 font-semibold">{member.mother.fullName}</span>
                ) : (
                  <span className="text-stone-400">Chưa rõ</span>
                )}
              </p>
              {member.spouses && member.spouses.length > 0 && (
                <p>
                  <strong>Phu nhân / Hôn phối:</strong>{" "}
                  <span className="text-[#8B1E1E] font-semibold">
                    {member.spouses.map((s: any) => s.fullName).join(", ")}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Nơi cư trú & Mộ phần */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1">
              <MapPin className="w-4 h-4 text-[#C59B27]" />
              <span>Địa Chỉ & Nơi An Táng</span>
            </h4>
            <div className="space-y-1.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <p>
                <strong>Quê quán:</strong> {member.hometown || "Chưa cập nhật"}
              </p>
              <p>
                <strong>Nơi cư trú:</strong> {member.currentResidence || "Chưa cập nhật"}
              </p>
              {!member.isAlive && (
                <p>
                  <strong>Mộ phần / Nơi an táng:</strong>{" "}
                  <span className="text-stone-900 font-medium">
                    {member.burialPlace || "Khu lăng mộ dòng tộc"}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Số điện thoại (Chỉ Admin & Thành viên xem, Khách bị ẩn) */}
          <div className="p-3 rounded-xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-stone-400" />
              <span>Số điện thoại:</span>
            </div>
            {isAdmin ? (
              <span className="font-mono font-bold text-stone-800">
                {member.phone || "Chưa lưu"}
              </span>
            ) : (
              <span className="text-stone-400 italic">
                (Được bảo mật theo quyền riêng tư)
              </span>
            )}
          </div>

          {/* Tiểu sử, sự nghiệp */}
          {member.biography && (
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1">
                <FileText className="w-4 h-4 text-[#8B1E1E]" />
                <span>Tiểu Sử & Đóng Góp</span>
              </h4>
              <p className="text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200 leading-relaxed whitespace-pre-line">
                {member.biography}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 shrink-0 space-y-2">
          {/* Nút tra cứu xưng hô */}
          <button
            type="button"
            onClick={() => onKinshipSearch(member.id)}
            className="w-full py-2 bg-[#FAF7EE] hover:bg-[#F4EEDC] text-[#8B1E1E] border border-[#C59B27] rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2"
          >
            <Compass className="w-4 h-4 text-[#C59B27]" />
            <span>Tra cứu xưng hô với thành viên này</span>
          </button>

          {/* Admin actions vs Guest actions */}
          {isAdmin ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onEdit(member)}
                className="flex-1 py-2 bg-[#8B1E1E] hover:bg-[#721515] text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(member.id, member.fullName)}
                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-200 rounded-xl transition-colors"
                title="Xóa hồ sơ này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onProposeChange(member)}
              className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-stone-600" />
              <span>Gửi đề xuất bổ sung thông tin</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
