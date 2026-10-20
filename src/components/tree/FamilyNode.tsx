"use client";

import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  User,
  Heart,
  Plus,
  Edit2,
  Info,
  ChevronDown,
  UserPlus,
  Baby,
} from "lucide-react";
import { Member } from "@/types/family";

interface FamilyNodeProps {
  data: {
    member: Member;
    onSelectMember: (member: Member) => void;
    onQuickAddChild: (parent: Member) => void;
    onQuickAddSpouse: (spouse: Member) => void;
    onEditMember: (member: Member) => void;
    isFocused?: boolean;
  };
}

export default function FamilyNode({ data }: FamilyNodeProps) {
  const {
    member,
    onSelectMember,
    onQuickAddChild,
    onQuickAddSpouse,
    onEditMember,
    isFocused,
  } = data;
  const [showMenu, setShowMenu] = useState(false);

  const isMale = member.gender === "male";
  const borderColor = isMale ? "border-blue-600" : "border-rose-500";
  const badgeBg = isMale ? "bg-blue-600 text-white" : "bg-rose-500 text-white";
  const avatarBg = isMale
    ? "bg-blue-50 text-blue-600 border-blue-200"
    : "bg-rose-50 text-rose-600 border-rose-200";

  return (
    <div
      className={`relative group bg-white rounded-xl shadow-sm transition-all duration-200 select-none ${
        isFocused ? "ring-4 ring-amber-500 scale-105 shadow-xl" : "hover:shadow-md"
      }`}
      style={{ width: 170, minHeight: 230 }}
      onClick={() => onSelectMember(member)}
    >
      {/* Top Handle for Parent-to-Child orthogonal line */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-slate-700 !border-2 !border-white shadow-xs"
      />

      {/* Bottom Handle for Children descent */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-slate-700 !border-2 !border-white shadow-xs"
      />

      {/* Left/Right handles for couple connections */}
      <Handle
        type="target"
        id="spouse-left"
        position={Position.Left}
        className="!w-2 !h-2 !bg-rose-400 !border !border-white"
      />
      <Handle
        type="source"
        id="spouse-right"
        position={Position.Right}
        className="!w-2 !h-2 !bg-rose-400 !border !border-white"
      />

      {/* Main Card Body */}
      <div
        className={`w-full h-full rounded-xl border-2 ${borderColor} p-3 flex flex-col items-center justify-between text-center`}
      >
        {/* Square Avatar */}
        <div
          className={`w-20 h-20 rounded-lg border flex items-center justify-center overflow-hidden shrink-0 shadow-2xs mt-1 ${avatarBg}`}
        >
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 opacity-80" />
          )}
        </div>

        {/* 3 Information Lines */}
        <div className="w-full my-2 space-y-1">
          {/* Dòng 1: Nhãn thế hệ: ĐỜI 1, ĐỜI 2... */}
          <div className="flex items-center justify-center">
            <span
              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-2xs ${badgeBg}`}
            >
              ĐỜI {member.generation}
            </span>
          </div>

          {/* Dòng 2: HỌ VÀ TÊN (in hoa đậm) */}
          <h4
            className="text-[13px] font-extrabold text-slate-900 uppercase tracking-tight truncate leading-tight pt-0.5"
            title={member.fullName}
          >
            {member.fullName}
          </h4>

          {/* Biệt danh / Tên thường gọi (nếu có) */}
          {member.nickname && (
            <p className="text-[11px] text-amber-700 italic truncate font-medium">
              ({member.nickname})
            </p>
          )}

          {/* Dòng 3: NS: dd/mm/yyyy (và ngày mất nếu đã khuất) */}
          <div className="text-[10px] text-slate-500 font-medium truncate pt-0.5">
            <span>
              NS: {member.birthDate || "---"}
            </span>
            {!member.isAlive && (
              <span className="block text-slate-600">
                Mất: {member.deathDate || "---"}
              </span>
            )}
          </div>
        </div>

        {/* Quick Action Toolbar on Node */}
        <div
          className="w-full pt-1.5 border-t border-slate-100 flex items-center justify-center gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Quick Menu Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              title="Thao tác nhanh"
            >
              <Plus className="w-3 h-3 text-blue-600" />
              <span>Thêm</span>
              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
            </button>

            {/* Menu Popup */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-44 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-40 text-left text-xs">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    Thêm quan hệ
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onQuickAddSpouse(member);
                    }}
                    className="w-full px-2.5 py-1.5 text-rose-700 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    + Thêm Vợ/Chồng
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onQuickAddChild(member);
                    }}
                    className="w-full px-2.5 py-1.5 text-blue-700 hover:bg-blue-50 flex items-center gap-2 font-medium"
                  >
                    <Baby className="w-3.5 h-3.5 text-blue-500" />
                    + Thêm Con (Đời {member.generation + 1})
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Edit button */}
          <button
            type="button"
            onClick={() => onEditMember(member)}
            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            title="Chỉnh sửa thông tin"
          >
            <Edit2 className="w-3 h-3" />
          </button>

          {/* Info button */}
          <button
            type="button"
            onClick={() => onSelectMember(member)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Xem hồ sơ chi tiết"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
