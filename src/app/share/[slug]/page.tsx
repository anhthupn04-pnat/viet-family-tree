"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Search,
  Maximize2,
  Columns,
  Rows,
  HeartHandshake,
  Calendar,
  Compass,
  ArrowLeft,
  Sparkles,
  Users,
  MapPin,
  Check,
  AlertCircle,
  Copy,
  Info,
  Home,
} from "lucide-react";
import { Member, Tree, SuggestionType } from "@/types/family";
import FamilyNode from "@/components/tree/FamilyNode";
import OrthogonalBloodlineEdge from "@/components/tree/OrthogonalBloodlineEdge";
import { computeFamilyTreeLayout } from "@/components/tree/treeLayout";
import MemberDetailDrawer from "@/components/MemberDetailDrawer";
import KinshipCalculatorModal from "@/components/KinshipCalculatorModal";
import CrowdsourceModal from "@/components/CrowdsourceModal";
import AnniversariesModal from "@/components/AnniversariesModal";
import { FamilyStoreProvider } from "@/lib/family-store";

const nodeTypes = {
  familyNode: FamilyNode,
};

const edgeTypes = {
  orthogonalBloodline: OrthogonalBloodlineEdge,
};

function PublicShareTreeContent() {
  const params = useParams();
  const slugParam = params?.slug as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tree & Members Data
  const [tree, setTree] = useState<Tree | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  // Passcode Protection States
  const [requirePassword, setRequirePassword] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [isVerifyingPasscode, setIsVerifyingPasscode] = useState(false);
  const [showPasscodeText, setShowPasscodeText] = useState(false);

  // Orientation & Search
  const [orientation, setOrientation] = useState<"vertical" | "horizontal">("vertical");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [focusedMemberId, setFocusedMemberId] = useState<string | null>(null);

  // Modals
  const [showKinshipModal, setShowKinshipModal] = useState(false);
  const [showAnniversariesModal, setShowAnniversariesModal] = useState(false);
  const [showCrowdsourceModal, setShowCrowdsourceModal] = useState(false);
  const [crowdsourceTarget, setCrowdsourceTarget] = useState<Member | null>(null);
  const [crowdsourceType, setCrowdsourceType] = useState<SuggestionType>("ADD_CHILD");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch Public Tree Data
  const fetchPublicTree = useCallback(async (tokenOrPasscode?: string) => {
    if (!slugParam) return;
    setLoading(true);
    setError(null);
    setPasscodeError(null);

    try {
      const headers: Record<string, string> = {};
      if (tokenOrPasscode) {
        headers["x-share-passcode"] = tokenOrPasscode;
      }

      const res = await fetch(`/api/public/trees/${encodeURIComponent(slugParam)}`, {
        headers,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Không thể tải cây gia phả công khai.");
        setLoading(false);
        return;
      }

      if (data.requirePassword) {
        setRequirePassword(true);
        setTree(data.tree);
        setLoading(false);
        return;
      }

      setRequirePassword(false);
      setTree(data.tree);
      setMembers(data.members || []);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối máy chủ.");
      setLoading(false);
    }
  }, [slugParam]);

  useEffect(() => {
    fetchPublicTree();
  }, [fetchPublicTree]);

  // Handle Verify Passcode
  const handleVerifyPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setPasscodeError("Vui lòng nhập mật khẩu truy cập.");
      return;
    }

    setIsVerifyingPasscode(true);
    setPasscodeError(null);

    try {
      const res = await fetch(`/api/public/trees/${encodeURIComponent(slugParam)}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passcode.trim() }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPasscodeError(data.error || "Mật khẩu truy cập không chính xác.");
        setIsVerifyingPasscode(false);
        return;
      }

      // Password verified -> load full tree data
      await fetchPublicTree(passcode.trim());
      setIsVerifyingPasscode(false);
    } catch (err: any) {
      setPasscodeError(err.message || "Lỗi khi xác thực mật khẩu.");
      setIsVerifyingPasscode(false);
    }
  };

  // Calculate layout (Supports both vertical and horizontal view)
  const { nodes: layoutNodes, edges: layoutEdges } = useMemo(() => {
    if (members.length === 0) return { nodes: [], edges: [] };
    return computeFamilyTreeLayout(members, {
      onSelectMember: (m) => {
        setSelectedMember(m);
        setFocusedMemberId(m.id);
      },
      onQuickAddChild: () => {},
      onQuickAddSpouse: () => {},
      onEditMember: () => {},
      focusedMemberId,
      orientation,
    });
  }, [members, focusedMemberId, orientation]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutEdges);

  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(layoutEdges);
  }, [layoutNodes, layoutEdges, setNodes, setEdges]);

  // Search filtered results (Tìm theo họ tên, năm sinh, chi/phái, đời thứ mấy)
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const q = searchTerm.toLowerCase().trim();
    return members.filter((m) => {
      const nameMatch = m.fullName.toLowerCase().includes(q);
      const nickMatch = m.nickname ? m.nickname.toLowerCase().includes(q) : false;
      const dateMatch =
        (m.birthDate && m.birthDate.includes(q)) ||
        (m.deathDate && m.deathDate.includes(q));
      const addressMatch = m.address ? m.address.toLowerCase().includes(q) : false;
      const genMatch =
        `đời ${m.generation}`.includes(q) ||
        `đời thứ ${m.generation}`.includes(q) ||
        `thế hệ ${m.generation}`.includes(q) ||
        (q.startsWith("đời ") && String(m.generation) === q.replace("đời ", "").trim());
      const branchMatch =
        m.branch ? `chi ${m.branch}`.toLowerCase().includes(q) || m.branch.toLowerCase().includes(q) : false;

      return nameMatch || nickMatch || dateMatch || addressMatch || genMatch || branchMatch;
    });
  }, [members, searchTerm]);

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-semibold text-slate-300 tracking-wide">
          Đang nạp dữ liệu cây phả hệ công khai...
        </p>
      </div>
    );
  }

  // Passcode Protection Prompt
  if (requirePassword) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-800">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-6 bg-slate-950 text-white text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center mx-auto mb-3 shadow-md">
              <Lock className="w-6 h-6 text-slate-950" />
            </div>
            <h2 className="text-lg font-bold">Cây Gia Phả Có Mật Khẩu Bảo Vệ</h2>
            <p className="text-xs text-slate-400 mt-1">
              {tree?.name || "Gia Phả Dòng Họ"}
            </p>
          </div>

          <form onSubmit={handleVerifyPasscode} className="p-6 space-y-4 text-xs">
            {passcodeError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passcodeError}</span>
              </div>
            )}

            <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              Dòng tộc này giới hạn quyền xem nội bộ. Vui lòng nhập <strong>mật khẩu truy cập</strong> do Ban Trị Sự cung cấp để mở sơ đồ phả hệ.
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Mật khẩu xem phả hệ</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPasscodeText ? "text" : "password"}
                  required
                  placeholder="Nhập mã truy cập..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscodeText(!showPasscodeText)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPasscodeText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifyingPasscode}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60 transition-all active:scale-98"
            >
              <Unlock className="w-4 h-4" />
              <span>{isVerifyingPasscode ? "Đang xác thực..." : "Mở Khóa Xem Phả Hệ"}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Error Screen
  if (error || !tree) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center space-y-5 backdrop-blur-md">
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Đường Dẫn Không Khả Dụng
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {error ||
                "Cây gia phả này không tồn tại hoặc liên kết chia sẻ đã hết hạn/bị thay đổi."}
            </p>
            <p className="text-[11px] text-slate-400">
              Quý khách vui lòng quay về Cổng Trang Chủ Gia Phả Chung để tra cứu thông tin dòng họ hoặc chọn cây phả hệ khác.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Quay Về Trang Chủ Gia Phả</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-800 select-none overflow-hidden h-screen">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-70 bg-slate-950 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-slate-950 text-white border-b border-slate-800 px-4 py-3 shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Quay lại trang chính"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white leading-tight">
                {tree.name}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Công khai
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
              {tree.originLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  <span>{tree.originLocation}</span>
                </span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <Users className="w-3 h-3 text-blue-400" />
                <span>{members.length} nhân khẩu</span>
              </span>
            </p>
          </div>
        </div>

        {/* Action Tools & Privacy Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Privacy Indicator Badge */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-medium"
            title="Số điện thoại và địa chỉ cụ thể của người còn sống được tự động làm mờ để bảo vệ dữ liệu cá nhân"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Quyền riêng tư kích hoạt</span>
          </div>

          <button
            type="button"
            onClick={() => setShowKinshipModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Xưng Hô</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAnniversariesModal(true)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Lịch Giỗ</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCrowdsourceTarget(null);
              setCrowdsourceType("ADD_CHILD");
              setShowCrowdsourceModal(true);
            }}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Đóng Góp Phả Hệ</span>
          </button>
        </div>
      </header>

      {/* Sub-toolbar: Search & Orientation controls */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm thành viên theo tên, năm sinh..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
          {searchTerm && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-56 overflow-y-auto z-40 divide-y divide-slate-100">
              {searchResults.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    setSelectedMember(m);
                    setFocusedMemberId(m.id);
                    setSearchTerm("");
                  }}
                  className="p-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900">{m.fullName}</span>
                    <span className="text-slate-400 text-[10px] ml-2">Đời {m.generation}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{m.birthDate || ""}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Orientation Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setOrientation("vertical")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                orientation === "vertical"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Sắp xếp dạng cây dọc (Truyền thống)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Dọc</span>
            </button>
            <button
              type="button"
              onClick={() => setOrientation("horizontal")}
              className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                orientation === "horizontal"
                  ? "bg-white text-blue-600 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Sắp xếp dạng ngang (Phát triển sang phải)"
            >
              <Rows className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px]">Ngang</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Flow Canvas */}
      <div className="flex-1 w-full h-full relative bg-lotus-watermark">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-slate-400 shadow-xl">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div className="max-w-md space-y-1.5">
              <h3 className="text-base font-bold text-white">Chưa có thành viên nào trong cây gia phả</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cây gia phả này hiện đang ở giai đoạn khởi tạo. Bạn có thể gửi thông tin đề xuất đóng góp thành viên đầu tiên để Ban Quản Trị xem xét.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCrowdsourceTarget(null);
                setCrowdsourceType("ADD_CHILD");
                setShowCrowdsourceModal(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Gửi Đóng Góp Thành Viên Đầu Tiên</span>
            </button>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.15}
            maxZoom={2.0}
            nodesDraggable={false} // Strict Read-only: Không cho kéo node
            nodesConnectable={false}
            elementsSelectable={true}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#cbd5e1" gap={20} size={1} variant={BackgroundVariant.Dots} />
            <Controls position="bottom-right" className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden m-4" />
          </ReactFlow>
        )}

        {/* Privacy Note Overlay Pill */}
        {members.length > 0 && (
          <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur-xs text-white px-3 py-1.5 rounded-full text-[10px] font-medium border border-slate-700/80 shadow-md hidden sm:flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Bảo vệ quyền riêng tư: SĐT người còn sống đã được làm mờ</span>
          </div>
        )}
      </div>

      {/* Drawer Xem Chi Tiết (Read-Only & Crowdsourcing) */}
      <MemberDetailDrawer
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={() => {}} // Disabled for read-only
        onAddChild={() => {}}
        onAddSpouse={() => {}}
        onShowToast={showToast}
      />

      {/* Modal Xưng Hô Họ Hàng */}
      <KinshipCalculatorModal
        isOpen={showKinshipModal}
        onClose={() => setShowKinshipModal(false)}
        members={members}
      />

      {/* Modal Lịch Giỗ Kỵ Nhật */}
      <AnniversariesModal
        isOpen={showAnniversariesModal}
        onClose={() => setShowAnniversariesModal(false)}
        isAdmin={false}
      />

      {/* Modal Đóng Góp Phả Hệ */}
      <CrowdsourceModal
        isOpen={showCrowdsourceModal}
        onClose={() => setShowCrowdsourceModal(false)}
        targetMember={crowdsourceTarget}
        treeId={tree.id}
        defaultType={crowdsourceType}
        onSuccessToast={showToast}
      />
    </div>
  );
}

export default function PublicShareTreePage() {
  return (
    <FamilyStoreProvider>
      <PublicShareTreeContent />
    </FamilyStoreProvider>
  );
}
