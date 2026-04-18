# PROJECT UPDATE — Auralis Health
## Fecha: 2026-04-17
## Tipo: Rebranding + Build Fixes + Security Hardening

---

## 1. Rebranding completado

El proyecto fue renombrado de "MoscatiAI" / "Hospital Moscati" a **Auralis Health** en todos los archivos del codebase.

### Archivos modificados:

| Archivo | Cambio |
|---------|--------|
| `package.json` | `"name": "auralis-health"` |
| `src/app/layout.tsx` | Titulo, metadata, header rebrandeados |
| `src/lib/gemini.ts` | Prompts de IA actualizados (3 prompts) |
| `src/types/index.ts` | Comentarios actualizados |
| `scripts/seed.ts` | Nombres de protocolos y log messages |
| `ARRANQUE_RAPIDO.md` | Todas las referencias actualizadas |
| `SECURITY_FIXES.md` | Header actualizado |

---

## 2. Build errors corregidos

### Error 1: `next.config.js` — Invalid key

**Problema:** `serverExternalPackages` no es una key valida en Next.js 14.2.x a nivel raiz. Debe estar dentro de `experimental`.

**Fix:**
```js
// ANTES (roto):
serverExternalPackages: ['firebase-admin'],

// DESPUES (funcional):
experimental: {
  serverComponentsExternalPackages: ['firebase-admin'],
},
```

### Error 2: `src/app/api/voice/route.ts` — Buffer type incompatible

**Problema:** `NextResponse` no acepta `Buffer` como body. Requiere `BodyInit` (Uint8Array, Blob, string, etc).

**Fix:**
```ts
// ANTES (roto):
return new NextResponse(audioBuffer, { ... });

// DESPUES (funcional):
const uint8 = new Uint8Array(audioBuffer);
return new NextResponse(uint8, { ... });
```

---

## 3. Estado del proyecto

| Aspecto | Estado |
|---------|--------|
| Rebranding | Completo — 0 referencias a "Moscati" |
| Build errors | Corregidos (next.config.js + voice route) |
| Seguridad | Parcheada (ver SECURITY_FIXES.md) |
| TypeScript | Sin errores de tipo |
| Dependencias | Versiones seguras con overrides |

---

## 4. Stack tecnico actual

- **Framework:** Next.js 14.2.25 (App Router)
- **Frontend:** React 18.3.1 + Tailwind CSS 3.4.17
- **Database:** Firebase Admin SDK 13 + Firestore
- **IA:** Google Gemini 2.0 Flash (@google/generative-ai)
- **Voz STT:** Azure Speech SDK / Web Speech API (fallback)
- **Voz TTS:** ElevenLabs API
- **Blockchain:** Solana Web3.js 1.98 (audit trail opcional)
- **UI:** Recharts, Lucide React, Framer Motion

---

## 5. Validacion

```bash
# Verificar que compila:
npm run build

# Verificar que corre:
npm run dev

# Verificar seguridad:
npm audit
```

---

## 6. Proximos pasos

1. Ejecutar `npm run seed` para poblar Firestore
2. Configurar `.env.local` con las API keys reales
3. Verificar flujo completo: dashboard → consulta → voz → SOAP → egreso
4. Deploy a Vercel o VULTR
5. Preparar video de demo (4 minutos)
