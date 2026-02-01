'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Medicine, defaultPrescriptionFormData, PrescriptionFormData } from '@/lib/types';
import { Plus, X, Upload, User, FileText, Activity, AlertCircle, Save, Check } from 'lucide-react';

interface PrescriptionFormProps {
  initialData?: PrescriptionFormData;
  prescriptionId?: string;
  mode: 'create' | 'edit';
  userName?: string;
  userDefaults?: any; // Kept for compatibility, but logic mainly uses fetched doctors
}

interface DoctorProfile {
  id: string;
  name: string;
  qualifications: string;
  specialty: string;
  registrationId: string;
  logoUrl: string | null;
}

export function PrescriptionForm({ initialData, prescriptionId, mode, userName, userDefaults }: PrescriptionFormProps) {
  const router = useRouter();

  // Initialize with defaults if creating new
  const initial = initialData || {
    ...defaultPrescriptionFormData,
    patientName: userName || '',
    doctorName: '',
    doctorQualifications: '',
    doctorRegId: '',
    patientAge: userDefaults?.defaultPatientAge || defaultPrescriptionFormData.patientAge,
    patientGender: userDefaults?.defaultPatientGender || defaultPrescriptionFormData.patientGender,
    patientHeight: userDefaults?.defaultPatientHeight || defaultPrescriptionFormData.patientHeight,
    patientWeight: userDefaults?.defaultPatientWeight || defaultPrescriptionFormData.patientWeight,
  };

  const [formData, setFormData] = useState<PrescriptionFormData>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const updateField = (field: keyof PrescriptionFormData, value: string | Medicine[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Autofill details
  const fillDefaults = () => {
    // Random doctor names
    const randomDoctors = [
      'Dr. Rajnish Manchanda', 'Dr. Anjali Gupta', 'Dr. Suresh Kumar', 'Dr. Priya Sharma',
      'Dr. Amit Patel', 'Dr. Neha Verma', 'Dr. Rajesh Singh', 'Dr. Sunita Rao',
      'Dr. Vikram Malhotra', 'Dr. Meera Iyer', 'Dr. Arjun Nair', 'Dr. Kavita Reddy',
      'Dr. Sanjay Kapoor', 'Dr. Pooja Joshi', 'Dr. Rahul Khanna', 'Dr. Deepak Chopra',
      'Dr. Swati Deshpande', 'Dr. Manish Agarwal', 'Dr. Ritu Dalal', 'Dr. Vivek Oberoi',
    ];
    const randomName = randomDoctors[Math.floor(Math.random() * randomDoctors.length)];

    // Doctor Details - random name with dynamically generated qualifications and reg ID
    const updates: Partial<PrescriptionFormData> = {
      doctorName: randomName,
      doctorQualifications: 'MBBS - General Medicine',
      doctorRegId: `REG-${Date.now()}`,
    };

    // Patient Details (if defaults exist)
    if (userDefaults?.defaultPatientAge) updates.patientAge = userDefaults.defaultPatientAge;
    if (userDefaults?.defaultPatientGender) updates.patientGender = userDefaults.defaultPatientGender;
    if (userDefaults?.defaultPatientHeight) updates.patientHeight = userDefaults.defaultPatientHeight;
    if (userDefaults?.defaultPatientWeight) updates.patientWeight = userDefaults.defaultPatientWeight;

    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  // ... rest of medicine logic ...

  const addMedicine = () => {
    const newMedicine: Medicine = {
      serialNo: formData.medicines.length + 1,
      name: '',
      dosage: '',
      instructions: '',
    };
    updateField('medicines', [...formData.medicines, newMedicine]);
  };

  const removeMedicine = (index: number) => {
    if (formData.medicines.length > 1) {
      const updated = formData.medicines
        .filter((_, i) => i !== index)
        .map((med, i) => ({ ...med, serialNo: i + 1 }));
      updateField('medicines', updated);
    }
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = formData.medicines.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    updateField('medicines', updated);
  };

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!formData.patientName.trim()) {
      setError('Patient name is required');
      return;
    }

    setSaving(true);
    setError('');
    setSavedMessage('');

    try {
      const url = mode === 'edit'
        ? `/api/prescriptions/${prescriptionId}`
        : '/api/prescriptions';

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      const prescription = await response.json();

      setSavedMessage(status === 'DRAFT' ? 'Saved as draft!' : 'Published successfully!');

      if (mode === 'create') {
        router.push(`/dashboard/${prescription.id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = async () => {
    // Save as draft first, then navigate to preview
    await handleSave('DRAFT');
    if (prescriptionId) {
      router.push(`/dashboard/${prescriptionId}/preview`);
    }
  };

  return (
    <div className="prescription-form">
      {error && (
        <div className="alert alert-error mb-6">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {savedMessage && (
        <div className="alert alert-success mb-6">
          <Check size={20} />
          {savedMessage}
        </div>
      )}

      {/* Patient Information */}
      <div className="form-section">
        <h2 className="form-section-title">
          <User size={20} />
          Patient Information
        </h2>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientName" className="form-label">Patient Name *</label>
            <input
              type="text"
              id="patientName"
              className="form-input"
              value={formData.patientName}
              onChange={(e) => updateField('patientName', e.target.value)}
              placeholder="Enter patient name"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="patientId" className="form-label">Patient ID</label>
            <input
              type="text"
              id="patientId"
              className="form-input"
              value={formData.patientId}
              onChange={(e) => updateField('patientId', e.target.value)}
              placeholder="e.g., 31226237"
            />
          </div>
          <div className="form-group">
            <label htmlFor="prescriptionDate" className="form-label">Date</label>
            <input
              type="date"
              id="prescriptionDate"
              className="form-input"
              value={formData.prescriptionDate}
              onChange={(e) => updateField('prescriptionDate', e.target.value)}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="patientAge" className="form-label">Age (Years)</label>
            <input
              type="number"
              id="patientAge"
              className="form-input"
              value={formData.patientAge}
              onChange={(e) => updateField('patientAge', e.target.value)}
              placeholder="e.g., 27"
            />
          </div>
          <div className="form-group">
            <label htmlFor="patientGender" className="form-label">Gender</label>
            <select
              id="patientGender"
              className="form-input"
              value={formData.patientGender}
              onChange={(e) => updateField('patientGender', e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="patientHeight" className="form-label">Height (cms)</label>
            <input
              type="number"
              id="patientHeight"
              className="form-input"
              value={formData.patientHeight}
              onChange={(e) => updateField('patientHeight', e.target.value)}
              placeholder="e.g., 178"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="patientWeight" className="form-label">Weight (kgs)</label>
            <input
              type="text"
              id="patientWeight"
              className="form-input"
              value={formData.patientWeight || ''}
              onChange={(e) => updateField('patientWeight', e.target.value)}
              placeholder="e.g., 71"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 px-1">
          Tip: Configure default values in your <a href="/dashboard/profile" className="text-blue-500 hover:underline">Profile</a>.
        </p>
      </div>

      {/* Diagnosis */}
      <div className="form-section">
        <h2 className="form-section-title">
          <Activity size={20} />
          Diagnosis
        </h2>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="diagnosisCode" className="form-label">Diagnosis Code (ICD)</label>
            <input
              type="text"
              id="diagnosisCode"
              className="form-input"
              value={formData.diagnosisCode}
              onChange={(e) => updateField('diagnosisCode', e.target.value)}
              placeholder="e.g., 5B57.Z"
            />
          </div>
          <div className="form-group">
            <label htmlFor="diagnosis" className="form-label">Diagnosis</label>
            <input
              type="text"
              id="diagnosis"
              className="form-input"
              value={formData.diagnosis}
              onChange={(e) => updateField('diagnosis', e.target.value)}
              placeholder="e.g., Vitamin D deficiency, unspecified"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            className="form-textarea"
            value={formData.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Additional description"
            rows={2}
          />
        </div>
        <div className="form-group">
          <label htmlFor="additionalComments" className="form-label">Additional Diagnosis Comments</label>
          <textarea
            id="additionalComments"
            className="form-textarea"
            value={formData.additionalComments}
            onChange={(e) => updateField('additionalComments', e.target.value)}
            placeholder="e.g., Vitamin B12 Low Hyperuricemia Dyslipidemia"
            rows={2}
          />
        </div>
      </div>

      {/* Doctor Information - Simplified */}
      <div className="form-section">
        <h2 className="form-section-title">
          <User size={20} />
          Doctor Details
        </h2>

        {/* Doctor Details Inputs */}
        <div className="form-row">
          <div className="form-group" style={{ flex: 2 }}>
            <label htmlFor="doctorName" className="form-label">Doctor Name</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                id="doctorName"
                className="form-input"
                style={{ flex: 1, minWidth: '150px' }}
                value={formData.doctorName || ''}
                onChange={(e) => updateField('doctorName', e.target.value)}
                placeholder="Dr. Name"
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ whiteSpace: 'nowrap' }}
                onClick={fillDefaults}
                title="Auto Fill Doctor Details"
              >
                Auto Fill Doctor
              </button>
            </div>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="doctorQualifications" className="form-label">Qualifications</label>
            <input
              type="text"
              id="doctorQualifications"
              className="form-input"
              value={formData.doctorQualifications || ''}
              onChange={(e) => updateField('doctorQualifications', e.target.value)}
              placeholder="MBBS, MD"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label htmlFor="doctorRegId" className="form-label">Reg ID</label>
            <input
              type="text"
              id="doctorRegId"
              className="form-input"
              value={formData.doctorRegId || ''}
              onChange={(e) => updateField('doctorRegId', e.target.value)}
              placeholder="Reg ID"
            />
          </div>
        </div>
      </div>

      {/* Medicines */}
      <div className="form-section">
        <h2 className="form-section-title">
          <FileText size={20} />
          Prescribed Medicines
        </h2>

        {/* Desktop Table View */}
        <div className="table-wrapper medicine-table-desktop">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>S.No.</th>
                <th>Medicine Name</th>
                <th style={{ width: '150px' }}>Dosage</th>
                <th>Instructions</th>
                <th style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formData.medicines.map((medicine, index) => (
                <tr key={index}>
                  <td className="text-center font-medium">{medicine.serialNo}</td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      value={medicine.name}
                      onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                      placeholder="e.g., Mecofol-OD Tablet"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      value={medicine.dosage || ''}
                      onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                      placeholder="e.g., Daily: 0-1-0"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      value={medicine.instructions || ''}
                      onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                      placeholder="e.g., 2 Months; After Meal;"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="btn btn-ghost btn-icon"
                      disabled={formData.medicines.length === 1}
                      title="Remove medicine"
                    >
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="medicine-cards-mobile">
          {formData.medicines.map((medicine, index) => (
            <div key={index} className="medicine-card">
              <div className="medicine-card-header">
                <span className="medicine-card-number">#{medicine.serialNo}</span>
                <button
                  type="button"
                  onClick={() => removeMedicine(index)}
                  className="btn btn-ghost btn-icon btn-sm"
                  disabled={formData.medicines.length === 1}
                  title="Remove medicine"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">Medicine Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={medicine.name}
                  onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                  placeholder="e.g., Mecofol-OD Tablet"
                />
              </div>
              <div className="medicine-card-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Dosage</label>
                  <input
                    type="text"
                    className="form-input"
                    value={medicine.dosage || ''}
                    onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                    placeholder="e.g., 0-1-0"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Instructions</label>
                <input
                  type="text"
                  className="form-input"
                  value={medicine.instructions || ''}
                  onChange={(e) => updateMedicine(index, 'instructions', e.target.value)}
                  placeholder="e.g., 2 Months; After Meal"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addMedicine}
          className="btn btn-secondary mt-4"
        >
          <Plus size={18} className="mr-2" />
          Add Medicine
        </button>
      </div>

      {/* Additional Information */}
      <div className="form-section">
        <h2 className="form-section-title">
          <Activity size={20} />
          Additional Information
        </h2>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="drugAllergies" className="form-label">Drug Allergies</label>
            <input
              type="text"
              id="drugAllergies"
              className="form-input"
              value={formData.drugAllergies}
              onChange={(e) => updateField('drugAllergies', e.target.value)}
              placeholder="e.g., No known Allergies"
            />
          </div>
          <div className="form-group">
            <label htmlFor="labTests" className="form-label">Lab Tests</label>
            <input
              type="text"
              id="labTests"
              className="form-input"
              value={formData.labTests}
              onChange={(e) => updateField('labTests', e.target.value)}
              placeholder="e.g., 1. Uric acid"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="followUp" className="form-label">Follow Up</label>
          <input
            type="text"
            id="followUp"
            className="form-input"
            value={formData.followUp}
            onChange={(e) => updateField('followUp', e.target.value)}
            placeholder="e.g., 1 Month After Lab Work"
          />
        </div>
        <div className="form-group">
          <label htmlFor="doctorAdvice" className="form-label">Doctor&apos;s Advice</label>
          <textarea
            id="doctorAdvice"
            className="form-textarea"
            value={formData.doctorAdvice}
            onChange={(e) => updateField('doctorAdvice', e.target.value)}
            placeholder="e.g., 1. Healthy Diet - Low fat diet, Eat Fresh Vegetables..."
            rows={4}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="form-section" style={{ background: 'var(--color-gray-50)' }}>
        <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleSave('DRAFT')}
            className="btn btn-secondary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSave('PUBLISHED')}
            className="btn btn-success"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Publish'}
          </button>
          {mode === 'edit' && prescriptionId && (
            <button
              type="button"
              onClick={handlePreview}
              className="btn btn-primary"
              disabled={saving}
            >
              <FileText size={18} className="mr-2" />
              Preview & Download PDF
            </button>
          )}
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="btn btn-ghost"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
