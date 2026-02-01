import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all prescriptions for the logged-in user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { userId: session.user.id },
      include: { medicines: true },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescriptions' },
      { status: 500 }
    );
  }
}

// POST - Create a new prescription
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      status = 'DRAFT',
      patientName,
      patientId,
      patientAge,
      patientGender,
      patientHeight,
      patientWeight,
      prescriptionDate,
      diagnosisCode,
      diagnosis,
      description,
      additionalComments,
      drugAllergies,
      labTests,
      followUp,
      doctorAdvice,
      medicines = [],
    } = body;

    // Generate unique Rx ID
    const rxId = `RX-${Date.now()}`;

    const prescription = await prisma.prescription.create({
      data: {
        userId: session.user.id,
        rxId,
        status,
        patientName: patientName || '',
        patientId,
        patientAge: patientAge ? parseInt(patientAge) : null,
        patientGender,
        patientHeight: patientHeight ? parseInt(patientHeight) : null,
        patientWeight: patientWeight ? parseInt(patientWeight) : null,
        prescriptionDate: prescriptionDate ? new Date(prescriptionDate) : new Date(),
        diagnosisCode,
        diagnosis,
        description,
        additionalComments,
        drugAllergies,
        labTests,
        followUp,
        doctorAdvice,
        medicines: {
          create: medicines.map((med: { name: string; dosage?: string; instructions?: string }, index: number) => ({
            serialNo: index + 1,
            name: med.name,
            dosage: med.dosage || '',
            instructions: med.instructions || '',
          })),
        },
      },
      include: { medicines: true },
    });

    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    console.error('Error creating prescription:', error);
    return NextResponse.json(
      { error: 'Failed to create prescription' },
      { status: 500 }
    );
  }
}
