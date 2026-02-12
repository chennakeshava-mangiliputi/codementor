import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/db';
import User from '@/models/User';


export async function GET() {
  try {
    console.log('=== /api/auth/me called ===');
    
    // Get JWT from cookies - MUST AWAIT cookies()
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token preview:', token.substring(0, 20) + '...');
    }

    if (!token) {
      console.log('❌ No token found in cookies');
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    console.log('✅ Token verified, userId:', decoded.userId);

    // Connect to DB
    await dbConnect();

    // Get user from DB
    const user = await User.findById(decoded.userId).select(
      'fullName email isVerified'
    );

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    console.log('✅ User found:', user.fullName);

    return NextResponse.json(
      {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Get user error:', error.message);
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
}