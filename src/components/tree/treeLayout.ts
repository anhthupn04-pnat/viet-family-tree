import { Node, Edge, MarkerType } from "@xyflow/react";
import { MemberNode } from "@/components/FamilyTreeCanvas";

const NODE_WIDTH = 220;
const NODE_HEIGHT = 145;
const SPOUSE_GAP = 28;
const SIBLING_GAP = 48;
const LEVEL_HEIGHT = 250;
const BASE_Y = 60;
const BASE_X = 60;

interface FamilyUnit {
  primary: MemberNode;
  spouse?: MemberNode;
  children: MemberNode[];
  width: number;
  x: number;
  y: number;
}

export function computeFamilyTreeLayout(
  members: MemberNode[],
  options: {
    isAdmin: boolean;
    focusedMemberId?: string | null;
    onSelectMember: (m: MemberNode) => void;
    onQuickAdd: (type: "child" | "spouse" | "parent", targetMember: MemberNode) => void;
    onEditMember: (m: MemberNode) => void;
  }
): { nodes: Node[]; edges: Edge[] } {
  if (!members || members.length === 0) {
    return { nodes: [], edges: [] };
  }

  const memberMap = new Map<string, MemberNode>();
  members.forEach((m) => memberMap.set(m.id, m));

  // Determine generations present in data
  const genMap = new Map<number, MemberNode[]>();
  members.forEach((m) => {
    const gen = m.generation || 1;
    if (!genMap.has(gen)) {
      genMap.set(gen, []);
    }
    genMap.get(gen)!.push(m);
  });

  const sortedGens = Array.from(genMap.keys()).sort((a, b) => a - b);
  const nodePositions = new Map<string, { x: number; y: number }>();

  // Process generation by generation
  let globalMaxX = BASE_X;

  sortedGens.forEach((gen, genIndex) => {
    const genMembers = genMap.get(gen)!;
    const handledInGen = new Set<string>();
    const units: FamilyUnit[] = [];

    // Group couples and singles
    genMembers.forEach((m) => {
      if (handledInGen.has(m.id)) return;

      let spouse: MemberNode | undefined = undefined;
      if (m.spouseId && memberMap.has(m.spouseId)) {
        const sp = memberMap.get(m.spouseId)!;
        if (sp.generation === gen && !handledInGen.has(sp.id)) {
          spouse = sp;
          handledInGen.add(sp.id);
        }
      }

      // If m is female and spouse is male, swap so male is primary (standard left-to-right lineage)
      let primary = m;
      if (spouse && m.gender === "FEMALE" && spouse.gender === "MALE") {
        primary = spouse;
        spouse = m;
      }
      handledInGen.add(m.id);

      const unitWidth = spouse ? 2 * NODE_WIDTH + SPOUSE_GAP : NODE_WIDTH;
      units.push({
        primary,
        spouse,
        children: [],
        width: unitWidth,
        x: 0,
        y: BASE_Y + (gen - 1) * LEVEL_HEIGHT,
      });
    });

    // Position units on this generation
    let currentX = BASE_X;

    if (genIndex === 0) {
      // First generation: place centered or sequentially
      units.forEach((unit) => {
        unit.x = currentX;
        currentX += unit.width + SIBLING_GAP * 2;
      });
    } else {
      // Subsequent generations: group by parent if possible
      units.forEach((unit) => {
        const fatherId = unit.primary.fatherId || (unit.spouse ? unit.spouse.fatherId : null);
        const motherId = unit.primary.motherId || (unit.spouse ? unit.spouse.motherId : null);

        let parentCenterX: number | null = null;
        if (fatherId && nodePositions.has(fatherId)) {
          const fPos = nodePositions.get(fatherId)!;
          if (motherId && nodePositions.has(motherId)) {
            const mPos = nodePositions.get(motherId)!;
            parentCenterX = (fPos.x + mPos.x + NODE_WIDTH) / 2;
          } else {
            parentCenterX = fPos.x + NODE_WIDTH / 2;
          }
        } else if (motherId && nodePositions.has(motherId)) {
          const mPos = nodePositions.get(motherId)!;
          parentCenterX = mPos.x + NODE_WIDTH / 2;
        }

        if (parentCenterX !== null) {
          // Desired ideal position centered below parent
          const idealX = parentCenterX - unit.width / 2;
          unit.x = Math.max(currentX, idealX);
        } else {
          unit.x = currentX;
        }

        currentX = unit.x + unit.width + SIBLING_GAP;
      });
    }

    if (currentX > globalMaxX) {
      globalMaxX = currentX;
    }

    // Save positions of each member in the unit
    units.forEach((unit) => {
      nodePositions.set(unit.primary.id, { x: unit.x, y: unit.y });
      if (unit.spouse) {
        nodePositions.set(unit.spouse.id, {
          x: unit.x + NODE_WIDTH + SPOUSE_GAP,
          y: unit.y,
        });
      }
    });
  });

  // Build React Flow nodes
  const nodes: Node[] = members.map((m) => {
    const pos = nodePositions.get(m.id) || { x: BASE_X, y: BASE_Y };
    return {
      id: m.id,
      type: "familyNode",
      position: pos,
      data: {
        member: m,
        isAdmin: options.isAdmin,
        isFocused: options.focusedMemberId === m.id,
        onSelectMember: options.onSelectMember,
        onQuickAdd: options.onQuickAdd,
        onEditMember: options.onEditMember,
      },
    };
  });

  // Build React Flow edges
  const edges: Edge[] = [];
  const handledSpouseEdges = new Set<string>();

  members.forEach((m) => {
    // 1. Spouse horizontal dashed edge
    if (m.spouseId && memberMap.has(m.spouseId)) {
      const spouse = memberMap.get(m.spouseId)!;
      const pairKey = [m.id, spouse.id].sort().join("---");
      if (!handledSpouseEdges.has(pairKey)) {
        handledSpouseEdges.add(pairKey);

        const mPos = nodePositions.get(m.id);
        const sPos = nodePositions.get(spouse.id);

        if (mPos && sPos) {
          // Husband to wife or left-to-right
          const [leftNode, rightNode] = mPos.x <= sPos.x ? [m, spouse] : [spouse, m];

          edges.push({
            id: `edge-spouse-${leftNode.id}-${rightNode.id}`,
            source: leftNode.id,
            target: rightNode.id,
            sourceHandle: "spouse-right",
            targetHandle: "spouse-left",
            type: "straight",
            style: {
              stroke: "#E11D48",
              strokeWidth: 2,
              strokeDasharray: "4 4",
            },
            label: "♥",
            labelStyle: {
              fill: "#E11D48",
              fontWeight: 700,
              fontSize: 12,
            },
          });
        }
      }
    }

    // 2. Parent-to-Child descent edge
    // Connect from Father if available, or Mother if father is not recorded
    const parentId = m.fatherId || m.motherId;
    if (parentId && memberMap.has(parentId)) {
      edges.push({
        id: `edge-lineage-${parentId}-${m.id}`,
        source: parentId,
        target: m.id,
        type: "smoothstep",
        style: {
          stroke: "#8B1D1D",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#8B1D1D",
          width: 12,
          height: 12,
        },
      });
    }
  });

  return { nodes, edges };
}
