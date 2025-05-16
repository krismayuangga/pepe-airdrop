// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  // Ganti dengan password admin yang aman, sebaiknya dari .env
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ success: false, message: "Invalid password" }, { status: 401 });
  }
}
