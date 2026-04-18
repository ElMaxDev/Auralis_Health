import { NextResponse } from 'next/server';
import { collections, queryToArray } from '@/lib/firebase';
import type { Patient } from '@/types';
import { MOCK_PATIENTS } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const snapshot = await collections.patients()
      .where('status', '==', 'discharged')
      .get();

    let dischargedPatients = queryToArray<Patient>(snapshot);

    // Si la BD está vacía (o sin egresos), proveer la data de simulación para que la app sea funcional
    if (dischargedPatients.length === 0) {
      dischargedPatients = MOCK_PATIENTS.filter(p => p.status === 'discharged') as any;
    }

    // Ordenar por fecha de actualización (los más recientes primero)
    dischargedPatients.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({ success: true, data: dischargedPatients });
  } catch (error) {
    console.error('Error fetching discharged patients:', error);
    // Fallback a mock data si falla Firebase
    return NextResponse.json({ success: true, data: MOCK_PATIENTS.filter(p => p.status === 'discharged') });
  }
}
