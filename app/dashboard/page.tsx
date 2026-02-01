import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { PrescriptionCard } from '@/components/PrescriptionCard';

interface Prescription {
  id: string;
  rxId: string;
  status: string;
  patientName: string;
  patientAge: number | null;
  patientGender: string | null;
  diagnosis: string | null;
  updatedAt: Date;
  medicines: { id: string }[];
}

export default async function DashboardPage() {
  const session = await auth();

  const prescriptions = await prisma.prescription.findMany({
    where: { userId: session?.user?.id },
    include: { medicines: true },
    orderBy: { updatedAt: 'desc' },
  }) as Prescription[];

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Prescriptions</h1>
          <p className="text-gray-500">Manage all your prescriptions in one place</p>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <div className="empty-state card">
          <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="empty-state-title">No prescriptions yet</h2>
          <p className="empty-state-description">
            Create your first prescription to get started
          </p>
          <Link href="/dashboard/new" className="btn btn-primary btn-lg">
            Create Prescription
          </Link>
        </div>
      ) : (
        <div className="prescriptions-grid">
          {prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              id={prescription.id}
              rxId={prescription.rxId}
              status={prescription.status}
              patientName={prescription.patientName}
              patientAge={prescription.patientAge}
              patientGender={prescription.patientGender}
              diagnosis={prescription.diagnosis}
              updatedAt={prescription.updatedAt.toISOString()}
              medicinesCount={prescription.medicines.length}
            />
          ))}
        </div>
      )}
    </div>
  );
}
