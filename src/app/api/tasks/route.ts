import { NextResponse } from 'next/server';

// Gunakan 'const' karena variabel tidak pernah di-reassign
const tasks = [
  { 
    id: 1, 
    title: 'Follow us on Twitter', 
    description: 'Follow Pepe Tubes official Twitter account for updates', 
    completed: false, 
    points: 10 
  },
  { 
    id: 2, 
    title: 'Join our Telegram Group', 
    description: 'Join our community on Telegram to chat with other members', 
    completed: false, 
    points: 15 
  },
  { 
    id: 3, 
    title: 'Share on Social Media', 
    description: 'Share Pepe Tubes Airdrop on your social media accounts', 
    completed: false, 
    points: 20 
  },
];

export async function GET() {
  try {
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error in GET /api/tasks:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { walletAddress, taskId } = body;
    
    // Log untuk debugging
    console.log('Request body:', body);
    console.log('taskId:', taskId, 'type:', typeof taskId);
    
    // Konversi taskId ke number jika dikirim sebagai string
    const numericTaskId = typeof taskId === 'string' ? parseInt(taskId, 10) : taskId;
    
    // Buat copy dari tasks untuk menghindari mutasi langsung
    const updatedTasks = tasks.map((task) =>
      task.id === numericTaskId ? { ...task, completed: true } : task
    );
    const updatedTask = updatedTasks.find((task) => task.id === numericTaskId);

    if (!updatedTask) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }
    
    // Simpan walletAddress dengan task yang telah diselesaikan (dalam implementasi nyata)
    console.log(`User ${walletAddress} completed task ${numericTaskId}`);
    
    // Update referensi tasks secara tidak langsung (immutable)
    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("Error in POST /api/tasks:", error);
    return NextResponse.json({ success: false, message: 'Internal Server Error', error: String(error) }, { status: 500 });
  }
}