import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/utils/db';
import UserTask from '@/models/UserTask';
import Task from '@/models/Task';
import { verifyTask } from '@/services/verificationService';
import { verifyAdminJwt } from '@/utils/auth';

// GET: Untuk user (dengan walletAddress) dan admin (tanpa walletAddress)
export async function GET(request: Request) {
  await connectDB();
  const url = new URL(request.url);
  const walletAddress = url.searchParams.get('walletAddress');
  if (walletAddress) {
    // Untuk user: return status task user
    const userTaskDocs = await UserTask.find({ walletAddress: walletAddress.toLowerCase() });
    const status: Record<string, boolean> = {};
    userTaskDocs.forEach(doc => { status[doc.taskId] = doc.completed; });
    const tasks = await Task.find({});
    const result = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      points: task.points,
      completed: !!status[task.id],
      updatedAt: task.updatedAt,
      createdAt: task.createdAt
    }));
    return NextResponse.json(result);
  }
  // Untuk admin: return semua task, urutkan terbaru di atas
  const tasks = await Task.find({}).sort({ updatedAt: -1 });
  return NextResponse.json(tasks);
}

// POST: User menyelesaikan task
export async function POST(request: Request) {
  await connectDB();
  try {
    const { walletAddress, taskId, proof } = await request.json();
    if (!walletAddress || typeof walletAddress !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json({ success: false, message: 'Wallet address tidak valid' }, { status: 400 });
    }
    if (!taskId || typeof taskId !== 'string') {
      return NextResponse.json({ success: false, message: 'Task ID tidak valid' }, { status: 400 });
    }
    // Pastikan taskId valid di database
    const task = await Task.findOne({ id: taskId });
    if (!task) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }
    // Cek jika sudah completed
    const exists = await UserTask.findOne({ walletAddress: walletAddress.toLowerCase(), taskId });
    if (exists && exists.completed) {
      return NextResponse.json({ success: false, message: 'Task already completed' }, { status: 400 });
    }
    // Verifikasi proof (username/url/hash) via verificationService
    const verificationResult = await verifyTask({
      taskId,
      walletAddress,
      proofData: proof || {},
    });
    if (!verificationResult.success) {
      return NextResponse.json({ success: false, message: verificationResult.message }, { status: 400 });
    }
    if (exists) {
      exists.completed = true;
      exists.completedAt = new Date();
      await exists.save();
    } else {
      await UserTask.create({ walletAddress: walletAddress.toLowerCase(), taskId, completed: true, completedAt: new Date() });
    }
    return NextResponse.json({ success: true, taskId });
  } catch (error) {
    console.error('API /api/tasks error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}

function getAdminFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  return verifyAdminJwt(token);
}

// PUT: Admin update satu task (by id)
export async function PUT(req: NextRequest) {
  await connectDB();
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const { id, title, description, points } = await req.json();
  if (!id) {
    return NextResponse.json({ success: false, message: 'Task id required' }, { status: 400 });
  }
  const task = await Task.findOne({ id });
  if (!task) {
    return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
  }
  if (title) task.title = title;
  if (description) task.description = description;
  if (typeof points === 'number' && points >= 0) task.points = points;
  await task.save();
  return NextResponse.json({ success: true, task });
}

// DELETE: Admin hapus task by id
export async function DELETE(req: NextRequest) {
  await connectDB();
  const admin = getAdminFromRequest(req);
  if (!admin) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ success: false, message: 'Task id required' }, { status: 400 });
  }
  const task = await Task.findOneAndDelete({ id });
  if (!task) {
    return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}

// Endpoint admin create task ada di /api/tasks/admin/route.ts