use wasm_bindgen::prelude::*;
use std::{cell::RefCell, sync::Arc};
use halo2_base::gates::circuit::builder::BaseCircuitBuilder;
use halo2_base::gates::flex_gate::{GateChip, GateInstructions};
use halo2_base::halo2_proofs::halo2curves::bn256::Fr;

use halo2_wasm::Halo2Wasm;

#[wasm_bindgen]
pub struct MyCircuit {
    // Add whatever other chips you need here
    gate: GateChip<Fr>,
    builder: Arc<RefCell<BaseCircuitBuilder<Fr>>>,
}

#[wasm_bindgen]
impl MyCircuit {
    #[wasm_bindgen(constructor)]
    pub fn new(circuit: &Halo2Wasm) -> Self {
        let gate = GateChip::new();
        MyCircuit {
            gate,
            builder: Arc::clone(&circuit.circuit),
        }
    }

    pub fn run(&mut self) {
        // Replace with your circuit, making sure to use `self.builder`
        let a = self.builder.borrow_mut().main(0).load_witness(Fr::from(1u64));
        let b = self.builder.borrow_mut().main(0).load_witness(Fr::from(2u64));
        self.gate.add(self.builder.borrow_mut().main(0), a, b);
    }

}