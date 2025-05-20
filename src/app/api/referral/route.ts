import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/utils/db';
import Referral from '@/models/Referral';

function isValidWallet(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const { referrer, referred } = await req.json();
  if (!referrer || !referred) {
    return NextResponse.json({ success: false, message: "Referrer dan referred harus diisi" }, { status: 400 });
  }
  if (!isValidWallet(referrer) || !isValidWallet(referred)) {
    return NextResponse.json({ success: false, message: "Format wallet address tidak valid" }, { status: 400 });
  }
  if (referrer.toLowerCase() === referred.toLowerCase()) {
    return NextResponse.json({ success: false, message: "Tidak bisa refer diri sendiri" }, { status: 400 });
  }
  try {
    // Cek apakah referred sudah pernah submit referral (tidak boleh lebih dari 1x)
    const alreadyReferred = await Referral.findOne({ referred });
    if (alreadyReferred) {
      return NextResponse.json({ success: false, message: "Kamu sudah pernah submit referral atau sudah direferensikan sebelumnya" }, { status: 400 });
    }
    // Cek apakah referral sudah ada (tidak boleh double)
    const exists = await Referral.findOne({ referrer, referred });
    if (exists) {
      return NextResponse.json({ success: false, message: "Referral ini sudah pernah didaftarkan" }, { status: 400 });
    }
    await Referral.create({ referrer, referred });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal menyimpan referral', error: String(error) }, { status: 500 });
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
  // Untuk admin: return semua data referral lengkap
  const all = await Referral.find();
  return NextResponse.json({
    referrals: all.map(r => ({
      referrer: r.referrer,
      referred: r.referred,
      createdAt: r.createdAt,
      // rewarded: r.rewarded, // jika nanti ada field rewarded
    }))
  });
}
