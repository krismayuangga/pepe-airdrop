import { NextResponse } from "next/server";
export async function GET() {
  // Dummy CSV, ganti dengan data peserta sebenarnya
  const csv = "wallet,points\n0x123...,100\n0x456...,200";
  return new NextResponse(csv, { headers: { "Content-Type": "text/csv" } });
}
