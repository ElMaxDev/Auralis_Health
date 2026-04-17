# ARRANQUE RAPIDO — MoscatiAI v2
## Guia para que los 5 empiecen a programar YA

---

## PASO 0: Setup inicial (Aaron hace esto PRIMERO, los demas esperan 5 min)

```bash
# Aaron clona y sube el repo
cd moscati-ai
npm install
git init
git add .
git commit -m "feat: proyecto base MoscatiAI v2"
git remote add origin https://github.com/TU_ORG/moscati-ai.git
git push -u origin main
```

## PASO 1: Todos clonan (minuto 5)

```bash
git clone https://github.com/TU_ORG/moscati-ai.git
cd moscati-ai
npm install
```

## PASO 2: Cada quien crea su rama

```bash
# Aaron:
git checkout -b feat/backend-api

# Max:
git checkout -b feat/ai-engine

# Cris:
git checkout -b feat/dashboard

# Uri:
git checkout -b feat/consulta-egreso

# Luis:
git checkout -b feat/data-seed
```

## PASO 3: Configurar .env.local

Cada quien copia `.env.local` y pone sus keys:
```bash
cp .env.local.example .env.local
# Editar con sus API keys reales
```

**Quien configura que:**
- Aaron: MONGODB_URI (crear cluster en MongoDB Atlas)
- Max: GEMINI_API_KEY + NEXT_PUBLIC_AZURE_SPEECH_KEY/REGION
- Uri: ELEVENLABS_API_KEY
- Todos: Compartir las keys por Discord/Slack privado

## PASO 4: Luis ejecuta el seed (cuando Aaron tenga MongoDB listo)

```bash
npm run seed
```

## PASO 5: Correr el proyecto

```bash
npm run dev
# Abrir http://localhost:3000
```

---

## DONDE EMPIEZA CADA QUIEN

### Aaron — Backend (hora 0)
**Primer archivo que toca:** `src/lib/mongodb.ts`
1. Crear MongoDB Atlas cluster (5 min)
2. Verificar conexion: `npm run dev` y abrir `/api/patients`
3. Revisar que todas las API routes compilen
4. Si algo falla en los endpoints, corregir

**Archivos de Aaron (NO TOCAR si no eres Aaron):**
```
src/lib/mongodb.ts
src/app/api/patients/route.ts
src/app/api/notes/route.ts
src/app/api/egreso/route.ts
src/app/api/insurance/route.ts
src/app/api/alerts/route.ts
src/app/api/chat/route.ts
src/app/api/audit/route.ts
```

### Max — IA/Voz (hora 0)
**Primer archivo que toca:** `src/lib/speech.ts`
1. Obtener Azure Speech key de portal.azure.com
2. Si no hay key Azure en 30 min: USAR WEB SPEECH API (ya esta el fallback)
3. Probar transcripcion: abrir `/consulta?patientId=pac-001`, presionar microfono
4. Obtener Gemini API key de aistudio.google.com
5. Probar que la nota SOAP se genere correctamente
6. Ajustar prompts en `gemini.ts` si la estructura no sale bien

**Archivos de Max (NO TOCAR si no eres Max):**
```
src/lib/speech.ts
src/lib/gemini.ts
src/lib/rag.ts
```

### Cris — Frontend (hora 0)
**Primer archivo que toca:** `src/app/page.tsx`
1. Verificar que `npm run dev` muestre el dashboard
2. Ajustar estilos, colores, layout del dashboard
3. Mejorar PatientCard, AlertBanner, StatsBar
4. Asegurar que la navegacion funcione (click en paciente -> /consulta)

**Archivos de Cris (NO TOCAR si no eres Cris):**
```
src/app/page.tsx
src/app/layout.tsx
src/app/globals.css
src/components/PatientCard.tsx
src/components/AlertBanner.tsx
src/components/StatsBar.tsx
```

### Uri — Consulta + Egreso (hora 0)
**Primer archivo que toca:** `src/components/VoiceRecorder.tsx`
1. Probar que el VoiceRecorder grabe y muestre transcripcion
2. Verificar que SOAPNoteEditor muestre la nota correctamente
3. Probar el flujo completo: voz -> nota -> firmar -> egreso
4. Integrar ElevenLabs cuando tenga la key

**Archivos de Uri (NO TOCAR si no eres Uri):**
```
src/components/VoiceRecorder.tsx
src/components/SOAPNoteEditor.tsx
src/app/consulta/page.tsx
src/app/egreso/page.tsx
src/lib/elevenlabs.ts
src/app/api/voice/route.ts
```

### Luis — Data + Demo (hora 0)
**Primer archivo que toca:** `scripts/seed.ts`
1. Revisar que los datos de pacientes sean realistas
2. Ejecutar `npm run seed` cuando MongoDB este listo
3. Verificar en el dashboard que aparezcan los 10 pacientes
4. Empezar a escribir el guion del video

**Archivos de Luis (NO TOCAR si no eres Luis):**
```
scripts/seed.ts
scripts/simulator.ts  (crear si da tiempo)
```

---

## COMO SE CONECTA TODO (flujo tecnico)

```
USUARIO (doctor) presiona "Nueva Consulta" en el dashboard
         |
         v
[page.tsx] navega a /consulta?patientId=pac-001
         |
         v
[consulta/page.tsx] carga datos del paciente via GET /api/patients
         |
         v
Doctor presiona boton de microfono
         |
         v
[VoiceRecorder.tsx] -> [speech.ts] activa Azure Speech o Web Speech API
         |
         v
Audio se transcribe en tiempo real (texto aparece en pantalla)
         |
         v
Doctor presiona STOP
         |
         v
[consulta/page.tsx] envia POST /api/notes con { transcription, patientId }
         |
         v
[api/notes/route.ts] llama a:
  1. rag.ts -> getPatientContext() -> busca en MongoDB el historial
  2. gemini.ts -> transcriptionToSOAP() -> Gemini genera nota SOAP
  3. Guarda nota en MongoDB
  4. Retorna nota al frontend
         |
         v
[SOAPNoteEditor.tsx] muestra la nota prellenada y editable
         |
         v
Doctor revisa, corrige si necesario, presiona "Firmar y Guardar"
         |
         v
[consulta/page.tsx] marca nota como firmada, registra en /api/audit
         |
         v
Doctor presiona "Continuar a Egreso"
         |
         v
[egreso/page.tsx] muestra checklist
  - Nota firmada ✅
  - Labs listos ✅ (simulado)
  - Docs pendientes ⬜
         |
         v
Doctor presiona "Generar Documentos"
         |
         v
[egreso/page.tsx] envia POST /api/egreso con { patientId }
         |
         v
[api/egreso/route.ts] llama a gemini.ts -> generateDischargeDocuments()
  -> Genera: receta, indicaciones, resumen clinico, formato aseguradora
  -> Retorna todo al frontend
         |
         v
[egreso/page.tsx] muestra documentos generados + checklist completa
         |
         v
Doctor presiona "Completar Egreso y Enviar a Aseguradora"
         |
         v
[egreso/page.tsx] envia POST /api/insurance con { patientId, provider }
         |
         v
[api/insurance/route.ts] simula envio, retorna folio
         |
         v
[egreso/page.tsx] muestra confirmacion + timeline
         |
         v
[elevenlabs.ts] via /api/voice genera audio:
  "Doctor, el egreso del paciente Rodriguez ha sido completado"
         |
         v
Audio se reproduce en el browser. FIN DEL FLUJO.
```

---

## REGLAS DE GIT (CRITICAS)

```bash
# SIEMPRE trabajar en TU rama
git checkout feat/mi-feature

# Commits frecuentes (cada 30-60 min)
git add .
git commit -m "feat: descripcion corta de lo que hice"
git push origin feat/mi-feature

# Para traer cambios de main a tu rama:
git pull origin main
# Si hay conflictos: resuelve y haz commit

# Para mergear tu trabajo a main:
# 1. Push tu rama
# 2. Crear Pull Request en GitHub
# 3. Aaron o tu mismo lo mergeas (no hay code review, es hackathon)
# 4. Los demas hacen: git pull origin main

# NUNCA hacer push directo a main
# NUNCA resolver conflictos eliminando codigo de otro
```

## MERGE SCHEDULE (cuando mergear)

```
Hora 3:  Primer merge de TODOS a main (Aaron coordina)
Hora 6:  Segundo merge — todo debe compilar
Hora 10: Tercer merge — MVP debe funcionar
Hora 14: Cuarto merge — features completos
Hora 18: ULTIMO merge — feature freeze
Hora 22: Code freeze total. Solo hotfixes.
```

---

## SI ALGO FALLA — PLAN B

| Problema | Solucion inmediata |
|----------|-------------------|
| Azure Speech no funciona | Web Speech API ya esta como fallback en speech.ts |
| Gemini API no responde | Cambiar modelo a 'gemini-1.5-flash' en gemini.ts |
| MongoDB no conecta | Verificar IP whitelist en Atlas (0.0.0.0/0 para hackathon) |
| ElevenLabs no genera audio | El egreso usa SpeechSynthesis del browser como fallback |
| El seed falla | Verificar MONGODB_URI en .env.local, verificar conexion |
| Next.js no compila | npm run dev -- --turbo (usa turbopack, mas rapido) |
| Vercel no deploya | Deploy local: npm run build && npm start |

---

## PRIORIDAD HORA 1 (LO MAS IMPORTANTE)

```
Aaron:  MongoDB Atlas conectado + /api/patients retorna datos     = 30 min
Max:    Azure Speech transcribiendo en español O Web Speech API   = 30 min
Luis:   Seed ejecutado, 10 pacientes en la DB                     = 15 min
Cris:   Dashboard mostrando pacientes reales de la DB             = 30 min
Uri:    VoiceRecorder grabando y mostrando texto                  = 30 min
```

Si alguno de estos NO funciona en la hora 1:
**PEDIR AYUDA AL EQUIPO INMEDIATAMENTE. No perder 2 horas solo.**

---

Listo. A ganar. 🏆
