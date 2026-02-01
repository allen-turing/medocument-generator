import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch user profile
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch from User model
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        qualifications: true,
        specialty: true,
        registrationId: true,
        logoUrl: true,
        defaultPatientAge: true,
        defaultPatientGender: true,
        defaultPatientHeight: true,
        defaultPatientWeight: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      qualifications,
      specialty,
      registrationId,
      logoUrl,
      defaultPatientAge,
      defaultPatientGender,
      defaultPatientHeight,
      defaultPatientWeight
    } = body;

    // Update User model
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        qualifications,
        specialty,
        registrationId,
        logoUrl,
        defaultPatientAge,
        defaultPatientGender,
        defaultPatientHeight,
        defaultPatientWeight,
      },
      select: {
        name: true,
        email: true,
        qualifications: true,
        specialty: true,
        registrationId: true,
        logoUrl: true,
        defaultPatientAge: true,
        defaultPatientGender: true,
        defaultPatientHeight: true,
        defaultPatientWeight: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
