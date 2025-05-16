import { NextResponse } from "next/server";
import { connectDB } from "@/utils/db";
import { AdminLog } from "@/models/AdminLog";

interface AdminLogLean {
  type: string;
  message: string;
  walletAddress?: string;
  admin?: string;
  createdAt: Date;
}

export async function GET() {
  await connectDB();
  // Ambil 100 log terbaru, urutkan dari terbaru ke terlama
  const logs = await AdminLog.find().sort({ createdAt: -1 }).limit(100).lean<AdminLogLean[]>();
  // Format agar frontend tetap dapat array of { message, timestamp }
  const formatted = logs.map((log) => ({
    message: `[${log.createdAt?.toISOString()?.slice(0, 19).replace('T', ' ')}] ${log.type?.toUpperCase()}: ${log.message}`,
    timestamp: log.createdAt,
    type: log.type,
    walletAddress: log.walletAddress,
    admin: log.admin
  }));
  return NextResponse.json(formatted);
}
