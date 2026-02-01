'use client';

import { useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

interface Medicine {
  id: string;
  serialNo: number;
  name: string;
  dosage: string | null;
  instructions: string | null;
}

interface Prescription {
  id: string;
  rxId: string;
  status: string;
  patientName: string;
  patientId: string | null;
  patientAge: number | null;
  patientGender: string | null;
  patientHeight: number | null;
  patientWeight: number | null;
  prescriptionDate: Date;
  diagnosisCode: string | null;
  diagnosis: string | null;
  description: string | null;
  additionalComments: string | null;
  drugAllergies: string | null;
  labTests: string | null;
  followUp: string | null;
  doctorAdvice: string | null;
  medicines: Medicine[];
  doctorName: string | null;
  doctorQualifications: string | null;
  doctorRegId: string | null;
}

interface DoctorProfile {
  id: string;
  name: string;
  qualifications: string;
  specialty: string;
  registrationId: string;
  logoUrl: string | null;
}

interface PrescriptionPreviewProps {
  prescription: Prescription;
  doctorProfile: DoctorProfile | null;
}

export function PrescriptionPreview({ prescription, doctorProfile }: PrescriptionPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    setDownloading(true);

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Create proper filename with patient name and date
      const patientName = prescription.patientName.replace(/[^a-zA-Z0-9]/g, '_');
      const date = new Date().toISOString().split('T')[0];
      const filename = `Prescription_${patientName}_${date}.pdf`;

      // Use file-saver for reliable filename in all browsers
      const pdfBlob = pdf.output('blob');
      saveAs(pdfBlob, filename);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Action Buttons */}
      <div className="no-print" style={{
        display: 'flex',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-6)',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleDownloadPDF}
          className="btn btn-primary btn-lg"
          disabled={downloading}
        >
          {downloading ? (
            <>
              <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
              Generating PDF...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download PDF
            </>
          )}
        </button>
        <button onClick={handlePrint} className="btn btn-secondary btn-lg">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print
        </button>
      </div>

      {/* Prescription Preview */}
      <div
        ref={previewRef}
        className="prescription-preview"
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
      >
        <div className="prescription-content">
          {/* Header */}
          <div className="prescription-header">
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span className="rx-symbol">Rx</span>
              <div className="doctor-info">
                <p className="doctor-name">{prescription.doctorName || doctorProfile?.name || 'Doctor Name'}</p>
                <p className="doctor-qualifications">
                  {prescription.doctorQualifications || doctorProfile?.qualifications || 'MBBS - General Medicine'}
                </p>
                <p className="doctor-qualifications">
                  Reg Id : {prescription.doctorRegId || doctorProfile?.registrationId || 'REG/XXX'}
                </p>
                <p className="doctor-qualifications">
                  Rx ID : {prescription.rxId}
                </p>
              </div>
            </div>
            <img
              src={doctorProfile?.logoUrl || '/assets/default-logo.png'}
              alt="Clinic Logo"
              className="prescription-logo"
              crossOrigin="anonymous"
            />
          </div>

          {/* Patient Info */}
          <div className="patient-info">
            <div className="patient-info-row">
              <span className="patient-info-label">Name</span>
              <span className="patient-info-value">{prescription.patientName}</span>
            </div>
            <div className="patient-info-row">
              <span className="patient-info-label">Date</span>
              <span className="patient-info-value">{formatDate(prescription.prescriptionDate)}</span>
            </div>
            <div className="patient-info-row">
              <span className="patient-info-label">Age</span>
              <span className="patient-info-value">{prescription.patientAge ? `${prescription.patientAge} Years` : '-'}</span>
            </div>
            <div className="patient-info-row">
              <span className="patient-info-label">Pat Id</span>
              <span className="patient-info-value">{prescription.patientId || '-'}</span>
            </div>
            <div className="patient-info-row">
              <span className="patient-info-label">Gender</span>
              <span className="patient-info-value">{prescription.patientGender || '-'}</span>
            </div>
            <div className="patient-info-row">
              <span className="patient-info-label">Height</span>
              <span className="patient-info-value">{prescription.patientHeight ? `${prescription.patientHeight}cms` : '-'}</span>
            </div>
            <div className="patient-info-row">
              <span className="patient-info-label">Weight</span>
              <span className="patient-info-value">{prescription.patientWeight ? `${prescription.patientWeight}kgs` : '-'}</span>
            </div>
          </div>

          {/* Diagnosis */}
          {(prescription.diagnosisCode || prescription.diagnosis) && (
            <div className="prescription-section">
              <p className="prescription-section-title">Diagnosis</p>
              <p className="prescription-section-content">
                {prescription.diagnosisCode && `${prescription.diagnosisCode} - `}{prescription.diagnosis}
              </p>
            </div>
          )}

          {prescription.description && (
            <div className="prescription-section">
              <p className="prescription-section-title">Description</p>
              <p className="prescription-section-content">{prescription.description}</p>
            </div>
          )}

          {prescription.additionalComments && (
            <div className="prescription-section">
              <p className="prescription-section-title">Additional diagnosis comments</p>
              <p className="prescription-section-content">{prescription.additionalComments}</p>
            </div>
          )}

          {/* Medicines Table */}
          {prescription.medicines.length > 0 && (
            <table className="medicine-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>S.No.</th>
                  <th>Prescribed Medicines</th>
                  <th style={{ width: '150px' }}>Dosage</th>
                  <th>Instructions</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medicines.map((medicine: Medicine) => (
                  <tr key={medicine.id}>
                    <td>{medicine.serialNo}.</td>
                    <td>{medicine.name}</td>
                    <td>{medicine.dosage || '-'}</td>
                    <td>{medicine.instructions || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Additional Sections */}
          {prescription.drugAllergies && (
            <div className="prescription-section">
              <p className="prescription-section-title">Drug Allergies</p>
              <p className="prescription-section-content">{prescription.drugAllergies}</p>
            </div>
          )}

          {prescription.labTests && (
            <div className="prescription-section">
              <p className="prescription-section-title">Lab Test</p>
              <p className="prescription-section-content">{prescription.labTests}</p>
            </div>
          )}

          {prescription.followUp && (
            <div className="prescription-section">
              <p className="prescription-section-title">Follow Up</p>
              <p className="prescription-section-content">{prescription.followUp}</p>
            </div>
          )}

          {prescription.doctorAdvice && (
            <div className="prescription-section">
              <p className="prescription-section-title">Doctor&apos;s Advice</p>
              <div className="prescription-section-content" style={{ whiteSpace: 'pre-line' }}>
                {prescription.doctorAdvice}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
