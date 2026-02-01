'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeletePrescriptionButtonProps {
  prescriptionId: string;
  rxId: string;
}

export function DeletePrescriptionButton({ prescriptionId, rxId }: DeletePrescriptionButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/prescriptions/${prescriptionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete prescription');
      }
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription');
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-danger)' }}>
          Delete {rxId}?
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn btn-danger btn-sm"
        >
          {deleting ? 'Deleting...' : 'Confirm'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={deleting}
          className="btn btn-secondary btn-sm"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="btn btn-danger"
      title="Delete Prescription"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
      Delete
    </button>
  );
}
