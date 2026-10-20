"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  PlusCircle,
  Filter,
  Edit2,
  Trash2,
  Baby,
  User,
  Users,
} from "lucide-react";
import { Member } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";

interface MemberListViewProps {
  onSelectMember: (m: Member) => void;
  onEditMember: (m: Member) => void;
  onAddChild: (parent: Member) => void;
  onOpenAddMember: () => void;
}

export default function MemberListView({
  onSelectMember,
  onEditMember,
  onAddChild,
  onOpenAddMember,
}: MemberListViewProps) {
  const { members, getMember, deleteMember } = useFamilyStore();

  const [search, setSearch] = useState("");
  const [selectedGen, setSelectedGen] = useState<string>("ALL");
  const [selectedGender, setSelectedGender] = useState<string>("ALL");

  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        if (selectedGen !== "ALL" && m.generation !== Number(selectedGen)) {
          return false;
        }
        if (selectedGender !== "ALL" && m.gender !== selectedGender) {
          return false;
        }
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = m.fullName.toLowerCase().includes(q);
          const matchNick = m.nickname?.toLowerCase().includes(q);
          return matchName || matchNick;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.generation !== b.generation) return a.generation - b.generation;
        return (a.orderInFamily || 99) - (b.orderInFamily || 99);
      });
  }, [members, search, selectedGen, selectedGender]);

  const maxGen = Math.max(...members.map((m) => m.generation || 1), 2);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên hoặc biệt danh..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Generation filter */}
          <select
            value={selectedGen}
            onChange={(e) => setSelectedGen(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tất cả thế hệ</option>
            {Array.from({ length: maxGen }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>
                Đời thứ {g}
              </option>
            ))}
          </select>

          {/* Gender filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl bg-slate-50 text-slate-700 focus:outline-none"
          >
            <option value="ALL">Tất cả giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
          </select>

          {/* Add member button */}
          <button
            type="button"
            onClick={onOpenAddMember}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Thành Viên</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-3 w-12 text-center">STT</th>
              <th className="py-3 px-4">Họ và Tên</th>
              <th className="py-3 px-3">Giới tính</th>
              <th className="py-3 px-3">Thế hệ</th>
              <th className="py-3 px-3">Thứ tự con</th>
              <th className="py-3 px-4">Sinh - Mất</th>
              <th className="py-3 px-4">Cha / Mẹ</th>
              <th className="py-3 px-4">Vợ / Chồng</th>
              <th className="py-3 px-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400">
                  Không tìm thấy thành viên phù hợp.
                </td>
              </tr>
            ) : (
              filteredMembers.map((m, index) => {
                const father = m.fatherId ? getMember(m.fatherId) : null;
                const mother = m.motherId ? getMember(m.motherId) : null;
                const spouse = m.spouseId ? getMember(m.spouseId) : null;
                const isMale = m.gender === "male";

                return (
                  <tr
                    key={m.id}
                    onClick={() => onSelectMember(m)}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">
                      {index + 1}
                    </td>

                    {/* Họ và tên & Biệt danh */}
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {m.fullName}
                      </div>
                      {m.nickname && (
                        <div className="text-[11px] text-amber-700 italic">
                          ({m.nickname})
                        </div>
                      )}
                    </td>

                    {/* Giới tính */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isMale
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {isMale ? "Nam" : "Nữ"}
                      </span>
                    </td>

                    {/* Đời thứ */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800">
                        Đời {m.generation}
                      </span>
                    </td>

                    {/* Thứ tự con */}
                    <td className="py-3 px-3">
                      {m.orderInFamily ? (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                          Thứ {m.orderInFamily}
                        </span>
                      ) : (
                        <span className="text-slate-400">---</span>
                      )}
                    </td>

                    {/* Sinh - Mất */}
                    <td className="py-3 px-4 text-slate-600">
                      <div>NS: {m.birthDate || "---"}</div>
                      {!m.isAlive && (
                        <div className="text-[11px] text-slate-400">
                          Mất: {m.deathDate || "---"}
                        </div>
                      )}
                    </td>

                    {/* Cha / Mẹ */}
                    <td className="py-3 px-4 text-slate-600">
                      {father || mother ? (
                        <div>
                          {father && <div>Cha: {father.fullName}</div>}
                          {mother && <div>Mẹ: {mother.fullName}</div>}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Tiên tổ</span>
                      )}
                    </td>

                    {/* Vợ / Chồng */}
                    <td className="py-3 px-4 text-slate-600">
                      {spouse ? (
                        <span className="font-medium text-slate-800">
                          {spouse.fullName}
                        </span>
                      ) : (
                        <span className="text-slate-400">---</span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td
                      className="py-3 px-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onAddChild(m)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Thêm con"
                        >
                          <Baby className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditMember(m)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                `Bạn có chắc muốn xóa "${m.fullName}"?`
                              )
                            ) {
                              deleteMember(m.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
