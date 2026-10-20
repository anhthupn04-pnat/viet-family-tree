"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  PlusCircle,
  Download,
  Phone,
  Compass,
} from "lucide-react";
import { getLocalMembers, mergeServerWithLocal } from "@/lib/treeStorage";

interface MemberListViewProps {
  onSelectMember: (member: any) => void;
  onEditMember: (member: any) => void;
  onDeleteMember: (id: string, name: string) => void;
  onOpenAddMember: () => void;
  onKinshipSearch: (memberId: string) => void;
  isAdmin: boolean;
  branches: any[];
  refreshKey?: number;
}

export default function MemberListView({
  onSelectMember,
  onEditMember,
  onDeleteMember,
  onOpenAddMember,
  onKinshipSearch,
  isAdmin,
  branches,
  refreshKey,
}: MemberListViewProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState("");
  const [branchId, setBranchId] = useState("ALL");
  const [generation, setGeneration] = useState("ALL");
  const [gender, setGender] = useState("ALL");
  const [isAlive, setIsAlive] = useState("ALL");

  // Tải tức thì từ localStorage khi khởi tạo component
  useEffect(() => {
    const local = getLocalMembers();
    if (local && local.length > 0) {
      setMembers(local);
      setLoading(false);
    }
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (branchId !== "ALL") params.set("branchId", branchId);
      if (generation !== "ALL") params.set("generation", generation);
      if (gender !== "ALL") params.set("gender", gender);
      if (isAlive !== "ALL") params.set("isAlive", isAlive);
      params.set("_t", String(Date.now()));

      const res = await fetch(`/api/members?${params.toString()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.members) {
        // Hợp nhất dữ liệu server với các chỉnh sửa và xóa đã lưu ở localStorage
        const merged = mergeServerWithLocal(data.members);
        let filtered = merged;
        if (query) {
          const q = query.toLowerCase();
          filtered = filtered.filter(
            (m) =>
              m.fullName?.toLowerCase().includes(q) ||
              m.courtesyName?.toLowerCase().includes(q)
          );
        }
        if (branchId !== "ALL") filtered = filtered.filter((m) => m.branchId === branchId);
        if (generation !== "ALL") filtered = filtered.filter((m) => m.generation === Number(generation));
        if (gender !== "ALL") filtered = filtered.filter((m) => m.gender === gender);
        if (isAlive !== "ALL") {
          const aliveBool = isAlive === "true";
          filtered = filtered.filter((m) => m.isAlive === aliveBool);
        }
        setMembers(filtered);
      }
    } catch (e) {
      console.error(e);
      const local = getLocalMembers();
      if (local && local.length > 0) {
        setMembers(local);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [branchId, generation, gender, isAlive, refreshKey]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top action & filter header */}
      <div className="bg-white rounded-2xl border border-[#E8DEC7] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold font-serif text-[#8B1E1E] flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#C59B27]" />
              <span>Danh Sách Hồ Sơ Thành Viên ({members.length})</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Tra cứu thông tin, thế thứ và chi họ của các thành viên trong gia tộc.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={onOpenAddMember}
              className="px-4 py-2 bg-[#8B1E1E] hover:bg-[#721515] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-1.5 whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span>Thêm thành viên mới</span>
            </button>
          )}
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
          {/* Search box */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo họ tên, quê quán..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
            />
          </form>

          {/* Branch filter */}
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
          >
            <option value="ALL">Tất cả chi họ</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.branchName}
              </option>
            ))}
          </select>

          {/* Generation filter */}
          <select
            value={generation}
            onChange={(e) => setGeneration(e.target.value)}
            className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
          >
            <option value="ALL">Tất cả các đời</option>
            <option value="1">Đời 1 (Khởi Tổ)</option>
            <option value="2">Đời 2</option>
            <option value="3">Đời 3</option>
            <option value="4">Đời 4</option>
            <option value="5">Đời 5</option>
          </select>

          {/* Alive filter */}
          <select
            value={isAlive}
            onChange={(e) => setIsAlive(e.target.value)}
            className="px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
          >
            <option value="ALL">Còn sống & Đã mất</option>
            <option value="true">Chỉ người còn sống</option>
            <option value="false">Bậc tiền nhân (đã mất)</option>
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white rounded-2xl border border-[#E8DEC7] shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-stone-400 text-xs">
            Đang tải dữ liệu hồ sơ...
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 text-stone-500 text-xs">
            Không tìm thấy thành viên nào phù hợp với điều kiện lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF7EE] border-b border-[#E8DEC7] text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Thành viên</th>
                  <th className="py-3 px-3">Mã số</th>
                  <th className="py-3 px-3">Đời</th>
                  <th className="py-3 px-3">Chi Họ</th>
                  <th className="py-3 px-3">Năm Sinh / Mất</th>
                  <th className="py-3 px-3">Cư Trú / An Táng</th>
                  <th className="py-3 px-3">Liên Hệ</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {members.map((m) => {
                  const isMale = m.gender === "MALE";
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-[#FAF7EE]/50 transition-colors group"
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isMale
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : "bg-pink-100 text-pink-700 border border-pink-200"
                            }`}
                          >
                            {m.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              <span className="font-serif font-bold text-stone-900 group-hover:text-[#8B1E1E] transition-colors">
                                {m.fullName}
                              </span>
                              {m.birthOrder && (
                                <span className="bg-amber-100 text-amber-800 text-[9px] font-semibold px-1.5 py-0.2 rounded border border-amber-200">
                                  {m.birthOrder}
                                </span>
                              )}
                              {m.isMartyr && (
                                <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-2xs">
                                  ⭐ Liệt Sĩ
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 italic">
                              {m.courtesyName || (isMale ? "Nam giới" : "Nữ giới")}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">
                        {m.memberCode}
                      </td>

                      {/* Generation */}
                      <td className="py-3 px-3">
                        <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                          Đời {m.generation}
                        </span>
                      </td>

                      {/* Branch */}
                      <td className="py-3 px-3 font-medium text-stone-700">
                        {m.branch?.branchName || "Chưa phân chi"}
                      </td>

                      {/* Birth/Death */}
                      <td className="py-3 px-3 text-stone-600">
                        <span>{m.birthSolar?.slice(0, 4) || "--"}</span> -{" "}
                        <span>
                          {m.isAlive ? "nay" : m.deathSolar?.slice(0, 4) || "--"}
                        </span>
                      </td>

                      {/* Residence */}
                      <td className="py-3 px-3 text-stone-500 max-w-[140px] truncate">
                        {m.currentResidence || m.hometown || "--"}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3 text-stone-600">
                        {isAdmin ? (
                          <span className="font-mono text-[11px]">
                            {m.phone || "--"}
                          </span>
                        ) : (
                          <span className="text-stone-400 italic text-[10px]">
                            Ẩn (Khách)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectMember(m)}
                            className="p-1.5 text-stone-500 hover:text-[#8B1E1E] hover:bg-stone-100 rounded-lg transition-colors"
                            title="Xem chi tiết hồ sơ"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onKinshipSearch(m.id)}
                            className="p-1.5 text-[#C59B27] hover:text-[#8B1E1E] hover:bg-amber-50 rounded-lg transition-colors"
                            title="Tra cứu xưng hô họ hàng"
                          >
                            <Compass className="w-4 h-4" />
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => onEditMember(m)}
                                className="p-1.5 text-stone-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Sửa hồ sơ"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteMember(m.id, m.fullName)}
                                className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa hồ sơ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
