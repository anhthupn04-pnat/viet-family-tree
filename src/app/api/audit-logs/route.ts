import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "CDN-Cache-Control": "no-store",
  "Vercel-CDN-Cache-Control": "no-store",
};

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json({ logs }, { headers: NO_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Audit logs GET error:", error);
    return NextResponse.json({ error: "Lỗi khi tải nhật ký hoạt động." }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
