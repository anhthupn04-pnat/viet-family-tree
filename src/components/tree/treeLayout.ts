import { Node, Edge, MarkerType } from "@xyflow/react";
import { Member } from "@/types/family";

const CARD_WIDTH = 170;
const CARD_HEIGHT = 240;
const SPOUSE_GAP = 24;
const SIBLING_GAP = 32;
const LEVEL_HEIGHT = 400; // Khoảng cách giữa các đời để đường nối T-shape thoáng đẹp
const BASE_Y = 50;

interface FamilyLayoutOptions {
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

  // Phân chia theo đời
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

  // Xử lý vị trí các thế hệ
  // Đời 1: Cặp khởi tổ hoặc các cụ đời 1
  const gen1Members = genMap.get(1) || [];
  const handledGen1 = new Set<string>();

  // Tìm các con của Đời 1 để tính độ rộng căn giữa
  const gen2Members = (genMap.get(2) || []).sort(
    (a, b) => (a.orderInFamily || 99) - (b.orderInFamily || 99)
  );

  // Tính chiều rộng tổng của các con Đời 2
  const gen2TotalWidth =
    gen2Members.length > 0
      ? gen2Members.length * CARD_WIDTH + (gen2Members.length - 1) * SIBLING_GAP
      : CARD_WIDTH;

  const startGen2X = 80;
  const gen2CenterX = startGen2X + gen2TotalWidth / 2;

  // Căn Đời 1 ngay giữa phía trên các con Đời 2
  gen1Members.forEach((m) => {
    if (handledGen1.has(m.id)) return;

    if (m.spouseId && memberMap.has(m.spouseId)) {
      const spouse = memberMap.get(m.spouseId)!;
      handledGen1.add(m.id);
      handledGen1.add(spouse.id);

      const husband = m.gender === "male" ? m : spouse;
      const wife = m.gender === "male" ? spouse : m;

      const coupleWidth = 2 * CARD_WIDTH + SPOUSE_GAP;
      const coupleStartX = gen2CenterX - coupleWidth / 2;

      nodePositions.set(husband.id, { x: coupleStartX, y: BASE_Y });
      nodePositions.set(wife.id, {
        x: coupleStartX + CARD_WIDTH + SPOUSE_GAP,
        y: BASE_Y,
      });
    } else {
      handledGen1.add(m.id);
      nodePositions.set(m.id, {
        x: gen2CenterX - CARD_WIDTH / 2,
        y: BASE_Y,
      });
    }
  });

  // Đặt vị trí Đời 2 (9 người con thẳng hàng từ trái sang phải)
  gen2Members.forEach((child, index) => {
    const childX = startGen2X + index * (CARD_WIDTH + SIBLING_GAP);
    nodePositions.set(child.id, {
      x: childX,
      y: BASE_Y + LEVEL_HEIGHT,
    });
  });

  // Xử lý các thế hệ tiếp theo nếu có (Đời 3, Đời 4...)
  sortedGens.forEach((gen) => {
    if (gen <= 2) return;
    const genList = (genMap.get(gen) || []).sort(
      (a, b) => (a.orderInFamily || 99) - (b.orderInFamily || 99)
    );

    let currX = startGen2X;
    genList.forEach((m) => {
      // Cố gắng căn dưới cha/mẹ nếu có
      const parentId = m.fatherId || m.motherId;
      if (parentId && nodePositions.has(parentId)) {
        const pPos = nodePositions.get(parentId)!;
        currX = Math.max(currX, pPos.x);
      }
      nodePositions.set(m.id, {
        x: currX,
        y: BASE_Y + (gen - 1) * LEVEL_HEIGHT,
      });
      currX += CARD_WIDTH + SIBLING_GAP;
    });
  });

  // Tạo Nodes cho React Flow
  const nodes: Node[] = members.map((m) => {
    const pos = nodePositions.get(m.id) || { x: startGen2X, y: BASE_Y };
    return {
      id: m.id,
      type: "familyNode",
      position: pos,
      data: {
        member: m,
        onSelectMember: options.onSelectMember,
        onQuickAddChild: options.onQuickAddChild,
        onQuickAddSpouse: options.onQuickAddSpouse,
        onEditMember: options.onEditMember,
        isFocused: options.focusedMemberId === m.id,
      },
    };
  });

  // Tạo Edges (Đường nối vuông góc Step Lines)
  const edges: Edge[] = [];
  const handledSpouseEdges = new Set<string>();

  members.forEach((m) => {
    // 1. Đường nối ngang hôn phối vợ chồng
    if (m.spouseId && memberMap.has(m.spouseId)) {
      const pairKey = [m.id, m.spouseId].sort().join("---");
      if (!handledSpouseEdges.has(pairKey)) {
        handledSpouseEdges.add(pairKey);
        const spouse = memberMap.get(m.spouseId)!;
        const mPos = nodePositions.get(m.id);
        const sPos = nodePositions.get(spouse.id);

        if (mPos && sPos) {
          const [leftNode, rightNode] =
            mPos.x <= sPos.x ? [m, spouse] : [spouse, m];

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

    // 2. Đường kẻ vuông góc chữ T (Orthogonal Step Lines) từ cha/mẹ xuống con cái
    const parentId = m.fatherId || m.motherId;
    if (parentId && memberMap.has(parentId)) {
      edges.push({
        id: `edge-lineage-${parentId}-${m.id}`,
        source: parentId,
        target: m.id,
        type: "step", // Đường vuông góc chuẩn mực dạng chữ T
        style: {
          stroke: "#334155", // Màu xám đen thanh lịch, rõ ràng
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#334155",
          width: 10,
          height: 10,
        },
      });
    }
  });

  return { nodes, edges };
}
