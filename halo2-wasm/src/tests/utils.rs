//! Utilities for testing
use halo2_base::{
    gates::{
        circuit::{builder::BaseCircuitBuilder, BaseCircuitParams},
        flex_gate::threads::SinglePhaseCoreManager,
        GateChip, RangeChip,
    },
    halo2_proofs::{
        dev::MockProver,
        halo2curves::bn256::Fr, plonk::keygen_vk, poly::commitment::Params,
    },
    Context, utils::fs::gen_srs,
};

use crate::{Halo2Wasm, halo2lib::Halo2LibWasm, CircuitConfig};

pub fn get_testing_config() -> BaseCircuitParams {
    BaseCircuitParams {
        k: 14,
        num_advice_per_phase: vec![4, 0, 0],
        num_lookup_advice_per_phase: vec![1, 0, 0],
        num_fixed: 1,
        lookup_bits: Some(13),
        num_instance_columns: 1,
    }
}

pub struct BaseTester {
    config: BaseCircuitParams,
}

#[derive(Debug, PartialEq)]
pub struct TestResult {
    // pub result: R,
    pub vk: Vec<u8>,
}

impl Default for BaseTester {
    fn default() -> Self {
        Self { config: get_testing_config() }
    }
}

pub fn base_test() -> BaseTester {
    BaseTester::default()
}

impl BaseTester {

    pub fn run<R>(&self, f: impl FnOnce(&mut Context<Fr>, &RangeChip<Fr>) -> R) -> TestResult {
        self.run_builder(|builder, range| f(builder.main(), range))
    }

    pub fn run_gate<R>(&self, f: impl FnOnce(&mut Context<Fr>, &GateChip<Fr>) -> R) -> TestResult {
        self.run(|ctx, range| f(ctx, &range.gate))
    }

    pub fn run_builder<R>(
        &self,
        f: impl FnOnce(&mut SinglePhaseCoreManager<Fr>, &RangeChip<Fr>) -> R,
    ) -> TestResult {
        let mut builder = BaseCircuitBuilder::default().use_params(self.config.clone());
        let range = RangeChip::new(13, builder.lookup_manager().clone());
        f(builder.pool(0), &range);
        let params = gen_srs(self.config.k.try_into().unwrap());

        MockProver::run(self.config.k.try_into().unwrap(), &builder, vec![vec![]]).unwrap().assert_satisfied();

        let vk = keygen_vk(&params, &builder).unwrap().to_bytes(halo2_base::halo2_proofs::SerdeFormat::RawBytesUnchecked);
        TestResult {
            vk,
        }
    }

    pub fn run_wasm_builder<R>(
        &self,
        f: impl FnOnce(&mut Halo2LibWasm) -> R,
    ) -> TestResult {
        let mut halo2wasm = Halo2Wasm::default();

        let config = CircuitConfig {
            k: self.config.k,
            num_advice: self.config.num_advice_per_phase[0],
            num_lookup_advice: self.config.num_lookup_advice_per_phase[0],
            num_instance: self.config.num_instance_columns,
            num_lookup_bits: self.config.lookup_bits.unwrap(),
            num_virtual_instance: 1,
        };
        halo2wasm.config(config);
        let mut halo2libwasm = Halo2LibWasm::new(&halo2wasm);

        f(&mut halo2libwasm);

        let params = gen_srs(self.config.k.try_into().unwrap());
        let mut buffer: Vec<u8> = Vec::new();
        params.write(&mut buffer).unwrap();
        halo2wasm.load_params(buffer.as_slice());
        halo2wasm.gen_vk();
        let vk = halo2wasm.get_vk();
        
        TestResult {
            vk,
        }
    }
}