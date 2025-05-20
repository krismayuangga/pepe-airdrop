import { NextResponse } from "next/server";
import { connectDB } from '@/utils/db';
import UserTask from '@/models/UserTask';
import UserCheckin from '@/models/UserCheckin';
import UserClaim from '@/models/UserClaim';
import Referral from '@/models/Referral';
import Task from '@/models/Task';

const config = {
  airdropStart: "",
  airdropEnd: "",
  rewardPerReferral: 20,
  rewardPerCheckin: 10,
  tokenPerUsd: 1000,
};

export async function GET() {
  await connectDB();
  // Total peserta unik (dari UserTask, UserCheckin, UserClaim, Referral)
  const userTaskWallets = await UserTask.distinct('walletAddress');
  const userCheckinWallets = await UserCheckin.distinct('walletAddress');
  const userClaimWallets = await UserClaim.distinct('walletAddress');
  const referralWallets = await Referral.distinct('referrer');
  // Gabungkan semua wallet unik
  const allWallets = Array.from(new Set([
    ...userTaskWallets,
    ...userCheckinWallets,
    ...userClaimWallets,
    ...referralWallets
  ]));
  // Statistik tugas
  const totalTasks = await UserTask.countDocuments({ completed: true });
  // Statistik reward (dummy, bisa diupdate sesuai logika reward)
  const totalRewards = (await UserClaim.countDocuments({ claimed: true })) * (config.rewardPerCheckin || 10);
  // Statistik referral
  const totalReferrals = await Referral.countDocuments();
  // Statistik checkin
  const totalCheckins = await UserCheckin.countDocuments();
  // Statistik klaim
  const totalClaims = await UserClaim.countDocuments({ claimed: true });
  // Waktu mulai airdrop
  const airdropStart = config.airdropStart;
  const airdropEnd = config.airdropEnd;
  // Daftar peserta terbaru (dari UserTask)
  const latestParticipants = await UserTask.find().sort({ completedAt: -1 }).limit(10).lean();
  // Daftar tugas
  const tasks = await Task.find({});
  return NextResponse.json({
    totalUsers: allWallets.length,
    totalTasks,
    totalRewards,
    totalReferrals,
    totalCheckins,
    totalClaims,
    airdropStart,
    airdropEnd,
    latestParticipants,
    tasks
  });
}
