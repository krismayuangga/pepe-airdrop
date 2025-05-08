import { NextRequest, NextResponse } from "next/server";
import {
  getUserVesting,
  setUserVesting,
  updateUserVesting,
  UserVesting,
} from "../config/userVestingStore";
import { vestingConfig } from "../config/vestingConfig";

// Helper untuk hitung reward yang bisa di-claim
function getClaimableAmount(user: UserVesting, now: Date): number {
  if (!user.vestingStart || !user.cliftEnd || !user.vestingEnd) return 0;
  if (now < user.cliftEnd) return 0;
  if (now >= user.vestingEnd) return user.airdropAmount - user.claimedAmount;
  // Linear vesting
  const totalVesting = user.vestingEnd.getTime() - user.cliftEnd.getTime();
  const elapsed = now.getTime() - user.cliftEnd.getTime();
  const vested = (elapsed / totalVesting) * user.airdropAmount;
  return Math.max(0, Math.floor(vested - user.claimedAmount));
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  if (!address) return NextResponse.json({ error: "No address" }, { status: 400 });
  const user = getUserVesting(address);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const now = new Date();
  const claimable = getClaimableAmount(user, now);
  return NextResponse.json({ ...user, claimable });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { address, airdropAmount, staking, stakingAmount, usdtReward } = body;
  if (!address || !airdropAmount) {
    return NextResponse.json({ error: "Missing address or airdropAmount" }, { status: 400 });
  }
  const now = new Date();
  const cliftEnd = new Date(now.getTime() + vestingConfig.cliftPeriodDays * 24 * 60 * 60 * 1000);
  const vestingEnd = new Date(cliftEnd.getTime() + vestingConfig.vestingDurationDays * 24 * 60 * 60 * 1000);
  const user: UserVesting = {
    userAddress: address,
    tasksCompleted: true,
    checkinDays: 30,
    airdropEligible: true,
    airdropAmount,
    vestingStart: now,
    cliftEnd,
    vestingEnd,
    claimedAmount: 0,
    staking: !!staking,
    stakingAmount: stakingAmount || 0,
    usdtReward: usdtReward || 0,
  };
  setUserVesting(address, user);
  return NextResponse.json({ success: true, user });
}

export async function PUT(req: NextRequest) {
  // Untuk klaim reward
  const body = await req.json();
  const { address } = body;
  if (!address) return NextResponse.json({ error: "No address" }, { status: 400 });
  const user = getUserVesting(address);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const now = new Date();
  const claimable = getClaimableAmount(user, now);
  if (claimable <= 0) return NextResponse.json({ error: "Nothing to claim" }, { status: 400 });
  updateUserVesting(address, { claimedAmount: user.claimedAmount + claimable });
  return NextResponse.json({ success: true, claimed: claimable });
}
