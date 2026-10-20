"use client";

import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  PlusCircle,
  Award,
  Building,
  Heart,
  CheckCircle,
  FileText,
} from "lucide-react";

interface FundsViewProps {
  isAdmin: boolean;
}

export default function FundsView({ isAdmin }: FundsViewProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number>(1000000);
  const [transactionType, setTransactionType] = useState("INCOME");
  const [fundType, setFundType] = useState("SCHOLARSHIP");
  const [contributor, setContributor] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchFunds = async () => {
    try {
      setLoading(true);
      const url = filterType !== "ALL" ? `/api/funds?fundType=${filterType}` : "/api/funds";
      const res = await fetch(url);
      const data = await res.json();
      if (data.transactions) setTransactions(data.transactions);
      if (data.summary) setSummary(data.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, [filterType]);

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/funds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: Number(amount),
          transactionType,
          fundType,
          contributorOrRecipient: contributor,
          notes,
        }),
      });
      if (!res.ok) throw new Error("Không thể ghi nhận giao dịch.");
      setShowModal(false);
      setTitle("");
      setContributor("");
      setNotes("");
      fetchFunds();
    } catch (err: any) {
      alert(err.message || "Lỗi khi ghi nhận quỹ.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatVND = (num: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(num);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#8B1E1E] to-[#601313] rounded-2xl p-6 text-white shadow-traditional flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Tài Chính & Khuyến Học Minh Bạch</span>
          </div>
          <h2 className="text-2xl font-bold font-serif text-amber-100">
            Quỹ Dòng Họ & Quỹ Khuyến Học Phan Tộc
          </h2>
          <p className="text-amber-100/80 text-xs md:text-sm mt-1 max-w-2xl">
            Toàn bộ các khoản công đức trùng tu từ đường, học bổng khen thưởng con em đỗ đạt và tương trợ dòng tộc đều được công khai minh bạch.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-[#C59B27] hover:bg-[#B0881F] text-[#24150B] font-bold rounded-xl text-xs md:text-sm shadow-md transition-all flex items-center space-x-2 whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Ghi nhận thu / chi quỹ</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC7] shadow-sm">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Tổng Quỹ Thu Vào
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-serif text-emerald-700 mt-2">
            {formatVND(summary.totalIncome)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            Đóng góp từ 4 chi họ và con cháu kiều bào
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DEC7] shadow-sm">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-xs font-bold uppercase tracking-wider">
              Tổng Đã Chi Phí
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-serif text-rose-700 mt-2">
            {formatVND(summary.totalExpense)}
          </p>
          <p className="text-[11px] text-stone-400 mt-1">
            Khen thưởng học bổng và tu bổ hương hỏa
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#FAF7EE] to-white p-5 rounded-2xl border-2 border-[#C59B27] shadow-sm">
          <div className="flex items-center justify-between text-stone-700">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B1E1E]">
              Số Dư Quỹ Hiện Tại
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#8B1E1E]" />
            </div>
          </div>
          <p className="text-2xl font-black font-serif text-[#8B1E1E] mt-2">
            {formatVND(summary.balance)}
          </p>
          <p className="text-[11px] text-stone-500 mt-1">
            Tồn quỹ sẵn sàng chi các hoạt động tới
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-[#E8DEC7] p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-stone-700">Phân loại quỹ:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "ALL", label: "Tất cả quỹ" },
                { id: "SCHOLARSHIP", label: "Quỹ Khuyến Học" },
                { id: "CONSTRUCTION", label: "Tu Bổ Từ Đường" },
                { id: "CHARITY", label: "Quỹ Tương Trợ" },
                { id: "GENERAL", label: "Hoạt Động Chung" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterType === tab.id
                      ? "bg-[#8B1E1E] text-white shadow-sm"
                      : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF7EE] text-stone-600 font-bold uppercase text-[10px] border-b border-[#E8DEC7]">
                <th className="py-3 px-4">Ngày ghi nhận</th>
                <th className="py-3 px-3">Khoản Mục Giao Dịch</th>
                <th className="py-3 px-3">Loại Quỹ</th>
                <th className="py-3 px-3">Người Đóng Góp / Người Nhận</th>
                <th className="py-3 px-3 text-right">Số Tiền (VNĐ)</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {transactions.map((tx) => {
                const isIncome = tx.transactionType === "INCOME";
                return (
                  <tr key={tx.id} className="hover:bg-[#FAF7EE]/50 transition-colors">
                    <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-stone-900 block">
                        {tx.title}
                      </span>
                      {tx.notes && (
                        <span className="text-[10px] text-stone-400 italic">
                          {tx.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-stone-100 text-stone-700 text-[10px] font-medium px-2 py-0.5 rounded">
                        {tx.fundType === "SCHOLARSHIP"
                          ? "Khuyến học"
                          : tx.fundType === "CONSTRUCTION"
                          ? "Trùng tu từ đường"
                          : "Hoạt động chung"}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-medium text-stone-800">
                      {tx.contributorOrRecipient}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                        isIncome ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatVND(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Đã duyệt
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Ghi Nhận Thu / Chi */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-[#C59B27]/40 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-[#FAF7EE] to-white border-b border-[#EFE8D8] flex items-center justify-between">
              <h3 className="font-serif font-bold text-base text-[#8B1E1E] flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-[#C59B27]" />
                <span>Ghi Nhận Giao Dịch Thu / Chi Quỹ</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecord} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Loại Giao Dịch
                  </label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="INCOME">Thu Vào (+)</option>
                    <option value="EXPENSE">Chi Ra (-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Quỹ Mục Tiêu
                  </label>
                  <select
                    value={fundType}
                    onChange={(e) => setFundType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="SCHOLARSHIP">Quỹ Khuyến Học</option>
                    <option value="CONSTRUCTION">Trùng Tu Từ Đường</option>
                    <option value="GENERAL">Hoạt Động Chung</option>
                    <option value="CHARITY">Tương Trợ Gia Đình</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nội Dung Khoản Thu / Chi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Đóng góp quỹ khuyến học năm 2026..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Số Tiền (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Người Đóng Góp / Người Nhận <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={contributor}
                    onChange={(e) => setContributor(e.target.value)}
                    placeholder="Ví dụ: TS. Phan Quốc Bảo..."
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ghi Chú Chứng Từ
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Biên lai, số tài khoản hoặc ghi chú..."
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 rounded-lg hover:bg-stone-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#8B1E1E] hover:bg-[#721515] text-white text-xs font-semibold rounded-lg shadow-md"
                >
                  {submitting ? "Đang ghi nhận..." : "Ghi nhận giao dịch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
