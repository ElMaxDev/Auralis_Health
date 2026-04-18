// ============================================
// API: PATIENTS — DUEÑO: Aarón (P1)
// GET /api/patients → Lista todos los pacientes
// ============================================
import { NextResponse } from 'next/server';
import { collections, queryToArray } from '@/lib/firebase';
import type { Patient } from '@/types';

export async function GET() {
  try {
    const snapshot = await collections.patients()
      .where('status', '!=', 'discharged')
      .get();

    let patients = queryToArray<Patient>(snapshot);
    
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
    return NextResponse.json(
      { success: false, error: 'Error al obtener pacientes' },
      { status: 500 }
    );
  }
}
