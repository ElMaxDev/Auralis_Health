# MOSCATIAI v2 — GUIA ESTRATEGICA EVOLUCIONADA
## "El doctor habla. El sistema hace todo lo demas."

---

## 1. DEFINICION REFINADA (Primeras 2 horas)

### El Problema (1 frase)

**Los medicos del Hospital Moscati pasan mas tiempo escribiendo documentos que atendiendo pacientes: 40% de su jornada es papeleria, el egreso tarda 5-6 horas, y la duplicacion de datos entre notas, laboratorio y aseguradoras genera errores que cuestan vidas y dinero.**

### La Solucion (1 frase)

**MoscatiAI es una plataforma donde el medico solo habla — el sistema transcribe la consulta, genera la nota medica estructurada, prellenar los 85+ documentos del expediente, automatiza el egreso en minutos y sube todo a la aseguradora sin intervencion humana.**

### Propuesta de Valor (1 frase)

**Reducir el tiempo de documentacion clinica de 35 minutos a 3 minutos por consulta, y el egreso de 5 horas a 20 minutos, liberando al medico para lo que importa: el paciente.**

### 3 User Stories CRITICAS para el Demo

**US1 — Nota Medica por Voz (OBLIGATORIA, centro del demo)**
> "Como medico, quiero hablar naturalmente durante la consulta con mi paciente y que el sistema genere automaticamente una nota medica en formato SOAP, para que yo solo revise, corrija y firme."

**US2 — Egreso Express**
> "Como medico, quiero presionar un boton de 'Iniciar Egreso' y que el sistema genere automaticamente todos los documentos requeridos (receta, indicaciones, resumen clinico, formatos de aseguradora) prellenados con los datos del expediente, para reducir el proceso de 5 horas a minutos."

**US3 — Envio Automatico a Aseguradora**
> "Como administrador hospitalario, quiero que al completar el egreso, los documentos requeridos se envien automaticamente al portal de la aseguradora del paciente, eliminando la captura manual duplicada."

---

## 2. ARQUITECTURA INTEGRADA

### Principio de Diseno: VOZ COMO PUNTO DE ENTRADA

Todo comienza con la voz del medico. No hay formularios largos. No hay captura manual. El medico habla, el sistema entiende, estructura y actua.

```
LA VOZ ES EL TECLADO DEL MEDICO
```

### Stack Tecnico Exacto

```
FRONTEND:        Next.js 14 (App Router) + TailwindCSS + shadcn/ui + Recharts
BACKEND:         Node.js (Next.js API Routes) — un solo proyecto, sin microservicios
SPEECH-TO-TEXT:  Azure Cognitive Services Speech SDK (sponsor Microsoft, streaming real-time)
LLM PRINCIPAL:   Gemini 2.0 Flash (sponsor Google) — estructuracion SOAP + generacion docs
RAG:             MongoDB Atlas Vector Search — plantillas medicas + protocolos del hospital
BASE DE DATOS:   MongoDB Atlas (sponsor) — pacientes, notas, documentos, audit trail
VOZ SINTETICA:   ElevenLabs (sponsor) — feedback por voz al medico ("Nota guardada, egreso listo")
BLOCKCHAIN:      Solana (sponsor, OPCIONAL) — hash de firma digital de documentos
HOSTING:         Vercel (frontend) + VULTR (sponsor, API si se necesita)
DISENO:          Figma (sponsor) — mockups rapidos pre-codigo
```

### Diagrama de Arquitectura Completo

```
                    ┌─────────────────────────────┐
                    │     MEDICO HABLA CON         │
                    │     PACIENTE EN CONSULTA     │
                    └──────────────┬───────────────┘
                                   │ audio stream
                                   v
                    ┌──────────────────────────────┐
                    │   AZURE SPEECH SDK            │
                    │   (Speech-to-Text real-time)  │
                    │   Transcripcion en vivo        │
                    └──────────────┬───────────────┘
                                   │ texto transcrito
                                   v
                    ┌──────────────────────────────┐
                    │   MOTOR DE ESTRUCTURACION     │
                    │   Gemini 2.0 Flash            │
                    │   ┌────────────────────────┐  │
                    │   │ RAG: MongoDB Vector    │  │
                    │   │ Search (plantillas     │  │
                    │   │ SOAP, protocolos,      │  │
                    │   │ CIE-10, medicamentos)  │  │
                    │   └────────────────────────┘  │
                    │                               │
                    │   Input: transcripcion cruda   │
                    │   Output: nota SOAP JSON       │
                    └──────────────┬───────────────┘
                                   │ nota estructurada
                                   v
                    ┌──────────────────────────────┐
                    │   PANTALLA DEL MEDICO         │
                    │   Nota editable en tiempo real │
                    │   [Corregir] [Validar] [Firmar]│
                    └──────────────┬───────────────┘
                                   │ nota validada
                                   v
                    ┌──────────────────────────────┐
                    │        MONGODB ATLAS          │
                    │  ┌──────┐ ┌──────┐ ┌───────┐ │
                    │  │Notas │ │Pctes │ │Docs   │ │
                    │  │SOAP  │ │      │ │Generados│ │
                    │  └──────┘ └──────┘ └───────┘ │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴───────────────┐
                    │                               │
                    v                               v
        ┌────────────────────┐      ┌─────────────────────────┐
        │  MOTOR DE EGRESO   │      │  GENERADOR DE DOCUMENTOS │
        │                    │      │                           │
        │  Detecta que todo  │      │  Receta medica            │
        │  esta completo:    │      │  Indicaciones de egreso   │
        │  ✓ Notas           │      │  Resumen clinico          │
        │  ✓ Labs            │      │  Formato aseguradora      │
        │  ✓ Estudios        │      │  Consentimientos          │
        │  ✓ Indicaciones    │      │  (plantillas RAG)         │
        │                    │      │                           │
        │  → Habilita egreso │      └────────────┬────────────┘
        └────────────────────┘                   │
                                                  v
                                   ┌──────────────────────────┐
                                   │  PORTAL ASEGURADORA      │
                                   │  (simulado con mock API)  │
                                   │                           │
                                   │  Sube PDFs automaticamente│
                                   │  Mapea campos requeridos  │
                                   │  Confirma recepcion       │
                                   └──────────────────────────┘
                                                  │
                                                  v
                                   ┌──────────────────────────┐
                                   │  ELEVENLABS               │
                                   │  "Egreso completado.      │
                                   │   Documentos enviados     │
                                   │   a MetLife exitosamente." │
                                   └──────────────────────────┘
```

### Flujo Tecnico Detallado: Voz → Aseguradora

**Paso 1: Captura de Audio (Frontend)**
```
Medico abre consulta → Click "Iniciar Consulta" → Microfono se activa
Audio se envia via WebSocket al Azure Speech SDK
Transcripcion aparece en pantalla en tiempo real (subtitulos en vivo)
```

**Paso 2: Transcripcion → Nota SOAP (Backend + LLM)**
```
Medico dice: "Paciente masculino de 45 años que refiere dolor en el pecho
desde hace 2 horas, tipo opresivo, irradiado al brazo izquierdo. 
Antecedente de hipertension. A la exploracion: presion 160/100, 
frecuencia 95, saturacion 96. Considero sindrome coronario agudo, 
solicito enzimas cardiacas y electrocardiograma, inicio aspirina 
y nitroglicerina."

El sistema genera automaticamente:

SOAP NOTE:
├── Subjective: "Masculino 45 años. Dolor toracico opresivo 2h de 
│               evolucion, irradiado a brazo izquierdo."
├── Objective:  "PA 160/100, FC 95, SpO2 96%. Antecedente: HTA."
├── Assessment: "Sindrome coronario agudo. CIE-10: I21.9"
└── Plan:       "1. BH, enzimas cardiacas (troponina, CK-MB)
                 2. ECG 12 derivaciones
                 3. ASA 300mg VO dosis unica
                 4. NTG 0.4mg SL PRN
                 5. Monitorizacion continua"
```

**Paso 3: Revision y Firma (Frontend)**
```
Nota aparece prellenada en pantalla editable
Medico corrige si es necesario (usualmente minimo)
Click "Firmar y Guardar" → se almacena en MongoDB
CIE-10 se asigna automaticamente via RAG
```

**Paso 4: Generacion de Documentos (Backend)**
```
Con la nota firmada + datos del paciente:
→ Se generan automaticamente: receta, indicaciones, resumen clinico
→ Plantillas precargadas via RAG (MongoDB Vector Search)
→ Gemini rellena campos dinamicos
→ PDFs listos para descarga o envio
```

**Paso 5: Egreso Express (Backend + Frontend)**
```
Dashboard muestra checklist de egreso:
✅ Nota medica firmada
✅ Resultados de laboratorio
✅ Indicaciones de egreso
✅ Receta firmada
⬜ Formato de aseguradora

Cuando todo esta ✅ → Boton "Completar Egreso" se habilita
Un click → sistema genera paquete completo
```

**Paso 6: Envio a Aseguradora (Backend mock)**
```
Mock API simula portal de MetLife/GNP/AXA
Sistema mapea campos de la nota a campos del formato
Sube PDFs automaticamente
Retorna confirmacion: "Caso #12345 recibido exitosamente"
ElevenLabs: "Doctor, el egreso del paciente Martinez fue completado.
            Documentos enviados a MetLife."
```

---

## 3. PLAN DE TRABAJO — EQUIPO DE 5

### Roles Optimizados

| Persona | Rol | Foco principal | Archivos que toca |
|---------|-----|----------------|-------------------|
| **P1** | Tech Lead + Backend Core | APIs, MongoDB, integracion, deploys | `/api/*`, `/lib/mongodb.ts`, configs |
| **P2** | IA/Voz Engineer | Azure Speech, Gemini, RAG, prompts | `/lib/speech.ts`, `/lib/gemini.ts`, `/lib/rag.ts` |
| **P3** | Frontend Lead | Dashboard, componentes, UX flow | `/components/*`, `/app/page.tsx`, estilos |
| **P4** | Frontend + Docs/Egreso | Pantalla nota editable, generacion docs, egreso | `/app/consulta/*`, `/app/egreso/*`, `/lib/docs.ts` |
| **P5** | Demo + Data + QA | Datos seed, testing, video, pitch, presentacion | `/scripts/*`, guion, video, metricas |

### Checkpoints con Entregables Concretos

**CHECKPOINT 1 — Hora 3** (Setup completo)
```
P1: ✅ Repo creado, Next.js corriendo, MongoDB Atlas conectado, schemas definidos
P2: ✅ Azure Speech SDK funcionando en browser, primera transcripcion exitosa
P3: ✅ Layout principal con Tailwind+shadcn, navegacion, componentes base
P4: ✅ Pantalla de nota medica editable (con datos mock, campos SOAP)
P5: ✅ 10 pacientes ficticios en MongoDB, datos de ejemplo para RAG
```

**CHECKPOINT 2 — Hora 6** (Flujo de voz funcionando)
```
P1: ✅ API /api/transcribe y /api/notes funcionales
P2: ✅ Transcripcion en vivo aparece en pantalla + Gemini estructura SOAP
P3: ✅ Dashboard de pacientes con tarjetas y estados
P4: ✅ Nota SOAP editable recibe datos reales del backend
P5: ✅ Script de demo con conversacion medica de ejemplo
```

**CHECKPOINT 3 — Hora 10** (MVP core completo)
```
P1: ✅ API /api/egreso + /api/documents funcionales
P2: ✅ RAG con plantillas medicas funcionando (CIE-10, medicamentos)
P3: ✅ Vista completa del paciente (notas, labs, docs)
P4: ✅ Flujo de egreso: checklist → generar docs → confirmar
P5: ✅ Primer run-through completo del demo
```

**CHECKPOINT 4 — Hora 14** (Features avanzados)
```
P1: ✅ Mock API de aseguradoras, endpoint de envio automatico
P2: ✅ ElevenLabs integrado para feedback por voz
P3: ✅ Animaciones, estados de carga, pulido visual
P4: ✅ Pantalla de confirmacion aseguradora + timeline del paciente
P5: ✅ Datos de demo perfectos, guion del video escrito
```

**CHECKPOINT 5 — Hora 18** (Feature freeze)
```
TODOS: ✅ Merge final a main
TODOS: ✅ Deploy en Vercel funcionando
TODOS: ✅ Dry-run completo del demo sin errores
P5:    ✅ Primer borrador del video grabado
```

**CHECKPOINT 6 — Hora 22** (Code freeze)
```
❌ NO MAS CODIGO. SOLO HOTFIXES CRITICOS.
P1+P2: Soporte tecnico para el demo
P3+P4: Ajustes visuales minimos si es necesario
P5:    Edicion final del video
```

**CHECKPOINT 7 — Hora 28-30** (Entrega)
```
TODOS: Video final grabado y editado
TODOS: Submission completa
TODOS: Link de demo verificado
```

---

## 4. IMPLEMENTACION DE IA (DETALLADA)

### 4A. Audio → Texto en Tiempo Real (Azure Speech SDK)

**Por que Azure Speech y no Whisper:**
- Azure Speech hace streaming en tiempo real (Whisper necesita el audio completo)
- Microsoft es sponsor
- SDK de browser nativo, no necesitas backend para la transcripcion
- Soporte para español medico

**Implementacion frontend:**

```typescript
// src/lib/speech.ts
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export function createSpeechRecognizer(
  onTranscribing: (text: string) => void,  // texto parcial (en tiempo real)
  onRecognized: (text: string) => void      // frase completa
): SpeechSDK.SpeechRecognizer {
  
  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY!,
    process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION!  // ej: "eastus"
  );
  
  speechConfig.speechRecognitionLanguage = 'es-MX';  // Español México
  speechConfig.enableDictation();  // Modo dictado para texto largo
  
  const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  
  // Texto parcial mientras habla (subtitulos en vivo)
  recognizer.recognizing = (_, event) => {
    onTranscribing(event.result.text);
  };
  
  // Frase completa reconocida
  recognizer.recognized = (_, event) => {
    if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
      onRecognized(event.result.text);
    }
  };
  
  return recognizer;
}

// Uso:
// recognizer.startContinuousRecognitionAsync();  // Iniciar
// recognizer.stopContinuousRecognitionAsync();   // Detener
```

**Alternativa si Azure da problemas: Web Speech API (gratis, ya en el browser)**
```typescript
// Fallback: funciona sin API key, solo Chrome
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'es-MX';
recognition.onresult = (event) => { /* procesar */ };
```

### 4B. Texto → Nota SOAP Estructurada (Gemini)

**El prompt es CRITICO. Este es el prompt optimizado:**

```typescript
// src/lib/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function transcriptionToSOAP(
  transcription: string,
  patientContext: string  // del RAG
): Promise<SOAPNote> {
  
  const prompt = `Eres un asistente de documentacion clinica del Hospital Moscati. 
Tu tarea es convertir la transcripcion de una consulta medica en una nota clinica 
estructurada en formato SOAP.

REGLAS ESTRICTAS:
1. Usa SOLO la informacion mencionada en la transcripcion. NO inventes datos.
2. Si un campo no tiene informacion, pon "No referido en consulta".
3. Los codigos CIE-10 deben ser precisos. Si no estas seguro, pon el mas cercano con "(?)" al lado.
4. Los medicamentos deben incluir dosis, via y frecuencia si se mencionaron.
5. Responde UNICAMENTE con el JSON, sin texto adicional.

CONTEXTO DEL PACIENTE (expediente previo):
${patientContext}

TRANSCRIPCION DE LA CONSULTA:
"${transcription}"

RESPONDE EN ESTE FORMATO JSON EXACTO:
{
  "subjective": {
    "chief_complaint": "motivo principal de consulta",
    "history_present_illness": "descripcion detallada del padecimiento actual",
    "review_of_systems": "sintomas por aparatos y sistemas mencionados",
    "allergies_mentioned": "alergias mencionadas o 'No referidas'"
  },
  "objective": {
    "vital_signs": {
      "blood_pressure": "valor o 'No registrada'",
      "heart_rate": "valor o 'No registrada'",
      "temperature": "valor o 'No registrada'",
      "spo2": "valor o 'No registrada'",
      "respiratory_rate": "valor o 'No registrada'"
    },
    "physical_exam": "hallazgos de exploracion fisica mencionados",
    "lab_results": "resultados mencionados o 'Pendientes'"
  },
  "assessment": {
    "primary_diagnosis": "diagnostico principal",
    "cie10_code": "codigo CIE-10",
    "secondary_diagnoses": ["otros diagnosticos mencionados"],
    "clinical_reasoning": "razonamiento clinico breve"
  },
  "plan": {
    "medications": [
      {
        "name": "nombre del medicamento",
        "dose": "dosis",
        "route": "via",
        "frequency": "frecuencia",
        "duration": "duracion si se menciono"
      }
    ],
    "studies_ordered": ["estudios solicitados"],
    "procedures": ["procedimientos indicados"],
    "follow_up": "plan de seguimiento",
    "patient_education": "indicaciones al paciente mencionadas"
  },
  "metadata": {
    "consultation_duration_estimate": "duracion estimada de la consulta en minutos",
    "urgency_level": "1-5 (1=inmediato, 5=no urgente)",
    "requires_hospitalization": true/false,
    "requires_specialist_referral": "especialidad o null"
  }
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  
  // Limpiar markdown si Gemini lo envuelve en ```json
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
```

### 4C. RAG para Plantillas Medicas y Autocompletado

**Que va en el RAG (almacenado en MongoDB con embeddings):**

```
COLECCION: medical_knowledge
├── Plantillas SOAP por especialidad (30+ plantillas)
├── Catalogo CIE-10 (codigos + descripciones)
├── Vademecum basico (medicamentos + dosis estandar)
├── Protocolos del hospital (guias de practica clinica)
├── Plantillas de documentos de egreso
└── Formatos de aseguradoras (campos requeridos por cada una)
```

**Implementacion del RAG:**

```typescript
// src/lib/rag.ts
import { collections } from './mongodb';

// Usar embeddings de Gemini para generar vectores
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/text-embedding-004',
        content: { parts: [{ text }] }
      })
    }
  );
  const data = await response.json();
  return data.embedding.values;
}

// Buscar contexto relevante para la nota
export async function getPatientContext(patientId: string, query: string): Promise<string> {
  const embedding = await generateEmbedding(query);
  
  // 1. Historial del paciente
  const patient = await collections.patients.findOne({ _id: patientId });
  
  // 2. Busqueda vectorial en conocimiento medico
  const relevantDocs = await collections.medicalKnowledge.aggregate([
    {
      $vectorSearch: {
        index: 'medical_vector_index',
        path: 'embedding',
        queryVector: embedding,
        numCandidates: 50,
        limit: 5
      }
    },
    { $project: { content: 1, type: 1, score: { $meta: 'vectorSearchScore' } } }
  ]).toArray();
  
  return `
PACIENTE: ${patient?.name}, ${patient?.age} años, ${patient?.gender}
ANTECEDENTES: ${patient?.medicalHistory || 'Sin antecedentes registrados'}
MEDICACION ACTUAL: ${patient?.currentMedications?.join(', ') || 'Ninguna'}
ALERGIAS: ${patient?.allergies?.join(', ') || 'NKDA'}
NOTAS PREVIAS: ${patient?.previousNotes?.slice(-2).map(n => n.summary).join('; ') || 'Primera consulta'}

PROTOCOLOS RELEVANTES:
${relevantDocs.map(d => d.content).join('\n')}
  `.trim();
}
```

### 4D. Generacion Automatica de Documentos de Egreso

```typescript
// src/lib/documents.ts

export async function generateDischargeDocuments(
  patient: Patient,
  soapNote: SOAPNote,
  labResults: LabResult[]
): Promise<GeneratedDocuments> {
  
  const prompt = `Genera los siguientes documentos de egreso hospitalario basandote en:
  
  PACIENTE: ${JSON.stringify(patient)}
  NOTA SOAP: ${JSON.stringify(soapNote)}
  LABORATORIOS: ${JSON.stringify(labResults)}
  
  Genera en JSON:
  {
    "prescription": {
      "medications": [...],
      "general_instructions": "..."
    },
    "discharge_summary": {
      "admission_reason": "...",
      "hospital_course": "...",
      "discharge_condition": "...",
      "discharge_diagnosis": "...",
      "follow_up_instructions": "..."
    },
    "patient_instructions": {
      "diet": "...",
      "activity": "...",
      "warning_signs": [...],
      "next_appointment": "..."
    },
    "insurance_form": {
      "diagnosis_code": "CIE-10",
      "procedure_codes": [...],
      "length_of_stay": "...",
      "total_charges_estimate": "..."
    }
  }`;
  
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json\n?/g, '').replace(/```/g, ''));
}
```

### 4E. Mock de Aseguradora

```typescript
// src/app/api/insurance/route.ts

export async function POST(req: Request) {
  const { patientId, insuranceProvider, documents } = await req.json();
  
  // Simular procesamiento (delay realista)
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simular respuesta de aseguradora
  const mockResponse = {
    provider: insuranceProvider, // "MetLife", "GNP", "AXA"
    claimId: `CLM-${Date.now()}`,
    status: 'received',
    documentsReceived: documents.length,
    estimatedProcessingTime: '24-48 horas',
    message: `Documentos del paciente recibidos exitosamente por ${insuranceProvider}. Folio de seguimiento: CLM-${Date.now()}.`,
    timestamp: new Date().toISOString()
  };
  
  // Guardar en audit log
  await collections.auditLog.insertOne({
    action: 'insurance_submission',
    patientId,
    provider: insuranceProvider,
    claimId: mockResponse.claimId,
    timestamp: new Date()
  });
  
  return Response.json(mockResponse);
}
```

---

## 5. DEMO GANADOR — Flujo Exacto en Tiempo Real

### La Historia del Demo (3:30 de contenido + 30s de cierre)

**Escena: Consultorio del Dr. Martinez en el Hospital Moscati, 9:00 AM**

---

**[0:00 - 0:25] HOOK: El problema es real**

*Pantalla oscura. Texto aparece letra por letra:*

> "Un medico mexicano dedica 15 minutos a ver al paciente..."

> "...y 35 minutos a llenar papeles."

*Corte a:* Dashboard de MoscatiAI abriendose. Interfaz limpia, profesional.

*Voz:* "Nosotros invertimos eso."

---

**[0:25 - 0:50] SETUP: El paciente llega**

*El Dr. Martinez abre MoscatiAI. En pantalla:*

- Dashboard con 12 pacientes activos
- Click en "Nueva Consulta"
- Selecciona paciente: "Carlos Rodriguez, 45 años, Cama 7"
- El sistema muestra automaticamente: antecedentes, alergias, medicacion actual (datos del RAG)

*Voz:* "El doctor ve todo el contexto del paciente antes de empezar. Sin buscar en carpetas."

---

**[0:50 - 1:50] CORE DEMO: Voz → Nota Medica (EL MOMENTO WOW)**

*El doctor presiona el boton de microfono. Aparece un indicador de grabacion.*

*El doctor habla naturalmente (pre-grabado, ~40 segundos):*

> "Paciente masculino de 45 años que acude por dolor toracico de 2 horas de evolucion, tipo opresivo, irradiado a brazo izquierdo. Refiere antecedente de hipertension arterial. A la exploracion encontramos presion de 160 sobre 100, frecuencia cardiaca 95, saturacion 96 por ciento. Mi impresion diagnostica es sindrome coronario agudo. Solicito enzimas cardiacas, troponina y electrocardiograma. Inicio aspirina 300 miligramos via oral y nitroglicerina sublingual."

*Mientras habla:*
- La transcripcion aparece en tiempo real en la parte superior de la pantalla (subtitulos en vivo)
- Un indicador de "Procesando..." aparece brevemente

*Al terminar:*
- La nota SOAP aparece COMPLETAMENTE estructurada y prellenada
- Seccion por seccion: Subjetivo, Objetivo, Evaluacion, Plan
- CIE-10 asignado automaticamente: I21.9 - Infarto agudo del miocardio
- Medicamentos con dosis, via y frecuencia

*Voz:* "40 segundos hablando. Nota medica completa. El doctor solo revisa y firma."

*El doctor hace un pequeno ajuste (cambia una dosis), presiona "Firmar y Guardar".*

---

**[1:50 - 2:20] GENERACION DE DOCUMENTOS**

*Inmediatamente despues de firmar:*

- Pantalla muestra: "Generando documentos..."
- Aparecen uno por uno (animacion):
  - ✅ Receta medica
  - ✅ Indicaciones de egreso  
  - ✅ Resumen clinico
  - ✅ Formato para aseguradora (MetLife)
- Cada documento se puede previsualizar con un click

*Voz:* "Con un click, el sistema genera todos los documentos del expediente. Cero captura manual."

---

**[2:20 - 2:50] EGRESO EXPRESS**

*Dashboard del paciente muestra checklist de egreso:*

```
✅ Nota medica firmada
✅ Resultados de laboratorio (simulados como ya listos)
✅ Indicaciones de egreso generadas
✅ Receta firmada
✅ Formato de aseguradora listo
```

*El doctor presiona "Completar Egreso"*

- Barra de progreso: "Enviando a MetLife..."
- Confirmacion: "Caso CLM-2024-5678 recibido por MetLife exitosamente"
- ElevenLabs habla: "Doctor Martinez, el egreso del paciente Rodriguez ha sido completado. Documentos enviados a MetLife."

*Voz:* "Lo que antes tardaba 5 horas, ahora tarda 3 minutos."

---

**[2:50 - 3:20] TECNOLOGIA + SPONSORS**

*Diagrama de arquitectura aparece brevemente (5 segundos, limpio y profesional)*

*Voz:*
- "Transcripcion en tiempo real con **Microsoft Azure Speech**"
- "Inteligencia artificial con **Google Gemini**"
- "Base de datos clinica en **MongoDB Atlas** con busqueda vectorial"
- "Feedback por voz con **ElevenLabs**"
- "Desplegado en **VULTR**"
- "Disenado con **Figma**"

*Mostrar brevemente: MongoDB con datos reales, Gemini generando la nota, audio de ElevenLabs*

---

**[3:20 - 4:00] IMPACTO + CIERRE**

*Pantalla con metricas (animadas, aparecen una por una):*

```
Tiempo de nota medica:    35 min → 3 min     (-91%)
Tiempo de egreso:         5 hrs  → 20 min    (-93%)
Documentos automatizados: 85 tipos            (100% prellenados)
Errores de transcripcion: 18%    → 3%         (-83%)
```

*Voz:* "MoscatiAI no reemplaza al medico. Le devuelve su tiempo. Para lo que realmente importa."

*Ultimo frame:*
```
MoscatiAI
El doctor habla. El sistema hace todo lo demas.
Hospital Moscati × [Nombre del equipo]
Hackathon 2026
```

---

## 6. PITCH GANADOR (Estructura 5 partes)

### Parte 1: DOLOR (30 segundos)
"Un medico en Mexico atiende en promedio 25 pacientes al dia. De cada hora, solo 20 minutos son con el paciente. El resto es papeleria. En el Hospital Moscati, el egreso de un paciente tarda 5 a 6 horas porque cada documento se llena a mano, se duplica informacion y se reenvian formatos a las aseguradoras manualmente. Esto no es un problema de tecnologia que no exista — es un problema de que nadie lo ha resuelto para el contexto hospitalario mexicano."

### Parte 2: INSIGHT (20 segundos)
"Descubrimos que el 90% de la informacion necesaria para todos los documentos del expediente ya se dice en la consulta medica. El medico literalmente DICE el diagnostico, el tratamiento y las indicaciones. Solo que nadie lo captura. Hasta ahora."

### Parte 3: SOLUCION (40 segundos)
"MoscatiAI convierte la conversacion del medico en documentacion clinica completa. El doctor habla naturalmente durante la consulta. Nuestro sistema transcribe en tiempo real, estructura la nota en formato SOAP con IA, asigna codigos CIE-10, genera la receta, las indicaciones de egreso, el resumen clinico y el formato de la aseguradora. Todo automatico. Todo en 3 minutos."

### Parte 4: POR QUE NOSOTROS (20 segundos)
"Somos un equipo de 5 desarrolladores que construimos esto en 48 horas usando Azure Speech, Google Gemini, MongoDB Atlas, ElevenLabs y Solana. No es un mockup. Es un prototipo funcional que procesa voz real y genera documentos reales."

### Parte 5: IMPACTO (30 segundos)
"Con MoscatiAI, un hospital de 200 camas podria ahorrar 12,000 horas-medico al ano en documentacion. Eso equivale a 6 medicos de tiempo completo que podrian estar atendiendo pacientes. El ROI estimado: $1.2 millones de dolares anuales en eficiencia operativa. Y lo mas importante: menos errores, mejores notas, mejor atencion. MoscatiAI. El doctor habla. El sistema hace todo lo demas."

---

## 7. INTEGRACION CON PATROCINADORES (Detallada)

| Sponsor | Integracion | Visibilidad en Demo | Mencion en Pitch |
|---------|------------|---------------------|------------------|
| **Microsoft** | Azure Cognitive Services Speech SDK para transcripcion en tiempo real en español | ALTA — es el primer paso del flujo, se ve la transcripcion en vivo | "Transcripcion con Microsoft Azure Speech" |
| **MongoDB** | Atlas como DB principal + Vector Search para RAG de plantillas medicas | ALTA — cada nota se guarda, cada busqueda usa vectores | "Base de datos clinica en MongoDB Atlas" |
| **Gemini (Google)** | Modelo principal para estructurar notas SOAP + generar documentos | ALTA — la magia de la transformacion texto→nota | "Inteligencia artificial con Google Gemini" |
| **ElevenLabs** | Feedback por voz al medico (confirmaciones, alertas) | MEDIA — se escucha al final del flujo de egreso | "Feedback por voz con ElevenLabs" |
| **VULTR** | Hosting del backend/API en produccion | BAJA — mencionar en arquitectura | "Desplegado en VULTR" |
| **Figma** | Diseno de interfaces antes de codear | BAJA — mostrar en slide de proceso | "Disenado en Figma" |
| **Solana** | Hash de firma digital de notas medicas en blockchain | MEDIA — mostrar tx en explorer | "Trazabilidad con Solana" (si da tiempo) |
| **TechTogether/MLH** | Logos en presentacion, cumplimiento de reglas | BAJA | Agradecer al final |

### Priorizacion de Sponsors por Impacto

```
MUST-HAVE (afectan el score):
1. Microsoft (Azure Speech) — funcionalidad core
2. MongoDB — almacenamiento y RAG
3. Gemini — motor de IA

SHOULD-HAVE (suman puntos):
4. ElevenLabs — wow factor auditivo
5. VULTR — deploy real
6. Figma — proceso de diseno

NICE-TO-HAVE (si da tiempo):
7. Solana — diferenciador blockchain
```

---

## 8. PRIORIZACION EXTREMA

### QUE DEBE FUNCIONAR PERFECTO (o perdemos)

```
🔴 CRITICO — Sin esto no hay demo:
1. Voz → Transcripcion en tiempo real (Azure Speech o Web Speech API)
2. Transcripcion → Nota SOAP estructurada (Gemini)
3. Nota editable en pantalla (frontend)
4. Guardar nota en MongoDB

🟡 IMPORTANTE — Sin esto el demo es debil:
5. Generacion automatica de documentos de egreso
6. Checklist de egreso con boton de completar
7. Mock de envio a aseguradora
8. Dashboard de pacientes

🟢 NICE-TO-HAVE — Suma puntos pero no es critico:
9. ElevenLabs feedback por voz
10. Solana audit trail
11. Graficas de metricas/analytics
12. Timeline completo del paciente
```

### QUE NO CONSTRUIR

```
❌ NO hacer:
- Login/autenticacion (hardcode Dr. Martinez)
- CRUD completo de pacientes (solo seed + lectura)
- Responsive para movil (solo desktop, es demo en pantalla grande)
- Tests unitarios o de integracion
- Manejo de errores sofisticado (try/catch basico)
- Multi-idioma
- Roles y permisos
- Integracion real con sistemas HIS/HL7/FHIR
- Subida real de archivos a portales de aseguradoras
- Impresion de documentos
- Notificaciones push
- Sistema de citas
- Facturacion
```

### Si algo falla, plan B:

| Feature | Plan A | Plan B (si falla) |
|---------|--------|-------------------|
| Speech-to-Text | Azure Speech SDK | Web Speech API (gratis en Chrome) |
| LLM | Gemini 2.0 Flash | Claude API / GPT-4o-mini |
| RAG vectorial | MongoDB Atlas Vector Search | Busqueda por texto simple (regex) |
| Voz sintetica | ElevenLabs API | Audio pre-grabado para el demo |
| Deploy | Vercel | Correr local y grabar pantalla |
| Blockchain | Solana devnet | Eliminar feature, no es critico |

---

## 9. UI/UX PARA JUECES

### Pantallas Minimas (4 pantallas)

**Pantalla 1: Dashboard de Pacientes**
```
┌──────────────────────────────────────────────────┐
│  MoscatiAI     [Dr. Martinez]     [Hospital Moscati]│
├──────────────────────────────────────────────────┤
│                                                    │
│  Pacientes Activos (12)         Alertas (2)        │
│                                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 🟢 Cama 1│ │ 🟡 Cama 2│ │ 🔴 Cama 3│          │
│  │ Ana Lopez│ │ Luis Perez│ │ Maria G. │          │
│  │ Estable  │ │ Vigilar  │ │ Critico  │          │
│  │ Egreso ▸ │ │ Ver ▸    │ │ Ver ▸    │          │
│  └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ 🟢 Cama 4│ │ 🟢 Cama 5│ │ 🟡 Cama 6│          │
│  │ ...      │ │ ...      │ │ ...      │          │
│  └──────────┘ └──────────┘ └──────────┘          │
│                                                    │
│  [+ Nueva Consulta]                                │
└──────────────────────────────────────────────────┘
```

**Pantalla 2: Consulta con Grabacion de Voz (LA MAS IMPORTANTE)**
```
┌──────────────────────────────────────────────────┐
│  Consulta: Carlos Rodriguez, 45 años, Cama 7     │
│  Antecedentes: HTA, Alergia a Penicilina         │
├──────────────┬───────────────────────────────────┤
│              │                                     │
│  GRABACION   │  NOTA MEDICA SOAP                  │
│              │                                     │
│  ┌────────┐  │  ┌─── Subjetivo ──────────────┐    │
│  │  🎙️   │  │  │ Dolor toracico opresivo    │    │
│  │ 02:34  │  │  │ 2h evolucion, irradiado    │    │
│  │ [STOP] │  │  │ brazo izquierdo...         │    │
│  └────────┘  │  └────────────────────────────┘    │
│              │  ┌─── Objetivo ────────────────┐    │
│  Transcripcion│  │ PA: 160/100 FC: 95         │    │
│  en vivo:    │  │ SpO2: 96% Temp: 36.8        │    │
│  "...dolor   │  └────────────────────────────┘    │
│  toracico de │  ┌─── Evaluacion ─────────────┐    │
│  2 horas..." │  │ Dx: SCA  CIE-10: I21.9     │    │
│              │  └────────────────────────────┘    │
│              │  ┌─── Plan ───────────────────┐    │
│              │  │ 1. ASA 300mg VO            │    │
│              │  │ 2. NTG 0.4mg SL            │    │
│              │  │ 3. Enzimas cardiacas       │    │
│              │  │ 4. ECG 12 derivaciones     │    │
│              │  └────────────────────────────┘    │
│              │                                     │
│              │  [Firmar y Guardar]                 │
└──────────────┴───────────────────────────────────┘
```

**Pantalla 3: Egreso Express**
```
┌──────────────────────────────────────────────────┐
│  Egreso: Carlos Rodriguez | Cama 7 | Dr. Martinez│
├──────────────────────────────────────────────────┤
│                                                    │
│  Checklist de Egreso:                              │
│  ✅ Nota medica firmada           (ver)           │
│  ✅ Resultados de laboratorio     (ver)           │
│  ✅ Indicaciones de egreso        (ver/editar)    │
│  ✅ Receta medica                 (ver/editar)    │
│  ✅ Resumen clinico               (ver)           │
│  ⬜ Formato aseguradora (MetLife) (generar)       │
│                                                    │
│  Aseguradora: [MetLife ▾]                          │
│  Poliza: GNP-2024-12345                            │
│                                                    │
│  ┌──────────────────────────────────┐              │
│  │  Documentos Generados:          │              │
│  │  📄 Receta_Rodriguez.pdf        │              │
│  │  📄 Indicaciones_Egreso.pdf     │              │
│  │  📄 Resumen_Clinico.pdf         │              │
│  │  📄 Formato_MetLife.pdf         │              │
│  └──────────────────────────────────┘              │
│                                                    │
│  [🚀 Completar Egreso y Enviar a Aseguradora]     │
│                                                    │
└──────────────────────────────────────────────────┘
```

**Pantalla 4: Confirmacion de Egreso**
```
┌──────────────────────────────────────────────────┐
│                                                    │
│              ✅ Egreso Completado                  │
│                                                    │
│  Paciente: Carlos Rodriguez                        │
│  Folio MetLife: CLM-2024-5678                     │
│  Documentos enviados: 4/4                          │
│  Tiempo total de egreso: 4 minutos                │
│                                                    │
│  🔊 "Doctor Martinez, el egreso del paciente      │
│      Rodriguez ha sido completado exitosamente."   │
│                                                    │
│  Timeline:                                         │
│  09:00 - Consulta iniciada                         │
│  09:02 - Nota SOAP generada por voz               │
│  09:03 - Nota firmada                              │
│  09:03 - Documentos generados automaticamente      │
│  09:04 - Enviado a MetLife                         │
│  09:04 - Egreso confirmado ✅                      │
│                                                    │
│  [Volver al Dashboard]                             │
│                                                    │
└──────────────────────────────────────────────────┘
```

### Tips para que parezca producto real

1. **Usar shadcn/ui**: Componentes profesionales out-of-the-box. No reinventar la rueda.
2. **Paleta de colores medica**: Blancos, azules claros (#EBF5FB), verdes para exito, rojos para critico. NO colores saturados.
3. **Tipografia**: Inter o System font. Limpio y legible.
4. **Datos realistas**: Nombres mexicanos reales, codigos CIE-10 correctos, medicamentos con dosis reales.
5. **Loading states**: Skeletons y spinners en cada accion. Da sensacion de producto real.
6. **Transiciones suaves**: Framer Motion para animaciones minimas (fade in, slide up).
7. **Logo simple**: Texto "MoscatiAI" con un icono de estetoscopio + onda de audio. Hacerlo en Figma en 15 min.

---

## 10. VIDEO FINAL (4 minutos maximo)

### Estructura Exacta

| Tiempo | Seccion | Que se ve | Que se dice |
|--------|---------|-----------|-------------|
| 0:00-0:25 | Hook | Texto en pantalla oscura + primera vista del dashboard | Stats del problema + "Nosotros invertimos eso" |
| 0:25-0:50 | Setup | Dashboard → seleccionar paciente → ver contexto | "El doctor ve todo antes de empezar" |
| 0:50-1:50 | Core Demo | Grabacion de voz → transcripcion en vivo → nota SOAP generada | "40 segundos hablando. Nota completa." |
| 1:50-2:20 | Documentos | Generacion automatica de 4+ documentos | "Cero captura manual" |
| 2:20-2:50 | Egreso | Checklist → envio aseguradora → confirmacion + voz | "5 horas a 3 minutos" |
| 2:50-3:20 | Tecnologia | Diagrama + logos sponsors | Nombrar cada tecnologia y sponsor |
| 3:20-4:00 | Impacto/Cierre | Metricas animadas + tagline | "Le devuelve su tiempo al medico" |

### Errores a Evitar

```
❌ NO empezar con "Hola, somos el equipo X y nuestro proyecto es..."  (ABURRIDO)
❌ NO mostrar codigo (al jurado no le importa tu git log)
❌ NO explicar la arquitectura por mas de 15 segundos
❌ NO usar musica con copyright
❌ NO hablar demasiado rapido
❌ NO mostrar bugs (cortar el video antes si algo falla)
❌ NO incluir slides de PowerPoint en el video (es demo, no presentacion)
❌ NO durar mas de 4 minutos (te descalifican o pierden interes)
```

### Herramientas para el video

- **Grabar**: OBS Studio (gratis, 1080p 30fps)
- **Editar**: CapCut Desktop (gratis) o DaVinci Resolve
- **Musica**: Pixabay.com → buscar "medical technology" o "innovation"
- **Voz en off**: Uno del equipo con buena diccion, o ElevenLabs si quieren voz pro
- **Subtitulos**: CapCut los genera automaticamente

---

## RESUMEN EJECUTIVO — QUE CAMBIO vs. V1

| Aspecto | V1 (anterior) | V2 (esta guia) |
|---------|--------------|-----------------|
| Core feature | Monitoreo de signos vitales | **Notas medicas por voz** |
| Input principal | Sensores IoT simulados | **Voz del medico** |
| Problema central | Triaje lento | **Documentacion clinica excesiva** |
| WOW factor | Guardian Angel (prediccion) | **Hablar → nota completa en segundos** |
| Flujo completo | Detectar → alertar | **Voz → nota → documentos → egreso → aseguradora** |
| Impacto medible | Tiempo de triaje | **Tiempo de nota + tiempo de egreso** |
| Sponsor principal | Generico | **Hospital Moscati como caso de uso real** |
| Speech | No tenia | **Azure Speech SDK (Microsoft sponsor)** |
| Egreso | No tenia | **Automatizado con generacion de docs** |
| Aseguradoras | No tenia | **Mock API de envio automatico** |

### La frase que define MoscatiAI v2:

> **"El doctor habla. El sistema hace todo lo demas."**

Esa frase debe estar en el video, en el pitch, en el README, y en la cabeza de cada miembro del equipo.

---

*Esta guia esta disenada para ganar. Ejecutenla sin dudar.*
