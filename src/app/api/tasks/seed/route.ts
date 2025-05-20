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
  const tasks = [
    {
      id: 'twitter-follow',
      title: 'Follow Twitter @pepetubes',
      description: 'Follow akun Twitter resmi PepeTubes untuk update terbaru.',
      points: 50,
      type: 'follow',
      url: 'https://twitter.com/pepetubes',
    },
    {
      id: 'telegram-join',
      title: 'Join Telegram',
      description: 'Gabung ke grup Telegram komunitas PepeTubes.',
      points: 30,
      type: 'follow',
      url: 'https://t.me/pepetubes',
    },
    {
      id: 'share-twitter',
      title: 'Share Post Twitter',
      description: 'Bagikan postingan Twitter campaign PepeTubes.',
      points: 40,
      type: 'share',
      url: 'https://twitter.com/pepetubes/status/1234567890',
    },
    {
      id: 'custom-1',
      title: 'Custom Task',
      description: 'Tugas custom event airdrop.',
      points: 20,
      type: 'custom',
    },
    // Tambahkan task lain sesuai kebutuhan event airdrop lama
  ];
  let created = 0;
  for (const task of tasks) {
    const exists = await Task.findOne({ id: task.id });
    if (!exists) {
      await Task.create(task);
      created++;
    }
  }
  return NextResponse.json({ success: true, created });
}
