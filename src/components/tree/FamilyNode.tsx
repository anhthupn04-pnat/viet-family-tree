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
  ChevronDown,
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
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const isMale = (member.gender || "male").toLowerCase() === "male";

  // Calculate years
  const getYear = (str?: string) => {
    if (!str) return null;
    const match = str.match(/\b(19\d{2}|20\d{2})\b/);
    if (match) return match[1];
    return str.split("/").slice(-1)[0];
  };

  const birthYear = getYear(member.birthDate);
  const deathYear = getYear(member.deathDate);

  let yearsStr = "Chưa rõ năm";
  if (birthYear || deathYear) {
    yearsStr = `${birthYear || "?"} – ${member.isAlive ? "nay" : deathYear || "?"}`;
  }

  // Calculate role/courtesy badge (e.g. Khởi tổ, Cụ Bà Chính..., Con thứ 2, Dâu thứ 2, etc.)
  let roleBadge = "";
  if (member.generation === 1) {
    roleBadge = isMale ? "Khởi tổ" : "Cụ Bà Chính...";
  } else if (member.generation === 3) {
    if (member.orderInFamily === 1 && isMale) {
      roleBadge = "Con trai cả...";
    } else if (member.orderInFamily === 2 && !isMale) {
      roleBadge = "Con gái thứ...";
    } else if (member.orderInFamily) {
      roleBadge = isMale ? `Con trai thứ ${member.orderInFamily}` : `Con gái thứ ${member.orderInFamily}`;
    }
  } else if (member.orderInFamily) {
    const hasParentsInClan = Boolean(member.fatherId || member.motherId);
    if (isMale) {
      roleBadge = hasParentsInClan
        ? `Con thứ ${member.orderInFamily}`
        : `Rể thứ ${member.orderInFamily}`;
    } else {
      roleBadge = hasParentsInClan
        ? `Con gái thứ ${member.orderInFamily}`
        : `Dâu thứ ${member.orderInFamily}`;
    }
  } else if (member.spouseId) {
    const hasParentsInClan = Boolean(member.fatherId || member.motherId);
    if (!hasParentsInClan) {
      roleBadge = isMale ? "Rể" : "Dâu";
    } else {
      roleBadge = isMale ? "Con trai" : "Con gái";
    }
  } else if (member.nickname) {
    roleBadge = member.nickname;
  }

  // Subtitle / Courtesy text
  let subtitle = member.notes ? member.notes.split(".")[0] : member.nickname || "";
  if (member.generation === 1) {
    subtitle = isMale ? "Cụ Khởi Tổ (Hiệu Phúc Thiện)" : "Cụ Bà Chính Thất (Hiệu Từ T...)";
  }

  // Footer text
  let footerText = "Chi tộc chính";
  if (member.address) {
    footerText = member.address;
  } else if (!member.isAlive && member.deathDate) {
    footerText = `Giỗ: ${member.deathDate}`;
  } else if (member.phone) {
    footerText = `SĐT: ${member.phone}`;
  }

  return (
    <div
      className={`relative group rounded-xl transition-all duration-200 select-none ${
        isFocused
          ? "ring-4 ring-[#C62828] shadow-2xl scale-105"
          : "hover:shadow-xl hover:-translate-y-1"
      }`}
      style={{ width: 220, minHeight: 140 }}
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
                isMale ? "bg-[#1E40AF] text-white" : "bg-[#9F1239] text-white"
              }`}
            >
              Đời {member.generation}
            </span>
            {roleBadge && (
              <span className="text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded truncate max-w-[85px]">
                {roleBadge}
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

            {subtitle && (
              <p className="text-[10px] text-gray-500 italic truncate leading-tight mt-0.5">
                {subtitle}
              </p>
            )}

            <p className="text-[10px] text-gray-500 mt-0.5 font-sans">
              {yearsStr}
            </p>
          </div>
        </div>

        {/* Footer info: Death anniversary or branch/notes */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px] text-gray-500">
          <span
            className={
              !member.isAlive
                ? "text-amber-800 font-medium truncate max-w-[190px]"
                : "text-blue-700 font-medium truncate max-w-[190px]"
            }
          >
            {footerText}
          </span>
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
            className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r from-[#8B1D1D] to-[#B91C1C] hover:from-[#701515] hover:to-[#991B1B] shadow-xs cursor-pointer transition-transform active:scale-95"
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
                  Thao tác nhanh
                </div>

                {/* 1. Add Spouse */}
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onQuickAddSpouse(member);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 transition-colors font-medium cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  + Thêm Vợ / Chồng
                </button>

                {/* 2. Add Child */}
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickMenu(false);
                    onQuickAddChild(member);
                  }}
                  className="w-full px-2.5 py-1.5 text-xs text-blue-700 hover:bg-blue-50 flex items-center gap-2 transition-colors font-medium cursor-pointer"
                >
                  <Baby className="w-3.5 h-3.5 text-blue-500" />
                  + Thêm Con (Đời {member.generation + 1})
                </button>
              </div>
            </>
          )}
        </div>

        {/* Info button */}
        <button
          type="button"
          title="Xem chi tiết hồ sơ"
          onClick={() => onSelectMember(member)}
          className="p-1 rounded-full text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
        >
          <Info className="w-3 h-3" />
        </button>

        {/* Edit button */}
        <button
          type="button"
          title="Chỉnh sửa hồ sơ"
          onClick={() => onEditMember(member)}
          className="p-1 rounded-full text-gray-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
        >
          <Edit2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
