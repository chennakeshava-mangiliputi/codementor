import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { fullName, email, password } = await request.json();

    // ==========================================
    // VALIDATION #1: Check all fields provided
    // ==========================================
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // ==========================================
    // VALIDATION #2: Email format
    // ==========================================
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please enter a valid email address format' },
        { status: 400 }
      );
    }

    // ==========================================
    // VALIDATION #3: Check if email already exists
    // ==========================================
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: 'This email is already registered. Please login or use a different email.' },
        { status: 400 }
      );
    }

    // ==========================================
    // Hash password
    // ==========================================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================================
    // Generate verification token
    // ==========================================
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // ==========================================
    // Create user (NOT verified yet)
    // ==========================================
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false, // ← User is NOT verified
      verificationToken: tokenHash,
      verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    console.log('New user created:', user._id);

    // ==========================================
    // Send verification email
    // ==========================================
    const emailResult = await sendVerificationEmail(
      user.email,
      user.fullName,
      verificationToken // Send unhashed token in link
    );

    if (!emailResult.success) {
      // Delete user if email fails
      await User.deleteOne({ _id: user._id });
      
      return NextResponse.json(
        { 
          message: 'Failed to send verification email. Please try again.' 
        },
        { status: 500 }
      );
    }

    // ==========================================
    // Success - user created, email sent
    // ==========================================
    return NextResponse.json(
      {
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          isVerified: user.isVerified,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}