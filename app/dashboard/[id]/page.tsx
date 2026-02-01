import { notFound } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PrescriptionForm } from '@/components/PrescriptionForm';
import { PrescriptionFormData } from '@/lib/types';
import Link from 'next/link';

interface PrescriptionPageProps {
  params: Promise<{ id: string }>;
}

export default async function PrescriptionPage({ params }: PrescriptionPageProps) {
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

  // Convert to form data format
  const formData: PrescriptionFormData = {
    patientName: prescription.patientName,
    patientId: prescription.patientId || '',
    patientAge: prescription.patientAge?.toString() || '',
    patientGender: prescription.patientGender || '',
    patientHeight: prescription.patientHeight?.toString() || '',
    patientWeight: prescription.patientWeight?.toString() || '',
    prescriptionDate: prescription.prescriptionDate.toISOString().split('T')[0],
    diagnosisCode: prescription.diagnosisCode || '',
    diagnosis: prescription.diagnosis || '',
    description: prescription.description || '',
    additionalComments: prescription.additionalComments || '',
    medicines: prescription.medicines.map((med) => ({
      id: med.id,
      serialNo: med.serialNo,
      name: med.name,
      dosage: med.dosage || '',
      instructions: med.instructions || '',
    })),
    drugAllergies: prescription.drugAllergies || '',
    labTests: prescription.labTests || '',
    followUp: prescription.followUp || '',
    doctorAdvice: prescription.doctorAdvice || '',
  };

  if (formData.medicines.length === 0) {
    formData.medicines = [{ serialNo: 1, name: '', dosage: '', instructions: '' }];
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
          <h1 className="dashboard-title">
            Edit Prescription
            <span
              className={`badge ${prescription.status === 'DRAFT' ? 'badge-draft' : 'badge-published'}`}
              style={{ marginLeft: 'var(--space-4)', verticalAlign: 'middle' }}
            >
              {prescription.status}
            </span>
          </h1>
          <p className="text-gray-500">Rx ID: {prescription.rxId}</p>
        </div>
        <Link href={`/dashboard/${id}/preview`} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Preview & Download
        </Link>
      </div>

      <PrescriptionForm
        mode="edit"
        initialData={formData}
        prescriptionId={id}
      />
    </div>
  );
}
