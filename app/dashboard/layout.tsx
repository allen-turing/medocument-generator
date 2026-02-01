import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { SignOutButton } from '@/components/SignOutButton';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="page-wrapper">
      <nav className="navbar">
        <div className="container">
          <div className="navbar-content">
            <Link href="/dashboard" className="navbar-brand">
              <span style={{ fontFamily: 'serif', fontSize: '28px', color: 'var(--color-primary)' }}>Rx</span>
              <span>Prescription Generator</span>
            </Link>
            <ul className="navbar-nav">
              <li>
                <Link href="/dashboard" className="nav-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/new" className="nav-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  New Prescription
                </Link>
              </li>
              <li>
                <Link href="/dashboard/profile" className="nav-link">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profile
                </Link>
              </li>
              <li>
                <span className="nav-link" style={{ color: 'var(--color-gray-500)' }}>
                  {session.user.name || session.user.email}
                </span>
              </li>
              <li>
                <SignOutButton />
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="dashboard-main">
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
}
