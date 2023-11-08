#![feature(trait_alias)]

use std::cell::RefCell;
use std::io::BufReader;
use std::rc::Rc;

use halo2_base::{
    gates::circuit::{builder::BaseCircuitBuilder, BaseCircuitParams},
    AssignedValue,
};
pub use halo2_ecc;
use halo2_proofs::{
    dev::MockProver,
    halo2curves::bn256::{Bn256, Fr, G1Affine},
    plonk::*,
    poly::{
        commitment::{Params, ParamsProver},
        kzg::{
            commitment::{KZGCommitmentScheme, ParamsKZG},
            multiopen::VerifierSHPLONK,
            strategy::SingleStrategy,
        },
    },
};
use itertools::{concat, Itertools};
use serde::{Deserialize, Serialize};
use snark_verifier::system::halo2::transcript_initial_state;
use snark_verifier_sdk::{
    halo2::{gen_snark_shplonk, PoseidonTranscript, POSEIDON_SPEC},
    NativeLoader,
};
use tsify::Tsify;
use wasm_bindgen::prelude::*;

pub use halo2_base;
pub use halo2_base::halo2_proofs;

#[cfg(all(target_family = "wasm", feature = "rayon"))]
pub use wasm_bindgen_rayon::init_thread_pool;

pub mod halo2lib;
mod vkey;

#[cfg(test)]
pub mod tests;

use vkey::{write_partial_vkey, PartialVerifyingKey};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console)]
    fn error(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[derive(Tsify, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct CircuitStats {
    advice: usize,
    lookup: usize,
    fixed: usize,
    instance: usize,
    k: usize,
}

#[derive(Tsify, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct CircuitConfig {
    k: usize,
    num_advice: usize,
    num_lookup_advice: usize,
    num_instance: usize,
    num_lookup_bits: usize,
    num_virtual_instance: usize,
}

#[wasm_bindgen]
pub struct Halo2Wasm {
    #[wasm_bindgen(skip)]
    pub circuit: Rc<RefCell<BaseCircuitBuilder<Fr>>>,
    #[wasm_bindgen(skip)]
    pub public: Vec<Vec<AssignedValue<Fr>>>,
    #[wasm_bindgen(skip)]
    pub circuit_params: Option<BaseCircuitParams>,
    params: Option<ParamsKZG<Bn256>>,
    pk: Option<ProvingKey<G1Affine>>,
    vk: Option<VerifyingKey<G1Affine>>,
}

impl Default for Halo2Wasm {
    fn default() -> Self {
        let circuit = BaseCircuitBuilder::new(false);
        Halo2Wasm {
            circuit: Rc::new(RefCell::new(circuit)),
            public: vec![],
            circuit_params: None,
            params: None,
            pk: None,
            vk: None,
        }
    }
}

#[wasm_bindgen]
impl Halo2Wasm {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self::default()
    }

    pub fn clear(&mut self) {
        let circuit_params = self.circuit_params.clone().unwrap();
        let circuit = BaseCircuitBuilder::new(false).use_params(circuit_params);
        let circuit_cell = &self.circuit;
        circuit_cell.replace(circuit);
        self.clear_instances();
    }

    #[wasm_bindgen(js_name = clearInstances)]
    pub fn clear_instances(&mut self) {
        let len = self.public.len();
        self.public = std::iter::repeat_with(std::vec::Vec::new)
            .take(len)
            .collect();
    }

    pub fn verify(&self, proof: &[u8]) {
        let flattened: Vec<AssignedValue<Fr>> = concat(self.public.clone());
        let instances = flattened.iter().map(|x| *x.value()).collect();
        let instances = vec![instances];
        let instances = instances.iter().map(Vec::as_slice).collect_vec();

        let params = self.params.as_ref().unwrap();
        let vk = self.vk.clone().unwrap();

        let verifier_params = params.verifier_params();
        let mut transcript_read =
            PoseidonTranscript::<NativeLoader, &[u8]>::from_spec(proof, POSEIDON_SPEC.clone());

        verify_proof::<KZGCommitmentScheme<Bn256>, VerifierSHPLONK<'_, Bn256>, _, _, _>(
            verifier_params,
            &vk,
            SingleStrategy::new(verifier_params),
            &[&instances],
            &mut transcript_read,
        )
        .unwrap();
    }

    #[wasm_bindgen(js_name = getInstances)]
    pub fn get_instances(&mut self, col: usize) -> Vec<u32> {
        let values: Vec<u32> = self
            .public
            .get(col)
            .unwrap()
            .iter()
            .map(|x| x.cell.unwrap().offset as u32)
            .collect();
        values
    }

    #[wasm_bindgen(js_name = setInstances)]
    pub fn set_instances(&mut self, instances: &[u32], col: usize) {
        let instances: Vec<AssignedValue<Fr>> = instances
            .iter()
            .map(|x| {
                self.circuit
                    .borrow_mut()
                    .main(0)
                    .get((*x).try_into().unwrap())
            })
            .collect();
        let public = self.public.get_mut(col).unwrap();
        public.clear();
        public.extend(instances);
    }

    #[wasm_bindgen(js_name = getInstanceValues)]
    pub fn get_instance_values(&mut self, col: usize) -> JsValue {
        let values: Vec<&Fr> = self
            .public
            .get(col)
            .unwrap()
            .iter()
            .map(|x| x.value())
            .collect();
        let values: Vec<String> = values.iter().map(|x| format!("{x:?}")).collect();
        serde_wasm_bindgen::to_value(&values).unwrap()
    }

    pub fn config(&mut self, config: CircuitConfig) {
        let params = BaseCircuitParams {
            k: config.k,
            num_advice_per_phase: vec![config.num_advice, 0, 0],
            num_lookup_advice_per_phase: vec![config.num_lookup_advice, 0, 0],
            num_fixed: 1,
            lookup_bits: Some(config.num_lookup_bits),
            num_instance_columns: config.num_instance,
        };
        self.circuit_params = Some(params);
        self.public = std::iter::repeat_with(std::vec::Vec::new)
            .take(config.num_virtual_instance)
            .collect();
        self.clear();
    }

    #[wasm_bindgen(js_name = getCircuitStats)]
    pub fn get_circuit_stats(&mut self) -> CircuitStats {
        let statistics = self.circuit.borrow_mut().statistics();
        let advice = statistics.gate.total_advice_per_phase[0];
        let lookup = statistics.total_lookup_advice_per_phase[0];
        let fixed = statistics.gate.total_fixed;
        let k = self.circuit_params.clone().unwrap().k;
        let instance = concat(self.public.clone()).len();

        CircuitStats {
            advice,
            lookup,
            fixed,
            instance,
            k,
        }
    }

    #[wasm_bindgen(js_name = getVk)]
    pub fn get_vk(&self) -> Vec<u8> {
        let file = self
            .vk
            .as_ref()
            .unwrap()
            .to_bytes(halo2_base::halo2_proofs::SerdeFormat::RawBytesUnchecked);
        file
    }

    #[wasm_bindgen(js_name = getPartialVk)]
    pub fn get_partial_vk(&self) -> Vec<u8> {
        let vk = self.vk.as_ref().unwrap();
        let preprocessed = vk
            .fixed_commitments()
            .iter()
            .chain(vk.permutation().commitments().iter())
            .cloned()
            .map(Into::<G1Affine>::into)
            .collect();
        let transcript_initial_state = transcript_initial_state(vk);
        let partial_vk = PartialVerifyingKey {
            preprocessed,
            transcript_initial_state,
        };

        write_partial_vkey(&partial_vk).expect("Write partial vk should not fail")
    }

    #[wasm_bindgen(js_name = getPk)]
    pub fn get_pk(&self) -> Vec<u8> {
        let file = self
            .pk
            .as_ref()
            .unwrap()
            .to_bytes(halo2_base::halo2_proofs::SerdeFormat::RawBytesUnchecked);
        file
    }

    #[wasm_bindgen(js_name = assignInstances)]
    pub fn assign_instances(&mut self) {
        let flattened: Vec<AssignedValue<Fr>> = concat(self.public.clone());
        self.circuit.borrow_mut().assigned_instances = vec![flattened];
    }

    pub fn mock(&mut self) {
        let circuit = &*self.circuit.borrow_mut();
        let flattened: Vec<AssignedValue<Fr>> = concat(self.public.clone());
        let instances = flattened.iter().map(|x| *x.value()).collect();
        MockProver::run(
            self.circuit_params.as_ref().unwrap().k as u32,
            circuit,
            vec![instances],
        )
        .unwrap()
        .assert_satisfied();
    }

    #[wasm_bindgen(js_name = loadParams)]
    pub fn load_params(&mut self, params: &[u8]) {
        let params = ParamsKZG::<Bn256>::read(&mut BufReader::new(params)).unwrap();
        self.params = Some(params);
    }

    #[wasm_bindgen(js_name = loadVk)]
    pub fn load_vk(&mut self, vk: &[u8]) {
        let vk_reader = &mut BufReader::new(vk);
        let params = self.circuit_params.clone().unwrap();
        let vk = VerifyingKey::<G1Affine>::read::<BufReader<&[u8]>, BaseCircuitBuilder<Fr>>(
            vk_reader,
            halo2_base::halo2_proofs::SerdeFormat::RawBytesUnchecked,
            params,
        )
        .unwrap();
        self.vk = Some(vk);
    }

    #[wasm_bindgen(js_name = loadPk)]
    pub fn load_pk(&mut self, pk: &[u8]) {
        let pk_reader = &mut BufReader::new(pk);
        let params = self.circuit_params.clone().unwrap();
        let pk = ProvingKey::<G1Affine>::read::<BufReader<&[u8]>, BaseCircuitBuilder<Fr>>(
            pk_reader,
            halo2_base::halo2_proofs::SerdeFormat::RawBytesUnchecked,
            params,
        )
        .unwrap();
        self.pk = Some(pk);
    }

    #[wasm_bindgen(js_name = genVk)]
    pub fn gen_vk(&mut self) {
        let params = self.params.as_ref().unwrap();
        let vk = keygen_vk(params, &*self.circuit.borrow()).expect("vk should not fail");
        self.vk = Some(vk);
    }

    #[wasm_bindgen(js_name = genPk)]
    pub fn gen_pk(&mut self) {
        let vk = self.vk.clone().unwrap();
        let params = self.params.as_ref().unwrap();
        let pk = keygen_pk(params, vk, &*self.circuit.borrow()).expect("pk should not fail");
        self.pk = Some(pk);
    }

    pub fn prove(&self) -> Vec<u8> {
        let params = self.params.as_ref().unwrap();
        let pk = self.pk.as_ref().unwrap();
        let circuit = self.circuit.borrow().deep_clone();
        let snark = gen_snark_shplonk(params, pk, circuit, None::<&str>);
        snark.proof
    }

    /// For console logging only.
    pub unsafe fn log(&self, a: String) {
        console_log!("{}", a);
    }
}

#[wasm_bindgen(js_name = initPanicHook)]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}
