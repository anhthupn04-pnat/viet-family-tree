import { Node, Edge, MarkerType } from "@xyflow/react";
import { Member } from "@/types/family";

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 140;
export const SPOUSE_GAP = 28;
export const SIBLING_GAP = 40;
export const FAMILY_GAP = 60;
export const LEVEL_HEIGHT = 270;
export const LEVEL_WIDTH_H = 340;
export const SIBLING_GAP_H = 36;
export const FAMILY_GAP_H = 50;
export const BASE_Y = 60;
export const BASE_X = 60;

interface TreeUnit {
  id: string;
  primary: Member;
  spouse?: Member;
  generation: number;
  children: TreeUnit[];
  width: number;
  stemOffset: number;
  dropOffset: number;
  subtreeWidth: number;
  relativeX: number;
  childOffsets: number[];
  relativeDropX: number;
  relativeStemX: number;
  x: number;
  y: number;
}

export interface FamilyLayoutOptions {
  onSelectMember: (m: Member) => void;
  onQuickAddChild: (m: Member) => void;
  onQuickAddSpouse: (m: Member) => void;
  onEditMember: (m: Member) => void;
  focusedMemberId?: string | null;
  orientation?: "vertical" | "horizontal";
}

export function computeFamilyTreeLayout(
  members: Member[],
  options: FamilyLayoutOptions
): { nodes: Node[]; edges: Edge[] } {
  if (!members || members.length === 0) {
    return { nodes: [], edges: [] };
  }

  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  // 1. Phân nhóm các đơn vị gia đình (TreeUnit: Thành viên chính + Vợ/Chồng)
  const handled = new Set<string>();
  const units: TreeUnit[] = [];
  const memberToUnit = new Map<string, TreeUnit>();

  members.forEach((m) => {
    if (handled.has(m.id)) return;

    let spouse: Member | undefined = undefined;
    if (m.spouseId && memberMap.has(m.spouseId)) {
      spouse = memberMap.get(m.spouseId);
    }

    let primary = m;
    let secondary = spouse;

    if (spouse) {
      handled.add(spouse.id);

      // Nếu một người là con ruột trong dòng họ (có cha/mẹ) còn người kia là dâu/rể,
      // thì người con ruột luôn là primary để bảo toàn huyết thống dòng họ gốc
      const mHasParents = Boolean(m.fatherId || m.motherId);
      const spHasParents = Boolean(spouse.fatherId || spouse.motherId);

      if (spHasParents && !mHasParents) {
        primary = spouse;
        secondary = m;
      } else if (mHasParents && !spHasParents) {
        // m là con ruột (ví dụ con gái trong họ lấy rể), m PHẢI GIỮ LÀ PRIMARY
        primary = m;
        secondary = spouse;
      } else if (primary.gender === "female" && spouse.gender === "male") {
        primary = spouse;
        secondary = m;
      }
    }
    handled.add(m.id);

    const isHorizontal = options.orientation === "horizontal";
    const unitSpreadSize = isHorizontal
      ? secondary
        ? 2 * NODE_HEIGHT + SPOUSE_GAP
        : NODE_HEIGHT
      : secondary
      ? 2 * NODE_WIDTH + SPOUSE_GAP
      : NODE_WIDTH;

    const stemOffset = isHorizontal
      ? secondary
        ? NODE_HEIGHT + SPOUSE_GAP / 2
        : NODE_HEIGHT / 2
      : secondary
      ? NODE_WIDTH + SPOUSE_GAP / 2
      : NODE_WIDTH / 2;

    const dropOffset = isHorizontal ? NODE_HEIGHT / 2 : NODE_WIDTH / 2;

    const unit: TreeUnit = {
      id: "unit-" + primary.id,
      primary,
      spouse: secondary,
      generation: primary.generation || 1,
      children: [],
      width: unitSpreadSize,
      stemOffset,
      dropOffset,
      subtreeWidth: unitSpreadSize,
      relativeX: 0,
      childOffsets: [],
      relativeDropX: dropOffset,
      relativeStemX: stemOffset,
      x: 0,
      y: 0,
    };

    units.push(unit);
    memberToUnit.set(primary.id, unit);
    if (secondary) {
      memberToUnit.set(secondary.id, unit);
    }
  });

  // 2. Thiết lập quan hệ Phụ mẫu -> Con cái theo mẫu cây phả hệ
  // Mỗi người con chỉ thuộc về DUY NHẤT một cặp phụ mẫu của chính họ
  const rootUnits: TreeUnit[] = [];

  units.forEach((unit) => {
    // Kiểm tra cha/mẹ của cả primary lẫn spouse (hỗ trợ cả con trai lẫn con gái trong họ)
    const fatherId = unit.primary.fatherId || unit.spouse?.fatherId;
    const motherId = unit.primary.motherId || unit.spouse?.motherId;

    let parentUnit: TreeUnit | null = null;
    if (fatherId && memberToUnit.has(fatherId)) {
      parentUnit = memberToUnit.get(fatherId)!;
    } else if (motherId && memberToUnit.has(motherId)) {
      parentUnit = memberToUnit.get(motherId)!;
    }

    if (parentUnit && parentUnit !== unit) {
      parentUnit.children.push(unit);
    } else {
      rootUnits.push(unit);
    }
  });

  // Sắp xếp các nhánh gốc theo thế hệ và thứ tự gia đình
  rootUnits.sort((a, b) => {
    if (a.generation !== b.generation) return a.generation - b.generation;
    return (a.primary.orderInFamily || 99) - (b.primary.orderInFamily || 99);
  });

  const isHorizontal = options.orientation === "horizontal";
  const siblingGap = isHorizontal ? SIBLING_GAP_H : SIBLING_GAP;
  const familyGap = isHorizontal ? FAMILY_GAP_H : FAMILY_GAP;

  // 3. Tính toán bố cục cây con (Hierarchical Recursive Subtree Layout) từ dưới lên (Bottom-up)
  // Đảm bảo: Điểm đâm nhánh từ cha mẹ (stemX/stemY) luôn ở CHÍNH GIỮA các điểm neo huyết thống của con (dropX/dropY)
  function layoutSubtree(unit: TreeUnit): number {
    if (unit.children.length === 0) {
      unit.subtreeWidth = unit.width;
      unit.relativeX = 0;
      unit.childOffsets = [];
      unit.relativeDropX = unit.dropOffset;
      unit.relativeStemX = unit.stemOffset;
      return unit.subtreeWidth;
    }

    // Sắp xếp các con của đơn vị này theo thứ tự anh em (orderInFamily)
    unit.children.sort((a, b) => {
      const orderA = a.primary.orderInFamily ?? 99;
      const orderB = b.primary.orderInFamily ?? 99;
      return orderA - orderB;
    });

    // 3.1 Tính toán bố cục các cây con của đàn con
    const childOffsets: number[] = [];
    let currentChildSpread = 0;

    unit.children.forEach((child, idx) => {
      layoutSubtree(child);
      if (idx > 0) currentChildSpread += siblingGap;
      childOffsets.push(currentChildSpread);
      currentChildSpread += child.subtreeWidth;
    });

    const totalChildrenSpread = currentChildSpread;

    // 3.2 Xác định điểm neo huyết thống (drop point) của người con đầu và người con cuối
    const firstChild = unit.children[0];
    const lastChild = unit.children[unit.children.length - 1];

    const firstDrop = childOffsets[0] + firstChild.relativeDropX;
    const lastDrop =
      childOffsets[childOffsets.length - 1] + lastChild.relativeDropX;

    // Điểm đâm nhánh lý tưởng của cha mẹ: CHÍNH GIỮA 2 ĐIỂM CON BIÊN
    const idealStem = (firstDrop + lastDrop) / 2;

    // Tọa độ tương đối của cha mẹ để stem trùng khít với idealStem
    let parentRelative = idealStem - unit.stemOffset;

    // 3.3 Kiểm tra vùng bao bao phủ cả cha mẹ lẫn các con
    const minSpread = Math.min(0, parentRelative);
    const maxSpread = Math.max(totalChildrenSpread, parentRelative + unit.width);

    // Nếu cha mẹ mở rộng về phía bên trái (minSpread < 0), tịnh tiến toàn bộ cây sang phải
    const shift = -minSpread;
    parentRelative += shift;
    for (let i = 0; i < childOffsets.length; i++) {
      childOffsets[i] += shift;
    }

    unit.subtreeWidth = maxSpread + shift;
    unit.relativeX = parentRelative;
    unit.childOffsets = childOffsets;
    unit.relativeDropX = unit.relativeX + unit.dropOffset;
    unit.relativeStemX = unit.relativeX + unit.stemOffset;

    return unit.subtreeWidth;
  }

  // 4. Gán tọa độ toàn cục (Top-down Coordinates Assignment)
  const nodePositions = new Map<string, { x: number; y: number }>();

  function assignCoordinates(
    unit: TreeUnit,
    subtreeOrigin: number,
    levelCoord: number
  ) {
    if (isHorizontal) {
      unit.x = levelCoord;
      unit.y = subtreeOrigin + unit.relativeX;

      nodePositions.set(unit.primary.id, { x: unit.x, y: unit.y });
      if (unit.spouse) {
        nodePositions.set(unit.spouse.id, {
          x: unit.x,
          y: unit.y + NODE_HEIGHT + SPOUSE_GAP,
        });
      }

      const nextLevel = levelCoord + LEVEL_WIDTH_H;
      unit.children.forEach((child, idx) => {
        const childOrigin = subtreeOrigin + unit.childOffsets[idx];
        assignCoordinates(child, childOrigin, nextLevel);
      });
    } else {
      unit.x = subtreeOrigin + unit.relativeX;
      unit.y = levelCoord;

      nodePositions.set(unit.primary.id, { x: unit.x, y: unit.y });
      if (unit.spouse) {
        nodePositions.set(unit.spouse.id, {
          x: unit.x + NODE_WIDTH + SPOUSE_GAP,
          y: unit.y,
        });
      }

      const nextLevel = levelCoord + LEVEL_HEIGHT;
      unit.children.forEach((child, idx) => {
        const childOrigin = subtreeOrigin + unit.childOffsets[idx];
        assignCoordinates(child, childOrigin, nextLevel);
      });
    }
  }

  let currentRootOrigin = isHorizontal ? BASE_Y : BASE_X;
  rootUnits.forEach((root) => {
    layoutSubtree(root);
    const rootLevel = isHorizontal
      ? BASE_X + Math.max(0, root.generation - 1) * LEVEL_WIDTH_H
      : BASE_Y + Math.max(0, root.generation - 1) * LEVEL_HEIGHT;
    assignCoordinates(root, currentRootOrigin, rootLevel);
    currentRootOrigin += root.subtreeWidth + familyGap;
  });

  // 5. Tạo danh sách React Flow Nodes
  const nodes: Node[] = members.map((m) => {
    const pos = nodePositions.get(m.id) || { x: BASE_X, y: BASE_Y };
    return {
      id: m.id,
      type: "familyNode",
      position: pos,
      data: {
        member: m,
        isFocused: options.focusedMemberId === m.id,
        onSelectMember: options.onSelectMember,
        onQuickAddChild: options.onQuickAddChild,
        onQuickAddSpouse: options.onQuickAddSpouse,
        onEditMember: options.onEditMember,
      },
    };
  });

  // 6. Tạo danh sách React Flow Edges
  const edges: Edge[] = [];
  const handledSpouseEdges = new Set<string>();

  // A. Đường nối hôn phối (Vợ & Chồng song song)
  units.forEach((unit) => {
    if (unit.spouse) {
      const pairKey = [unit.primary.id, unit.spouse.id].sort().join("---");
      if (!handledSpouseEdges.has(pairKey)) {
        handledSpouseEdges.add(pairKey);

        const leftNode = unit.primary;
        const rightNode = unit.spouse;

        edges.push({
          id: `edge-spouse-${leftNode.id}-${rightNode.id}`,
          source: leftNode.id,
          target: rightNode.id,
          sourceHandle: isHorizontal ? "spouse-bottom" : "spouse-right",
          targetHandle: isHorizontal ? "spouse-top" : "spouse-left",
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
  });

  // B. Đường nối huyết thống trực giao dạng chữ T (Orthogonal Step Lines)
  units.forEach((unit) => {
    if (unit.children.length === 0) return;

    if (isHorizontal) {
      const startX = unit.x + NODE_WIDTH;
      const startY = unit.y + unit.stemOffset;
      const branchCoord = startX + (LEVEL_WIDTH_H - NODE_WIDTH) / 2;

      unit.children.forEach((childUnit) => {
        const child = childUnit.primary;
        edges.push({
          id: `edge-lineage-${unit.primary.id}-${child.id}`,
          source: unit.primary.id,
          target: child.id,
          sourceHandle: "bloodline-right",
          targetHandle: "bloodline-left",
          type: "orthogonalBloodline",
          data: {
            orientation: "horizontal",
            startX,
            startY,
            branchCoord,
          },
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
      });
    } else {
      const startX = unit.x + unit.stemOffset;
      const startY = unit.y + NODE_HEIGHT;
      const branchCoord = startY + (LEVEL_HEIGHT - NODE_HEIGHT) / 2;

      unit.children.forEach((childUnit) => {
        const child = childUnit.primary;
        edges.push({
          id: `edge-lineage-${unit.primary.id}-${child.id}`,
          source: unit.primary.id,
          target: child.id,
          sourceHandle: "bloodline-bottom",
          targetHandle: "bloodline-top",
          type: "orthogonalBloodline",
          data: {
            orientation: "vertical",
            startX,
            startY,
            branchCoord,
          },
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
      });
    }
  });

  return { nodes, edges };
}
