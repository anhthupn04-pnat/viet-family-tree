"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  FileText,
  Image as ImageIcon,
  Scroll,
  PlusCircle,
  Search,
  ExternalLink,
  Calendar,
  User,
  Sparkles,
  X,
} from "lucide-react";

interface ClanDocument {
  id: string;
  title: string;
  type: string; // IMAGE, MANUSCRIPT, STELE, ROYAL_DECREE, VIDEO
  fileUrl: string;
  era?: string | null;
  author?: string | null;
  description?: string | null;
  createdAt: string;
}

interface DocumentsViewProps {
  isAdmin: boolean;
}

export default function DocumentsView({ isAdmin }: DocumentsViewProps) {
  const [documents, setDocuments] = useState<ClanDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal create
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("IMAGE");
  const [fileUrl, setFileUrl] = useState("");
  const [era, setEra] = useState("Thời Nguyễn (Thế kỷ 19)");
  const [author, setAuthor] = useState("Ban Trị Sự Dòng Họ");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents");
      const data = await res.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      setErrorMsg("Vui lòng nhập tiêu đề và liên kết tệp tư liệu.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          type,
          fileUrl,
          era,
          author,
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi lưu tư liệu.");

      setShowModal(false);
      setTitle("");
      setFileUrl("");
      setDescription("");
      fetchDocs();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesType = selectedType === "ALL" || doc.type === selectedType;
    const matchesQuery =
      searchTerm === "" ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesQuery;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#8B1E1E] to-[#5C1414] text-white p-6 rounded-3xl shadow-xl border border-[#C59B27]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-amber-400/20 text-amber-200 text-xs px-3 py-1 rounded-full border border-amber-300/30">
            <Scroll className="w-3.5 h-3.5" />
            <span>Kho Tàng Văn Bia & Sử Ký Dòng Tộc</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-amber-100">
            Tư Liệu Cổ & Lịch Sử Dòng Họ
          </h1>
          <p className="text-xs text-amber-100/70 max-w-2xl">
            Lưu trữ các bản gia phả chữ Hán - Nôm đã số hóa, văn bia từ đường, sắc phong triều Nguyễn, hình ảnh tư liệu ngày giỗ tổ và các ấn phẩm lịch sử dòng họ.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#C59B27] hover:bg-[#B0881F] text-[#24150B] font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5 shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Thêm Tư Liệu Mới</span>
          </button>
        )}
      </div>

      {/* Filter and search */}
      <div className="bg-white rounded-2xl border border-[#E8DEC7] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "Tất cả tư liệu" },
            { id: "IMAGE", label: "Ảnh chụp di tích" },
            { id: "MANUSCRIPT", label: "Gia phả cổ chữ Nôm" },
            { id: "STELE", label: "Văn bia & Câu đối" },
            { id: "ROYAL_DECREE", label: "Sắc phong" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedType === tab.id
                  ? "bg-[#8B1E1E] text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8B1E1E]"
          />
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="text-center p-12 text-stone-400 text-xs">Đang tải tư liệu cổ...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8DEC7] p-12 text-center text-stone-500 text-xs space-y-2">
          <BookOpen className="w-8 h-8 mx-auto text-[#C59B27]/60" />
          <p className="font-semibold text-stone-700">Chưa có tài liệu nào phù hợp với bộ lọc.</p>
          {isAdmin && (
            <p className="text-stone-500">
              Bạn có thể nhấn <strong>"Thêm Tư Liệu Mới"</strong> ở góc phải để tải lên tài liệu dòng họ.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-[#E8DEC7] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
            >
              <div className="h-44 bg-stone-100 relative overflow-hidden">
                <img
                  src={doc.fileUrl}
                  alt={doc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e: any) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=60";
                  }}
                />
                <span className="absolute top-3 left-3 bg-[#8B1E1E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {doc.type === "IMAGE"
                    ? "Ảnh tư liệu"
                    : doc.type === "MANUSCRIPT"
                    ? "Gia phả Nôm"
                    : doc.type === "STELE"
                    ? "Văn bia cổ"
                    : "Sắc phong"}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm font-serif text-[#8B1E1E] line-clamp-1">
                    {doc.title}
                  </h3>
                  {doc.era && (
                    <p className="text-[11px] text-amber-700 font-medium flex items-center space-x-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>Niên đại: {doc.era}</span>
                    </p>
                  )}
                  {doc.description && (
                    <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{doc.author || "Khuyết danh"}</span>
                  </span>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8B1E1E] hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <span>Xem tư liệu</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add Document */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-[#C59B27]/40 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#8B1E1E] to-[#681313] text-white flex items-center justify-between">
              <h2 className="text-base font-bold font-serif text-amber-200">
                Thêm Tư Liệu Cổ & Lịch Sử Dòng Họ
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tiêu đề tư liệu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Văn bia Khởi Tổ Từ Đường Phan Tộc năm 1892"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#8B1E1E] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Loại tư liệu
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#8B1E1E] focus:outline-hidden bg-white"
                  >
                    <option value="IMAGE">Ảnh di tích / nhà thờ họ</option>
                    <option value="MANUSCRIPT">Bản gia phả chữ Nôm</option>
                    <option value="STELE">Văn bia & Câu đối</option>
                    <option value="ROYAL_DECREE">Sắc phong vua ban</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Niên đại / Thời kỳ
                  </label>
                  <input
                    type="text"
                    placeholder="Thời Nguyễn, năm 1892..."
                    value={era}
                    onChange={(e) => setEra(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#8B1E1E] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Đường dẫn tệp / Hình ảnh (URL) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://... ảnh hoặc tài liệu PDF số hóa"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#8B1E1E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Người lưu trữ / Tác giả
                </label>
                <input
                  type="text"
                  placeholder="Ban Trị Sự Dòng Họ / Cụ Phan Văn Định..."
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#8B1E1E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Mô tả chi tiết nội dung
                </label>
                <textarea
                  rows={3}
                  placeholder="Dịch nghĩa Hán Nôm hoặc giải thích lịch sử sự kiện..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-[#8B1E1E] focus:outline-hidden"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg text-xs font-bold hover:bg-[#721515] transition-all disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Lưu tư liệu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
