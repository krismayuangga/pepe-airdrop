import { NextResponse } from 'next/server';

// Menyimpan status klaim reward per alamat wallet
const rewardsClaimed: Record<string, boolean> = {};

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
  
  return NextResponse.json({ 
    rewardsClaimed: rewardsClaimed[address] || false 
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
    
    // Cek apakah reward sudah diklaim sebelumnya
    if (rewardsClaimed[address]) {
      return NextResponse.json({ 
        success: false, 
        message: 'Rewards already claimed for this address' 
      });
    }
    
    // Update status klaim untuk alamat wallet
    rewardsClaimed[address] = true;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Rewards claimed successfully' 
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