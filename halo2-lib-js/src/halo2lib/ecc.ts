import { CircuitValue256 } from "./CircuitValue256";

export interface CircuitBn254Fq2 {
  c0: CircuitValue256;
  c1: CircuitValue256;
}

export interface CircuitBn254G1Affine {
  x: CircuitValue256;
  y: CircuitValue256;
}

export interface CircuitBn254G2Affine {
  x: CircuitBn254Fq2;
  y: CircuitBn254Fq2;
}

export interface CircuitSecp256k1Affine {
  x: CircuitValue256;
  y: CircuitValue256;
}
