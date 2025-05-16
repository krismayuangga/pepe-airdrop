import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/utils/db';
import UserTask from '@/models/UserTask';
import { verifyTask } from '@/services/verificationService';

// Master list task (admin editable)
export let masterTasks = [
  { id: "twitter-follow", title: 'Follow us on Twitter', description: 'Follow Pepe Tubes official Twitter account for updates', points: 10 },
  { id: "telegram-join", title: 'Join our Telegram Group', description: 'Join our community on Telegram to chat with other members', points: 15 },
  { id: "twitter-post", title: 'Share on Twitter', description: 'Share Pepe Tubes Airdrop on your Twitter', points: 20 },
];

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
    const tasks = masterTasks.map(task => ({
      ...task,
      completed: !!status[task.id]
    }));
    return NextResponse.json(tasks);
  }
  // Untuk admin: return masterTasks (tanpa completed)
  return NextResponse.json(masterTasks);
}

// POST: User menyelesaikan task
export async function POST(request: Request) {
  await connectDB();
  try {
    const { walletAddress, taskId, proof } = await request.json();
    if (!walletAddress || !taskId) {
      return NextResponse.json({ success: false, message: 'walletAddress & taskId required' }, { status: 400 });
    }
    // Pastikan taskId valid
    const task = masterTasks.find(t => t.id === taskId);
    if (!task) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
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
    // Cek jika sudah completed
    const exists = await UserTask.findOne({ walletAddress: walletAddress.toLowerCase(), taskId });
    if (exists && exists.completed) {
      return NextResponse.json({ success: false, message: 'Task already completed' }, { status: 400 });
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

// PUT: Admin update points/title/desc tiap task
export async function PUT(req: NextRequest) {
  const updatedTasks = await req.json();
  // Update hanya points, title, description, id tetap
  masterTasks = masterTasks.map((task, idx) => ({
    ...task,
    points: updatedTasks[idx]?.points ?? task.points,
    title: updatedTasks[idx]?.title ?? task.title,
    description: updatedTasks[idx]?.description ?? task.description,
  }));
  return NextResponse.json(masterTasks);
}