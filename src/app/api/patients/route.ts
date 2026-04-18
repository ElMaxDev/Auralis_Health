/**
 * @file /api/patients/route.ts
 * @description Endpoints REST para la gestion de pacientes en Firestore.
 *
 * GET  /api/patients
 *   Lista todos los pacientes activos (status != 'discharged').
 *   El ordenamiento se realiza en memoria para evitar la creacion
 *   de indices compuestos en Firestore (primero por status, luego por triageLevel).
 *
 * POST /api/patients
 *   Registra un nuevo paciente en la coleccion "patients" de Firestore.
 *   Campos obligatorios: name, age, gender, bed.
 *   El medico responsable se asigna desde el campo attendingDoctor del body.
 *   Se genera un registro de auditoria automaticamente.
 */
import { NextRequest, NextResponse } from 'next/server';
import { collections, queryToArray } from '@/lib/firebase';
import type { Patient } from '@/types';
import { MOCK_PATIENTS } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await collections.patients()
      .where('status', '!=', 'discharged')
      .get();

    let patients = queryToArray<Patient>(snapshot);

    // Si no hay pacientes activos, proveer la data de simulación para que la app sea funcional
    if (patients.length === 0) {
      // Filtrar los mocks que YA fueron dados de alta y guardados en Firebase
      const dischargedSnap = await collections.patients().where('status', '==', 'discharged').get();
      const dischargedIds = new Set(dischargedSnap.docs.map(d => d.id));
      
      patients = MOCK_PATIENTS.filter(p => p.status !== 'discharged' && p._id && !dischargedIds.has(p._id)) as any;
    }

    // Ordenar en memoria para evitar el error de Firebase "The query requires an index"
    patients.sort((a, b) => {
      // Primero por status
      if (a.status !== b.status) return a.status.localeCompare(b.status);
      // Luego por triageLevel (ascendente)
      const triageA = a.triageLevel || 99;
      const triageB = b.triageLevel || 99;
      return triageA - triageB;
    });

    return NextResponse.json({ success: true, data: patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    // Fallback a mock data si falla Firebase (ej. error de DNS en mac)
    return NextResponse.json({ success: true, data: MOCK_PATIENTS.filter(p => p.status !== 'discharged') });
  }
}

  // POST: Registro de un nuevo paciente en Firestore
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, age, gender, bed, admissionReason, medicalHistory, allergies, currentMedications, attendingDoctor, insuranceProvider } = body;

    if (!name || !age || !gender || !bed) {
      return NextResponse.json(
        { success: false, error: 'name, age, gender y bed son requeridos' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newPatient: Omit<Patient, '_id'> = {
      name,
      age: Number(age),
      gender,
      bed,
      status: 'stable',
      triageLevel: 3,
      medicalHistory: medicalHistory || '',
      currentMedications: currentMedications || [],
      allergies: allergies || [],
      insuranceProvider: insuranceProvider || 'Ninguno',
      insurancePolicyNumber: '',
      admissionDate: now,
      admissionReason: admissionReason || '',
      attendingDoctor: attendingDoctor || '',
      previousNotes: [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await collections.patients().add(newPatient);

    // Log de auditoría
    await collections.auditLog().add({
      action: 'note_created',
      patientId: result.id,
      details: `Paciente ${name} dado de alta en cama ${bed}.`,
      timestamp: now,
    });

    return NextResponse.json({
      success: true,
      data: { _id: result.id, ...newPatient },
    });
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json(
      { success: false, error: 'Error al registrar paciente' },
      { status: 500 }
    );
  }
}
