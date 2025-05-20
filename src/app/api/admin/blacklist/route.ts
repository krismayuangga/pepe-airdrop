import { NextRequest, NextResponse } from "next/server";
import { verifyAdminJwt } from "@/utils/auth";

// Gunakan export default agar VS Code tidak error pada module route handler
const blacklist: string[] = [];

function getAdminFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  return verifyAdminJwt(token);
}

export async function GET(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  return NextResponse.json(blacklist);
}

export async function POST(req: NextRequest) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const { wallet } = await req.json();
  if (wallet && typeof wallet === "string" && !blacklist.includes(wallet)) {
    blacklist.push(wallet);
  }
  return NextResponse.json(blacklist);
}
