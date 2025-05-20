import { NextRequest, NextResponse } from "next/server";
import Task from '@/models/Task';
import { connectDB } from '@/utils/db';
import { verifyAdminJwt } from '@/utils/auth';

function getAdminFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  return verifyAdminJwt(token);
}

export async function POST(request: NextRequest) {
  await connectDB();
  const admin = getAdminFromRequest(request);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const { id, title, description, points, type, url } = await request.json();
  if (!id || !title || !description || typeof points !== 'number' || points < 0) {
    return NextResponse.json({ success: false, message: 'All fields required, points >= 0' }, { status: 400 });
  }
  const exists = await Task.findOne({ id });
  if (exists) {
    return NextResponse.json({ success: false, message: 'Task id already exists' }, { status: 400 });
  }
  // type dan url opsional agar task lama tetap bisa masuk
  const newTask = await Task.create({ id, title, description, points, type: type || 'custom', url });
  return NextResponse.json({ success: true, task: newTask });
}
