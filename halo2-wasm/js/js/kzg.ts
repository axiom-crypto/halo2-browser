import * as os from "os";
import * as path from "path";
import * as fs from "fs";
import { fetchAndConvertToUint8Array } from "../shared/utils";

export const getKzgParams = async (k: number): Promise<Uint8Array> => {
  const home = os.homedir();
  const axiomSrsPath = path.join(
    home,
    ".axiom",
    "srs",
    "challenge_0085",
    `kzg_bn254_${k}.srs`
  );
  const exists = fs.existsSync(axiomSrsPath);
  if (exists) {
    const buffer = fs.readFileSync(axiomSrsPath);
    return new Uint8Array(buffer);
  }
  const folderPath = path.dirname(axiomSrsPath);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  if (k < 6 || k > 19) {
    throw new Error(`k=${k} is not supported`);
  }
  const srs = await fetchAndConvertToUint8Array(
    `https://axiom-crypto.s3.amazonaws.com/challenge_0085/kzg_bn254_${k}.srs`
  );
  fs.writeFileSync(axiomSrsPath, srs);
  return srs;
};