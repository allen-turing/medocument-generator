import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch a single prescription
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const prescription = await prisma.prescription.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: { medicines: { orderBy: { serialNo: 'asc' } } },
    });

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    return NextResponse.json(prescription);
  } catch (error) {
    console.error('Error fetching prescription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prescription' },
      { status: 500 }
    );
  }
}

// PUT - Update a prescription
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if prescription exists and belongs to user
    const existingPrescription = await prisma.prescription.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingPrescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    const {
      status,
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
      doctorName,
      doctorQualifications,
      doctorRegId,
    } = body;

    // Delete existing medicines and recreate
    await prisma.medicine.deleteMany({
      where: { prescriptionId: id },
    });

    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        status,
        patientName,
        patientId,
        patientAge: patientAge ? parseInt(patientAge) : null,
        patientGender,
        patientHeight: patientHeight ? parseInt(patientHeight) : null,
        patientWeight: patientWeight ? parseInt(patientWeight) : null,
        prescriptionDate: prescriptionDate ? new Date(prescriptionDate) : undefined,
        diagnosisCode,
        diagnosis,
        description,
        additionalComments,
        drugAllergies,
        labTests,
        followUp,
        doctorAdvice,
        doctorName,
        doctorQualifications,
        doctorRegId,
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

    return NextResponse.json(prescription);
  } catch (error) {
    console.error('Error updating prescription:', error);
    return NextResponse.json(
      { error: 'Failed to update prescription' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a prescription
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if prescription exists and belongs to user
    const existingPrescription = await prisma.prescription.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingPrescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    await prisma.prescription.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Prescription deleted successfully' });
  } catch (error) {
    console.error('Error deleting prescription:', error);
    return NextResponse.json(
      { error: 'Failed to delete prescription' },
      { status: 500 }
    );
  }
}
