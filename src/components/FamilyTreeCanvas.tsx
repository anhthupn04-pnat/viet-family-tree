"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Heart,
  RefreshCw,
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
    className={`w-20 h-14 sm:w-28 sm:h-18 text-[#E0A926] shrink-0 drop-shadow-md transition-transform ${
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

// Vertical Red Scroll Couplet (Câu đối đỏ hai bên cuốn thư)
const VerticalScroll = ({ text, position }: { text: string; position: "left" | "right" }) => {
  const characters = text.split("");
  return (
    <div
      className={`hidden lg:flex flex-col items-center py-2 px-1 rounded-sm shadow-md border border-[#E0A926] bg-[#C62828] text-white z-10 w-8 shrink-0 ${
        position === "left" ? "mr-3" : "ml-3"
      }`}
    >
      <div className="w-10 h-2 bg-gradient-to-r from-[#D97706] via-[#FADB7F] to-[#D97706] rounded-sm -mt-3 border border-[#92400E] shadow-xs"></div>
      <div className="flex flex-col items-center justify-around flex-1 py-1.5 space-y-1 font-serif text-[10px] font-bold text-[#FADB7F] tracking-widest select-none">
        {characters.map((char, index) => (
          <span key={index} className="leading-tight block">
            {char}
          </span>
        ))}
      </div>
      <div className="w-10 h-2 bg-gradient-to-r from-[#D97706] via-[#FADB7F] to-[#D97706] rounded-sm -mb-3 border border-[#92400E] shadow-xs"></div>
    </div>
  );
};

// Layout geometry constants
const CARD_WIDTH = 186;
const CARD_HEIGHT = 124;
const SPOUSE_GAP = 10;
const SIBLING_GAP = 32;
const ROW_GAP = 96;
const ROW_START_Y = 160;

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

export default function FamilyTreeCanvas({
  onSelectMember,
  onOpenAddMember,
  onOpenKinshipForMember,
  onOpenKinshipForTwo,
  onOpenCreateClan,
  isAdmin,
  clanName = "Gia phả dòng họ",
}: FamilyTreeCanvasProps) {
  const [members, setMembers] = useState<MemberNode[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Kinship 2-person comparison mode
  const [kinshipCompareMode, setKinshipCompareMode] = useState<boolean>(false);
  const [kinshipNodeA, setKinshipNodeA] = useState<MemberNode | null>(null);
  const [kinshipNodeB, setKinshipNodeB] = useState<MemberNode | null>(null);

  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Canvas zoom & pan state
  const [scale, setScale] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
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

      if (dataTree.members) {
        setMembers(dataTree.members);
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
    setScale(0.85);
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

  // Roman numeral generation symbols
  const romanGenerations = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  // =========================================================================
  // TREE HIERARCHY LAYOUT ALGORITHM (ORTHOGONAL TREE)
  // =========================================================================
  const { rootUnits, allUnitsMap, maxGeneration, connectors } = useMemo(() => {
    if (members.length === 0) {
      return { rootUnits: [], allUnitsMap: new Map(), maxGeneration: 1, connectors: [] };
    }

    const memberMap = new Map<string, MemberNode>();
    members.forEach((m) => memberMap.set(m.id, m));

    // Identify spouses who don't have parents in tree (in-laws)
    const spouseSet = new Set<string>();
    members.forEach((m) => {
      if (m.spouses && m.spouses.length > 0) {
        m.spouses.forEach((sp: any) => {
          const spMember = memberMap.get(sp.id);
          // If spouse has no father and mother, consider them a paired spouse
          if (spMember && !spMember.fatherId && !spMember.motherId && m.gender === "MALE") {
            spouseSet.add(spMember.id);
          }
        });
      }
    });

    // Build children mapping for primary members
    const childrenMap = new Map<string, MemberNode[]>();
    members.forEach((m) => {
      const pId = m.fatherId || m.motherId;
      if (pId) {
        if (!childrenMap.has(pId)) childrenMap.set(pId, []);
        childrenMap.get(pId)!.push(m);
      }
    });

    // Create TreeUnits recursively
    const buildTreeUnit = (m: MemberNode): TreeUnit => {
      // Find spouse if any
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

      // Children of this member
      const rawChildren = childrenMap.get(m.id) || [];
      // Also check spouse's children if any
      if (pairedSpouse && childrenMap.has(pairedSpouse.id)) {
        const spouseChildren = childrenMap.get(pairedSpouse.id) || [];
        spouseChildren.forEach((sc) => {
          if (!rawChildren.some((c) => c.id === sc.id)) {
            rawChildren.push(sc);
          }
        });
      }

      // Filter out spouse members from children list if any
      const directChildren = rawChildren.filter((c) => !spouseSet.has(c.id));
      // Sort children by generation, then birth solar or id
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

    // Find root members (Generation 1 or no parent)
    const roots = members.filter(
      (m) => (!m.fatherId && !m.motherId && !spouseSet.has(m.id)) || m.generation === 1
    );

    // If multiple roots, deduplicate if already covered
    const distinctRoots = roots.filter(
      (r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx && !spouseSet.has(r.id)
    );

    const rootUnitsList: TreeUnit[] = distinctRoots.map(buildTreeUnit);

    // 1st pass: Calculate subtree widths bottom-up
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

    // 2nd pass: Assign coordinates top-down
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

        // Center parent over its children
        const firstChild = unit.children[0];
        const lastChild = unit.children[unit.children.length - 1];
        const firstCenter = firstChild.x + firstChild.width / 2;
        const lastCenter = lastChild.x + lastChild.width / 2;
        unit.x = (firstCenter + lastCenter) / 2 - unit.width / 2;

        // If parent would be pushed before `left`, adjust
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

    let startX = 60;
    rootUnitsList.forEach((ru) => {
      assignCoords(ru, startX);
      startX += ru.subtreeWidth + 40;
    });

    // 3rd pass: Generate orthogonal connector lines
    // Path: Bottom of parent -> vertical drop to midY -> horizontal branch -> vertical drop to top of each child
    interface ConnectorPath {
      parentId: string;
      childId: string;
      parentUnit: TreeUnit;
      childUnit: TreeUnit;
      pathString: string;
      midY: number;
      branchMinX: number;
      branchMaxX: number;
      isHighlighted: boolean;
    }

    const connectorList: ConnectorPath[] = [];

    // Check ancestral path if 2 nodes are selected for kinship comparison
    const kinshipPathSet = new Set<string>(); // "parent_id->child_id"
    if (kinshipNodeA && kinshipNodeB) {
      // Trace lineage of A
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

      // Find LCA
      const lca = ancestorsA.find((id) => ancestorsB.includes(id));
      if (lca) {
        // Add edges from A to LCA
        for (let i = 0; i < ancestorsA.indexOf(lca); i++) {
          kinshipPathSet.add(`${ancestorsA[i + 1]}->${ancestorsA[i]}`);
        }
        // Add edges from B to LCA
        for (let i = 0; i < ancestorsB.indexOf(lca); i++) {
          kinshipPathSet.add(`${ancestorsB[i + 1]}->${ancestorsB[i]}`);
        }
      }
    }

    const collectConnectors = (unit: TreeUnit) => {
      if (unit.children.length > 0) {
        // Parent connector starting point: bottom center of father card
        const parentX = unit.x + CARD_WIDTH / 2;
        const parentY = unit.y + CARD_HEIGHT;

        // Children top centers
        const childPoints = unit.children.map((c) => ({
          id: c.primary.id,
          unit: c,
          x: c.x + CARD_WIDTH / 2,
          y: c.y,
        }));

        const midY = parentY + ROW_GAP / 2;
        const allXs = [parentX, ...childPoints.map((cp) => cp.x)];
        const branchMinX = Math.min(...allXs);
        const branchMaxX = Math.max(...allXs);

        childPoints.forEach((cp) => {
          // Orthogonal path: Parent bottom -> Mid Y -> Horizontal -> Child Top
          const isEdgeHighlighted =
            kinshipPathSet.has(`${unit.primary.id}->${cp.id}`) ||
            (unit.spouse && kinshipPathSet.has(`${unit.spouse.id}->${cp.id}`));

          // SVG orthogonal path: M parentX,parentY V midY H cp.x V cp.y
          const d = `M ${parentX} ${parentY} V ${midY} H ${cp.x} V ${cp.y}`;

          connectorList.push({
            parentId: unit.primary.id,
            childId: cp.id,
            parentUnit: unit,
            childUnit: cp.unit,
            pathString: d,
            midY,
            branchMinX,
            branchMaxX,
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
      maxGeneration: Math.max(maxGenFound, 5),
      connectors: connectorList,
    };
  }, [members, kinshipNodeA, kinshipNodeB]);

  // Handle clicking a node card
  const handleCardClick = (member: MemberNode) => {
    if (kinshipCompareMode) {
      if (!kinshipNodeA) {
        setKinshipNodeA(member);
      } else if (kinshipNodeA.id === member.id) {
        setKinshipNodeA(null);
      } else {
        setKinshipNodeB(member);
        // Automatically trigger kinship calculation modal
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

  // Helper to render an individual Member Card
  const renderCard = (
    member: MemberNode,
    isSpouse = false,
    partnerName?: string
  ) => {
    const isHighlighted = highlightedMemberId === member.id;
    const isFemale = member.gender === "FEMALE";
    const isNodeA = kinshipNodeA?.id === member.id;
    const isNodeB = kinshipNodeB?.id === member.id;

    return (
      <div
        key={member.id}
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick(member);
        }}
        style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}
        className={`rounded-xl p-2.5 cursor-pointer transition-all duration-200 border relative flex flex-col justify-between shadow-md select-none ${
          isNodeA
            ? "ring-4 ring-[#E0A926] shadow-2xl border-[#E0A926] bg-[#16483E] scale-105 z-30"
            : isNodeB
            ? "ring-4 ring-[#F06292] shadow-2xl border-[#F06292] bg-[#16483E] scale-105 z-30"
            : isHighlighted
            ? "ring-4 ring-[#E0A926] shadow-xl border-[#E0A926] scale-105 z-20"
            : "border-[#E0A926]/40 hover:border-[#E0A926] hover:shadow-xl hover:scale-102"
        } ${
          isSpouse
            ? "bg-gradient-to-br from-[#1E5F52]/90 to-[#236c5d] text-pink-50"
            : "bg-gradient-to-br from-[#1E5F52] to-[#2B7A6A] text-white"
        }`}
      >
        {/* Kinship Selection Badge */}
        {isNodeA && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#E0A926] text-[#24150B] font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md border border-white flex items-center space-x-1 whitespace-nowrap">
            <span>① Tôi (Đang chọn)</span>
          </div>
        )}
        {isNodeB && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F06292] text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-md border border-white flex items-center space-x-1 whitespace-nowrap">
            <span>② Đối chiếu</span>
          </div>
        )}

        {/* Top Header: Avatar + Status + Quick Kinship trigger */}
        <div className="flex items-center justify-between">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-xs overflow-hidden shrink-0 ${
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

          <div className="flex items-center space-x-1">
            {/* Quick compare button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setKinshipCompareMode(true);
                setKinshipNodeA(member);
              }}
              title="Chọn người này để đối chiếu xưng hô trực hệ/bàng hệ"
              className="p-1 rounded-full bg-white/10 hover:bg-[#E0A926] hover:text-[#24150B] text-amber-200 transition-colors"
            >
              <Compass className="w-3 h-3" />
            </button>

            {/* Alive / Deceased / Martyr Badge */}
            {member.biography?.toLowerCase().includes("liệt sĩ") ||
            member.courtesyName?.toLowerCase().includes("liệt sĩ") ? (
              <span
                className="text-[8px] font-black px-1.5 py-0.2 rounded-full border bg-red-500/30 text-amber-200 border-red-400"
                title="Liệt sĩ vẻ vang"
              >
                LS
              </span>
            ) : (
              <span
                className={`text-[8px] font-black px-1.5 py-0.2 rounded-full border ${
                  member.isAlive
                    ? "bg-emerald-400/20 text-emerald-200 border-emerald-400/40"
                    : "bg-black/30 text-stone-300 border-stone-500/40"
                }`}
                title={member.isAlive ? "Còn sống" : "Đã mất"}
              >
                {member.isAlive ? "C" : "M"}
              </span>
            )}
          </div>
        </div>

        {/* Member Full Name */}
        <div className="text-center my-0.5">
          <h4 className="font-serif font-bold text-xs text-white tracking-wide uppercase line-clamp-1">
            {member.fullName}
          </h4>
          {member.courtesyName && (
            <p className="text-[9px] text-[#FADB7F] italic line-clamp-1">
              ({member.courtesyName})
            </p>
          )}
        </div>

        {/* Footer Details: Years & Branch info */}
        <div className="pt-1 border-t border-white/20 text-[9px] text-emerald-100/90 text-center space-y-0.5">
          <p className="text-[9px] text-amber-200 font-mono">
            {member.birthSolar?.slice(0, 4) || "--"} -{" "}
            {member.isAlive ? "nay" : member.deathSolar?.slice(0, 4) || "--"}
          </p>
          <p className="line-clamp-1 text-[9px] text-emerald-200">
            {isSpouse && partnerName
              ? `Chính thất: ${partnerName}`
              : member.branchName?.replace("Chi họ ", "Chi ") || "Trực hệ chính"}
          </p>
        </div>
      </div>
    );
  };

  // Render a Tree Unit (Primary member + optional spouse beside)
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
        className="flex items-center space-x-2.5 z-10"
      >
        {/* Primary member card */}
        {renderCard(unit.primary)}

        {/* Marriage connector ring/heart if spouse present */}
        {unit.spouse && (
          <div className="flex items-center -mx-1 shrink-0 z-20">
            <div
              className="w-5 h-5 rounded-full bg-[#E0A926] border border-white flex items-center justify-center text-[#24150B] shadow-sm"
              title="Quan hệ Hôn phối"
            >
              <Heart className="w-2.5 h-2.5 fill-current text-[#C62828]" />
            </div>
          </div>
        )}

        {/* Spouse card */}
        {unit.spouse && renderCard(unit.spouse, true, unit.primary.fullName)}
      </div>
    );
  };

  // Flatten all units for rendering
  const allRenderUnits: TreeUnit[] = [];
  const collectAllUnits = (u: TreeUnit) => {
    allRenderUnits.push(u);
    u.children.forEach(collectAllUnits);
  };
  rootUnits.forEach(collectAllUnits);

  return (
    <div className="relative w-full h-[calc(100vh-140px)] min-h-[660px] bg-[#FDFBF7] overflow-hidden flex border border-[#E8DEC7] rounded-3xl shadow-xs">
      {/* 1. Left Collapsible Sidebar */}
      <div
        className={`bg-white border-r border-[#E8DEC7] transition-all duration-300 z-20 flex flex-col shrink-0 ${
          sidebarOpen ? "w-72" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-4 border-b border-[#E8DEC7] bg-[#FDFBF7] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-[#1E5F52] flex items-center justify-center text-[#FADB7F]">
              <Flower2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-serif font-bold text-sm text-[#1E5F52]">
              Gia phả dòng họ
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-100"
            title="Thu gọn"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-stone-100">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên thành viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#1E5F52]"
            />
          </form>
        </div>

        {/* Clan Overview Card */}
        <div className="p-3 flex-1 overflow-y-auto space-y-2.5">
          <div className="p-3.5 rounded-2xl border-2 border-[#E0A926] bg-gradient-to-br from-[#FAF7EE] to-[#F5EEDC] shadow-xs">
            <div className="flex items-center space-x-1.5 mb-1">
              <span className="bg-[#C62828] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Chính Tông
              </span>
              <span className="bg-[#1E5F52]/10 text-[#1E5F52] text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#1E5F52]/20">
                Trực hệ chuẩn
              </span>
            </div>
            <h4 className="font-serif font-bold text-xs text-[#1E5F52]">
              {clanName}
            </h4>
            <p className="text-[10px] text-stone-500 mt-1">
              {maxGeneration} thế hệ • {members.length} thành viên
            </p>
          </div>

          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-1 pt-1">
            Lọc Theo Chi Nhánh
          </p>

          <button
            type="button"
            onClick={() => setSelectedBranch("ALL")}
            className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
              selectedBranch === "ALL"
                ? "bg-[#1E5F52] text-white border-[#1E5F52] shadow-xs"
                : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
            }`}
          >
            Toàn bộ dòng họ (Tất cả chi)
          </button>

          {branches.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelectedBranch(b.id)}
              className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all ${
                selectedBranch === b.id
                  ? "bg-[#1E5F52] text-white border-[#1E5F52] shadow-xs"
                  : "bg-white hover:bg-stone-50 border-stone-200 text-stone-700"
              }`}
            >
              {b.branchName}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar expand button */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="absolute left-3 top-3 z-30 p-2 bg-white/95 rounded-xl border border-[#E8DEC7] text-stone-600 shadow-md hover:text-[#1E5F52] transition-colors"
          title="Mở danh mục dòng họ"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* 2. Controls Toolbar & Kinship Compare Indicator */}
      <div className="absolute top-3 right-4 z-30 flex items-center space-x-2">
        {/* Kinship Mode Toggle Pill */}
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
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-md border ${
            kinshipCompareMode
              ? "bg-[#E0A926] text-[#24150B] border-[#92400E] animate-pulse"
              : "bg-white text-stone-700 hover:bg-amber-50 border-stone-200"
          }`}
          title="Bật chế độ click 2 người để làm nổi bật đường nối và đối chiếu xưng hô"
        >
          <Compass className="w-3.5 h-3.5 text-[#C62828]" />
          <span>{kinshipCompareMode ? "Đang chọn 2 người..." : "Đối chiếu xưng hô"}</span>
        </button>

        {kinshipNodeA && (
          <button
            type="button"
            onClick={() => {
              setKinshipNodeA(null);
              setKinshipNodeB(null);
            }}
            className="p-1.5 rounded-xl bg-white border border-stone-200 text-stone-500 hover:text-red-600 shadow-xs"
            title="Hủy chọn đối chiếu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Zoom Controls */}
        <div className="bg-white/95 backdrop-blur-xs rounded-xl border border-[#E8DEC7] p-1 flex items-center space-x-1 shadow-md">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 font-mono text-[10px]"
            title="Căn giữa"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setIsLocked(!isLocked)}
            className={`p-1.5 rounded-lg transition-colors ${
              isLocked
                ? "bg-[#C62828] text-white"
                : "hover:bg-stone-100 text-stone-600"
            }`}
            title={isLocked ? "Mở khóa di chuyển" : "Khóa vị trí"}
          >
            {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 3. Main Interactive Canvas */}
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
                Đang dựng sơ đồ trực hệ gia phả...
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
            className="inline-block p-8 min-w-[2000px] min-h-[1400px] relative"
          >
            {/* TOP HEADER: Banner cuốn thư đỏ son ghi chữ "Gia phả dòng họ" flanked by Dual Golden Dragons */}
            <div className="flex items-center justify-center mb-10 relative px-4">
              <VerticalScroll text="TổTiênCôngĐứcThiênNiênThịnh" position="left" />
              <GoldenDragon flip={false} />

              <div className="relative mx-3 max-w-xl text-center px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#991B1B] via-[#C62828] to-[#991B1B] text-white border-2 border-[#E0A926] shadow-xl">
                <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-[#E0A926] border border-white"></div>
                <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#E0A926] border border-white"></div>
                <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 rounded-full bg-[#E0A926] border border-white"></div>
                <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#E0A926] border border-white"></div>

                <p className="text-[10px] uppercase font-bold tracking-widest text-[#FADB7F] mb-0.5">
                  TÔNG ĐỒ GIA PHẢ CHÍNH THỐNG
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#FADB7F] tracking-wide drop-shadow-sm">
                  Gia phả dòng họ
                </h2>
                <p className="text-[11px] text-amber-100/90 italic font-serif mt-0.5">
                  (Sơ Đồ Phả Hệ Trực Hệ & Quan Hệ Huyết Thống)
                </p>
              </div>

              <GoldenDragon flip={true} />
              <VerticalScroll text="TửHiếuTônHiềnVạnĐạiVinh" position="right" />
            </div>

            {/* LEFT GENERATION RAIL BADGES (Đời I, Đời II, Đời III, Đời IV, Đời V...) */}
            <div className="absolute left-4 top-0 bottom-0 pointer-events-none z-20">
              {Array.from({ length: maxGeneration }, (_, i) => i + 1).map((genNum) => {
                const badgeY = ROW_START_Y + (genNum - 1) * (CARD_HEIGHT + ROW_GAP);
                return (
                  <div
                    key={genNum}
                    style={{
                      position: "absolute",
                      left: "0px",
                      top: `${badgeY + CARD_HEIGHT / 2 - 28}px`,
                    }}
                    className="flex flex-col items-center justify-center w-14"
                  >
                    <div className="w-11 h-11 rounded-full bg-[#1E5F52] border-2 border-[#E0A926] shadow-md flex items-center justify-center text-white font-serif font-black text-xs hover:scale-105 transition-transform">
                      {romanGenerations[genNum] || genNum}
                    </div>
                    <span className="text-[9px] font-bold text-[#1E5F52] mt-0.5 font-serif bg-[#FDFBF7] px-1 rounded-sm border border-[#1E5F52]/20">
                      Đời {genNum}
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

              {connectors.map((conn, idx) => (
                <g key={`${conn.parentId}-${conn.childId}-${idx}`}>
                  {/* Base / Background Orthogonal Line */}
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

                  {/* Joint node circles at orthogonal turns */}
                  {!conn.isHighlighted && (
                    <>
                      {/* Joint point at midY on child branch */}
                      <circle
                        cx={conn.childUnit.x + CARD_WIDTH / 2}
                        cy={conn.midY}
                        r="3"
                        fill="#2E7D68"
                      />
                    </>
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
      </div>
    </div>
  );
}
