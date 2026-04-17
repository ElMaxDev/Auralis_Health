// ============================================
// SEED DE DATOS — DUEÑO: Luis (P5)
// Ejecutar: npm run seed
// Crea pacientes ficticios y conocimiento médico en MongoDB
// ============================================
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://USER:PASS@cluster.mongodb.net/moscati';

async function seed() {
  console.log('🌱 Iniciando seed de MoscatiAI...\n');
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('moscati');

    // Limpiar colecciones
    await db.collection('patients').deleteMany({});
    await db.collection('notes').deleteMany({});
    await db.collection('vitals').deleteMany({});
    await db.collection('alerts').deleteMany({});
    await db.collection('audit_log').deleteMany({});
    await db.collection('medical_knowledge').deleteMany({});
    console.log('🗑️  Colecciones limpiadas');

    // ============================================
    // PACIENTES (10 pacientes realistas mexicanos)
    // ============================================
    const patients = [
      {
        _id: 'pac-001',
        name: 'Carlos Rodríguez Hernández',
        age: 45,
        gender: 'M',
        bed: 'Cama 4',
        status: 'critical',
        triageLevel: 2 as const,
        medicalHistory: 'Hipertensión arterial diagnosticada hace 8 años. Tabaquismo activo (1 cajetilla/día x 20 años). Dislipidemia mixta.',
        currentMedications: ['Losartán 50mg c/12h', 'Atorvastatina 20mg c/24h', 'Aspirina 100mg c/24h'],
        allergies: ['Penicilina', 'Sulfonamidas'],
        insuranceProvider: 'MetLife',
        insurancePolicyNumber: 'ML-2024-78543',
        admissionDate: new Date().toISOString(),
        admissionReason: 'Dolor torácico opresivo de 2 horas de evolución irradiado a brazo izquierdo',
        attendingDoctor: 'Dr. Martínez',
        previousNotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'pac-002',
        name: 'María Elena García López',
        age: 62,
        gender: 'F',
        bed: 'Cama 7',
        status: 'warning',
        triageLevel: 3 as const,
        medicalHistory: 'Diabetes mellitus tipo 2 (15 años). Neuropatía diabética. Retinopatía diabética no proliferativa. Hipotiroidismo.',
        currentMedications: ['Metformina 850mg c/8h', 'Glimepirida 4mg c/24h', 'Insulina Glargina 20 UI c/24h', 'Levotiroxina 100mcg c/24h'],
        allergies: ['NKDA'],
        insuranceProvider: 'GNP',
        insurancePolicyNumber: 'GNP-2024-12390',
        admissionDate: new Date(Date.now() - 86400000).toISOString(),
        admissionReason: 'Descontrol glucémico severo con glucosa de 450 mg/dL',
        attendingDoctor: 'Dr. Martínez',
        previousNotes: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'pac-003',
        name: 'José Luis Ramírez Ortiz',
        age: 38,
        gender: 'M',
        bed: 'Cama 2',
        status: 'stable',
        triageLevel: 4 as const,
        medicalHistory: 'Apendicectomía a los 22 años. Sin enfermedades crónicas conocidas.',
        currentMedications: [],
        allergies: ['NKDA'],
        insuranceProvider: 'AXA',
        insurancePolicyNumber: 'AXA-2024-45678',
        admissionDate: new Date().toISOString(),
        admissionReason: 'Lumbalgia mecánica aguda posterior a esfuerzo físico',
        attendingDoctor: 'Dr. Martínez',
        previousNotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'pac-004',
        name: 'Ana Patricia Morales Vega',
        age: 28,
        gender: 'F',
        bed: 'Cama 9',
        status: 'stable',
        triageLevel: 3 as const,
        medicalHistory: 'Asma bronquial desde la infancia. Rinitis alérgica.',
        currentMedications: ['Salbutamol inhalado PRN', 'Budesonida/Formoterol 200/6mcg c/12h'],
        allergies: ['Ácido acetilsalicílico', 'Polvo de casa'],
        insuranceProvider: 'MetLife',
        insurancePolicyNumber: 'ML-2024-33210',
        admissionDate: new Date().toISOString(),
        admissionReason: 'Crisis asmática moderada que no cede con tratamiento ambulatorio',
        attendingDoctor: 'Dr. Martínez',
        previousNotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'pac-005',
        name: 'Roberto Sánchez Díaz',
        age: 71,
        gender: 'M',
        bed: 'Cama 1',
        status: 'critical',
        triageLevel: 1 as const,
        medicalHistory: 'EPOC Gold III. Cor pulmonale. Fibrilación auricular permanente. Insuficiencia cardíaca NYHA III. Ex-fumador (40 paquetes/año).',
        currentMedications: ['Rivaroxabán 20mg c/24h', 'Furosemida 40mg c/12h', 'Digoxina 0.125mg c/24h', 'Tiotropio 18mcg inhalado c/24h', 'Oxígeno suplementario 2L/min'],
        allergies: ['Metamizol'],
        insuranceProvider: 'IMSS',
        insurancePolicyNumber: 'IMSS-NSS-12345678',
        admissionDate: new Date(Date.now() - 172800000).toISOString(),
        admissionReason: 'Exacerbación aguda de EPOC con insuficiencia respiratoria',
        attendingDoctor: 'Dr. Martínez',
        previousNotes: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'pac-006',
        name: 'Guadalupe Torres Méndez',
        age: 55,
        gender: 'F',
        bed: 'Cama 11',
        status: 'warning',
        triageLevel: 3 as const,
        medicalHistory: 'Hipertensión arterial. Obesidad grado II (IMC 35). Síndrome de apnea obstructiva del sueño.',
        currentMedications: ['Amlodipino 10mg c/24h', 'Hidroclorotiazida 25mg c/24h', 'CPAP nocturno'],
        allergies: ['Ibuprofeno'],
        insuranceProvider: 'GNP',
        insurancePolicyNumber: 'GNP-2024-56789',
        admissionDate: new Date(Date.now() - 43200000).toISOString(),
        admissionReason: 'Cefalea intensa súbita con cifras tensionales de 200/120 mmHg',
        attendingDoctor: 'Dr. Martínez',
        previousNotes: [],
        createdAt: new Date(Date.now() - 43200000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'pac-007',
        name: 'Fernando Ruiz Castillo',
        age: 33,
        gender: 'M',
        bed: 'Cama 5',
        status: 'stable',
        triageLevel: 4 as const,
        medicalHistory: 'Sin antecedentes patológicos de importancia. Deportista recreativo.',
        currentMedications: [],
        allergies: ['NKDA'],
        insuranceProvider: 'AXA',
        insurancePolicyNumber: 'AXA-2024-11223',
        admissionDate: new Date().toISOString(),
        admissionReason: 'Fractura de radio distal derecho por caída durante actividad deportiva',
        attendingDoctor: 'Dr. Martínez',
        previousNotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'pac-008',
        name: 'Sofía Juárez Domínguez',
        age: 42,
        gender: 'F',
        bed: 'Cama 8',
        status: 'stable',
        triageLevel: 3 as const,
        medicalHistory: 'Gastritis crónica. Colecistectomía hace 3 años. Migraña con aura.',
        currentMedications: ['Omeprazol 20mg c/24h', 'Sumatriptán 50mg PRN'],
        allergies: ['Ciprofloxacino'],
        insuranceProvider: 'MetLife',
        insurancePolicyNumber: 'ML-2024-99887',
        admissionDate: new Date().toISOString(),
        admissionReason: 'Dolor abdominal epigástrico intenso con datos de irritación peritoneal',
        attendingDoctor: 'Dr. Martínez',
        previousNotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'pac-009',
        name: 'Miguel Ángel Flores Reyes',
        age: 58,
        gender: 'M',
        bed: 'Cama 3',
        status: 'warning',
        triageLevel: 2 as const,
        medicalHistory: 'Diabetes mellitus tipo 2. Enfermedad renal crónica estadio IIIA. Hipertensión arterial. Gota.',
        currentMedications: ['Insulina NPH 30 UI c/12h', 'Enalapril 10mg c/12h', 'Alopurinol 300mg c/24h', 'Eritropoyetina 4000 UI SC semanal'],
        allergies: ['Contraste yodado'],
        insuranceProvider: 'MetLife',
        insurancePolicyNumber: 'ML-2024-44556',
        admissionDate: new Date(Date.now() - 86400000).toISOString(),
        admissionReason: 'Infección de vías urinarias complicada con datos de sepsis',
        attendingDoctor: 'Dr. Martínez',
        previousNotes: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: 'pac-010',
        name: 'Laura Cristina Peña Aguilar',
        age: 25,
        gender: 'F',
        bed: 'Cama 12',
        status: 'stable',
        triageLevel: 5 as const,
        medicalHistory: 'Ansiedad generalizada. Sin otros antecedentes.',
        currentMedications: ['Sertralina 50mg c/24h'],
        allergies: ['NKDA'],
        insuranceProvider: 'AXA',
        insurancePolicyNumber: 'AXA-2024-77889',
        admissionDate: new Date().toISOString(),
        admissionReason: 'Observación por reacción alérgica a alimento (urticaria generalizada)',
        attendingDoctor: 'Dr. Martínez',
        previousNotes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await db.collection('patients').insertMany(patients);
    console.log(`✅ ${patients.length} pacientes creados`);

    // ============================================
    // ALERTAS INICIALES
    // ============================================
    const alerts = [
      {
        patientId: 'pac-001',
        patientName: 'Carlos Rodríguez Hernández',
        bed: 'Cama 4',
        severity: 'critical' as const,
        type: 'vital_sign' as const,
        message: 'Frecuencia cardíaca elevada: 142 bpm. Posible arritmia.',
        recommendation: 'Realizar ECG inmediato y administrar betabloqueador si no hay contraindicación.',
        acknowledged: false,
        createdAt: new Date().toISOString(),
      },
      {
        patientId: 'pac-005',
        patientName: 'Roberto Sánchez Díaz',
        bed: 'Cama 1',
        severity: 'critical' as const,
        type: 'vital_sign' as const,
        message: 'SpO2 descendiendo: 87%. Requiere ajuste de oxígeno.',
        recommendation: 'Aumentar flujo de O2 a 4L/min. Considerar ventilación no invasiva si no mejora en 15 min.',
        acknowledged: false,
        createdAt: new Date().toISOString(),
      },
      {
        patientId: 'pac-006',
        patientName: 'Guadalupe Torres Méndez',
        bed: 'Cama 11',
        severity: 'high' as const,
        type: 'vital_sign' as const,
        message: 'Presión arterial: 195/115 mmHg. Crisis hipertensiva.',
        recommendation: 'Administrar Captopril 25mg SL. Reevaluar en 30 minutos.',
        acknowledged: false,
        createdAt: new Date().toISOString(),
      },
    ];

    await db.collection('alerts').insertMany(alerts);
    console.log(`✅ ${alerts.length} alertas creadas`);

    // ============================================
    // CONOCIMIENTO MÉDICO PARA RAG
    // ============================================
    const knowledge = [
      {
        type: 'protocol',
        title: 'Protocolo de Síndrome Coronario Agudo',
        content: `PROTOCOLO SCA - HOSPITAL MOSCATI
Ante dolor torácico sugestivo de SCA:
1. ECG 12 derivaciones en < 10 min
2. Troponina I o T de alta sensibilidad
3. BHC, QS, ES, tiempos de coagulación
4. ASA 300mg VO (si no hay alergia)
5. Nitroglicerina 0.4mg SL cada 5 min x 3 dosis
6. Clopidogrel 300mg dosis de carga
7. Heparina no fraccionada o Enoxaparina
8. Oxígeno solo si SpO2 < 90%
CIE-10: I21.0 - I21.9 según localización`,
      },
      {
        type: 'protocol',
        title: 'Protocolo de Descontrol Glucémico',
        content: `PROTOCOLO HIPERGLUCEMIA - HOSPITAL MOSCATI
Glucosa > 300 mg/dL:
1. Insulina rápida según esquema: >300: 8UI, >400: 12UI, >500: 16UI SC
2. Hidratación IV con SSF 0.9% 1000mL en 2h
3. Monitoreo glucémico cada 2 horas
4. Gasometría arterial si glucosa > 400
5. Buscar desencadenante (infección, omisión de dosis, transgresión dietética)
CIE-10: E11.65 - DM2 con hiperglucemia`,
      },
      {
        type: 'protocol',
        title: 'Protocolo de Exacerbación de EPOC',
        content: `PROTOCOLO EAEPOC - HOSPITAL MOSCATI
1. Oxígeno para SpO2 88-92%
2. Salbutamol 2.5mg + Ipratropio 0.5mg nebulizados cada 4-6h
3. Metilprednisolona 40mg IV c/8h x 5 días
4. Antibiótico si esputo purulento: Levofloxacino 750mg IV c/24h
5. Gasometría arterial basal y a las 2h
6. Considerar VNI si pH < 7.35 con PaCO2 > 45
CIE-10: J44.1 - EPOC con exacerbación aguda`,
      },
      {
        type: 'protocol',
        title: 'Protocolo de Crisis Asmática',
        content: `PROTOCOLO ASMA - HOSPITAL MOSCATI
Crisis moderada-severa:
1. Salbutamol 2.5mg nebulizado cada 20 min x 3 dosis
2. Ipratropio 0.5mg nebulizado con primera dosis
3. Metilprednisolona 60-80mg IV
4. Oxígeno para SpO2 > 92%
5. Si no mejora: Sulfato de magnesio 2g IV en 20 min
6. Monitorizar PEF antes y después de cada nebulización
CIE-10: J45.21 - Asma moderada persistente con exacerbación aguda`,
      },
      {
        type: 'cie10',
        title: 'Códigos CIE-10 frecuentes en urgencias',
        content: `CÓDIGOS CIE-10 MÁS USADOS:
I21.9 - Infarto agudo del miocardio, sin especificar
I10 - Hipertensión esencial
E11.65 - DM2 con hiperglucemia
J44.1 - EPOC con exacerbación aguda
J45.21 - Asma moderada con exacerbación
J18.9 - Neumonía no especificada
N39.0 - Infección urinaria, sitio no especificado
K35.80 - Apendicitis aguda no especificada
M54.5 - Lumbago no especificado
S52.50 - Fractura de radio distal
K29.7 - Gastritis no especificada
R10.4 - Dolor abdominal, no especificado
L50.0 - Urticaria alérgica
A41.9 - Sepsis no especificada`,
      },
      {
        type: 'medications',
        title: 'Vademécum básico Hospital Moscati',
        content: `MEDICAMENTOS FRECUENTES:
- Aspirina (ASA): 100-300mg VO. Antiagregante.
- Losartán: 25-100mg VO c/12-24h. Antihipertensivo ARA II.
- Metformina: 500-850mg VO c/8-12h. Antidiabético.
- Omeprazol: 20-40mg VO/IV c/24h. IBP.
- Salbutamol: 2.5-5mg nebulizado. Broncodilatador.
- Insulina Glargina: SC c/24h. Basal.
- Insulina Rápida (Lispro): SC según esquema. Corrección.
- Enoxaparina: 1mg/kg SC c/12h. Anticoagulante.
- Ceftriaxona: 1-2g IV c/24h. Cefalosporina 3a gen.
- Metamizol: 1g IV c/8h. Analgésico/antipirético.
- Ketorolaco: 30mg IV c/8h. AINE. Máx 5 días.
- Metilprednisolona: 40-125mg IV. Corticoide.`,
      },
      {
        type: 'insurance_template',
        title: 'Campos requeridos por aseguradoras',
        content: `FORMATO ESTÁNDAR ASEGURADORAS EN MÉXICO:
Datos del asegurado: nombre completo, póliza, fecha de nacimiento
Datos del padecimiento: fecha de inicio, diagnóstico con CIE-10
Tratamiento: medicamentos administrados, procedimientos realizados
Estancia: fecha ingreso, fecha egreso, días de estancia
Costos: desglose por rubro (hospitalización, medicamentos, estudios, honorarios)
Documentos adjuntos: nota de ingreso, nota de egreso, resultados de laboratorio, estudios de imagen
MetLife: formulario MC-001, requiere firma digital
GNP: formulario GNP-HOSP-2024, requiere sello del hospital
AXA: formato digital vía portal, acepta PDF`,
      },
    ];

    await db.collection('medical_knowledge').insertMany(knowledge);
    console.log(`✅ ${knowledge.length} documentos de conocimiento médico creados`);

    // ============================================
    // SIGNOS VITALES INICIALES (para los pacientes críticos)
    // ============================================
    const now = Date.now();
    const vitals = [];
    for (let i = 0; i < 10; i++) {
      vitals.push(
        {
          patientId: 'pac-001',
          heartRate: 130 + Math.floor(Math.random() * 20),
          bloodPressure: { systolic: 155 + Math.floor(Math.random() * 15), diastolic: 95 + Math.floor(Math.random() * 10) },
          spO2: 94 + Math.floor(Math.random() * 3),
          temperature: 37.2 + Math.random() * 0.5,
          respiratoryRate: 22 + Math.floor(Math.random() * 4),
          timestamp: new Date(now - (9 - i) * 300000).toISOString(), // cada 5 min
        },
        {
          patientId: 'pac-005',
          heartRate: 95 + Math.floor(Math.random() * 10),
          bloodPressure: { systolic: 135 + Math.floor(Math.random() * 10), diastolic: 85 + Math.floor(Math.random() * 5) },
          spO2: 85 + Math.floor(Math.random() * 5),
          temperature: 37.8 + Math.random() * 0.4,
          respiratoryRate: 28 + Math.floor(Math.random() * 6),
          timestamp: new Date(now - (9 - i) * 300000).toISOString(),
        }
      );
    }

    await db.collection('vitals').insertMany(vitals);
    console.log(`✅ ${vitals.length} registros de signos vitales creados`);

    // ============================================
    // CREAR ÍNDICES
    // ============================================
    await db.collection('patients').createIndex({ status: 1, triageLevel: 1 });
    await db.collection('notes').createIndex({ patientId: 1, createdAt: -1 });
    await db.collection('vitals').createIndex({ patientId: 1, timestamp: -1 });
    await db.collection('alerts').createIndex({ acknowledged: 1, createdAt: -1 });
    await db.collection('medical_knowledge').createIndex({ type: 1 });
    // Para RAG con texto (fallback si no hay vector search)
    await db.collection('medical_knowledge').createIndex({ content: 'text' });
    console.log('✅ Índices creados');

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - ${patients.length} pacientes`);
    console.log(`   - ${alerts.length} alertas`);
    console.log(`   - ${knowledge.length} documentos de conocimiento`);
    console.log(`   - ${vitals.length} registros de signos vitales`);
    console.log('\n🚀 Ejecuta: npm run dev');

  } catch (error) {
    console.error('❌ Error en seed:', error);
  } finally {
    await client.close();
  }
}

seed();
