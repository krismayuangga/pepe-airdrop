import { NextResponse } from 'next/server';
import { connectDB } from '@/utils/db';
import UserClaim from '@/models/UserClaim';

export async function GET(request: Request) {
  await connectDB();
  const url = new URL(request.url);
  const address = url.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ 
      rewardsClaimed: false, 
      message: 'Wallet address is required' 
    });
  }
  const userClaim = await UserClaim.findOne({ walletAddress: address.toLowerCase() });
  return NextResponse.json({ 
    rewardsClaimed: !!(userClaim && userClaim.claimed), 
    claimedAt: userClaim?.claimedAt || null 
  });
}

export async function POST(request: Request) {
  await connectDB();
  try {
    const { address } = await request.json();
    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet address is required' 
      }, { status: 400 });
    }
    const key = address.toLowerCase();
    const userClaim = await UserClaim.findOne({ walletAddress: key });
    if (userClaim && userClaim.claimed) {
      return NextResponse.json({ 
        success: false, 
        message: 'Rewards already claimed for this address', 
        claimedAt: userClaim.claimedAt 
      });
    }
    const claimedAt = new Date();
    if (userClaim) {
      userClaim.claimed = true;
      userClaim.claimedAt = claimedAt;
      await userClaim.save();
    } else {
      await UserClaim.create({ walletAddress: key, claimed: true, claimedAt });
    }
    return NextResponse.json({ 
      success: true, 
      message: 'Rewards claimed successfully', 
      claimedAt 
    });
  } catch (error) {
    console.error("Error in POST /api/claim:", error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error',
      error: String(error)
    }, { status: 500 });
  }
}