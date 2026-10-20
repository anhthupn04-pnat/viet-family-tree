"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Users,
  AlertTriangle,
  PlusCircle,
  Calendar,
  Layers,
  ArrowRight,
  Send,
  KeyRound,
  UserPlus,
  Trash2,
  Phone,
  MapPin,
  FileText,
  BadgeCheck,
  Search,
} from "lucide-react";
import { PendingSubmission, AdminUser } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";

interface AdminViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAddMember: () => void;
}

export default function AdminView({ onNavigateTab, onOpenAddMember }: AdminViewProps) {
  const {
    members,
    pendingSubmissions,
    events,
    adminUsers,
    currentAdmin,
    isSuperAdmin,
    approveSubmission,
    rejectSubmission,
    createAdminUser,
    getMember,
  } = useFamilyStore();

  const [activeTab, setActiveTab] = useState<"queue" | "stats" | "admins">("queue");
  const [queueFilter, setQueueFilter] = useState<"all" | "pending" | "approved" | "rejected">(
    "pending"
  );
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Sub-admin form state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<"admin" | "super_admin">("admin");
  const [adminFormMsg, setAdminFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Statistics calculation
  const totalMembers = members.length;
  const maleCount = members.filter((m) => m.gender === "male").length;
  const femaleCount = members.filter((m) => m.gender === "female").length;
  const malePercent = totalMembers ? Math.round((maleCount / totalMembers) * 100) : 0;
  const femalePercent = totalMembers ? 100 - malePercent : 0;
  const livingCount = members.filter((m) => m.isAlive).length;
  const deceasedCount = totalMembers - livingCount;

  // Generations breakdown
  const generationsMap: Record<number, number> = {};
  members.forEach((m) => {
    const g = m.generation || 1;
    generationsMap[g] = (generationsMap[g] || 0) + 1;
  });
  const maxGen = Math.max(...Object.keys(generationsMap).map(Number), 2);

  // Filtered queue
  const filteredQueue = pendingSubmissions.filter((s) => {
    if (queueFilter === "all") return true;
    return s.status === queueFilter;
  });

  const pendingCount = pendingSubmissions.filter((s) => s.status === "pending").length;

  const handleCreateSubAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormMsg(null);
    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminPassword.trim()) {
      setAdminFormMsg({ type: "error", text: "Vui lòng điền đầy đủ thông tin!" });
      return;
    }

    const res = createAdminUser({
      name: newAdminName.trim(),
      email: newAdminEmail.trim(),
      password: newAdminPassword.trim(),
      role: newAdminRole,
    });

    if (res.success) {
      setAdminFormMsg({ type: "success", text: res.message });
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setTimeout(() => {
        setShowAddAdminModal(false);
        setAdminFormMsg(null);
      }, 1500);
    } else {
      setAdminFormMsg({ type: "error", text: res.message });
    }
  };

  const handleApprove = (id: string) => {
    approveSubmission(id);
  };

  const handleRejectConfirm = (id: string) => {
    if (!rejectReason.trim()) {
      alert("Vui lòng nhập lý do từ chối để thông báo đến người đề xuất.");
      return;
    }
    rejectSubmission(id, rejectReason.trim());
    setRejectingId(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h2 className="text-xl font-bold text-slate-900">
              Trung Tâm Quản Trị & Kiểm Duyệt Tộc Phan
            </h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Xin chào, <strong>{currentAdmin?.name || "Quản trị viên"}</strong> (
            {currentAdmin?.role === "super_admin" ? "Super Admin" : "Ban Trị Sự"}). Bạn có toàn quyền
            thao tác trực tiếp và phê duyệt hồ sơ dòng họ.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("queue")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "queue"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hàng Đợi Xét Duyệt</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "stats"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dashboard Thống Kê</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("admins")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "admins"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Tài Khoản Admin ({adminUsers.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: HÀNG ĐỢI XÉT DUYỆT (APPROVAL QUEUE) */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-2">Lọc trạng thái:</span>
              <button
                type="button"
                onClick={() => setQueueFilter("pending")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  queueFilter === "pending"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Chờ duyệt ({pendingCount})
              </button>
              <button
                type="button"
                onClick={() => setQueueFilter("approved")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  queueFilter === "approved"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Đã duyệt (
                {pendingSubmissions.filter((s) => s.status === "approved").length})
              </button>
              <button
                type="button"
                onClick={() => setQueueFilter("rejected")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  queueFilter === "rejected"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Đã từ chối (
                {pendingSubmissions.filter((s) => s.status === "rejected").length})
              </button>
              <button
                type="button"
                onClick={() => setQueueFilter("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  queueFilter === "all"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Tất cả ({pendingSubmissions.length})
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Mẹo: Phê duyệt 1-click sẽ lập tức cập nhật cây phả hệ theo thời gian thực.
            </div>
          </div>

          {/* Submissions List */}
          {filteredQueue.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 text-base">
                Không có yêu cầu nào trong danh sách
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Tất cả các đề xuất từ thành viên và khách thăm quan đã được xử lý xong.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueue.map((item) => {
                const isPending = item.status === "pending";
                const isApproved = item.status === "approved";
                const isRejected = item.status === "rejected";

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                      isPending
                        ? "border-amber-300 ring-2 ring-amber-400/20"
                        : isApproved
                        ? "border-emerald-200 bg-emerald-50/20"
                        : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    {/* Header Item */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide ${
                            item.actionType === "CREATE"
                              ? "bg-blue-100 text-blue-800"
                              : item.actionType === "UPDATE"
                              ? "bg-amber-100 text-amber-900"
                              : item.actionType === "DELETE"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {item.actionType === "CREATE"
                            ? "Thêm Thành Viên Mới"
                            : item.actionType === "UPDATE"
                            ? "Chỉnh Sửa Hồ Sơ"
                            : item.actionType === "DELETE"
                            ? "Yêu Cầu Xóa"
                            : "Thêm Sự Kiện / Lễ Giỗ"}
                        </span>

                        <span className="text-xs text-slate-400 font-mono">
                          ID: {item.id} • {item.submittedAt}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Đang Chờ Duyệt</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã Chấp Thuận</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Đã Từ Chối</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Submitter Info */}
                    <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mb-3">
                      <div>
                        Người gửi đề xuất: <strong>{item.submitterName}</strong>
                      </div>
                      <div className="flex items-center gap-1 text-blue-700 font-mono font-medium">
                        <Phone className="w-3 h-3" />
                        <span>{item.submitterPhone}</span>
                      </div>
                    </div>

                    {/* Content Detail based on actionType */}
                    {item.actionType === "CREATE" && (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                        <h4 className="font-bold text-slate-900 text-sm text-blue-700">
                          {item.data?.fullName}
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                          <div>
                            Đời: <strong>{item.data?.generation}</strong>
                          </div>
                          <div>
                            Giới tính:{" "}
                            <strong>{item.data?.gender === "male" ? "Nam" : "Nữ"}</strong>
                          </div>
                          <div>
                            Ngày sinh: <strong>{item.data?.birthDate || "Chưa rõ"}</strong>
                          </div>
                          <div>
                            Thứ tự con: <strong>{item.data?.orderInFamily || "Chưa rõ"}</strong>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 pt-1">
                          <div>
                            SĐT: <strong>{item.data?.phone || "Chưa có"}</strong>
                          </div>
                          <div>
                            Địa chỉ: <strong>{item.data?.address || "Chưa có"}</strong>
                          </div>
                        </div>
                        {item.data?.notes && (
                          <p className="text-slate-500 italic pt-1">
                            Ghi chú: {item.data.notes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* UPDATE: Comparison Table (Old Data vs New Data) */}
                    {item.actionType === "UPDATE" && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span>
                            Đối chiếu thay đổi hồ sơ:{" "}
                            <strong className="text-blue-700">
                              {item.data?.fullName || item.oldData?.fullName}
                            </strong>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            (Bên trái: Dữ liệu cũ • Bên phải: Dữ liệu đề xuất mới)
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Old Data */}
                          <div className="p-3 bg-red-50/50 border border-red-200 rounded-xl space-y-1.5">
                            <span className="font-bold text-red-800 text-[11px] uppercase tracking-wider block border-b border-red-200 pb-1">
                              Dữ Liệu Hiện Tại (Cũ)
                            </span>
                            <p>
                              Họ tên: <strong>{item.oldData?.fullName || "Chưa có"}</strong>
                            </p>
                            <p>
                              SĐT: <strong>{item.oldData?.phone || "Chưa cập nhật"}</strong>
                            </p>
                            <p>
                              Địa chỉ:{" "}
                              <strong>{item.oldData?.address || "Chưa cập nhật"}</strong>
                            </p>
                            <p>
                              Tiểu sử:{" "}
                              <span className="text-slate-600">
                                {item.oldData?.notes || "Chưa có"}
                              </span>
                            </p>
                          </div>

                          {/* Proposed New Data */}
                          <div className="p-3 bg-emerald-50/60 border border-emerald-300 rounded-xl space-y-1.5">
                            <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider block border-b border-emerald-200 pb-1">
                              Dữ Liệu Đề Xuất (Mới)
                            </span>
                            <p>
                              Họ tên:{" "}
                              <strong className="text-emerald-900">
                                {item.data?.fullName || "Chưa có"}
                              </strong>
                            </p>
                            <p>
                              SĐT:{" "}
                              <strong className="text-emerald-900">
                                {item.data?.phone || "Chưa cập nhật"}
                              </strong>
                            </p>
                            <p>
                              Địa chỉ:{" "}
                              <strong className="text-emerald-900">
                                {item.data?.address || "Chưa cập nhật"}
                              </strong>
                            </p>
                            <p>
                              Tiểu sử:{" "}
                              <span className="text-emerald-900 font-medium">
                                {item.data?.notes || "Chưa có"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* DELETE */}
                    {item.actionType === "DELETE" && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1.5">
                        <div className="font-bold text-rose-900">
                          Đề xuất xóa thành viên: {item.data?.fullName} (Đời {item.data?.generation})
                        </div>
                        <p className="text-slate-700">
                          <strong>Lý do yêu cầu xóa:</strong> {item.data?.reason}
                        </p>
                      </div>
                    )}

                    {/* ADD_EVENT */}
                    {item.actionType === "ADD_EVENT" && (
                      <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1.5">
                        <h4 className="font-bold text-purple-900 text-sm">{item.data?.title}</h4>
                        <div className="flex gap-4 text-slate-700">
                          <span>
                            Âm lịch: <strong>{item.data?.lunarDate}</strong>
                          </span>
                          <span>
                            Dương lịch: <strong>{item.data?.solarDate}</strong>
                          </span>
                          <span>
                            Địa điểm: <strong>{item.data?.location || "Chưa rõ"}</strong>
                          </span>
                        </div>
                        {item.data?.description && (
                          <p className="text-slate-600">{item.data.description}</p>
                        )}
                      </div>
                    )}

                    {/* Rejection reason (if rejected) */}
                    {isRejected && item.rejectionReason && (
                      <div className="mt-2.5 p-2.5 bg-rose-100/70 border border-rose-300 rounded-lg text-xs text-rose-900">
                        <strong>Lý do từ chối:</strong> {item.rejectionReason}
                      </div>
                    )}

                    {/* Action Buttons (1-click Approve or Reject) */}
                    {isPending && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                        {rejectingId === item.id ? (
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              placeholder="Nhập lý do từ chối..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-rose-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRejectConfirm(item.id)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                            >
                              Xác nhận từ chối
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason("");
                              }}
                              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setRejectingId(item.id)}
                              className="px-3.5 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Từ chối</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleApprove(item.id)}
                              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Chấp thuận (1-Click)</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DASHBOARD THỐNG KÊ (STATS) */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Tổng Nhân Khẩu</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{totalMembers}</div>
              <p className="text-[11px] text-slate-400 mt-1">
                {livingCount} người đang sống • {deceasedCount} tiền nhân
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Tỷ Lệ Giới Tính</span>
                <span className="text-xs font-bold text-blue-700 font-mono">
                  {malePercent}% / {femalePercent}%
                </span>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600">{maleCount} Nam</span>
                <span className="text-slate-300">/</span>
                <span className="text-rose-500">{femaleCount} Nữ</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-rose-200 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${malePercent}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Quy Mô Thế Hệ</span>
                <Layers className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{maxGen} Đời</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Phân nhánh liên tục từ Cụ Khởi Tổ
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Hàng Đợi Duyệt</span>
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-3xl font-extrabold text-amber-600">{pendingCount}</div>
              <p className="text-[11px] text-slate-400 mt-1">Yêu cầu đang chờ xét duyệt</p>
            </div>
          </div>

          {/* Detailed Generations Breakdown Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Phân Bố Nhân Khẩu Theo Từng Thế Hệ (Đời Thứ)</span>
            </h3>

            <div className="space-y-3">
              {Array.from({ length: maxGen }, (_, i) => i + 1).map((gen) => {
                const count = generationsMap[gen] || 0;
                const percent = totalMembers ? Math.round((count / totalMembers) * 100) : 0;
                const genMembers = members.filter((m) => m.generation === gen);

                return (
                  <div key={gen} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">
                        ĐỜI THỨ {gen}{" "}
                        {gen === 1 ? "(Cụ Khởi Tổ & Hôn Phối)" : gen === 2 ? "(9 Người Con)" : ""}
                      </span>
                      <span className="font-mono text-slate-600 font-semibold">
                        {count} thành viên ({percent}%)
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {genMembers.map((m) => (
                        <span
                          key={m.id}
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${
                            m.gender === "male"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {m.fullName}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUẢN LÝ TÀI KHOẢN ADMIN (/admin/users) */}
      {activeTab === "admins" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>Danh Sách Quản Trị Viên Dòng Họ</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các tài khoản có thẩm quyền phê duyệt hồ sơ và can thiệp trực tiếp vào dữ liệu gia phả.
              </p>
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setShowAddAdminModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Thêm Admin Phụ</span>
              </button>
            )}
          </div>

          {/* Admin Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Email đăng nhập</th>
                  <th className="py-2.5 px-3">Vai trò</th>
                  <th className="py-2.5 px-3">Ngày tạo</th>
                  <th className="py-2.5 px-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminUsers.map((u) => {
                  const isSuper = u.role === "super_admin";
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isSuper
                              ? "bg-purple-100 text-purple-800 border border-purple-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {isSuper ? "Super Admin" : "Ban Trị Sự"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">{u.createdAt}</td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          <span>Đang hoạt động</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Thêm Admin Phụ */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Thêm Tài Khoản Quản Trị Viên Phụ</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAdminModal(false)}
                className="text-white/80 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubAdmin} className="p-5 space-y-3.5 text-xs">
              {adminFormMsg && (
                <div
                  className={`p-2.5 rounded-lg border text-xs font-semibold ${
                    adminFormMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {adminFormMsg.text}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên thành viên Ban Trị Sự *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phan Quốc Tuấn"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Email đăng nhập *
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin.tuan@tophan.vn"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mật khẩu khởi tạo *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ít nhất 6 ký tự"
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vai trò quản trị
                </label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as "admin" | "super_admin")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Ban Trị Sự (Admin duyệt & sửa trực tiếp)</option>
                  <option value="super_admin">Super Admin (Tổng quản trị)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Tạo Tài Khoản</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
