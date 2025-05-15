import { NextRequest, NextResponse } from "next/server";

let referrals: Record<string, string[]> = {}; // { referrer: [referred1, referred2, ...] }

export async function POST(req: NextRequest) {
  const { referrer, referred } = await req.json();
  if (!referrer || !referred || referrer === referred) {
    return NextResponse.json({ success: false, message: "Invalid referral" }, { status: 400 });
  }
  if (!referrals[referrer]) referrals[referrer] = [];
  if (!referrals[referrer].includes(referred)) {
    referrals[referrer].push(referred);
  }
  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet");
  if (wallet) {
    // Untuk user: return daftar referral milik wallet
    return NextResponse.json({ referrals: referrals[wallet] || [] });
  }
  // Untuk admin: return semua data referral
  const all = Object.entries(referrals).map(([referrer, referred]) => ({
    referrer,
    referred,
  }));
  return NextResponse.json({ referrals: all });
}
