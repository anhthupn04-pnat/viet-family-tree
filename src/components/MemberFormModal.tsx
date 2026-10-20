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
} from "lucide-react";
import { uploadMemberAvatar } from "@/lib/supabaseStorage";

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg?: string, savedMember?: any) => void;
  editingMember?: any | null;
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
  branches,
  allMembers,
  isAdmin = false,
}: MemberFormModalProps) {
  const [fullName, setFullName] = useState("");
  const [courtesyName, setCourtesyName] = useState("");
  const [gender, setGender] = useState("MALE");
  const [generation, setGeneration] = useState(5);
  const [birthOrder, setBirthOrder] = useState("");
  const [isMartyr, setIsMartyr] = useState(false);
  const [branchId, setBranchId] = useState("");
  const [fatherId, setFatherId] = useState("");
  const [motherId, setMotherId] = useState("");
  const [spouseId, setSpouseId] = useState("");
  const [birthSolar, setBirthSolar] = useState("");
  const [birthLunar, setBirthLunar] = useState("");
  const [deathSolar, setDeathSolar] = useState("");
  const [deathLunar, setDeathLunar] = useState("");
  const [isAlive, setIsAlive] = useState(true);
  const [burialPlace, setBurialPlace] = useState("");
  const [hometown, setHometown] = useState("Nga Sơn, Thanh Hóa");
  const [currentResidence, setCurrentResidence] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [biography, setBiography] = useState("");
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
    if (editingMember) {
      setFullName(editingMember.fullName || "");
      setCourtesyName(editingMember.courtesyName || "");
      setGender(editingMember.gender || "MALE");
      setGeneration(editingMember.generation || 1);
      setBirthOrder(editingMember.birthOrder || "");
      setIsMartyr(Boolean(editingMember.isMartyr));
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
      setIsAlive(editingMember.isAlive !== undefined ? editingMember.isAlive : true);
      setBurialPlace(editingMember.burialPlace || "");
      setHometown(editingMember.hometown || "");
      setCurrentResidence(editingMember.currentResidence || "");
      setAvatarUrl(editingMember.avatarUrl || "");
      setPhone(editingMember.phone || "");
      setBiography(editingMember.biography || "");
    } else {
      // Defaults for new member
      setFullName("");
      setCourtesyName("");
      setGender("MALE");
      setGeneration(5);
      setBirthOrder("");
      setIsMartyr(false);
      setBranchId(branches.length > 0 ? branches[0].id : "");
      setFatherId("");
      setMotherId("");
      setSpouseId("");
      setBirthSolar("");
      setBirthLunar("");
      setDeathSolar("");
      setDeathLunar("");
      setIsAlive(true);
      setBurialPlace("");
      setHometown("Nga Sơn, Thanh Hóa");
      setCurrentResidence("Hà Nội");
      setAvatarUrl("");
      setPhone("");
      setBiography("");
    }
  }, [editingMember, branches, isOpen]);

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
        courtesyName: courtesyName?.trim() || null,
        gender,
        generation: Number(generation),
        birthOrder: birthOrder?.trim() || null,
        isMartyr,
        branchId: branchId || null,
        fatherId: fatherId || null,
        motherId: motherId || null,
        spouseId: spouseId || null,
        birthSolar: birthSolar || null,
        birthLunar: birthLunar || null,
        deathSolar: deathSolar || null,
        deathLunar: deathLunar || null,
        isAlive,
        burialPlace: burialPlace || null,
        hometown: hometown || null,
        currentResidence: currentResidence || null,
        avatarUrl: avatarUrl || null,
        phone: phone || null,
        biography: biography || null,
        isAdmin: true, // Quyền admin tự động duyệt và lưu
        status: "approved", // Trạng thái approved để lập tức hiển thị trên cây sơ đồ
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

      const successMsg = editingMember
        ? "Cập nhật hồ sơ thành công! Cây gia phả đã được làm mới trực tiếp."
        : "Đã thêm thành viên mới thành công và cập nhật ngay lên cây gia phả!";

      onSuccess(data.message || successMsg, data.member);
      onClose();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  // Lọc danh sách cha mẹ theo thế hệ nhỏ hơn
  const potentialFathers = allMembers.filter(
    (m) => m.gender === "MALE" && (!editingMember || m.id !== editingMember.id)
  );
  const potentialMothers = allMembers.filter(
    (m) => m.gender === "FEMALE" && (!editingMember || m.id !== editingMember.id)
  );
  const potentialSpouses = allMembers.filter(
    (m) => (!editingMember || m.id !== editingMember.id) && m.gender !== gender
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-[#C59B27]/40 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#FAF7EE] to-white border-b border-[#EFE8D8] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold font-serif text-[#8B1E1E] flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-[#C59B27]" />
              <span>
                {editingMember ? "Chỉnh Sửa Hồ Sơ Thành Viên" : "Thêm Thành Viên Mới Vào Gia Phả"}
              </span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Cập nhật đầy đủ thông tin thế thứ, ngày sinh/mất âm dương và liên kết huyết thống.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Avatar & Supabase Storage Media Upload Section */}
          <div className="p-3.5 bg-gradient-to-r from-[#FAF7EE] to-[#F5EEDC]/60 rounded-xl border border-[#E0A926]/40 flex flex-col sm:flex-row items-center gap-4">
            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onChange={handleAvatarFileChange}
              className="hidden"
            />

            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <div
                className={`w-20 h-20 rounded-full border-2 border-[#E0A926] shadow-md overflow-hidden flex items-center justify-center ${
                  gender === "FEMALE" ? "bg-pink-900/80 text-pink-200" : "bg-emerald-950/80 text-amber-200"
                }`}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Ảnh đại diện"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    <ImageIcon className="w-6 h-6 text-[#E0A926]/70 mb-0.5" />
                    <span className="text-[10px] font-semibold text-amber-100">
                      {fullName ? fullName.charAt(0) : "Di ảnh"}
                    </span>
                  </div>
                )}
              </div>

              {/* Hover trigger file upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                title="Đổi ảnh đại diện"
              >
                <Upload className="w-5 h-5 text-amber-300" />
              </button>
            </div>

            {/* Upload controls & status */}
            <div className="flex-1 w-full space-y-1.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-stone-800 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
                  <span>Ảnh đại diện & Di ảnh tưởng niệm</span>
                </span>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="text-[11px] text-red-600 hover:text-red-800 flex items-center space-x-1 font-medium"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Xóa ảnh</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-3 py-1.5 bg-[#8B1E1E] hover:bg-[#721515] text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
                      <span>Đang tải lên Supabase Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-amber-300" />
                      <span>Tải ảnh lên Supabase Storage</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-2.5 py-1.5 border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs rounded-lg flex items-center space-x-1 transition-all"
                >
                  <LinkIcon className="w-3 h-3 text-stone-500" />
                  <span>{showUrlInput ? "Ẩn URL" : "Nhập URL ảnh"}</span>
                </button>
              </div>

              {showUrlInput && (
                <div className="pt-1">
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://... đường dẫn ảnh trực tiếp"
                    className="w-full px-2.5 py-1 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#8B1E1E] bg-white"
                  />
                </div>
              )}

              {avatarError && (
                <p className="text-[11px] text-red-600 font-medium">⚠️ {avatarError}</p>
              )}
              {avatarSuccess && (
                <p className="text-[11px] text-emerald-700 font-medium flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{avatarSuccess}</span>
                </p>
              )}
              <p className="text-[10px] text-stone-500">
                Lưu trữ tự động vào Supabase Storage bucket <code>family-tree-media</code>. Hỗ trợ định dạng JPG, PNG, WebP (tối đa 5MB).
              </p>
            </div>
          </div>

          {/* Hàng 1: Họ tên & Tên tự */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1">
                Họ và tên đầy đủ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Phan Văn An, Phan Thị Mai..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tên tự / Tên húy / Pháp danh
              </label>
              <input
                type="text"
                value={courtesyName}
                onChange={(e) => setCourtesyName(e.target.value)}
                placeholder="Ví dụ: Hiệu Thuần Chính, Pháp danh Diệu Tâm..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
              />
            </div>
          </div>

          {/* Hàng 2: Giới tính, Đời thứ, Chi họ, Thứ bậc */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Giới tính
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
              >
                <option value="MALE">Nam giới</option>
                <option value="FEMALE">Nữ giới</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Đời thứ (Thế hệ)
              </label>
              <select
                value={generation}
                onChange={(e) => setGeneration(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((g) => (
                  <option key={g} value={g}>
                    Đời {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Thuộc Chi Họ
              </label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
              >
                <option value="">-- Chưa phân chi --</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Thứ bậc trong gia đình
              </label>
              <input
                type="text"
                list="birth-order-list"
                value={birthOrder}
                onChange={(e) => setBirthOrder(e.target.value)}
                placeholder="Ví dụ: Con trưởng, Con thứ 2..."
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
              />
              <datalist id="birth-order-list">
                {BIRTH_ORDER_PRESETS.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Hàng 3: Huyết thống & Hôn phối (Cha ruột, Mẹ ruột & Vợ/Chồng) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <div>
              <label className="block text-xs font-semibold text-blue-900 mb-1">
                Thân phụ (Cha ruột)
              </label>
              <select
                value={fatherId}
                onChange={(e) => setFatherId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
              >
                <option value="">-- Chưa rõ hoặc là Khởi Tổ --</option>
                {potentialFathers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.fullName} (Đời {f.generation} - {f.memberCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-pink-900 mb-1">
                Thân mẫu (Mẹ ruột)
              </label>
              <select
                value={motherId}
                onChange={(e) => setMotherId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
              >
                <option value="">-- Chưa rõ --</option>
                {potentialMothers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} (Đời {m.generation})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-900 mb-1">
                {gender === "MALE" ? "Phối ngẫu (Hiền thê / Vợ)" : "Phối ngẫu (Phu quân / Chồng)"}
              </label>
              <select
                value={spouseId}
                onChange={(e) => setSpouseId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#8B1E1E]"
              >
                <option value="">-- Chưa kết hôn / Chưa rõ --</option>
                {potentialSpouses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} (Đời {s.generation}{s.memberCode ? ` - ${s.memberCode}` : ""})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Hàng 4: Ngày sinh & Ngày mất (Dương / Âm) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Ngày sinh Dương lịch
              </label>
              <input
                type="date"
                value={birthSolar}
                onChange={(e) => setBirthSolar(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Ngày sinh Âm lịch
              </label>
              <input
                type="text"
                placeholder="Ví dụ: 15/01/Giáp Thân"
                value={birthLunar}
                onChange={(e) => setBirthLunar(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Ngày mất Dương lịch
              </label>
              <input
                type="date"
                disabled={isAlive}
                value={deathSolar}
                onChange={(e) => setDeathSolar(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg disabled:bg-stone-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                Ngày mất Âm lịch (Giỗ)
              </label>
              <input
                type="text"
                disabled={isAlive}
                placeholder="Ví dụ: 02/07/Ất Sửu"
                value={deathLunar}
                onChange={(e) => setDeathLunar(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg disabled:bg-stone-100"
              />
            </div>
          </div>

          {/* Trạng thái còn sống & Liệt sĩ toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center space-x-3 p-2.5 bg-stone-50 rounded-lg border border-stone-200">
              <input
                type="checkbox"
                id="alive-toggle"
                checked={isAlive}
                onChange={(e) => setIsAlive(e.target.checked)}
                className="w-4 h-4 text-[#8B1E1E] accent-[#8B1E1E] rounded cursor-pointer"
              />
              <label htmlFor="alive-toggle" className="text-xs font-semibold text-stone-800 cursor-pointer">
                Thành viên hiện vẫn còn sống
              </label>
            </div>

            <div className="flex items-center space-x-3 p-2.5 bg-red-50/60 rounded-lg border border-red-200">
              <input
                type="checkbox"
                id="martyr-toggle"
                checked={isMartyr}
                onChange={(e) => setIsMartyr(e.target.checked)}
                className="w-4 h-4 text-red-600 accent-red-600 rounded cursor-pointer"
              />
              <label htmlFor="martyr-toggle" className="text-xs font-semibold text-red-900 cursor-pointer flex items-center space-x-1.5">
                <span>⭐ Liệt sĩ / Có công với Tổ quốc</span>
              </label>
            </div>
          </div>

          {/* Quê quán, Nơi ở, Mộ phần, SĐT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Quê quán gốc
              </label>
              <input
                type="text"
                value={hometown}
                onChange={(e) => setHometown(e.target.value)}
                placeholder="Nga Sơn, Thanh Hóa"
                className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nơi cư trú hiện nay
              </label>
              <input
                type="text"
                value={currentResidence}
                onChange={(e) => setCurrentResidence(e.target.value)}
                placeholder="Hà Nội, TP.HCM, Đà Nẵng..."
                className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Mộ phần / Nơi an táng (nếu đã mất)
              </label>
              <input
                type="text"
                value={burialPlace}
                onChange={(e) => setBurialPlace(e.target.value)}
                placeholder="Khu lăng mộ Phan Tộc..."
                className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912..."
                className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
              />
            </div>
          </div>

          {/* Tiểu sử, học vấn, công danh */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Tiểu sử, nghề nghiệp & Đóng góp cho dòng họ
            </label>
            <textarea
              rows={3}
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              placeholder="Ghi lại học vị, công đức, chức danh hoặc sự kiện cuộc đời..."
              className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
            />
          </div>

          {/* Cơ chế cập nhật trực tiếp vào hệ thống */}
          {!isAdmin && !editingMember && (
            <div className="bg-[#FAF7EE] border border-[#E0A926]/40 p-3.5 rounded-xl text-xs space-y-3">
              <div className="flex items-center space-x-1.5 text-[#1E5F52] font-bold">
                <Sparkles className="w-4 h-4 text-[#E0A926]" />
                <span>Cập nhật trực tiếp lên Cây gia phả:</span>
              </div>
              <p className="text-[11px] text-stone-600">
                Hồ sơ thành viên mới sau khi lưu sẽ <strong>ngay lập tức xuất hiện và kết nối huyết thống</strong> trên sơ đồ cây gia phả và đồng bộ vào cơ sở dữ liệu.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Họ tên người khởi tạo / cập nhật
                  </label>
                  <input
                    type="text"
                    value={submitterName}
                    onChange={(e) => setSubmitterName(e.target.value)}
                    placeholder="Ví dụ: Phan Quốc Bảo"
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Nguồn tư liệu minh chứng / Ghi chú
                  </label>
                  <input
                    type="text"
                    value={submitterNote}
                    onChange={(e) => setSubmitterNote(e.target.value)}
                    placeholder="Theo gia phả chép tay, sổ hộ khẩu..."
                    className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer buttons */}
          <div className="pt-3 flex items-center justify-end space-x-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#8B1E1E] hover:bg-[#721515] text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? "Đang lưu..." : editingMember ? "Cập nhật hồ sơ" : "Lưu thành viên"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
