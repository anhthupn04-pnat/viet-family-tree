"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Lock,
  Unlock,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  PlusCircle,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
  Printer,
  Download,
} from "lucide-react";

interface MemberNode {
  id: string;
  memberCode: string;
  fullName: string;
  courtesyName?: string | null;
  gender: string;
  generation: number;
  isAlive: boolean;
  birthSolar?: string | null;
  deathSolar?: string | null;
  avatarUrl?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  fatherId?: string | null;
  motherId?: string | null;
  spouses?: any[];
  childrenIds?: string[];
  biography?: string | null;
  burialPlace?: string | null;
  hometown?: string | null;
  currentResidence?: string | null;
  phone?: string | null;
}

interface FamilyTreeCanvasProps {
  onSelectMember: (member: MemberNode) => void;
  onOpenAddMember?: () => void;
  onOpenKinshipForMember?: (memberId: string) => void;
  onOpenCreateClan?: () => void;
  isAdmin: boolean;
  clanName?: string;
}

export default function FamilyTreeCanvas({
  onSelectMember,
  onOpenAddMember,
  onOpenKinshipForMember,
  onOpenCreateClan,
  isAdmin,
  clanName = "Gia Phả Phan Tộc Đại Tông",
}: FamilyTreeCanvasProps) {
  const [members, setMembers] = useState<MemberNode[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [generations, setGenerations] = useState<Record<number, MemberNode[]>>({});
  const [maxGen, setMaxGen] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedGen, setSelectedGen] = useState<string>("ALL");
  const [selectedGender, setSelectedGender] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Canvas zoom & pan state
  const [scale, setScale] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sidebar toggle (as in mô hình.pdf)
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch tree data
  const loadTree = async () => {
    try {
      setLoading(true);
      const url = selectedBranch !== "ALL" ? `/api/tree?branchId=${selectedBranch}` : "/api/tree";
      const [resTree, resBranches] = await Promise.all([
        fetch(url),
        fetch("/api/branches"),
      ]);

      const dataTree = await resTree.json();
      const dataBranches = await resBranches.json();

      if (dataTree.generations) {
        setGenerations(dataTree.generations);
        setMembers(dataTree.members || []);
        setMaxGen(dataTree.maxGeneration || 5);
      }
      if (dataBranches.branches) {
        setBranches(dataBranches.branches);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, [selectedBranch]);

  // Zoom controls
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.4));
  const handleReset = () => {
    setScale(0.9);
    setPan({ x: 40, y: 30 });
  };

  // Mouse drag for canvas pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isLocked) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isLocked) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Search highlighting
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setHighlightedMemberId(null);
      return;
    }
    const found = members.find((m) =>
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
    if (found) {
      setHighlightedMemberId(found.id);
      onSelectMember(found);
    } else {
      alert(`Không tìm thấy thành viên có tên "${searchTerm}"`);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[600px] bg-stone-50 overflow-hidden flex border border-[#E8DEC7] rounded-2xl shadow-traditional">
      {/* 1. Left Collapsible Sidebar (Matching mô hình.pdf) */}
      <div
        className={`bg-white border-r border-[#E8DEC7] transition-all duration-300 z-20 flex flex-col shrink-0 ${
          sidebarOpen ? "w-72" : "w-0"
        } overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#EFE8D8] bg-[#FAF7EE] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-[#8B1E1E]" />
            <h3 className="font-serif font-bold text-sm text-[#8B1E1E]">
              Danh sách gia phả
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-200"
            title="Thu gọn sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Search Gia Phả */}
        <div className="p-3 border-b border-stone-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm kiếm gia phả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
            />
          </div>
        </div>

        {/* Clan cards list */}
        <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
          {/* Main Clan Card */}
          <div className="p-3 rounded-xl border-2 border-[#C59B27] bg-[#FAF7EE]/60 shadow-sm cursor-pointer hover:bg-[#FAF7EE]">
            <div className="flex items-center space-x-1.5 mb-1.5">
              <span className="bg-[#8B1E1E] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                Chính Tông
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-medium px-2 py-0.5 rounded">
                Công khai
              </span>
            </div>
            <h4 className="font-serif font-bold text-xs text-stone-900">
              {clanName}
            </h4>
            <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">
              📍 Nga Sơn, Thanh Hóa, Việt Nam
            </p>
            <p className="text-[10px] text-stone-400 mt-1">
              5 đời • 4 chi họ • {members.length} thành viên
            </p>
          </div>

          {/* 4 Nhánh mẫu ban đầu cards */}
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-1 pt-2">
            Các Chi Họ Thuộc Dòng Tộc
          </p>

          <button
            type="button"
            onClick={() => setSelectedBranch("ALL")}
            className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-all ${
              selectedBranch === "ALL"
                ? "bg-[#8B1E1E] text-white border-[#8B1E1E]"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            Toàn bộ 4 Chi Họ (Hiển thị đầy đủ)
          </button>

          {branches.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBranch(b.id)}
              className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-all flex items-center justify-between ${
                selectedBranch === b.id
                  ? "bg-[#8B1E1E] text-white border-[#8B1E1E]"
                  : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
              }`}
            >
              <span className="truncate">{b.branchName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded ${
                  selectedBranch === b.id
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {b._count?.members || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-[#EFE8D8] bg-[#FAF7EE] space-y-2">
          {onOpenCreateClan && (
            <button
              type="button"
              onClick={onOpenCreateClan}
              className="w-full py-2 bg-white hover:bg-stone-50 text-[#8B1E1E] border border-[#8B1E1E] rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              + Tạo gia phả mới
            </button>
          )}
          <p className="text-[10px] text-center text-stone-400">
            Hỗ trợ: cskh@congdonggiapha.com
          </p>
        </div>
      </div>

      {/* Button to re-open sidebar if closed */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="absolute left-3 top-3 z-30 p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg shadow-md text-stone-700"
          title="Mở danh sách gia phả"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* 2. Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Top Control Bar: Filters & Search */}
        <div className="bg-white/95 backdrop-blur border-b border-[#E8DEC7] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-10 shadow-sm">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-stone-700 flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-[#C59B27]" />
              <span>Lọc Cây:</span>
            </span>

            {/* Chi Họ filter */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
            >
              <option value="ALL">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branchName}
                </option>
              ))}
            </select>

            {/* Đời thứ filter */}
            <select
              value={selectedGen}
              onChange={(e) => setSelectedGen(e.target.value)}
              className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
            >
              <option value="ALL">Tất cả các đời (1 - 5)</option>
              <option value="1">Đời 1 (Khởi Tổ)</option>
              <option value="2">Đời 2 (Sáng Lập Chi)</option>
              <option value="3">Đời 3</option>
              <option value="4">Đời 4</option>
              <option value="5">Đời 5</option>
            </select>

            {/* Giới tính */}
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="px-2.5 py-1 text-xs border border-stone-300 rounded-lg bg-white text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
            >
              <option value="ALL">Tất cả giới tính</option>
              <option value="MALE">Chỉ Nam</option>
              <option value="FEMALE">Chỉ Nữ</option>
            </select>
          </div>

          {/* Quick Search on Canvas */}
          <form onSubmit={handleSearch} className="flex items-center space-x-1.5">
            <input
              type="text"
              placeholder="Tìm tên thành viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1E1E] w-40 sm:w-52"
            />
            <button
              type="submit"
              className="px-2.5 py-1 bg-[#8B1E1E] hover:bg-[#721515] text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Tìm
            </button>
          </form>
        </div>

        {/* Canvas Workspace */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 relative cursor-grab active:cursor-grabbing select-none canvas-grid overflow-hidden ${
            isLocked ? "cursor-default" : ""
          }`}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-30">
              <div className="text-center p-6 bg-white rounded-2xl border border-stone-200 shadow-xl">
                <div className="w-8 h-8 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs font-semibold text-stone-700">
                  Đang khởi tạo sơ đồ cây gia phả...
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                transformOrigin: "0 0",
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
              className="inline-block p-12 min-w-[1400px]"
            >
              {/* Hierarchical Generation Rows */}
              <div className="space-y-16">
                {[1, 2, 3, 4, 5].map((genNumber) => {
                  if (selectedGen !== "ALL" && Number(selectedGen) !== genNumber) {
                    return null;
                  }

                  let genMembers = generations[genNumber] || [];
                  if (selectedGender !== "ALL") {
                    genMembers = genMembers.filter((m) => m.gender === selectedGender);
                  }

                  if (genMembers.length === 0) return null;

                  return (
                    <div key={genNumber} className="relative">
                      {/* Generation Header Tag */}
                      <div className="flex items-center space-x-3 mb-6">
                        <span className="bg-gradient-to-r from-[#8B1E1E] to-[#681313] text-amber-200 text-xs font-bold font-serif px-3 py-1 rounded-full shadow-sm border border-[#C59B27]/40 flex items-center space-x-1.5">
                          <Sparkles className="w-3 h-3 text-[#C59B27]" />
                          <span>
                            {genNumber === 1
                              ? "ĐỜI 1: KHỞI TỔ PHỤ & KHỞI TỔ MẪU"
                              : genNumber === 2
                              ? "ĐỜI 2: CÁC CỤ SÁNG LẬP 4 CHI HỌ"
                              : `ĐỜI THỨ ${genNumber}`}
                          </span>
                        </span>
                        <div className="h-px bg-gradient-to-r from-[#E8DEC7] to-transparent flex-1"></div>
                      </div>

                      {/* Nodes in this generation */}
                      <div className="flex flex-wrap gap-8 items-start justify-start">
                        {genMembers.map((member) => {
                          const isHighlighted = highlightedMemberId === member.id;
                          const isMale = member.gender === "MALE";

                          return (
                            <div
                              key={member.id}
                              className={`relative transition-all duration-200 ${
                                isHighlighted ? "scale-105 z-20" : ""
                              }`}
                            >
                              {/* Member Node Card (Matching visual in mô hình.pdf) */}
                              <div
                                onClick={() => onSelectMember(member)}
                                className={`w-56 bg-white rounded-2xl border-2 p-3.5 shadow-sm hover:shadow-lg cursor-pointer transition-all ${
                                  isHighlighted
                                    ? "border-[#8B1E1E] ring-4 ring-[#8B1E1E]/20"
                                    : isMale
                                    ? "border-blue-200 hover:border-blue-400"
                                    : "border-pink-200 hover:border-pink-400"
                                }`}
                              >
                                {/* Top: Avatar + Code + Status */}
                                <div className="flex items-center justify-between mb-2.5">
                                  {/* Avatar circle (Blue for male, Pink for female as in mô hình.pdf) */}
                                  <div
                                    className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${
                                      isMale
                                        ? "bg-blue-100 text-blue-700 border border-blue-300"
                                        : "bg-pink-100 text-pink-700 border border-pink-300"
                                    }`}
                                  >
                                    {member.avatarUrl ? (
                                      <img
                                        src={member.avatarUrl}
                                        alt={member.fullName}
                                        className="w-full h-full rounded-full object-cover"
                                      />
                                    ) : (
                                      <span>{member.fullName.charAt(0)}</span>
                                    )}
                                  </div>

                                  <div className="text-right">
                                    <span className="text-[10px] font-mono text-stone-400 block">
                                      {member.memberCode}
                                    </span>
                                    <span
                                      className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                                        member.isAlive
                                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                          : "bg-stone-100 text-stone-600"
                                      }`}
                                    >
                                      {member.isAlive ? "Còn sống" : "Đã mất"}
                                    </span>
                                  </div>
                                </div>

                                {/* Full Name */}
                                <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">
                                  {member.fullName}
                                </h4>

                                {/* Courtesy / Role */}
                                <p className="text-[11px] text-stone-500 italic line-clamp-1">
                                  {member.courtesyName || (isMale ? "Nam giới" : "Nữ giới")}
                                </p>

                                {/* Dates & Branch */}
                                <div className="mt-2.5 pt-2 border-t border-stone-100 text-[10px] text-stone-500 space-y-0.5">
                                  <p>
                                    📅 {member.birthSolar?.slice(0, 4) || "--"} -{" "}
                                    {member.isAlive
                                      ? "nay"
                                      : member.deathSolar?.slice(0, 4) || "--"}
                                  </p>
                                  <p className="line-clamp-1 text-stone-600 font-medium">
                                    🌿 {member.branchName}
                                  </p>
                                </div>

                                {/* Spouses dashed connector indicator (Matching mô hình.pdf) */}
                                {member.spouses && member.spouses.length > 0 && (
                                  <div className="mt-2 pt-1 border-t border-dashed border-red-200 text-[10px] text-red-700 flex items-center space-x-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                    <span className="truncate">
                                      Hôn phối: {member.spouses[0].fullName}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. Floating Bottom Toolbar Controls (Matching mô hình.pdf) */}
        <div className="absolute left-6 bottom-6 z-20 flex flex-col bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden divide-y divide-stone-100">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 hover:bg-stone-100 text-stone-700 transition-colors"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2.5 hover:bg-stone-100 text-stone-700 transition-colors"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 hover:bg-stone-100 text-stone-700 transition-colors"
            title="Căn giữa sơ đồ"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`p-2.5 hover:bg-stone-100 transition-colors ${
              isLocked ? "text-[#8B1E1E] bg-red-50" : "text-stone-700"
            }`}
            title={isLocked ? "Mở khóa sơ đồ" : "Khóa vị trí sơ đồ"}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>

        {/* 4. Mini Legend & Action Bar on Bottom Right */}
        <div className="absolute right-6 bottom-6 z-20 flex items-center space-x-3">
          {/* Legend */}
          <div className="bg-white/95 backdrop-blur px-3.5 py-2 rounded-xl shadow-md border border-stone-200 text-[11px] flex items-center space-x-3 text-stone-700">
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span>Nam</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-full bg-pink-500"></span>
              <span>Nữ</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-3 h-0.5 bg-red-400 border-dashed"></span>
              <span>Hôn phối</span>
            </span>
          </div>

          {/* Quick print / export */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2.5 bg-white hover:bg-stone-100 text-stone-700 rounded-xl shadow-md border border-stone-200 transition-all"
            title="In sơ đồ gia phả"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
