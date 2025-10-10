import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🗑️ Server-side cookie clearing requested');
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'Cookies cleared successfully' 
    });
    
    // 쿠키 삭제 - 각각의 쿠키에 대해 만료 시간을 과거로 설정
    response.cookies.set('myapp_access_token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'lax'
    });
    
    response.cookies.set('myapp_refresh_token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'lax'
    });
    
    response.cookies.set('myapp_user_info', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'lax'
    });
    
    return response;
  } catch (error) {
    console.error('Cookie clearing error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear cookies' },
      { status: 500 }
    );
  }
}

// GET 요청도 처리 (웹뷰에서 직접 접근할 수 있도록)
export async function GET(request: NextRequest) {
  return POST(request);
}
