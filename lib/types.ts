// Type definitions for Prescription Generator

export type PrescriptionStatus = 'DRAFT' | 'PUBLISHED';

export interface DoctorInfo {
  name: string;
  qualifications: string;
  specialty: string;
  registrationId: string;
  logoUrl?: string;
}

export interface PatientInfo {
  name: string;
  patientId?: string;
  age?: number;
  gender?: string;
  height?: number; // in cms
  weight?: number; // in kgs
}

export interface Medicine {
  id?: string;
  serialNo: number;
  name: string;
  dosage?: string;
  instructions?: string;
}

export interface PrescriptionData {
  id?: string;
  rxId?: string;
  status: PrescriptionStatus;
  prescriptionDate: Date;

  // Doctor info (from profile or overridden)
  doctorInfo: DoctorInfo;

  // Patient info
  patientInfo: PatientInfo;

  // Diagnosis
  diagnosisCode?: string;
  diagnosis?: string;
  description?: string;
  additionalComments?: string;

  // Medicines
  medicines: Medicine[];

  // Additional sections
  drugAllergies?: string;
  labTests?: string;
  followUp?: string;
  doctorAdvice?: string;
}

export interface PrescriptionFormData {
  // Patient Information
  patientName: string;
  patientId: string;
  patientAge: string;
  patientGender: string;
  patientHeight: string;
  patientWeight: string;
  prescriptionDate: string;

  // Diagnosis
  diagnosisCode: string;
  diagnosis: string;
  description: string;
  additionalComments: string;

  // Medicines
  medicines: Medicine[];

  // Additional sections
  drugAllergies: string;
  labTests: string;
  followUp: string;
  doctorAdvice: string;
}

export const defaultPrescriptionFormData: PrescriptionFormData = {
  patientName: '',
  patientId: '',
  patientAge: '',
  patientGender: '',
  patientHeight: '',
  patientWeight: '',
  prescriptionDate: new Date().toISOString().split('T')[0],
  diagnosisCode: '',
  diagnosis: '',
  description: '',
  additionalComments: '',
  medicines: [{ serialNo: 1, name: '', dosage: '', instructions: '' }],
  drugAllergies: '',
  labTests: '',
  followUp: '',
  doctorAdvice: '',
};
