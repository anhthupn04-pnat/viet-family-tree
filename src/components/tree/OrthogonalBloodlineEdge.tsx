import React from "react";
import { BaseEdge, EdgeProps, getSmoothStepPath, Position } from "@xyflow/react";

/**
 * OrthogonalBloodlineEdge
 * Đường kẻ huyết thống vuông góc dạng chữ T (Orthogonal Step Line):
 * - Đâm từ giữa cặp cha mẹ (hoặc tâm của cha/mẹ nếu đơn thân)
 * - Xuống nhánh ngang (branch level Y)
 * - Rẽ nhánh thẳng đứng vào từng người con (target handle)
 */
export default function OrthogonalBloodlineEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  style,
  markerEnd,
}: EdgeProps) {
  // Đọc tọa độ xuất phát tùy chỉnh (tâm giữa 2 vợ chồng) nếu được truyền trong data
  const startX =
    typeof (data as any)?.startX === "number" ? (data as any).startX : sourceX;
  const startY =
    typeof (data as any)?.startY === "number" ? (data as any).startY : sourceY;
  const branchY =
    typeof (data as any)?.branchY === "number"
      ? (data as any).branchY
      : (startY + targetY) / 2;

  const [edgePath] = getSmoothStepPath({
    sourceX: startX,
    sourceY: startY,
    sourcePosition: Position.Bottom,
    targetX,
    targetY,
    targetPosition: Position.Top,
    borderRadius: 6,
    centerY: branchY,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: "#8B1D1D",
        strokeWidth: 2,
        ...style,
      }}
      markerEnd={markerEnd}
    />
  );
}
