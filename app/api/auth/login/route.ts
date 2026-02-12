import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createToken } from '@/lib/jwt';


export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { email, password } = await request.json();

    // ==========================================
    // VALIDATION: Check email and password provided
    // ==========================================
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // ==========================================
    // Find user (include password field)
    // ==========================================
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ==========================================
    // CHECK IF EMAIL IS VERIFIED
    // ==========================================
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          message: 'Please verify your email before logging in. Check your email for the verification link.' 
        },
        { status: 403 }
      );
    }

    // ==========================================
    // Compare passwords
    // ==========================================
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // ==========================================
    // Create JWT token
    // ==========================================
    console.log('Creating token for user:', user.email);
    const token = await createToken(user._id.toString(), user.email);
    console.log('Token created successfully');

    // ==========================================
    // Create response
    // ==========================================
    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
      { status: 200 }
    );

    // ==========================================
    // Set token cookie
    // ==========================================
    console.log('Setting token cookie...');
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    });
    console.log('Token cookie set successfully');

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}