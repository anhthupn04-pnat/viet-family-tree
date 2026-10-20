import { NextResponse } from "next/server";
import { verifyUserCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ email và mật khẩu." },
        { status: 400 }
      );
    }

    const user = await verifyUserCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Tài khoản hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công!",
      user,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi đăng nhập." },
      { status: 500 }
    );
  }
}
