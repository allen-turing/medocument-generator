import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { renderToBuffer } from '@react-pdf/renderer';
import { PrescriptionPDF } from '@/components/PrescriptionPDF';
import React from 'react';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const prescription = await prisma.prescription.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        medicines: {
          orderBy: { serialNo: 'asc' },
        },
      },
    });

    if (!prescription) {
      return new NextResponse('Prescription not found', { status: 404 });
    }

    // Get user profile for logo
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { logoUrl: true }
    });

    // Ensure logoUrl is absolute and fetch as Buffer for reliability
    let logoBuffer: Buffer | null = null;
    const userLogoUrl = user?.logoUrl;
    const defaultLogoUrl = '/assets/default-logo.png';
    const logoToFetch = userLogoUrl || defaultLogoUrl;

    try {
      let absoluteLogoUrl = logoToFetch;
      if (!logoToFetch.startsWith('http')) {
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        absoluteLogoUrl = `${protocol}://${host}${logoToFetch}`;
      }

      const logoResponse = await fetch(absoluteLogoUrl);

      if (logoResponse.ok) {
        const arrayBuffer = await logoResponse.arrayBuffer();
        logoBuffer = Buffer.from(arrayBuffer);
      }
    } catch (error) {
      console.error('PDF API: Failed to fetch logo:', error);
    }

    // Generate PDF
    // Use any cast for the element to satisfy @react-pdf/renderer's restrictive DocumentProps typing
    const buffer = await renderToBuffer(
      React.createElement(PrescriptionPDF, {
        prescription: prescription as any,
        logoUrl: logoBuffer as any, // Pass Buffer directly
      }) as any
    );

    const filename = `Prescription_${prescription.patientName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    // Convert Buffer to Uint8Array for NextResponse compatibility
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
