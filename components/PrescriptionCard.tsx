'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PrescriptionCardProps {
  id: string;
  rxId: string;
  status: string;
  patientName: string;
  patientAge: number | null;
  patientGender: string | null;
  diagnosis: string | null;
  updatedAt: string;
  medicinesCount: number;
}

export function PrescriptionCard({
  id,
  rxId,
  status,
  patientName,
  patientAge,
  patientGender,
  diagnosis,
  updatedAt,
  medicinesCount,
}: PrescriptionCardProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);

    try {
      const response = await fetch(`/api/prescriptions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  return (
    <div className="prescription-card" style={{ position: 'relative' }}>
      <Link href={`/dashboard/${id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div className="prescription-card-header" style={{ paddingRight: 'var(--space-8)' }}>
          <div>
            <h3 className="prescription-card-title">
              {patientName || 'Unnamed Patient'}
            </h3>
            <p className="prescription-card-id">{rxId}</p>
          </div>
          <span className={`badge ${status === 'DRAFT' ? 'badge-draft' : 'badge-published'}`}>
            {status}
          </span>
        </div>

        <div className="prescription-card-body">
          <div className="prescription-card-meta">
            {patientAge && (
              <span>Age: {patientAge}</span>
            )}
            {patientGender && (
              <span>{patientGender}</span>
            )}
          </div>
          {diagnosis && (
            <p style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}>
              {diagnosis}
            </p>
          )}
          <p className="mt-2">
            <strong>{medicinesCount}</strong> medicine(s)
          </p>
        </div>

        <div className="prescription-card-footer">
          <span className="prescription-card-date">
            {formatDate(updatedAt)}
          </span>
          <span className="btn btn-ghost btn-sm">
            View →
          </span>
        </div>
      </Link>

      {/* Delete Button */}
      <button
        onClick={handleDeleteClick}
        className="btn btn-ghost btn-sm"
        style={{
          position: 'absolute',
          top: 'var(--space-3)',
          right: 'var(--space-3)',
          padding: 'var(--space-2)',
          color: 'var(--color-gray-400)',
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-gray-400)'}
        title="Delete prescription"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-4)',
            zIndex: 10,
          }}
        >
          <p style={{ color: 'white', fontSize: 'var(--font-size-sm)', textAlign: 'center' }}>
            Delete this prescription?<br />
            <span style={{ opacity: 0.7 }}>{rxId}</span>
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn btn-danger btn-sm"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={handleCancelDelete}
              disabled={deleting}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
