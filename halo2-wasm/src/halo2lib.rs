use std::rc::Rc;
use std::{cell::RefCell, str::FromStr};

use halo2_base::{
    gates::{
        circuit::builder::BaseCircuitBuilder,
        flex_gate::{GateChip, GateInstructions},
        range::{RangeChip, RangeInstructions},
    },
    halo2_proofs::{arithmetic::CurveAffine, halo2curves::ff::PrimeField},
    poseidon::hasher::{spec::OptimizedPoseidonSpec, PoseidonHasher},
    utils::{biguint_to_fe, fe_to_biguint, modulus},
    AssignedValue, Context,
    QuantumCell::{Constant, Existing},
};
use itertools::Itertools;
use num_bigint::BigUint;
use num_integer::Integer;
use num_traits::One;
use wasm_bindgen::prelude::*;

use crate::Halo2Wasm;

pub mod ecc;

pub const T: usize = 3;
pub const RATE: usize = 2;
pub const R_F: usize = 8;
pub const R_P: usize = 57;
pub const SECURE_MDS: usize = 0;
type Fr = ecc::Bn254Fr;
// TODO: use wasm_bindgen to sync with js CircuitValue type
type JsCircuitValue = usize;

#[wasm_bindgen]
pub struct Halo2LibWasm {
    gate: GateChip<Fr>,
    range: RangeChip<Fr>,
    builder: Rc<RefCell<BaseCircuitBuilder<Fr>>>,
}

#[wasm_bindgen]
impl Halo2LibWasm {
    #[wasm_bindgen(constructor)]
    pub fn new(circuit: &Halo2Wasm) -> Self {
        let gate = GateChip::new();
        let lookup_bits = circuit.circuit_params.clone().unwrap().lookup_bits.unwrap();
        let range = RangeChip::new(
            lookup_bits,
            circuit.circuit.borrow().lookup_manager().clone(),
        );
        Halo2LibWasm {
            gate,
            range,
            builder: Rc::clone(&circuit.circuit),
        }
    }

    pub fn config(&mut self) {
        let gate = GateChip::new();
        let lookup_bits = self.builder.borrow().config_params.lookup_bits.unwrap();
        let range = RangeChip::new(
            lookup_bits,
            self.builder.borrow_mut().lookup_manager().clone(),
        );
        self.gate = gate;
        self.range = range;
    }

    fn get_assigned_value(&self, idx: usize) -> AssignedValue<Fr> {
        self.builder.borrow().core().phase_manager[0]
            .threads
            .last()
            .unwrap()
            .get(idx as isize)
    }

    fn get_assigned_values(&self, a: &[u32]) -> Vec<AssignedValue<Fr>> {
        a.iter()
            .map(|x| self.get_assigned_value(*x as usize))
            .collect()
    }

    fn to_js_assigned_value(&self, a: AssignedValue<Fr>) -> usize {
        a.cell.unwrap().offset
    }

    fn to_js_assigned_values(&self, a: Vec<AssignedValue<Fr>>) -> Vec<u32> {
        let idxs: Vec<u32> = a.iter().map(|x| x.cell.unwrap().offset as u32).collect();
        idxs
    }

    pub fn add(&mut self, a: usize, b: usize) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let out = self.gate.add(self.builder.borrow_mut().main(0), a, b);
        self.to_js_assigned_value(out)
    }

    pub fn sub(&mut self, a: usize, b: usize) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let out = self.gate.sub(self.builder.borrow_mut().main(0), a, b);
        self.to_js_assigned_value(out)
    }

    pub fn neg(&mut self, a: usize) -> usize {
        let a = self.get_assigned_value(a);
        let out = self.gate.neg(self.builder.borrow_mut().main(0), a);
        self.to_js_assigned_value(out)
    }

    pub fn mul(&mut self, a: usize, b: usize) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let out = self.gate.mul(self.builder.borrow_mut().main(0), a, b);
        self.to_js_assigned_value(out)
    }

    pub fn mul_add(&mut self, a: usize, b: usize, c: usize) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let c = self.get_assigned_value(c);
        let out = self
            .gate
            .mul_add(self.builder.borrow_mut().main(0), a, b, c);
        self.to_js_assigned_value(out)
    }

    pub fn mul_not(&mut self, a: usize, b: usize) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let out = self.gate.mul_not(self.builder.borrow_mut().main(0), a, b);
        self.to_js_assigned_value(out)
    }

    pub fn assert_bit(&mut self, a: usize) {
        let a = self.get_assigned_value(a);
        self.gate.assert_bit(self.builder.borrow_mut().main(0), a);
    }

    pub fn div_unsafe(&mut self, a: usize, b: usize) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let out = self
            .gate
            .div_unsafe(self.builder.borrow_mut().main(0), a, b);
        self.to_js_assigned_value(out)
    }

    pub fn assert_is_const(&mut self, a: usize, b: &str) {
        let a = self.get_assigned_value(a);
        let x = Fr::from_str_vartime(b).unwrap();
        self.gate
            .assert_is_const(self.builder.borrow_mut().main(0), &a, &x);
    }

    pub fn inner_product(&mut self, a: &[u32], b: &[u32]) -> usize {
        let a = self.get_assigned_values(a);
        let b = self.get_assigned_values(b);
        let out = self.gate.inner_product(
            self.builder.borrow_mut().main(0),
            a,
            b.iter().map(|x| Existing(*x)).collect_vec(),
        );
        self.to_js_assigned_value(out)
    }

    pub fn sum(&mut self, a: &[u32]) -> usize {
        let a = self.get_assigned_values(a);
        let out = self.gate.sum(self.builder.borrow_mut().main(0), a);
        self.to_js_assigned_value(out)
    }

    pub fn and(&mut self, a: usize, b: usize) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let out = self.gate.and(self.builder.borrow_mut().main(0), a, b);
        self.to_js_assigned_value(out)
    }

    pub fn or(&mut self, a: usize, b: usize) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let out = self.gate.or(self.builder.borrow_mut().main(0), a, b);
        self.to_js_assigned_value(out)
    }

    pub fn not(&mut self, a: usize) -> usize {
        let a = self.get_assigned_value(a);
        let out = self.gate.not(self.builder.borrow_mut().main(0), a);
        self.to_js_assigned_value(out)
    }

    pub fn dec(&mut self, a: usize) -> usize {
        let a = self.get_assigned_value(a);
        let out = self.gate.dec(self.builder.borrow_mut().main(0), a);
        self.to_js_assigned_value(out)
    }

    pub fn select(&mut self, a: usize, b: usize, sel: usize) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let sel = self.get_assigned_value(sel);
        let out = self
            .gate
            .select(self.builder.borrow_mut().main(0), a, b, sel);
        self.to_js_assigned_value(out)
    }

    pub fn or_and(&mut self, a: usize, b: usize, c: usize) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let c = self.get_assigned_value(c);
        let out = self.gate.or_and(self.builder.borrow_mut().main(0), a, b, c);
        self.to_js_assigned_value(out)
    }

    pub fn bits_to_indicator(&mut self, a: &[u32]) -> Vec<u32> {
        let a = self.get_assigned_values(a);
        let out = self
            .gate
            .bits_to_indicator(self.builder.borrow_mut().main(0), &a);
        self.to_js_assigned_values(out)
    }

    pub fn idx_to_indicator(&mut self, a: usize, b: &str) -> Vec<u32> {
        let a = self.get_assigned_value(a);
        let b: usize = b.parse().unwrap();
        let out = self
            .gate
            .idx_to_indicator(self.builder.borrow_mut().main(0), a, b);
        self.to_js_assigned_values(out)
    }

    pub fn select_by_indicator(&mut self, a: &[u32], indicator: &[u32]) -> usize {
        let a = self.get_assigned_values(a);
        let indicator = self.get_assigned_values(indicator);
        let out = self
            .gate
            .select_by_indicator(self.builder.borrow_mut().main(0), a, indicator);
        self.to_js_assigned_value(out)
    }

    pub fn select_from_idx(&mut self, a: &[u32], idx: usize) -> usize {
        let a = self.get_assigned_values(a);
        let idx = self.get_assigned_value(idx);
        let out = self
            .gate
            .select_from_idx(self.builder.borrow_mut().main(0), a, idx);
        self.to_js_assigned_value(out)
    }

    pub fn is_zero(&mut self, a: usize) -> usize {
        let a = self.get_assigned_value(a);
        let out = self.gate.is_zero(self.builder.borrow_mut().main(0), a);
        self.to_js_assigned_value(out)
    }

    pub fn is_equal(&mut self, a: usize, b: usize) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let out = self.gate.is_equal(self.builder.borrow_mut().main(0), a, b);
        self.to_js_assigned_value(out)
    }

    pub fn num_to_bits(&mut self, a: usize, num_bits: &str) -> Vec<u32> {
        let a = self.get_assigned_value(a);
        let num_bits: usize = num_bits.parse().unwrap();
        let out = self
            .gate
            .num_to_bits(self.builder.borrow_mut().main(0), a, num_bits);
        self.to_js_assigned_values(out)
    }

    pub fn constrain_equal(&mut self, a: usize, b: usize) {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        self.builder.borrow_mut().main(0).constrain_equal(&a, &b);
    }

    pub fn range_check(&self, a: usize, b: &str) {
        let a = self.get_assigned_value(a);
        let b: usize = b.parse().unwrap();
        self.range
            .range_check(self.builder.borrow_mut().main(0), a, b);
    }

    pub fn check_less_than(&mut self, a: usize, b: usize, size: &str) {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let size: usize = size.parse().unwrap();
        self.range
            .check_less_than(self.builder.borrow_mut().main(0), a, b, size);
    }

    pub fn check_less_than_safe(&mut self, a: usize, b: &str) {
        let a = self.get_assigned_value(a);
        let b: u64 = b.parse().unwrap();
        self.range
            .check_less_than_safe(self.builder.borrow_mut().main(0), a, b);
    }

    pub fn is_less_than(&mut self, a: usize, b: usize, size: &str) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let size: usize = size.parse().unwrap();
        let out = self
            .range
            .is_less_than(self.builder.borrow_mut().main(0), a, b, size);
        self.to_js_assigned_value(out)
    }

    pub fn is_less_than_safe(&mut self, a: usize, b: &str) -> usize {
        let a = self.get_assigned_value(a);
        let b: u64 = b.parse().unwrap();
        let out = self
            .range
            .is_less_than_safe(self.builder.borrow_mut().main(0), a, b);
        self.to_js_assigned_value(out)
    }

    pub fn div_mod(&mut self, a: usize, b: &str, size: &str) -> Vec<u32> {
        let a = self.get_assigned_value(a);
        let b = BigUint::from_str(b).unwrap();
        let size: usize = size.parse().unwrap();
        let out = self
            .range
            .div_mod(self.builder.borrow_mut().main(0), a, b, size);
        let out = vec![out.0, out.1];
        self.to_js_assigned_values(out)
    }

    /// Returns a 256-bit hi-lo pair from a single CircuitValue
    /// 
    /// See `check_hi_lo` for what is constrained.
    /// 
    /// * `a`: the CircuitValue to split into hi-lo
    pub fn to_hi_lo(&mut self, a: usize) -> Vec<u32> {
        let a = self.get_assigned_value(a);
        let a_val = a.value();
        let a_bytes = a_val.to_bytes();

        let mut a_lo_bytes = [0u8; 32];
        let mut a_hi_bytes = [0u8; 32];
        a_lo_bytes[..16].copy_from_slice(&a_bytes[..16]);
        a_hi_bytes[..16].copy_from_slice(&a_bytes[16..]);
        let a_lo = Fr::from_bytes(&a_lo_bytes).unwrap();
        let a_hi = Fr::from_bytes(&a_hi_bytes).unwrap();

        let a_lo = self.builder.borrow_mut().main(0).load_witness(a_lo);
        let a_hi = self.builder.borrow_mut().main(0).load_witness(a_hi);

        let a_reconstructed = self.check_hi_lo(a_hi, a_lo);

        self.builder
            .borrow_mut()
            .main(0)
            .constrain_equal(&a, &a_reconstructed);

        let out = vec![a_hi, a_lo];
        self.to_js_assigned_values(out)
    }

    /// Returns a single CircuitValue from a hi-lo pair
    /// 
    /// NOTE: this can fail if the hi-lo pair is greater than the Fr modulus.
    /// See `check_hi_lo` for what is constrained.
    /// 
    /// * `hi`: the high 128 bits of the CircuitValue
    /// * `lo`: the low 128 bits of the CircuitValue
    pub fn from_hi_lo(&mut self, hi: usize, lo: usize) -> usize {
        let hi = self.get_assigned_value(hi);
        let lo = self.get_assigned_value(lo);

        let out = self.check_hi_lo(hi, lo);

        self.to_js_assigned_value(out)
    }

    /// Constrains and returns a single CircuitValue from a hi-lo pair
    /// 
    /// Constrains (hi < r // 2^128) OR (hi == r // 2^128 AND lo < r % 2^128)
    /// * `hi`: the high 128 bits of the CircuitValue
    /// * `lo`: the low 128 bits of the CircuitValue
    fn check_hi_lo(&mut self, hi: AssignedValue<Fr>, lo: AssignedValue<Fr>) -> AssignedValue<Fr> {
        let (hi_max, lo_max) = modulus::<Fr>().div_mod_floor(&(BigUint::one() << 128));

        //check hi < r // 2**128
        let check_1 =
            self.range
                .is_big_less_than_safe(self.builder.borrow_mut().main(0), hi, hi_max.clone());

        //check (hi == r // 2 ** 128 AND lo < r % 2**128)
        let hi_max_fe = biguint_to_fe::<Fr>(&hi_max);
        let lo_max_fe = biguint_to_fe::<Fr>(&lo_max);
        let check_2_hi =
            self.gate
                .is_equal(self.builder.borrow_mut().main(0), hi, Constant(hi_max_fe));
        self.range
            .range_check(self.builder.borrow_mut().main(0), lo, 128);
        let check_2_lo = self.range.is_less_than(
            self.builder.borrow_mut().main(0),
            lo,
            Constant(lo_max_fe),
            128,
        );
        let check_2 = self
            .gate
            .and(self.builder.borrow_mut().main(0), check_2_hi, check_2_lo);

        //constrain (check_1 || check_2) == 1
        let check = self
            .gate
            .add(self.builder.borrow_mut().main(0), check_1, check_2);
        self.gate
            .assert_is_const(self.builder.borrow_mut().main(0), &check, &Fr::one());

        let combined = self.gate.mul_add(
            self.builder.borrow_mut().main(0),
            hi,
            Constant(self.gate.pow_of_two()[128]),
            lo,
        );
        combined
    }

    pub fn div_mod_var(&mut self, a: usize, b: usize, a_size: &str, b_size: &str) -> Vec<u32> {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let a_size: usize = a_size.parse().unwrap();
        let b_size: usize = b_size.parse().unwrap();
        let out = self
            .range
            .div_mod_var(self.builder.borrow_mut().main(0), a, b, a_size, b_size);
        let out = vec![out.0, out.1];
        self.to_js_assigned_values(out)
    }

    pub fn pow_var(&mut self, a: usize, b: usize, max_bits: &str) -> usize {
        let a = self.get_assigned_value(a);
        let b = self.get_assigned_value(b);
        let max_bits: usize = max_bits.parse().unwrap();
        let out = self
            .gate
            .pow_var(self.builder.borrow_mut().main(0), a, b, max_bits);
        self.to_js_assigned_value(out)
    }

    pub fn poseidon(&mut self, a: &[u32]) -> usize {
        let a = self.get_assigned_values(a);
        let spec = OptimizedPoseidonSpec::<Fr, T, RATE>::new::<R_F, R_P, SECURE_MDS>();
        let mut hasher = PoseidonHasher::new(spec);
        hasher.initialize_consts(self.builder.borrow_mut().main(0), self.range.gate());
        let inputs = a.as_slice();
        let hash =
            hasher.hash_fix_len_array(self.builder.borrow_mut().main(0), self.range.gate(), inputs);
        self.to_js_assigned_value(hash)
    }

    pub fn witness(&mut self, val: &str) -> usize {
        let x = Fr::from_str_vartime(val).unwrap();
        let witness = self.builder.borrow_mut().main(0).load_witness(x);
        self.to_js_assigned_value(witness)
    }

    pub fn constant(&mut self, val: &str) -> usize {
        let idx = Fr::from_str_vartime(val).unwrap();
        let constant = self.builder.borrow_mut().main(0).load_constant(idx);
        self.to_js_assigned_value(constant)
    }

    pub fn make_public(&mut self, circuit: &mut Halo2Wasm, a: usize, col: usize) {
        let a = self.get_assigned_value(a);
        let public = circuit.public.get_mut(col).unwrap();
        public.push(a);
    }

    pub fn log(&mut self, circuit: &Halo2Wasm, a: usize) {
        let val = self.value(a);
        unsafe {
            circuit.log(val);
        }
    }

    pub fn value(&mut self, a: usize) -> String {
        let a = self.get_assigned_value(a);
        let value = a.value();
        let value_str = format!("{value:?}");
        value_str
    }

    pub fn lookup_bits(&mut self) -> usize {
        self.range.lookup_bits()
    }
}
