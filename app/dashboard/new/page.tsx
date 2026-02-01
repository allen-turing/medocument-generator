import { PrescriptionForm } from '@/components/PrescriptionForm';
import Link from 'next/link';

export default function NewPrescriptionPage() {
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

      <PrescriptionForm mode="create" />
    </div>
  );
}
