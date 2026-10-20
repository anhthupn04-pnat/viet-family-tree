"use client";

import React, { useState } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  User,
  Heart,
  Plus,
  Info,
  Edit2,
  Flower2,
  Award,
  Sparkles,
  ChevronDown,
  UserPlus,
  Baby,
  Users2,
} from "lucide-react";
import { MemberNode } from "@/components/FamilyTreeCanvas";

interface FamilyNodeProps {
  data: {
    member: MemberNode;
    isAdmin: boolean;
    isFocused?: boolean;
    onSelectMember: (member: MemberNode) => void;
    onQuickAdd: (type: "child" | "spouse" | "parent", targetMember: MemberNode) => void;
    onEditMember: (member: MemberNode) => void;
  };
}

export default function FamilyNode({ data }: FamilyNodeProps) {
  const { member, isAdmin, isFocused, onSelectMember, onQuickAdd, onEditMember } = data;
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const isMale = (member.gender || "MALE").toUpperCase() === "MALE";
  const birthYear = member.birthSolar
    ? new Date(member.birthSolar).getFullYear()
    : member.birthLunar
    ? member.birthLunar.split("/")[2] || null
    : null;

  const deathYear = member.deathSolar
    ? new Date(member.deathSolar).getFullYear()
    : member.deathLunar
    ? member.deathLunar.split("/")[2] || null
    : null;

  const achievementsCount = (member as any).achievements?.length || 0;

  return (
    <div
      className={`relative group rounded-xl transition-all duration-200 select-none ${
        isFocused
          ? "ring-4 ring-[#C62828] shadow-2xl scale-105"
          : "hover:shadow-xl hover:-translate-y-1"
      }`}
      style={{ width: 220, minHeight: 140 }}
      onClick={() => onSelectMember(member)}
    >
      {/* Handles for connections */}
      {/* Top Handle for Parent-to-Child descent */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2.5 !h-2.5 !bg-[#8B1D1D] !border-2 !border-white shadow-sm"
      />

      {/* Bottom Handle for Parent to Children */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2.5 !h-2.5 !bg-[#8B1D1D] !border-2 !border-white shadow-sm"
      />

      {/* Left Handle for Spouse connection */}
      <Handle
        type="target"
        id="spouse-left"
        position={Position.Left}
        className="!w-2 !h-2 !bg-[#E11D48] !border-2 !border-white shadow-sm"
      />

      {/* Right Handle for Spouse connection */}
      <Handle
        type="source"
        id="spouse-right"
        position={Position.Right}
        className="!w-2 !h-2 !bg-[#E11D48] !border-2 !border-white shadow-sm"
      />

      {/* Card Body */}
      <div
        className={`w-full h-full rounded-xl p-3 border shadow-md flex flex-col justify-between transition-colors ${
          isMale
            ? "bg-gradient-to-b from-[#F0F7FF] via-white to-[#F8FAFC] border-[#BFDBFE]"
            : "bg-gradient-to-b from-[#FFF1F2] via-white to-[#FFF5F5] border-[#FECDD3]"
        }`}
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1">
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs ${
                isMale
                  ? "bg-[#1E40AF] text-white"
                  : "bg-[#9F1239] text-white"
              }`}
            >
              Đời {member.generation}
            </span>
            {member.birthOrder && (
              <span className="text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded truncate max-w-[85px]">
                {member.birthOrder}
              </span>
            )}
          </div>

          {/* Status Badge */}
          {member.isAlive ? (
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sống
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] font-medium text-amber-900 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
              <Flower2 className="w-2.5 h-2.5 text-amber-700" />
              Đã mất
            </span>
          )}
        </div>

        {/* Member Identity: Avatar + Names */}
        <div className="flex items-start gap-2.5 my-1">
          {/* Avatar Icon */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 shadow-xs overflow-hidden ${
              member.avatarUrl
                ? "border-amber-400 bg-amber-50"
                : isMale
                ? "bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] border-blue-200 text-white"
                : "bg-gradient-to-tr from-[#E11D48] to-[#FB7185] border-rose-200 text-white"
            }`}
          >
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>

          {/* Names Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-[13px] font-bold text-gray-900 truncate leading-snug font-serif tracking-tight group-hover:text-[#8B1D1D] transition-colors">
              {member.fullName}
            </h4>

            {/* Nickname / Tên thường gọi ở nhà in nghiêng */}
            {member.nickname ? (
              <p className="text-[11px] italic font-medium text-amber-700 truncate leading-tight mt-0.5">
                &ldquo;{member.nickname}&rdquo;
              </p>
            ) : member.courtesyName ? (
              <p className="text-[10px] text-gray-500 italic truncate leading-tight mt-0.5">
                {member.courtesyName}
              </p>
            ) : null}

            {/* Years / Life Span */}
            <p className="text-[10px] text-gray-500 mt-0.5">
              {birthYear || deathYear ? (
                <span>
                  {birthYear || "?"} &ndash; {member.isAlive ? "nay" : deathYear || "?"}
                </span>
              ) : (
                <span className="text-gray-400">Chưa rõ năm</span>
              )}
            </p>
          </div>
        </div>

        {/* Footer info: Death anniversary & achievements */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] text-gray-500">
          {!member.isAlive && ((member as any).deathLunarDay || member.deathLunar) ? (
            <span className="text-amber-800 font-medium truncate max-w-[130px]">
              Giỗ: {(member as any).deathLunarDay ? `${(member as any).deathLunarDay}/${(member as any).deathLunarMonth} ÂL` : member.deathLunar}
            </span>
          ) : member.branchName ? (
            <span className="text-blue-700 font-medium truncate max-w-[130px]">
              {member.branchName}
            </span>
          ) : (
            <span className="text-gray-400">Chi tộc chính</span>
          )}

          {achievementsCount > 0 && (
            <span className="flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-semibold text-[9px] border border-amber-200">
              <Award className="w-2.5 h-2.5 text-amber-600" />
              {achievementsCount}
            </span>
          )}
        </div>
      </div>

      {/* Floating Action Buttons Toolbar directly on Node */}
      <div
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-gray-200 shadow-md opacity-90 group-hover:opacity-100 group-hover:shadow-lg transition-all z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Quick Add Button with Dropdown Popup */}
        <div className="relative">
          <button
            type="button"
            title="Thao tác nhanh phả hệ"
            onClick={() => setShowQuickMenu(!showQuickMenu)}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-[#8B1D1D] to-[#B91C1C] hover:from-[#701515] hover:to-[#991B1B] shadow-xs cursor-pointer transition-transform active:scale-95"
          >
            <Plus className="w-3 h-3" />
            <span>Thêm</span>
            <ChevronDown className="w-2.5 h-2.5 opacity-80" />
          </button>

          {/* Quick Menu Popup */}
          {showQuickMenu && (
            <>
              {/* Backdrop closer */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowQuickMenu(false)}
              />
              <div className="absolute bottom-full left-0 mb-1.5 w-44 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-40 text-left animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  Thêm từ {member.fullName.split(" ").slice(-1)[0]}
                </div>
                
                {/* 1. Add Spouse */}
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onQuickAdd("spouse", member);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  + Thêm Vợ / Chồng
                </button>

                {/* 2. Add Child */}
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onQuickAdd("child", member);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-colors font-medium"
                >
                  <Baby className="w-3.5 h-3.5 text-blue-500" />
                  + Thêm Con (Đời {member.generation + 1})
                </button>

                {/* 3. Add Parent */}
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onQuickAdd("parent", member);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2 transition-colors font-medium"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-600" />
                  + Thêm Cha / Mẹ (Đời {Math.max(1, member.generation - 1)})
                </button>
              </div>
            </>
          )}
        </div>

        {/* Info button */}
        <button
          type="button"
          title="Xem chi tiết & thành tích"
          onClick={() => onSelectMember(member)}
          className="p-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Info className="w-3 h-3" />
        </button>

        {/* Edit button (Admin only) */}
        {isAdmin && (
          <button
            type="button"
            title="Chỉnh sửa hồ sơ"
            onClick={() => onEditMember(member)}
            className="p-1 rounded-full text-gray-500 hover:text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <Edit2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
