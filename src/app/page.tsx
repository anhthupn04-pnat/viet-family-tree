"use client";

import React, { useState, useEffect } from "react";
import Header from "@/components/Header";
import OverviewView from "@/components/OverviewView";
import FamilyTreeCanvas from "@/components/FamilyTreeCanvas";
import MemberListView from "@/components/MemberListView";
import BranchManagementView from "@/components/BranchManagementView";
import AnniversariesView from "@/components/AnniversariesView";
import FundsView from "@/components/FundsView";
import DocumentsView from "@/components/DocumentsView";
import AdminView from "@/components/AdminView";
import MemberDetailDrawer from "@/components/MemberDetailDrawer";
import MemberFormModal from "@/components/MemberFormModal";
import LoginModal from "@/components/LoginModal";
import CreateClanModal from "@/components/CreateClanModal";
import KinshipCalculatorModal from "@/components/KinshipCalculatorModal";
import LotusFooter from "@/components/LotusFooter";
import {
  ShieldCheck,
  Eye,
  Sliders,
  Users,
  Compass,
  ArrowRightLeft,
  Sparkles,
  CheckCircle2,
  X,
  FileCheck2,
  Flower2,
} from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<string>("overview");

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

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreateClanModal, setShowCreateClanModal] = useState(false);
  const [showMemberFormModal, setShowMemberFormModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [showKinshipModal, setShowKinshipModal] = useState(false);
  const [kinshipPreselectedA, setKinshipPreselectedA] = useState<string | undefined>();
  const [kinshipPreselectedB, setKinshipPreselectedB] = useState<string | undefined>();

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

  // Fetch initial clan data & branches
  const fetchClanData = async () => {
    try {
      const res = await fetch("/api/clans");
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

  const fetchBranches = async () => {
    try {
      const res = await fetch("/api/branches");
      const data = await res.json();
      if (data.branches) {
        setBranches(data.branches);
      }
    } catch (e) {
      console.error("Error fetching branches:", e);
    }
  };

  const fetchMembersList = async () => {
    try {
      const res = await fetch("/api/members");
      const data = await res.json();
      if (data.members) {
        setAllMembers(data.members);
      }
    } catch (e) {
      console.error("Error fetching members:", e);
    }
  };

  useEffect(() => {
    fetchClanData();
    fetchBranches();
    fetchMembersList();
  }, []);

  // Quick switch role
  const handleSwitchRole = (role: "ADMIN" | "GUEST") => {
    if (role === "ADMIN") {
      setCurrentUser(DEFAULT_ADMIN);
    } else {
      setCurrentUser(DEFAULT_GUEST);
      if (activeTab === "admin") {
        setActiveTab("overview");
      }
    }
  };

  // Delete member
  const handleDeleteMember = async (id: string, name: string) => {
    if (!isAdmin) {
      alert("Chỉ Quản trị viên mới có quyền xóa hồ sơ.");
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ của "${name}" không?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/members?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể xóa hồ sơ.");
      }
      alert(data.message || "Đã xóa thành công.");
      setSelectedMember(null);
      fetchClanData();
      fetchBranches();
      fetchMembersList();
    } catch (err: any) {
      alert(err.message || "Lỗi khi xóa thành viên.");
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

      setProposeMsg("Đề xuất đã được gửi tới Ban Quản Trị để xác minh thành công!");
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
              {isAdmin ? "Đang ở chế độ Quản Trị Viên (Admin):" : "Đang ở chế độ Khách Thăm Quan:"}
            </span>
            <span className="font-medium text-stone-600">
              {isAdmin
                ? "Toàn quyền tạo chi nhánh (1-4 chi mẫu ban đầu), thêm/sửa/xóa thành viên và thẩm định gia phả."
                : "Xem thông tin gia phả, sơ đồ trực quan, tra cứu xưng hô và gửi đề xuất cập nhật kèm minh chứng."}
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
        onOpenCreateBranch={() => setActiveTab("branches")}
        onOpenAddMember={() => {
          setEditingMember(null);
          setShowMemberFormModal(true);
        }}
        clanName={clan?.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* TAB 1: Trang chủ (Overview) */}
        {activeTab === "overview" && (
          <OverviewView
            stats={stats}
            clan={clan}
            onNavigateTab={setActiveTab}
            isAdmin={isAdmin}
          />
        )}

        {/* TAB 2: Cây gia phả (Family Tree) */}
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
                setShowKinshipModal(true);
              }}
              onOpenCreateClan={() => setShowCreateClanModal(true)}
              isAdmin={isAdmin}
              clanName={clan?.name}
            />
          </div>
        )}

        {/* TAB 3: Danh sách thành viên (Members) */}
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
          />
        )}

        {/* TAB 4: Quản lý Chi họ & Nhánh (Branches) */}
        {activeTab === "branches" && (
          <BranchManagementView
            isAdmin={isAdmin}
            onSelectBranchForTree={(branchId) => setActiveTab("tree")}
          />
        )}

        {/* TAB 5: Tra cứu xưng hô họ hàng (Kinship) */}
        {activeTab === "kinship" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#8B1E1E] to-[#681313] text-white p-6 rounded-3xl shadow-xl border border-[#C59B27]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-200 text-xs px-3 py-1 rounded-full border border-amber-300/30 mb-2">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Chuẩn Mực Xưng Hô Dòng Tộc Việt Nam</span>
                </div>
                <h1 className="text-2xl font-bold font-serif text-amber-100">
                  Tra Cứu Xưng Hô & Bậc Huyết Thống
                </h1>
                <p className="text-xs text-amber-100/70 max-w-2xl mt-1">
                  Thuật toán xác định tổ tiên chung gần nhất (LCA), chênh lệch thế hệ, phân biệt nhánh Nội / Ngoại và cung cấp danh xưng gọi nhau chuẩn xác nhất theo văn hóa Việt.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowKinshipModal(true)}
                className="px-5 py-2.5 bg-[#C59B27] hover:bg-[#B0881F] text-[#24150B] font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 shrink-0"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Mở Công Cụ Tra Cứu Xưng Hô</span>
              </button>
            </div>

            {/* Quick explanation guide cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl border border-[#E8DEC7] p-5 shadow-sm space-y-3">
                <h3 className="font-bold font-serif text-[#8B1E1E] text-sm">
                  1. Quan hệ Trực hệ (Cha Mẹ - Con Cháu)
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Cách nhau 1 đời: Cha/Mẹ ⇄ Con cái.<br />
                  Cách nhau 2 đời: Ông/Bà ⇄ Cháu nội/ngoại.<br />
                  Cách nhau 3 đời: Cụ/Cố ⇄ Chắt.<br />
                  Cách nhau 4 đời: Kỵ ⇄ Chút.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8DEC7] p-5 shadow-sm space-y-3">
                <h3 className="font-bold font-serif text-[#8B1E1E] text-sm">
                  2. Quan hệ Bàng hệ (Anh Chị Em & Con Chú Bác)
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Cùng một tổ phụ: Con của anh cả là anh/chị họ.<br />
                  Nguyên tắc truyền thống: <em>“Bé bằng hạt kê nhưng vai vế bề trên vẫn là Anh/Chú”</em>. Hệ thống tự động tính theo thế thứ chi họ.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-[#E8DEC7] p-5 shadow-sm space-y-3">
                <h3 className="font-bold font-serif text-[#8B1E1E] text-sm">
                  3. Xưng hô Hôn phối & Dâu Rể
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Vợ của Chú gọi là Thím, vợ của Bác gọi là Bác dâu.<br />
                  Chồng của Cô gọi là Chú rể/Dượng.<br />
                  Chồng của Dì gọi là Dượng.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Lịch giỗ & Sự kiện (Anniversaries) */}
        {activeTab === "anniversaries" && <AnniversariesView isAdmin={isAdmin} />}

        {/* TAB 7: Tư liệu cổ & Lịch sử (Documents) */}
        {activeTab === "documents" && <DocumentsView isAdmin={isAdmin} />}

        {/* TAB 8: Quỹ dòng họ & Khuyến học (Funds) */}
        {activeTab === "funds" && <FundsView isAdmin={isAdmin} />}

        {/* TAB 9: Quản trị & Duyệt (Admin only) */}
        {activeTab === "admin" && isAdmin && (
          <AdminView
            onNavigateTab={setActiveTab}
            onOpenCreateBranch={() => setActiveTab("branches")}
            onOpenAddMember={() => {
              setEditingMember(null);
              setShowMemberFormModal(true);
            }}
          />
        )}
      </main>

      {/* Footer: Lively Blooming Pink Lotus & Layered Green Lotus Leaves over Rippling Waves */}
      <LotusFooter />

      {/* MODALS & DRAWERS */}
      {/* 1. Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setShowLoginModal(false);
        }}
      />

      {/* 2. Create Clan Modal */}
      <CreateClanModal
        isOpen={showCreateClanModal}
        onClose={() => setShowCreateClanModal(false)}
        onSuccess={(newClan) => {
          setClan(newClan);
          fetchClanData();
          setShowCreateClanModal(false);
        }}
      />

      {/* 3. Member Detail Drawer */}
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
      />

      {/* 4. Member Add/Edit Form Modal */}
      <MemberFormModal
        isOpen={showMemberFormModal}
        onClose={() => {
          setShowMemberFormModal(false);
          setEditingMember(null);
        }}
        onSuccess={() => {
          setShowMemberFormModal(false);
          setEditingMember(null);
          fetchClanData();
          fetchBranches();
          fetchMembersList();
        }}
        editingMember={editingMember}
        branches={branches}
        allMembers={allMembers}
      />

      {/* 5. Kinship Calculator Modal */}
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

      {/* 6. Guest Propose Change Modal */}
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
                  placeholder="Theo bản gia phả chép tay năm 1972 của Cụ Phan Văn Định..."
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
