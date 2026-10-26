import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Table for CRC-32 calculation
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcPayload = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcPayload);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, crcPayload, crcBuf]);
}

export function createSchoolSoulPng(width: number, height: number, isMaskable: boolean = false): Buffer {
  const pngSig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // standard filter
  ihdrData[12] = 0; // no interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw image scanlines
  const bytesPerPixel = 4;
  const stride = 1 + width * bytesPerPixel;
  const rawData = Buffer.alloc(height * stride);

  const centerX = width / 2;
  const centerY = height / 2;
  const maxR = width / 2;
  const safeMargin = isMaskable ? 0.75 : 0.88;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * stride;
    rawData[rowOffset] = 0; // Filter byte 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;
      const dx = (x - centerX) / (maxR * safeMargin);
      const dy = (y - centerY) / (maxR * safeMargin);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // SchoolSoul Dark Blue/Slate Palette
      let r = 11;
      let g = 21;
      let b = 40;
      let a = 255;

      // Radial subtle glow around center
      if (dist < 1.0) {
        const glow = Math.max(0, 1 - dist);
        r = Math.min(255, Math.round(11 + glow * 25));
        g = Math.min(255, Math.round(21 + glow * 40));
        b = Math.min(255, Math.round(40 + glow * 70));
      }

      // Golden Heart Emblem in the center
      // Heart equation: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
      const hx = (x - centerX) / (width * 0.28 * safeMargin);
      const hy = -(y - (centerY + height * 0.04)) / (height * 0.28 * safeMargin);
      const heartEq = Math.pow(hx * hx + hy * hy - 0.7, 3) - hx * hx * Math.pow(hy, 3);

      if (heartEq <= 0.05) {
        // Gold / Amber radiant gradient
        const t = Math.max(0, Math.min(1, (hy + 0.8) / 1.6));
        r = Math.round(245 * (1 - t * 0.3) + 254 * (t * 0.3));
        g = Math.round(183 * (1 - t * 0.4) + 215 * (t * 0.4));
        b = Math.round(49 * (1 - t * 0.5) + 30 * (t * 0.5));
      } else if (heartEq <= 0.2) {
        // Golden accent border
        r = 217;
        g = 138;
        b = 27;
      }

      // Open Book Wings at bottom
      const bx = Math.abs(x - centerX) / (width * 0.35 * safeMargin);
      const by = (y - (centerY + height * 0.22)) / (height * 0.18 * safeMargin);
      if (bx >= 0.1 && bx <= 0.9 && by >= 0.0 && by <= 0.5 - bx * 0.3) {
        r = 29;
        g = 78;
        b = 216; // Vibrant blue wing
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([pngSig, ihdrChunk, idatChunk, iendChunk]);
}

function main() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. 192x192 Icon
  const png192 = createSchoolSoulPng(192, 192, false);
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);
  console.log('✓ Generated public/pwa-192x192.png');

  // 2. 512x512 Icon
  const png512 = createSchoolSoulPng(512, 512, false);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);
  console.log('✓ Generated public/pwa-512x512.png');

  // 3. 512x512 Maskable Icon
  const maskable512 = createSchoolSoulPng(512, 512, true);
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), maskable512);
  console.log('✓ Generated public/pwa-maskable-512x512.png');

  // 4. Apple Touch Icon (180x180)
  const apple180 = createSchoolSoulPng(180, 180, false);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), apple180);
  console.log('✓ Generated public/apple-touch-icon.png');
}

main();
