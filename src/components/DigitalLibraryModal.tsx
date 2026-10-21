"use client";

import React, { useState } from "react";
import {
  X,
  BookOpen,
  Scroll,
  Landmark,
  FileText,
  Search,
  ExternalLink,
  ZoomIn,
  Download,
  Calendar,
  Sparkles,
  ShieldCheck,
  Award,
} from "lucide-react";

interface DocumentItem {
  id: string;
  title: string;
  category: "sac-phong" | "gia-pho" | "van-bia" | "toc-uoc";
  categoryLabel: string;
  period: string;
  reignYear: string;
  location: string;
  description: string;
  translation: string;
  hightlightText?: string;
  previewColor: string;
}

const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    title: "Sắc Phong Thần Tổ Tộc Phan — Triều Vua Tự Đức",
    category: "sac-phong",
    categoryLabel: "Sắc Phong Triều Đình",
    period: "Nhà Nguyễn (Năm 1852)",
    reignYear: "Tự Đức ngũ niên thất nguyệt",
    location: "Từ đường Đại Tộc Phan, Điện Bàn, Quảng Nam",
    description: "Sắc phong ban tặng cho Cao Tổ Tộc Phan tước vị Dực Bảo Trung Hưng Linh Phù Chi Thần vì có công khai khẩn đất hoang và hộ quốc an dân.",
    translation: "Sắc phong: Phong cho vị tiền bối Phan tộc có công lao gìn giữ bờ cõi, bảo bọc dân lành, lưu truyền vạn thế làm gương sáng...",
    hightlightText: "Dực Bảo Trung Hưng Chi Thần",
    previewColor: "from-amber-700/80 to-amber-900/90",
  },
  {
    id: "doc-2",
    title: "Gia Phổ Tiền Hiền Chữ Hán Nôm — Bản Khắc Gỗ Cổ",
    category: "gia-pho",
    categoryLabel: "Gia Phổ Hán Nôm",
    period: "Nhà Lê Trung Hưng (Năm 1740)",
    reignYear: "Cảnh Hưng nguyên niên",
    location: "Tủ lưu trữ văn thư Tổ đường",
    description: "Bản sao mộc bản ghi chép thứ tự thế phả từ vị Thủy Tổ thiên di vào phương Nam lập ấp, ghi đầy đủ danh tính phu nhân và các chi phái.",
    translation: "Cội rễ bền chặt mới tốt tươi cành lá; nguồn cội sâu xa ắt tuôn chảy dài lâu. Kính cẩn ghi chép phả hệ để con cháu muôn đời biết đường tôn kính...",
    hightlightText: "Thủy Tổ khai hoang Nam tiến",
    previewColor: "from-stone-700/80 to-stone-900/90",
  },
  {
    id: "doc-3",
    title: "Văn Bia Đá Từ Đường — Khắc Ghi Công Đức Trùng Tu",
    category: "van-bia",
    categoryLabel: "Văn Bia Từ Đường",
    period: "Thời Vua Thành Thái (Năm 1898)",
    reignYear: "Thành Thái thập niên",
    location: "Sân tả vu nhà thờ Tổ",
    description: "Văn bia bằng đá cẩm thạch nguyên khối ghi danh các bậc hiền đức quyên góp tiền vàng, ruộng đất để xây dựng nhà thờ tộc và nuôi dưỡng học trò nghèo.",
    translation: "Bia đá ngàn năm trơ cùng tuế nguyệt, lòng hiếu thảo của con cháu sáng tựa trăng rằm. Ai qua chốn này xin hãy nghiêng mình tưởng nhớ công đức tiền nhân...",
    hightlightText: "Bia công đức ngàn năm",
    previewColor: "from-slate-700/80 to-slate-900/90",
  },
  {
    id: "doc-4",
    title: "Tộc Ước & Khoán Lệ Dòng Họ — Quy Chuẩn Gia Phong",
    category: "toc-uoc",
    categoryLabel: "Tộc Ước Gia Phong",
    period: "Năm Khải Định thứ 3 (1918)",
    reignYear: "Khải Định tam niên",
    location: "Ban Trị Sự Tộc Họ lưu trữ",
    description: "Mười hai điều tộc ước răn dạy con cháu: hiếu thuận với ông bà cha mẹ, hòa thuận anh em, trọng việc học hành thi cử, giữ gìn liêm sỉ và tương trợ bà con lối xóm.",
    translation: "Điều thứ nhất: Lấy hiếu đễ làm đầu. Điều thứ hai: Kính già yêu trẻ. Điều thứ ba: Không cậy thế hà hiếp người cô thế. Điều thứ tư: Khuyến khích đèn sách thành tài...",
    hightlightText: "Mười hai điều gia huấn",
    previewColor: "from-red-800/80 to-red-950/90",
  },
];

interface DigitalLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DigitalLibraryModal({
  isOpen,
  onClose,
}: DigitalLibraryModalProps) {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem>(SAMPLE_DOCUMENTS[0]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredDocs = SAMPLE_DOCUMENTS.filter((doc) => {
    const matchCat = activeCategory === "all" || doc.category === activeCategory;
    const matchSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.period.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FAF7EE] text-slate-800 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl border border-amber-900/20 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#4A0E17] via-[#63141F] to-[#4A0E17] text-white px-6 py-4.5 flex items-center justify-between border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-amber-100 tracking-wide">
                  Thư Viện Số & Di Sản Dòng Tộc
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full font-medium">
                  Lưu trữ vĩnh viễn
                </span>
              </div>
              <p className="text-xs text-amber-200/80">
                Lưu giữ hình ảnh sắc phong cổ, gia phổ Hán Nôm, văn bia và tộc ước gia phong
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Category Filters & Search */}
        <div className="bg-[#F4EEDC] px-6 py-3 border-b border-amber-900/10 flex flex-wrap items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: "all", label: "Tất cả di sản" },
              { id: "sac-phong", label: "Sắc phong vua ban" },
              { id: "gia-pho", label: "Gia phổ Hán Nôm" },
              { id: "van-bia", label: "Văn bia từ đường" },
              { id: "toc-uoc", label: "Tộc ước & Gia phong" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-[#63141F] text-amber-100 shadow-xs"
                    : "bg-white/70 hover:bg-white text-slate-700 border border-amber-900/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tư liệu, niên đại..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-amber-900/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#63141F]/30"
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left: Document List (5 cols) */}
          <div className="md:col-span-5 p-4 overflow-y-auto space-y-3 border-r border-amber-900/10 max-h-[60vh] md:max-h-none">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-[#63141F] shadow-md ring-2 ring-[#63141F]/15"
                      : "bg-white/60 hover:bg-white border-amber-900/10 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-14 rounded-xl bg-gradient-to-br ${doc.previewColor} text-amber-200 flex flex-col items-center justify-center shrink-0 shadow-xs p-1`}
                    >
                      <Scroll className="w-5 h-5 mb-0.5" />
                      <span className="text-[8px] font-bold tracking-tighter uppercase text-center leading-none">
                        CỔ BẢN
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                          {doc.categoryLabel}
                        </span>
                        <span className="text-[10px] text-slate-500">{doc.period}</span>
                      </div>
                      <h4 className="font-serif font-bold text-xs sm:text-sm text-slate-900 leading-snug truncate">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                        {doc.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Document Detailed Reader (7 cols) */}
          <div className="md:col-span-7 p-6 overflow-y-auto bg-white/40 flex flex-col justify-between">
            <div>
              {/* Document Visual Display */}
              <div className="relative rounded-2xl p-6 bg-gradient-to-br from-[#FFFDF8] to-[#F5ECD7] border-2 border-amber-900/20 shadow-inner mb-5 overflow-hidden">
                {/* Cultural Watermark Pattern */}
                <div className="absolute right-4 bottom-4 w-40 h-40 opacity-10 rounded-full border-8 border-dashed border-amber-900 pointer-events-none" />

                <div className="flex items-center justify-between mb-3 border-b border-amber-900/15 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-700" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      {selectedDoc.categoryLabel}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600">
                    Niên hiệu: {selectedDoc.reignYear}
                  </span>
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#4A0E17] mb-2 leading-tight">
                  {selectedDoc.title}
                </h3>

                <p className="text-xs text-slate-500 mb-4 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5 text-amber-700" />
                  <span>Lưu giữ tại: {selectedDoc.location}</span>
                </p>

                {/* Ancient Text Preview Simulation */}
                <div className="bg-[#FAF2DE] p-4 rounded-xl border border-amber-800/20 mb-4 font-serif text-amber-950/90 text-sm italic leading-relaxed shadow-xs">
                  &ldquo;{selectedDoc.translation}&rdquo;
                </div>

                <div className="text-xs text-slate-700 leading-relaxed space-y-2">
                  <p className="font-semibold text-amber-900">Bối cảnh lịch sử & Ý nghĩa:</p>
                  <p>{selectedDoc.description}</p>
                </div>
              </div>

              {/* Security & Verification note */}
              <div className="flex items-center gap-2.5 bg-emerald-50 text-emerald-800 px-3.5 py-2.5 rounded-xl border border-emerald-200 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Bản quét độ phân giải cao đã được xác thực bảo lưu bởi Hội đồng Trị sự Tộc Phan.
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-5 flex items-center justify-end gap-2.5 border-t border-amber-900/10 mt-6">
              <button
                type="button"
                onClick={() => alert("Đang tải xuống bản sao số hóa độ phân giải cao (PDF)...")}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-amber-50 text-slate-700 border border-amber-900/20 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-800" />
                <span>Tải Bản Quét HD</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 bg-[#63141F] hover:bg-[#4A0E17] text-amber-100 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Đóng Thư Viện
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
