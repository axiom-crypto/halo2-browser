import { srs as kzg_bn254_14 } from './bin/kzg_bn254_14_b64';
import { srs as kzg_bn254_13 } from './bin/kzg_bn254_13_b64';
import { srs as kzg_bn254_12 } from './bin/kzg_bn254_12_b64';
import { srs as kzg_bn254_11 } from './bin/kzg_bn254_11_b64';
import { srs as kzg_bn254_10 } from './bin/kzg_bn254_10_b64';
import { srs as kzg_bn254_9 } from './bin/kzg_bn254_9_b64';
import { srs as kzg_bn254_8 } from './bin/kzg_bn254_8_b64';
import { srs as kzg_bn254_7 } from './bin/kzg_bn254_7_b64';
import { srs as kzg_bn254_6 } from './bin/kzg_bn254_6_b64';

function fetchAndConvertToUint8Array(url: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    // Check if running in Node.js environment
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      const https = require('https');
      https.get(url, (res: any) => {
        let chunks: any[] = [];
        res.on('data', (chunk: any) => chunks.push(chunk));
        res.on('end', () => {
          let binaryData = Buffer.concat(chunks);
          resolve(new Uint8Array(binaryData));
        });
        res.on('error', reject);
      });
    }
    // Check if running in browser or web worker environment
    else if (typeof window !== 'undefined' || typeof self !== 'undefined') {
      fetch(url)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          resolve(new Uint8Array(buffer));
        })
        .catch(reject);
    } else {
      reject(new Error('Environment not supported'));
    }
  });
}

const convertBase64ToUint8Arr = (b64str: string) => {
  const binstr = atob(b64str);
  const buf = new Uint8Array(binstr.length);
  Array.prototype.forEach.call(binstr, (ch, i) => {
    buf[i] = ch.charCodeAt(0);
  });
  return buf;
}

export const getKzgParams = async (k: number): Promise<Uint8Array> => {
  switch(k){
    case 19:
      return fetchAndConvertToUint8Array("https://axiom-crypto.s3.amazonaws.com/challenge_0078/kzg_bn254_19.srs");
    case 18:
      return fetchAndConvertToUint8Array("https://axiom-crypto.s3.amazonaws.com/challenge_0078/kzg_bn254_18.srs");
    case 17:
      return fetchAndConvertToUint8Array("https://axiom-crypto.s3.amazonaws.com/challenge_0078/kzg_bn254_17.srs");
    case 16:
      return fetchAndConvertToUint8Array("https://axiom-crypto.s3.amazonaws.com/challenge_0078/kzg_bn254_16.srs");
    case 15:
      return fetchAndConvertToUint8Array("https://axiom-crypto.s3.amazonaws.com/challenge_0078/kzg_bn254_15.srs");
    case 14:
      return convertBase64ToUint8Arr(kzg_bn254_14);
    case 13:
      return convertBase64ToUint8Arr(kzg_bn254_13);
    case 12:
      return convertBase64ToUint8Arr(kzg_bn254_12);
    case 11:
      return convertBase64ToUint8Arr(kzg_bn254_11);
    case 10:
      return convertBase64ToUint8Arr(kzg_bn254_10);
    case 9:
      return convertBase64ToUint8Arr(kzg_bn254_9);
    case 8:
      return convertBase64ToUint8Arr(kzg_bn254_8);
    case 7:
      return convertBase64ToUint8Arr(kzg_bn254_7);
    case 6:
      return convertBase64ToUint8Arr(kzg_bn254_6);
    default:
      throw new Error(`k=${k} is not supported`);
  }
};