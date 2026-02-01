-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DoctorProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qualifications" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DoctorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "rxId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "patientName" TEXT NOT NULL,
    "patientId" TEXT,
    "patientAge" INTEGER,
    "patientGender" TEXT,
    "patientHeight" INTEGER,
    "patientWeight" INTEGER,
    "prescriptionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "diagnosis" TEXT,
    "diagnosisCode" TEXT,
    "description" TEXT,
    "additionalComments" TEXT,
    "drugAllergies" TEXT,
    "labTests" TEXT,
    "followUp" TEXT,
    "doctorAdvice" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Prescription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prescriptionId" TEXT NOT NULL,
    "serialNo" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "dosage" TEXT,
    "instructions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Medicine_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProfile_userId_key" ON "DoctorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Prescription_rxId_key" ON "Prescription"("rxId");
