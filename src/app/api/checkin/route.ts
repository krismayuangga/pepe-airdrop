import { NextResponse } from 'next/server';

// In-memory store: walletAddress -> { lastCheckIn: string, streak: number }
const userCheckins: Record<string, { lastCheckIn: string, streak: number }> = {};

// GET hanya membaca status, tidak mengubah apapun
export async function GET(request: Request) {
  const url = new URL(request.url);
  const walletAddress = url.searchParams.get('walletAddress');
  if (!walletAddress) {
    return NextResponse.json({ lastCheckIn: null, streak: 0, message: 'Wallet address is required' });
  }
  const data = userCheckins[walletAddress.toLowerCase()] || { lastCheckIn: null, streak: 0 };
  return NextResponse.json(data);
}

// POST hanya update jika user klik tombol check-in dan belum check-in hari ini
export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();
    if (!walletAddress) {
      return NextResponse.json({ success: false, message: 'Wallet address is required' }, { status: 400 });
    }
    const today = new Date().toISOString().split('T')[0];
    const key = walletAddress.toLowerCase();
    const prev = userCheckins[key];
    let streak = 1;
    if (prev && prev.lastCheckIn) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (prev.lastCheckIn === today) {
        // Sudah check-in hari ini, tolak
        return NextResponse.json({ success: false, message: 'Already checked in today', lastCheckIn: today, streak: prev.streak });
      }
      if (prev.lastCheckIn === yesterday) {
        streak = prev.streak + 1;
      }
    }
    // Update check-in
    userCheckins[key] = { lastCheckIn: today, streak };
    return NextResponse.json({ success: true, message: 'Check-in successful', date: today, streak });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}