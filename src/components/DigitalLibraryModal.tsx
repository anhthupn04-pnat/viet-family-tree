"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Scroll,
  Landmark,
  Image as ImageIcon,
  FileText,
  Award,
  Sparkles,
  X,
  ExternalLink,
  Download,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Tree } from "@/types/family";

interface DigitalLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tree?: Tree | null;
}

type TabType = "history" | "convention" | "epitaph" | "gallery";

export default function DigitalLibraryModal({
  isOpen,
  onClose,
  tree,
}: DigitalLibraryModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("history");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!isOpen) return null;

  const clanName = tree?.name || "Gia Phả Tộc Phan (Quảng Nam)";
  const origin = tree?.originLocation || "Điện Bàn, Quảng Nam";

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Thư Viện Số Dòng Tộc
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Di Sản
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {clanName} • {origin}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "history"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Nguồn Gốc & Lịch Sử</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("convention")}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "convention"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Scroll className="w-4 h-4" />
            <span>2. Hương Ước Dòng Họ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("epitaph")}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "epitaph"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Văn Bia & Gia Huấn</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "gallery"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>4. Hình Ảnh Từ Đường</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-800 space-y-6">
          {/* TAB 1: HISTORY */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Nguồn Gốc Phát Tích Dòng Tộc</span>
                </div>
                <p className="text-xs text-amber-950/90 leading-relaxed font-serif text-justify">
                  Theo truyền tích gia phả và các bản khắc gỗ còn lưu giữ tại Từ đường Đại tôn,
                  dòng tộc nguyên khởi từ vùng đất Thanh Hóa theo bước chân Nam tiến vào thế kỷ XV,
                  khai hoang lập ấp tại châu thổ sông Thu Bồn, phủ Điện Bàn, xứ Quảng Nam.
                  Cụ Khởi Tổ hiệu Phúc Thiện là bậc tiên hiền đức độ, khai sáng cơ nghiệp rạng rỡ,
                  truyền thừa qua bao đời con cháu luôn giữ vững đạo trung hiếu, cần kiệm, hiếu học.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>Di Tích Từ Đường Đại Tôn</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Từ đường được trùng tu lớn vào niên hiệu Thành Thái (1898) và đại trùng tu năm 2012,
                    lưu giữ 3 đạo sắc phong của triều Nguyễn ban khen tiết hạnh và công thần.
                  </p>
                  <div className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Làng Thạnh Mỹ, Điện Bàn, Quảng Nam</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Truyền Thống Khoa Bảng</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dòng họ tự hào có 2 vị đỗ Cử nhân triều Nguyễn, nhiều danh sĩ tham gia phong trào
                    Duy Tân và hàng trăm con cháu ngày nay tốt nghiệp Thạc sĩ, Tiến sĩ trên khắp đất nước.
                  </p>
                  <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Quỹ Khuyến Học hoạt động thường niên</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider text-slate-500">
                  Dấu Mốc Lịch Sử Tiêu Biểu
                </h4>
                <div className="space-y-3 text-xs border-l-2 border-blue-200 pl-4 ml-1">
                  <div>
                    <span className="font-bold text-blue-900">Thế kỷ XV – Khởi dựng cơ đồ:</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Cụ Tiên Hiền Khai canh chiêu tập dân cư, lập làng định cư ven sông.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-blue-900">Năm 1898 – Trùng tu Từ đường:</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Được vua ban sắc tứ phụng tự, dựng bia đá lưu danh công đức tiền nhân.
                    </p>
                  </div>
                  <div>
                    <span className="font-bold text-blue-900">Năm 2024 – Số hóa phả hệ:</span>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Ban Trị Sự ứng dụng công nghệ phả hệ điện tử để kết nối con cháu trong và ngoài nước.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONVENTIONS */}
          {activeTab === "convention" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl">
                <h3 className="font-bold text-blue-950 text-xs flex items-center gap-2 mb-1">
                  <Scroll className="w-4 h-4 text-blue-600" />
                  <span>Quy Ước Dòng Họ (Hương Ước Truyền Thừa)</span>
                </h3>
                <p className="text-xs text-blue-900/80 leading-relaxed">
                  Trích nguyên văn bản Quy ước Dòng tộc được Hội đồng Gia tộc nhất trí thông qua
                  nhằm giáo dục con cháu tu dưỡng đạo đức, tương thân tương ái.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
                  <span className="font-bold text-slate-900 text-sm">Điều 1: Đạo hiếu & Tôn kính tổ tiên</span>
                  <p className="text-slate-600 mt-1.5 leading-relaxed">
                    Con cháu trong dòng họ phải luôn ghi nhớ công ơn sinh thành, dưỡng dục của cha mẹ,
                    tổ tiên. Tham gia đầy đủ các ngày lễ kỵ giỗ Tiên tổ hằng năm vào tiết Thanh Minh và ngày giỗ Khởi Tổ.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
                  <span className="font-bold text-slate-900 text-sm">Điều 2: Hòa thuận nội tộc & Trách nhiệm xã hội</span>
                  <p className="text-slate-600 mt-1.5 leading-relaxed">
                    Anh em trong dòng họ lấy chữ Hòa làm trọng. Khi gặp hoạn nạn, ốm đau cùng chung tay
                    tương trợ, giúp đỡ lẫn nhau vượt qua khó khăn. Sống gương mẫu, chấp hành nghiêm pháp luật.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
                  <span className="font-bold text-slate-900 text-sm">Điều 3: Khuyến học, khuyến tài & Phát triển tương lai</span>
                  <p className="text-slate-600 mt-1.5 leading-relaxed">
                    Con cháu đạt thành tích cao trong học tập, thi đỗ đại học, đạt học vị thạc sĩ, tiến sĩ
                    hoặc có đóng góp xuất sắc cho quê hương sẽ được Ban Khuyến học dòng họ vinh danh và khen thưởng hằng năm.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
                  <span className="font-bold text-slate-900 text-sm">Điều 4: Bảo tồn Từ đường & Quỹ Tế tự</span>
                  <p className="text-slate-600 mt-1.5 leading-relaxed">
                    Mọi khoản đóng góp tự nguyện của con cháu vào Quỹ Dòng tộc được quản lý minh bạch,
                    công khai sổ thu chi hằng năm, dùng vào việc hương khói, tu bổ Từ đường và thăm hỏi ốm đau.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EPITAPHS & PRECEPTS */}
          {activeTab === "epitaph" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Couplets */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 text-center space-y-4 shadow-md">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                  Câu Đối Thờ Nơi Gian Chính Từ Đường
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-serif text-amber-200 tracking-wide leading-loose">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Vế xuất:</p>
                    <p className="text-base font-bold">
                      "Tổ đức lưu truyền thiên cổ thịnh"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans">
                      (Đức tổ tông lưu truyền nghìn năm luôn thịnh vượng)
                    </p>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Vế đối:</p>
                    <p className="text-base font-bold">
                      "Tôn hiền kế thế vạn niên vinh"
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-sans">
                      (Cháu con hiền thảo nối nghiệp muôn thuở mãi vinh quang)
                    </p>
                  </div>
                </div>
              </div>

              {/* Stone Inscription */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Bản Dịch Minh Văn Bia Tiền Hiền (Niên hiệu Thành Thái)</span>
                  </h4>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                    Bản khắc đá 1898
                  </span>
                </div>
                <div className="text-xs text-slate-700 font-serif leading-relaxed italic bg-white p-4 rounded-xl border border-slate-200">
                  "Cội rễ sâu thì cành lá sum suê, nguồn nước dài thì dòng sông chảy xiết.
                  Người đời sinh ra ở đời, ắt có gốc gác tiền nhân dày công bồi đắp.
                  Nay khắc chữ vào đá son, để muôn đời con cháu soi chung, noi gương trung hiếu,
                  lấy sự thiện lương làm nền tảng truyền gia, quyết không làm tổn hại đến thanh danh gia tộc..."
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PHOTO GALLERY */}
          {activeTab === "gallery" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">
                    Thư Viện Hình Ảnh Từ Đường & Di Tích Dòng Họ
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Nhấp vào từng ảnh để phóng to và xem thông tin chi tiết.
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  4 Tư liệu ảnh
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Photo Item 1 */}
                <div
                  onClick={() =>
                    setSelectedImage(
                      "https://images.unsplash.com/photo-1548625361-1ac4df37f26f?auto=format&fit=crop&w=1200&q=80"
                    )
                  }
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-xs hover:shadow-lg transition-all"
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1548625361-1ac4df37f26f?auto=format&fit=crop&w=800&q=80"
                      alt="Từ Đường Đại Tôn"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 bg-white">
                    <h5 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                      Mặt tiền Từ Đường Đại Tôn
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kiến trúc 3 gian 2 chái truyền thống miền Trung.
                    </p>
                  </div>
                </div>

                {/* Photo Item 2 */}
                <div
                  onClick={() =>
                    setSelectedImage(
                      "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80"
                    )
                  }
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-xs hover:shadow-lg transition-all"
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80"
                      alt="Gian Thờ Chính"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 bg-white">
                    <h5 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                      Gian Thờ Tiền Hiền & Hoành Phi
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Bức hoành phi "Đức Lưu Quang" sơn son thếp vàng.
                    </p>
                  </div>
                </div>

                {/* Photo Item 3 */}
                <div
                  onClick={() =>
                    setSelectedImage(
                      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                    )
                  }
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-xs hover:shadow-lg transition-all"
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
                      alt="Khuôn Viên Từ Đường"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 bg-white">
                    <h5 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                      Khuôn viên Sân Từ Đường & Cây Bồ Đề
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Nơi họp mặt con cháu vào dịp Giỗ Tổ và Chúc thọ hằng năm.
                    </p>
                  </div>
                </div>

                {/* Photo Item 4 */}
                <div
                  onClick={() =>
                    setSelectedImage(
                      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"
                    )
                  }
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-xs hover:shadow-lg transition-all"
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-200">
                    <img
                      src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
                      alt="Bản Sắc Phong Cổ"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3 bg-white">
                    <h5 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                      Sắc phong & Tờ cử Triều Nguyễn
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Di vật lịch sử quý giá được bọc kính bảo quản tại hậu cung.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Tư liệu bảo tồn nội bộ dòng họ • Đã xác thực bởi Ban Trị Sự</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer transition-colors"
          >
            Đóng Lại
          </button>
        </div>
      </div>

      {/* Lightbox Image Preview Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-70 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl">
            <img
              src={selectedImage}
              alt="Chi tiết tư liệu"
              className="w-full h-full object-contain max-h-[80vh] rounded-2xl"
            />
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
