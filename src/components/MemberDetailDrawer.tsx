"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Heart,
  Calendar,
  Baby,
  Edit2,
  Trash2,
  Users,
  FileText,
  Phone,
  MapPin,
  ShieldCheck,
  Send,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { Member } from "@/types/family";
import { useFamilyStore } from "@/lib/family-store";

interface MemberDetailDrawerProps {
  member: Member | null;
  onClose: () => void;
  onEdit: (member: Member) => void;
  onAddChild: (parent: Member) => void;
  onAddSpouse: (spouse: Member) => void;
  onShowToast: (msg: string) => void;
}

export default function MemberDetailDrawer({
  member,
  onClose,
  onEdit,
  onAddChild,
  onAddSpouse,
  onShowToast,
}: MemberDetailDrawerProps) {
  const { getMember, getChildren, getSpouse, deleteMemberDirect, submitChangeRequest, isAdmin } =
    useFamilyStore();

  // Delete proposal modal state (for non-admin users)
  const [showDeleteProposalModal, setShowDeleteProposalModal] = useState(false);
  const [deleteSubmitterName, setDeleteSubmitterName] = useState("");
  const [deleteSubmitterPhone, setDeleteSubmitterPhone] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!member) return null;

  const isMale = member.gender === "male";
  const father = member.fatherId ? getMember(member.fatherId) : undefined;
  const mother = member.motherId ? getMember(member.motherId) : undefined;
  const spouse = member.spouseId ? getMember(member.spouseId) : undefined;
  const children = getChildren(member.id);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleDeleteClick = () => {
    if (isAdmin) {
      if (
        confirm(
          `[ADMIN XÁC NHẬN] Bạn có chắc chắn muốn xóa thành viên "${member.fullName}" khỏi sơ đồ gia phả trực tiếp?`
        )
      ) {
        deleteMemberDirect(member.id);
        onClose();
        onShowToast(`Đã xóa thành viên "${member.fullName}" thành công.`);
      }
    } else {
      // Guest: Open Delete Proposal Modal
      setShowDeleteProposalModal(true);
    }
  };

  const handleSubmitDeleteProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteSubmitterName.trim() || !deleteSubmitterPhone.trim() || !deleteReason.trim()) {
      alert("Vui lòng điền đầy đủ Họ tên, Số điện thoại và Lý do đề xuất xóa.");
      return;
    }

    submitChangeRequest({
      actionType: "DELETE",
      targetMemberId: member.id,
      submitterName: deleteSubmitterName.trim(),
      submitterPhone: deleteSubmitterPhone.trim(),
      data: {
        memberId: member.id,
        fullName: member.fullName,
        generation: member.generation,
        reason: deleteReason.trim(),
      },
    });

    setShowDeleteProposalModal(false);
    setDeleteSubmitterName("");
    setDeleteSubmitterPhone("");
    setDeleteReason("");
    onClose();
    onShowToast(
      "Yêu cầu của bạn đã được gửi thành công và đang đợi Ban trị sự (Admin) kiểm duyệt trước khi áp dụng lên cây phả hệ."
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
        <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden">
          {/* Drawer Header */}
          <div
            className={`p-6 text-white shrink-0 relative ${
              isMale ? "bg-blue-600" : "bg-rose-500"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              {/* Square Avatar */}
              <div className="w-20 h-20 rounded-xl bg-white/20 border-2 border-white/40 flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-block bg-white/20 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-2xs">
                    ĐỜI {member.generation}
                  </span>
                  {member.orderInFamily && (
                    <span className="inline-block bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-2xs">
                      Con thứ {member.orderInFamily}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold text-white truncate">
                  {member.fullName}
                </h2>
                {member.nickname && (
                  <p className="text-xs text-white/90 italic font-medium mt-0.5">
                    &ldquo;{member.nickname}&rdquo;
                  </p>
                )}
                <span className="inline-flex items-center gap-1 text-[11px] mt-1 bg-white/10 px-2.5 py-0.5 rounded-full font-medium">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      member.isAlive ? "bg-emerald-300" : "bg-amber-300"
                    }`}
                  ></span>
                  <span>{member.isAlive ? "Đang sống" : "Đã mất"}</span>
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onAddSpouse(member)}
                className="flex-1 py-1.5 px-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5" />
                <span>+ Vợ/Chồng</span>
              </button>
              <button
                type="button"
                onClick={() => onAddChild(member)}
                className="flex-1 py-1.5 px-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Baby className="w-3.5 h-3.5" />
                <span>+ Thêm Con</span>
              </button>
            </div>
          </div>

          {/* Drawer Body - Hiển thị công khai toàn bộ chi tiết */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-700">
            {/* 1. Liên hệ & Cư trú (Công khai cho mọi người xem) */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Thông Tin Liên Hệ & Nơi Cư Trú</span>
              </h4>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Số điện thoại:</span>
                {member.phone ? (
                  <div className="flex items-center gap-1.5 font-mono font-semibold text-blue-700">
                    <a href={`tel:${member.phone}`} className="hover:underline">
                      {member.phone}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyPhone(member.phone!)}
                      className="text-slate-400 hover:text-slate-600 p-1"
                      title="Sao chép SĐT"
                    >
                      {copiedPhone ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Chưa cập nhật SĐT</span>
                )}
              </div>
              <div className="flex items-start justify-between py-1">
                <span className="text-slate-500 shrink-0 mr-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>Địa chỉ:</span>
                </span>
                <span className="text-right font-medium text-slate-800">
                  {member.address || "Chưa cập nhật địa chỉ"}
                </span>
              </div>
            </div>

            {/* 2. Thời gian sinh - tử */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Thời Gian Sinh & Ngày Mất</span>
              </h4>
              <p className="flex justify-between">
                <span className="text-slate-500">Ngày sinh:</span>
                <span className="font-medium text-slate-800">
                  {member.birthDate || "Chưa cập nhật"}
                </span>
              </p>
              {!member.isAlive && (
                <p className="flex justify-between text-amber-900">
                  <span className="text-slate-500">Ngày mất (Giỗ):</span>
                  <span className="font-semibold">
                    {member.deathDate || "Chưa cập nhật"}
                  </span>
                </p>
              )}
            </div>

            {/* 3. Huyết thống & Quan hệ */}
            <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Huyết Thống & Hôn Phối</span>
              </h4>
              <p className="flex justify-between">
                <span className="text-slate-500">Cha (Thân phụ):</span>
                {father ? (
                  <span className="font-bold text-blue-700">{father.fullName}</span>
                ) : (
                  <span className="text-slate-400">Khởi tổ / Chưa rõ</span>
                )}
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Mẹ (Thân mẫu):</span>
                {mother ? (
                  <span className="font-bold text-rose-700">{mother.fullName}</span>
                ) : (
                  <span className="text-slate-400">Chưa cập nhật</span>
                )}
              </p>
              <p className="flex justify-between">
                <span className="text-slate-500">Vợ / Chồng:</span>
                {spouse ? (
                  <span className="font-bold text-slate-900">{spouse.fullName}</span>
                ) : (
                  <span className="text-slate-400">Chưa có</span>
                )}
              </p>
            </div>

            {/* 4. Danh sách con cái */}
            {children.length > 0 && (
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Con cái huyết thống ({children.length})</span>
                  <span className="text-[10px] text-slate-500">
                    Sắp xếp theo thứ tự
                  </span>
                </h4>
                <div className="space-y-1">
                  {children.map((c) => (
                    <div
                      key={c.id}
                      className="p-2 bg-white rounded-lg border border-slate-200 flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800">
                        {c.orderInFamily ? `Con thứ ${c.orderInFamily}: ` : ""}
                        {c.fullName}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Đời {c.generation}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Ghi chú & Tiểu sử */}
            {member.notes && (
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tiểu Sử & Nghề Nghiệp</span>
                </h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {member.notes}
                </p>
              </div>
            )}

            {/* Notice for guests */}
            {!isAdmin && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2 text-[11px] text-blue-800">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Mọi thao tác chỉnh sửa hoặc xóa từ khách sẽ được gửi về Ban Quản Trị
                  dòng họ kiểm duyệt trước khi áp dụng chính thức.
                </p>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isAdmin ? "Chỉnh Sửa Trực Tiếp" : "Đề Xuất Chỉnh Sửa"}</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteClick}
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
              title={isAdmin ? "Xóa thành viên trực tiếp" : "Gửi yêu cầu đề xuất xóa thành viên"}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Guest Delete Proposal Modal */}
      {showDeleteProposalModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">Đề Xuất Xóa Thành Viên</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteProposalModal(false)}
                className="text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDeleteProposal} className="p-5 space-y-3 text-xs">
              <div className="p-2.5 bg-rose-50 text-rose-800 rounded-lg border border-rose-200">
                Bạn đang gửi đề xuất xóa thành viên:{" "}
                <strong className="text-rose-900">{member.fullName}</strong> (Đời {member.generation}).
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Họ và tên người gửi đề xuất *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phan Văn An"
                  value={deleteSubmitterName}
                  onChange={(e) => setDeleteSubmitterName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Số điện thoại người gửi *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 0912345678"
                  value={deleteSubmitterPhone}
                  onChange={(e) => setDeleteSubmitterPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lý do đề xuất xóa *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Trùng lặp hồ sơ, sai nhánh dòng họ..."
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteProposalModal(false)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi Đề Xuất Phê Duyệt</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
