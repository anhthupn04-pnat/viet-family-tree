"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import LandingHeroView from "@/components/LandingHeroView";
import FamilyTreeCanvas from "@/components/FamilyTreeCanvas";
import MemberListView from "@/components/MemberListView";
import AdminView from "@/components/AdminView";
import MemberDetailDrawer from "@/components/MemberDetailDrawer";
import MemberFormModal, { QuickContext } from "@/components/MemberFormModal";
import LoginModal from "@/components/LoginModal";
import KinshipCalculatorModal from "@/components/KinshipCalculatorModal";
import QuickImportModal from "@/components/QuickImportModal";
import DigitalLibraryModal from "@/components/DigitalLibraryModal";
import AnniversariesView from "@/components/AnniversariesView";
import LotusFooter from "@/components/LotusFooter";
import { Member } from "@/types/family";
import { FamilyStoreProvider, useFamilyStore } from "@/lib/family-store";
import { CheckCircle2, X, Compass, Sparkles, Eye } from "lucide-react";

function HomePageContent() {
  const { members, isAdmin, activeTree, bulkImportMembers } = useFamilyStore();
  
  // Active Tab defaults to "home" as requested by the user
  const [activeTab, setActiveTab] = useState<string>("home");

  // Elderly Mode state
  const [isElderlyMode, setIsElderlyMode] = useState<boolean>(false);

  // Selection & Focus
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [focusedMemberId, setFocusedMemberId] = useState<string | null>(null);

  // Form Modal States
  const [showMemberFormModal, setShowMemberFormModal] = useState(false);
  const [showQuickImportModal, setShowQuickImportModal] = useState(false);
  const [showDigitalLibraryModal, setShowDigitalLibraryModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [quickContext, setQuickContext] = useState<QuickContext | null>(null);

  // Other Modals
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showKinshipModal, setShowKinshipModal] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Quick Action Handlers
  const handleSelectMember = (m: Member) => {
    setSelectedMember(m);
    setFocusedMemberId(m.id);
  };

  const handleEditMember = (m: Member) => {
    setEditingMember(m);
    setQuickContext(null);
    setShowMemberFormModal(true);
  };

  const handleQuickAddChild = (parent: Member) => {
    setEditingMember(null);
    setQuickContext({ type: "child", targetMember: parent });
    setShowMemberFormModal(true);
  };

  const handleQuickAddSpouse = (spouse: Member) => {
    setEditingMember(null);
    setQuickContext({ type: "spouse", targetMember: spouse });
    setShowMemberFormModal(true);
  };

  const handleOpenAddMember = () => {
    setEditingMember(null);
    setQuickContext(null);
    setShowMemberFormModal(true);
  };

  return (
    <div
      className={`min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-[#500C13] selection:text-amber-100 ${
        isElderlyMode ? "font-sans text-lg tracking-wide" : ""
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 border border-amber-600/30 animate-in fade-in slide-in-from-bottom-2 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium leading-relaxed">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Elderly Mode Indicator Banner (when active) */}
      {isElderlyMode && (
        <div className="bg-amber-100 border-b border-amber-300 text-amber-950 px-4 py-1.5 text-xs sm:text-sm text-center font-bold flex items-center justify-center gap-2">
          <Eye className="w-4 h-4 text-amber-700" />
          <span>Chế độ Người Cao Tuổi đang BẬT: Cỡ chữ lớn, giao diện đơn giản, tương phản cao.</span>
          <button
            type="button"
            onClick={() => setIsElderlyMode(false)}
            className="underline ml-2 text-amber-800 hover:text-amber-950 cursor-pointer text-xs"
          >
            Tắt
          </button>
        </div>
      )}

      {/* Cultural Heritage Header (as seen in the design image) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenAddMember={handleOpenAddMember}
        onOpenQuickImport={() => setShowQuickImportModal(true)}
        onOpenDigitalLibrary={() => setShowDigitalLibraryModal(true)}
        onOpenKinship={() => setShowKinshipModal(true)}
        onFocusMember={(id) => {
          setFocusedMemberId(id);
        }}
        isElderlyMode={isElderlyMode}
        onToggleElderlyMode={() => setIsElderlyMode(!isElderlyMode)}
      />

      {/* Tab Contents */}
      <main className="flex-1 w-full">
        {/* TAB 0: Trang Chủ (Landing Hero & 4 Tính Năng Nổi Bật) */}
        {activeTab === "home" && (
          <LandingHeroView
            onNavigateTab={setActiveTab}
            onOpenAddMember={handleOpenAddMember}
            onOpenDigitalLibrary={() => setShowDigitalLibraryModal(true)}
            onOpenKinship={() => setShowKinshipModal(true)}
            onOpenLogin={() => setShowLoginModal(true)}
            isElderlyMode={isElderlyMode}
          />
        )}

        {/* TAB 1: Sơ đồ Cây Phả Hệ (Tree View) */}
        {activeTab === "tree" && (
          <div className="w-full">
            <FamilyTreeCanvas
              onSelectMember={handleSelectMember}
              onQuickAddChild={handleQuickAddChild}
              onQuickAddSpouse={handleQuickAddSpouse}
              onEditMember={handleEditMember}
              onOpenAddMember={handleOpenAddMember}
              onOpenQuickImport={() => setShowQuickImportModal(true)}
              focusedMemberId={focusedMemberId}
            />
          </div>
        )}

        {/* TAB 2: Danh sách thành viên (Table View) */}
        {activeTab === "members" && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <MemberListView
              onSelectMember={handleSelectMember}
              onEditMember={handleEditMember}
              onAddChild={handleQuickAddChild}
              onOpenAddMember={handleOpenAddMember}
            />
          </div>
        )}

        {/* TAB 3: Lịch Lễ Giỗ & Sự Kiện */}
        {activeTab === "anniversaries" && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <AnniversariesView isAdmin={isAdmin} />
          </div>
        )}

        {/* TAB 4: Tra Cứu Xưng Hô */}
        {activeTab === "kinship" && (
          <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-[#500C13]">
                <Compass className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">
                Tra Cứu Quan Hệ Xưng Hô Dòng Họ
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mb-6">
                Chọn 2 người bất kỳ trên cây gia phả để hệ thống thuật toán tự
                động tìm tổ tiên chung gần nhất (LCA) và xác định cách xưng hô
                chuẩn văn hóa Việt Nam.
              </p>
              <button
                type="button"
                onClick={() => setShowKinshipModal(true)}
                className="px-6 py-3 bg-[#500C13] hover:bg-[#68131C] text-amber-100 font-bold text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 cursor-pointer inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Mở Bảng Tra Cứu Xưng Hô</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: Bảng kiểm duyệt & Quản trị (Admin only) */}
        {activeTab === "admin" && isAdmin && (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <AdminView
              onNavigateTab={setActiveTab}
              onOpenAddMember={handleOpenAddMember}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <LotusFooter />

      {/* MODALS & DRAWERS */}
      {/* 1. Member Detail Drawer */}
      <MemberDetailDrawer
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={(m) => {
          setSelectedMember(null);
          handleEditMember(m);
        }}
        onAddChild={(parent) => {
          setSelectedMember(null);
          handleQuickAddChild(parent);
        }}
        onAddSpouse={(spouse) => {
          setSelectedMember(null);
          handleQuickAddSpouse(spouse);
        }}
        onShowToast={showToast}
      />

      {/* 2. Member Add/Edit Form Modal */}
      <MemberFormModal
        isOpen={showMemberFormModal}
        onClose={() => {
          setShowMemberFormModal(false);
          setEditingMember(null);
          setQuickContext(null);
        }}
        editingMember={editingMember}
        quickContext={quickContext}
        onShowToast={showToast}
        onSuccess={(savedId) => {
          setActiveTab("tree");
          setSelectedMember(null);
          if (savedId) {
            setFocusedMemberId(savedId);
          }
        }}
      />

      {/* 3. Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          showToast(`Đăng nhập thành công! Chào mừng Quản Trị Viên.`);
        }}
      />

      {/* 4. Quick Import Modal */}
      <QuickImportModal
        isOpen={showQuickImportModal}
        onClose={() => setShowQuickImportModal(false)}
        currentMembers={members}
        treeName={activeTree?.name}
        treeId={activeTree?.id}
        onImportSuccess={(newMembers, stats) => {
          bulkImportMembers(newMembers, stats);
          showToast(
            `Đã nhập thành công ${stats.createdCount} thành viên mới, cập nhật ${stats.updatedCount} người vào ${activeTree?.name}!`
          );
        }}
      />

      {/* 5. Kinship Calculator Modal */}
      <KinshipCalculatorModal
        isOpen={showKinshipModal}
        onClose={() => setShowKinshipModal(false)}
        preselectedAId={selectedMember?.id}
      />

      {/* 6. Digital Library Modal (Thư viện số & di sản cổ truyền) */}
      <DigitalLibraryModal
        isOpen={showDigitalLibraryModal}
        onClose={() => setShowDigitalLibraryModal(false)}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <FamilyStoreProvider>
      <HomePageContent />
    </FamilyStoreProvider>
  );
}
