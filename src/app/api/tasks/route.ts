import { NextRequest, NextResponse } from "next/server";

// Master list task (admin editable)
let masterTasks = [
  { id: "twitter-follow", title: 'Follow us on Twitter', description: 'Follow Pepe Tubes official Twitter account for updates', points: 10 },
  { id: "telegram-join", title: 'Join our Telegram Group', description: 'Join our community on Telegram to chat with other members', points: 15 },
  { id: "twitter-post", title: 'Share on Twitter', description: 'Share Pepe Tubes Airdrop on your Twitter', points: 20 },
];

// In-memory store status task per user
const userTasks: Record<string, { [taskId: string]: boolean }> = {};

// GET: Untuk user (dengan walletAddress) dan admin (tanpa walletAddress)
export async function GET(request: Request) {
  const url = new URL(request.url);
  const walletAddress = url.searchParams.get('walletAddress');
  if (walletAddress) {
    // Untuk user: return status task user
    const status = userTasks[walletAddress.toLowerCase()] || {};
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
  try {
    const { walletAddress, taskId } = await request.json();
    if (!walletAddress || !taskId) {
      return NextResponse.json({ success: false, message: 'walletAddress & taskId required' }, { status: 400 });
    }
    // Pastikan taskId valid
    const task = masterTasks.find(t => t.id === taskId);
    if (!task) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }
    // Cek jika sudah completed
    const key = walletAddress.toLowerCase();
    if (!userTasks[key]) userTasks[key] = {};
    if (userTasks[key][taskId]) {
      return NextResponse.json({ success: false, message: 'Task already completed' }, { status: 400 });
    }
    userTasks[key][taskId] = true;
    return NextResponse.json({ success: true, taskId });
  } catch (error) {
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