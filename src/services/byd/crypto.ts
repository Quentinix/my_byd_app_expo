import { Asset } from 'expo-asset';
import CryptoJS from 'crypto-js';

// ==========================================
// 1. CryptoJS-backed Hash & Cipher Functions
// ==========================================

export function md5Hex(str: string): string {
  return CryptoJS.MD5(str).toString().toUpperCase();
}

export function pwdLoginKey(password: string): string {
  return md5Hex(md5Hex(password));
}

export function sha1Mixed(value: string): string {
  const hashHex = CryptoJS.SHA1(value).toString();
  let mixed = '';
  for (let i = 0; i < hashHex.length; i += 2) {
    const byteHex = hashHex.substring(i, i + 2);
    const byteIndex = i / 2;
    if (byteIndex % 2 === 0) {
      mixed += byteHex.toUpperCase();
    } else {
      mixed += byteHex.toLowerCase();
    }
  }

  let filtered = '';
  for (let j = 0; j < mixed.length; j++) {
    const ch = mixed[j];
    if (ch === '0' && j % 2 === 0) {
      continue;
    }
    filtered += ch;
  }
  return filtered;
}

export function buildSignString(fields: Record<string, any>, passwordMD5: string): string {
  const keys = Object.keys(fields).sort();
  const joined = keys
    .map((key) => {
      const val = fields[key];
      return `${key}=${val === null || val === undefined ? "null" : val}`;
    })
    .join("&");
  return `${joined}&password=${passwordMD5}`;
}

export function computeCheckcode(payload: any): string {
  const jsonStr = JSON.stringify(payload);
  const md5Val = CryptoJS.MD5(jsonStr).toString().toLowerCase();
  const b0 = md5Val.substring(0, 8);
  const b1 = md5Val.substring(8, 16);
  const b2 = md5Val.substring(16, 24);
  const b3 = md5Val.substring(24, 32);
  return b3 + b1 + b2 + b0;
}

export function aesEncryptHex(plaintext: string, keyHex: string): string {
  const key = CryptoJS.enc.Hex.parse(keyHex.trim());
  const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.ciphertext.toString().toUpperCase();
}

export function aesDecryptUtf8(cipherHex: string, keyHex: string): string {
  const key = CryptoJS.enc.Hex.parse(keyHex.trim());
  const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: CryptoJS.enc.Hex.parse(cipherHex.trim())
  });
  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(bytes).toString('base64');
}

function base64ToBytes(b64: string): Uint8Array {
  if (typeof atob !== 'undefined') {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(Buffer.from(b64, 'base64'));
}

// ==========================================
// 3. Bangcle Codec Implementation
// ==========================================

export interface BangcleTables {
  inv_round: Uint8Array;
  inv_xor: Uint8Array;
  inv_first: Uint8Array;
  round: Uint8Array;
  xor: Uint8Array;
  final: Uint8Array;
  perm_decrypt: Uint8Array;
  perm_encrypt: Uint8Array;
}

function readUInt16LE(data: Uint8Array, offset: number): number {
  return data[offset] | (data[offset + 1] << 8);
}

function readUInt32LE(data: Uint8Array, offset: number): number {
  return (
    (data[offset] |
      (data[offset + 1] << 8) |
      (data[offset + 2] << 16) |
      (data[offset + 3] << 24)) >>> 0
  );
}

function writeUInt32LE(data: Uint8Array, offset: number, val: number): void {
  data[offset] = val & 0xff;
  data[offset + 1] = (val >> 8) & 0xff;
  data[offset + 2] = (val >> 16) & 0xff;
  data[offset + 3] = (val >> 24) & 0xff;
}

function loadTablesFromBin(data: Uint8Array): BangcleTables {
  const HEADER_SIZE = 8;
  const INDEX_ENTRY_SIZE = 8;

  const magic = String.fromCharCode(data[0], data[1], data[2], data[3]);
  if (magic !== "BGTB") {
    throw new Error(`Magic Bangcle invalide : ${magic}`);
  }

  const count = readUInt16LE(data, 6);
  const tables: Uint8Array[] = [];

  for (let i = 0; i < count; i++) {
    const idxOffset = HEADER_SIZE + i * INDEX_ENTRY_SIZE;
    const offset = readUInt32LE(data, idxOffset);
    const length = readUInt32LE(data, idxOffset + 4);
    tables.push(data.subarray(offset, offset + length));
  }

  return {
    inv_round: tables[0],
    inv_xor: tables[1],
    inv_first: tables[2],
    round: tables[3],
    xor: tables[4],
    final: tables[5],
    perm_decrypt: tables[6],
    perm_encrypt: tables[7],
  };
}

function prepareAesMatrix(inputBlock: Uint8Array, output: Uint8Array): void {
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      output[col * 8 + row] = inputBlock[col + row * 4];
    }
  }
}

function decryptBlockAuth(tables: BangcleTables, block: Uint8Array, roundStart = 1): Uint8Array {
  const state = new Uint8Array(32);
  const temp64 = new Uint8Array(64);
  const tmp32 = new Uint8Array(32);
  const output = new Uint8Array(16);

  prepareAesMatrix(block, state);

  for (let rnd = 9; rnd > Math.max(0, roundStart - 1); rnd--) {
    const l_var21 = rnd * 4;
    let perm_ptr = 0;

    for (let i = 0; i < 4; i++) {
      const b_var3 = tables.perm_decrypt[perm_ptr];
      const l_var16 = i * 8;
      const base = i * 16;

      for (let j = 0; j < 4; j++) {
        const u_var7 = (b_var3 + j) & 3;
        const byte_val = state[l_var16 + u_var7];
        const idx = byte_val + (i + (l_var21 + u_var7) * 4) * 256;
        const value = readUInt32LE(tables.inv_round, idx * 4);
        writeUInt32LE(temp64, base + j * 4, value);
      }
      perm_ptr += 2;
    }

    let i_var15 = 1;
    for (let l_var21_xor = 0; l_var21_xor < 4; l_var21_xor++) {
      let pb_var18_offset = l_var21_xor;

      for (let l_var9_xor = 0; l_var9_xor < 4; l_var9_xor++) {
        const local10 = temp64[pb_var18_offset];
        let u_var6 = local10 & 0xf;
        let u_var26 = local10 & 0xf0;

        const local_f0 = temp64[pb_var18_offset + 0x10];
        const local_f1 = temp64[pb_var18_offset + 0x20];
        const local_f2 = temp64[pb_var18_offset + 0x30];

        const l_var2 = l_var9_xor * 0x18 + rnd * 0x60;
        let i_var25 = i_var15;

        for (let l_var16_inner = 0; l_var16_inner < 3; l_var16_inner++) {
          let b_var3_inner = 0;
          if (l_var16_inner === 0) b_var3_inner = local_f0;
          else if (l_var16_inner === 1) b_var3_inner = local_f1;
          else b_var3_inner = local_f2;

          const u_var1 = (b_var3_inner << 4) & 0xff;
          const u_var27 = u_var6 | u_var1;
          u_var26 = ((u_var26 >> 4) | ((b_var3_inner >> 4) << 4)) & 0xff;

          const idx1 = (l_var2 + (i_var25 - 1)) * 0x100 + u_var27;
          u_var6 = tables.inv_xor[idx1] & 0xf;

          const idx2 = (l_var2 + i_var25) * 0x100 + u_var26;
          const b_var3_new = tables.inv_xor[idx2];
          u_var26 = (b_var3_new & 0xf) << 4;
          i_var25 += 2;
        }

        state[l_var9_xor + l_var21_xor * 8] = (u_var26 | u_var6) & 0xff;
        pb_var18_offset += 4;
      }
      i_var15 += 6;
    }
  }

  if (roundStart === 1) {
    tmp32.set(state.subarray(0, 32));
    let u_var8 = 1, u_var10 = 3, u_var12 = 2;

    for (let row = 0; row < 4; row++) {
      const idx0 = tmp32[row] + row * 0x400;
      state[row] = tables.inv_first[idx0];

      const row1 = u_var10 & 3;
      const idx1 = tmp32[8 + row1] + row1 * 0x400 + 0x100;
      state[8 + row] = tables.inv_first[idx1];

      const row2 = u_var12 & 3;
      const idx2 = tmp32[0x10 + row2] + row2 * 0x400 + 0x200;
      state[0x10 + row] = tables.inv_first[idx2];

      const row3 = u_var8 & 3;
      const idx3 = tmp32[0x18 + row3] + row3 * 0x400 + 0x300;
      state[0x18 + row] = tables.inv_first[idx3];

      u_var8++; u_var10++; u_var12++;
    }
  }

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      output[col + row * 4] = state[col * 8 + row];
    }
  }

  return output;
}

function encryptBlockAuth(tables: BangcleTables, block: Uint8Array, roundEnd = 10): Uint8Array {
  const state = new Uint8Array(32);
  const temp64 = new Uint8Array(64);
  const tmp32 = new Uint8Array(32);
  const output = new Uint8Array(16);

  prepareAesMatrix(block, state);

  const rounds = Math.min(9, Math.max(0, roundEnd));
  for (let rnd = 0; rnd < rounds; rnd++) {
    const l_var21 = rnd * 4;
    let perm_ptr = 0;

    for (let i = 0; i < 4; i++) {
      const b_var4 = tables.perm_encrypt[perm_ptr];
      const l_var16 = i * 8;
      const base = i * 16;

      for (let j = 0; j < 4; j++) {
        const u_var8 = (b_var4 + j) & 3;
        const byte_val = state[l_var16 + u_var8];
        const idx = byte_val + (i + (l_var21 + u_var8) * 4) * 256;
        const value = readUInt32LE(tables.round, idx * 4);
        writeUInt32LE(temp64, base + j * 4, value);
      }
      perm_ptr += 2;
    }

    let i_var16 = 1;
    for (let l_var22 = 0; l_var22 < 4; l_var22++) {
      let pb_var19_offset = l_var22;

      for (let l_var10 = 0; l_var10 < 4; l_var10++) {
        const local10 = temp64[pb_var19_offset];
        let u_var7 = local10 & 0xf;
        let u_var26 = local10 & 0xf0;

        const local_f0 = temp64[pb_var19_offset + 0x10];
        const local_f1 = temp64[pb_var19_offset + 0x20];
        const local_f2 = temp64[pb_var19_offset + 0x30];

        const l_var2 = l_var10 * 0x18 + rnd * 0x60;
        let i_var25 = i_var16;

        for (let l_var17 = 0; l_var17 < 3; l_var17++) {
          let b_var4_inner = 0;
          if (l_var17 === 0) b_var4_inner = local_f0;
          else if (l_var17 === 1) b_var4_inner = local_f1;
          else b_var4_inner = local_f2;

          const u_var1 = (b_var4_inner << 4) & 0xff;
          const u_var27 = u_var7 | u_var1;
          u_var26 = ((u_var26 >> 4) | ((b_var4_inner >> 4) << 4)) & 0xff;

          const idx1 = (l_var2 + (i_var25 - 1)) * 0x100 + u_var27;
          u_var7 = tables.xor[idx1] & 0xf;

          const idx2 = (l_var2 + i_var25) * 0x100 + u_var26;
          const b_var4_new = tables.xor[idx2];
          u_var26 = (b_var4_new & 0xf) << 4;
          i_var25 += 2;
        }

        state[l_var10 + l_var22 * 8] = (u_var26 | u_var7) & 0xff;
        pb_var19_offset += 4;
      }
      i_var16 += 6;
    }
  }

  if (roundEnd === 10) {
    tmp32.set(state.subarray(0, 32));
    let u_var13 = 3, u_var9 = 2, u_var11 = 1, u_var8_enc = 0;

    for (let row = 0; row < 4; row++) {
      const row0 = (u_var8_enc + row) & 3;
      state[row] = tables.final[tmp32[row0] + row0 * 0x400];

      const row1 = (u_var11 + row) & 3;
      state[8 + row] = tables.final[tmp32[8 + row1] + row1 * 0x400 + 0x100];

      const row2 = (u_var9 + row) & 3;
      state[0x10 + row] = tables.final[tmp32[0x10 + row2] + row2 * 0x400 + 0x200];

      const row3 = (u_var13 + row) & 3;
      state[0x18 + row] = tables.final[tmp32[0x18 + row3] + row3 * 0x400 + 0x300];
    }
  }

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      output[col + row * 4] = state[col * 8 + row];
    }
  }

  return output;
}

function decryptCbc(tables: BangcleTables, data: Uint8Array, iv: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  let prev = new Uint8Array(iv);

  for (let offset = 0; offset < data.length; offset += 16) {
    const block = data.subarray(offset, offset + 16);
    const decrypted = decryptBlockAuth(tables, block, 1);

    for (let i = 0; i < 16; i++) {
      decrypted[i] ^= prev[i];
    }
    result.set(decrypted, offset);
    prev = new Uint8Array(block);
  }

  return result;
}

function encryptCbc(tables: BangcleTables, data: Uint8Array, iv: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length);
  let prev = new Uint8Array(iv);

  for (let offset = 0; offset < data.length; offset += 16) {
    const block = new Uint8Array(16);
    block.set(data.subarray(offset, offset + 16));

    for (let i = 0; i < 16; i++) {
      block[i] ^= prev[i];
    }
    const encrypted = encryptBlockAuth(tables, block, 10);
    result.set(encrypted, offset);
    prev = new Uint8Array(encrypted);
  }

  return result;
}

function addPkcs7(buffer: Uint8Array): Uint8Array {
  const padLength = 16 - (buffer.length % 16);
  const padded = new Uint8Array(buffer.length + padLength);
  padded.set(buffer);
  padded.fill(padLength, buffer.length);
  return padded;
}

function stripPkcs7(buffer: Uint8Array): Uint8Array {
  const padLength = buffer[buffer.length - 1];
  return buffer.subarray(0, buffer.length - padLength);
}

export class BangcleCodec {
  private tables: BangcleTables | null = null;

  public async init(): Promise<void> {
    if (this.tables) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const asset = Asset.fromModule(require('../../../assets/bangcle_tables.bin'));
    await asset.downloadAsync();
    const uri = asset.localUri || asset.uri;

    // fetch est compatible universellement (Web + iOS + Android)
    const response = await fetch(uri);
    const arrayBuffer = await response.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    this.tables = loadTablesFromBin(bytes);
  }

  public encodeEnvelope(plaintext: string): string {
    if (!this.tables) throw new Error('BangcleCodec non initialisé');
    const encoder = new TextEncoder();
    const plainBytes = encoder.encode(plaintext);
    const padded = addPkcs7(plainBytes);
    const zeroIv = new Uint8Array(16);
    const ciphertext = encryptCbc(this.tables, padded, zeroIv);
    return 'F' + bytesToBase64(ciphertext);
  }

  public decodeEnvelope(envelope: string): Uint8Array {
    if (!this.tables) throw new Error('BangcleCodec non initialisé');
    let cleaned = envelope.replace(/[\s\t\n\r]/g, '').trim();
    cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');

    if (cleaned.startsWith('F')) {
      cleaned = cleaned.substring(1);
    }
    const remainder = cleaned.length % 4;
    if (remainder !== 0) {
      cleaned += '='.repeat(4 - remainder);
    }

    const ciphertext = base64ToBytes(cleaned);
    const zeroIv = new Uint8Array(16);
    const plaintext = decryptCbc(this.tables, ciphertext, zeroIv);
    return stripPkcs7(plaintext);
  }

  public decodeResponseEnvelope(envelopeStr: string): string {
    const decodedBuffer = this.decodeEnvelope(envelopeStr);
    const decoder = new TextDecoder('utf-8');
    let decodedText = decoder.decode(decodedBuffer).trim();

    if (decodedText.startsWith('F{') || decodedText.startsWith('F[')) {
      decodedText = decodedText.substring(1);
    }
    return decodedText;
  }
}
