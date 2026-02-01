'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isApproved: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requireApproval, setRequireApproval] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.status === 401 || usersRes.status === 403) {
        router.push('/dashboard');
        return;
      }
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      } else {
        setError('Failed to load users');
      }

      // Fetch settings - API returns an object like { require_approval: "true" }
      const settingsRes = await fetch('/api/admin/settings');
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setRequireApproval(settings.require_approval === 'true');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleApprovalRequirement = async () => {
    const newValue = !requireApproval;
    setRequireApproval(newValue); // Optimistic update

    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'require_approval', value: String(newValue) }),
      });
    } catch (err) {
      setRequireApproval(!newValue); // Revert
      alert('Failed to update settings');
    }
  };

  const updateUserStatus = async (userId: string, isApproved: boolean) => {
    try {
      // Optimistic update
      setUsers(users.map(u => u.id === userId ? { ...u, isApproved } : u));

      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isApproved }),
      });
    } catch (err) {
      console.error("Failed to update user", err);
      fetchData(); // Revert on error
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-8)' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <nav style={{ marginBottom: 'var(--space-2)' }}>
            <a href="/dashboard" className="text-gray-500" style={{ textDecoration: 'none' }}>
              ← Back to Dashboard
            </a>
          </nav>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="text-gray-500">Manage users and system settings</p>
        </div>
      </div>

      {error && <div className="alert alert-error mb-6">{error}</div>}

      <div className="glass-card p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">System Settings</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Require User Approval</h3>
            <p className="text-gray-500 text-sm">If enabled, new users must be approved by an admin before logging in.</p>
          </div>
          <label className="switch">
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={toggleApprovalRequirement}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="text-xl font-bold mb-4">User Management</h2>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.name}</td>
                  <td className="text-gray-500">{user.email}</td>
                  <td>
                    <span className={`badge ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-gray'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.isApproved ? 'badge-success' : 'badge-warning'}`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    {user.role !== 'ADMIN' && (
                      <button
                        onClick={() => updateUserStatus(user.id, !user.isApproved)}
                        className={`btn ${user.isApproved ? 'btn-danger' : 'btn-success'} btn-sm`}
                      >
                        {user.isApproved ? 'Revoke' : 'Approve'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
