// ============================================
// API: ALERTS — DUEÑO: Aarón (P1)
// GET   /api/alerts            → Lista alertas activas
// PATCH /api/alerts            → Reconoce una alerta por ID
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { collections, queryToArray } from '@/lib/firebase';
import type { Alert } from '@/types';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const { alertId } = await req.json();
    if (!alertId) {
      return NextResponse.json({ success: false, error: 'alertId requerido' }, { status: 400 });
    }
    await collections.alerts().doc(alertId).update({ acknowledged: true });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return NextResponse.json({ success: false, error: 'Error al reconocer alerta' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const snapshot = await collections.alerts()
      .where('acknowledged', '==', false)
      .get();

    let alerts = queryToArray<Alert>(snapshot);
    alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    alerts = alerts.slice(0, 20);

    return NextResponse.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener alertas' }, { status: 500 });
  }
}
