import { copyFileSync } from 'fs';
import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';
import { join } from 'path';

function crc32(buf) {
  let c, table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = (crc >>> 8) ^ table[(crc ^ b) & 0xff];
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function makeIcon(size) {
  const pixels = Buffer.alloc(size * size * 4);
  const background = [47, 35, 67];
  const tile = [169, 226, 208];
  const accent = [244, 189, 103];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      pixels[i] = background[0];
      pixels[i + 1] = background[1];
      pixels[i + 2] = background[2];
      pixels[i + 3] = 255;
    }
  }
  const margin = Math.floor(size / 6);
  const gap = Math.max(1, Math.floor(size / 20));
  const gridSize = size - margin * 2;
  const cellSize = Math.floor((gridSize - gap * 2) / 3);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const x1 = margin + col * (cellSize + gap);
      const y1 = margin + row * (cellSize + gap);
      const color = row === 1 && col === 1 ? accent : tile;
      for (let y = y1; y < Math.min(y1 + cellSize, size); y++) {
        for (let x = x1; x < Math.min(x1 + cellSize, size); x++) {
          const i = (y * size + x) * 4;
          pixels[i] = color[0];
          pixels[i + 1] = color[1];
          pixels[i + 2] = color[2];
        }
      }
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    pixels.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = deflateSync(raw);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('dist', { recursive: true });
mkdirSync('assets', { recursive: true });
execSync('npx esbuild src/taskpane.ts --bundle --outfile=dist/taskpane.js', { stdio: 'inherit' });
copyFileSync('taskpane.html', 'dist/taskpane.html');
for (const size of [16, 32, 80]) {
  const icon = makeIcon(size);
  writeFileSync(join('assets', `icon-${size}.png`), icon);
  writeFileSync(join('dist', `icon-${size}.png`), icon);
}
console.log('Build complete.');