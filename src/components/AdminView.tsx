"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Sliders,
  Users,
  DollarSign,
  BookOpen,
  FileText,
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  Eye,
  Database,
  ArrowRight,
} from "lucide-react";

interface AdminViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenCreateBranch: () => void;
  onOpenAddMember: () => void;
  onMemberApproved?: () => void;
}

interface ChangeRequest {
  id: string;
  memberId?: string | null;
  requesterName: string;
  requesterEmail?: string | null;
  changeType: string;
  proposedData: string;
  reason: string;
  evidenceSource: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewerNote?: string | null;
  createdAt: string;
}

interface AuditLog {
  id: string;
  userName: string;
  userEmail?: string | null;
  action: string;
  target?: string | null;
  details?: string | null;
  createdAt: string;
}

export default function AdminView({
  onNavigateTab,
  onOpenCreateBranch,
  onOpenAddMember,
  onMemberApproved,
}: AdminViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"pendingMembers" | "requests" | "audit" | "overview">("pendingMembers");
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingMembers = async () => {
    try {
      setLoadingMembers(true);
      const res = await fetch(`/api/members?status=pending&_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.members) {
        setPendingMembers(data.members);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await fetch(`/api/change-requests?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await fetch(`/api/audit-logs?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.logs) {
        setAuditLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchPendingMembers();
    fetchRequests();
    fetchAuditLogs();
  }, []);

  const handleMemberApproval = async (id: string, action: "APPROVE" | "REJECT") => {
    try {
      setProcessingId(id);
      const res = await fetch("/api/members", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) {
        fetchPendingMembers();
        fetchAuditLogs();
        onMemberApproved?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      setProcessingId(id);
      const note = reviewNote[id] || "";
      const res = await fetch("/api/change-requests", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, reviewerNote: note }),
      });
      if (res.ok) {
        fetchRequests();
        fetchAuditLogs();
        onMemberApproved?.();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "PENDING");

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner Admin Identity */}
      <div className="bg-gradient-to-r from-[#8B1E1E] via-[#6F1414] to-[#4A0E0E] text-white p-6 rounded-3xl shadow-xl border border-[#C59B27]/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-[#C59B27] text-[#24150b] font-bold px-2 py-0.5 rounded">
                  TỔNG QUẢN TRỊ
                </span>
                <span className="text-xs text-amber-200/80 font-mono">
                  anhthuphan0102@gmail.com
                </span>
              </div>
              <h1 className="text-2xl font-bold font-serif text-amber-100 mt-1">
                Bảng Điều Khiển Quản Trị Hệ Thống
              </h1>
              <p className="text-xs text-amber-100/70 mt-0.5">
                Quản lý các nhánh dòng họ (1-4 chi mẫu khởi tạo), phê duyệt thành viên mới & thẩm định đề xuất phả hệ.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenCreateBranch}
              className="px-3.5 py-2 bg-[#C59B27] hover:bg-[#B0881F] text-[#24150B] font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Nhánh Mới</span>
            </button>
            <button
              type="button"
              onClick={onOpenAddMember}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all flex items-center space-x-1.5"
            >
              <Users className="w-4 h-4 text-amber-300" />
              <span>Thêm Thành Viên</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E5DAC6] pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("pendingMembers")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === "pendingMembers"
              ? "bg-[#1E5F52] text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100"
          }`}
        >
          <UserCheck className="w-4 h-4 text-[#FADB7F]" />
          <span>Thành Viên Mới Chờ Duyệt ({pendingMembers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("requests")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === "requests"
              ? "bg-[#8B1E1E] text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Đề Xuất Chỉnh Sửa ({pendingRequests.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("audit")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === "audit"
              ? "bg-[#8B1E1E] text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Nhật Ký Hoạt Động ({auditLogs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("overview")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeSubTab === "overview"
              ? "bg-[#8B1E1E] text-white shadow-sm"
              : "bg-white text-stone-600 hover:bg-stone-100"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cấu Hình & Chi Nhánh</span>
        </button>
      </div>

      {/* Sub tab: Pending Members (Thành viên đóng góp chờ duyệt) */}
      {activeSubTab === "pendingMembers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-[#1E5F52] flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-[#E0A926]" />
              <span>Danh Sách Đề Xuất Thêm Thành Viên Mới Từ Cộng Đồng</span>
            </h2>
            <button
              type="button"
              onClick={fetchPendingMembers}
              className="text-xs text-stone-500 hover:text-[#1E5F52] flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>

          {loadingMembers ? (
            <div className="p-8 text-center text-stone-400 text-xs">Đang tải danh sách chờ duyệt...</div>
          ) : pendingMembers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#E8DEC7] text-stone-500 text-xs">
              Hiện tại không có thành viên mới nào đang chờ duyệt.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingMembers.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border-2 border-[#E0A926]/40 p-5 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                        Chờ Phê Duyệt
                      </span>
                      <h3 className="font-serif font-bold text-sm text-[#1E5F52]">
                        {m.fullName}
                      </h3>
                      {m.courtesyName && (
                        <span className="text-xs text-stone-500 italic">
                          (Tự: {m.courtesyName})
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-400 font-mono">
                      Mã tạm: {m.memberCode} • Đời thứ {m.generation}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-700 bg-[#FAF7EE] p-3 rounded-xl border border-[#E8DEC7]">
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold">Giới tính:</span>
                      <span>{m.gender === "FEMALE" ? "Nữ" : "Nam"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold">Trạng thái:</span>
                      <span>{m.isAlive ? "Còn sống" : "Đã mất"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold">Chi họ:</span>
                      <span>{m.branch?.branchName || "Chưa phân chi"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block font-semibold">Người đề xuất:</span>
                      <span className="font-medium text-[#8B1E1E]">{m.submitterName || "Cộng đồng"}</span>
                    </div>
                  </div>

                  {m.submitterNote && (
                    <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                      <strong>Ghi chú từ người gửi:</strong> {m.submitterNote}
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      disabled={processingId === m.id}
                      onClick={() => handleMemberApproval(m.id, "REJECT")}
                      className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition-all flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5 text-stone-500" />
                      <span>Từ chối</span>
                    </button>
                    <button
                      type="button"
                      disabled={processingId === m.id}
                      onClick={() => handleMemberApproval(m.id, "APPROVE")}
                      className="px-4 py-1.5 bg-[#1E5F52] hover:bg-[#16483E] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center space-x-1.5 border border-[#E0A926]/40"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#FADB7F]" />
                      <span>Phê Duyệt Vào Cây Gia Phả</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Content based on sub tab */}
      {activeSubTab === "requests" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-[#8B1E1E]">
              Danh Sách Đề Xuất Chỉnh Sửa Dữ Liệu Gia Phả
            </h2>
            <button
              type="button"
              onClick={fetchRequests}
              className="text-xs text-stone-500 hover:text-[#8B1E1E] flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>

          {loadingRequests ? (
            <div className="p-8 text-center text-stone-400 text-xs">Đang tải đề xuất...</div>
          ) : requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#E8DEC7] text-stone-500 text-xs">
              Chưa có đề xuất thay đổi nào từ thành viên dòng họ.
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                    req.status === "PENDING"
                      ? "border-amber-300 ring-1 ring-amber-200"
                      : req.status === "APPROVED"
                      ? "border-emerald-200 bg-emerald-50/20"
                      : "border-stone-200 opacity-70"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : req.status === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {req.status === "PENDING"
                          ? "Chờ xác minh"
                          : req.status === "APPROVED"
                          ? "Đã duyệt"
                          : "Từ chối"}
                      </span>
                      <span className="text-xs font-bold text-stone-800">
                        Người gửi: {req.requesterName}
                      </span>
                      {req.requesterEmail && (
                        <span className="text-xs text-stone-500 font-mono">
                          ({req.requesterEmail})
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-400">
                      Gửi lúc: {new Date(req.createdAt).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 text-xs">
                    <div>
                      <p className="font-semibold text-stone-700">Lý do đề xuất:</p>
                      <p className="text-stone-600 bg-stone-50 p-2.5 rounded-lg mt-1 border border-stone-100">
                        {req.reason}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-stone-700">Nguồn tư liệu minh chứng:</p>
                      <p className="text-stone-600 bg-stone-50 p-2.5 rounded-lg mt-1 border border-stone-100">
                        {req.evidenceSource}
                      </p>
                    </div>
                  </div>

                  {req.proposedData && (
                    <div className="text-xs py-1">
                      <p className="font-semibold text-stone-700 mb-1">Dữ liệu đề xuất thay đổi:</p>
                      <pre className="bg-[#FAF7EE] p-2.5 rounded-lg border border-[#E8DEC7] text-stone-800 text-[11px] font-mono overflow-x-auto">
                        {req.proposedData}
                      </pre>
                    </div>
                  )}

                  {req.status === "PENDING" && (
                    <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <input
                        type="text"
                        placeholder="Ghi chú xác minh của Ban Quản Trị..."
                        value={reviewNote[req.id] || ""}
                        onChange={(e) =>
                          setReviewNote({ ...reviewNote, [req.id]: e.target.value })
                        }
                        className="w-full sm:max-w-md px-3 py-1.5 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#8B1E1E] focus:outline-hidden"
                      />
                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          disabled={processingId === req.id}
                          onClick={() => handleReview(req.id, "REJECTED")}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1"
                        >
                          <XCircle className="w-3.5 h-3.5 text-stone-500" />
                          <span>Từ chối</span>
                        </button>
                        <button
                          type="button"
                          disabled={processingId === req.id}
                          onClick={() => handleReview(req.id, "APPROVED")}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Phê duyệt</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {req.reviewerNote && (
                    <p className="text-[11px] text-stone-500 italic mt-2">
                      Ghi chú duyệt: {req.reviewerNote}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub tab: Audit Logs */}
      {activeSubTab === "audit" && (
        <div className="bg-white rounded-2xl border border-[#E8DEC7] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-[#8B1E1E]">
              Nhật Ký Hoạt Động & Bảo Mật Hệ Thống (Audit Logs)
            </h2>
            <button
              type="button"
              onClick={fetchAuditLogs}
              className="text-xs text-stone-500 hover:text-[#8B1E1E] flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm mới</span>
            </button>
          </div>

          {loadingLogs ? (
            <div className="p-8 text-center text-stone-400 text-xs">Đang tải nhật ký...</div>
          ) : auditLogs.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              Chưa có nhật ký hoạt động nào được ghi nhận.
            </div>
          ) : (
            <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto pr-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-[#8B1E1E] bg-[#8B1E1E]/10 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                      {log.target && (
                        <span className="font-semibold text-stone-800">
                          {log.target}
                        </span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-stone-600 text-[11px] pl-0.5">
                        {log.details}
                      </p>
                    )}
                    <p className="text-[10px] text-stone-400">
                      Bởi: <span className="font-medium text-stone-600">{log.userName}</span> ({log.userEmail || "Hệ thống"})
                    </p>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono shrink-0">
                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub tab: Overview & Branches guidance */}
      {activeSubTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-[#E8DEC7] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-serif text-[#8B1E1E] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#C59B27]" />
              <span>Quản Lý Chi Họ & Nhánh Mẫu Ban Đầu</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Theo quy định khởi tạo của dòng họ, hệ thống ban đầu đã thiết lập sẵn <strong>1-4 chi mẫu</strong>:
            </p>
            <ul className="text-xs text-stone-700 space-y-1.5 bg-[#FAF7EE] p-3 rounded-xl border border-[#E8DEC7]">
              <li>• <strong>Chi 1</strong>: Chi Trưởng (Tiền Giang) — Trông coi từ đường chính.</li>
              <li>• <strong>Chi 2</strong>: Chi Giáp (Hậu Giang) — Phát triển kinh thương & kỹ nghệ.</li>
              <li>• <strong>Chi 3</strong>: Chi Ất (Tây Đô) — Tập trung học vấn, giáo dục.</li>
              <li>• <strong>Chi 4</strong>: Chi Bính (Thăng Long) — Lập nghiệp tại thủ đô và phương Nam.</li>
            </ul>
            <p className="text-xs text-stone-600">
              Với quyền Tổng Quản Trị, bạn có thể tạo thêm các Chi 5, Chi 6,... hoặc chỉnh sửa thông tin người đứng đầu bất cứ lúc nào.
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab("branches")}
              className="px-4 py-2 bg-[#8B1E1E] hover:bg-[#721515] text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <span>Xem Quản Lý Chi Nhánh</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#E8DEC7] p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold font-serif text-[#8B1E1E] flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#C59B27]" />
              <span>An Toàn & Sao Lưu Dữ Liệu</span>
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Dữ liệu gia phả là tài sản văn hóa trường tồn của dòng họ. Hệ thống áp dụng cơ chế xác thực server-side, phòng chống chu trình huyết thống (Cycle Prevention) và tự động ghi log mọi thay đổi.
            </p>
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs space-y-2">
              <p className="font-bold text-amber-900 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Trạng thái bảo vệ dữ liệu:</span>
              </p>
              <p className="text-amber-800 text-[11px]">
                • Mật khẩu quản trị được băm với Bcrypt Salt 10 rounds.<br />
                • Ràng buộc khóa ngoại Cascade & SetNull an toàn.<br />
                • Ngăn chặn xóa thành viên còn liên kết con cái.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
