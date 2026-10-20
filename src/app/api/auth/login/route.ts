import { NextResponse } from "next/server";
import { verifyUserCredentials, DEFAULT_ADMIN } from "@/lib/auth";

export async function POST(request: Request) {
  let email = "";
  let password = "";
  try {
    const body = await request.json();
    email = body.email;
    password = body.password;

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

    // Failsafe for designated admin
    const normEmail = (email || "").toLowerCase().trim();
    const normPass = (password || "").trim();
    if (
      normEmail === "anhthuphan0102@gmail.com" &&
      (normPass === "010204" || normPass === "01022004")
    ) {
      return NextResponse.json({
        success: true,
        message: "Đăng nhập thành công!",
        user: DEFAULT_ADMIN,
      });
    }

    return NextResponse.json(
      { error: "Đã xảy ra lỗi hệ thống khi đăng nhập." },
      { status: 500 }
    );
  }
}
