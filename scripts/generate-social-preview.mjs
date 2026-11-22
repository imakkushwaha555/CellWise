// Generate the original 1280x640 Cellwise social-preview PNG without extra packages.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const width = 1280;
const height = 640;
const pixels = Buffer.alloc(width * height * 4);
const colors = {
  background: [47, 35, 67, 255],
  tile: [169, 226, 208, 255],
  accent: [244, 189, 103, 255],
  white: [255, 255, 255, 255],
  muted: [226, 218, 237, 255],
  panel: [38, 28, 54, 255],
  line: [116, 100, 139, 255],
};

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const offset = (y * width + x) * 4;
  pixels.set(color, offset);
}

function fillRect(x, y, w, h, color) {
  for (let py = Math.max(0, y); py < Math.min(height, y + h); py++) {
    for (let px = Math.max(0, x); px < Math.min(width, x + w); px++) setPixel(px, py, color);
  }
}

function roundedRect(x, y, w, h, radius, color) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      const cx = Math.max(x + radius, Math.min(px, x + w - radius - 1));
      const cy = Math.max(y + radius, Math.min(py, y + h - radius - 1));
      if ((px - cx) ** 2 + (py - cy) ** 2 <= radius ** 2) setPixel(px, py, color);
    }
  }
}

const glyphs = {
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"],
};

function drawText(text, x, y, scale, color) {
  let cursor = x;
  for (const character of text) {
    const glyph = glyphs[character];
    if (glyph) {
      for (let row = 0; row < glyph.length; row++) {
        for (let col = 0; col < glyph[row].length; col++) {
          if (glyph[row][col] === "1") fillRect(cursor + col * scale, y + row * scale, scale, scale, color);
        }
      }
    }
    cursor += (character === " " ? 3 : 6) * scale;
  }
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

pixels.fill(255);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) setPixel(x, y, colors.background);
}
roundedRect(96, 142, 310, 310, 48, colors.panel);
const tileSize = 58;
const gap = 17;
const margin = 44;
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    roundedRect(
      96 + margin + col * (tileSize + gap),
      142 + margin + row * (tileSize + gap),
      tileSize,
      tileSize,
      9,
      row === 1 && col === 1 ? colors.accent : colors.tile,
    );
  }
}

drawText("CELLWISE", 504, 155, 9, colors.tile);
drawText("A1 FORMULAS FOR WORD TABLES", 504, 258, 3, colors.white);
drawText("A1", 504, 330, 5, colors.accent);

const tableX = 505;
const tableY = 390;
const cellW = 116;
const cellH = 48;
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    const x = tableX + col * cellW;
    const y = tableY + row * cellH;
    fillRect(x, y, cellW - 3, cellH - 3, row === 2 && col === 1 ? colors.accent : colors.panel);
    fillRect(x + 16, y + 20, 42 + col * 8, 5, row === 2 && col === 1 ? colors.background : colors.line);
  }
}
roundedRect(918, 396, 252, 130, 18, colors.panel);
drawText("SUM", 955, 428, 7, colors.tile);
drawText("B2:B5", 955, 480, 4, colors.white);
fillRect(868, 447, 32, 7, colors.accent);
fillRect(891, 437, 9, 27, colors.accent);

const header = Buffer.alloc(13);
header.writeUInt32BE(width, 0);
header.writeUInt32BE(height, 4);
header[8] = 8;
header[9] = 6;
const raw = Buffer.alloc(height * (width * 4 + 1));
for (let y = 0; y < height; y++) {
  const rowOffset = y * (width * 4 + 1);
  raw[rowOffset] = 0;
  pixels.copy(raw, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
}

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  pngChunk("IHDR", header),
  pngChunk("IDAT", deflateSync(raw)),
  pngChunk("IEND", Buffer.alloc(0)),
]);
const output = join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), "assets", "social-preview.png");
writeFileSync(output, png);
console.log(`Generated ${output}`);
