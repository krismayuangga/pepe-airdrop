import { NextResponse } from 'next/server';

// Menyimpan checkin berdasarkan wallet address
const userCheckins: Record<string, string> = {};

export async function GET(request: Request) {
  // Mendapatkan walletAddress dari URL query params
  const url = new URL(request.url);
  const walletAddress = url.searchParams.get('walletAddress');
  
  if (!walletAddress) {
    return NextResponse.json({ 
      lastCheckIn: null,
      message: 'Wallet address is required' 
    });
  }
  
  return NextResponse.json({ 
    lastCheckIn: userCheckins[walletAddress] || null 
  });
}

export async function POST(request: Request) {
  try {
    // Mengambil walletAddress dari body request
    const { walletAddress } = await request.json();
    
    if (!walletAddress) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet address is required' 
      }, { status: 400 });
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Cek apakah user sudah check-in hari ini
    if (userCheckins[walletAddress] === today) {
      return NextResponse.json({ 
        success: false, 
        message: 'Already checked in today' 
      });
    }
    
    // Update checkin untuk wallet address tertentu
    userCheckins[walletAddress] = today;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Check-in successful', 
      date: today 
    });
  } catch (error) {
    console.error("Error in POST /api/checkin:", error);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal Server Error',
      error: String(error)
    }, { status: 500 });
  }
}