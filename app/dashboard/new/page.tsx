import { PrescriptionForm } from '@/components/PrescriptionForm';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export default async function NewPrescriptionPage() {
  const session = await auth();

  // Fetch user details for defaults
  let userDefaults = null;
  if (session?.user?.id) {
    // Use strict typing - schema has been updated
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        qualifications: true,
        registrationId: true,
        logoUrl: true,
        defaultPatientAge: true,
        defaultPatientGender: true,
        defaultPatientHeight: true,
        defaultPatientWeight: true,
      }
    });
    if (user) {
      userDefaults = {
        name: user.name,
        qualifications: user.qualifications,
        registrationId: user.registrationId,
        logoUrl: user.logoUrl,
        defaultPatientAge: user.defaultPatientAge,
        defaultPatientGender: user.defaultPatientGender,
        defaultPatientHeight: user.defaultPatientHeight,
        defaultPatientWeight: user.defaultPatientWeight,
      };
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <nav style={{ marginBottom: 'var(--space-2)' }}>
            <Link href="/dashboard" className="text-gray-500" style={{ textDecoration: 'none' }}>
              ← Back to Dashboard
            </Link>
          </nav>
          <h1 className="dashboard-title">New Prescription</h1>
          <p className="text-gray-500">Fill in the patient details and prescription information</p>
        </div>
      </div>

      <PrescriptionForm
        mode="create"
        userName={session?.user?.name || ''}
        userDefaults={userDefaults}
      />
    </div>
  );
}
