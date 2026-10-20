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
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Users,
  Sparkles,
  Flower2,
  Info,
  Compass,
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
  onOpenKinshipForTwo?: (memberAId: string, memberBId: string) => void;
  onOpenCreateClan?: () => void;
  isAdmin: boolean;
  clanName?: string;
}

// Stylized Golden Royal Dragon (Rồng Vàng Hoàng Kim thời Lý - Trần chầu phụng)
const GoldenDragon = ({ flip = false }: { flip?: boolean }) => (
  <svg
    viewBox="0 0 160 100"
    className={`w-24 h-16 sm:w-32 sm:h-20 text-[#E0A926] shrink-0 drop-shadow-md transition-transform ${
      flip ? "scale-x-[-1]" : ""
    }`}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Body coils */}
    <path
      d="M15 80 C 35 70, 45 40, 68 45 C 82 48, 88 68, 108 65 C 130 62, 138 32, 148 30 C 158 28, 162 38, 158 48 C 150 64, 132 80, 110 82 C 85 85, 75 72, 60 78 C 42 85, 30 90, 15 80 Z"
      fill="currentColor"
    />
    {/* Golden Back Spines (vây lưng rồng) */}
    <path
      d="M30 65 L 35 50 L 42 62 L 52 45 L 60 58 L 75 42 L 85 55 L 100 42 L 112 55 L 128 38 L 138 52"
      stroke="#FADB7F"
      strokeWidth="3"
      fill="none"
    />
    {/* Dragon Head (Đầu rồng) */}
    <path
      d="M145 28 C 150 18, 160 15, 162 22 C 165 30, 158 38, 152 38 C 145 38, 140 32, 145 28 Z"
      fill="#FADB7F"
    />
    {/* Horn & Whiskers (Râu rồng & bờm lửa uy phong) */}
    <path
      d="M155 24 C 165 12, 150 5, 140 12 C 132 18, 136 24, 142 22 Z"
      fill="#E0A926"
    />
    <circle cx="152" cy="27" r="2.5" fill="#C62828" />
    {/* Claws (Móng vuốt rồng) */}
    <path
      d="M40 70 L 35 85 M 43 72 L 42 88 M 48 72 L 52 86"
      stroke="#FADB7F"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M95 72 L 92 88 M 100 74 L 102 90 M 106 72 L 112 87"
      stroke="#FADB7F"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

// Vertical Red Scroll Couplet (Câu đối đỏ hai bên cuốn thư như trong giao diện mẫu)
const VerticalScroll = ({ text, position }: { text: string; position: "left" | "right" }) => {
  const characters = text.split("");
  return (
    <div
      className={`hidden lg:flex flex-col items-center py-2 px-1 rounded-sm shadow-md border border-[#E0A926] bg-[#C62828] text-white z-10 w-9 shrink-0 ${
        position === "left" ? "mr-4" : "ml-4"
      }`}
    >
      {/* Top scroll roller (Con lăn trên bằng vàng) */}
      <div className="w-11 h-2.5 bg-gradient-to-r from-[#D97706] via-[#FADB7F] to-[#D97706] rounded-sm -mt-3 border border-[#92400E] shadow-xs"></div>
      
      {/* Vertical calligraphy letters */}
      <div className="flex flex-col items-center justify-around flex-1 py-2 space-y-1 font-serif text-[11px] font-bold text-[#FADB7F] tracking-widest select-none">
        {characters.map((char, index) => (
          <span key={index} className="leading-tight block">
            {char}
          </span>
        ))}
      </div>

      {/* Bottom scroll roller (Con lăn dưới bằng vàng) */}
      <div className="w-11 h-2.5 bg-gradient-to-r from-[#D97706] via-[#FADB7F] to-[#D97706] rounded-sm -mb-3 border border-[#92400E] shadow-xs"></div>
    </div>
  );
};

export default function FamilyTreeCanvas({
  onSelectMember,
  onOpenAddMember,
  onOpenKinshipForMember,
  onOpenKinshipForTwo,
  onOpenCreateClan,
  isAdmin,
  clanName = "Gia Phả Phan Tộc Đại Tông",
}: FamilyTreeCanvasProps) {
  const [members, setMembers] = useState<MemberNode[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [generations, setGenerations] = useState<Record<number, MemberNode[]>>({});
  const [maxGen, setMaxGen] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);

  // Kinship 2-person comparison mode
  const [kinshipCompareMode, setKinshipCompareMode] = useState<boolean>(false);
  const [kinshipNodeA, setKinshipNodeA] = useState<MemberNode | null>(null);
  const [kinshipNodeB, setKinshipNodeB] = useState<MemberNode | null>(null);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedGen, setSelectedGen] = useState<string>("ALL");
  const [selectedGender, setSelectedGender] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Canvas zoom & pan state
  const [scale, setScale] = useState<number>(0.88);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 30, y: 20 });
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sidebar toggle
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
    setScale(0.88);
    setPan({ x: 30, y: 20 });
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

  // Roman numeral generation symbols (I, II, III, IV, V, VI, VII...) as in giao diện.jpg
  const romanGenerations = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[660px] bg-[#FDFBF7] overflow-hidden flex border border-[#E8DEC7] rounded-3xl shadow-xs">
      {/* 1. Left Collapsible Sidebar */}
      <div
        className={`bg-white border-r border-[#E8DEC7] transition-all duration-300 z-20 flex flex-col shrink-0 ${
          sidebarOpen ? "w-72" : "w-0"
        } overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#E8DEC7] bg-[#FDFBF7] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-[#1E5F52] flex items-center justify-center text-[#FADB7F]">
              <Flower2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#1E5F52]">
              Tộc Phả & Chi Nhánh
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100"
            title="Thu gọn danh mục"
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
              placeholder="Tìm theo tên thành viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#1E5F52]"
            />
          </div>
        </div>

        {/* Clan cards list */}
        <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
          {/* Main Clan Card */}
          <div className="p-3.5 rounded-2xl border-2 border-[#E0A926] bg-gradient-to-br from-[#FAF7EE] to-[#F5EEDC] shadow-xs cursor-pointer hover:shadow-md transition-all">
            <div className="flex items-center space-x-1.5 mb-1.5">
              <span className="bg-[#C62828] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Chính Tông
              </span>
              <span className="bg-[#1E5F52]/10 text-[#1E5F52] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#1E5F52]/20">
                Công khai
              </span>
            </div>
            <h4 className="font-serif font-bold text-xs text-[#1E5F52]">
              {clanName}
            </h4>
            <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
              📍 Nga Sơn, Thanh Hóa, Việt Nam
            </p>
            <p className="text-[10px] text-stone-500 mt-1">
              5 thế hệ • 4 chi họ • {members.length} thành viên
            </p>
          </div>

          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-1 pt-2">
            Các Chi Nhánh Dòng Họ
          </p>

          <button
            type="button"
            onClick={() => setSelectedBranch("ALL")}
            className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
              selectedBranch === "ALL"
                ? "bg-[#1E5F52] text-white border-[#1E5F52] shadow-sm"
                : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
            }`}
          >
            <span>Toàn bộ các Chi Họ</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                selectedBranch === "ALL" ? "bg-white/20 text-white" : "bg-stone-100 text-stone-600"
              }`}
            >
              {members.length}
            </span>
          </button>

          {branches.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBranch(b.id)}
              className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                selectedBranch === b.id
                  ? "bg-[#1E5F52] text-white border-[#1E5F52] shadow-sm font-semibold"
                  : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
              }`}
            >
              <span className="truncate">{b.branchName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
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
        <div className="p-3 border-t border-[#E8DEC7] bg-[#FDFBF7] space-y-2">
          {onOpenCreateClan && (
            <button
              type="button"
              onClick={onOpenCreateClan}
              className="w-full py-2 bg-white hover:bg-stone-50 text-[#C62828] border border-[#C62828] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E0A926]" />
              <span>Khởi tạo gia phả mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Button to re-open sidebar if closed */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="absolute left-3 top-3 z-30 p-2 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl shadow-md text-[#1E5F52]"
          title="Mở danh sách chi họ"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* 2. Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Top Control Bar: Filters & Search */}
        <div className="bg-white/95 backdrop-blur-md border-b border-[#E8DEC7] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 z-10 shadow-2xs">
          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#1E5F52] flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5 text-[#E0A926]" />
              <span>Lọc:</span>
            </span>

            {/* Chi Họ filter */}
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="px-2.5 py-1 text-xs border border-stone-300 rounded-xl bg-white text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-[#1E5F52]"
            >
              <option value="ALL">Tất cả chi nhánh ({branches.length})</option>
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
              className="px-2.5 py-1 text-xs border border-stone-300 rounded-xl bg-white text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-[#1E5F52]"
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
              className="px-2.5 py-1 text-xs border border-stone-300 rounded-xl bg-white text-stone-800 focus:outline-hidden focus:ring-1 focus:ring-[#1E5F52]"
            >
              <option value="ALL">Tất cả giới tính</option>
              <option value="MALE">Chỉ Nam</option>
              <option value="FEMALE">Chỉ Nữ</option>
            </select>

            {/* Toggle Chế độ tính xưng hô (chọn 2 người) */}
            <button
              type="button"
              onClick={() => {
                const next = !kinshipCompareMode;
                setKinshipCompareMode(next);
                setKinshipNodeA(null);
                setKinshipNodeB(null);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 border ${
                kinshipCompareMode
                  ? "bg-[#C62828] text-white border-[#E0A926] shadow-sm animate-pulse"
                  : "bg-amber-50 hover:bg-amber-100 text-[#78350F] border-amber-300"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#E0A926]" />
              <span>{kinshipCompareMode ? "Đang chọn 2 người..." : "🌿 Tính xưng hô (Chọn 2 người)"}</span>
            </button>
          </div>

          {/* Quick Search on Canvas */}
          <form onSubmit={handleSearch} className="flex items-center space-x-1.5">
            <input
              type="text"
              placeholder="Tìm theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 text-xs border border-stone-300 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#1E5F52] w-36 sm:w-48 bg-stone-50"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#1E5F52] hover:bg-[#16483E] text-white text-xs font-semibold rounded-xl shadow-xs"
            >
              Tìm
            </button>
          </form>
        </div>

        {/* Floating Kinship Selection Banner */}
        {kinshipNodeA && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-[#1E5F52] via-[#2B7A6A] to-[#1E5F52] text-white px-5 py-2.5 rounded-2xl shadow-2xl border-2 border-[#E0A926] flex items-center space-x-3 text-xs animate-fade-in backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E0A926] animate-ping"></span>
            <span>
              Người ①: <strong className="text-[#FADB7F]">{kinshipNodeA.fullName}</strong>. Hãy nhấp chọn người thứ ② trên sơ đồ để tính xưng hô thuần Việt!
            </span>
            <button
              type="button"
              onClick={() => {
                setKinshipNodeA(null);
                setKinshipNodeB(null);
              }}
              className="ml-2 px-2.5 py-0.5 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] text-white font-semibold transition-colors"
            >
              Hủy
            </button>
          </div>
        )}

        {/* Canvas Workspace with Traditional Lotus Watermark */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex-1 relative cursor-grab active:cursor-grabbing select-none bg-[#FDFBF7] bg-lotus-watermark overflow-hidden ${
            isLocked ? "cursor-default" : ""
          }`}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-30">
              <div className="text-center p-6 bg-white rounded-2xl border border-stone-200 shadow-xl">
                <div className="w-8 h-8 border-4 border-[#1E5F52] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs font-semibold text-stone-700">
                  Đang tải sơ đồ gia phả...
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
              className="inline-block p-8 min-w-[1700px] relative"
            >
              {/* TOP HEADER IN CANVAS: Flanked by Dual Golden Dragons & Vertical Scrolls as in giao diện.jpg */}
              <div className="flex items-center justify-center mb-12 relative px-4">
                {/* Vertical Scroll Left */}
                <VerticalScroll
                  text="TổTiênCôngĐứcThiênNiênThịnh"
                  position="left"
                />

                {/* Left Golden Dragon Motif */}
                <GoldenDragon flip={false} />

                {/* Center Imperial Red Scroll Banner */}
                <div className="relative mx-3 max-w-xl text-center px-8 py-4 rounded-2xl bg-gradient-to-r from-[#991B1B] via-[#C62828] to-[#991B1B] text-white border-2 border-[#E0A926] shadow-xl">
                  {/* Ornate corner knots */}
                  <div className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-[#E0A926] border border-white"></div>
                  <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#E0A926] border border-white"></div>
                  <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 rounded-full bg-[#E0A926] border border-white"></div>
                  <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#E0A926] border border-white"></div>

                  <p className="text-[10px] uppercase font-bold tracking-widest text-[#FADB7F] mb-0.5">
                    TÔNG ĐỒ GIA PHẢ CHÍNH THỐNG
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#FADB7F] tracking-wide drop-shadow-sm">
                    {clanName}
                  </h2>
                  <p className="text-[11px] text-amber-100/90 italic font-serif mt-0.5">
                    (Vùng Phát Tích: Nga Điền, Nga Sơn, Thanh Hóa)
                  </p>
                </div>

                {/* Right Golden Dragon Motif */}
                <GoldenDragon flip={true} />

                {/* Vertical Scroll Right */}
                <VerticalScroll
                  text="TửHiếuTônHiềnVạnĐạiVinh"
                  position="right"
                />
              </div>

              {/* GENERATION TIERS & ORTHOGONAL HIERARCHY TREE */}
              <div className="space-y-12 relative">
                {[1, 2, 3, 4, 5].map((genNumber, genIdx) => {
                  if (selectedGen !== "ALL" && Number(selectedGen) !== genNumber) {
                    return null;
                  }

                  let genMembers = generations[genNumber] || [];
                  if (selectedGender !== "ALL") {
                    genMembers = genMembers.filter((m) => m.gender === selectedGender);
                  }

                  if (genMembers.length === 0) return null;

                  return (
                    <div key={genNumber} className="relative flex items-center gap-6">
                      {/* GENERATION MARKERS: Circular numbered badges lined up vertically on the left side (V, VI, VII... as in giao diện.jpg) */}
                      <div className="shrink-0 flex flex-col items-center justify-center w-14">
                        <div className="w-12 h-12 rounded-full bg-[#1E5F52] border-2 border-[#E0A926] shadow-md flex items-center justify-center text-white font-serif font-black text-sm hover:scale-105 transition-transform cursor-pointer">
                          {romanGenerations[genNumber] || genNumber}
                        </div>
                        <span className="text-[10px] font-bold text-[#1E5F52] mt-1 font-serif">
                          Đời {genNumber}
                        </span>

                        {/* Orthogonal connector line linking down to next generation */}
                        {genIdx < 4 && (
                          <div className="w-0.5 h-16 bg-[#8CA397] my-1"></div>
                        )}
                      </div>

                      {/* Right: Orthogonal Tree Row with Jade Green Cards */}
                      <div className="flex-1 relative">
                        {/* Orthogonal horizontal connecting bar behind cards */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#8CA397] -z-0"></div>

                        {/* Node Cards in this generation */}
                        <div className="flex flex-wrap gap-5 items-center justify-start relative z-10 py-2">
                          {genMembers.map((member) => {
                            const isHighlighted = highlightedMemberId === member.id;
                            const isFemale = member.gender === "FEMALE";
                            const isNodeA = kinshipNodeA?.id === member.id;
                            const isNodeB = kinshipNodeB?.id === member.id;

                            return (
                              <div
                                key={member.id}
                                className={`relative transition-all duration-200 ${
                                  isHighlighted || isNodeA || isNodeB ? "scale-105 z-20" : ""
                                }`}
                              >
                                {/* Vertical drop connector tick to center bar */}
                                <div className={`w-0.5 h-3 mx-auto -mb-1 ${
                                  isNodeA || isNodeB ? "bg-[#E0A926] w-1" : "bg-[#8CA397]"
                                }`}></div>

                                {/* NODE CARD: Deep Jade Green (#1E5F52 / #2B7A6A) with crisp white text & rounded corners */}
                                <div
                                  onClick={() => {
                                    if (kinshipCompareMode) {
                                      if (!kinshipNodeA) {
                                        setKinshipNodeA(member);
                                      } else if (kinshipNodeA.id === member.id) {
                                        setKinshipNodeA(null);
                                      } else {
                                        setKinshipNodeB(member);
                                        if (onOpenKinshipForTwo) {
                                          onOpenKinshipForTwo(kinshipNodeA.id, member.id);
                                        } else if (onOpenKinshipForMember) {
                                          onOpenKinshipForMember(kinshipNodeA.id);
                                        }
                                      }
                                    } else {
                                      onSelectMember(member);
                                    }
                                  }}
                                  className={`w-44 sm:w-48 rounded-xl p-3 cursor-pointer transition-all border relative ${
                                    isNodeA
                                      ? "ring-4 ring-[#E0A926] shadow-2xl border-[#E0A926] bg-[#16483E] scale-102"
                                      : isNodeB
                                      ? "ring-4 ring-[#F06292] shadow-2xl border-[#F06292] bg-[#16483E] scale-102"
                                      : isHighlighted
                                      ? "ring-3 ring-[#E0A926] shadow-xl border-[#E0A926] scale-102"
                                      : "border-[#E0A926]/40 hover:border-[#E0A926] hover:shadow-lg"
                                  } bg-[#1E5F52] text-white flex flex-col justify-between`}
                                >
                                  {/* Kinship Selection Badge Tag */}
                                  {isNodeA && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E0A926] text-[#24150B] font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md border border-white">
                                      ① Tôi
                                    </div>
                                  )}
                                  {isNodeB && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F06292] text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md border border-white">
                                      ② Đối chiếu
                                    </div>
                                  )}

                                  {/* Top Row: Avatar & Status Badge */}
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden ${
                                        isFemale
                                          ? "border-2 border-[#F06292] bg-pink-900/60 text-pink-200"
                                          : "border-2 border-[#E0A926] bg-emerald-950/60 text-amber-200"
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

                                    {/* Action button: quick kinship selection */}
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setKinshipCompareMode(true);
                                        setKinshipNodeA(member);
                                      }}
                                      title="Chọn người này để tính quan hệ xưng hô"
                                      className="p-1 rounded-full bg-white/10 hover:bg-[#E0A926] hover:text-[#24150B] text-amber-200 transition-colors"
                                    >
                                      <Compass className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Sub-badge: C (Còn sống), M (Đã mất) as in giao diện.jpg */}
                                    <span
                                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full border ${
                                        member.isAlive
                                          ? "bg-emerald-400/20 text-emerald-200 border-emerald-400/40"
                                          : "bg-black/30 text-stone-300 border-stone-500/40"
                                      }`}
                                      title={member.isAlive ? "Còn sống" : "Đã mất"}
                                    >
                                      {member.isAlive ? "C" : "M"}
                                    </span>
                                  </div>

                                  {/* Full Name in crisp white text */}
                                  <h4 className="font-serif font-bold text-xs sm:text-sm text-white tracking-wide uppercase line-clamp-1 text-center">
                                    {member.fullName}
                                  </h4>

                                  {/* Courtesy / Generation / Dates */}
                                  <div className="mt-1.5 pt-1.5 border-t border-white/20 text-[10px] text-emerald-100/90 text-center space-y-0.5">
                                    <p className="text-[10px] text-amber-200 font-mono">
                                      {member.birthSolar?.slice(0, 4) || "--"} -{" "}
                                      {member.isAlive ? "nay" : member.deathSolar?.slice(0, 4) || "--"}
                                    </p>
                                    <p className="line-clamp-1 text-[10px] text-emerald-200">
                                      {member.branchName?.replace("Chi ", "C") || "Chính chi"}
                                    </p>
                                  </div>

                                  {/* Spouse Indicator with Lotus Pink */}
                                  {member.spouses && member.spouses.length > 0 && (
                                    <div className="mt-1.5 pt-1 border-t border-dashed border-[#F06292]/50 text-[9px] text-pink-200 flex items-center justify-center space-x-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#F06292]"></span>
                                      <span className="truncate">
                                        HP: {member.spouses[0].fullName}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* BOTTOM LEGEND ("CHÚ DẪN") Box as in giao diện.jpg */}
              <div className="mt-16 flex items-center justify-end pr-12">
                <div className="bg-white/90 border border-stone-300 rounded-xl p-3 text-[11px] text-stone-700 shadow-md backdrop-blur-xs space-y-1">
                  <p className="font-bold text-center text-[#1E5F52] font-serif border-b border-stone-200 pb-1">
                    * CHÚ DẪN
                  </p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 text-[10px]">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-[9px]">
                        C
                      </span>
                      <span>Còn sống</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-4 h-4 rounded-full bg-stone-700 text-white font-bold flex items-center justify-center text-[9px]">
                        M
                      </span>
                      <span>Đã mất</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#F06292] text-white font-bold flex items-center justify-center text-[9px]">
                        HP
                      </span>
                      <span>Hôn phối</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#E0A926] text-[#24150B] font-bold flex items-center justify-center text-[9px]">
                        ★
                      </span>
                      <span>Trưởng chi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Floating Bottom Toolbar Controls */}
        <div className="absolute left-6 bottom-6 z-20 flex flex-col bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden divide-y divide-stone-100">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 hover:bg-stone-50 text-stone-700 hover:text-[#1E5F52] transition-colors"
            title="Phóng to (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2.5 hover:bg-stone-50 text-stone-700 hover:text-[#1E5F52] transition-colors"
            title="Thu nhỏ (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 hover:bg-stone-50 text-stone-700 hover:text-[#1E5F52] transition-colors"
            title="Căn giữa sơ đồ"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`p-2.5 hover:bg-stone-50 transition-colors ${
              isLocked ? "text-[#C62828] bg-red-50" : "text-stone-700"
            }`}
            title={isLocked ? "Mở khóa sơ đồ" : "Khóa vị trí sơ đồ"}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
