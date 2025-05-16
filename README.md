This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Features

### User Dashboard
- Task system: Selesaikan berbagai tugas untuk mendapatkan poin.
- Daily check-in: Check-in harian untuk bonus poin tambahan.
- Claim rewards: Klaim hadiah token PEPE setelah memenuhi syarat.
- Referral system: Dapatkan poin tambahan dengan mengajak teman.
- Leaderboard: Lihat peringkat pengguna berdasarkan poin.
- Notification tab: Tab khusus untuk melihat seluruh riwayat pesan broadcast dari admin.
- Broadcast highlight: Pesan broadcast terbaru selalu tampil di bagian atas dashboard.
- Bottom navigation: Navigasi bawah (BottomNavbar) untuk akses cepat ke semua tab utama, termasuk Notification.

### Admin Dashboard
- Sidebar modern: Navigasi sidebar dengan grouping tab: Airdrop, User Management, Reward Management, System.
- User Management: Kelola whitelist, blacklist, dan data referral user.
- Reward Management: Manual reward, export data, dan pengelolaan task rewards (digabung ke tab Config).
- System tab: Fitur broadcast (kirim & riwayat pesan ke user) dan logs aktivitas sistem.
- Config tab: Pengaturan utama airdrop dan task rewards dalam satu tempat.
- Grouping tab: Semua tab admin dikelompokkan agar mudah dioperasikan, tidak terlalu banyak tab.

### General
- No error/warning: Kode utama sudah bebas error/warning.
- Modern UI: Tampilan modern, responsif, dan mudah digunakan baik untuk user maupun admin.
- Realtime notification: User selalu mendapatkan update pesan broadcast terbaru dari admin.
- SPA experience: Navigasi antar tab cepat tanpa reload halaman.

## How to Use

1. Jalankan development server:

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
# atau
bun dev
```

2. Buka [http://localhost:3000](http://localhost:3000) di browser.

- Untuk akses admin dashboard, buka `/admin` (misal: http://localhost:3000/admin)
- Untuk user, gunakan navigasi bawah untuk akses dashboard, tasks, check-in, claim, referral, leaderboard, dan notification.

## Fitur Terbaru (2025)
- Tab Notification di user dashboard (riwayat pesan broadcast admin)
- Navigasi bawah user kini ada tab Notification
- Grouping tab admin: User Management, Reward Management, System
- Task Rewards digabung ke Config
- UI sidebar admin modern, tab lebih sedikit dan terkelompok
- Tidak ada error/warning pada kode utama

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

Ikuti dokumentasi Next.js untuk deployment. Project ini siap untuk di-deploy di Vercel atau platform lain.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
