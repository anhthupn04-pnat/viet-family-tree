"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Lock,
  Unlock,
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
  LayoutGrid,
  GitGraph,
  PieChart,
  List,
  Star,
  Layers,
  ArrowRight,
  Search,
} from "lucide-react";
import {
  exportFamilyToExcel,
  exportFamilyToGedcom,
  printOrExportA0,
} from "@/lib/exportUtils";
import { MOCK_MEMBERS } from "@/lib/mockData";

export interface MemberNode {
  id: string;
  memberCode: string;
  fullName: string;
  courtesyName?: string | null;
  gender: string;
  generation: number;
  birthOrder?: string | null;
  isAlive: boolean;
  isMartyr?: boolean;
  birthSolar?: string | null;
  deathSolar?: string | null;
  birthLunar?: string | null;
  deathLunar?: string | null;
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

interface TreeUnit {
  id: string;
  primary: MemberNode;
  spouse?: MemberNode;
  children: TreeUnit[];
  x: number;
  y: number;
  width: number;
  subtreeWidth: number;
}

interface FamilyTreeCanvasProps {
  onSelectMember: (member: MemberNode) => void;
  onOpenAddMember?: () => void;
  onOpenKinshipForMember?: (memberId: string) => void;
  onOpenKinshipForTwo?: (memberAId: string, memberBId: string) => void;
  onOpenCreateClan?: () => void;
  focusedMemberId?: string | null;
  isAdmin: boolean;
  clanName?: string;
}

// Stylized Golden Royal Dragon (Rồng Vàng Hoàng Kim chầu phụng)
const GoldenDragon = ({
  flip = false,
  className = "w-12 h-8 sm:w-16 sm:h-10",
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

// Layout geometry constants - optimized for clean breathing room & zero collision
const CARD_WIDTH = 210;
const CARD_HEIGHT = 136;
const SPOUSE_GAP = 28;
const SIBLING_GAP = 42;
const ROW_GAP = 96;
const ROW_START_Y = 130;
const START_X = 130;

export default function FamilyTreeCanvas({
  onSelectMember,
  onOpenAddMember,
  onOpenKinshipForMember,
  onOpenKinshipForTwo,
  onOpenCreateClan,
  focusedMemberId,
  isAdmin,
  clanName = "Gia phả dòng họ",
}: FamilyTreeCanvasProps) {
  const [members, setMembers] = useState<MemberNode[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [selectedGeneration, setSelectedGeneration] = useState<string>("ALL");

  // View switch mode: "top-down" | "left-right" | "fan" | "table"
  const [viewMode, setViewMode] = useState<"top-down" | "left-right" | "fan" | "table">("top-down");

  // Canvas pan & zoom state
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 60, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLocked, setIsLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Legend collapsed state
  const [showLegend, setShowLegend] = useState(true);

  // Highlighting & Kinship state
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(null);
  const [kinshipCompareMode, setKinshipCompareMode] = useState(false);
  const [kinshipNodeA, setKinshipNodeA] = useState<MemberNode | null>(null);
  const [kinshipNodeB, setKinshipNodeB] = useState<MemberNode | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Roman numeral generation symbols
  const romanGenerations = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Fetch tree and branches data
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

      if (dataTree.members && dataTree.members.length > 0) {
        setMembers(dataTree.members);
      } else {
        setMembers(MOCK_MEMBERS as any[]);
      }

      if (dataBranches.branches) {
        setBranches(dataBranches.branches);
      }
    } catch (e) {
      console.warn("Tree load error, using mockData fallback:", e);
      setMembers(MOCK_MEMBERS as any[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTree();
  }, [selectedBranch]);

  // Focus on member when requested from Header search
  useEffect(() => {
    if (!focusedMemberId || members.length === 0) return;
    const target = members.find((m) => m.id === focusedMemberId);
    if (target) {
      setHighlightedMemberId(target.id);
      onSelectMember(target);
      // Pan to center of canvas
      setPan({ x: 80, y: 40 });
    }
  }, [focusedMemberId, members]);

  // Zoom controls
  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.15, 1.8));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.15, 0.4));
  const handleResetFit = () => {
    setScale(0.85);
    setPan({ x: 60, y: 30 });
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
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

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.35), 2.0));
  };

  // =========================================================================
  // TREE HIERARCHY LAYOUT ALGORITHM (ORTHOGONAL TREE)
  // =========================================================================
  const { rootUnits, allUnitsMap, maxGeneration, connectors } = useMemo(() => {
    if (members.length === 0) {
      return { rootUnits: [], allUnitsMap: new Map(), maxGeneration: 1, connectors: [] };
    }

    // Apply generation filter if specified
    let displayMembers = members;
    if (selectedGeneration !== "ALL") {
      const genNum = parseInt(selectedGeneration, 10);
      displayMembers = members.filter((m) => m.generation <= genNum);
    }

    const memberMap = new Map<string, MemberNode>();
    displayMembers.forEach((m) => memberMap.set(m.id, m));

    // Identify spouses who don't have parents in tree (in-laws)
    const spouseSet = new Set<string>();
    displayMembers.forEach((m) => {
      if (m.spouses && m.spouses.length > 0) {
        m.spouses.forEach((sp: any) => {
          const spMember = memberMap.get(sp.id);
          if (spMember && !spMember.fatherId && !spMember.motherId && m.gender === "MALE") {
            spouseSet.add(spMember.id);
          }
        });
      }
    });

    // Children mapping
    const childrenMap = new Map<string, MemberNode[]>();
    displayMembers.forEach((m) => {
      const pId = m.fatherId || m.motherId;
      if (pId) {
        if (!childrenMap.has(pId)) childrenMap.set(pId, []);
        childrenMap.get(pId)!.push(m);
      }
    });

    const buildTreeUnit = (m: MemberNode): TreeUnit => {
      let pairedSpouse: MemberNode | undefined;
      if (m.spouses && m.spouses.length > 0) {
        for (const sp of m.spouses) {
          if (spouseSet.has(sp.id)) {
            pairedSpouse = memberMap.get(sp.id);
            break;
          }
        }
      }

      const unitWidth = pairedSpouse ? CARD_WIDTH * 2 + SPOUSE_GAP : CARD_WIDTH;

      const rawChildren = childrenMap.get(m.id) || [];
      if (pairedSpouse && childrenMap.has(pairedSpouse.id)) {
        const spouseChildren = childrenMap.get(pairedSpouse.id) || [];
        spouseChildren.forEach((sc) => {
          if (!rawChildren.some((c) => c.id === sc.id)) {
            rawChildren.push(sc);
          }
        });
      }

      const directChildren = rawChildren.filter((c) => !spouseSet.has(c.id));
      directChildren.sort((a, b) => {
        if (a.birthSolar && b.birthSolar) return a.birthSolar.localeCompare(b.birthSolar);
        return a.id.localeCompare(b.id);
      });

      const childUnits = directChildren.map(buildTreeUnit);

      return {
        id: m.id,
        primary: m,
        spouse: pairedSpouse,
        children: childUnits,
        x: 0,
        y: 0,
        width: unitWidth,
        subtreeWidth: unitWidth,
      };
    };

    // Find root members (Generation 1)
    const roots = displayMembers.filter(
      (m) => (!m.fatherId && !m.motherId && !spouseSet.has(m.id)) || m.generation === 1
    );

    const distinctRoots = roots.filter(
      (r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx && !spouseSet.has(r.id)
    );

    const rootUnitsList: TreeUnit[] = distinctRoots.map(buildTreeUnit);

    // 1st pass: calculate subtree widths bottom-up
    const calcSubtreeWidth = (unit: TreeUnit): number => {
      if (unit.children.length === 0) {
        unit.subtreeWidth = unit.width + SIBLING_GAP;
        return unit.subtreeWidth;
      }
      const childrenTotal = unit.children.reduce((acc, c) => acc + calcSubtreeWidth(c), 0);
      unit.subtreeWidth = Math.max(unit.width + SIBLING_GAP, childrenTotal);
      return unit.subtreeWidth;
    };
    rootUnitsList.forEach(calcSubtreeWidth);

    // 2nd pass: coordinates assignment
    const unitsMap = new Map<string, TreeUnit>();
    let maxGenFound = 1;

    const assignCoords = (unit: TreeUnit, left: number) => {
      const gen = unit.primary.generation || 1;
      if (gen > maxGenFound) maxGenFound = gen;

      unit.y = ROW_START_Y + (gen - 1) * (CARD_HEIGHT + ROW_GAP);

      if (unit.children.length === 0) {
        unit.x = left + (unit.subtreeWidth - unit.width) / 2;
      } else {
        let childLeft = left;
        unit.children.forEach((c) => {
          assignCoords(c, childLeft);
          childLeft += c.subtreeWidth;
        });

        const firstChild = unit.children[0];
        const lastChild = unit.children[unit.children.length - 1];
        const firstCenter = firstChild.x + firstChild.width / 2;
        const lastCenter = lastChild.x + lastChild.width / 2;
        unit.x = (firstCenter + lastCenter) / 2 - unit.width / 2;

        if (unit.x < left) {
          const shift = left - unit.x;
          unit.x = left;
          unit.children.forEach((c) => shiftSubtree(c, shift));
        }
      }

      unitsMap.set(unit.primary.id, unit);
      if (unit.spouse) {
        unitsMap.set(unit.spouse.id, unit);
      }
    };

    const shiftSubtree = (u: TreeUnit, delta: number) => {
      u.x += delta;
      u.children.forEach((c) => shiftSubtree(c, delta));
    };

    let startX = START_X;
    rootUnitsList.forEach((ru) => {
      assignCoords(ru, startX);
      startX += ru.subtreeWidth + 40;
    });

    // 3rd pass: Orthogonal connector lines
    interface ConnectorPath {
      parentId: string;
      childId: string;
      parentUnit: TreeUnit;
      childUnit: TreeUnit;
      pathString: string;
      midY: number;
      isHighlighted: boolean;
    }

    const connectorList: ConnectorPath[] = [];

    // Kinship highlight path trace
    const kinshipPathSet = new Set<string>();
    if (kinshipNodeA && kinshipNodeB) {
      const getAncestors = (mId: string): string[] => {
        const path: string[] = [mId];
        let curr = memberMap.get(mId);
        while (curr && (curr.fatherId || curr.motherId)) {
          const pId = curr.fatherId || curr.motherId;
          if (!pId || path.includes(pId)) break;
          path.push(pId);
          curr = memberMap.get(pId);
        }
        return path;
      };

      const ancestorsA = getAncestors(kinshipNodeA.id);
      const ancestorsB = getAncestors(kinshipNodeB.id);

      let lcaId: string | null = null;
      for (const aId of ancestorsA) {
        if (ancestorsB.includes(aId)) {
          lcaId = aId;
          break;
        }
      }

      if (lcaId) {
        const addEdge = (p: string, c: string) => kinshipPathSet.add(`${p}->${c}`);
        for (let i = 0; i < ancestorsA.length - 1; i++) {
          addEdge(ancestorsA[i + 1], ancestorsA[i]);
          if (ancestorsA[i + 1] === lcaId) break;
        }
        for (let i = 0; i < ancestorsB.length - 1; i++) {
          addEdge(ancestorsB[i + 1], ancestorsB[i]);
          if (ancestorsB[i + 1] === lcaId) break;
        }
      }
    }

    const collectConnectors = (unit: TreeUnit) => {
      if (unit.children.length > 0) {
        const parentCenterX = unit.x + (unit.spouse ? CARD_WIDTH + SPOUSE_GAP / 2 : CARD_WIDTH / 2);
        const parentBottomY = unit.y + CARD_HEIGHT;
        const midY = parentBottomY + ROW_GAP / 2;

        unit.children.forEach((child) => {
          const childCenterX = child.x + CARD_WIDTH / 2;
          const childTopY = child.y;

          const pathString = `M ${parentCenterX} ${parentBottomY} L ${parentCenterX} ${midY} L ${childCenterX} ${midY} L ${childCenterX} ${childTopY}`;
          const isEdgeHighlighted =
            kinshipPathSet.has(`${unit.primary.id}->${child.primary.id}`) ||
            (unit.spouse && kinshipPathSet.has(`${unit.spouse.id}->${child.primary.id}`));

          connectorList.push({
            parentId: unit.primary.id,
            childId: child.primary.id,
            parentUnit: unit,
            childUnit: child,
            pathString,
            midY,
            isHighlighted: Boolean(isEdgeHighlighted),
          });
        });

        unit.children.forEach(collectConnectors);
      }
    };

    rootUnitsList.forEach(collectConnectors);

    return {
      rootUnits: rootUnitsList,
      allUnitsMap: unitsMap,
      maxGeneration: Math.max(maxGenFound, 3),
      connectors: connectorList,
    };
  }, [members, selectedGeneration, kinshipNodeA, kinshipNodeB]);

  // Card click handler
  const handleCardClick = (member: MemberNode) => {
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
  };

  // Render individual member card
  // Render individual member card
  const renderCard = (member: MemberNode, isSpouse = false, partnerName?: string) => {
    const isHighlighted = highlightedMemberId === member.id;
    const isFemale = member.gender === "FEMALE";
    const isNodeA = kinshipNodeA?.id === member.id;
    const isNodeB = kinshipNodeB?.id === member.id;
    const isMartyr =
      Boolean(member.isMartyr) ||
      member.biography?.toLowerCase().includes("liệt sĩ") ||
      member.courtesyName?.toLowerCase().includes("liệt sĩ");

    return (
      <div
        key={member.id}
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick(member);
        }}
        style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}
        className={`rounded-2xl p-3 cursor-pointer transition-all duration-200 border-2 relative flex flex-col justify-between shadow-md select-none ${
          isNodeA
            ? "ring-4 ring-[#E0A926] shadow-2xl border-[#E0A926] scale-105 z-30"
            : isNodeB
            ? "ring-4 ring-[#F06292] shadow-2xl border-[#F06292] scale-105 z-30"
            : isHighlighted
            ? "ring-4 ring-[#E0A926] shadow-xl border-[#E0A926] scale-105 z-20"
            : isFemale
            ? "border-[#F472B6]/40 hover:border-[#F472B6] hover:shadow-xl hover:scale-102"
            : "border-[#E0A926]/40 hover:border-[#E0A926] hover:shadow-xl hover:scale-102"
        } ${
          isFemale
            ? "bg-gradient-to-br from-[#7D193E] via-[#631432] to-[#450D22] text-pink-50"
            : "bg-gradient-to-br from-[#165649] via-[#104339] to-[#0B2F28] text-white"
        }`}
      >
        {/* Kinship Badge overlay */}
        {isNodeA && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E0A926] text-[#24150B] font-bold text-[9px] px-2.5 py-0.5 rounded-full shadow-md border border-white flex items-center space-x-1 whitespace-nowrap">
            <span>① Tôi (Đang chọn)</span>
          </div>
        )}
        {isNodeB && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F06292] text-white font-bold text-[9px] px-2.5 py-0.5 rounded-full shadow-md border border-white flex items-center space-x-1 whitespace-nowrap">
            <span>② Đối chiếu</span>
          </div>
        )}

        {/* Top Header: Avatar + Status + Birth Order */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center space-x-1.5 min-w-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs overflow-hidden shrink-0 ${
                isFemale
                  ? "border-2 border-[#F06292] bg-pink-950/80 text-pink-200"
                  : "border-2 border-[#E0A926] bg-emerald-950/80 text-amber-200"
              }`}
            >
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{member.fullName.charAt(0)}</span>
              )}
            </div>

            {/* Birth order badge */}
            {member.birthOrder && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/30 truncate">
                {member.birthOrder}
              </span>
            )}
          </div>

          {/* Right badges: Martyr Star or Lotus Deceased or Alive */}
          <div className="flex items-center shrink-0">
            {isMartyr ? (
              <span
                className="bg-red-600 text-amber-200 border border-amber-300 text-[8.5px] font-black px-1.5 py-0.5 rounded-full flex items-center space-x-0.5 shadow-2xs"
                title="Liệt sĩ Quân đội Nhân dân Việt Nam"
              >
                <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300 shrink-0" />
                <span>Liệt sĩ</span>
              </span>
            ) : !member.isAlive ? (
              <span
                className="bg-black/40 text-amber-200 border border-[#E0A926]/40 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center space-x-0.5"
                title="Đã quy tiên (mất)"
              >
                <Flower2 className="w-2.5 h-2.5 text-[#F06292] shrink-0" />
                <span>Đã mất</span>
              </span>
            ) : (
              <span
                className="bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 text-[8.5px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1"
                title="Còn sống"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                <span>Còn sống</span>
              </span>
            )}
          </div>
        </div>

        {/* Member Full Name (Clean sans typography - flawless Vietnamese diacritics) */}
        <div className="text-center my-0.5">
          <h4 className="font-sans font-bold text-[13px] text-white tracking-normal uppercase line-clamp-1 leading-snug drop-shadow-xs">
            {member.fullName}
          </h4>
          {member.courtesyName && (
            <p className="text-[9.5px] text-[#FADB7F] italic line-clamp-1 -mt-0.5">
              {member.courtesyName}
            </p>
          )}
        </div>

        {/* Footer Details: Years & Branch info */}
        <div className="pt-1 border-t border-white/15 text-[9px] text-center space-y-0.5">
          <p className="text-[9.5px] text-amber-200 font-mono font-semibold">
            {member.birthSolar?.slice(0, 4) || "--"} —{" "}
            {member.isAlive ? "nay" : member.deathSolar?.slice(0, 4) || "--"}
          </p>
          <p className="line-clamp-1 text-[8.5px] text-emerald-100/80">
            {isSpouse && partnerName
              ? `Chính thất: ${partnerName}`
              : member.branchName || "Trực hệ chính"}
          </p>
        </div>
      </div>
    );
  };

  // Render tree unit (Primary member + optional spouse)
  const renderTreeUnit = (unit: TreeUnit) => {
    return (
      <div
        key={unit.id}
        style={{
          position: "absolute",
          left: `${unit.x}px`,
          top: `${unit.y}px`,
          width: `${unit.width}px`,
          height: `${CARD_HEIGHT}px`,
        }}
        className="flex items-center z-10"
      >
        {renderCard(unit.primary)}

        {unit.spouse && (
          <div
            style={{ width: `${SPOUSE_GAP}px` }}
            className="flex items-center justify-center shrink-0 relative"
          >
            {/* Horizontal marriage connection line */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-[#E0A926]/40 via-[#E0A926] to-[#E0A926]/40"></div>
            {/* Heart medallion */}
            <div
              className="w-6 h-6 rounded-full bg-gradient-to-br from-[#C62828] via-[#B71C1C] to-[#8E1515] border border-amber-300 text-white flex items-center justify-center shadow-md relative z-10"
              title="Quan hệ Hôn phối (Vợ Chồng)"
            >
              <Heart className="w-3 h-3 fill-current text-amber-200" />
            </div>
          </div>
        )}

        {unit.spouse && renderCard(unit.spouse, true, unit.primary.fullName)}
      </div>
    );
  };

  const allRenderUnits = useMemo(() => {
    const list: TreeUnit[] = [];
    const traverse = (u: TreeUnit) => {
      list.push(u);
      u.children.forEach(traverse);
    };
    rootUnits.forEach(traverse);
    return list;
  }, [rootUnits]);

  // Mini-map calculation
  const miniMapBounds = useMemo(() => {
    if (allRenderUnits.length === 0) return { minX: 0, maxX: 1000, minY: 0, maxY: 600 };
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    allRenderUnits.forEach((u) => {
      if (u.x < minX) minX = u.x;
      if (u.x + u.width > maxX) maxX = u.x + u.width;
      if (u.y < minY) minY = u.y;
      if (u.y + CARD_HEIGHT > maxY) maxY = u.y + CARD_HEIGHT;
    });
    return {
      minX: Math.max(0, minX - 40),
      maxX: maxX + 100,
      minY: Math.max(0, minY - 40),
      maxY: maxY + 100,
    };
  }, [allRenderUnits]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full flex flex-col bg-[#FCFBF7] overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 h-screen" : "h-[calc(100vh-140px)] min-h-[640px]"
      }`}
    >
      {/* =========================================================================
          1. CANVAS TOOLBAR (Full Control Panel)
         ========================================================================= */}
      <div className="bg-[#FAF7EE] border-b border-[#E8DEC7] px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 z-30 shadow-2xs">
        {/* Left: View mode switcher & Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-stone-200/70 rounded-xl p-0.5 border border-stone-300/60 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("top-down")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === "top-down"
                  ? "bg-[#1E5F52] text-white shadow-xs"
                  : "text-stone-700 hover:text-stone-900"
              }`}
              title="Dạng cây dọc truyền thống (Top-Down)"
            >
              <GitGraph className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cây dọc</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("left-right")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === "left-right"
                  ? "bg-[#1E5F52] text-white shadow-xs"
                  : "text-stone-700 hover:text-stone-900"
              }`}
              title="Dạng cây ngang (Left-Right)"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cây ngang</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-all ${
                viewMode === "table"
                  ? "bg-[#1E5F52] text-white shadow-xs"
                  : "text-stone-700 hover:text-stone-900"
              }`}
              title="Dạng danh sách bảng (Table View)"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dạng bảng</span>
            </button>
          </div>

          {/* Filter: Generation */}
          <div className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-xl border border-stone-300 text-xs shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-[#1E5F52]" />
            <select
              value={selectedGeneration}
              onChange={(e) => setSelectedGeneration(e.target.value)}
              className="bg-transparent text-stone-800 text-xs focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL">Tất cả thế hệ</option>
              <option value="1">Đến Đời I</option>
              <option value="2">Đến Đời II</option>
              <option value="3">Đến Đời III</option>
              <option value="4">Đến Đời IV</option>
              <option value="5">Đến Đời V</option>
            </select>
          </div>

          {/* Filter: Branch */}
          <div className="flex items-center space-x-1 bg-white px-2.5 py-1 rounded-xl border border-stone-300 text-xs shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-[#C62828]" />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="bg-transparent text-stone-800 text-xs focus:outline-none cursor-pointer font-medium"
            >
              <option value="ALL">Tất cả chi nhánh</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.branchName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: View controls & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-white rounded-xl border border-stone-300 shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-stone-600 hover:text-[#1E5F52] hover:bg-stone-50 transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-stone-600 border-x border-stone-200">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-stone-600 hover:text-[#1E5F52] hover:bg-stone-50 transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleResetFit}
              className="p-1.5 text-stone-600 hover:text-[#1E5F52] hover:bg-stone-50 border-l border-stone-200 transition-colors"
              title="Vừa màn hình (Fit view)"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className={`p-1.5 border-l border-stone-200 transition-colors ${
                isLocked ? "bg-amber-100 text-amber-900" : "text-stone-600 hover:bg-stone-50"
              }`}
              title={isLocked ? "Đã khóa di chuyển" : "Cho phép kéo rê chuột"}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-1.5 text-stone-600 hover:text-[#1E5F52] hover:bg-stone-50 border-l border-stone-200 transition-colors"
              title="Toàn màn hình"
            >
              {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Kinship compare toggle */}
          <button
            type="button"
            onClick={() => {
              if (kinshipCompareMode) {
                setKinshipCompareMode(false);
                setKinshipNodeA(null);
                setKinshipNodeB(null);
              } else {
                setKinshipCompareMode(true);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all shadow-2xs ${
              kinshipCompareMode
                ? "bg-[#E0A926] text-[#24150B] font-bold border-[#E0A926] shadow-sm animate-pulse"
                : "bg-white text-stone-700 hover:text-[#1E5F52] border-stone-300"
            }`}
            title="Bật chế độ chọn 2 người để tra cứu cách xưng hô chính xác"
          >
            <Compass className="w-3.5 h-3.5 text-[#C62828]" />
            <span className="hidden sm:inline">Tra cứu xưng hô</span>
          </button>

          {/* Export dropdown */}
          <div ref={exportRef} className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3 py-1.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#1E5F52]" />
              <span className="hidden sm:inline">Xuất dữ liệu</span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-50 animate-fade-in text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowExportMenu(false);
                    exportFamilyToExcel(members, clanName);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center space-x-2 text-stone-700"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Xuất Excel (.xlsx / CSV)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExportMenu(false);
                    exportFamilyToGedcom(members, clanName);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center space-x-2 text-stone-700"
                >
                  <FileCode className="w-4 h-4 text-blue-600" />
                  <span>Xuất GEDCOM (.ged)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExportMenu(false);
                    printOrExportA0();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-emerald-50 flex items-center space-x-2 text-stone-700"
                >
                  <Printer className="w-4 h-4 text-amber-600" />
                  <span>In / Xuất PDF A0 cuộn</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAIN CANVAS VIEW AREA
         ========================================================================= */}
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`flex-1 relative overflow-hidden select-none ${
          isLocked ? "cursor-default" : isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        style={{
          backgroundColor: "#FCFBF7",
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(197, 155, 39, 0.05) 0%, transparent 60%),
            radial-gradient(#E8DEC7 0.8px, transparent 0.8px)
          `,
          backgroundSize: "100% 100%, 28px 28px",
        }}
      >
        {/* Table view alternative if selected */}
        {viewMode === "table" ? (
          <div className="absolute inset-0 p-6 overflow-y-auto bg-white z-20">
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-serif font-bold text-lg text-[#1E5F52]">
                  Danh Sách Phả Hệ Dòng Họ ({members.length} thành viên)
                </h3>
                <span className="text-xs text-stone-500">
                  Phân bố từ Đời I đến Đời {maxGeneration}
                </span>
              </div>
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                    <th className="p-2.5">Mã</th>
                    <th className="p-2.5">Họ và Tên</th>
                    <th className="p-2.5">Thứ Bậc</th>
                    <th className="p-2.5">Giới Tính</th>
                    <th className="p-2.5">Đời Thứ</th>
                    <th className="p-2.5">Chi Nhánh</th>
                    <th className="p-2.5">Năm Sinh - Mất</th>
                    <th className="p-2.5">Trạng Thái</th>
                    <th className="p-2.5 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {members.map((m) => (
                    <tr
                      key={m.id}
                      onClick={() => onSelectMember(m)}
                      className="hover:bg-emerald-50/50 cursor-pointer transition-colors"
                    >
                      <td className="p-2.5 font-mono text-stone-500">{m.memberCode}</td>
                      <td className="p-2.5 font-bold font-serif text-stone-900">{m.fullName}</td>
                      <td className="p-2.5 text-stone-600">{m.birthOrder || "--"}</td>
                      <td className="p-2.5">{m.gender === "MALE" ? "Nam" : "Nữ"}</td>
                      <td className="p-2.5 font-semibold text-[#1E5F52]">Đời {m.generation}</td>
                      <td className="p-2.5 text-stone-600">{m.branchName || "Chưa phân chi"}</td>
                      <td className="p-2.5 font-mono text-stone-700">
                        {m.birthSolar?.slice(0, 4) || "--"} -{" "}
                        {m.isAlive ? "nay" : m.deathSolar?.slice(0, 4) || "--"}
                      </td>
                      <td className="p-2.5">
                        {m.isMartyr ? (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Liệt Sĩ
                          </span>
                        ) : m.isAlive ? (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Còn sống
                          </span>
                        ) : (
                          <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Đã mất
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMember(m);
                          }}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-[#1E5F52] hover:text-white rounded-md text-[10px] font-semibold transition-colors"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Tree View (Top-Down or Left-Right Canvas) */
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transformOrigin: "0 0",
              width: "4800px",
              height: "2800px",
            }}
            className="absolute top-0 left-0 transition-transform duration-75"
          >
            {/* TRADITIONAL ROYAL BANNER (Cuốn thư phả hệ đại tông - Centered cleanly above tree) */}
            <div
              style={{
                position: "absolute",
                left: `${(() => {
                  if (allRenderUnits.length === 0) return 600;
                  const minX = Math.min(...allRenderUnits.map((u) => u.x));
                  const maxX = Math.max(...allRenderUnits.map((u) => u.x + u.width));
                  return (minX + maxX) / 2;
                })()}px`,
                transform: "translateX(-50%)",
                top: "16px",
              }}
              className="flex items-center justify-center z-10 pointer-events-auto select-none"
            >
              <div className="flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-[#8E1515] via-[#B71C1C] to-[#8E1515] text-white px-5 py-2 rounded-2xl shadow-xl border-2 border-[#E0A926] backdrop-blur-xs">
                <GoldenDragon flip={false} className="w-10 h-7 text-[#E0A926]" />
                <div className="text-center px-2">
                  <div className="flex items-center justify-center space-x-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E0A926]"></span>
                    <span className="text-[9px] tracking-widest text-[#FADB7F] uppercase font-bold">
                      Sơ Đồ Phả Hệ Trực Hệ
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E0A926]"></span>
                  </div>
                  <h2 className="text-base sm:text-lg font-serif font-black text-[#FADB7F] tracking-wide drop-shadow-xs">
                    {clanName}
                  </h2>
                  <p className="text-[10px] text-amber-100/90 italic font-serif">
                    Khởi Tổ: Cụ Phan Thạnh — Truyền Thừa Hậu Duệ Trực Hệ
                  </p>
                </div>
                <GoldenDragon flip={true} className="w-10 h-7 text-[#E0A926]" />
              </div>
            </div>

            {/* LEFT GENERATION RAIL BADGES (Đời I, Đời II, Đời III) */}
            <div className="absolute left-6 top-0 bottom-0 pointer-events-none z-20">
              {Array.from({ length: maxGeneration }, (_, i) => i + 1).map((genNum) => {
                const badgeY = ROW_START_Y + (genNum - 1) * (CARD_HEIGHT + ROW_GAP);
                const centerY = badgeY + CARD_HEIGHT / 2;
                return (
                  <div
                    key={genNum}
                    style={{
                      position: "absolute",
                      left: "0px",
                      top: `${centerY - 26}px`,
                    }}
                    className="flex flex-col items-center justify-center w-16"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1E5F52] to-[#124237] border-2 border-[#E0A926] shadow-md flex items-center justify-center text-[#FADB7F] font-serif font-black text-sm hover:scale-105 transition-transform">
                      {romanGenerations[genNum] || genNum}
                    </div>
                    <span className="text-[9.5px] font-bold text-[#1E5F52] mt-1 font-serif bg-[#FCFBF7] px-2 py-0.5 rounded-full border border-[#1E5F52]/30 shadow-2xs whitespace-nowrap">
                      Đời {romanGenerations[genNum] || genNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* SVG OVERLAY: ORTHOGONAL HIERARCHICAL CONNECTOR LINES */}
            <svg
              className="absolute inset-0 pointer-events-none w-full h-full z-0 overflow-visible"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#E0A926" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Faint generational horizontal guide lines */}
              {Array.from({ length: maxGeneration }, (_, i) => i + 1).map((genNum) => {
                const rowY = ROW_START_Y + (genNum - 1) * (CARD_HEIGHT + ROW_GAP);
                const centerY = rowY + CARD_HEIGHT / 2;
                return (
                  <line
                    key={`guide-${genNum}`}
                    x1="80"
                    y1={centerY}
                    x2="3500"
                    y2={centerY}
                    stroke="#E8DEC7"
                    strokeDasharray="4 8"
                    strokeWidth="1"
                    opacity="0.6"
                  />
                );
              })}

              {connectors.map((conn, idx) => (
                <g key={`${conn.parentId}-${conn.childId}-${idx}`}>
                  <path
                    d={conn.pathString}
                    fill="none"
                    stroke={conn.isHighlighted ? "#E0A926" : "#2E7D68"}
                    strokeWidth={conn.isHighlighted ? 3.5 : 2}
                    strokeDasharray={conn.isHighlighted ? "6 3" : "none"}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    filter={conn.isHighlighted ? "url(#gold-glow)" : "none"}
                    className={conn.isHighlighted ? "animate-pulse" : ""}
                  />
                  {!conn.isHighlighted && (
                    <circle
                      cx={conn.childUnit.x + CARD_WIDTH / 2}
                      cy={conn.midY}
                      r="3"
                      fill="#2E7D68"
                      stroke="#FCFBF7"
                      strokeWidth="1"
                    />
                  )}
                </g>
              ))}
            </svg>

            {/* TREE CARDS LAYER */}
            <div className="relative z-10">
              {allRenderUnits.map((unit) => renderTreeUnit(unit))}
            </div>
          </div>
        )}

        {/* =========================================================================
            3. MINI-MAP (Bottom Right Overview)
           ========================================================================= */}
        {viewMode !== "table" && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl border border-stone-300 shadow-lg z-30 pointer-events-auto">
            <div className="flex items-center justify-between mb-1 px-1">
              <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider">
                Bản đồ thu nhỏ
              </span>
              <span className="text-[9px] font-mono text-stone-400">
                {members.length} người
              </span>
            </div>
            <div className="relative w-36 h-24 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
              {/* Mini nodes representation */}
              {allRenderUnits.map((u) => {
                const miniX =
                  ((u.x - miniMapBounds.minX) / (miniMapBounds.maxX - miniMapBounds.minX || 1)) * 140;
                const miniY =
                  ((u.y - miniMapBounds.minY) / (miniMapBounds.maxY - miniMapBounds.minY || 1)) * 90;
                return (
                  <div
                    key={`mini-${u.id}`}
                    style={{
                      left: `${Math.max(2, Math.min(130, miniX))}px`,
                      top: `${Math.max(2, Math.min(80, miniY))}px`,
                    }}
                    className={`absolute w-3 h-2 rounded-xs ${
                      u.primary.gender === "FEMALE" ? "bg-[#9C274E]" : "bg-[#1E5F52]"
                    }`}
                  />
                );
              })}
              {/* Viewport frame indicator */}
              <div
                style={{
                  left: `${Math.max(0, -pan.x / 30)}px`,
                  top: `${Math.max(0, -pan.y / 30)}px`,
                  width: "48px",
                  height: "36px",
                }}
                className="absolute border border-[#E0A926] bg-[#E0A926]/20 rounded-xs pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            4. LEGEND (Bottom Left Quy Ước Ký Hiệu)
           ========================================================================= */}
        <div className="absolute bottom-4 left-4 z-30 pointer-events-auto">
          {showLegend ? (
            <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-stone-300 shadow-lg text-[11px] text-stone-700 space-y-2 max-w-xs animate-fade-in">
              <div className="flex items-center justify-between border-b pb-1 font-bold text-stone-900">
                <span className="flex items-center space-x-1.5">
                  <Info className="w-3.5 h-3.5 text-[#1E5F52]" />
                  <span>Chú giải ký hiệu phả hệ</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowLegend(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3 rounded-xs bg-[#1E5F52] border border-[#E0A926]/40 shrink-0"></span>
                  <span>Nam (Xanh ngọc)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3.5 h-3 rounded-xs bg-[#9C274E] border border-[#E0A926]/40 shrink-0"></span>
                  <span>Nữ (Hồng sen)</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Flower2 className="w-3 h-3 text-[#F06292] shrink-0" />
                  <span>Người đã khuất</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Star className="w-3 h-3 fill-red-600 text-red-600 shrink-0" />
                  <span>Liệt sĩ có công</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <div className="w-4 h-0.5 bg-[#2E7D68] shrink-0"></div>
                  <span>Đường trực hệ</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Heart className="w-3 h-3 fill-[#C62828] text-[#C62828] shrink-0" />
                  <span>Hôn phối (Vợ chồng)</span>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowLegend(true)}
              className="bg-white/90 hover:bg-white text-stone-700 px-3 py-1.5 rounded-xl border border-stone-300 shadow-md text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <Info className="w-3.5 h-3.5 text-[#1E5F52]" />
              <span>Xem chú giải</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
