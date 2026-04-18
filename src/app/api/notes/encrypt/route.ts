/**
 * @file /api/notes/encrypt/route.ts
 * @description Endpoint para persistir notas clinicas cifradas con E2EE.
 *
 * PUT /api/notes/encrypt
 *
 * Recibe el ID de una nota existente junto con su payload cifrado
 * (ciphertext, iv, salt) generado en el cliente mediante AES-GCM 256-bit.
 *
 * Operaciones que realiza:
 *   1. Almacena el payload cifrado en el campo "document_content_encrypted".
 *   2. Elimina los campos "document_content" y "rawTranscription" (texto plano)
 *      para garantizar que el servidor no retenga informacion legible.
 *   3. Actualiza el status de la nota a "signed_e2ee".
 *   4. Registra la operacion en el log de auditoria.
 *
 * @param {string}   noteId              - ID del documento en Firestore.
 * @param {Object}   encrypted           - Payload cifrado.
 * @param {string}   encrypted.ciphertext - Texto cifrado en hexadecimal.
 * @param {string}   encrypted.iv         - Vector de inicializacion en hexadecimal.
 * @param {string}   encrypted.salt       - Salt utilizado en la derivacion de clave.
 */
import { NextRequest, NextResponse } from 'next/server';
import { collections } from '@/lib/firebase';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { noteId, encrypted } = body;

    if (!noteId || !encrypted?.ciphertext || !encrypted?.iv || !encrypted?.salt) {
      return NextResponse.json(
        { success: false, error: 'noteId y datos cifrados (ciphertext, iv, salt) son requeridos' },
        { status: 400 }
      );
    }

    // Reemplazar el contenido legible con el payload cifrado
    await collections.notes().doc(noteId).update({
      document_content_encrypted: {
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        salt: encrypted.salt,
      },
      // Borrar el contenido en texto plano para que no coexistan
      document_content: null,
      rawTranscription: null,
      status: 'signed_e2ee',
      signedAt: new Date().toISOString(),
    });

    // Log de auditoría
    await collections.auditLog().add({
      action: 'note_signed_e2ee',
      noteId,
      details: 'Nota firmada y cifrada con E2EE (AES-GCM 256-bit). Contenido en texto plano eliminado del servidor.',
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, message: 'Nota cifrada y guardada exitosamente.' });
  } catch (error) {
    console.error('Error saving encrypted note:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar nota cifrada' },
      { status: 500 }
    );
  }
}
