import { NextResponse } from 'next/server';
import UserTask from '@/models/UserTask';
import { connectDB } from '@/utils/db';

// Fungsi untuk menghitung total poin user berdasarkan task yang sudah completed
async function getLeaderboard() {
  // Ambil semua task yang sudah completed
  const tasks = await UserTask.find({ completed: true });
  // Hitung total poin per user
  const userPoints: Record<string, number> = {};
  for (const t of tasks) {
    // Anggap setiap task bernilai 100 poin (atau bisa diambil dari config jika ada)
    userPoints[t.walletAddress] = (userPoints[t.walletAddress] || 0) + 100;
  }
  // Ubah ke array dan urutkan
  const leaderboard = Object.entries(userPoints)
    .map(([address, points]) => ({ address, points }))
    .sort((a, b) => b.points - a.points)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
  return leaderboard;
}

export async function GET() {
  await connectDB();
  const leaderboard = await getLeaderboard();
  return NextResponse.json({ leaderboard });
}
