import { NextResponse } from 'next/server';

// In-memory: walletAddress -> { claimed: boolean, claimedAt: string }
const rewardsClaimed: Record<string, { claimed: boolean, claimedAt: string }> = {};

export async function GET(request: Request) {
  // Mendapatkan address dari URL query params
  const url = new URL(request.url);
  const address = url.searchParams.get('address');
  
  if (!address) {
    return NextResponse.json({ 
      rewardsClaimed: false, 
      message: 'Wallet address is required' 
    });
  }
  
  const data = rewardsClaimed[address.toLowerCase()];
  
  return NextResponse.json({ 
    rewardsClaimed: !!(data && data.claimed), 
    claimedAt: data?.claimedAt || null 
  });
}

export async function POST(request: Request) {
  try {
    // Mengambil address dari body request
    const { address } = await request.json();
    
    if (!address) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet address is required' 
      }, { status: 400 });
    }
    
    const key = address.toLowerCase();
    
    // Cek apakah reward sudah diklaim sebelumnya
    if (rewardsClaimed[key]?.claimed) {
      return NextResponse.json({ 
        success: false, 
        message: 'Rewards already claimed for this address', 
        claimedAt: rewardsClaimed[key].claimedAt 
      });
    }
    
    const claimedAt = new Date().toISOString();
    
    // Update status klaim untuk alamat wallet
    rewardsClaimed[key] = { claimed: true, claimedAt };
    
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