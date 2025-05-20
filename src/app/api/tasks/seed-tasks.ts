// Script untuk seed ulang task lama ke database
import { connectDB } from '@/utils/db';
import Task from '@/models/Task';

async function seedTasks() {
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
      url: 'https://x.com/PepeTubes/status/1922277079175069720',
    },
    {
      id: 'custom-1',
      title: 'Custom Task',
      description: 'Join Discord PepeTubes untuk diskusi dan info terbaru.',
      points: 20,
      type: 'custom',
      url: 'https://discord.gg/M3CcMr6NrG',
    },
    // Tambahkan task lain sesuai kebutuhan event airdrop lama
  ];
  for (const task of tasks) {
    const exists = await Task.findOne({ id: task.id });
    if (!exists) {
      await Task.create(task);
      console.log('Task seeded:', task.id);
    }
  }
  console.log('Seeding selesai.');
  process.exit(0);
}

seedTasks();
