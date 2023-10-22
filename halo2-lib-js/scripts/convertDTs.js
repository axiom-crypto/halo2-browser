const fs = require('fs');

const halo2libString = fs.readFileSync('src/shared/docs/halo2Docs.d.ts', 'utf8');
const filteredHalo2libString = halo2libString
  .split('\n')
  .filter(line => !line.trim().startsWith('import'))
  .join('\n')
  .replaceAll("export ", "");

const exportedHalo2libString = `export const halo2Docs = ${JSON.stringify(filteredHalo2libString)};`;
fs.writeFileSync('src/shared/docs/halo2Docs.ts', exportedHalo2libString);
