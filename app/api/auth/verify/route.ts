import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // ==========================================
    // Get verification token from URL
    // ==========================================
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { message: 'Invalid or missing verification token' },
        { status: 400 }
      );
    }

    // ==========================================
    // Hash the token to match stored hash
    // ==========================================
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // ==========================================
    // Find user with matching token
    // ==========================================
    const user = await User.findOne({
      verificationToken: tokenHash,
      verificationTokenExpiry: { $gt: new Date() }, // Token not expired
    }).select('+verificationToken +verificationTokenExpiry');

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired verification token. Please register again.' },
        { status: 400 }
      );
    }

    // ==========================================
    // Mark user as verified
    // ==========================================
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    console.log('User verified:', user.email);

    // ==========================================
    // Redirect to login page with success message
    // ==========================================
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('verified', 'true');
    loginUrl.searchParams.set('message', 'Email verified successfully! You can now login.');

    return NextResponse.redirect(loginUrl);
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { message: 'Verification failed' },
      { status: 500 }
    );
  }
}