import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: '600px' }}>
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '16px',
            fontFamily: 'serif',
            fontWeight: 'bold',
            color: 'var(--color-primary)'
          }}>
            Rx
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-3xl)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--space-4)',
            color: 'var(--color-gray-900)'
          }}>
            Prescription Generator
          </h1>
          <p style={{
            fontSize: 'var(--font-size-lg)',
            color: 'var(--color-gray-500)',
            marginBottom: 'var(--space-8)',
            lineHeight: '1.6'
          }}>
            Create professional medical prescriptions with ease.
            Manage your patients, generate PDFs, and access your prescription history anytime.
          </p>

          <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <Link href="/login" className="btn btn-primary btn-lg">
              Sign In
            </Link>
            <Link href="/register" className="btn btn-secondary btn-lg">
              Create Account
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--space-6)',
            marginTop: 'var(--space-8)',
            paddingTop: 'var(--space-6)',
            borderTop: '1px solid var(--color-gray-200)'
          }}>
            <div>
              <div style={{ fontSize: '32px', marginBottom: 'var(--space-2)' }}>📋</div>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-1)' }}>
                Easy Forms
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                All fields are editable
              </p>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: 'var(--space-2)' }}>📄</div>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-1)' }}>
                PDF Export
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                Download or print
              </p>
            </div>
            <div>
              <div style={{ fontSize: '32px', marginBottom: 'var(--space-2)' }}>💾</div>
              <h3 style={{ fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-1)' }}>
                Save Drafts
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-500)' }}>
                Complete later
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
