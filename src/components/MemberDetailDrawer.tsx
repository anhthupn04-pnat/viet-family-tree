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
  Star,
  Flower2,
  ExternalLink,
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
  onSelectMember?: (member: any) => void;
}

export default function MemberDetailDrawer({
  member,
  onClose,
  isAdmin,
  onEdit,
  onDelete,
  onKinshipSearch,
  onProposeChange,
  onSelectMember,
}: MemberDetailDrawerProps) {
  if (!member) return null;

  const isMale = member.gender === "MALE";
  const isMartyr =
    Boolean(member.isMartyr) ||
    member.biography?.toLowerCase().includes("liệt sĩ") ||
    member.courtesyName?.toLowerCase().includes("liệt sĩ");

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FCFBF7] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#C59B27]/40 overflow-hidden transform transition-all duration-300">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-[#8B1E1E] via-[#A91B1B] to-[#601313] p-6 text-white shrink-0 border-b-2 border-[#E0A926]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4">
            <div
              className={`w-16 h-16 rounded-full border-2 border-[#E0A926] flex items-center justify-center text-xl font-bold font-serif shadow-md overflow-hidden ${
                isMale ? "bg-emerald-950/80 text-amber-200" : "bg-pink-950/80 text-pink-200"
              }`}
            >
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{member.fullName.charAt(0)}</span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="bg-[#E0A926] text-[#24150b] text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                  Đời thứ {member.generation}
                </span>

                {member.birthOrder && (
                  <span className="bg-amber-400/20 text-amber-200 border border-amber-300/40 text-[10px] font-bold px-2 py-0.5 rounded">
                    {member.birthOrder}
                  </span>
                )}

                {isMartyr ? (
                  <span className="bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded flex items-center space-x-1 shadow-xs border border-amber-300">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>Liệt Sĩ</span>
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded flex items-center space-x-1 ${
                      member.isAlive
                        ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                        : "bg-white/20 text-white/90"
                    }`}
                  >
                    {!member.isAlive && <Flower2 className="w-3 h-3 text-[#F06292]" />}
                    <span>{member.isAlive ? "Còn sống" : "Đã khuất"}</span>
                  </span>
                )}
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
          <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
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

          {/* Ngày sinh / ngày mất (Dương lịch & Âm lịch) */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1 font-serif">
              <Calendar className="w-4 h-4 text-[#C59B27]" />
              <span>Thời Gian Dương Lịch & Âm Lịch Can Chi</span>
            </h4>
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-1.5">
              <p>
                <strong>Ngày sinh:</strong>{" "}
                {formatVietnameseDate(member.birthSolar, member.birthLunar)}
              </p>
              {!member.isAlive && (
                <p className="text-[#8B1E1E]">
                  <strong>Ngày kỵ nhật (giỗ):</strong>{" "}
                  {formatVietnameseDate(member.deathSolar, member.deathLunar)}
                </p>
              )}
            </div>
          </div>

          {/* Huyết thống & Hôn phối */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1 font-serif">
              <Users className="w-4 h-4 text-[#8B1E1E]" />
              <span>Huyết Thống & Hôn Phối Trực Hệ</span>
            </h4>
            <div className="space-y-2 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
              <p>
                <strong>Thân phụ (Cha):</strong>{" "}
                {member.father ? (
                  <span className="text-emerald-800 font-semibold">{member.father.fullName}</span>
                ) : (
                  <span className="text-stone-400">Tiên tổ / Khởi tổ</span>
                )}
              </p>
              <p>
                <strong>Thân mẫu (Mẹ):</strong>{" "}
                {member.mother ? (
                  <span className="text-pink-800 font-semibold">{member.mother.fullName}</span>
                ) : (
                  <span className="text-stone-400">Chưa rõ</span>
                )}
              </p>
              {member.spouses && member.spouses.length > 0 && (
                <p>
                  <strong>Hôn phối (Vợ / Chồng):</strong>{" "}
                  <span className="text-[#8B1E1E] font-semibold">
                    {member.spouses.map((s: any) => s.fullName).join(", ")}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Nơi cư trú & Mộ phần (Google Maps link) */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1 font-serif">
              <MapPin className="w-4 h-4 text-[#C59B27]" />
              <span>Địa Chỉ Quê Quán & Mộ Phần</span>
            </h4>
            <div className="space-y-1.5 p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
              <p>
                <strong>Quê quán:</strong> {member.hometown || "Chưa cập nhật"}
              </p>
              <p>
                <strong>Nơi cư trú:</strong> {member.currentResidence || "Chưa cập nhật"}
              </p>
              {!member.isAlive && member.burialPlace && (
                <div className="mt-2 pt-2 border-t border-stone-100">
                  <p className="flex items-start justify-between">
                    <span>
                      <strong>Nơi an táng / Mộ phần:</strong>{" "}
                      <span className="text-stone-900 font-medium">
                        {member.burialPlace}
                      </span>
                    </span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        member.burialPlace
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 ml-2 font-semibold shrink-0"
                    >
                      <span>Bản đồ</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Số điện thoại (Chỉ Admin & Thành viên xem, Khách bị ẩn) */}
          <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between shadow-2xs">
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
                (Bảo mật quyền riêng tư)
              </span>
            )}
          </div>

          {/* Tiểu sử, sự nghiệp, công trạng */}
          {member.biography && (
            <div className="space-y-2">
              <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1 font-serif">
                <FileText className="w-4 h-4 text-[#8B1E1E]" />
                <span>Tiểu Sử, Sự Nghiệp & Công Trạng</span>
              </h4>
              <p className="text-stone-700 bg-white p-3.5 rounded-xl border border-stone-200 leading-relaxed whitespace-pre-line text-justify shadow-2xs">
                {member.biography}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 shrink-0 space-y-2">
          {/* Nút tra cứu xưng hô */}
          <button
            type="button"
            onClick={() => onKinshipSearch(member.id)}
            className="w-full py-2 bg-[#FAF7EE] hover:bg-[#F4EEDC] text-[#8B1E1E] border border-[#C59B27] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2"
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
