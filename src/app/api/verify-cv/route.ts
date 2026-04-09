import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    // Store password in server-side environment variable (more secure)
    const CORRECT_PASSWORD = process.env.CV_PASSWORD || 'cv123';
    
    if (password === CORRECT_PASSWORD) {
      return NextResponse.json({ 
        success: true, 
        resumeUrl: process.env.CV_URL || 'https://resume11.edgeone.app/NEOH_WEI_JIAN_Resume_.pdf'
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Incorrect password' 
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
}
