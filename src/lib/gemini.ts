// ============================================
// GEMINI AI — DUEÑO: Max (P2)
// Motor de IA para: SOAP, documentos de egreso, chat
// ============================================
import type { DocumentType } from '@/types/medicalNotes';

// NOTA: Se ha migrado completamente a Ollama (Llama3 local).
// Ya no se requiere la SDK de Google Generative AI ni la API key externa.


// ============================================
// DOCUMENT SCHEMAS (Inyección Dinámica)
// ============================================
const DOCUMENT_SCHEMAS: Record<DocumentType, string> = {
  POST_OP: `{
    "patientFullName": "Nombre completo del paciente",
    "age": "Edad (ej. 45)",
    "sex": "Sexo",
    "dob": "YYYY-MM-DD",
    "curp": "CURP",
    "rfc": "RFC",
    "recordNumber": "Número de expediente",
    "date": "YYYY-MM-DD",
    "exactTime": "HH:MM",
    "professionalIdSignature": "ID o Firma del profesional",
    "surgeryStartTime": "HH:MM (inicio de cirugía)",
    "surgeryEndTime": "HH:MM (término de cirugía)",
    "diagnosis": "Diagnóstico",
    "isPlannedSurgery": true,
    "surgicalTechniques": ["técnica 1", "técnica 2"],
    "findings": ["hallazgo 1", "hallazgo 2"],
    "incidents": "Incidentes/accidentes o 'Ninguno'",
    "anesthesiologist": "Nombre del anestesiólogo",
    "instrumentist": "Nombre del instrumentista",
    "circulatingNurse": "Nombre de la enfermera circulante"
  }`,
  NURSE_NOTE: `{
    "patientFullName": "Nombre completo del paciente",
    "age": "Edad",
    "sex": "Sexo",
    "dob": "YYYY-MM-DD",
    "curp": "CURP",
    "rfc": "RFC",
    "recordNumber": "Número de expediente",
    "date": "YYYY-MM-DD",
    "exactTime": "HH:MM",
    "professionalIdSignature": "ID o Firma del profesional",
    "materialsSuppliesAndEquipment": ["Listado de materiales", "insumos", "equipos utilizados"]
  }`,
  EVOLUTION: `{
    "patientFullName": "Nombre completo del paciente",
    "age": "Edad",
    "sex": "Sexo",
    "dob": "YYYY-MM-DD",
    "curp": "CURP",
    "rfc": "RFC",
    "recordNumber": "Número de expediente",
    "date": "YYYY-MM-DD",
    "exactTime": "HH:MM",
    "professionalIdSignature": "ID o Firma del profesional",
    "consultationReason": "Motivo de consulta",
    "vitals": {
      "bloodPressure": "TA",
      "heartRate": "FC",
      "respiratoryRate": "FR",
      "temperature": "Temp"
    },
    "physicalExam": "Exploración física",
    "updatedDiagnoses": ["Diagnóstico actualizado 1"],
    "clinicalEvolution": "Evolución clínica",
    "medicalTreatment": "Tratamiento médico indicado"
  }`
};

// ============================================
// RESOLUCIÓN DETERMINISTA DE CÓDIGOS (Mitigación Alucinaciones)
// ============================================
// TODO: Conectar a RAG o DB para catálogo CIE-10 / CPT real.
async function resolveClinicalCodes(diagnosisText: string | undefined): Promise<{ code: string; label: string }> {
  if (!diagnosisText) return { code: "Z00.0", label: "No especificado" };

  const text = diagnosisText.toLowerCase();
  if (text.includes('apendicitis')) return { code: "K35.8", label: "Apendicitis aguda" };
  if (text.includes('colecistitis')) return { code: "K81.9", label: "Colecistitis, no especificada" };
  if (text.includes('hipertension') || text.includes('hta')) return { code: "I10.X", label: "Hipertensión esencial" };
  if (text.includes('diabetes')) return { code: "E11.9", label: "Diabetes mellitus tipo 2" };

  return { code: "R69", label: "Causas de morbilidad desconocidas y no especificadas" }; // Fallback genérico
}

// ============================================
// 1. GENERACIÓN DE DOCUMENTOS (Motor Dinámico)
// ============================================
export async function generateStructuredClinicalNote(
  transcription: string,
  patientContext: string,
  documentType: DocumentType,
  authorRole: string,
  authorId: string,
  patientData?: any
) {
  const targetSchema = DOCUMENT_SCHEMAS[documentType];
  if (!targetSchema) throw new Error('Tipo de documento inválido.');

  const prompt = `Eres un asistente de documentación clínica automatizada de Auralis Health.
Tu tarea es convertir una transcripción dictada por un ${authorRole} en un documento estructurado de tipo: ${documentType}.

REGLAS ESTRICTAS (NOM-004 / Seguridad del Paciente):
1. Usa SOLO la información mencionada en la transcripción. NO inventes datos ni asumas resultados.
2. Si un campo no tiene información en el audio, pon "No referido" o null según corresponda.
3. NO generes códigos médicos (CIE-10/CPT). Extrae diagnósticos y procedimientos SOLO en lenguaje natural. El sistema resolverá los códigos internamente.
4. Responde ÚNICAMENTE con el JSON, sin texto adicional, sin markdown.

CONTEXTO DEL PACIENTE (Expediente previo):
${patientContext}

TRANSCRIPCIÓN DICTADA (Rol: ${authorRole}):
"${transcription}"

RESPONDE EN ESTE FORMATO JSON EXACTO (sin \`\`\`json, solo el JSON puro):
${targetSchema}`;

  let text = '';
  try {
    // LLAMADA A OLLAMA (MODELO LOCAL)
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3', // El modelo local que usaremos
        prompt: prompt,
        stream: false,
        format: 'json' // Obliga a Llama3 a responder en JSON válido
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama Error: ${response.status}`);
    }

    const result = await response.json();
    text = result.response;
    
  } catch (error: any) {
    console.error('Ollama API Error:', error);
    console.warn('⚠️ ERROR DE CONEXIÓN CON OLLAMA. USANDO DATOS SIMULADOS.');
    // Fallback si Ollama no está corriendo o no tiene el modelo
    text = JSON.stringify({
      subjective: {
        chief_complaint: transcription.substring(0, 50) + '...',
        history_present_illness: "Generado automáticamente por sistema de respaldo debido a error en IA Local.",
        review_of_systems: "No referido",
        allergies_mentioned: "No referidas"
      },
      objective: {
        vital_signs_mentioned: "No referidos",
        physical_exam: "Pendiente de explorar"
      },
      assessment: {
        primary_diagnosis_natural_language: "Diagnóstico en evaluación (Modo Offline)",
        secondary_diagnoses_natural_language: [],
        clinical_reasoning: "El sistema de IA local (Ollama) no está respondiendo."
      },
      plan: {
        medications: [],
        follow_up: "Verificar conexión de Ollama en localhost:11434"
      }
    });
  }

  // Limpiar markdown si Llama3 lo envuelve por accidente
  const cleaned = text
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  let extractedData;
  try {
    extractedData = JSON.parse(cleaned);
  } catch (error) {
    console.error('Error parsing Ollama response:', cleaned);
    throw new Error('La IA Local no devolvió un JSON válido.');
  }

  // --- ENRIQUECIMIENTO Y CRUCE DE BASES DE DATOS (NO SOBREESCRIBIR) ---
  if (patientData) {
    // Solo asignar si el paciente tiene el dato, y usar el del LLM como fallback
    extractedData.patientFullName = patientData.name || extractedData.patientFullName;
    extractedData.age = patientData.age || extractedData.age;
    extractedData.sex = patientData.gender || extractedData.sex;
    extractedData.curp = patientData.curp || extractedData.curp;
    extractedData.rfc = patientData.rfc || extractedData.rfc;
    extractedData.dob = patientData.dob || extractedData.dob;
    
    // Función helper para derivar Fecha de Nacimiento (YYYY-MM-DD) desde CURP/RFC
    const deriveDOB = (code: string) => {
      const datePart = code.substring(4, 10);
      const yearStr = datePart.substring(0, 2);
      const month = datePart.substring(2, 4);
      const day = datePart.substring(4, 6);
      const year = parseInt(yearStr, 10);
      const currentYear = new Date().getFullYear() % 100;
      const fullYear = year > currentYear ? `19${yearStr}` : `20${yearStr}`;
      return `${fullYear}-${month}-${day}`;
    };

    if (!extractedData.dob && extractedData.curp && extractedData.curp.length >= 10) {
      extractedData.dob = deriveDOB(extractedData.curp);
    } else if (!extractedData.dob && extractedData.rfc && extractedData.rfc.length >= 10) {
      extractedData.dob = deriveDOB(extractedData.rfc);
    }
  }

  // --- VALIDACIÓN DE SALIDA ---
  let missingKeys: string[] = [];
  if (documentType === 'POST_OP') {
    const required = ['patientFullName', 'surgeryStartTime', 'surgeryEndTime', 'diagnosis'];
    missingKeys = required.filter(key => !(key in extractedData));
    if (missingKeys.length > 0) throw new Error('La transcripción no contiene suficientes datos para una Nota Postoperatoria');
  } else if (documentType === 'NURSE_NOTE') {
    const required = ['patientFullName', 'materialsSuppliesAndEquipment'];
    missingKeys = required.filter(key => !(key in extractedData));
    if (missingKeys.length > 0) throw new Error('La transcripción no contiene suficientes datos para una Nota de Enfermería');
  } else if (documentType === 'EVOLUTION') {
    const required = ['patientFullName', 'consultationReason', 'clinicalEvolution'];
    missingKeys = required.filter(key => !(key in extractedData));
    if (missingKeys.length > 0) throw new Error('La transcripción no contiene suficientes datos para una Nota de Evolución');
  }

  // --- PIPELINE DE RESOLUCIÓN DE CÓDIGOS (Anti-Alucinaciones) ---
  let resolved_codes = {};
  if (documentType === 'EVOLUTION' && extractedData.updatedDiagnoses && extractedData.updatedDiagnoses.length > 0) {
    const codeData = await resolveClinicalCodes(extractedData.updatedDiagnoses[0]);
    resolved_codes = { primary_diagnosis_code: codeData.code, primary_diagnosis_label: codeData.label };
  } else if (documentType === 'POST_OP' && extractedData.diagnosis) {
    const codeData = await resolveClinicalCodes(extractedData.diagnosis);
    resolved_codes = { post_op_diagnosis_code: codeData.code, post_op_diagnosis_label: codeData.label };
  }

  // --- TRAZABILIDAD (Cumplimiento NOM-024) ---
  const finalDocument = {
    document_content: extractedData,
    clinical_codes_resolved: resolved_codes,
    audit_metadata: {
      document_type: documentType,
      author_id: authorId,
      author_role: authorRole,
      created_at_iso: new Date().toISOString(), // Server-side strict timestamp
      system_version: "2.0.0",
      legal_disclaimer: "Documento generado por IA procesando dictado de voz. Pendiente de firma electrónica."
    }
  };

  return finalDocument;
}


// ============================================
// 2. GENERAR DOCUMENTOS DE EGRESO
// ============================================
export async function generateDischargeDocuments(patient: Record<string, unknown>, soapNote: Record<string, unknown>) {
  const prompt = `Eres un asistente administrativo de Auralis Health. Genera los documentos de egreso
basándote en los datos del paciente y su nota clínica.

PACIENTE: ${JSON.stringify(patient, null, 2)}
NOTA CLÍNICA: ${JSON.stringify(soapNote, null, 2)}

Genera en JSON puro (sin markdown):
{
  "prescription": {
    "medications": [
      { "name": "...", "dose": "...", "route": "...", "frequency": "...", "duration": "..." }
    ],
    "general_instructions": "instrucciones generales al paciente"
  },
  "discharge_summary": {
    "admission_reason": "motivo de ingreso",
    "hospital_course": "evolución durante la estancia",
    "discharge_condition": "condición al egreso",
    "discharge_diagnosis": "diagnóstico de egreso con CIE-10",
    "follow_up_instructions": "indicaciones de seguimiento"
  },
  "patient_instructions": {
    "diet": "indicaciones dietéticas",
    "activity": "nivel de actividad permitido",
    "warning_signs": ["signo de alarma 1", "signo de alarma 2", "signo de alarma 3"],
    "next_appointment": "cuándo regresar a consulta"
  },
  "insurance_form": {
    "diagnosis_code": "código CIE-10 principal",
    "procedure_codes": ["códigos de procedimientos realizados"],
    "length_of_stay": "días de estancia",
    "total_charges_estimate": "estimado en MXN"
  }
}`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: false,
        format: 'json'
      })
    });

    if (!response.ok) throw new Error(`Ollama Error: ${response.status}`);
    const result = await response.json();
    const text = result.response;
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Error in Ollama generateDischargeDocuments:', error);
    return {
      prescription: { medications: [], general_instructions: 'Error al generar. Revisar manualmente.' },
      discharge_summary: { admission_reason: '-', hospital_course: '-', discharge_condition: '-', discharge_diagnosis: '-', follow_up_instructions: '-' },
      patient_instructions: { diet: '-', activity: '-', warning_signs: [], next_appointment: '-' },
      insurance_form: { diagnosis_code: '-', procedure_codes: [], length_of_stay: '-', total_charges_estimate: '-' },
    };
  }
}


// ============================================
// 3. CHAT MEDICO CON CONTEXTO
// ============================================
export async function chatWithContext(question: string, context: string): Promise<string> {
  const prompt = `Eres Auralis Health, asistente médico inteligente.
Responde preguntas del doctor de forma concisa, precisa y accionable.
Siempre responde en español. Máximo 3-4 oraciones a menos que se pida más detalle.

CONTEXTO DEL PACIENTE:
${context}

PREGUNTA DEL DOCTOR:
${question}`;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) throw new Error(`Ollama Error: ${response.status}`);
    const result = await response.json();
    return result.response;
  } catch (error) {
    console.error('Error in Ollama chatWithContext:', error);
    return "Lo siento, el modelo de IA local no está disponible o no responde en este momento.";
  }
}
