"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  FolderTree,
  Edit3,
  Lock,
  Unlock,
  Globe,
  Building,
  CheckSquare,
  Square,
  Settings,
  Shield,
  Share2,
  Copy,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { PendingSubmission, AdminUser, Tree } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";
import FamilyOperationsView from "./FamilyOperationsView";

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
    trees,
    activeTreeId,
    setActiveTreeId,
    createTree,
    updateTree,
    deleteTree,
    assignTreeManager,
    approveSubmission,
    rejectSubmission,
    createAdminUser,
    getMember,
  } = useFamilyStore();

  const [activeTab, setActiveTab] = useState<"queue" | "trees" | "operations" | "rbac" | "stats">("queue");

  // Chặn Tree Manager truy cập tab cấu hình hệ thống RBAC
  useEffect(() => {
    if (activeTab === "rbac" && !isSuperAdmin) {
      setActiveTab("queue");
    }
  }, [activeTab, isSuperAdmin]);
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
  const [newUserAssignedTrees, setNewUserAssignedTrees] = useState<string[]>([]);
  const [adminFormMsg, setAdminFormMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Multi-tree states
  const [showCreateTreeModal, setShowCreateTreeModal] = useState(false);
  const [newTreeName, setNewTreeName] = useState("");
  const [newTreeLocation, setNewTreeLocation] = useState("");
  const [newTreeDescription, setNewTreeDescription] = useState("");
  const [newTreeSlug, setNewTreeSlug] = useState("");
  const [treeActionLoading, setTreeActionLoading] = useState(false);
  const [treeActionMsg, setTreeActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit tree modal state
  const [editingTree, setEditingTree] = useState<Tree | null>(null);
  const [editTreeName, setEditTreeName] = useState("");
  const [editTreeLocation, setEditTreeLocation] = useState("");
  const [editTreeDescription, setEditTreeDescription] = useState("");
  const [editTreeStatus, setEditTreeStatus] = useState<"ACTIVE" | "CLOSED" | "LOCKED">("ACTIVE");

  // Role Assignment modal state
  const [assigningUser, setAssigningUser] = useState<AdminUser | null>(null);
  const [selectedTreesForUser, setSelectedTreesForUser] = useState<string[]>([]);

  // Public Share Modal state
  const [sharingTree, setSharingTree] = useState<Tree | null>(null);
  const [shareIsPublic, setShareIsPublic] = useState(false);
  const [shareSlug, setShareSlug] = useState("");
  const [sharePassword, setSharePassword] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMsg, setShareMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Crowdsourced Suggestions state
  const [queueSource, setQueueSource] = useState<"crowdsource" | "system">("crowdsource");
  const [remoteSuggestions, setRemoteSuggestions] = useState<any[]>([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteFilter, setRemoteFilter] = useState<"PENDING" | "APPROVED" | "REJECTED" | "ALL">("PENDING");
  const [rejectingRemoteId, setRejectingRemoteId] = useState<string | null>(null);
  const [rejectRemoteReason, setRejectRemoteReason] = useState("");

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
      assignedTreeIds: newAdminRole === "admin" ? newUserAssignedTrees : undefined,
    });

    if (res.success) {
      setAdminFormMsg({ type: "success", text: res.message });
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewUserAssignedTrees([]);
      setTimeout(() => {
        setShowAddAdminModal(false);
        setAdminFormMsg(null);
      }, 1500);
    } else {
      setAdminFormMsg({ type: "error", text: res.message });
    }
  };

  const handleCreateTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreeName.trim()) return;
    setTreeActionLoading(true);
    setTreeActionMsg(null);
    try {
      await createTree({
        name: newTreeName.trim(),
        originLocation: newTreeLocation.trim() || undefined,
        description: newTreeDescription.trim() || undefined,
        slug: newTreeSlug.trim() || undefined,
      });
      setTreeActionMsg({ type: "success", text: `Đã tạo gia phả "${newTreeName}" thành công!` });
      setNewTreeName("");
      setNewTreeLocation("");
      setNewTreeDescription("");
      setNewTreeSlug("");
      setTimeout(() => {
        setShowCreateTreeModal(false);
        setTreeActionMsg(null);
      }, 1200);
    } catch (err: any) {
      setTreeActionMsg({ type: "error", text: err.message || "Lỗi khi tạo cây gia phả" });
    } finally {
      setTreeActionLoading(false);
    }
  };

  const handleUpdateTree = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTree) return;
    setTreeActionLoading(true);
    try {
      await updateTree(editingTree.id, {
        name: editTreeName.trim(),
        originLocation: editTreeLocation.trim() || undefined,
        description: editTreeDescription.trim() || undefined,
        status: editTreeStatus,
      });
      setEditingTree(null);
    } catch (err: any) {
      alert("Lỗi khi cập nhật cây gia phả: " + (err.message || String(err)));
    } finally {
      setTreeActionLoading(false);
    }
  };

  const handleDeleteTree = async (treeId: string, treeName: string) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa cây gia phả "${treeName}"? Mọi thành viên trong cây này sẽ bị xóa khỏi hệ thống.`
      )
    ) {
      return;
    }
    try {
      await deleteTree(treeId);
    } catch (err: any) {
      alert("Lỗi khi xóa cây: " + (err.message || String(err)));
    }
  };

  const openEditTreeModal = (t: Tree) => {
    setEditingTree(t);
    setEditTreeName(t.name);
    setEditTreeLocation(t.originLocation || "");
    setEditTreeDescription(t.description || "");
    setEditTreeStatus(t.status || "ACTIVE");
  };

  const openAssignModal = (u: AdminUser) => {
    setAssigningUser(u);
    setSelectedTreesForUser(u.assignedTrees || u.assignedTreeIds || []);
  };

  const handleSaveTreeRoles = () => {
    if (!assigningUser) return;
    assignTreeManager(assigningUser.id, selectedTreesForUser);
    setAssigningUser(null);
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

  const openShareModal = (t: Tree) => {
    setSharingTree(t);
    setShareIsPublic(t.isPublic ?? false);
    setShareSlug(t.shareSlug || t.slug || t.id);
    setSharePassword(t.accessPassword || "");
    setShareCopied(false);
    setShareMsg(null);
  };

  const handleCopyShareLink = async () => {
    if (!sharingTree) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const slugToUse = shareSlug.trim() || sharingTree.shareSlug || sharingTree.slug || sharingTree.id;
    const fullUrl = `${origin}/share/${slugToUse}`;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      setShareCopied(false);
    }
  };

  const handleSaveShareSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sharingTree) return;
    setShareLoading(true);
    setShareMsg(null);
    try {
      await updateTree(sharingTree.id, {
        isPublic: shareIsPublic,
        shareSlug: shareSlug.trim() || undefined,
        accessPassword: sharePassword.trim() || undefined,
      });

      // Nếu bật công khai, tự động đồng bộ danh sách thành viên hiện có lên database để người xem thấy đầy đủ
      if (shareIsPublic) {
        let membersToSync: any[] = [];
        if (activeTreeId === sharingTree.id && Array.isArray(members) && members.length > 0) {
          membersToSync = members;
        } else {
          try {
            const key = sharingTree.id === "tree-phan-family" ? "viet_family_tree_members_v2" : `tree_members_${sharingTree.id}`;
            const stored = localStorage.getItem(key);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (Array.isArray(parsed) && parsed.length > 0) {
                membersToSync = parsed;
              }
            }
          } catch (e) {}
        }

        if (membersToSync.length > 0) {
          try {
            await fetch(`/api/trees/${sharingTree.id}/import`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com",
              },
              body: JSON.stringify({
                members: membersToSync,
                upsertMode: "overwrite",
              }),
            });
          } catch (syncErr) {
            console.warn("Lỗi đồng bộ thành viên khi bật chia sẻ:", syncErr);
          }
        }
      }

      setShareMsg({ type: "success", text: "Đã lưu cấu hình chia sẻ công khai thành công!" });
      setTimeout(() => {
        setSharingTree(null);
        setShareMsg(null);
      }, 1200);
    } catch (err: any) {
      setShareMsg({ type: "error", text: err.message || "Lỗi khi lưu cấu hình chia sẻ" });
    } finally {
      setShareLoading(false);
    }
  };

  const fetchRemoteSuggestions = useCallback(async () => {
    setRemoteLoading(true);
    try {
      const res = await fetch(`/api/trees/${activeTreeId}/suggestions`, {
        headers: {
          "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRemoteSuggestions(data.suggestions || []);
      }
    } catch (e) {
      console.warn("Fetch suggestions error:", e);
    } finally {
      setRemoteLoading(false);
    }
  }, [activeTreeId, currentAdmin]);

  useEffect(() => {
    if (activeTab === "queue") {
      fetchRemoteSuggestions();
    }
  }, [activeTab, fetchRemoteSuggestions]);

  const handleApproveRemoteSuggestion = async (id: string) => {
    try {
      const res = await fetch(`/api/trees/${activeTreeId}/suggestions/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com",
        },
        body: JSON.stringify({ action: "approve" }),
      });
      if (res.ok) {
        setRemoteSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "APPROVED" } : s))
        );
        setActiveTreeId(activeTreeId);
      } else {
        const errData = await res.json();
        alert(errData.error || "Lỗi khi phê duyệt đề xuất.");
      }
    } catch (e: any) {
      alert("Lỗi kết nối: " + e.message);
    }
  };

  const handleRejectRemoteSuggestion = async (id: string) => {
    if (!rejectRemoteReason.trim()) {
      alert("Vui lòng nhập lý do từ chối để phản hồi.");
      return;
    }
    try {
      const res = await fetch(`/api/trees/${activeTreeId}/suggestions/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": currentAdmin?.email || "anhthuphan0102@gmail.com",
        },
        body: JSON.stringify({ action: "reject", reviewNote: rejectRemoteReason.trim() }),
      });
      if (res.ok) {
        setRemoteSuggestions((prev) =>
          prev.map((s) =>
            s.id === id ? { ...s, status: "REJECTED", reviewNote: rejectRemoteReason.trim() } : s
          )
        );
        setRejectingRemoteId(null);
        setRejectRemoteReason("");
      } else {
        const errData = await res.json();
        alert(errData.error || "Lỗi khi từ chối đề xuất.");
      }
    } catch (e: any) {
      alert("Lỗi kết nối: " + e.message);
    }
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
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start md:self-auto overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("queue")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "queue"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hàng Đợi ({pendingCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("trees")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "trees"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>{isSuperAdmin ? `Cây Gia Phả (${trees.length})` : `Gia Phả Của Tôi (${trees.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("operations")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "operations"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Hoạt Động Dòng Họ</span>
          </button>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setActiveTab("rbac")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "rbac"
                  ? "bg-white text-blue-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Phân Quyền RBAC ({adminUsers.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === "stats"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Thống Kê</span>
          </button>
        </div>
      </div>

      {/* TAB 1: HÀNG ĐỢI XÉT DUYỆT (APPROVAL QUEUE) */}
      {activeTab === "queue" && (
        <div className="space-y-4">
          {/* Sub-tab Selector */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setQueueSource("crowdsource")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                queueSource === "crowdsource"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Đề xuất từ liên kết công khai (
                {remoteSuggestions.filter((s) => s.status === "PENDING").length} chờ duyệt)
              </span>
            </button>
            <button
              type="button"
              onClick={() => setQueueSource("system")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                queueSource === "system"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Yêu cầu nội bộ ({pendingCount})</span>
            </button>
          </div>

          {queueSource === "crowdsource" ? (
            <div className="space-y-4">
              {/* Filter Bar */}
              <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold text-slate-500 mr-2">Trạng thái:</span>
                  <button
                    type="button"
                    onClick={() => setRemoteFilter("PENDING")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      remoteFilter === "PENDING"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Chờ duyệt ({remoteSuggestions.filter((s) => s.status === "PENDING").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoteFilter("APPROVED")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      remoteFilter === "APPROVED"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Đã chấp thuận ({remoteSuggestions.filter((s) => s.status === "APPROVED").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoteFilter("REJECTED")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      remoteFilter === "REJECTED"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Đã từ chối ({remoteSuggestions.filter((s) => s.status === "REJECTED").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoteFilter("ALL")}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      remoteFilter === "ALL"
                        ? "bg-slate-800 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Tất cả ({remoteSuggestions.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={fetchRemoteSuggestions}
                  disabled={remoteLoading}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  {remoteLoading ? "Đang tải..." : "Làm mới danh sách"}
                </button>
              </div>

              {/* Suggestions List */}
              {remoteSuggestions.filter((s) => remoteFilter === "ALL" || s.status === remoteFilter).length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 text-base">
                    Không có đề xuất công khai nào trong mục này
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Bà con dòng họ đóng góp thông tin qua liên kết công khai sẽ được hiển thị tại đây để Ban Trị Sự duyệt.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {remoteSuggestions
                    .filter((s) => remoteFilter === "ALL" || s.status === remoteFilter)
                    .map((item) => {
                      const isPending = item.status === "PENDING";
                      const isApproved = item.status === "APPROVED";
                      const isRejected = item.status === "REJECTED";
                      const targetMember = item.targetMemberId ? getMember(item.targetMemberId) : null;
                      const pData = item.proposedData || {};

                      const typeLabel =
                        item.suggestionType === "EDIT_INFO"
                          ? "Chỉnh sửa thông tin"
                          : item.suggestionType === "ADD_CHILD"
                          ? "Thêm con/cháu mới"
                          : "Báo sai sót";

                      const typeColor =
                        item.suggestionType === "EDIT_INFO"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : item.suggestionType === "ADD_CHILD"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-rose-100 text-rose-800 border-rose-200";

                      return (
                        <div
                          key={item.id}
                          className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                            isPending
                              ? "border-amber-300 ring-2 ring-amber-400/20"
                              : isApproved
                              ? "border-emerald-200 bg-emerald-50/20"
                              : "border-slate-200 opacity-80"
                          }`}
                        >
                          {/* Item Header */}
                          <div className="flex items-start justify-between gap-3 flex-wrap border-b border-slate-100 pb-3 mb-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${typeColor}`}>
                                {typeLabel}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                Người gửi: {item.senderName}
                              </span>
                              {item.senderPhone && (
                                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{item.senderPhone}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(item.createdAt).toLocaleString("vi-VN")}</span>
                              </span>
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                  isPending
                                    ? "bg-amber-100 text-amber-800"
                                    : isApproved
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {isPending ? "Chờ duyệt" : isApproved ? "Đã chấp thuận" : "Đã từ chối"}
                              </span>
                            </div>
                          </div>

                          {/* Target Member reference if any */}
                          {targetMember && (
                            <div className="mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                              <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>
                                Áp dụng cho: <strong>{targetMember.fullName}</strong> (Đời {targetMember.generation} - {targetMember.nickname || "Chưa có hiệu"})
                              </span>
                            </div>
                          )}

                          {/* Proposed Data Details */}
                          <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-1.5 text-xs text-slate-700">
                            <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider block border-b border-emerald-200 pb-1">
                              Dữ liệu đề xuất
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                              {pData.fullName && (
                                <p>Họ tên: <strong className="text-emerald-900">{pData.fullName}</strong></p>
                              )}
                              {pData.gender && (
                                <p>Giới tính: <strong>{pData.gender === "female" ? "Nữ" : "Nam"}</strong></p>
                              )}
                              {pData.birthDate && (
                                <p>Ngày/Năm sinh: <strong>{pData.birthDate}</strong></p>
                              )}
                              {pData.deathDate && (
                                <p>Ngày giỗ/mất: <strong>{pData.deathDate}</strong></p>
                              )}
                              {pData.phone && (
                                <p>SĐT: <strong className="font-mono">{pData.phone}</strong></p>
                              )}
                              {pData.address && (
                                <p>Nơi cư trú: <strong>{pData.address}</strong></p>
                              )}
                              {pData.senderRelation && (
                                <p>Quan hệ: <strong>{pData.senderRelation}</strong></p>
                              )}
                            </div>
                            {pData.notes && (
                              <p className="pt-1 text-slate-600 border-t border-emerald-100 mt-2">
                                Ghi chú: <em>&quot;{pData.notes}&quot;</em>
                              </p>
                            )}
                          </div>

                          {/* Rejection Note */}
                          {isRejected && item.reviewNote && (
                            <div className="mt-2.5 p-2.5 bg-rose-100/70 border border-rose-300 rounded-lg text-xs text-rose-900">
                              <strong>Lý do từ chối:</strong> {item.reviewNote}
                            </div>
                          )}

                          {/* Approval Attribution */}
                          {isApproved && item.reviewedBy && (
                            <div className="mt-2.5 p-2 bg-emerald-100/60 border border-emerald-300 rounded-lg text-[11px] text-emerald-900 flex items-center gap-1.5 font-medium">
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Đã duyệt và hợp nhất tự động vào phả hệ bởi: <strong>{item.reviewedBy}</strong></span>
                            </div>
                          )}

                          {/* Action Buttons for Pending */}
                          {isPending && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                              {rejectingRemoteId === item.id ? (
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <input
                                    type="text"
                                    placeholder="Nhập lý do từ chối..."
                                    value={rejectRemoteReason}
                                    onChange={(e) => setRejectRemoteReason(e.target.value)}
                                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-rose-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRejectRemoteSuggestion(item.id)}
                                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                                  >
                                    Xác nhận từ chối
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRejectingRemoteId(null);
                                      setRejectRemoteReason("");
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
                                    onClick={() => setRejectingRemoteId(item.id)}
                                    className="px-3.5 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                                  >
                                    <XCircle className="w-3.5 h-3.5" />
                                    <span>Từ chối</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveRemoteSuggestion(item.id)}
                                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Chấp thuận & Hợp nhất (1-Click)</span>
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
          ) : (
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

      {/* TAB 2: QUẢN LÝ CÂY GIA PHẢ (MULTI-TREE) */}
      {activeTab === "trees" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-600" />
                <span>
                  {isSuperAdmin
                    ? "Quản Lý Danh Sách Cây Gia Phả Hệ Thống"
                    : "Danh Sách Gia Phả Của Tôi (Được Gán Quản Lý)"}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isSuperAdmin
                  ? "Chỉ Super Admin mới có quyền tạo cây gia phả mới và xóa cây gia phả. Quản lý trạng thái, phân công phụ trách và chuyển đổi nhanh giữa các nhánh tộc."
                  : "Bạn chỉ có quyền xem và quản trị các cây gia phả được Super Admin phân công cụ thể qua UserTreeRole. Hệ thống chặn tuyệt đối can thiệp chéo."}
              </p>
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setShowCreateTreeModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-transform active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Tạo Gia Phả Mới</span>
              </button>
            )}
          </div>

          {/* Trees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trees.map((t) => {
              const isActive = t.id === activeTreeId;
              const statusColors =
                t.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : t.status === "CLOSED"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200";
              const statusLabel =
                t.status === "ACTIVE"
                  ? "Đang hoạt động"
                  : t.status === "CLOSED"
                  ? "Đã đóng"
                  : "Bị khóa";

              return (
                <div
                  key={t.id}
                  className={`relative p-5 rounded-2xl border transition-all ${
                    isActive
                      ? "border-blue-500 bg-blue-50/20 shadow-md ring-2 ring-blue-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColors}`}
                      >
                        {statusLabel}
                      </span>
                      {t.isPublic ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-emerald-600" />
                          <span>Công khai</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>Riêng tư</span>
                        </span>
                      )}
                      {(t.accessPassword || t.hasPassword) && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5" title="Có cài passcode truy cập">
                          <KeyRound className="w-2.5 h-2.5 text-amber-600" />
                          <span>Passcode</span>
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs">
                        Đang kích hoạt
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 text-base mb-1">{t.name}</h4>
                  {t.originLocation && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{t.originLocation}</span>
                    </p>
                  )}
                  {t.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {t.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mb-4">
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.memberCount || 0} thành viên</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                      {t.slug || t.id}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTreeId(t.id);
                        onNavigateTab("tree");
                      }}
                      className="flex-1 py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer text-center transition-colors"
                    >
                      Xem Phả Hệ
                    </button>

                    <button
                      type="button"
                      onClick={() => openShareModal(t)}
                      className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-lg cursor-pointer transition-colors"
                      title="Cấu hình chia sẻ liên kết công khai"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditTreeModal(t)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                      title="Chỉnh sửa thông tin / Trạng thái"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    {isSuperAdmin && trees.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTree(t.id, t.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                        title="Xóa gia phả này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: HOẠT ĐỘNG DÒNG HỌ (FAMILY OPERATIONS) */}
      {activeTab === "operations" && (
        <FamilyOperationsView
          treeId={activeTreeId}
          treeName={trees.find((t) => t.id === activeTreeId)?.name || "Gia Phả"}
        />
      )}

      {/* TAB 3: PHÂN QUYỀN HỆ THỐNG (RBAC) - CHỈ SUPER ADMIN */}
      {activeTab === "rbac" && isSuperAdmin && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <span>Mô Hình Phân Quyền Vai Trò (Role-Based Access Control)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Quản lý danh sách tài khoản quản trị và gán quyền phụ trách (TREE_MANAGER) trên từng gia phả cụ thể.
              </p>
            </div>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => setShowAddAdminModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-transform active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Thêm Tài Khoản Mới</span>
              </button>
            )}
          </div>

          {/* 3 Role Explanation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
              <div className="flex items-center gap-2 text-purple-800 font-bold text-xs mb-1">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>SUPER_ADMIN (Hệ thống)</span>
              </div>
              <ul className="text-[11px] text-purple-900/80 space-y-1 list-disc list-inside">
                <li>Toàn quyền tạo mới gia phả (duy nhất có nút Tạo gia phả).</li>
                <li>Quản lý danh mục gia phả (Đổi tên, Đóng/Mở, Xóa).</li>
                <li>Cấp tài khoản và gán vai trò phụ trách các gia phả.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs mb-1">
                <FolderTree className="w-4 h-4 text-blue-600" />
                <span>TREE_MANAGER (Quản lý gia phả)</span>
              </div>
              <ul className="text-[11px] text-blue-900/80 space-y-1 list-disc list-inside">
                <li>Xem, thêm, sửa, xóa thành viên trên các gia phả được chỉ định.</li>
                <li>Được dùng tính năng &quot;Nhập dữ liệu nhanh&quot; (Bulk Import).</li>
                <li>Không thể tạo thêm cây gia phả mới trong hệ thống.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                <Users className="w-4 h-4 text-slate-600" />
                <span>VIEWER / MEMBER (Thành viên xem)</span>
              </div>
              <ul className="text-[11px] text-slate-700 space-y-1 list-disc list-inside">
                <li>Tra cứu cây phả hệ, thông tin liên lạc con cháu.</li>
                <li>Xem lịch giỗ chạp và sự kiện sinh hoạt dòng họ.</li>
                <li>Không có quyền can thiệp hay thay đổi dữ liệu gia phả.</li>
              </ul>
            </div>
          </div>

          {/* Accounts & Tree Assignments Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Họ và tên</th>
                  <th className="py-2.5 px-3">Email đăng nhập</th>
                  <th className="py-2.5 px-3">Vai trò hệ thống</th>
                  <th className="py-2.5 px-3">Cây gia phả phụ trách</th>
                  <th className="py-2.5 px-3">Ngày tạo</th>
                  <th className="py-2.5 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminUsers.map((u) => {
                  const isSuper = u.role === "super_admin";
                  const assignedTrees = trees.filter((t) =>
                    (u.assignedTrees || u.assignedTreeIds || []).includes(t.id)
                  );

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
                          {isSuper ? "Super Admin" : "Tree Manager"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {isSuper ? (
                          <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            Toàn quyền mọi gia phả ({trees.length} cây)
                          </span>
                        ) : assignedTrees.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {assignedTrees.map((at) => (
                              <span
                                key={at.id}
                                className="text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md"
                              >
                                {at.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-600 italic">
                            Chưa gán cây gia phả nào
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500">{u.createdAt}</td>
                      <td className="py-3 px-3 text-right">
                        {isSuperAdmin && !isSuper && (
                          <button
                            type="button"
                            onClick={() => openAssignModal(u)}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                          >
                            Phân Quyền Gia Phả
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: TẠO GIA PHẢ MỚI (CHỈ SUPER ADMIN) */}
      {showCreateTreeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Tạo Cây Gia Phả Mới (Super Admin)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateTreeModal(false)}
                className="text-white/80 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTree} className="p-5 space-y-3.5 text-xs">
              {treeActionMsg && (
                <div
                  className={`p-2.5 rounded-lg border text-xs font-semibold ${
                    treeActionMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {treeActionMsg.text}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên cây gia phả / Tộc họ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Gia Phả Tộc Phan (Quảng Nam - Chi Giáp)"
                  value={newTreeName}
                  onChange={(e) => setNewTreeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quê quán / Nơi phát tích gốc
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Điện Bàn, Quảng Nam"
                  value={newTreeLocation}
                  onChange={(e) => setNewTreeLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mô tả vắn tắt / Lịch sử nhánh
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả nguồn gốc hoặc lưu ý đặc thù của chi phái..."
                  value={newTreeDescription}
                  onChange={(e) => setNewTreeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mã định danh Slug (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: gia-pha-toc-phan-quang-nam"
                  value={newTreeSlug}
                  onChange={(e) => setNewTreeSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTreeModal(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={treeActionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{treeActionLoading ? "Đang tạo..." : "Xác Nhận Tạo Gia Phả"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHỈNH SỬA CÂY GIA PHẢ */}
      {editingTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Cập Nhật Cây Gia Phả: {editingTree.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTree(null)}
                className="text-white/80 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTree} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tên cây gia phả *
                </label>
                <input
                  type="text"
                  required
                  value={editTreeName}
                  onChange={(e) => setEditTreeName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quê quán / Phát tích
                </label>
                <input
                  type="text"
                  value={editTreeLocation}
                  onChange={(e) => setEditTreeLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  value={editTreeDescription}
                  onChange={(e) => setEditTreeDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Trạng thái hoạt động
                </label>
                <select
                  value={editTreeStatus}
                  onChange={(e) =>
                    setEditTreeStatus(e.target.value as "ACTIVE" | "CLOSED" | "LOCKED")
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="ACTIVE">ACTIVE - Đang hoạt động bình thường</option>
                  <option value="CLOSED">CLOSED - Tạm đóng / Lưu trữ</option>
                  <option value="LOCKED">LOCKED - Khóa chỉnh sửa</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTree(null)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={treeActionLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{treeActionLoading ? "Đang lưu..." : "Lưu Thay Đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PHÂN QUYỀN GIA PHẢ CHO USER */}
      {assigningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Phân Quyền Phụ Trách Gia Phả</h3>
              </div>
              <button
                type="button"
                onClick={() => setAssigningUser(null)}
                className="text-white/80 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-900">{assigningUser.name}</p>
                <p className="text-slate-500 font-mono text-[11px]">{assigningUser.email}</p>
                <p className="text-[10px] text-blue-600 font-semibold mt-1">
                  Vai trò: {assigningUser.role === "super_admin" ? "SUPER_ADMIN" : "TREE_MANAGER"}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-2">
                  Chọn các cây gia phả tài khoản này được quyền quản lý:
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                  {trees.map((t) => {
                    const checked = selectedTreesForUser.includes(t.id);
                    return (
                      <label
                        key={t.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                          checked
                            ? "bg-blue-50/60 border-blue-300"
                            : "bg-white border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTreesForUser((prev) => [...prev, t.id]);
                            } else {
                              setSelectedTreesForUser((prev) =>
                                prev.filter((id) => id !== t.id)
                              );
                            }
                          }}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <p className="font-bold text-slate-900">{t.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {t.originLocation || "Không có địa danh"} • {t.memberCount || 0} thành viên
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAssigningUser(null)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveTreeRoles}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Lưu Phân Quyền</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: THÊM TÀI KHOẢN MỚI */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Thêm Tài Khoản Quản Trị Hệ Thống</h3>
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
                  Họ và tên *
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
                  Email đăng nhập / Tên người dùng *
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
                  Mật khẩu khởi tạo tạm thời *
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
                  Vai trò hệ thống
                </label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as "admin" | "super_admin")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="admin">TREE_MANAGER (Quản lý gia phả được chỉ định)</option>
                  <option value="super_admin">SUPER_ADMIN (Tổng quản trị toàn quyền)</option>
                </select>
              </div>

              {newAdminRole === "admin" && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Gán phụ trách các gia phả ban đầu:
                  </label>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-lg">
                    {trees.map((t) => {
                      const checked = newUserAssignedTrees.includes(t.id);
                      return (
                        <label
                          key={t.id}
                          className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer text-[11px]"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewUserAssignedTrees((prev) => [...prev, t.id]);
                              } else {
                                setNewUserAssignedTrees((prev) =>
                                  prev.filter((id) => id !== t.id)
                                );
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium text-slate-800">{t.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
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

      {/* MODAL 5: CẤU HÌNH CHIA SẺ LIÊN KẾT CÔNG KHAI */}
      {sharingTree && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-bold text-sm">Chia Sẻ Liên Kết Công Khai</h3>
                  <p className="text-[11px] text-slate-400 font-normal">
                    {sharingTree.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSharingTree(null)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShareSettings} className="p-5 space-y-4 text-xs">
              {shareMsg && (
                <div
                  className={`p-2.5 rounded-lg border text-xs font-semibold ${
                    shareMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-800 border-rose-200"
                  }`}
                >
                  {shareMsg.text}
                </div>
              )}

              {/* Toggle Public Access */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span>Chế độ xem công khai (Public Share)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Cho phép bà con dòng họ & khách vãng lai truy cập xem phả hệ qua đường link.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareIsPublic}
                    onChange={(e) => setShareIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Custom Slug */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Đường dẫn liên kết tĩnh (Share Slug / Alias)
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-300 rounded-l-lg text-slate-500 font-mono text-[11px]">
                    /share/
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="dong-ho-phan-quang-nam"
                    value={shareSlug}
                    onChange={(e) => setShareSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, "-"))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-r-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Chỉ gồm chữ thường không dấu, số và dấu gạch nối (ví dụ: gia-pha-toc-phan).
                </p>
              </div>

              {/* Password Protection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    Mật khẩu bảo vệ (Passcode tùy chọn)
                  </label>
                  <span className="text-[10px] text-slate-400">Để trống nếu mở tự do không cần mật khẩu</span>
                </div>
                <input
                  type="text"
                  placeholder="Để trống nếu mở tự do..."
                  value={sharePassword}
                  onChange={(e) => setSharePassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Nếu đặt mật khẩu, người xem qua link phải nhập đúng passcode này mới xem được cây.
                </p>
              </div>

              {/* Shareable Link Display & Copy */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-[11px]">Liên kết công khai của cây:</span>
                  <a
                    href={`/share/${shareSlug.trim() || sharingTree.slug || sharingTree.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-900 flex items-center gap-1 font-semibold text-[11px]"
                  >
                    <span>Xem thử trang khách</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={
                      typeof window !== "undefined"
                        ? `${window.location.origin}/share/${shareSlug.trim() || sharingTree.slug || sharingTree.id}`
                        : `/share/${shareSlug.trim() || sharingTree.slug || sharingTree.id}`
                    }
                    className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-lg font-mono text-[11px] text-slate-700 select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopyShareLink}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 text-[11px] cursor-pointer transition-colors shadow-2xs ${
                      shareCopied
                        ? "bg-emerald-600 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {shareCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Privacy Notice */}
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Chính sách bảo vệ quyền riêng tư:</strong> Số điện thoại và địa chỉ cụ thể của các thành viên còn sống sẽ được hệ thống tự động làm mờ (Mask) để bảo vệ dữ liệu cá nhân.
                </span>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSharingTree(null)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={shareLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{shareLoading ? "Đang lưu..." : "Lưu Cấu Hình"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
