import { Node, Edge, MarkerType } from "@xyflow/react";
import { Member } from "@/types/family";

export const NODE_WIDTH = 220;
export const NODE_HEIGHT = 140;
export const SPOUSE_GAP = 28;
export const SIBLING_GAP = 48;
export const LEVEL_HEIGHT = 270;
export const BASE_Y = 60;
export const BASE_X = 60;

export interface FamilyUnit {
  primary: Member;
  spouse?: Member;
  width: number;
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

  // Phân chia theo thế hệ (đời)
  const genMap = new Map<number, Member[]>();
  members.forEach((m) => {
    const gen = m.generation || 1;
    if (!genMap.has(gen)) {
      genMap.set(gen, []);
    }
    genMap.get(gen)!.push(m);
  });

  const sortedGens = Array.from(genMap.keys()).sort((a, b) => a - b);
  const nodePositions = new Map<string, { x: number; y: number }>();

  // 1. Nhóm các đơn vị gia đình (Family Units: Vợ và Chồng đứng song song liền kề)
  const genUnitsMap = new Map<number, FamilyUnit[]>();

  sortedGens.forEach((gen) => {
    const genMembers = genMap.get(gen)!;
    const handledInGen = new Set<string>();
    const units: FamilyUnit[] = [];

    genMembers.forEach((m) => {
      if (handledInGen.has(m.id)) return;

      let spouse: Member | undefined = undefined;
      if (m.spouseId && memberMap.has(m.spouseId)) {
        const sp = memberMap.get(m.spouseId)!;
        if (sp.generation === gen && !handledInGen.has(sp.id)) {
          spouse = sp;
          handledInGen.add(sp.id);
        }
      }

      // Sắp xếp: Chồng bên trái, Vợ bên phải (song song liền kề)
      let primary = m;
      if (spouse && m.gender === "female" && spouse.gender === "male") {
        primary = spouse;
        spouse = m;
      }
      handledInGen.add(m.id);

      const unitWidth = spouse ? 2 * NODE_WIDTH + SPOUSE_GAP : NODE_WIDTH;
      units.push({
        primary,
        spouse,
        width: unitWidth,
        x: 0,
        y: BASE_Y + (gen - 1) * LEVEL_HEIGHT,
      });
    });

    // Sắp xếp các đơn vị trong cùng thế hệ theo thứ tự con (orderInFamily)
    units.sort((a, b) => {
      const orderA = a.primary.orderInFamily ?? (a.spouse?.orderInFamily ?? 99);
      const orderB = b.primary.orderInFamily ?? (b.spouse?.orderInFamily ?? 99);
      return orderA - orderB;
    });

    genUnitsMap.set(gen, units);
  });

  // 2. Tính toán vị trí X cho từng thế hệ
  // Đặt thế hệ 2 trước hoặc lần lượt để căn giữa hài hòa
  sortedGens.forEach((gen) => {
    const units = genUnitsMap.get(gen) || [];
    let currentX = BASE_X;

    units.forEach((unit) => {
      // Tìm vị trí của cha mẹ nếu có
      const fatherId = unit.primary.fatherId || unit.spouse?.fatherId;
      const motherId = unit.primary.motherId || unit.spouse?.motherId;

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
        const idealX = parentCenterX - unit.width / 2;
        unit.x = Math.max(currentX, idealX);
      } else {
        unit.x = currentX;
      }

      currentX = unit.x + unit.width + SIBLING_GAP;
    });

    // Lưu tọa độ của từng thành viên trong đơn vị
    units.forEach((unit) => {
      nodePositions.set(unit.primary.id, { x: unit.x, y: unit.y });
      if (unit.spouse) {
        // Vợ đứng song song liền kề chồng cùng hàng Y
        nodePositions.set(unit.spouse.id, {
          x: unit.x + NODE_WIDTH + SPOUSE_GAP,
          y: unit.y,
        });
      }
    });
  });

  // Tinh chỉnh: Nếu Đời 1 có con cái ở Đời 2, căn giữa cặp Đời 1 ngay phía trên các con
  const gen1Units = genUnitsMap.get(1) || [];
  const gen2Units = genUnitsMap.get(2) || [];
  if (gen1Units.length === 1 && gen2Units.length > 0) {
    const minGen2X = gen2Units[0].x;
    const maxGen2X = gen2Units[gen2Units.length - 1].x + gen2Units[gen2Units.length - 1].width;
    const gen2CenterX = (minGen2X + maxGen2X) / 2;

    const unit1 = gen1Units[0];
    unit1.x = Math.max(BASE_X, gen2CenterX - unit1.width / 2);
    nodePositions.set(unit1.primary.id, { x: unit1.x, y: unit1.y });
    if (unit1.spouse) {
      nodePositions.set(unit1.spouse.id, {
        x: unit1.x + NODE_WIDTH + SPOUSE_GAP,
        y: unit1.y,
      });
    }
  }

  // 3. Xây dựng danh sách React Flow Nodes
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

  // 4. Xây dựng danh sách React Flow Edges
  const edges: Edge[] = [];
  const handledSpouseEdges = new Set<string>();

  // A. Đường nối ngang hôn phối vợ chồng (Song song liền kề với biểu tượng ♥)
  members.forEach((m) => {
    if (m.spouseId && memberMap.has(m.spouseId)) {
      const spouse = memberMap.get(m.spouseId)!;
      const pairKey = [m.id, spouse.id].sort().join("---");
      if (!handledSpouseEdges.has(pairKey)) {
        handledSpouseEdges.add(pairKey);

        const mPos = nodePositions.get(m.id);
        const sPos = nodePositions.get(spouse.id);

        if (mPos && sPos) {
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
  });

  // B. Đường nối huyết thống trực giao dạng chữ T (Orthogonal Step Lines)
  // Gom nhóm con theo cặp cha mẹ để đường chữ T đâm từ giữa cặp cha mẹ xuống nhánh ngang rồi rẽ nhánh thẳng đứng vào từng người con
  const familyChildMap = new Map<string, { fatherId?: string; motherId?: string; children: Member[] }>();

  members.forEach((m) => {
    const fid = m.fatherId && memberMap.has(m.fatherId) ? m.fatherId : undefined;
    const mid = m.motherId && memberMap.has(m.motherId) ? m.motherId : undefined;

    if (!fid && !mid) return;

    // Khóa định danh gia đình duy nhất
    const famKey = [fid || "none", mid || "none"].sort().join("---");
    if (!familyChildMap.has(famKey)) {
      familyChildMap.set(famKey, { fatherId: fid, motherId: mid, children: [] });
    }
    familyChildMap.get(famKey)!.children.push(m);
  });

  // Tạo các đường nối huyết thống trực giao từ giữa cha mẹ xuống từng con
  familyChildMap.forEach(({ fatherId, motherId, children }) => {
    const parentPrimaryId = fatherId || motherId!;
    const fPos = fatherId ? nodePositions.get(fatherId) : null;
    const mPos = motherId ? nodePositions.get(motherId) : null;

    let startX: number;
    let startY: number;

    if (fPos && mPos) {
      // Đâm từ GIỮA cặp cha mẹ: tâm giữa 2 thẻ của bố và mẹ
      startX = (fPos.x + mPos.x + NODE_WIDTH) / 2;
      startY = Math.max(fPos.y, mPos.y) + NODE_HEIGHT;
    } else {
      const pPos = fPos || mPos!;
      startX = pPos.x + NODE_WIDTH / 2;
      startY = pPos.y + NODE_HEIGHT;
    }

    // Nhánh ngang (branch level Y) nằm ở vị trí 50% khoảng cách giữa 2 đời
    const childGen = children[0].generation || 2;
    const childLevelY = BASE_Y + (childGen - 1) * LEVEL_HEIGHT;
    const branchY = startY + (childLevelY - startY) / 2;

    children.forEach((child) => {
      edges.push({
        id: `edge-lineage-${parentPrimaryId}-${child.id}`,
        source: parentPrimaryId,
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
