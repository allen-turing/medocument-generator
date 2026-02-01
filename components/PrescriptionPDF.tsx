import { Document, Page, Text, View, StyleSheet, Image, Font, Svg, Path, G } from '@react-pdf/renderer';

// Register standard fonts
// Note: Simple standard fonts like Courier are built-in to react-pdf

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Courier',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#1f2937',
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    opacity: 0.1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
    marginBottom: 20,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  rxSymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#374151',
    marginRight: 10,
  },
  doctorInfo: {
    flex: 1,
    maxWidth: 350, // Prevent pushing the logo away
  },
  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  doctorSub: {
    fontSize: 9,
    color: '#4b5563',
  },
  logoContainer: {
    width: 120,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logo: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
  },
  patientInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  patientInfoItem: {
    width: '50%',
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 60,
    fontWeight: 'bold',
    color: '#374151',
  },
  value: {
    flex: 1,
    color: '#1f2937',
  },
  section: {
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
    textDecoration: 'underline',
  },
  sectionContent: {
    paddingLeft: 10,
  },
  table: {
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
    backgroundColor: 'transparent',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    padding: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 5,
  },
  colNo: { width: '10%', fontWeight: 'bold' },
  colMed: { width: '40%', fontWeight: 'bold' },
  colDos: { width: '20%', fontWeight: 'bold' },
  colIns: { width: '30%', fontWeight: 'bold' },
  cellNo: { width: '10%' },
  cellMed: { width: '40%' },
  cellDos: { width: '20%' },
  cellIns: { width: '30%' },
});

interface Medicine {
  id: string;
  serialNo: number;
  name: string;
  dosage: string | null;
  instructions: string | null;
}

interface Prescription {
  rxId: string;
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

interface PrescriptionPDFProps {
  prescription: Prescription;
  logoUrl?: any; // Accepting URL, DataURL, or Buffer
}

// Plus sign pattern component
const BackgroundPattern = () => {
  const pluses = [];
  const spacingX = 60;
  const spacingY = 60;
  const rows = 15;
  const cols = 10;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      pluses.push(
        <G key={`${i}-${j}`} transform={`translate(${j * spacingX}, ${i * spacingY})`}>
          <Path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z" fill="#e5e7eb" />
        </G>
      );
    }
  }

  return (
    <View style={styles.backgroundPattern} fixed>
      <Svg width="100%" height="100%" viewBox="0 0 600 900">
        <G opacity="0.4">
          {pluses}
        </G>
      </Svg>
    </View>
  );
};

export const PrescriptionPDF = ({ prescription, logoUrl }: PrescriptionPDFProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <BackgroundPattern />

        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <Text style={styles.rxSymbol}>Rx</Text>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{prescription.doctorName || 'Doctor Name'}</Text>
              <Text style={styles.doctorSub}>{prescription.doctorQualifications || 'Qualifications'}</Text>
              <Text style={styles.doctorSub}>Reg Id : {prescription.doctorRegId || 'REG/XXX'}</Text>
              <Text style={styles.doctorSub}>Rx ID  : {prescription.rxId}</Text>
            </View>
          </View>
          {logoUrl && (
            <View style={styles.logoContainer}>
              <Image src={logoUrl} style={styles.logo} />
            </View>
          )}
        </View>

        {/* Patient Information */}
        <View style={styles.patientInfoGrid}>
          <View style={styles.patientInfoItem}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>: {prescription.patientName}</Text>
          </View>
          <View style={styles.patientInfoItem}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>: {formatDate(prescription.prescriptionDate)}</Text>
          </View>
          <View style={styles.patientInfoItem}>
            <Text style={styles.label}>Age</Text>
            <Text style={styles.value}>: {prescription.patientAge ? `${prescription.patientAge} Years` : '-'}</Text>
          </View>
          <View style={styles.patientInfoItem}>
            <Text style={styles.label}>Pat Id</Text>
            <Text style={styles.value}>: {prescription.patientId || '-'}</Text>
          </View>
          <View style={styles.patientInfoItem}>
            <Text style={styles.label}>Gender</Text>
            <Text style={styles.value}>: {prescription.patientGender || '-'}</Text>
          </View>
          <View style={styles.patientInfoItem}>
            <Text style={styles.label}>Height</Text>
            <Text style={styles.value}>: {prescription.patientHeight ? `${prescription.patientHeight}cms` : '-'}</Text>
          </View>
          <View style={styles.patientInfoItem}>
            <Text style={styles.label}>Weight</Text>
            <Text style={styles.value}>: {prescription.patientWeight ? `${prescription.patientWeight}kgs` : '-'}</Text>
          </View>
        </View>

        {/* Diagnosis */}
        {(prescription.diagnosis || prescription.diagnosisCode) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Diagnosis</Text>
            <Text style={styles.sectionContent}>
              {prescription.diagnosisCode && `${prescription.diagnosisCode} - `}
              {prescription.diagnosis}
            </Text>
          </View>
        )}

        {/* Medicines Table */}
        {prescription.medicines.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colNo}>No.</Text>
              <Text style={styles.colMed}>Medicine</Text>
              <Text style={styles.colDos}>Dosage</Text>
              <Text style={styles.colIns}>Instructions</Text>
            </View>
            {prescription.medicines.map((med) => (
              <View key={med.id} style={styles.tableRow}>
                <Text style={styles.cellNo}>{med.serialNo}.</Text>
                <Text style={styles.cellMed}>{med.name}</Text>
                <Text style={styles.cellDos}>{med.dosage || '-'}</Text>
                <Text style={styles.cellIns}>{med.instructions || '-'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Advice and Followup */}
        {prescription.doctorAdvice && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Doctor's Advice</Text>
            <Text style={styles.sectionContent}>{prescription.doctorAdvice}</Text>
          </View>
        )}

        {prescription.labTests && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lab Tests</Text>
            <Text style={styles.sectionContent}>{prescription.labTests}</Text>
          </View>
        )}

        {prescription.followUp && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Follow Up</Text>
            <Text style={styles.sectionContent}>{prescription.followUp}</Text>
          </View>
        )}

        {/* Footer Note */}
        <View style={{ marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10 }}>
          <Text style={{ fontSize: 8, textAlign: 'center', color: '#9ca3af' }}>
            This is a computer-generated prescription.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
