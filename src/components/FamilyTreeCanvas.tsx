"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "@xyflow/react";
import {
  Search,
  PlusCircle,
  Save,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Users,
} from "lucide-react";
import FamilyNode from "./tree/FamilyNode";
import OrthogonalBloodlineEdge from "./tree/OrthogonalBloodlineEdge";
import { computeFamilyTreeLayout } from "./tree/treeLayout";
import { Member } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";

interface FamilyTreeCanvasProps {
  onSelectMember: (m: Member) => void;
  onQuickAddChild: (parent: Member) => void;
  onQuickAddSpouse: (spouse: Member) => void;
  onEditMember: (m: Member) => void;
  onOpenAddMember: () => void;
  focusedMemberId?: string | null;
}

const nodeTypes = {
  familyNode: FamilyNode,
};

const edgeTypes = {
  orthogonalBloodline: OrthogonalBloodlineEdge,
};

function FamilyTreeCanvasInner({
  onSelectMember,
  onQuickAddChild,
  onQuickAddSpouse,
  onEditMember,
  onOpenAddMember,
  focusedMemberId,
}: FamilyTreeCanvasProps) {
  const { members, saveCurrentData, refreshTrigger } = useFamilyStore();
  const { fitView, setCenter } = useReactFlow();

  const handleSaveAndBackup = () => {
    try {
      saveCurrentData();
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(members, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `gia_pha_du_lieu_${new Date().toISOString().slice(0, 10)}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      alert(
        `Đã lưu an toàn toàn bộ ${members.length} thành viên vào hệ thống và tải file sao lưu về máy!`
      );
    } catch (e) {
      console.error(e);
      saveCurrentData();
      alert("Đã lưu an toàn dữ liệu gia phả!");
    }
  };

  const [search, setSearch] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Compute Layout: Nodes & Orthogonal Step Edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return computeFamilyTreeLayout(members, {
      onSelectMember,
      onQuickAddChild,
      onQuickAddSpouse,
      onEditMember,
      focusedMemberId,
    });
  }, [
    members,
    refreshTrigger,
    onSelectMember,
    onQuickAddChild,
    onQuickAddSpouse,
    onEditMember,
    focusedMemberId,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Real-time synchronization whenever members change
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Initial fit view
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.15, duration: 600 });
    }, 150);
    return () => clearTimeout(timer);
  }, [members.length, fitView]);

  // Focus on member when requested
  const focusOnNode = useCallback(
    (member: Member) => {
      const node = nodes.find((n) => n.id === member.id);
      if (node) {
        setCenter(node.position.x + 85, node.position.y + 120, {
          zoom: 1.1,
          duration: 700,
        });
      }
      setShowSearchDropdown(false);
      setSearch("");
    },
    [nodes, setCenter]
  );

  useEffect(() => {
    if (focusedMemberId) {
      const target = members.find((m) => m.id === focusedMemberId);
      if (target) {
        focusOnNode(target);
      }
    }
  }, [focusedMemberId, members, focusOnNode]);

  // Search autocomplete matches
  const searchMatches = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        (m.nickname && m.nickname.toLowerCase().includes(q))
    );
  }, [members, search]);

  return (
    <div className="relative w-full h-[calc(100vh-130px)] min-h-[580px] bg-slate-50 flex flex-col overflow-hidden select-none border border-slate-200 rounded-2xl shadow-xs">
      {/* Clean Modern Top Toolbar */}
      <div className="bg-white px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Search with Autocomplete */}
        <div className="relative w-full sm:w-80">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Tìm kiếm thành viên trên cây..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 focus:bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {showSearchDropdown && searchMatches.length > 0 && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowSearchDropdown(false)}
              />
              <div className="absolute left-0 top-full mt-1.5 w-full bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-30 max-h-60 overflow-y-auto">
                {searchMatches.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => focusOnNode(m)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{m.fullName}</span>
                      {m.nickname && (
                        <span className="text-amber-700 italic ml-1">
                          ({m.nickname})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      Đời {m.generation}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Fit View button */}
          <button
            type="button"
            onClick={() => fitView({ padding: 0.15, duration: 500 })}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Căn giữa toàn bộ cây"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Căn Giữa Cây</span>
          </button>

          {/* Save & Backup button */}
          <button
            type="button"
            onClick={handleSaveAndBackup}
            className="px-3 py-1.5 border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Lưu dữ liệu hiện có và tải file sao lưu JSON về máy"
          >
            <Save className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Lưu Dữ Liệu ({members.length})</span>
          </button>

          {/* Primary Add button */}
          <button
            type="button"
            onClick={onOpenAddMember}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Thành Viên</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 w-full h-full relative bg-lotus-watermark">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2.0}
          defaultViewport={{ x: 50, y: 50, zoom: 0.85 }}
          className="bg-transparent"
        >
          {/* Subtle dots blending with Dong Son watermark */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={0.8}
            color="#C7BBA8"
          />

          {/* Controls */}
          <Controls
            showInteractive={false}
            className="!bg-white !border-slate-200 !shadow-md !rounded-xl !p-1"
          />

          {/* MiniMap */}
          <MiniMap
            zoomable
            pannable
            nodeColor={(n: any) =>
              n.data?.member?.gender === "female" ? "#FB7185" : "#60A5FA"
            }
            nodeStrokeWidth={2}
            className="!bg-white !border-slate-300 !shadow-md !rounded-xl hidden sm:block !bottom-4 !right-4"
            maskColor="rgba(241, 245, 249, 0.6)"
          />
        </ReactFlow>

        {/* Legend */}
        <div className="absolute bottom-4 left-16 hidden md:flex items-center gap-4 bg-white/95 backdrop-blur-xs px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-[11px] text-slate-600 z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Nam giới (Viền xanh)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Nữ / Phối ngẫu (Viền hồng)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-[#8B1D1D]" />
            <span>Đường chữ T đâm từ cha mẹ (Huyết thống)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 border-t-2 border-dashed border-rose-500" />
            <span className="text-rose-500 font-bold">♥</span>
            <span>Hôn phối song song</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FamilyTreeCanvas(props: FamilyTreeCanvasProps) {
  return (
    <ReactFlowProvider>
      <FamilyTreeCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
