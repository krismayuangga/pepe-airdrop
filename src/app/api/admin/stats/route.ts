import { NextResponse } from "next/server";
export async function GET() {
  // Dummy stats, ganti dengan data sebenarnya
  return NextResponse.json({ totalUsers: 100, totalTasks: 500, totalRewards: 100000 });
}
