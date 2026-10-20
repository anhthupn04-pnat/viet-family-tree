"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
  Node,
  Edge,
} from "@xyflow/react";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Filter,
  PlusCircle,
  Users,
  Sparkles,
  Flower2,
  Info,
  Compass,
  Heart,
  RefreshCw,
  Download,
  FileSpreadsheet,
  FileCode,
  Printer,
  ChevronDown,
  Search,
  Award,
  Layers,
} from "lucide-react";
import FamilyNode from "./tree/FamilyNode";
import { computeFamilyTreeLayout } from "./tree/treeLayout";
import {
  exportFamilyToExcel,
  exportFamilyToGedcom,
  printOrExportA0,
} from "@/lib/exportUtils";
import { MOCK_MEMBERS } from "@/lib/mockData";
import { getLocalMembers, mergeServerWithLocal } from "@/lib/treeStorage";

export interface MemberNode {
  id: string;
  memberCode: string;
  fullName: string;
  nickname?: string | null;
  courtesyName?: string | null;
  gender: string;
  generation: number;
  birthOrder?: string | null;
  isAlive: boolean;
  birthSolar?: string | null;
  deathSolar?: string | null;
  birthLunar?: string | null;
  deathLunar?: string | null;
  deathLunarDay?: number | null;
  deathLunarMonth?: number | null;
  avatarUrl?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  fatherId?: string | null;
  motherId?: string | null;
  spouseId?: string | null;
  spouses?: any[];
  childrenIds?: string[];
  biography?: string | null;
  achievements?: string[];
  burialPlace?: string | null;
  hometown?: string | null;
  currentResidence?: string | null;
  phone?: string | null;
}

interface FamilyTreeCanvasProps {
  onSelectMember: (member: MemberNode) => void;
  onOpenAddMember?: () => void;
  onOpenQuickAdd?: (type: "child" | "spouse" | "parent", targetMember: MemberNode) => void;
  onEditMember?: (member: MemberNode) => void;
  onOpenKinshipForMember?: (memberId: string) => void;
  onOpenKinshipForTwo?: (memberAId: string, memberBId: string) => void;
  onOpenCreateClan?: () => void;
  focusedMemberId?: string | null;
  isAdmin: boolean;
  clanName?: string;
  refreshKey?: number;
  latestSavedMember?: any | null;
}

// Stylized Golden Royal Dragon (Rồng Vàng Hoàng Kim chầu phụng)
const GoldenDragon = ({
  flip = false,
  className = "w-10 h-7 sm:w-14 sm:h-9",
}: {
  flip?: boolean;
  className?: string;
}) => (
  <svg
    viewBox="0 0 160 100"
    className={`${className} text-[#E0A926] shrink-0 drop-shadow-md transition-transform ${
      flip ? "scale-x-[-1]" : ""
    }`}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 80 C 35 70, 45 40, 68 45 C 82 48, 88 68, 108 65 C 130 62, 138 32, 148 30 C 158 28, 162 38, 158 48 C 150 64, 132 80, 110 82 C 85 85, 75 72, 60 78 C 42 85, 30 90, 15 80 Z"
      fill="currentColor"
    />
    <path
      d="M30 65 L 35 50 L 42 62 L 52 45 L 60 58 L 75 42 L 85 55 L 100 42 L 112 55 L 128 38 L 138 52"
      stroke="#FADB7F"
      strokeWidth="3"
      fill="none"
    />
    <path
      d="M145 28 C 150 18, 160 15, 162 22 C 165 30, 158 38, 152 38 C 145 38, 140 32, 145 28 Z"
      fill="#FADB7F"
    />
    <path
      d="M155 24 C 165 12, 150 5, 140 12 C 132 18, 136 24, 142 22 Z"
      fill="#E0A926"
    />
    <circle cx="152" cy="27" r="2.5" fill="#C62828" />
  </svg>
);

const nodeTypes = {
  familyNode: FamilyNode,
};

function FamilyTreeInner({
  members,
  branches,
  loading,
  selectedBranch,
  setSelectedBranch,
  selectedGeneration,
  setSelectedGeneration,
  searchQuery,
  setSearchQuery,
  searchMatches,
  onSelectMember,
  onOpenAddMember,
  onOpenQuickAdd,
  onEditMember,
  onOpenKinshipForMember,
  onOpenKinshipForTwo,
  focusedMemberId,
  isAdmin,
  clanName,
  handleRefresh,
}: {
  members: MemberNode[];
  branches: any[];
  loading: boolean;
  selectedBranch: string;
  setSelectedBranch: (val: string) => void;
  selectedGeneration: string;
  setSelectedGeneration: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  searchMatches: MemberNode[];
  onSelectMember: (m: MemberNode) => void;
  onOpenAddMember?: () => void;
  onOpenQuickAdd?: (type: "child" | "spouse" | "parent", targetMember: MemberNode) => void;
  onEditMember?: (m: MemberNode) => void;
  onOpenKinshipForMember?: (memberId: string) => void;
  onOpenKinshipForTwo?: (memberAId: string, memberBId: string) => void;
  focusedMemberId?: string | null;
  isAdmin: boolean;
  clanName: string;
  handleRefresh: () => void;
}) {
  const { fitView, setCenter, zoomIn, zoomOut } = useReactFlow();

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Close export dropdown on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as any)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Filter members by branch and generation
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (selectedBranch !== "ALL" && m.branchId && m.branchId !== selectedBranch) {
        return false;
      }
      if (selectedGeneration !== "ALL" && m.generation !== Number(selectedGeneration)) {
        return false;
      }
      return true;
    });
  }, [members, selectedBranch, selectedGeneration]);

  // Compute Layout for React Flow
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return computeFamilyTreeLayout(filteredMembers, {
      isAdmin,
      focusedMemberId,
      onSelectMember,
      onQuickAdd: (type, target) => {
        if (onOpenQuickAdd) {
          onOpenQuickAdd(type, target);
        } else if (onOpenAddMember) {
          onOpenAddMember();
        }
      },
      onEditMember: (m) => {
        if (onEditMember) {
          onEditMember(m);
        }
      },
    });
  }, [filteredMembers, isAdmin, focusedMemberId, onSelectMember, onOpenQuickAdd, onOpenAddMember, onEditMember]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when initial calculation updates
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Auto fit view on load or when members change
  useEffect(() => {
    if (nodes.length > 0) {
      const timer = setTimeout(() => {
        fitView({ padding: 0.2, duration: 600 });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [nodes.length, fitView]);

  // Center on focused member
  const focusOnMember = useCallback(
    (member: MemberNode) => {
      const targetNode = nodes.find((n) => n.id === member.id);
      if (targetNode) {
        setCenter(targetNode.position.x + 110, targetNode.position.y + 70, {
          zoom: 1.15,
          duration: 800,
        });
      }
      onSelectMember(member);
      setShowSearchDropdown(false);
      setSearchQuery("");
    },
    [nodes, setCenter, onSelectMember, setSearchQuery]
  );

  useEffect(() => {
    if (focusedMemberId) {
      const target = members.find((m) => m.id === focusedMemberId);
      if (target) {
        focusOnMember(target);
      }
    }
  }, [focusedMemberId, members, focusOnMember]);

  // Stats
  const aliveCount = members.filter((m) => m.isAlive).length;
  const deceasedCount = members.length - aliveCount;
  const maxGen = Math.max(...members.map((m) => m.generation || 1), 1);

  return (
    <div className="relative w-full h-[calc(100vh-68px)] flex flex-col bg-[#FCFBF7] overflow-hidden select-none">
      {/* Imperial Scroll Royal Header Banner */}
      <div className="relative bg-gradient-to-r from-[#701212] via-[#8B1D1D] to-[#5A0E0E] text-white px-3 sm:px-6 py-2.5 shadow-lg border-b-2 border-[#E0A926] shrink-0 z-20">
        <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
          {/* Left Dragon & Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <GoldenDragon />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold font-serif tracking-wide text-amber-100 flex items-center gap-1.5 drop-shadow-sm">
                  <span>{clanName}</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-300/30">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  {maxGen} Thế Hệ Trực Hệ
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80 hidden md:block italic">
                Cây phả hệ tương tác đa thế hệ &bull; Thao tác nhanh trực tiếp trên thành viên
              </p>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-3 text-xs bg-black/25 backdrop-blur-xs px-3 py-1 rounded-full border border-[#E0A926]/30 text-amber-100">
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-300" />
              <span>Tổng: <strong>{members.length}</strong></span>
            </div>
            <span className="text-amber-400/40">|</span>
            <div className="flex items-center gap-1 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sống: <strong>{aliveCount}</strong></span>
            </div>
            <span className="text-amber-400/40">|</span>
            <div className="flex items-center gap-1 text-rose-300">
              <Flower2 className="w-3.5 h-3.5 text-rose-300" />
              <span>Đã mất: <strong>{deceasedCount}</strong></span>
            </div>
          </div>

          {/* Right Dragon & Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Primary Add Button (Admin) */}
            {isAdmin && onOpenAddMember && (
              <button
                type="button"
                onClick={onOpenAddMember}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#3B1100] bg-gradient-to-r from-[#FADB7F] via-[#E0A926] to-[#C9911C] hover:brightness-105 active:scale-95 shadow-md transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-[#8B1D1D]" />
                <span className="hidden sm:inline">Thêm Thành Viên</span>
                <span className="sm:hidden">Thêm</span>
              </button>
            )}

            {/* Export Dropdown */}
            <div className="relative" ref={exportRef}>
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
                title="Xuất file gia phả"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Xuất phả hệ</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50 text-gray-800 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      exportFamilyToExcel(members as any, clanName);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center gap-2 text-emerald-800 font-medium"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Xuất bảng Excel (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      exportFamilyToGedcom(members as any, clanName);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center gap-2 text-blue-800 font-medium"
                  >
                    <FileCode className="w-4 h-4 text-blue-600" />
                    <span>Xuất chuẩn GEDCOM (.ged)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      printOrExportA0(clanName);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center gap-2 text-stone-800 font-medium border-t border-gray-100"
                  >
                    <Printer className="w-4 h-4 text-stone-600" />
                    <span>In / Xuất sơ đồ khổ lớn A0</span>
                  </button>
                </div>
              )}
            </div>

            <GoldenDragon flip />
          </div>
        </div>
      </div>

      {/* Floating Control & Search Toolbar */}
      <div className="absolute top-[68px] left-3 sm:left-6 right-3 sm:right-6 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Search Bar with Autocomplete */}
        <div className="relative pointer-events-auto w-full sm:w-72 md:w-80">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Tìm theo tên hoặc biệt danh..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-md text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#8B1D1D] transition-all"
            />
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchMatches.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowSearchDropdown(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-30 max-h-64 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Kết quả tìm kiếm ({searchMatches.length})
                </div>
                {searchMatches.slice(0, 8).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => focusOnMember(m)}
                    className="w-full px-3 py-2 text-left hover:bg-amber-50 flex items-center justify-between text-xs transition-colors border-b border-gray-50 last:border-0"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-bold text-gray-900 truncate">
                        {m.fullName}
                      </div>
                      {m.nickname && (
                        <div className="text-[11px] text-amber-700 italic truncate">
                          &ldquo;{m.nickname}&rdquo;
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                      Đời {m.generation}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Filters & View Actions */}
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          {/* Branch Filter */}
          <div className="flex items-center bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs text-gray-700">
            <Filter className="w-3.5 h-3.5 text-[#8B1D1D] mr-1.5 shrink-0" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent focus:outline-none font-medium text-xs cursor-pointer text-gray-800"
            >
              <option value="ALL">Tất cả chi họ</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>

          {/* Generation Filter */}
          <div className="flex items-center bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-md text-xs text-gray-700">
            <Layers className="w-3.5 h-3.5 text-amber-600 mr-1.5 shrink-0" />
            <select
              value={selectedGeneration}
              onChange={(e) => setSelectedGeneration(e.target.value)}
              className="bg-transparent focus:outline-none font-medium text-xs cursor-pointer text-gray-800"
            >
              <option value="ALL">Tất cả thế hệ</option>
              {Array.from({ length: maxGen }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>
                  Đời thứ {g}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Tree Button */}
          <button
            type="button"
            onClick={handleRefresh}
            title="Làm mới cây"
            className="p-2 bg-white/95 backdrop-blur-md hover:bg-amber-50 rounded-xl border border-gray-200 shadow-md text-gray-700 hover:text-[#8B1D1D] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#8B1D1D]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main React Flow Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2.0}
          defaultViewport={{ x: 100, y: 50, zoom: 0.85 }}
          className="bg-lotus-watermark"
        >
          {/* Subtle oriental grid background */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={1.5}
            color="#D1C7B7"
          />

          {/* Controls in bottom left */}
          <Controls
            showInteractive={false}
            className="!bg-white/95 !backdrop-blur-md !border-gray-200 !shadow-lg !rounded-xl !p-1"
          />

          {/* MiniMap in bottom right */}
          <MiniMap
            zoomable
            pannable
            nodeColor={(n: any) => {
              if (n.data?.member?.gender === "FEMALE") return "#FDA4AF";
              return "#93C5FD";
            }}
            nodeStrokeWidth={2}
            className="!bg-white/90 !border-gray-300 !shadow-lg !rounded-xl hidden sm:block !bottom-4 !right-4"
            maskColor="rgba(240, 237, 230, 0.6)"
          />
        </ReactFlow>

        {/* Legend Overlay at bottom left */}
        <div className="absolute bottom-4 left-16 hidden md:flex items-center gap-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-md text-[11px] text-gray-600 z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1E40AF]" />
            <span>Nam giới</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9F1239]" />
            <span>Nữ giới</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#8B1D1D]" />
            <span>Huyết thống trực hệ</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-[#E11D48]" />
            <span className="text-[#E11D48] font-bold">♥</span>
            <span>Hôn phối</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FamilyTreeCanvas(props: FamilyTreeCanvasProps) {
  const [members, setMembers] = useState<MemberNode[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedGeneration, setSelectedGeneration] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Load tree and cached data
  const loadTree = async () => {
    try {
      setLoading(true);
      const t = Date.now();
      const url =
        selectedBranch !== "ALL"
          ? `/api/tree?branchId=${selectedBranch}&_t=${t}`
          : `/api/tree?_t=${t}`;
      const [resTree, resBranches] = await Promise.all([
        fetch(url, { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
        fetch(`/api/branches?_t=${t}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" } }),
      ]);

      const dataTree = await resTree.json();
      const dataBranches = await resBranches.json();

      const rawList =
        dataTree.members && dataTree.members.length > 0
          ? dataTree.members
          : (MOCK_MEMBERS as any[]);
      const mergedMembers = mergeServerWithLocal(rawList);
      setMembers(mergedMembers);

      if (dataBranches.branches) {
        setBranches(dataBranches.branches);
      }
    } catch (e) {
      console.warn("Tree load error, using local/mockData fallback:", e);
      const cached = getLocalMembers();
      if (cached && cached.length > 0) {
        setMembers(cached);
      } else {
        setMembers(mergeServerWithLocal(MOCK_MEMBERS as any[]));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, [selectedBranch, props.refreshKey]);

  // Optimistic update for newly saved member
  useEffect(() => {
    if (!props.latestSavedMember) return;
    setMembers((prev) => {
      const exists = prev.some((m) => m.id === props.latestSavedMember.id);
      const formattedNode: MemberNode = {
        id: props.latestSavedMember.id,
        memberCode: props.latestSavedMember.memberCode || `GP-${props.latestSavedMember.id.slice(0, 4)}`,
        fullName: props.latestSavedMember.fullName,
        nickname: props.latestSavedMember.nickname || null,
        courtesyName: props.latestSavedMember.courtesyName || null,
        gender: (props.latestSavedMember.gender || "MALE").toUpperCase(),
        generation: Number(props.latestSavedMember.generation) || 1,
        birthOrder: props.latestSavedMember.birthOrder || null,
        isAlive: props.latestSavedMember.isAlive !== undefined ? props.latestSavedMember.isAlive : true,
        birthSolar: props.latestSavedMember.birthSolar || null,
        deathSolar: props.latestSavedMember.deathSolar || null,
        birthLunar: props.latestSavedMember.birthLunar || null,
        deathLunar: props.latestSavedMember.deathLunar || null,
        deathLunarDay: props.latestSavedMember.deathLunarDay || null,
        deathLunarMonth: props.latestSavedMember.deathLunarMonth || null,
        avatarUrl: props.latestSavedMember.avatarUrl || null,
        burialPlace: props.latestSavedMember.burialPlace || null,
        biography: props.latestSavedMember.biography || null,
        achievements: props.latestSavedMember.achievements || [],
        fatherId: props.latestSavedMember.fatherId || null,
        motherId: props.latestSavedMember.motherId || null,
        spouseId: props.latestSavedMember.spouseId || null,
        spouses: props.latestSavedMember.spouseId
          ? [{ id: props.latestSavedMember.spouseId, fullName: "Phối ngẫu", relation: "SPOUSE" }]
          : [],
        childrenIds: [],
      };
      if (exists) {
        return prev.map((m) => (m.id === props.latestSavedMember.id ? { ...m, ...formattedNode } : m));
      } else {
        return [...prev, formattedNode];
      }
    });
  }, [props.latestSavedMember]);

  // Filter search matches
  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return members.filter((m) => {
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchNickname = m.nickname?.toLowerCase().includes(q);
      const matchCourtesy = m.courtesyName?.toLowerCase().includes(q);
      return matchName || matchNickname || matchCourtesy;
    });
  }, [members, searchQuery]);

  return (
    <ReactFlowProvider>
      <FamilyTreeInner
        members={members}
        branches={branches}
        loading={loading}
        selectedBranch={selectedBranch}
        setSelectedBranch={setSelectedBranch}
        selectedGeneration={selectedGeneration}
        setSelectedGeneration={setSelectedGeneration}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchMatches={searchMatches}
        onSelectMember={props.onSelectMember}
        onOpenAddMember={props.onOpenAddMember}
        onOpenQuickAdd={props.onOpenQuickAdd}
        onEditMember={props.onEditMember}
        onOpenKinshipForMember={props.onOpenKinshipForMember}
        onOpenKinshipForTwo={props.onOpenKinshipForTwo}
        focusedMemberId={props.focusedMemberId}
        isAdmin={props.isAdmin}
        clanName={props.clanName || "Gia phả dòng họ"}
        handleRefresh={loadTree}
      />
    </ReactFlowProvider>
  );
}
