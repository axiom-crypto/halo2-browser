export interface CircuitConfig {
    k: number;
    numAdvice: number;
    numLookupAdvice: number;
    numInstance: number;
    numLookupBits: number;
    numVirtualInstance: number;
}

export const DEFAULT_CIRCUIT_CONFIG: CircuitConfig = {
    k: 14,
    numAdvice: 4,
    numLookupAdvice: 1,
    numInstance: 1,
    numLookupBits: 13,
    numVirtualInstance: 1
};