// ============================================
// RAG ENGINE — DUEÑO: Max (P2)
// Busca contexto relevante en MongoDB para enriquecer prompts
// ============================================
import { collections, queryToArray } from './firebase';

// ============================================
// OPCION 1: Embedding con Gemini + Vector Search
// (Requiere que MongoDB Atlas tenga un vector index creado)
// ============================================
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/text-embedding-004',
          content: { parts: [{ text }] },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding.values;
  } catch (error) {
    console.warn('⚠️ Error generando embedding, usando búsqueda por texto:', error);
    return [];
  }
}


// ============================================
// OPCION 2: Búsqueda por texto simple (FALLBACK)
// Funciona sin vector index — para cuando no hay tiempo de configurar Atlas Search
// ============================================
async function textSearch(collection: string, query: string, limit: number = 3) {
  // Buscar por coincidencia de texto simple en memoria para Firebase
  const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);
  
  const snapshot = await collections.medicalKnowledge().where('type', '==', collection).get();
  const allDocs = queryToArray<any>(snapshot);
  
  const results = allDocs.filter(doc => 
    keywords.some(k => doc.content?.toLowerCase().includes(k))
  ).slice(0, limit);

  return results;
}


// ============================================
// OBTENER CONTEXTO DEL PACIENTE (usado por /api/notes y /api/chat)
// ============================================
export async function getPatientContext(patientId: string, query: string): Promise<string> {
  try {
    // 1. Datos del paciente
    const patientDoc = await collections.patients().doc(patientId).get();
    if (!patientDoc.exists) return 'Paciente no encontrado en la base de datos.';
    const patient = patientDoc.data() as any;

    // 2. Últimas notas del paciente
    const notesSnapshot = await collections.notes()
      .where('patientId', '==', patientId)
      .orderBy('createdAt', 'desc')
      .limit(2)
      .get();
    const previousNotes = queryToArray<any>(notesSnapshot);

    // 3. Buscar conocimiento médico relevante
    let relevantDocs: Array<{ content: string }> = [];

    // Fallback a text search en Firebase
    if (relevantDocs.length === 0) {
      relevantDocs = await textSearch('protocol', query) as Array<{ content: string }>;
    }

    // 4. Construir contexto completo
    const context = `
PACIENTE: ${patient.name}, ${patient.age} años, ${patient.gender === 'M' ? 'Masculino' : 'Femenino'}
CAMA: ${patient.bed}
MOTIVO DE INGRESO: ${patient.admissionReason || 'No especificado'}
ANTECEDENTES: ${patient.medicalHistory || 'Sin antecedentes registrados'}
MEDICACIÓN ACTUAL: ${patient.currentMedications?.join(', ') || 'Ninguna'}
ALERGIAS: ${patient.allergies?.join(', ') || 'NKDA (No known drug allergies)'}
ASEGURADORA: ${patient.insuranceProvider || 'No especificada'}

NOTAS PREVIAS:
${previousNotes.length > 0
  ? previousNotes.map(n => {
      const type = n.audit_metadata?.document_type || 'SOAP';
      const dx = n.clinical_codes_resolved?.primary_diagnosis_label 
                 || n.document_content?.assessment?.primary_diagnosis_natural_language 
                 || n.document_content?.procedure_details?.post_op_diagnosis_natural_language 
                 || 'No especificado';
      const plan = n.document_content?.plan?.follow_up 
                   || n.document_content?.plan?.instructions 
                   || 'No especificado';
      return `[${n.createdAt || n.audit_metadata?.created_at_iso}] Tipo: ${type} | Dx: ${dx} | Plan: ${plan}`;
    }).join('\n')
  : 'Primera consulta - sin notas previas'
}

PROTOCOLOS/CONOCIMIENTO RELEVANTE:
${relevantDocs.map(d => d.content).join('\n---\n') || 'No se encontraron protocolos específicos.'}
    `.trim();

    return context;
  } catch (error) {
    console.error('Error getting patient context:', error);
    return 'Error al obtener contexto del paciente. La nota se generará sin contexto adicional.';
  }
}
