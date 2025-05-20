// src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { signAdminJwt } from '@/utils/auth';

// Simple in-memory rate limit (per IP, per minute)
const rateLimitMap = new Map<string, { count: number; last: number }>();
const RATE_LIMIT = 5; // max 5 req/minute per IP

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

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (checkRateLimit(ip)) {
    return NextResponse.json({ success: false, message: 'Rate limit exceeded' }, { status: 429 });
  }
  const { username, password } = await req.json();
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = signAdminJwt({ role: 'admin', username });
    return NextResponse.json({ success: true, token });
  } else {
    return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 });
  }
}
