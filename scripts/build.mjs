import { copyFileSync } from 'fs';
import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
import { writeFileSync } from 'fs';
import { deflateSync } from 'zlib';

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
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      pixels[i] = 30 + Math.floor((x / size) * 40);
      pixels[i + 1] = 60 + Math.floor((y / size) * 40);
      pixels[i + 2] = 120 + Math.floor(((x + y) / (size * 2)) * 40);
      pixels[i + 3] = 255;
    }
  }
  const cell = Math.floor(size / 4);
  for (let y = cell; y < cell * 3; y++) {
    for (let x = cell; x < cell * 3; x++) {
      const i = (y * size + x) * 4;
      pixels[i] = 255; pixels[i + 1] = 255; pixels[i + 2] = 255;
    }
  }
  const inner = Math.floor(size / 8);
  for (let y = cell + inner; y < cell * 3 - inner; y++) {
    for (let x = cell + inner; x < cell * 3 - inner; x++) {
      const i = (y * size + x) * 4;
      pixels[i] = 0; pixels[i + 1] = 100; pixels[i + 2] = 180;
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
execSync('npx esbuild src/taskpane.ts --bundle --outfile=dist/taskpane.js', { stdio: 'inherit' });
copyFileSync('taskpane.html', 'dist/taskpane.html');
for (const size of [16, 32, 80]) {
  writeFileSync(`dist/icon-${size}.png`, makeIcon(size));
}
console.log('Build complete.');