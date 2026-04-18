/**
 * @file crypto.ts
 * @description Modulo de cifrado de extremo a extremo (E2EE) para datos clinicos.
 *
 * Implementa cifrado AES-GCM de 256 bits mediante la Web Crypto API nativa
 * del navegador. La derivacion de clave utiliza PBKDF2 con 100,000 iteraciones
 * y SHA-256, lo que dificulta ataques de fuerza bruta.
 *
 * Flujo de cifrado:
 *   1. Se genera un salt aleatorio de 16 bytes y un IV de 12 bytes.
 *   2. Se deriva una clave AES-256 a partir de la contrasena del usuario (PBKDF2).
 *   3. Se cifra el texto plano con AES-GCM usando la clave derivada y el IV.
 *   4. Se retornan el ciphertext, IV y salt codificados en hexadecimal.
 *
 * Flujo de descifrado:
 *   1. Se reconstruyen el salt, IV y ciphertext desde sus representaciones hex.
 *   2. Se vuelve a derivar la clave a partir de la contrasena proporcionada.
 *   3. Se descifra el ciphertext. Si la contrasena es incorrecta, AES-GCM
 *      detecta la manipulacion y lanza un error.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
 */

// ---------------------------------------------------------------------------
// Derivacion de clave
// ---------------------------------------------------------------------------

/**
 * Importa la contrasena del usuario como material criptografico para PBKDF2.
 * @param password - Contrasena en texto plano proporcionada por el usuario.
 * @returns CryptoKey no exportable, utilizable unicamente para derivar claves.
 */
async function getKeyMaterial(password: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );
}

/**
 * Deriva una clave AES-GCM de 256 bits a partir de una contrasena y un salt.
 * Utiliza PBKDF2 con 100,000 iteraciones de SHA-256.
 * @param password - Contrasena del usuario.
 * @param salt     - Salt aleatorio de 16 bytes, unico por operacion de cifrado.
 * @returns CryptoKey lista para cifrar o descifrar.
 */
async function getEncryptionKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await getKeyMaterial(password);
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// ---------------------------------------------------------------------------
// Utilidades de conversion
// ---------------------------------------------------------------------------

/**
 * Convierte un ArrayBuffer a su representacion en cadena hexadecimal.
 * @param buffer - Buffer binario a convertir.
 * @returns Cadena hexadecimal en minusculas (e.g., "a1b2c3...").
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convierte una cadena hexadecimal a un Uint8Array.
 * @param hex - Cadena hexadecimal (longitud par).
 * @returns Uint8Array con los bytes decodificados.
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// ---------------------------------------------------------------------------
// Funciones publicas
// ---------------------------------------------------------------------------

/**
 * Cifra un texto plano utilizando AES-GCM 256-bit con una contrasena.
 *
 * Se genera un salt y un IV aleatorios por cada invocacion, garantizando
 * que el mismo texto plano con la misma contrasena produzca un ciphertext
 * distinto en cada llamada.
 *
 * @param plaintext - Texto a cifrar (e.g., JSON serializado de la nota clinica).
 * @param password  - Contrasena secreta del usuario.
 * @returns Objeto con ciphertext, iv y salt, todos codificados en hexadecimal.
 */
export async function encryptData(
  plaintext: string,
  password: string
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const enc = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const key = await getEncryptionKey(password, salt);
  const encodedData = enc.encode(plaintext);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as any },
    key,
    encodedData as any
  );

  return {
    ciphertext: bufferToHex(encryptedBuffer),
    iv: bufferToHex(iv.buffer),
    salt: bufferToHex(salt.buffer),
  };
}

/**
 * Descifra datos previamente cifrados con encryptData.
 *
 * Si la contrasena es incorrecta o los datos han sido alterados, AES-GCM
 * detectara la inconsistencia en el tag de autenticacion y lanzara un error.
 *
 * @param ciphertextHex - Texto cifrado en hexadecimal.
 * @param ivHex         - Vector de inicializacion en hexadecimal.
 * @param saltHex       - Salt utilizado durante el cifrado, en hexadecimal.
 * @param password      - Contrasena secreta del usuario.
 * @returns Texto plano original descifrado.
 * @throws Error si la contrasena es incorrecta o los datos estan corruptos.
 */
export async function decryptData(
  ciphertextHex: string,
  ivHex: string,
  saltHex: string,
  password: string
): Promise<string> {
  try {
    const salt = hexToBuffer(saltHex);
    const iv = hexToBuffer(ivHex);
    const ciphertext = hexToBuffer(ciphertextHex);

    const key = await getEncryptionKey(password, salt);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as any },
      key,
      ciphertext as any
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch {
    throw new Error("Contrasena incorrecta o datos corruptos.");
  }
}
