import { NextRequest, NextResponse } from 'next/server';
import { verifyTask, getCompletedTasks, getTotalPoints, getVerificationCode } from '@/services/verificationService';
import logger from '@/utils/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, walletAddress, proofData } = body;
    
    if (!taskId || !walletAddress) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const result = await verifyTask({ taskId, walletAddress, proofData });
    
    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error in verification API:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during verification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');
    const taskId = searchParams.get('taskId');
    
    if (!walletAddress) {
      return NextResponse.json(
        { success: false, message: 'Wallet address is required' },
        { status: 400 }
      );
    }
    
    // Jika taskId ada, kembalikan kode verifikasi untuk tugas tersebut
    if (taskId) {
      // Dalam implementasi sebenarnya, ini akan menghasilkan kode unik untuk pengguna
      // dan menyimpannya di database
      const verificationCode = getVerificationCode(taskId);
      
      if (!verificationCode) {
        return NextResponse.json(
          { success: false, message: 'Task ID not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        verificationCode,
        message: 'Use this code to verify task completion'
      });
    }
    
    // Jika tidak ada taskId, kembalikan semua tugas yang sudah diselesaikan
    const completedTasks = getCompletedTasks(walletAddress);
    const totalPoints = getTotalPoints(walletAddress);
    
    return NextResponse.json({
      success: true,
      completedTasks,
      totalPoints
    });
  } catch (error) {
    logger.error('Error in verification API:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
