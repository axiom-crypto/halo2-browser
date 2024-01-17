export interface CircuitScaffoldContext {
  getKzgParams: (k: number) => Promise<Uint8Array>;
}