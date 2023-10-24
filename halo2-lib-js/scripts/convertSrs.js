const fs = require('fs');

// Converts some binary to a base64-encoded string
function convertBinToBase64(binPath) {
  const bin = fs.readFileSync(binPath);
  const base64 = Buffer.from(bin).toString('base64');
  return base64;
}

const base64 = convertBinToBase64('./src/lib/kzg/kzg_bn254_16.srs');
fs.writeFileSync('./src/lib/kzg/kzg_bn254_16_b64.ts', 'export const srs = "' + base64 + '"');