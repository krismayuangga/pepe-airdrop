import { connectDB } from "@/utils/db";
import Broadcast from "@/models/Broadcast";
import { verifyAdminJwt } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";

function getAdminFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  return verifyAdminJwt(token);
}

// Simple in-memory rate limit (per IP, per minute)
const rateLimitMap = new Map<string, { count: number; last: number }>();
const RATE_LIMIT = 10; // max 10 req/minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, last: now };
  if (now - entry.last > 60_000) {
    rateLimitMap.set(ip, { count: 1, last: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  entry.last = now;
  rateLimitMap.set(ip, entry);
  return false;
}

export async function GET(req: NextRequest) {
  await connectDB();
  // Hanya admin yang boleh lihat semua broadcast
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const broadcasts = await Broadcast.find({})
    .sort({ createdAt: -1 })
    .limit(100);
  return NextResponse.json({ broadcasts });
}

export async function POST(req: NextRequest) {
  await connectDB();
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, message: "Rate limit exceeded" },
      { status: 429 }
    );
  }
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
  const { message } = await req.json();
  if (
    !message ||
    typeof message !== "string" ||
    message.trim().length < 3 ||
    message.length > 500
  ) {
    return NextResponse.json(
      { success: false, message: "Pesan broadcast tidak valid (3-500 karakter)" },
      { status: 400 }
    );
  }
  await Broadcast.create({ message: `[${new Date().toLocaleString()}] ${message}` });
  return NextResponse.json({ success: true });
}
