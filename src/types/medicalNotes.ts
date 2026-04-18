export interface BaseDocumentContext {
  patientFullName: string;
  age: number | string;
  sex: string;
  dob?: string;
  curp?: string;
  rfc?: string;
  recordNumber: string;
  date: string;
  exactTime: string;
  professionalIdSignature: string;
}

export interface PostOpNoteSchema extends BaseDocumentContext {
  surgeryStartTime: string;
  surgeryEndTime: string;
  diagnosis: string;
  isPlannedSurgery: boolean;
  surgicalTechniques: string[];
  findings: string[];
  incidents: string;
  anesthesiologist: string;
  instrumentist: string;
  circulatingNurse: string;
}

export interface CirculatingNurseNoteSchema extends BaseDocumentContext {
  materialsSuppliesAndEquipment: string[];
}

export interface ClinicalEvolutionNoteSchema extends BaseDocumentContext {
  consultationReason: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    respiratoryRate: string;
    temperature: string;
  };
  physicalExam: string;
  updatedDiagnoses: string[];
  clinicalEvolution: string;
  medicalTreatment: string;
}

export type DocumentType = 'POST_OP' | 'NURSE_NOTE' | 'EVOLUTION';
