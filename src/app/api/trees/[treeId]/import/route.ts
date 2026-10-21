import { NextResponse } from "next/server";
import { requireTreePermission } from "@/lib/rbac";
import { executeTreeImportTransaction } from "@/lib/services/treeImportService";

export const dynamic = "force-dynamic";

/**
 * POST /api/trees/:treeId/import
 * NHẬP DỮ LIỆU NHANH THÀNH VIÊN VÀO CÂY GIA PHẢ (BULK IMPORT)
 * - BẢO MẬT: Chỉ SUPER_ADMIN hoặc TREE_MANAGER được phân quyền trên :treeId.
 * - XỬ LÝ QUAN HỆ 2 CHIỀU: Tự động đối xứng hôn phối spouseId.
 * - XỬ LÝ UPSERT: Ghi đè (overwrite) hoặc Bỏ qua (skip) nếu trùng ID.
 * - GIAO DỊCH DATABASE (ACID): Đảm bảo rollback 100% nếu có lỗi phát sinh.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ treeId: string }> }
) {
  try {
    const { treeId } = await params;

    // 1. Kiểm tra quyền hạn RBAC
    const authCheck = await requireTreePermission(request, treeId, "TREE_MANAGER");
    if (authCheck instanceof NextResponse) {
      return authCheck;
    }

    // 2. Phân tích dữ liệu gửi lên
    const body = await request.json();
    const { members, upsertMode = "overwrite" } = body;

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json(
        { error: "Dữ liệu nhập vào phải là một mảng JSON không rỗng." },
        { status: 400 }
      );
    }

    if (upsertMode !== "overwrite" && upsertMode !== "skip") {
      return NextResponse.json(
        { error: "Tùy chọn upsertMode không hợp lệ. Chỉ chấp nhận 'overwrite' hoặc 'skip'." },
        { status: 400 }
      );
    }

    // 3. Thực thi transaction nhập liệu ACID
    const result = await executeTreeImportTransaction(treeId, members, {
      upsertMode,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("POST /api/trees/:treeId/import error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Đã xảy ra lỗi trong quá trình nhập dữ liệu vào gia phả.",
      },
      { status: 400 }
    );
  }
}
