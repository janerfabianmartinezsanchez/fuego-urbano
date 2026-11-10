const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const vm = require('vm');

// Leer la librería qrcode
const qrcodeLibPath = path.join(__dirname, 'js', 'qrcode.min.js');
const qrcodeCode = fs.readFileSync(qrcodeLibPath, 'utf8');

// Proveer un mock ligero de DOM para Node.js
const mockContext = {
  window: {},
  document: {
    createElement: (tag) => {
      return {
        width: 0,
        height: 0,
        getContext: () => ({
          fillStyle: '',
          fillRect: () => {}
        })
      };
    }
  },
  console: console
};

vm.createContext(mockContext);
vm.runInContext(qrcodeCode, mockContext);
const QRCode = mockContext.QRCode;

const TARGET_URL = 'https://fuego-urbano-1.vercel.app';
console.log('Generando código QR para URL de Vercel:', TARGET_URL);

// Generar con nivel H (máxima redundancia para soportar logo y máxima legibilidad)
const dummyEl = { appendChild: () => {}, innerHTML: '' };
const qr = new QRCode(dummyEl, {
  text: TARGET_URL,
  width: 256,
  height: 256,
  correctLevel: QRCode.CorrectLevel.H
});

const model = qr.getModel();
const moduleCount = model.getModuleCount();
console.log('Matriz QR generada:', moduleCount, 'x', moduleCount, 'módulos');

// 1. GENERAR SVG VECTORIAL DE ALTA DEFINICIÓN
const quietZone = 4;
const totalGrid = moduleCount + (quietZone * 2);

let svgPathD = '';
for (let r = 0; r < moduleCount; r++) {
  for (let c = 0; c < moduleCount; c++) {
    if (model.isDark(r, c)) {
      svgPathD += `M${c + quietZone},${r + quietZone}h1v1h-1z `;
    }
  }
}

// Logo base64
let logoBase64 = '';
const logoPath = path.join(__dirname, 'assets', 'images', 'logo.jpg');
if (fs.existsSync(logoPath)) {
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = 'data:image/jpeg;base64,' + logoBuffer.toString('base64');
}

// SVG con Branding y Logo Fuego Urbano (Vectorial infinito)
const svgBranded = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${totalGrid * 40} ${totalGrid * 40}" width="2048" height="2048">
  <defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <!-- Fondo blanco puro con esquinas suaves -->
  <rect width="100%" height="100%" fill="#ffffff" rx="60"/>
  
  <!-- Patrón QR de precisión -->
  <g transform="scale(40)">
    <path fill="#0a0c10" d="${svgPathD}"/>
  </g>

  <!-- Insignia Central Fuego Urbano -->
  ${logoBase64 ? `
  <g transform="translate(${(totalGrid * 40) / 2}, ${(totalGrid * 40) / 2})">
    <circle r="${(totalGrid * 40) * 0.125}" fill="#ffffff" filter="url(#shadow)"/>
    <circle r="${(totalGrid * 40) * 0.115}" fill="#0a0c10" stroke="#ff5722" stroke-width="8"/>
    <clipPath id="logoClip">
      <circle r="${(totalGrid * 40) * 0.105}"/>
    </clipPath>
    <image href="${logoBase64}" x="-${(totalGrid * 40) * 0.105}" y="-${(totalGrid * 40) * 0.105}" width="${(totalGrid * 40) * 0.21}" height="${(totalGrid * 40) * 0.21}" clip-path="url(#logoClip)"/>
  </g>
  ` : ''}
</svg>`;

const outSvgPath = path.join(__dirname, 'assets', 'images', 'qr_fuego_urbano_vercel.svg');
fs.writeFileSync(outSvgPath, svgBranded, 'utf8');

// SVG Puro 100% estándar
const svgPure = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalGrid} ${totalGrid}" width="2048" height="2048" shape-rendering="crispEdges">
  <rect width="100%" height="100%" fill="#ffffff"/>
  <path fill="#0a0c10" d="${svgPathD}"/>
</svg>`;
const outSvgPurePath = path.join(__dirname, 'assets', 'images', 'qr_fuego_urbano_pure.svg');
fs.writeFileSync(outSvgPurePath, svgPure, 'utf8');

// 2. GENERAR PNG EN ALTA RESOLUCIÓN (2048 x 2048 px)
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    table[i] = c;
  }
  return table;
}
const crcTable = makeCrcTable();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function createPngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcBody = Buffer.concat([typeBuf, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcBody), 0);

  return Buffer.concat([len, typeBuf, data, crcVal]);
}

const exportSize = 2048;
const scale = exportSize / totalGrid;

const rawData = Buffer.alloc(exportSize * (1 + exportSize * 3));
let offset = 0;

for (let y = 0; y < exportSize; y++) {
  rawData[offset++] = 0; // Filter: None
  const gridY = Math.floor(y / scale);
  const qrRow = gridY - quietZone;

  for (let x = 0; x < exportSize; x++) {
    const gridX = Math.floor(x / scale);
    const qrCol = gridX - quietZone;

    let isBlack = false;
    if (qrRow >= 0 && qrRow < moduleCount && qrCol >= 0 && qrCol < moduleCount) {
      isBlack = model.isDark(qrRow, qrCol);
    }

    const color = isBlack ? 10 : 255;
    rawData[offset++] = color;
    rawData[offset++] = color;
    rawData[offset++] = color;
  }
}

const compressedIdat = zlib.deflateSync(rawData, { level: 9 });
const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(exportSize, 0);
ihdrData.writeUInt32BE(exportSize, 4);
ihdrData[8] = 8;
ihdrData[9] = 2; // RGB
ihdrData[10] = 0;
ihdrData[11] = 0;
ihdrData[12] = 0;

const ihdrChunk = createPngChunk('IHDR', ihdrData);
const idatChunk = createPngChunk('IDAT', compressedIdat);
const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

const finalPng = Buffer.concat([pngSignature, ihdrChunk, idatChunk, iendChunk]);
const outPngPath = path.join(__dirname, 'assets', 'images', 'qr_fuego_urbano_vercel.png');
fs.writeFileSync(outPngPath, finalPng);

// Copiar a la carpeta de artefactos de Gemini
const brainDir = 'C:\\Users\\px\\.gemini\\antigravity\\brain\\ee35876a-de9d-420f-bc25-8b95ce7e866a';
if (fs.existsSync(brainDir)) {
  fs.copyFileSync(outPngPath, path.join(brainDir, 'qr_fuego_urbano_vercel.png'));
  fs.copyFileSync(outSvgPath, path.join(brainDir, 'qr_fuego_urbano_vercel.svg'));
}

console.log('SUCCESS: Archivos generados con éxito.');
console.log('PNG (2048x2048 px):', outPngPath);
console.log('SVG Vectorial:', outSvgPath);
