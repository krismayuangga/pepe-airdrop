import { NextResponse } from "next/server";
let pendingClaims: any[] = [{ id: 1, wallet: "0x123...", amount: 1000 }];
export async function GET() { return NextResponse.json(pendingClaims); }
export async function POST(req: Request) {
  const { id, action } = await req.json();
  pendingClaims = pendingClaims.filter(c => c.id !== id);
  // Simpan log/aksi approve/reject di log jika perlu
  return NextResponse.json({ success: true });
}
