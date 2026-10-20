"use client";

import React from "react";
import {
  X,
  User,
  Heart,
  Calendar,
  MapPin,
  Phone,
  Search,
  Edit,
  Trash2,
  FileText,
  Users,
  Compass,
  Flower2,
  ExternalLink,
  Award,
  Baby,
  UserPlus,
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
  onQuickAdd?: (type: "child" | "spouse" | "parent", targetMember: any) => void;
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
  onQuickAdd,
}: MemberDetailDrawerProps) {
  if (!member) return null;

  const isMale = (member.gender || "MALE").toUpperCase() === "MALE";
  const achievements: string[] = Array.isArray(member.achievements) ? member.achievements : [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-[#FCFBF7] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-[#C59B27]/40 overflow-hidden transform transition-all duration-300">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-[#8B1E1E] via-[#A91B1B] to-[#601313] p-5 text-white shrink-0 border-b-2 border-[#E0A926]">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3.5">
            <div
              className={`w-16 h-16 rounded-full border-2 border-[#E0A926] flex items-center justify-center text-xl font-bold font-serif shadow-md overflow-hidden shrink-0 ${
                isMale ? "bg-blue-900 text-blue-100" : "bg-rose-900 text-rose-100"
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

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="bg-[#E0A926] text-[#24150b] text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                  Đời thứ {member.generation}
                </span>

                {member.birthOrder && (
                  <span className="bg-amber-400/20 text-amber-200 border border-amber-300/40 text-[10px] font-bold px-2 py-0.5 rounded">
                    {member.birthOrder}
                  </span>
                )}

                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded flex items-center space-x-1 ${
                    member.isAlive
                      ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40"
                      : "bg-white/20 text-white/90"
                  }`}
                >
                  {!member.isAlive && <Flower2 className="w-3 h-3 text-[#F06292]" />}
                  <span>{member.isAlive ? "Đang sống" : "Đã mất"}</span>
                </span>
              </div>

              <h2 className="text-lg font-bold font-serif text-amber-100 truncate">
                {member.fullName}
              </h2>

              {/* Nickname in warm italics */}
              {member.nickname ? (
                <p className="text-xs text-amber-300 italic font-medium truncate mt-0.5">
                  &ldquo;{member.nickname}&rdquo;
                </p>
              ) : member.courtesyName ? (
                <p className="text-xs text-amber-200/80 italic truncate mt-0.5">
                  {member.courtesyName}
                </p>
              ) : null}
            </div>
          </div>

          {/* Quick Action Buttons Toolbar */}
          {onQuickAdd && (
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between gap-1.5">
              <button
                type="button"
                onClick={() => onQuickAdd("spouse", member)}
                className="flex-1 py-1.5 px-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                <Heart className="w-3 h-3 text-rose-200" />
                <span>+ Thêm Vợ/Chồng</span>
              </button>

              <button
                type="button"
                onClick={() => onQuickAdd("child", member)}
                className="flex-1 py-1.5 px-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                <Baby className="w-3 h-3 text-blue-200" />
                <span>+ Thêm Con</span>
              </button>

              <button
                type="button"
                onClick={() => onQuickAdd("parent", member)}
                className="flex-1 py-1.5 px-2 bg-amber-600/80 hover:bg-amber-600 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                <UserPlus className="w-3 h-3 text-amber-200" />
                <span>+ Thêm Cha/Mẹ</span>
              </button>
            </div>
          )}
        </div>

        {/* Details list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-stone-700">
          {/* Mã thành viên & Chi họ */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">
                Mã gia phả
              </span>
              <span className="font-mono font-semibold text-stone-800">
                {member.memberCode || `GP-${member.id?.slice(0, 4)}`}
              </span>
            </div>
            <div>
              <span className="text-stone-400 block text-[10px] uppercase font-bold">
                Thuộc Chi Họ
              </span>
              <span className="font-semibold text-[#8B1E1E]">
                {member.branchName || member.branch?.branchName || "Chi tộc chính"}
              </span>
            </div>
          </div>

          {/* Ngày sinh / ngày mất (Dương lịch & Âm lịch) */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1 font-serif">
              <Calendar className="w-4 h-4 text-[#C59B27]" />
              <span>Thời Gian Dương Lịch & Kỵ Nhật Âm Lịch</span>
            </h4>
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-1.5">
              <p>
                <strong>Ngày sinh:</strong>{" "}
                {formatVietnameseDate(member.birthSolar, member.birthLunar)}
              </p>
              {!member.isAlive && (
                <p className="text-[#8B1E1E]">
                  <strong>Ngày giỗ (Kỵ nhật):</strong>{" "}
                  {member.deathLunarDay && member.deathLunarMonth
                    ? `Ngày ${member.deathLunarDay} tháng ${member.deathLunarMonth} Âm lịch`
                    : formatVietnameseDate(member.deathSolar, member.deathLunar)}
                </p>
              )}
            </div>
          </div>

          {/* Thành tích & Cột mốc nổi bật */}
          {achievements.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1 font-serif">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Thành Tích & Cột Mốc Nổi Bật</span>
              </h4>
              <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
                {achievements.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-stone-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Huyết thống & Hôn phối */}
          <div className="space-y-1.5">
            <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1 font-serif">
              <Users className="w-4 h-4 text-[#8B1E1E]" />
              <span>Huyết Thống & Hôn Phối Trực Hệ</span>
            </h4>
            <div className="space-y-2 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
              <p>
                <strong>Thân phụ (Cha):</strong>{" "}
                {member.father ? (
                  <span className="text-blue-800 font-semibold">{member.father.fullName}</span>
                ) : (
                  <span className="text-stone-400">Tiên tổ / Khởi tổ</span>
                )}
              </p>
              <p>
                <strong>Thân mẫu (Mẹ):</strong>{" "}
                {member.mother ? (
                  <span className="text-rose-800 font-semibold">{member.mother.fullName}</span>
                ) : (
                  <span className="text-stone-400">Chưa rõ</span>
                )}
              </p>
              {(() => {
                const spouseNames = [
                  ...(member.spouses || []).map((s: any) => s.fullName),
                  ...(member.husbandMarriages || []).map((m: any) => m.wife?.fullName),
                  ...(member.wifeMarriages || []).map((m: any) => m.husband?.fullName),
                ].filter(Boolean);
                const uniqueNames = Array.from(new Set(spouseNames));
                if (uniqueNames.length === 0) return null;
                return (
                  <p>
                    <strong>Hôn phối (Vợ / Chồng):</strong>{" "}
                    <span className="text-[#8B1E1E] font-semibold">
                      {uniqueNames.join(", ")}
                    </span>
                  </p>
                );
              })()}
            </div>
          </div>

          {/* Nơi cư trú & Mộ phần (Google Maps link) */}
          <div className="space-y-1.5">
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

          {/* Số điện thoại (Chỉ Admin xem, Khách bảo mật) */}
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
            <div className="space-y-1.5">
              <h4 className="font-bold text-stone-900 flex items-center space-x-1.5 border-b pb-1 font-serif">
                <FileText className="w-4 h-4 text-[#8B1E1E]" />
                <span>Tiểu Sử & Ghi Nhớ</span>
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
            className="w-full py-2 bg-[#FAF7EE] hover:bg-[#F4EEDC] text-[#8B1E1E] border border-[#C59B27] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
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
                className="flex-1 py-2 bg-[#8B1E1E] hover:bg-[#721515] text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
              <button
                type="button"
                onClick={() => onDelete(member.id, member.fullName)}
                className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 border border-stone-200 rounded-xl transition-colors cursor-pointer"
                title="Xóa hồ sơ này"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onProposeChange(member)}
              className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
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
