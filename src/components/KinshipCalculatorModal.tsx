"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  Compass,
  ArrowRightLeft,
  Info,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

interface MemberOption {
  id: string;
  fullName: string;
  generation: number;
  gender: string;
  branchName?: string;
  birthSolar?: string;
}

interface KinshipCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedAId?: string;
  preselectedBId?: string;
}

export default function KinshipCalculatorModal({
  isOpen,
  onClose,
  preselectedAId,
  preselectedBId,
}: KinshipCalculatorModalProps) {
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [memberAId, setMemberAId] = useState<string>(preselectedAId || "");
  const [memberBId, setMemberBId] = useState<string>(preselectedBId || "");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/members")
      .then((r) => r.json())
      .then((data) => {
        if (data.members) {
          const list = data.members.map((m: any) => ({
            id: m.id,
            fullName: m.fullName,
            generation: m.generation,
            gender: m.gender,
            branchName: m.branch?.branchName,
            birthSolar: m.birthSolar,
          }));
          setMembers(list);

          // Default selection if not preselected
          if (!preselectedAId && list.length >= 2) {
            setMemberAId(list[list.length - 2].id); // Phan Quốc Bảo
            setMemberBId(list[list.length - 1].id); // Phan Anh Thư
          }
        }
      })
      .catch(console.error);
  }, [preselectedAId]);

  const handleCalculate = async (aId = memberAId, bId = memberBId) => {
    if (!aId || !bId) {
      setError("Vui lòng chọn 2 thành viên cần đối chiếu quan hệ.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kinship", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberAId: aId, memberBId: bId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể tính toán xưng hô.");
      setResult(data.result);
    } catch (err: any) {
      setError(err.message || "Lỗi tra cứu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp = memberAId;
    setMemberAId(memberBId);
    setMemberBId(temp);
    if (result) {
      handleCalculate(memberBId, temp);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-[#C59B27]/40 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#8B1E1E] to-[#601313] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
              <Search className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-bold font-serif text-amber-200">
                Tra Cứu Quan Hệ Họ Hàng & Xưng Hô Tự Động
              </h2>
              <p className="text-[11px] text-amber-100/70">
                Thuật toán xưng hô theo vai vế dòng tộc (Bên Nội / Bên Ngoại)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-amber-100 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            ✕
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Selectors */}
          <div className="bg-[#FAF7EE] border border-[#E8DEC7] rounded-2xl p-4">
            <p className="text-xs font-semibold text-stone-700 mb-3 flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-[#8B1E1E]" />
              <span>Bước 1: Chọn 2 thành viên trong cây phả hệ để đối chiếu</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-center">
              {/* Member A */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  THÀNH VIÊN A (Tôi)
                </label>
                <select
                  value={memberAId}
                  onChange={(e) => setMemberAId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
                >
                  <option value="">-- Chọn thành viên A --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} (Đời {m.generation} - {m.branchName || "Chưa phân chi"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Swap button */}
              <div className="flex justify-center pt-4 sm:pt-0">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="p-2 bg-white hover:bg-stone-100 border border-stone-300 rounded-full text-stone-600 transition-colors shadow-sm"
                  title="Đổi chiều xưng hô"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Member B */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  THÀNH VIÊN B (Người đối chiếu)
                </label>
                <select
                  value={memberBId}
                  onChange={(e) => setMemberBId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:border-[#8B1E1E]"
                >
                  <option value="">-- Chọn thành viên B --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} (Đời {m.generation} - {m.branchName || "Chưa phân chi"})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => handleCalculate()}
                disabled={loading || !memberAId || !memberBId}
                className="px-5 py-2 bg-[#8B1E1E] hover:bg-[#721515] text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center space-x-2"
              >
                {loading ? (
                  <span>Đang phân tích đồ thị...</span>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5 text-amber-300" />
                    <span>Tra Cứu Cách Xưng Hô</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Result view */}
          {result && (
            <div className="border border-[#C59B27]/50 rounded-2xl p-5 bg-gradient-to-br from-white to-[#FAF7EE] shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#E8DEC7] pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E1E] flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C59B27]" />
                  <span>Kết Quả Đối Chiếu Xưng Hô</span>
                </span>
                <span className="text-xs bg-[#C59B27]/20 text-[#8B1E1E] font-semibold px-2.5 py-0.5 rounded-full">
                  Phân loại: {result.relationshipType}
                </span>
              </div>

              {/* Two-card call terms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
                  <p className="text-[11px] text-blue-700 font-semibold mb-1">
                    {result.memberA.name} gọi {result.memberB.name} là:
                  </p>
                  <p className="text-xl font-bold font-serif text-blue-900">
                    "{result.howACallsB}"
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm">
                  <p className="text-[11px] text-rose-700 font-semibold mb-1">
                    {result.memberB.name} gọi {result.memberA.name} là:
                  </p>
                  <p className="text-xl font-bold font-serif text-rose-900">
                    "{result.howBCallsA}"
                  </p>
                </div>
              </div>

              {/* Details breakdown */}
              <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs space-y-2 text-stone-700">
                <p>
                  <strong>Tổ tiên chung gần nhất:</strong>{" "}
                  {result.commonAncestor ? (
                    <span className="text-[#8B1E1E] font-semibold">
                      {result.commonAncestor.name} (Đời thứ {result.commonAncestor.generation})
                    </span>
                  ) : (
                    "Chưa xác định nhánh nối"
                  )}
                </p>
                <p>
                  <strong>Chênh lệch thế hệ:</strong>{" "}
                  {Math.abs(result.generationDiff) === 0
                    ? "Cùng một đời thứ (Đồng bối)"
                    : `Cách nhau ${Math.abs(result.generationDiff)} thế hệ`}
                </p>
                <p className="text-stone-600 leading-relaxed pt-1 border-t border-stone-100">
                  <Info className="w-3.5 h-3.5 inline mr-1 text-[#C59B27]" />
                  {result.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Quy tắc xưng hô tóm tắt từ xưng hô.pdf */}
          <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/70 text-xs text-stone-600 space-y-2">
            <h4 className="font-bold text-stone-800 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-[#8B1E1E]" />
              <span>Quy Tắc Vai Vế Truyền Thống (Từ tài liệu Xưng Hô Họ Hàng)</span>
            </h4>
            <p className="leading-relaxed">
              <strong>1. Xưng hô theo vai vế, không theo tuổi:</strong> Người cùng một đời với bố mẹ bạn thì thuộc vai trên (bác, chú, cô, thím, cậu, dì) — bất kể ít hơn bạn bao nhiêu tuổi, bạn vẫn phải xưng cháu!
            </p>
            <p className="leading-relaxed">
              <strong>2. Bên Nội (Họ bố):</strong> Anh trai của bố gọi là Bác trai; em trai của bố gọi là Chú; chị/em gái của bố gọi chung là Cô. Con của bác là Anh/Chị họ; con của chú là Em họ.
            </p>
            <p className="leading-relaxed">
              <strong>3. Bên Ngoại (Họ mẹ):</strong> Anh em trai của mẹ đều gọi là Cậu (vợ là Mợ); chị em gái của mẹ gọi là Dì (chồng là Dượng).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
