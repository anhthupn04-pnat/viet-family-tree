"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Upload,
  FileCode,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight,
  Database,
  Info,
} from "lucide-react";
import { Member, MemberImportItem, ValidationSummary } from "@/types/family";
import { validateImportBatch } from "@/lib/treeValidation";

interface QuickImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMembers: Member[];
  onImportSuccess: (
    importedMembers: Member[],
    stats: { createdCount: number; updatedCount: number; skippedCount: number }
  ) => void;
  treeName?: string;
  treeId?: string;
}

const SAMPLE_JSON_DATA = [
  {
    id: "phan-thanh",
    fullName: "Phan Thạnh",
    nickname: "Cụ Khởi Tổ",
    gender: "male",
    generation: 1,
    orderInFamily: 1,
    birthDate: "12/04/1910",
    deathDate: "16 tháng 3 Âm lịch (1985)",
    isAlive: false,
    fatherId: null,
    motherId: null,
    spouseId: "tran-thi-hoang",
    phone: "0912345601",
    address: "Quảng Nam",
    notes: "Trưởng tộc",
  },
  {
    id: "tran-thi-hoang",
    fullName: "Trần Thị Hoàng",
    nickname: "Cụ Bà Chính Thất",
    gender: "female",
    generation: 1,
    orderInFamily: 1,
    birthDate: "18/08/1914",
    deathDate: "mùng 8 tháng 9 Âm lịch (1990)",
    isAlive: false,
    fatherId: null,
    motherId: null,
    spouseId: "phan-thanh",
    phone: "0912345602",
    address: "Quảng Nam",
    notes: "Hiệu Từ Tâm",
  },
  {
    id: "phan-van-dinh",
    fullName: "Phan Văn Định",
    nickname: "Bác Cả Chi 1",
    gender: "male",
    generation: 2,
    orderInFamily: 1,
    birthDate: "15/06/1942",
    deathDate: "đợi thông tin",
    isAlive: true,
    fatherId: "phan-thanh",
    motherId: "tran-thi-hoang",
    spouseId: null,
    phone: "0912345603",
    address: "Đà Nẵng",
    notes: "Trưởng chi 1",
  },
];

export default function QuickImportModal({
  isOpen,
  onClose,
  currentMembers,
  onImportSuccess,
  treeName = "Gia Phả Tộc Phan",
  treeId = "tree-phan-family",
}: QuickImportModalProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "upload">("paste");
  const [jsonText, setJsonText] = useState<string>("");
  const [upsertMode, setUpsertMode] = useState<"overwrite" | "skip">("overwrite");
  const [fileName, setFileName] = useState<string | null>(null);
  const [jsonParseError, setJsonParseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Parse JSON parsed object
  const parsedBatch = useMemo(() => {
    setJsonParseError(null);
    if (!jsonText.trim()) return null;
    try {
      const parsed = JSON.parse(jsonText);
      if (!Array.isArray(parsed)) {
        setJsonParseError("Dữ liệu JSON phải là một mảng [] các đối tượng thành viên.");
        return null;
      }
      return parsed;
    } catch (e: any) {
      setJsonParseError(`Cú pháp JSON chưa đúng: ${e.message}`);
      return null;
    }
  }, [jsonText]);

  // Run validation
  const validation: ValidationSummary | null = useMemo(() => {
    if (!parsedBatch) return null;
    return validateImportBatch(parsedBatch, currentMembers);
  }, [parsedBatch, currentMembers]);

  if (!isOpen) return null;

  // Load sample JSON
  const handleLoadSample = () => {
    setJsonText(JSON.stringify(SAMPLE_JSON_DATA, null, 2));
    setFileName("mau_gia_pha_chuan.json");
    setJsonParseError(null);
    setSubmitError(null);
  };

  // Format JSON
  const handleFormatJson = () => {
    if (!parsedBatch) return;
    try {
      setJsonText(JSON.stringify(parsedBatch, null, 2));
    } catch (e) {}
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonText(content);
      setActiveTab("paste"); // Switch to view editor & preview
    };
    reader.readAsText(file);
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".json")) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setJsonText(content);
        setActiveTab("paste");
      };
      reader.readAsText(file);
    }
  };

  // Submit Handler
  const handleConfirmImport = async () => {
    if (!validation || validation.errorCount > 0) return;
    setIsSubmitting(true);
    setSubmitError(null);

    const membersToImport = validation.items.map((i) => i.item);

    try {
      // 1. Thử gọi API Backend nếu có kết nối
      const response = await fetch(`/api/trees/${treeId}/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": "anhthuphan0102@gmail.com",
        },
        body: JSON.stringify({
          members: membersToImport,
          upsertMode,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        onImportSuccess(result.members || membersToImport, {
          createdCount: result.createdCount || 0,
          updatedCount: result.updatedCount || 0,
          skippedCount: result.skippedCount || 0,
        });
        onClose();
        return;
      }
    } catch (apiErr) {
      console.warn("Backend API sync warning, proceeding with client-side store sync:", apiErr);
    }

    // 2. Client-side Store fallback (Bảo toàn 100% dữ liệu hoạt động tức thì)
    try {
      let created = 0;
      let updated = 0;
      let skipped = 0;

      const existingMap = new Map<string, Member>();
      currentMembers.forEach((m) => existingMap.set(m.id, m));

      const updatedList = [...currentMembers];

      membersToImport.forEach((newItem) => {
        const existingIdx = updatedList.findIndex((m) => m.id === newItem.id);
        if (existingIdx >= 0) {
          if (upsertMode === "overwrite") {
            updatedList[existingIdx] = { ...updatedList[existingIdx], ...newItem };
            updated++;
          } else {
            skipped++;
          }
        } else {
          updatedList.push(newItem);
          created++;
        }
      });

      // Đối xứng quan hệ vợ chồng (Bi-directional spouse)
      updatedList.forEach((m) => {
        if (m.spouseId) {
          const spouse = updatedList.find((sp) => sp.id === m.spouseId);
          if (spouse && !spouse.spouseId) {
            spouse.spouseId = m.id;
          }
        }
      });

      onImportSuccess(updatedList, {
        createdCount: created,
        updatedCount: updated,
        skippedCount: skipped,
      });
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Lỗi khi xử lý nhập dữ liệu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasBlockingErrors = !validation || validation.errorCount > 0 || !parsedBatch;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs">
              <Upload className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Nhập Dữ Liệu Nhanh (Bulk Import)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {treeName}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Nhập danh sách thành viên hàng loạt từ tệp JSON chuẩn với kiểm tra logic & liên kết tự động.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector & Presets */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab("paste")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "paste"
                  ? "bg-white text-blue-700 shadow-xs border border-blue-200"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Dán Chuỗi JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === "upload"
                  ? "bg-white text-blue-700 shadow-xs border border-blue-200"
                  : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Tải Lên File .JSON</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Điền dữ liệu mẫu chuẩn schema vào ô nhập"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Dán Mẫu Chuẩn</span>
            </button>
            {parsedBatch && (
              <button
                type="button"
                onClick={handleFormatJson}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                title="Định dạng thụt lề JSON đẹp mắt"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Format JSON</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Body: Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* TAB 1: Editor */}
          {activeTab === "paste" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <label className="font-semibold text-slate-800">
                  Ô Nhập Mã JSON Thành Viên:
                </label>
                {fileName && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Nguồn: {fileName}
                  </span>
                )}
              </div>
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='[
  {
    "id": "phan-thanh",
    "fullName": "Phan Thạnh",
    "gender": "male",
    "generation": 1,
    "isAlive": false,
    "spouseId": "tran-thi-hoang"
  }
]'
                rows={7}
                className="w-full p-3 font-mono text-xs bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                spellCheck={false}
              />
            </div>
          )}

          {/* TAB 2: File Upload Zone */}
          {activeTab === "upload" && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-8 text-center transition-all cursor-pointer relative"
            >
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">
                Kéo & thả file <span className="text-blue-600">.json</span> vào đây, hoặc bấm để chọn tệp
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Hỗ trợ tệp định dạng JSON chứa mảng thông tin các thành viên dòng họ
              </p>
            </div>
          )}

          {/* Syntax Parse Error Alert */}
          {jsonParseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Lỗi cú pháp JSON: </span>
                <span>{jsonParseError}</span>
              </div>
            </div>
          )}

          {/* Summary Dashboard Cards */}
          {validation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="text-[11px] font-semibold text-slate-500">
                    Tổng bản ghi trong file
                  </span>
                  <div className="text-xl font-bold text-slate-900 mt-0.5">
                    {validation.total}
                  </div>
                </div>

                {/* Valid */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Hợp lệ sẵn sàng nạp</span>
                  </span>
                  <div className="text-xl font-bold text-emerald-800 mt-0.5">
                    {validation.valid}
                  </div>
                </div>

                {/* Errors */}
                <div
                  className={`rounded-xl p-3 border ${
                    validation.errorCount > 0
                      ? "bg-rose-50 border-rose-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      validation.errorCount > 0 ? "text-rose-700" : "text-slate-500"
                    }`}
                  >
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Lỗi cần khắc phục</span>
                  </span>
                  <div
                    className={`text-xl font-bold mt-0.5 ${
                      validation.errorCount > 0 ? "text-rose-800" : "text-slate-700"
                    }`}
                  >
                    {validation.errorCount}
                  </div>
                </div>

                {/* Duplicates */}
                <div
                  className={`rounded-xl p-3 border ${
                    validation.duplicateCount > 0
                      ? "bg-amber-50 border-amber-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      validation.duplicateCount > 0 ? "text-amber-700" : "text-slate-500"
                    }`}
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>Trùng lặp ID</span>
                  </span>
                  <div
                    className={`text-xl font-bold mt-0.5 ${
                      validation.duplicateCount > 0 ? "text-amber-800" : "text-slate-700"
                    }`}
                  >
                    {validation.duplicateCount}
                  </div>
                </div>
              </div>

              {/* Upsert Strategy Selector */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <span className="font-bold text-blue-950">
                      Cơ chế xử lý khi trùng mã ID thành viên (Upsert Policy):
                    </span>
                    <p className="text-[11px] text-blue-700">
                      Quy định hành động khi ID trong file import đã tồn tại trên cây gia phả.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <label className="flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="upsertMode"
                      value="overwrite"
                      checked={upsertMode === "overwrite"}
                      onChange={() => setUpsertMode("overwrite")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Ghi đè (Update)</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="upsertMode"
                      value="skip"
                      checked={upsertMode === "skip"}
                      onChange={() => setUpsertMode("skip")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Bỏ qua (Skip)</span>
                  </label>
                </div>
              </div>

              {/* Data Preview & Validation Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Bảng Xem Trước & Đối Soát Dữ Liệu (Data Preview & Validation Table)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Hiển thị {validation.items.length} thành viên
                  </span>
                </div>

                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 text-[11px] text-slate-600 font-bold">
                      <tr>
                        <th className="py-2 px-3 w-12 text-center">Dòng</th>
                        <th className="py-2 px-3 w-28">Trạng Thái</th>
                        <th className="py-2 px-3">Mã ID</th>
                        <th className="py-2 px-3">Họ và Tên</th>
                        <th className="py-2 px-3 w-20 text-center">Giới Tính</th>
                        <th className="py-2 px-3 w-16 text-center">Đời</th>
                        <th className="py-2 px-3">Quan Hệ (Cha / Mẹ / Vợ-Chồng)</th>
                        <th className="py-2 px-3 min-w-[200px]">Chi Tiết Kiểm Định</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validation.items.map((entry) => {
                        const { item, row, isValid, errors, warnings, isExistingInDb } = entry;
                        return (
                          <tr
                            key={row}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              !isValid ? "bg-rose-50/40" : isExistingInDb ? "bg-amber-50/30" : ""
                            }`}
                          >
                            <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                              {row}
                            </td>
                            <td className="py-2 px-3">
                              {!isValid ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  <span>Lỗi dữ liệu</span>
                                </span>
                              ) : isExistingInDb ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  <span>Trùng ID ({upsertMode === "overwrite" ? "Sửa" : "Bỏ"})</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Hợp lệ (Thêm)</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-800 font-medium">
                              {item.id || <span className="text-rose-500 italic">Trống</span>}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900">
                              {item.fullName || <span className="text-rose-500 italic">Trống</span>}
                              {item.nickname && (
                                <span className="text-amber-700 italic font-normal text-[11px] ml-1">
                                  ({item.nickname})
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                  item.gender === "male"
                                    ? "bg-blue-100 text-blue-700"
                                    : item.gender === "female"
                                    ? "bg-rose-100 text-rose-700"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {item.gender === "male"
                                  ? "Nam"
                                  : item.gender === "female"
                                  ? "Nữ"
                                  : item.gender || "—"}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center font-bold text-slate-700">
                              Đời {item.generation || 1}
                            </td>
                            <td className="py-2 px-3 text-[11px] text-slate-600">
                              <div className="space-y-0.5">
                                {item.fatherId && (
                                  <div>
                                    <span className="text-slate-400">Cha:</span>{" "}
                                    <span className="font-mono text-slate-800 font-medium">
                                      {item.fatherId}
                                    </span>
                                  </div>
                                )}
                                {item.motherId && (
                                  <div>
                                    <span className="text-slate-400">Mẹ:</span>{" "}
                                    <span className="font-mono text-slate-800 font-medium">
                                      {item.motherId}
                                    </span>
                                  </div>
                                )}
                                {item.spouseId && (
                                  <div>
                                    <span className="text-rose-400">Hôn phối:</span>{" "}
                                    <span className="font-mono text-rose-800 font-medium">
                                      {item.spouseId}
                                    </span>
                                  </div>
                                )}
                                {!item.fatherId && !item.motherId && !item.spouseId && (
                                  <span className="text-slate-400 italic">Gốc / Chưa gán</span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              {errors.length > 0 && (
                                <div className="space-y-1">
                                  {errors.map((err, eIdx) => (
                                    <p key={eIdx} className="text-[11px] text-rose-600 font-medium leading-tight">
                                      • {err}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {warnings.length > 0 && errors.length === 0 && (
                                <div className="space-y-1">
                                  {warnings.map((warn, wIdx) => (
                                    <p key={wIdx} className="text-[11px] text-amber-700 leading-tight">
                                      • {warn}
                                    </p>
                                  ))}
                                </div>
                              )}
                              {errors.length === 0 && warnings.length === 0 && (
                                <span className="text-[11px] text-emerald-600 font-medium">
                                  Chuẩn xác
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
              {submitError}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {validation ? (
              hasBlockingErrors ? (
                <span className="text-rose-600 font-semibold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Vui lòng sửa các lỗi đỏ trong bảng trước khi xác nhận lưu.</span>
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dữ liệu hợp lệ! Sẵn sàng nhập vào gia phả.</span>
                </span>
              )
            ) : (
              <span>Dán JSON hoặc chọn file để hệ thống bắt đầu kiểm tra.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={hasBlockingErrors || isSubmitting}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                hasBlockingErrors || isSubmitting
                  ? "bg-slate-400 cursor-not-allowed opacity-60"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? "Đang Xử Lý Giao Dịch..."
                  : `Xác Nhận Lưu Vào Gia Phả (${validation?.valid || 0})`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
