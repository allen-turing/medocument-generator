import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">My Prescriptions</h1>
          <p className="text-gray-500">Manage all your prescriptions in one place</p>
        </div>
        <Link href="/dashboard/new" className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          New Prescription
        </Link>
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
            <Link
              key={prescription.id}
              href={`/dashboard/${prescription.id}`}
              className="prescription-card"
            >
              <div className="prescription-card-header">
                <div>
                  <h3 className="prescription-card-title">
                    {prescription.patientName || 'Unnamed Patient'}
                  </h3>
                  <p className="prescription-card-id">{prescription.rxId}</p>
                </div>
                <span className={`badge ${prescription.status === 'DRAFT' ? 'badge-draft' : 'badge-published'}`}>
                  {prescription.status}
                </span>
              </div>

              <div className="prescription-card-body">
                <div className="prescription-card-meta">
                  {prescription.patientAge && (
                    <span>Age: {prescription.patientAge}</span>
                  )}
                  {prescription.patientGender && (
                    <span>{prescription.patientGender}</span>
                  )}
                </div>
                {prescription.diagnosis && (
                  <p style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%'
                  }}>
                    {prescription.diagnosis}
                  </p>
                )}
                <p className="mt-2">
                  <strong>{prescription.medicines.length}</strong> medicine(s)
                </p>
              </div>

              <div className="prescription-card-footer">
                <span className="prescription-card-date">
                  {formatDate(prescription.updatedAt)}
                </span>
                <span className="btn btn-ghost btn-sm">
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
