/**
 * @file /api/notes/route.ts
 * @description Endpoints REST para la gestion de notas clinicas en Firestore.
 *
 * POST /api/notes
 *   Recibe una transcripcion de voz y genera una nota clinica estructurada
 *   (formato SOAP por defecto) utilizando el motor de IA configurado
 *   (Ollama local o Gemini como fallback). El documento generado incluye
 *   codigos clinicos resueltos y metadatos de auditoria.
 *
 * GET /api/notes?patientId=X
 *   Lista las notas clinicas de un paciente especifico, ordenadas por fecha
 *   de creacion descendente. Si no se proporciona patientId, devuelve todas.
 *
 * Dependencias:
 *   - @/lib/gemini (generateStructuredClinicalNote)
 *   - @/lib/rag (getPatientContext)
 *   - Firestore: colecciones "notes", "patients", "auditLog"
 */
import { NextRequest, NextResponse } from 'next/server';
import { collections, queryToArray } from '@/lib/firebase';
import { generateStructuredClinicalNote } from '@/lib/gemini';
import { getPatientContext } from '@/lib/rag';
import type { ClinicalDocument } from '@/types';

// POST: Crear nota SOAP desde transcripción
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      transcription, 
      patientId, 
      documentType = 'SOAP', 
      authorRole = 'Médico Adscrito', 
      authorId = 'dr_123' 
    } = body;

    if (!transcription || !patientId) {
      return NextResponse.json(
        { success: false, error: 'transcription y patientId son requeridos' },
        { status: 400 }
      );
    }

    // 1 & 2. Obtener datos del paciente y contexto RAG
    let context = "Consulta general sin paciente específico.";
    
    if (patientId !== 'unknown') {
      const patientDoc = await collections.patients().doc(patientId).get();
      if (!patientDoc.exists) {
        return NextResponse.json(
          { success: false, error: 'Paciente no encontrado' },
          { status: 404 }
        );
      }
      context = await getPatientContext(patientId, transcription);
    }

    // 3. Gemini genera la nota estructurada y metadatos
    const generatedData = await generateStructuredClinicalNote(
      transcription, 
      context, 
      documentType, 
      authorRole, 
      authorId
    );

    // 4. Construir documento completo
    const note: Omit<ClinicalDocument, '_id'> = {
      patientId,
      doctorName: authorId,
      ...generatedData,
      rawTranscription: transcription,
      status: 'draft',
      createdAt: generatedData.audit_metadata.created_at_iso,
    };

    // 5. Guardar en Firebase
    const result = await collections.notes().add(note);

    // 6. Log de auditoría
    await collections.auditLog().add({
      action: 'note_created',
      patientId,
      details: `Documento ${documentType} generado desde transcripción de voz.`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: { _id: result.id, ...note },
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar nota médica' },
      { status: 500 }
    );
  }
}

// GET: Obtener notas de un paciente
export async function GET(req: NextRequest) {
  try {
    const patientId = req.nextUrl.searchParams.get('patientId');

    let snapshot;
    if (patientId) {
      snapshot = await collections.notes().where('patientId', '==', patientId).orderBy('createdAt', 'desc').get();
    } else {
      snapshot = await collections.notes().orderBy('createdAt', 'desc').get();
    }

    const allNotes = queryToArray(snapshot);

    return NextResponse.json({ success: true, data: allNotes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener notas' },
      { status: 500 }
    );
  }
}
