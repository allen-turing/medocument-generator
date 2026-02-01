import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Check system settings for approval requirement
    const settings = await prisma.systemSettings.findUnique({
      where: { key: 'require_approval' },
    });
    const requireApproval = settings?.value === 'true';

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        isApproved: !requireApproval, // If approval is required, isApproved = false
        role: 'USER',
      },
    });

    // Create default doctor profile - REMOVED per user request
    // Users will input doctor details manually or use randomization for each prescription.
    /* 
    await prisma.doctorProfile.create({
      data: {
        userId: user.id,
        name: name,
        qualifications: 'MBBS',
        specialty: 'General Medicine',
        registrationId: `REG-${Date.now()}`,
      },
    }); 
    */

    return NextResponse.json(
      {
        message: user.isApproved ? 'User created successfully' : 'Registration successful! Please wait for admin approval.',
        userId: user.id,
        isApproved: user.isApproved
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
