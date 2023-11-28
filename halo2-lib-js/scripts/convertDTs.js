const fs = require('fs');

const halo2libString = fs.readFileSync('src/shared/build.d.ts', 'utf8');
const filteredHalo2libString = halo2libString
  .split('\n')
  .filter(line => !line.trim().startsWith('import'))
  .join('\n')
  .replaceAll("export ", "");
let docs = JSON.stringify(filteredHalo2libString);

const jsExport = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.halo2Docs = void 0;
exports.halo2Docs = ${docs}
`;
const dTsExport = `export declare const halo2Docs = ${docs};`;
fs.writeFileSync('dist/shared/docs.js', jsExport);
fs.writeFileSync('dist/shared/docs.d.ts', dTsExport);
