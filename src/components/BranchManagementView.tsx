"use client";

import React, { useState, useEffect } from "react";
import {
  Sliders,
  PlusCircle,
  Users,
  MapPin,
  UserCheck,
  Edit3,
  Trash2,
  ShieldAlert,
  Sparkles,
  CheckCircle,
} from "lucide-react";

interface Branch {
  id: string;
  branchName: string;
  branchOrder: number;
  leaderName?: string | null;
  description?: string | null;
  residenceArea?: string | null;
  _count?: { members: number };
}

interface BranchManagementViewProps {
  isAdmin: boolean;
  onSelectBranchForTree?: (branchId: string) => void;
}

export default function BranchManagementView({
  isAdmin,
  onSelectBranchForTree,
}: BranchManagementViewProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form states
  const [branchName, setBranchName] = useState("");
  const [branchOrder, setBranchOrder] = useState<number>(5);
  const [leaderName, setLeaderName] = useState("");
  const [residenceArea, setResidenceArea] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/branches");
      const data = await res.json();
      if (data.branches) {
        setBranches(data.branches);
        setBranchOrder(data.branches.length + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setBranchName(`Chi ${branches.length + 1} - Chi Nhánh Mới`);
    setBranchOrder(branches.length + 1);
    setLeaderName("");
    setResidenceArea("");
    setDescription("");
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setBranchName(branch.branchName);
    setBranchOrder(branch.branchOrder);
    setLeaderName(branch.leaderName || "");
    setResidenceArea(branch.residenceArea || "");
    setDescription(branch.description || "");
    setErrorMsg(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) {
      setErrorMsg("Vui lòng nhập tên chi họ.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const url = "/api/branches";
      const method = editingBranch ? "PUT" : "POST";
      const payload = {
        id: editingBranch ? editingBranch.id : undefined,
        branchName,
        branchOrder,
        leaderName,
        residenceArea,
        description,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu thông tin chi họ.");
      }

      setShowModal(false);
      fetchBranches();
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa chi họ "${name}"?`)) return;

    try {
      const res = await fetch(`/api/branches?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể xóa.");
      fetchBranches();
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa chi họ.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#8B1E1E] to-[#601313] rounded-2xl p-6 text-white shadow-traditional flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Phân Quản Tộc Phả & Chi Nhánh</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-amber-100">
            Quản Lý Các Chi Họ & Ngành Nhánh
          </h2>
          <p className="text-amber-100/80 text-xs md:text-sm mt-1 max-w-2xl">
            Ngay từ đầu hệ thống thiết lập 1-4 chi họ mẫu ban đầu theo truyền thống dòng họ.
            {isAdmin
              ? " Tài khoản Quản trị (Admin) có quyền thêm mới các chi họ, phân bổ địa bàn và chỉnh sửa thông tin."
              : " Chế độ Khách cho phép xem chi tiết quy mô thành viên và phân bổ các chi nhánh."}
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-[#C59B27] hover:bg-[#B0881F] text-[#24150B] font-bold rounded-xl text-xs md:text-sm shadow-md transition-all flex items-center space-x-2 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo thêm chi họ mới</span>
          </button>
        )}
      </div>

      {/* Notice info */}
      <div className="bg-[#FAF7EE] border border-[#E8DEC7] rounded-xl p-4 flex items-center justify-between text-xs text-stone-700">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#C59B27]" />
          <span>
            Hệ thống đang lưu trữ <strong>{branches.length}</strong> chi họ thuộc dòng tộc.
            {branches.length === 4 && (
              <span className="text-[#8B1E1E] font-medium ml-1">
                (Đang hiển thị 4 chi họ mẫu ban đầu: Chi 1 Trưởng Chi, Chi 2 Chi Giáp, Chi 3 Chi Ất, Chi 4 Chi Bính).
              </span>
            )}
          </span>
        </div>
        <span className="bg-[#8B1E1E]/10 text-[#8B1E1E] font-semibold px-2.5 py-1 rounded-full text-[11px]">
          {isAdmin ? "Chế độ Toàn Quyền Admin" : "Chế độ Khách Thăm Quan"}
        </span>
      </div>

      {/* Branches Grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-500 text-sm">
          Đang tải danh sách các chi họ...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {branches.map((b, idx) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-[#E8DEC7] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Badge order */}
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-[#FAF7EE] text-[#8B1E1E] font-bold text-xs px-2.5 py-1 rounded-full border border-[#E8DEC7]">
                    Thứ tự #{b.branchOrder}
                  </span>
                  <span className="text-xs text-stone-500 flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span className="font-semibold text-stone-800">
                      {b._count?.members || 0}
                    </span>{" "}
                    thành viên
                  </span>
                </div>

                {/* Branch Name */}
                <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-[#8B1E1E] transition-colors">
                  {b.branchName}
                </h3>

                {/* Leader */}
                <div className="mt-3 flex items-center space-x-2 text-xs text-stone-700">
                  <UserCheck className="w-4 h-4 text-[#C59B27] shrink-0" />
                  <span>
                    Trưởng chi:{" "}
                    <strong className="text-stone-900">
                      {b.leaderName || "Chưa bổ nhiệm"}
                    </strong>
                  </span>
                </div>

                {/* Residence Area */}
                <div className="mt-2 flex items-center space-x-2 text-xs text-stone-600">
                  <MapPin className="w-4 h-4 text-stone-400 shrink-0" />
                  <span className="line-clamp-1">
                    {b.residenceArea || "Địa bàn chung"}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs text-stone-500 line-clamp-3 leading-relaxed">
                  {b.description || "Chưa có mô tả chi tiết cho chi họ này."}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                {onSelectBranchForTree && (
                  <button
                    type="button"
                    onClick={() => onSelectBranchForTree(b.id)}
                    className="text-xs font-semibold text-[#8B1E1E] hover:underline flex items-center space-x-1"
                  >
                    <span>Xem trên cây</span>
                    <span>→</span>
                  </button>
                )}

                {isAdmin && (
                  <div className="flex items-center space-x-1 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-stone-500 hover:text-[#8B1E1E] hover:bg-stone-100 rounded-lg transition-colors"
                      title="Chỉnh sửa chi họ"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(b.id, b.branchName)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa chi họ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm / Sửa Chi Họ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-[#C59B27]/40 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#FAF7EE] to-white border-b border-[#EFE8D8] flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#8B1E1E] flex items-center space-x-2">
                <Sliders className="w-5 h-5 text-[#C59B27]" />
                <span>
                  {editingBranch ? "Chỉnh Sửa Chi Họ" : "Tạo Mới Chi Họ / Nhánh"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tên Chi Họ / Nhánh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Ví dụ: Chi 5 - Chi Đinh, Chi Miền Nam..."
                  className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Thứ Tự Chi
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={branchOrder}
                    onChange={(e) => setBranchOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Trưởng Chi Họ
                  </label>
                  <input
                    type="text"
                    value={leaderName}
                    onChange={(e) => setLeaderName(e.target.value)}
                    placeholder="Ví dụ: Ông Phan Văn..."
                    className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Địa Bàn Sinh Sống Chủ Yếu
                </label>
                <input
                  type="text"
                  value={residenceArea}
                  onChange={(e) => setResidenceArea(e.target.value)}
                  placeholder="Ví dụ: Thanh Hóa, Hà Nội, TP.HCM..."
                  className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mô Tả & Lịch Sử Hình Thành Nhánh
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập nguồn gốc, đặc điểm hoặc truyền thống chi họ..."
                  className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#8B1E1E] hover:bg-[#721515] text-white text-xs font-semibold rounded-lg shadow-md transition-all"
                >
                  {submitting ? "Đang lưu..." : editingBranch ? "Cập nhật" : "Tạo chi họ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
