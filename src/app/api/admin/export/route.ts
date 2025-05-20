import { NextResponse } from "next/server";
import { verifyAdminJwt } from "@/utils/auth";

function getAdminFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  return verifyAdminJwt(token);
}

export async function GET(req: Request) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  // Dummy CSV, ganti dengan data peserta sebenarnya
  const csv = "wallet,points\n0x123...,100\n0x456...,200";
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv" } });
}
