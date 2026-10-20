import { Node, Edge, MarkerType } from "@xyflow/react";
import { Member } from "@/types/family";

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 140;
export const SPOUSE_GAP = 28;
export const SIBLING_GAP = 40;
export const FAMILY_GAP = 60;
export const LEVEL_HEIGHT = 270;
export const BASE_Y = 60;
export const BASE_X = 60;

interface TreeUnit {
  id: string;
  primary: Member;
  spouse?: Member;
  generation: number;
  children: TreeUnit[];
  width: number;
  subtreeWidth: number;
  x: number;
  y: number;
}

export interface FamilyLayoutOptions {
  onSelectMember: (m: Member) => void;
  onQuickAddChild: (m: Member) => void;
  onQuickAddSpouse: (m: Member) => void;
  onEditMember: (m: Member) => void;
  focusedMemberId?: string | null;
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

    const unitWidth = secondary ? 2 * NODE_WIDTH + SPOUSE_GAP : NODE_WIDTH;
    const unit: TreeUnit = {
      id: "unit-" + primary.id,
      primary,
      spouse: secondary,
      generation: primary.generation || 1,
      children: [],
      width: unitWidth,
      subtreeWidth: unitWidth,
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

  // 3. Tính toán độ rộng cây con (Subtree Width) từ dưới lên (Bottom-up)
  function computeSubtreeWidth(unit: TreeUnit): number {
    if (unit.children.length === 0) {
      unit.subtreeWidth = unit.width;
      return unit.width;
    }

    // Sắp xếp các con của đơn vị này theo thứ tự anh em (orderInFamily)
    unit.children.sort((a, b) => {
      const orderA = a.primary.orderInFamily ?? 99;
      const orderB = b.primary.orderInFamily ?? 99;
      return orderA - orderB;
    });

    let totalChildWidth = 0;
    unit.children.forEach((c, idx) => {
      const w = computeSubtreeWidth(c);
      totalChildWidth += w;
      if (idx > 0) totalChildWidth += SIBLING_GAP;
    });

    unit.subtreeWidth = Math.max(unit.width, totalChildWidth);
    return unit.subtreeWidth;
  }

  // 4. Bố trí vị trí tọa độ (Top-down) đảm bảo:
  // - Vợ và Chồng đứng song song liền kề nhau trên cùng trục Y
  // - Cặp cha mẹ luôn được căn chính giữa phía trên đàn con của chính họ
  // - Các nhánh con cháu độc lập không bị chèn hay đè chéo đường nối
  const nodePositions = new Map<string, { x: number; y: number }>();

  function positionUnitTree(unit: TreeUnit, leftX: number, currentY: number) {
    unit.y = currentY;
    // Căn giữa cặp cha mẹ trong không gian subtree của họ
    unit.x = leftX + (unit.subtreeWidth - unit.width) / 2;

    nodePositions.set(unit.primary.id, { x: unit.x, y: unit.y });
    if (unit.spouse) {
      nodePositions.set(unit.spouse.id, {
        x: unit.x + NODE_WIDTH + SPOUSE_GAP,
        y: unit.y,
      });
    }

    if (unit.children.length > 0) {
      let totalChildrenWidth = 0;
      unit.children.forEach((c, idx) => {
        totalChildrenWidth += c.subtreeWidth;
        if (idx > 0) totalChildrenWidth += SIBLING_GAP;
      });

      // Căn giữa tập hợp các con ngay bên dưới cha mẹ
      let childLeftX = leftX + (unit.subtreeWidth - totalChildrenWidth) / 2;
      const nextY = currentY + LEVEL_HEIGHT;

      unit.children.forEach((child) => {
        positionUnitTree(child, childLeftX, nextY);
        childLeftX += child.subtreeWidth + SIBLING_GAP;
      });
    }
  }

  let currentRootX = BASE_X;
  rootUnits.forEach((root) => {
    computeSubtreeWidth(root);
    positionUnitTree(root, currentRootX, BASE_Y);
    currentRootX += root.subtreeWidth + FAMILY_GAP;
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

  // A. Đường nối hôn phối ngang (Vợ và Chồng song song liền kề có biểu tượng ♥)
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
  });

  // B. Đường nối huyết thống trực giao dạng chữ T (Orthogonal Step Lines)
  // Đâm từ giữa cặp cha mẹ xuống nhánh ngang rồi rẽ nhánh thẳng đứng vào từng người con của CHÍNH HỌ
  units.forEach((unit) => {
    if (unit.children.length === 0) return;

    // Tọa độ xuất phát:
    // Nếu có cả cha và mẹ: đâm từ chính giữa khoảng hở giữa 2 thẻ
    // Nếu chỉ có đơn thân: đâm từ chính giữa đáy thẻ
    const startX = unit.spouse
      ? unit.x + NODE_WIDTH + SPOUSE_GAP / 2
      : unit.x + NODE_WIDTH / 2;
    const startY = unit.y + NODE_HEIGHT;

    // Nhánh ngang (branch level Y) nằm ở vị trí 50% khoảng cách giữa 2 đời
    const branchY = startY + (LEVEL_HEIGHT - NODE_HEIGHT) / 2;

    unit.children.forEach((childUnit) => {
      const child = childUnit.primary;
      edges.push({
        id: `edge-lineage-${unit.primary.id}-${child.id}`,
        source: unit.primary.id,
        target: child.id,
        type: "orthogonalBloodline",
        data: {
          startX,
          startY,
          branchY,
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
  });

  return { nodes, edges };
}
