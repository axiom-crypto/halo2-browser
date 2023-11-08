//! Utilities for testing
use std::{fs::File, io::Write};

use halo2_base::{
    gates::{
        circuit::{builder::BaseCircuitBuilder, BaseCircuitParams},
        flex_gate::threads::SinglePhaseCoreManager,
        GateChip, RangeChip,
    },
    halo2_proofs::{
        dev::MockProver, halo2curves::bn256::Fr, plonk::keygen_vk, poly::commitment::Params,
    },
    utils::fs::gen_srs,
    AssignedValue, Context,
};
use itertools::Itertools;

use crate::{halo2lib::Halo2LibWasm, CircuitConfig, Halo2Wasm};

pub fn get_testing_config() -> BaseCircuitParams {
    BaseCircuitParams {
        k: 10,
        num_advice_per_phase: vec![20, 0, 0],
        num_lookup_advice_per_phase: vec![3, 0, 0],
        num_fixed: 1,
        lookup_bits: Some(9),
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
        Self {
            config: get_testing_config(),
        }
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

    pub fn run_gate_with_instances<R>(
        &self,
        f: impl FnOnce(&mut Context<Fr>, &GateChip<Fr>, &mut Vec<AssignedValue<Fr>>) -> R,
    ) -> TestResult {
        self.run_builder_with_instances(|builder, range, instances| {
            f(builder.main(), &range.gate, instances)
        })
    }

    pub fn run_builder<R>(
        &self,
        f: impl FnOnce(&mut SinglePhaseCoreManager<Fr>, &RangeChip<Fr>) -> R,
    ) -> TestResult {
        self.run_builder_with_instances(|builder, range, _| f(builder, range))
    }

    pub fn run_builder_with_instances<R>(
        &self,
        f: impl FnOnce(
            &mut SinglePhaseCoreManager<Fr>,
            &RangeChip<Fr>,
            &mut Vec<AssignedValue<Fr>>,
        ) -> R,
    ) -> TestResult {
        let mut builder = BaseCircuitBuilder::default().use_params(self.config.clone());
        let range = RangeChip::new(
            self.config.lookup_bits.unwrap(),
            builder.lookup_manager().clone(),
        );
        let mut instances = vec![];
        f(builder.pool(0), &range, &mut instances);
        builder.assigned_instances = vec![instances.clone()];
        let assigned_instances = instances.iter().map(|x| *x.value()).collect_vec();

        let params = gen_srs(self.config.k.try_into().unwrap());

        MockProver::run(
            self.config.k.try_into().unwrap(),
            &builder,
            vec![assigned_instances],
        )
        .unwrap()
        .assert_satisfied();

        let vk = keygen_vk(&params, &builder).unwrap().to_bytes(halo2_base::halo2_proofs::SerdeFormat::RawBytesUnchecked);
        let mut file = File::create("vk.bin").unwrap();
        file.write_all(&vk).unwrap();

        TestResult { vk }
    }

    pub fn run_wasm_builder_with_instances<R>(
        &self,
        f: impl FnOnce(&mut Halo2LibWasm, &mut Halo2Wasm) -> R,
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

        f(&mut halo2libwasm, &mut halo2wasm);
        halo2wasm.assign_instances();

        let params = gen_srs(self.config.k.try_into().unwrap());
        let mut buffer: Vec<u8> = Vec::new();
        params.write(&mut buffer).unwrap();
        halo2wasm.load_params(buffer.as_slice());
        halo2wasm.gen_vk();
        let vk = halo2wasm.get_vk();

        TestResult { vk }
    }

    pub fn run_wasm_builder<R>(&self, f: impl FnOnce(&mut Halo2LibWasm) -> R) -> TestResult {
        self.run_wasm_builder_with_instances(|halo2libwasm, _| f(halo2libwasm))
    }
}
