import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import UserCheckin from '@/models/UserCheckin';

// GET hanya membaca status, tidak mengubah apapun
export async function GET(request: Request) {
  await connectDB();
  const url = new URL(request.url);
  const walletAddress = url.searchParams.get('walletAddress');
  if (!walletAddress) {
    return NextResponse.json({ lastCheckIn: null, streak: 0, message: 'Wallet address is required' });
  }
  const user = await UserCheckin.findOne({ walletAddress: walletAddress.toLowerCase() });
  if (!user) {
    return NextResponse.json({ lastCheckIn: null, streak: 0 });
  }
  return NextResponse.json({ lastCheckIn: user.lastCheckIn, streak: user.streak });
}

// POST hanya update jika user klik tombol check-in dan belum check-in hari ini
export async function POST(request: Request) {
  await connectDB();
  try {
    const { walletAddress } = await request.json();
    if (!walletAddress) {
      return NextResponse.json({ success: false, message: 'Wallet address is required' }, { status: 400 });
    }
    const today = new Date().toISOString().split('T')[0];
    const key = walletAddress.toLowerCase();
    let user = await UserCheckin.findOne({ walletAddress: key });
    let streak = 1;
    if (user) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (user.lastCheckIn === today) {
        return NextResponse.json({ success: false, message: 'Already checked in today', lastCheckIn: today, streak: user.streak });
      }
      if (user.lastCheckIn === yesterday) {
        streak = user.streak + 1;
      }
      user.lastCheckIn = today;
      user.streak = streak;
      await user.save();
    } else {
      user = await UserCheckin.create({ walletAddress: key, lastCheckIn: today, streak });
    }
    return NextResponse.json({ success: true, message: 'Check-in successful', date: today, streak });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}