"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Save,
  Users,
  Calendar,
  Sparkles,
  Heart,
  Baby,
} from "lucide-react";
import { Member } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";

export interface QuickContext {
  type: "child" | "spouse";
  targetMember: Member;
}

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMember?: Member | null;
  quickContext?: QuickContext | null;
}

export default function MemberFormModal({
  isOpen,
  onClose,
  editingMember,
  quickContext,
}: MemberFormModalProps) {
  const { members, addMember, updateMember } = useFamilyStore();

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [generation, setGeneration] = useState(2);
  const [orderInFamily, setOrderInFamily] = useState<number | "">("");
  const [birthDate, setBirthDate] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [isAlive, setIsAlive] = useState(true);
  const [fatherId, setFatherId] = useState("");
  const [motherId, setMotherId] = useState("");
  const [spouseId, setSpouseId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingMember) {
      setFullName(editingMember.fullName || "");
      setNickname(editingMember.nickname || "");
      setGender(editingMember.gender || "male");
      setGeneration(editingMember.generation || 1);
      setOrderInFamily(editingMember.orderInFamily || "");
      setBirthDate(editingMember.birthDate || "");
      setDeathDate(editingMember.deathDate || "");
      setIsAlive(editingMember.isAlive !== undefined ? editingMember.isAlive : true);
      setFatherId(editingMember.fatherId || "");
      setMotherId(editingMember.motherId || "");
      setSpouseId(editingMember.spouseId || "");
      setNotes(editingMember.notes || "");
    } else if (quickContext) {
      const target = quickContext.targetMember;
      setFullName("");
      setNickname("");
      setBirthDate("");
      setDeathDate("");
      setIsAlive(true);
      setNotes("");

      if (quickContext.type === "child") {
        setGeneration(target.generation + 1);
        setGender("male");
        if (target.gender === "male") {
          setFatherId(target.id);
          setMotherId(target.spouseId || "");
        } else {
          setMotherId(target.id);
          setFatherId(target.spouseId || "");
        }
        setSpouseId("");
        // Tự động tính số thứ tự con tiếp theo
        const existingChildren = members.filter(
          (m) => m.fatherId === target.id || m.motherId === target.id
        );
        setOrderInFamily(existingChildren.length + 1);
      } else if (quickContext.type === "spouse") {
        setGeneration(target.generation);
        setGender(target.gender === "male" ? "female" : "male");
        setSpouseId(target.id);
        setFatherId("");
        setMotherId("");
        setOrderInFamily("");
      }
    } else {
      // Default new
      setFullName("");
      setNickname("");
      setGender("male");
      setGeneration(2);
      setOrderInFamily("");
      setBirthDate("");
      setDeathDate("");
      setIsAlive(true);
      setFatherId("");
      setMotherId("");
      setSpouseId("");
      setNotes("");
    }
  }, [isOpen, editingMember, quickContext, members]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Họ và tên là bắt buộc.");
      return;
    }

    const payload = {
      fullName: fullName.trim(),
      nickname: nickname.trim() || undefined,
      gender,
      generation: Number(generation) || 1,
      orderInFamily: orderInFamily !== "" ? Number(orderInFamily) : undefined,
      birthDate: birthDate.trim() || undefined,
      deathDate: !isAlive && deathDate.trim() ? deathDate.trim() : undefined,
      isAlive,
      fatherId: fatherId || undefined,
      motherId: motherId || undefined,
      spouseId: spouseId || undefined,
      notes: notes.trim() || undefined,
    };

    if (editingMember) {
      updateMember(editingMember.id, payload);
    } else {
      addMember(payload);
    }

    onClose();
  };

  const maleMembers = members.filter(
    (m) => m.gender === "male" && (!editingMember || m.id !== editingMember.id)
  );
  const femaleMembers = members.filter(
    (m) => m.gender === "female" && (!editingMember || m.id !== editingMember.id)
  );
  const potentialSpouses = members.filter(
    (m) =>
      (!editingMember || m.id !== editingMember.id) &&
      m.gender !== gender &&
      m.generation === Number(generation)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">
              {editingMember
                ? "Chỉnh Sửa Hồ Sơ Thành Viên"
                : "Thêm Thành Viên Vào Gia Phả"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Context Banner */}
        {quickContext && (
          <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-800 font-medium">
            {quickContext.type === "child" ? (
              <>
                <Baby className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Đang thêm <strong>Con</strong> cho{" "}
                  <strong>{quickContext.targetMember.fullName}</strong> &bull; Thế
                  hệ Đời {quickContext.targetMember.generation + 1}
                </span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Đang thêm <strong>Vợ/Chồng</strong> cho{" "}
                  <strong>{quickContext.targetMember.fullName}</strong> &bull; Đời{" "}
                  {quickContext.targetMember.generation}
                </span>
              </>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {/* Họ và tên & Biệt danh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Phan Văn Thứ 1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Biệt danh / Tên thường gọi
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder='Ví dụ: "Bác Cả", "Út"'
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs italic"
              />
            </div>
          </div>

          {/* Giới tính, Đời thứ, Thứ tự con */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Giới tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đời thứ (Generation)
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={generation}
                onChange={(e) => setGeneration(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Thứ tự con (1..9)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={orderInFamily}
                onChange={(e) =>
                  setOrderInFamily(e.target.value ? Number(e.target.value) : "")
                }
                placeholder="1, 2, 3..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Ngày sinh, tình trạng, ngày mất */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Tình trạng</span>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isAlive"
                    checked={isAlive}
                    onChange={() => setIsAlive(true)}
                    className="text-emerald-600"
                  />
                  <span className="font-semibold text-emerald-700">Đang sống</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isAlive"
                    checked={!isAlive}
                    onChange={() => setIsAlive(false)}
                    className="text-slate-600"
                  />
                  <span className="font-semibold text-slate-700">Đã mất</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ngày sinh (dd/mm/yyyy)
                </label>
                <input
                  type="text"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  placeholder="Ví dụ: 12/04/1910"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
                />
              </div>

              {!isAlive && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Ngày mất (dd/mm/yyyy)
                  </label>
                  <input
                    type="text"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    placeholder="Ví dụ: 04/05/1985"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Quan hệ: Cha, Mẹ, Vợ/Chồng */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>Quan Hệ Gia Đình</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Cha (Thân phụ)
                </label>
                <select
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="">-- Không có / Khởi tổ --</option>
                  {maleMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} (Đời {m.generation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Mẹ (Thân mẫu)
                </label>
                <select
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="">-- Không có --</option>
                  {femaleMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} (Đời {m.generation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Vợ / Chồng
                </label>
                <select
                  value={spouseId}
                  onChange={(e) => setSpouseId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-xs"
                >
                  <option value="">-- Chưa có --</option>
                  {potentialSpouses.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} (Đời {m.generation})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ghi chú thêm
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú về công việc, nơi an táng hoặc thành tích..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editingMember ? "Lưu Thay Đổi" : "Thêm Thành Viên"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
