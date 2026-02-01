'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  name: string;
  email: string;
  qualifications?: string;
  specialty?: string;
  registrationId?: string;
  logoUrl?: string;
  defaultPatientAge?: number | string;
  defaultPatientGender?: string;
  defaultPatientHeight?: number | string;
  defaultPatientWeight?: number | string;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    qualifications: '',
    specialty: '',
    registrationId: '',
    logoUrl: '',
    defaultPatientAge: '',
    defaultPatientGender: '',
    defaultPatientHeight: '',
    defaultPatientWeight: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          qualifications: data.qualifications || '',
          specialty: data.specialty || '',
          registrationId: data.registrationId || '',
          logoUrl: data.logoUrl || '',
          defaultPatientAge: data.defaultPatientAge || '',
          defaultPatientGender: data.defaultPatientGender || '',
          defaultPatientHeight: data.defaultPatientHeight || '',
          defaultPatientWeight: data.defaultPatientWeight || '',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          qualifications: formData.qualifications,
          specialty: formData.specialty,
          registrationId: formData.registrationId,
          logoUrl: formData.logoUrl,
          defaultPatientAge: formData.defaultPatientAge ? Number(formData.defaultPatientAge) : null,
          defaultPatientGender: formData.defaultPatientGender,
          defaultPatientHeight: formData.defaultPatientHeight ? Number(formData.defaultPatientHeight) : null,
          defaultPatientWeight: formData.defaultPatientWeight ? Number(formData.defaultPatientWeight) : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save profile');

      setSuccess('Profile saved successfully!');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      setFormData(prev => ({ ...prev, logoUrl: data.url }));
      setSuccess('Logo uploaded! Save to persist changes.');
    } catch (err) {
      setError('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-overlay" style={{ position: 'relative', minHeight: '400px' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Account Settings</h1>
          <p className="text-gray-500">Manage your account information.</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Account Information */}
        <div className="form-section">
          <h2 className="form-section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Personal Information
          </h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                type="text"
                id="name"
                className="form-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your Name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                disabled
                style={{ backgroundColor: 'var(--color-gray-100)', cursor: 'not-allowed' }}
              />
            </div>
          </div>
        </div>

        {/* Patient Defaults */}
        <div className="form-section">
          <h2 className="form-section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
            Patient Defaults
          </h2>
          <p className="text-xs text-gray-500 mb-4">These values will be auto-filled when creating new prescriptions.</p>

          <div className="form-row patient-defaults-grid">
            <div className="form-group">
              <label className="form-label">Age (Years)</label>
              <input
                type="number"
                className="form-input"
                value={formData.defaultPatientAge}
                onChange={(e) => setFormData({ ...formData, defaultPatientAge: e.target.value })}
                placeholder="e.g., 27"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select
                className="form-input"
                value={formData.defaultPatientGender}
                onChange={(e) => setFormData({ ...formData, defaultPatientGender: e.target.value })}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Height (cms)</label>
              <input
                type="number"
                className="form-input"
                value={formData.defaultPatientHeight}
                onChange={(e) => setFormData({ ...formData, defaultPatientHeight: e.target.value })}
                placeholder="e.g., 178"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kgs)</label>
              <input
                type="number"
                className="form-input"
                value={formData.defaultPatientWeight}
                onChange={(e) => setFormData({ ...formData, defaultPatientWeight: e.target.value })}
                placeholder="e.g., 71"
              />
            </div>
          </div>
        </div>

        {/* Logo Upload */}
        <div className="form-section">
          <h2 className="form-section-title">
            Clinic Logo
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '100px', height: '100px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden' }}>
              <img
                src={formData.logoUrl || '/assets/default-logo.png'}
                alt="Logo"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload New Logo'}
              </button>
              <p className="text-xs text-gray-500 mt-2">Will be used as default on prescriptions</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="form-section" style={{ background: 'var(--color-gray-50)' }}>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
