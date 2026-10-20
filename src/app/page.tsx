"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import FamilyTreeCanvas from "@/components/FamilyTreeCanvas";
import MemberListView from "@/components/MemberListView";
import AdminView from "@/components/AdminView";
import MemberDetailDrawer from "@/components/MemberDetailDrawer";
import MemberFormModal from "@/components/MemberFormModal";
import LoginModal from "@/components/LoginModal";
import CreateClanModal from "@/components/CreateClanModal";
import InviteModal from "@/components/InviteModal";
import KinshipCalculatorModal from "@/components/KinshipCalculatorModal";
import HistoryModal from "@/components/HistoryModal";
import AnniversariesModal from "@/components/AnniversariesModal";
import LotusFooter from "@/components/LotusFooter";
import {
  ShieldCheck,
  Eye,
  CheckCircle2,
  X,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import {
  getLocalMembers,
  saveLocalMembers,
  recordLocalMemberDeleted,
  recordLocalMemberSaved,
  mergeServerWithLocal,
} from "@/lib/treeStorage";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "BRANCH_MANAGER" | "MEMBER" | "GUEST";
}

const DEFAULT_GUEST: CurrentUser = {
  id: "guest-id",
  email: "guest@giaphaviet.vn",
  name: "Khách Thăm Quan",
  role: "GUEST",
};

const DEFAULT_ADMIN: CurrentUser = {
  id: "admin-default",
  email: "anhthuphan0102@gmail.com",
  name: "Phan Anh Thư (Tổng Quản Trị)",
  role: "ADMIN",
};

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEFAULT_GUEST);
  // Default to Family Tree Canvas as requested
  const [activeTab, setActiveTab] = useState<string>("tree");

  // Clan and stats state
  const [clan, setClan] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    totalMembers: 0,
    totalBranches: 4,
    totalGenerations: 5,
    aliveCount: 0,
    deceasedCount: 0,
    maleCount: 0,
    femaleCount: 0,
  });
  const [branches, setBranches] = useState<any[]>([]);
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateClanModal, setShowCreateClanModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMemberFormModal, setShowMemberFormModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [showKinshipModal, setShowKinshipModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showAnniversariesModal, setShowAnniversariesModal] = useState(false);
  const [kinshipPreselectedA, setKinshipPreselectedA] = useState<string | undefined>();
  const [kinshipPreselectedB, setKinshipPreselectedB] = useState<string | undefined>();
  const [focusedMemberId, setFocusedMemberId] = useState<string | null>(null);
  const [treeRefreshKey, setTreeRefreshKey] = useState<number>(0);
  const [latestSavedMember, setLatestSavedMember] = useState<any | null>(null);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Guest Propose Change Modal
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposingMember, setProposingMember] = useState<any | null>(null);
  const [proposeRequesterName, setProposeRequesterName] = useState("");
  const [proposeRequesterEmail, setProposeRequesterEmail] = useState("");
  const [proposeReason, setProposeReason] = useState("");
  const [proposeEvidence, setProposeEvidence] = useState("");
  const [proposeData, setProposeData] = useState("");
  const [proposeSubmitting, setProposeSubmitting] = useState(false);
  const [proposeMsg, setProposeMsg] = useState<string | null>(null);

  const isAdmin = currentUser.role === "ADMIN";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Refresh all application data (tree canvas, member list, branches, pending count)
  const refreshAllData = () => {
    const t = Date.now();
    setTreeRefreshKey(t);
    fetchClanData(t);
    fetchBranches(t);
    fetchMembersList(t);
    fetchPendingCount(t);
  };

  // Fetch initial clan data & branches with cache-busting
  const fetchClanData = async (t?: number) => {
    try {
      const ts = t || Date.now();
      const res = await fetch(`/api/clans?_t=${ts}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.clan) {
        setClan(data.clan);
      }
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Error fetching clan:", e);
    }
  };

  const fetchBranches = async (t?: number) => {
    try {
      const ts = t || Date.now();
      const res = await fetch(`/api/branches?_t=${ts}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.branches) {
        setBranches(data.branches);
      }
    } catch (e) {
      console.error("Error fetching branches:", e);
    }
  };

  const fetchMembersList = async (t?: number) => {
    try {
      const ts = t || Date.now();
      const res = await fetch(`/api/members?_t=${ts}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      const data = await res.json();
      if (data.members) {
        // Hợp nhất dữ liệu server với các chỉnh sửa và xóa đã lưu ở localStorage
        const merged = mergeServerWithLocal(data.members);
        setAllMembers(merged);
      }
    } catch (e) {
      console.error("Error fetching members:", e);
      // Fallback về dữ liệu cục bộ nếu server gặp lỗi
      const local = getLocalMembers();
      if (local && local.length > 0) {
        setAllMembers(local);
      }
    }
  };

  const fetchPendingCount = async (t?: number) => {
    try {
      const ts = t || Date.now();
      const [resM, resR] = await Promise.all([
        fetch(`/api/members?status=pending&_t=${ts}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
        fetch(`/api/change-requests?_t=${ts}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        }),
      ]);
      const dataM = await resM.json();
      const dataR = await resR.json();
      const pM = (dataM.members || []).length;
      const pR = (dataR.requests || []).filter((r: any) => r.status === "PENDING").length;
      setPendingCount(pM + pR);
    } catch (e) {
      console.error("Error fetching pending count:", e);
    }
  };

  // Handle invite links on mount: ?invite=<token>
  useEffect(() => {
    // 1. Tải ngay lập tức dữ liệu thành viên đã lưu từ localStorage để không bị trễ hoặc load lại từ đầu
    const local = getLocalMembers();
    if (local && local.length > 0) {
      setAllMembers(local);
    }

    // 2. Tải dữ liệu server nền
    fetchClanData();
    fetchBranches();
    fetchMembersList();
    fetchPendingCount();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("invite");
      if (token) {
        fetch(`/api/invites?token=${token}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.invite) {
              setCurrentUser({
                id: `invited-${token.slice(0, 8)}`,
                email: "thanhvien@giaphaviet.vn",
                name: "Thành viên dòng họ",
                role: data.invite.role || "MEMBER",
              });
              showToast("Chào mừng bạn đã tham gia Gia phả dòng họ qua liên kết mời!");
            }
          })
          .catch(console.error);
      }
    }
  }, []);

  // Quick switch role
  const handleSwitchRole = (role: "ADMIN" | "GUEST") => {
    if (role === "ADMIN") {
      setCurrentUser(DEFAULT_ADMIN);
    } else {
      setCurrentUser(DEFAULT_GUEST);
      if (activeTab === "admin") {
        setActiveTab("tree");
      }
    }
  };

  // Delete member
  const handleDeleteMember = async (id: string, name: string) => {
    if (!isAdmin) {
      showToast("Chỉ Quản trị viên mới có quyền xóa hồ sơ.");
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ của "${name}" không?`)) {
      return;
    }

    try {
      // 1. Ghi nhận xóa vĩnh viễn vào localStorage để không bao giờ bị load lại từ đầu
      recordLocalMemberDeleted(id);
      setSelectedMember(null);
      setLatestSavedMember(null);
      setAllMembers((prev) => prev.filter((m) => m.id !== id));

      // 2. Đồng bộ lệnh xóa lên API server / Supabase
      const res = await fetch(`/api/members?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      showToast(data.message || "Đã xóa hồ sơ thành viên thành công.");
      refreshAllData();
    } catch (err: any) {
      console.warn("Delete request warning:", err);
      showToast("Đã xóa hồ sơ thành viên khỏi gia phả.");
      refreshAllData();
    }
  };

  // Submit Propose Change
  const handleProposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposeRequesterName.trim() || !proposeReason.trim() || !proposeEvidence.trim()) {
      alert("Vui lòng điền đủ họ tên, lý do và nguồn tư liệu minh chứng.");
      return;
    }
    setProposeSubmitting(true);
    setProposeMsg(null);

    try {
      const res = await fetch("/api/change-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberId: proposingMember?.id,
          requesterName: proposeRequesterName,
          requesterEmail: proposeRequesterEmail,
          changeType: "UPDATE_PROFILE",
          proposedData: proposeData || `Cập nhật thông tin cho ${proposingMember?.fullName}`,
          reason: proposeReason,
          evidenceSource: proposeEvidence,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể gửi đề xuất.");

      fetchPendingCount();
      showToast("Yêu cầu của bạn đã được gửi tới Quản trị viên và đang chờ duyệt.");
      setTimeout(() => {
        setShowProposeModal(false);
        setProposeMsg(null);
      }, 1500);
    } catch (err: any) {
      alert(err.message || "Lỗi khi gửi đề xuất.");
    } finally {
      setProposeSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1E5F52] text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-[#E0A926] flex items-center space-x-3 animate-fade-in max-w-md w-11/12 sm:w-auto">
          <CheckCircle2 className="w-5 h-5 text-[#FADB7F] shrink-0" />
          <span className="font-semibold text-xs sm:text-sm font-serif">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/70 hover:text-white p-0.5 rounded-full hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Role Switcher Notice Bar with Lotus Accent */}
      <div
        className={`px-4 py-2 border-b text-xs flex flex-wrap items-center justify-between gap-3 shadow-2xs transition-colors ${
          isAdmin
            ? "bg-[#FEF3C7]/90 border-[#E0A926]/40 text-[#78350F]"
            : "bg-[#FDFBF7] border-[#E8DEC7] text-stone-700"
        }`}
      >
        <div className="max-w-7xl mx-auto w-full flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isAdmin ? "bg-[#1E5F52] animate-ping" : "bg-[#F06292]"
              }`}
            ></span>
            <span className="font-semibold text-stone-900">
              {isAdmin ? "Đang ở chế độ Quản Trị Viên (Admin):" : "Đang ở chế độ Khách / Thành Viên:"}
            </span>
            <span className="font-medium text-stone-600">
              {isAdmin
                ? "Toàn quyền thêm/sửa/xóa trực tiếp, tạo liên kết mời và phê duyệt thành viên mới."
                : "Xem sơ đồ trực hệ, đóng góp thành viên mới (yêu cầu chờ Admin duyệt)."}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-stone-500 hidden sm:inline">
              Chuyển nhanh giao diện:
            </span>
            <button
              type="button"
              onClick={() => handleSwitchRole(isAdmin ? "GUEST" : "ADMIN")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 ${
                isAdmin
                  ? "bg-white text-stone-700 hover:bg-stone-100 border border-amber-300"
                  : "bg-[#1E5F52] text-white hover:bg-[#16483E] border border-[#E0A926]/40"
              }`}
            >
              {isAdmin ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-stone-600" />
                  <span>Chuyển sang Giao diện Khách</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FADB7F]" />
                  <span>Chuyển sang Giao diện Admin</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenCreateClan={() => setShowCreateClanModal(true)}
        onOpenCreateBranch={() => setActiveTab("admin")}
        onOpenAddMember={() => {
          setEditingMember(null);
          setShowMemberFormModal(true);
        }}
        onOpenInvite={() => setShowInviteModal(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenAnniversaries={() => setShowAnniversariesModal(true)}
        onFocusMember={(memberId) => {
          setFocusedMemberId(memberId);
          setActiveTab("tree");
        }}
        allMembers={allMembers}
        pendingCount={pendingCount}
        clanName={clan?.name || "Gia phả dòng họ"}
      />

      {/* Main Content Area (Focused on Tree Diagram, Member List, and Admin Approval Dashboard) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* TAB 1: Cây gia phả trực hệ (Family Tree) */}
        {activeTab === "tree" && (
          <div className="space-y-4">
            <FamilyTreeCanvas
              onSelectMember={(m) => {
                setSelectedMember(m);
              }}
              onOpenAddMember={() => {
                setEditingMember(null);
                setShowMemberFormModal(true);
              }}
              onOpenKinshipForMember={(memberId) => {
                setKinshipPreselectedA(memberId);
                setKinshipPreselectedB(undefined);
                setShowKinshipModal(true);
              }}
              onOpenKinshipForTwo={(memberAId, memberBId) => {
                setKinshipPreselectedA(memberAId);
                setKinshipPreselectedB(memberBId);
                setShowKinshipModal(true);
              }}
              onOpenCreateClan={() => setShowCreateClanModal(true)}
              focusedMemberId={focusedMemberId}
              isAdmin={isAdmin}
              clanName={clan?.name || "Gia phả dòng họ"}
              refreshKey={treeRefreshKey}
              latestSavedMember={latestSavedMember}
            />
          </div>
        )}

        {/* TAB 2: Danh sách thành viên (Members) */}
        {activeTab === "members" && (
          <MemberListView
            onSelectMember={(m) => setSelectedMember(m)}
            onEditMember={(m) => {
              setEditingMember(m);
              setShowMemberFormModal(true);
            }}
            onDeleteMember={handleDeleteMember}
            onOpenAddMember={() => {
              setEditingMember(null);
              setShowMemberFormModal(true);
            }}
            onKinshipSearch={(memberId) => {
              setKinshipPreselectedA(memberId);
              setShowKinshipModal(true);
            }}
            isAdmin={isAdmin}
            branches={branches}
            refreshKey={treeRefreshKey}
          />
        )}

        {/* TAB 3: Bảng kiểm duyệt & Quản trị (Admin only) */}
        {activeTab === "admin" && isAdmin && (
          <AdminView
            onNavigateTab={setActiveTab}
            onOpenCreateBranch={() => setActiveTab("admin")}
            onOpenAddMember={() => {
              setEditingMember(null);
              setShowMemberFormModal(true);
            }}
            onMemberApproved={refreshAllData}
          />
        )}
      </main>

      {/* Footer: Lotus Flower and Gentle Waves */}
      <LotusFooter />

      {/* MODALS & DRAWERS */}
      {/* 1. Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setShowLoginModal(false);
          fetchPendingCount();
          showToast(`Đăng nhập thành công với vai trò ${user.role}!`);
        }}
      />

      {/* 2. Create Clan Modal (Admin Only) */}
      {isAdmin && (
        <CreateClanModal
          isOpen={showCreateClanModal}
          onClose={() => setShowCreateClanModal(false)}
          onSuccess={(newClan) => {
            setClan(newClan);
            fetchClanData();
            setShowCreateClanModal(false);
            showToast("Đã khởi tạo Gia phả dòng họ mới thành công!");
          }}
        />
      )}

      {/* 3. Invite Modal (Admin Only) */}
      {isAdmin && (
        <InviteModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          clanName={clan?.name || "Gia phả dòng họ"}
          adminEmail={currentUser.email}
        />
      )}

      {/* 4. Member Detail Drawer */}
      <MemberDetailDrawer
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        isAdmin={isAdmin}
        onEdit={(m) => {
          setEditingMember(m);
          setSelectedMember(null);
          setShowMemberFormModal(true);
        }}
        onDelete={(id, name) => {
          handleDeleteMember(id, name);
        }}
        onKinshipSearch={(memberId) => {
          setKinshipPreselectedA(memberId);
          setShowKinshipModal(true);
        }}
        onProposeChange={(m) => {
          setProposingMember(m);
          setProposeRequesterName("");
          setProposeRequesterEmail("");
          setProposeReason("");
          setProposeEvidence("");
          setProposeData(JSON.stringify(m, null, 2));
          setShowProposeModal(true);
        }}
        onSelectMember={(m) => {
          setSelectedMember(m);
          setFocusedMemberId(m.id);
        }}
      />

      {/* 5. Member Add/Edit Form Modal */}
      <MemberFormModal
        isOpen={showMemberFormModal}
        onClose={() => {
          setShowMemberFormModal(false);
          setEditingMember(null);
        }}
        onSuccess={(msg, savedMember) => {
          setShowMemberFormModal(false);
          setEditingMember(null);
          if (savedMember) {
            // Lưu vĩnh viễn vào localStorage để không bao giờ bị load lại từ đầu
            recordLocalMemberSaved(savedMember);
            setLatestSavedMember(savedMember);
            setAllMembers((prev) => {
              const idx = prev.findIndex((m) => m.id === savedMember.id);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...next[idx], ...savedMember };
                return next;
              }
              return [savedMember, ...prev];
            });
          }
          refreshAllData();
          showToast(msg || "Đã lưu và cập nhật hồ sơ thành viên thành công!");
        }}
        editingMember={editingMember}
        branches={branches}
        allMembers={allMembers}
        isAdmin={isAdmin}
      />

      {/* 6. Kinship Calculator Modal */}
      <KinshipCalculatorModal
        isOpen={showKinshipModal}
        onClose={() => {
          setShowKinshipModal(false);
          setKinshipPreselectedA(undefined);
          setKinshipPreselectedB(undefined);
        }}
        preselectedAId={kinshipPreselectedA}
        preselectedBId={kinshipPreselectedB}
      />

      {/* 7. History Modal */}
      <HistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        clan={clan}
      />

      {/* 8. Anniversaries & Events Modal */}
      <AnniversariesModal
        isOpen={showAnniversariesModal}
        onClose={() => setShowAnniversariesModal(false)}
        isAdmin={isAdmin}
        onOpenAddMember={() => {
          setEditingMember(null);
          setShowMemberFormModal(true);
        }}
      />

      {/* 7. Guest Propose Change Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-[#C59B27]/40 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#8B1E1E] to-[#681313] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-amber-300" />
                <h2 className="text-base font-bold font-serif text-amber-200">
                  Đề Xuất Chỉnh Sửa Thông Tin Gia Phả
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProposeModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProposeSubmit} className="p-6 space-y-4">
              {proposeMsg && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{proposeMsg}</span>
                </div>
              )}

              <p className="text-xs text-stone-600">
                Bạn đang đề xuất cập nhật cho thành viên:{" "}
                <strong className="text-[#8B1E1E]">{proposingMember?.fullName}</strong>. Mọi đề xuất cần cung cấp nguồn tư liệu minh chứng để Ban Quản Trị thẩm định.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Họ và tên người gửi đề xuất *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phan Quốc Bảo"
                  value={proposeRequesterName}
                  onChange={(e) => setProposeRequesterName(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#8B1E1E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email / Số điện thoại liên hệ
                </label>
                <input
                  type="text"
                  placeholder="email@example.com hoặc SĐT"
                  value={proposeRequesterEmail}
                  onChange={(e) => setProposeRequesterEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#8B1E1E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Lý do đề xuất thay đổi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Bổ sung ngày mất âm lịch, sửa tên chữ húy..."
                  value={proposeReason}
                  onChange={(e) => setProposeReason(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#8B1E1E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nguồn tư liệu minh chứng *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Theo bản gia phả chép tay của dòng họ..."
                  value={proposeEvidence}
                  onChange={(e) => setProposeEvidence(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#8B1E1E] focus:outline-hidden"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={proposeSubmitting}
                  className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg text-xs font-bold hover:bg-[#721515] transition-all disabled:opacity-50"
                >
                  {proposeSubmitting ? "Đang gửi..." : "Gửi đề xuất xác minh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
