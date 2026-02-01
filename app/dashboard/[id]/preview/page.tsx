import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PrescriptionPreview } from '@/components/PrescriptionPreview';
import Link from 'next/link';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;
  const session = await auth();

  const prescription = await prisma.prescription.findFirst({
    where: {
      id,
      userId: session?.user?.id,
    },
    include: {
      medicines: {
        orderBy: { serialNo: 'asc' },
      },
    },
  });

  if (!prescription) {
    notFound();
  }

  // Get user profile for fallback logo if needed
  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    select: { logoUrl: true }
  });

  // Construct doctor profile object from prescription snapshot or user default
  const doctorProfile = {
    name: prescription.doctorName || '',
    qualifications: prescription.doctorQualifications || '',
    registrationId: prescription.doctorRegId || '',
    logoUrl: user?.logoUrl || null, // Priority: User's selected logo > Default handled in component
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header no-print">
        <div>
          <nav style={{ marginBottom: 'var(--space-2)' }}>
            <Link href={`/dashboard/${id}`} className="text-gray-500" style={{ textDecoration: 'none' }}>
              ← Back to Edit
            </Link>
          </nav>
          <h1 className="dashboard-title">Preview Prescription</h1>
          <p className="text-gray-500">Rx ID: {prescription.rxId}</p>
        </div>
      </div>

      <PrescriptionPreview
        prescription={prescription}
        doctorProfile={doctorProfile}
      />
    </div>
  );
}
