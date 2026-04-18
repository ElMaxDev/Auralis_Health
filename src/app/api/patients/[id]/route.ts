import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/firebase';
import type { Patient } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await collections.patients().doc(id).get();

    if (!doc.exists) {
      return NextResponse.json(
        { success: false, error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    const data = { _id: doc.id, ...doc.data() } as Patient;
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener paciente' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (id.startsWith('mock-')) {
      const { MOCK_PATIENTS } = await import('@/lib/mockData');
      const idx = MOCK_PATIENTS.findIndex(p => p._id === id);
      if (idx !== -1) {
        MOCK_PATIENTS[idx].status = status;
        MOCK_PATIENTS[idx].updatedAt = new Date().toISOString();
        // Guardar el mock en firebase para que la simulación persista entre workers de Next.js
        await collections.patients().doc(id).set(MOCK_PATIENTS[idx]);
      }
      return NextResponse.json({ success: true });
    }

    await collections.patients().doc(id).update({ status });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating patient:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar paciente' },
      { status: 500 }
    );
  }
}
