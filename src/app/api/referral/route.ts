import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/utils/db';
import Referral from '@/models/Referral';

export async function POST(req: NextRequest) {
  await connectDB();
  const { referrer, referred } = await req.json();
  if (!referrer || !referred || referrer === referred) {
    return NextResponse.json({ success: false, message: "Invalid referral" }, { status: 400 });
  }
  try {
    // Cek apakah referral sudah ada
    const exists = await Referral.findOne({ referrer, referred });
    if (!exists) {
      await Referral.create({ referrer, referred });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to save referral', error: String(error) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await connectDB();
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet");
  if (wallet) {
    // Untuk user: return daftar referral milik wallet
    const referred = await Referral.find({ referrer: wallet });
    return NextResponse.json({ referrals: referred.map(r => r.referred) });
  }
  // Untuk admin: return semua data referral
  const all = await Referral.find();
  return NextResponse.json({ referrals: all.map(r => ({ referrer: r.referrer, referred: r.referred })) });
}
