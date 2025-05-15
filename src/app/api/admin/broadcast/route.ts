import { NextRequest, NextResponse } from "next/server";
let broadcasts: string[] = [];

export async function GET() {
  // Return semua pesan broadcast (atau slice(-1) jika hanya ingin terbaru)
  return NextResponse.json({ broadcasts });
}

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  if (message && typeof message === "string" && message.trim() !== "") {
    broadcasts.push(`[${new Date().toLocaleString()}] ${message}`);
  }
  return NextResponse.json({ success: true });
}
