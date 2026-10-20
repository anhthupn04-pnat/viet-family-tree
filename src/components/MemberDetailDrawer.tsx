"use client";

import React from "react";
import {
  X,
  User,
  Heart,
  Calendar,
  Baby,
  Edit2,
  Trash2,
  Users,
  FileText,
} from "lucide-react";
import { Member } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";

interface MemberDetailDrawerProps {
  member: Member | null;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onAddChild: (parent: Member) => void;
  onAddSpouse: (spouse: Member) => void;
}

export default function MemberDetailDrawer({
  member,
  onClose,
  onEdit,
  onAddChild,
  onAddSpouse,
}: MemberDetailDrawerProps) {
  const { getMember, getChildren, getSpouse, deleteMember } = useFamilyStore();

  if (!member) return null;

  const isMale = member.gender === "male";
  const father = member.fatherId ? getMember(member.fatherId) : undefined;
  const mother = member.motherId ? getMember(member.motherId) : undefined;
  const spouse = member.spouseId ? getMember(member.spouseId) : undefined;
  const children = getChildren(member.id);

  const handleDelete = () => {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa thành viên "${member.fullName}" khỏi sơ đồ gia phả?`
      )
    ) {
      deleteMember(member.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
        {/* Drawer Header */}
        <div
          className={`p-6 text-white shrink-0 relative ${
            isMale ? "bg-blue-600" : "bg-rose-500"
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Square Avatar */}
            <div className="w-20 h-20 rounded-xl bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="inline-block bg-white/20 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-2xs mb-1">
                ĐỜI {member.generation}
              </span>
              <h2 className="text-xl font-extrabold text-white truncate">
                {member.fullName}
              </h2>
              {member.nickname && (
                <p className="text-xs text-white/90 italic font-medium mt-0.5">
                  &ldquo;{member.nickname}&rdquo;
                </p>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] mt-1 bg-white/10 px-2 py-0.5 rounded-full font-medium">
                {member.isAlive ? "Đang sống" : "Đã mất"}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons inside drawer */}
          <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onAddSpouse(member)}
              className="flex-1 py-1.5 px-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>+ Vợ/Chồng</span>
            </button>
            <button
              type="button"
              onClick={() => onAddChild(member)}
              className="flex-1 py-1.5 px-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Baby className="w-3.5 h-3.5" />
              <span>+ Thêm Con</span>
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {/* Thời gian sinh - tử */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Thời Gian Sinh & Mất</span>
            </h4>
            <p>
              <strong>Ngày sinh:</strong> {member.birthDate || "Chưa cập nhật"}
            </p>
            {!member.isAlive && (
              <p>
                <strong>Ngày mất:</strong> {member.deathDate || "Chưa cập nhật"}
              </p>
            )}
          </div>

          {/* Huyết thống & Quan hệ */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Huyết Thống & Hôn Phối</span>
            </h4>
            <p>
              <strong>Cha (Thân phụ):</strong>{" "}
              {father ? (
                <span className="font-bold text-blue-700">{father.fullName}</span>
              ) : (
                <span className="text-slate-400">Khởi tổ / Chưa cập nhật</span>
              )}
            </p>
            <p>
              <strong>Mẹ (Thân mẫu):</strong>{" "}
              {mother ? (
                <span className="font-bold text-rose-700">{mother.fullName}</span>
              ) : (
                <span className="text-slate-400">Chưa cập nhật</span>
              )}
            </p>
            <p>
              <strong>Vợ / Chồng:</strong>{" "}
              {spouse ? (
                <span className="font-bold text-slate-900">{spouse.fullName}</span>
              ) : (
                <span className="text-slate-400">Chưa có</span>
              )}
            </p>
          </div>

          {/* Danh sách con cái */}
          {children.length > 0 && (
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 flex items-center justify-between">
                <span>Con cái huyết thống ({children.length})</span>
                <span className="text-[10px] text-slate-400">
                  Thứ tự 1..{children.length}
                </span>
              </h4>
              <div className="space-y-1">
                {children.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-800">
                      {c.orderInFamily ? `Con thứ ${c.orderInFamily}: ` : ""}
                      {c.fullName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Đời {c.generation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ghi chú */}
          {member.notes && (
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Ghi Chú & Tiểu Sử</span>
              </h4>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {member.notes}
              </p>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              onClose();
              onEdit(member);
            }}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Chỉnh Sửa Hồ Sơ</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Xóa thành viên"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
