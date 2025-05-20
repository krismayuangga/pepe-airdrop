import { NextResponse } from "next/server";
import { verifyAdminJwt } from '@/utils/auth';

interface PendingClaim {
  id: number;
  wallet: string;
  amount: number;
}
const pendingClaims: PendingClaim[] = [{ id: 1, wallet: "0x123...", amount: 1000 }];

function getAdminFromRequest(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  return verifyAdminJwt(token);
}

export async function GET(req: Request) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(pendingClaims);
}

export async function POST(req: Request) {
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await req.json();
  const idx = pendingClaims.findIndex(c => c.id === id);
  if (idx !== -1) pendingClaims.splice(idx, 1);
  // Simpan log/aksi approve/reject di log jika perlu
  return NextResponse.json({ success: true });
}
