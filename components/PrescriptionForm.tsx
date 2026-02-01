'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Medicine, defaultPrescriptionFormData, PrescriptionFormData } from '@/lib/types';

interface PrescriptionFormProps {
  initialData?: PrescriptionFormData;
  prescriptionId?: string;
  mode: 'create' | 'edit';
}

export function PrescriptionForm({ initialData, prescriptionId, mode }: PrescriptionFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PrescriptionFormData>(
    initialData || defaultPrescriptionFormData
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const updateField = (field: keyof PrescriptionFormData, value: string | Medicine[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {savedMessage && (
        <div className="alert alert-success mb-6">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {savedMessage}
        </div>
      )}

      {/* Patient Information */}
      <div className="form-section">
        <h2 className="form-section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
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
          <div className="form-group">
            <label htmlFor="patientWeight" className="form-label">Weight (kgs)</label>
            <input
              type="number"
              id="patientWeight"
              className="form-input"
              value={formData.patientWeight}
              onChange={(e) => updateField('patientWeight', e.target.value)}
              placeholder="e.g., 71"
            />
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="form-section">
        <h2 className="form-section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
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

      {/* Medicines */}
      <div className="form-section">
        <h2 className="form-section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19.5 12.5c0 .828-.224 1.603-.61 2.267l-8.623 8.622c-1.562 1.562-4.094 1.562-5.656 0-1.562-1.562-1.562-4.094 0-5.656l8.623-8.623c.664-.386 1.439-.61 2.266-.61a4.5 4.5 0 0 1 0 9z" />
            <path d="m9.5 5.5 9 9" />
          </svg>
          Prescribed Medicines
        </h2>

        <div className="table-wrapper">
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
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addMedicine}
          className="btn btn-secondary mt-4"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Add Medicine
        </button>
      </div>

      {/* Additional Information */}
      <div className="form-section">
        <h2 className="form-section-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
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
