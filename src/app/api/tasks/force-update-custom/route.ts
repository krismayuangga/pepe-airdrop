import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/utils/db';
import Task from '@/models/Task';
import { verifyAdminJwt } from '@/utils/auth';

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const admin = verifyAdminJwt(token);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  await connectDB();
  // Hapus task custom lama
  await Task.deleteOne({ id: 'custom-1' });
  // Tambah ulang task custom Discord
  const newTask = await Task.create({
    id: 'custom-1',
    title: 'Custom Task',
    description: 'Join Discord PepeTubes untuk diskusi dan info terbaru.',
    points: 20,
    type: 'custom',
    url: 'https://discord.gg/M3CcMr6NrG',
  });
  return NextResponse.json({ success: true, task: newTask });
}
