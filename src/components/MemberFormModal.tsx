"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  UserPlus,
  Save,
  Users,
  Calendar,
  MapPin,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  CheckCircle2,
  Link as LinkIcon,
  Award,
  Plus,
  Heart,
  Baby,
} from "lucide-react";
import { uploadMemberAvatar } from "@/lib/supabaseStorage";

export interface QuickActionContext {
  type: "child" | "spouse" | "parent";
  targetMember: any;
}

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg?: string, savedMember?: any) => void;
  editingMember?: any | null;
  quickActionContext?: QuickActionContext | null;
  branches: any[];
  allMembers: any[];
  isAdmin?: boolean;
}

const BIRTH_ORDER_PRESETS = [
  "Khởi tổ",
  "Con trưởng",
  "Con thứ 2",
  "Con thứ 3",
  "Con thứ 4",
  "Con thứ 5",
  "Con út",
  "Con gái trưởng",
  "Con gái thứ 2",
  "Con gái thứ 3",
  "Con gái út",
  "Dâu trưởng",
  "Dâu thứ",
  "Rể quý",
  "Cháu đích tôn",
  "Cháu nội",
  "Cháu ngoại",
];

export default function MemberFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingMember,
  quickActionContext,
  branches,
  allMembers,
  isAdmin = false,
}: MemberFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [courtesyName, setCourtesyName] = useState("");
  const [gender, setGender] = useState("MALE");
  const [generation, setGeneration] = useState(1);
  const [birthOrder, setBirthOrder] = useState("");
  const [branchId, setBranchId] = useState("");
  const [fatherId, setFatherId] = useState("");
  const [motherId, setMotherId] = useState("");
  const [spouseId, setSpouseId] = useState("");
  const [birthSolar, setBirthSolar] = useState("");
  const [birthLunar, setBirthLunar] = useState("");
  const [deathSolar, setDeathSolar] = useState("");
  const [deathLunar, setDeathLunar] = useState("");
  const [deathLunarDay, setDeathLunarDay] = useState<number | "">("");
  const [deathLunarMonth, setDeathLunarMonth] = useState<number | "">("");
  const [isAlive, setIsAlive] = useState(true);
  const [burialPlace, setBurialPlace] = useState("");
  const [hometown, setHometown] = useState("Nga Sơn, Thanh Hóa");
  const [currentResidence, setCurrentResidence] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [biography, setBiography] = useState("");
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterNote, setSubmitterNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase Storage upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (editingMember) {
      setFullName(editingMember.fullName || "");
      setNickname(editingMember.nickname || "");
      setCourtesyName(editingMember.courtesyName || "");
      setGender(editingMember.gender || "MALE");
      setGeneration(editingMember.generation || 1);
      setBirthOrder(editingMember.birthOrder || "");
      setBranchId(editingMember.branchId || "");
      setFatherId(editingMember.fatherId || "");
      setMotherId(editingMember.motherId || "");

      const currentSpouseId =
        editingMember.spouseId ||
        editingMember.spouses?.[0]?.id ||
        editingMember.husbandMarriages?.[0]?.wife?.id ||
        editingMember.wifeMarriages?.[0]?.husband?.id ||
        "";
      setSpouseId(currentSpouseId);

      setBirthSolar(editingMember.birthSolar || "");
      setBirthLunar(editingMember.birthLunar || "");
      setDeathSolar(editingMember.deathSolar || "");
      setDeathLunar(editingMember.deathLunar || "");
      setDeathLunarDay(editingMember.deathLunarDay || "");
      setDeathLunarMonth(editingMember.deathLunarMonth || "");
      setIsAlive(editingMember.isAlive !== undefined ? editingMember.isAlive : true);
      setBurialPlace(editingMember.burialPlace || "");
      setHometown(editingMember.hometown || "");
      setCurrentResidence(editingMember.currentResidence || "");
      setAvatarUrl(editingMember.avatarUrl || "");
      setPhone(editingMember.phone || "");
      setBiography(editingMember.biography || "");
      setAchievements(Array.isArray(editingMember.achievements) ? editingMember.achievements : []);
    } else if (quickActionContext) {
      // CONTEXT-AWARE PRE-POPULATION
      const target = quickActionContext.targetMember;
      const isTargetMale = (target.gender || "MALE").toUpperCase() === "MALE";

      setFullName("");
      setNickname("");
      setCourtesyName("");
      setBirthOrder("");
      setBirthSolar("");
      setBirthLunar("");
      setDeathSolar("");
      setDeathLunar("");
      setDeathLunarDay("");
      setDeathLunarMonth("");
      setIsAlive(true);
      setBurialPlace("");
      setHometown(target.hometown || "Nga Sơn, Thanh Hóa");
      setCurrentResidence(target.currentResidence || "Hà Nội");
      setAvatarUrl("");
      setPhone("");
      setBiography("");
      setAchievements([]);

      if (quickActionContext.type === "child") {
        setGeneration(target.generation + 1);
        setBranchId(target.branchId || (branches.length > 0 ? branches[0].id : ""));
        setGender("MALE");
        if (isTargetMale) {
          setFatherId(target.id);
          setMotherId(target.spouseId || "");
        } else {
          setMotherId(target.id);
          setFatherId(target.spouseId || "");
        }
        setSpouseId("");
        setBirthOrder("Con");
      } else if (quickActionContext.type === "spouse") {
        setGeneration(target.generation);
        setBranchId(target.branchId || (branches.length > 0 ? branches[0].id : ""));
        setGender(isTargetMale ? "FEMALE" : "MALE");
        setSpouseId(target.id);
        setFatherId("");
        setMotherId("");
        setBirthOrder(isTargetMale ? "Dâu" : "Rể");
      } else if (quickActionContext.type === "parent") {
        setGeneration(Math.max(1, target.generation - 1));
        setBranchId(target.branchId || (branches.length > 0 ? branches[0].id : ""));
        setGender("MALE");
        setFatherId("");
        setMotherId("");
        setSpouseId("");
        setBirthOrder("Bậc tiền nhân");
      }
    } else {
      // Default new member
      setFullName("");
      setNickname("");
      setCourtesyName("");
      setGender("MALE");
      setGeneration(branches.length > 0 ? 1 : 1);
      setBirthOrder("");
      setBranchId(branches.length > 0 ? branches[0].id : "");
      setFatherId("");
      setMotherId("");
      setSpouseId("");
      setBirthSolar("");
      setBirthLunar("");
      setDeathSolar("");
      setDeathLunar("");
      setDeathLunarDay("");
      setDeathLunarMonth("");
      setIsAlive(true);
      setBurialPlace("");
      setHometown("Nga Sơn, Thanh Hóa");
      setCurrentResidence("Hà Nội");
      setAvatarUrl("");
      setPhone("");
      setBiography("");
      setAchievements([]);
    }
  }, [editingMember, quickActionContext, branches, isOpen]);

  if (!isOpen) return null;

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setAvatarError(null);
    setAvatarSuccess(null);
    try {
      const res = await uploadMemberAvatar(file);
      if (res.success && res.publicUrl) {
        setAvatarUrl(res.publicUrl);
        setAvatarSuccess("Tải ảnh đại diện lên Supabase Storage thành công!");
        setTimeout(() => setAvatarSuccess(null), 3500);
      } else {
        setAvatarError(res.error || "Không thể tải ảnh lên Supabase Storage.");
      }
    } catch (err: any) {
      setAvatarError(err?.message || "Lỗi khi tải ảnh.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements([...achievements, newAchievement.trim()]);
      setNewAchievement("");
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Họ và tên là bắt buộc.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const url = "/api/members";
      const method = editingMember ? "PUT" : "POST";
      const payload = {
        id: editingMember ? editingMember.id : undefined,
        fullName: fullName.trim(),
        nickname: nickname.trim() || null,
        courtesyName: courtesyName?.trim() || null,
        gender,
        generation: Number(generation),
        birthOrder: birthOrder?.trim() || null,
        branchId: branchId || null,
        fatherId: fatherId || null,
        motherId: motherId || null,
        spouseId: spouseId || null,
        birthSolar: birthSolar || null,
        birthLunar: birthLunar || null,
        deathSolar: deathSolar || null,
        deathLunar: deathLunar || null,
        deathLunarDay: deathLunarDay !== "" ? Number(deathLunarDay) : null,
        deathLunarMonth: deathLunarMonth !== "" ? Number(deathLunarMonth) : null,
        isAlive,
        burialPlace: burialPlace || null,
        hometown: hometown || null,
        currentResidence: currentResidence || null,
        avatarUrl: avatarUrl || null,
        phone: phone || null,
        biography: biography || null,
        achievements,
        targetChildId:
          quickActionContext && quickActionContext.type === "parent"
            ? quickActionContext.targetMember.id
            : undefined,
        isAdmin: true,
        status: "approved",
        submitterName: submitterName || "Quản trị viên",
        submitterNote: submitterNote || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể lưu hồ sơ thành viên.");
      }

      onSuccess(
        editingMember ? "Cập nhật thành công!" : "Thêm thành viên mới thành công!",
        data.member || payload
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || "Đã xảy ra lỗi khi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#8B1D1D] to-[#691111] px-5 py-4 text-white flex items-center justify-between shrink-0 border-b-2 border-[#E0A926]">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-amber-300" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100">
              {editingMember ? "Chỉnh Sửa Hồ Sơ Thành Viên" : "Thêm Thành Viên Vào Gia Phả"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action Context Banner */}
        {quickActionContext && (
          <div className="bg-amber-50 px-5 py-2.5 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900">
            {quickActionContext.type === "child" && (
              <>
                <Baby className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  Đang thêm <strong>Con</strong> cho <strong>{quickActionContext.targetMember.fullName}</strong> &bull; Thế hệ Đời {quickActionContext.targetMember.generation + 1}
                </span>
              </>
            )}
            {quickActionContext.type === "spouse" && (
              <>
                <Heart className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Đang thêm <strong>Hôn phối (Vợ/Chồng)</strong> cho <strong>{quickActionContext.targetMember.fullName}</strong> &bull; Đời {quickActionContext.targetMember.generation}
                </span>
              </>
            )}
            {quickActionContext.type === "parent" && (
              <>
                <UserPlus className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Đang thêm <strong>Bậc Tiền nhân (Cha/Mẹ)</strong> cho <strong>{quickActionContext.targetMember.fullName}</strong> &bull; Đời {Math.max(1, quickActionContext.targetMember.generation - 1)}
                </span>
              </>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
              ⚠️ {error}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-stone-50 rounded-xl border border-stone-200">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="relative w-16 h-16 rounded-full border-2 border-[#E0A926] shadow-sm overflow-hidden flex items-center justify-center shrink-0 bg-stone-200">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-stone-400" />
              )}
            </div>
            <div className="flex-1 w-full flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-3 py-1.5 bg-[#8B1D1D] hover:bg-[#721515] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Tải ảnh đại diện</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl("")}
                  className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ảnh</span>
                </button>
              )}
            </div>
          </div>

          {/* Names: Họ tên, Biệt danh, Tên tự */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Họ và tên đầy đủ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Phan Văn An"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1D1D]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-800 mb-1">
                Biệt danh / Tên ở nhà <em>(in nghiêng)</em>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder='Ví dụ: "Bác Ba Đước", "Út Mập"'
                className="w-full px-3 py-2 text-xs border border-amber-300 bg-amber-50/30 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-600 italic font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tên chữ / Tên húy / Pháp danh
              </label>
              <input
                type="text"
                value={courtesyName}
                onChange={(e) => setCourtesyName(e.target.value)}
                placeholder="Ví dụ: Hiệu Phúc Thiện"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1D1D]"
              />
            </div>
          </div>

          {/* Gender, Generation, Branch, Birth Order */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1D1D]"
              >
                <option value="MALE">Nam giới</option>
                <option value="FEMALE">Nữ giới</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Đời thứ</label>
              <input
                type="number"
                min={1}
                max={20}
                value={generation}
                onChange={(e) => setGeneration(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1D1D]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Chi họ</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1D1D]"
              >
                <option value="">-- Chi họ chính --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Vai vế / Thứ bậc</label>
              <input
                type="text"
                value={birthOrder}
                onChange={(e) => setBirthOrder(e.target.value)}
                placeholder="Trưởng nam, Dâu..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1D1D]"
              />
            </div>
          </div>

          {/* Relationships: Father, Mother, Spouse */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <h4 className="font-bold text-stone-800 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#8B1D1D]" />
              <span>Quan Hệ Gia Phả Trực Hệ</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-stone-600 mb-0.5">Thân phụ (Cha)</label>
                <select
                  value={fatherId}
                  onChange={(e) => setFatherId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1D1D]"
                >
                  <option value="">-- Không rõ / Khởi tổ --</option>
                  {allMembers
                    .filter((m) => m.id !== (editingMember ? editingMember.id : "") && (m.gender || "MALE").toUpperCase() === "MALE")
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} {m.nickname ? `(${m.nickname})` : ""} - Đời {m.generation}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-0.5">Thân mẫu (Mẹ)</label>
                <select
                  value={motherId}
                  onChange={(e) => setMotherId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1D1D]"
                >
                  <option value="">-- Không rõ --</option>
                  {allMembers
                    .filter((m) => m.id !== (editingMember ? editingMember.id : "") && (m.gender || "MALE").toUpperCase() === "FEMALE")
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} {m.nickname ? `(${m.nickname})` : ""} - Đời {m.generation}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-stone-600 mb-0.5">Hôn phối (Vợ / Chồng)</label>
                <select
                  value={spouseId}
                  onChange={(e) => setSpouseId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1D1D]"
                >
                  <option value="">-- Chưa có --</option>
                  {allMembers
                    .filter((m) => m.id !== (editingMember ? editingMember.id : ""))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} {m.nickname ? `(${m.nickname})` : ""} - Đời {m.generation}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Life status & Death / Anniversary */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800">Tình trạng còn sống / đã mất</label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isAlive"
                    checked={isAlive}
                    onChange={() => setIsAlive(true)}
                    className="text-emerald-600"
                  />
                  <span className="text-emerald-700 font-medium">Đang sống</span>
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isAlive"
                    checked={!isAlive}
                    onChange={() => setIsAlive(false)}
                    className="text-amber-800"
                  />
                  <span className="text-amber-900 font-medium">Đã mất</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-stone-600 mb-0.5">Ngày sinh (Dương lịch)</label>
                <input
                  type="date"
                  value={birthSolar}
                  onChange={(e) => setBirthSolar(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none"
                />
              </div>

              {!isAlive && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-amber-800 mb-0.5">
                    Ngày giỗ Âm lịch (Kỵ nhật)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        min={1}
                        max={30}
                        placeholder="Ngày (ví dụ: 15)"
                        value={deathLunarDay}
                        onChange={(e) => setDeathLunarDay(e.target.value ? Number(e.target.value) : "")}
                        className="w-full px-2.5 py-1.5 text-xs border border-amber-300 bg-amber-50/50 rounded-lg focus:outline-none"
                      />
                    </div>
                    <span className="text-stone-500 font-bold">/</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        min={1}
                        max={12}
                        placeholder="Tháng (ví dụ: 3)"
                        value={deathLunarMonth}
                        onChange={(e) => setDeathLunarMonth(e.target.value ? Number(e.target.value) : "")}
                        className="w-full px-2.5 py-1.5 text-xs border border-amber-300 bg-amber-50/50 rounded-lg focus:outline-none"
                      />
                    </div>
                    <span className="text-amber-800 font-bold shrink-0">ÂL</span>
                  </div>
                </div>
              )}
            </div>

            {!isAlive && (
              <div>
                <label className="block text-[11px] text-stone-600 mb-0.5">Nơi an táng / Mộ phần</label>
                <input
                  type="text"
                  value={burialPlace}
                  onChange={(e) => setBurialPlace(e.target.value)}
                  placeholder="Ví dụ: Khu nghĩa trang dòng họ, Thôn Phúc Thịnh"
                  className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Achievements & Milestones (Strictly NO war/martyr classification) */}
          <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Thành Tích & Cột Mốc Nổi Bật</span>
              </span>
              <span className="text-[10px] text-stone-500 italic">
                (Học vấn, sự nghiệp, kinh doanh, nghề truyền thống)
              </span>
            </div>

            {/* Existing achievements tags */}
            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {achievements.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-amber-100/80 border border-amber-300 text-amber-900 text-[11px] px-2 py-0.5 rounded-full font-medium shadow-2xs"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(idx)}
                      className="text-amber-700 hover:text-red-700 ml-0.5 cursor-pointer"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add new achievement input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newAchievement}
                onChange={(e) => setNewAchievement(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAchievement();
                  }
                }}
                placeholder="Ví dụ: Tốt nghiệp Đại học Y 1995, Nghệ nhân gốm truyền thống..."
                className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
              <button
                type="button"
                onClick={handleAddAchievement}
                className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>
          </div>

          {/* Biography */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Tiểu sử vắn tắt & Ghi nhớ
            </label>
            <textarea
              rows={3}
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Ghi lại các dấu mốc cuộc đời, đức hạnh, đóng góp cho gia đình và dòng họ..."
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1D1D]"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="bg-stone-50 px-5 py-3 border-t border-stone-200 flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#8B1D1D] to-[#B91C1C] hover:from-[#721515] hover:to-[#991B1B] rounded-xl shadow-md flex items-center gap-1.5 disabled:opacity-60 cursor-pointer active:scale-95 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
            ) : (
              <Save className="w-4 h-4 text-amber-300" />
            )}
            <span>{editingMember ? "Lưu Cập Nhật" : "Hoàn Tất & Đưa Vào Phả Hệ"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
