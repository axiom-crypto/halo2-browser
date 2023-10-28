use halo2_base::{utils::BigPrimeField, QuantumCell::Constant};
use halo2_ecc::{
    bigint::ProperCrtUint, bn254::pairing::PairingChip, ecc::EcPoint, fields::vector::FieldVector,
};
use num_bigint::BigUint;
use num_traits::One;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use super::*;

// We do not allow JS access to the internals of field elements and ec points because Rust types do not allow you to construct them from the internal pieces for safety.

type FqPoint = ProperCrtUint<Fr>;
/// We use 3 limbs with 88 bits each.
/// NOT constrained to be less than the prime.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Bn254FqPoint(ProperCrtUint<Fr>);
#[wasm_bindgen]
impl Bn254FqPoint {
    fn to_hi_lo(&self, lib_wasm: &Halo2LibWasm) -> [AssignedValue<Fr>; 2] {
        convert_3limbs88bits_to_hi_lo(lib_wasm, self.0.limbs())
    }
    pub fn to_circuit_value_256(&self, lib_wasm: &Halo2LibWasm) -> CircuitValue256 {
        let [hi, lo] = self.to_hi_lo(lib_wasm);
        let [hi, lo] = [hi, lo].map(|x| lib_wasm.to_js_assigned_value(x));
        CircuitValue256 { hi, lo }
    }
}

type Fq2Point = FieldVector<FqPoint>;
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Bn254Fq2Point(Fq2Point);

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Bn254G1AffinePoint(EcPoint<Fr, FqPoint>);

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Bn254G2AffinePoint(EcPoint<Fr, Fq2Point>);

/// We use 3 limbs with 88 bits each.
/// NOT constrained to be less than the prime.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Secp256k1FpPoint(ProperCrtUint<Fr>);
#[wasm_bindgen]
impl Secp256k1FpPoint {
    fn to_hi_lo(&self, lib_wasm: &Halo2LibWasm) -> [AssignedValue<Fr>; 2] {
        convert_3limbs88bits_to_hi_lo(lib_wasm, self.0.limbs())
    }
    pub fn to_circuit_value_256(&self, lib_wasm: &Halo2LibWasm) -> CircuitValue256 {
        let [hi, lo] = self.to_hi_lo(lib_wasm);
        let [hi, lo] = [hi, lo].map(|x| lib_wasm.to_js_assigned_value(x));
        CircuitValue256 { hi, lo }
    }
}

/// We use 3 limbs with 88 bits each.
/// NOT constrained to be less than the prime.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Secp256k1FqPoint(ProperCrtUint<Fr>);
#[wasm_bindgen]
impl Secp256k1FqPoint {
    fn to_hi_lo(&self, lib_wasm: &Halo2LibWasm) -> [AssignedValue<Fr>; 2] {
        convert_3limbs88bits_to_hi_lo(lib_wasm, self.0.limbs())
    }
    pub fn to_circuit_value_256(&self, lib_wasm: &Halo2LibWasm) -> CircuitValue256 {
        let [hi, lo] = self.to_hi_lo(lib_wasm);
        let [hi, lo] = [hi, lo].map(|x| lib_wasm.to_js_assigned_value(x));
        CircuitValue256 { hi, lo }
    }
}

#[wasm_bindgen]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct CircuitValue256 {
    pub hi: CircuitValue,
    pub lo: CircuitValue,
}

// following notation of https://github.com/paulmillr/noble-curves/tree/main
#[wasm_bindgen]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct CircuitBn254Fq2 {
    pub c0: CircuitValue256,
    pub c1: CircuitValue256,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct CircuitBn254G1Affine {
    pub x: CircuitValue256,
    pub y: CircuitValue256,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct CircuitBn254G2Affine {
    pub x: CircuitBn254Fq2,
    pub y: CircuitBn254Fq2,
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct CircuitSecp256k1Affine {
    pub x: CircuitValue256,
    pub y: CircuitValue256,
}

#[wasm_bindgen]
impl Halo2LibWasm {
    // TODO: this should not be recreated, but currently blocked by self-referential structs
    fn bn254_fq_chip(&self) -> Bn254FqChip<Fr> {
        let limb_bits = 88;
        let num_limbs = 3;
        Bn254FqChip::<Fr>::new(&self.range, limb_bits, num_limbs)
    }
    pub fn load_bn254_fq(&self, hi: CircuitValue, lo: CircuitValue) -> Bn254FqPoint {
        for x in [hi, lo] {
            self.range.range_check(
                self.builder.borrow_mut().main(0),
                self.get_assigned_value(x),
                128,
            );
        }
        self.unsafe_load_bn254_fq(hi, lo)
    }
    /// Takes in CircuitValue256 in hi-lo form and loads internal CircuitBn254Fq type (we use 3 limbs of 88 bits).
    /// This function does not range check `hi,lo` to be `uint128` in case it's already done elsewhere.
    pub fn unsafe_load_bn254_fq(&self, hi: CircuitValue, lo: CircuitValue) -> Bn254FqPoint {
        let fq_chip = self.bn254_fq_chip();
        self.unsafe_load_bn254_fq_impl(&fq_chip, hi, lo)
    }
    /// Doesn't range check limbs of g1_point
    pub fn unsafe_load_bn254_g1(&self, point: CircuitBn254G1Affine) -> Bn254G1AffinePoint {
        let fq_chip = self.bn254_fq_chip();
        let g1_chip = EccChip::new(&fq_chip);
        self.unsafe_load_bn254_g1_impl(&g1_chip, point)
    }
    /// `g1_points` should be array of `CircuitBn254G1Affine` in hi-lo form.
    /// This function does not range check `hi,lo` to be `uint128` in case it's already done elsewhere.
    pub fn unsafe_bn254_g1_sum(&self, g1_points: js_sys::Array) -> Bn254G1AffinePoint {
        let fq_chip = self.bn254_fq_chip();
        let g1_chip = EccChip::new(&fq_chip);
        let g1_points: Vec<CircuitBn254G1Affine> = g1_points
            .iter()
            .map(|x| serde_wasm_bindgen::from_value(x).unwrap())
            .collect();
        let mut builder = self.builder.borrow_mut();
        let ctx = builder.main(0);
        let g1_points: Vec<_> = g1_points
            .into_iter()
            .map(|point| self.unsafe_load_bn254_g1_impl(&g1_chip, point).0)
            .collect();
        let sum = g1_chip.sum::<Bn254G1Affine>(ctx, g1_points);
        Bn254G1AffinePoint(sum)
    }
    /// Doesn't range check limbs of g2_point
    pub fn unsafe_load_bn254_g2(&self, point: CircuitBn254G2Affine) -> Bn254G2AffinePoint {
        let fq_chip = self.bn254_fq_chip();
        let fq2_chip = Bn254Fq2Chip::new(&fq_chip);
        let g2_chip = EccChip::new(&fq2_chip);
        self.unsafe_load_bn254_g2_impl(&g2_chip, point)
    }
    /// `g2_points` should be array of `CircuitBn254G2Affine` in hi-lo form.
    /// This function does not range check `hi,lo` to be `uint128` in case it's already done elsewhere.
    pub fn unsafe_bn254_g2_sum(&self, g2_points: js_sys::Array) -> Bn254G2AffinePoint {
        let fq_chip = self.bn254_fq_chip();
        let fq2_chip = Bn254Fq2Chip::new(&fq_chip);
        let g2_chip = EccChip::new(&fq2_chip);
        let g2_points: Vec<CircuitBn254G2Affine> = g2_points
            .iter()
            .map(|x| serde_wasm_bindgen::from_value(x).unwrap())
            .collect();
        let mut builder = self.builder.borrow_mut();
        let ctx = builder.main(0);
        let g2_points: Vec<_> = g2_points
            .into_iter()
            .map(|point| self.unsafe_load_bn254_g2_impl(&g2_chip, point).0)
            .collect();
        let sum = g2_chip.sum::<Bn254G2Affine>(ctx, g2_points);
        Bn254G2AffinePoint(sum)
    }
    /// Verifies that e(lhs_1, rhs_1) = e(lhs_2, rhs_2) by checking e(lhs_1, rhs_1)*e(-lhs_2, rhs_2) === 1
    /// Returns [CircuitValue] for the result as a boolean (1 if signature verification is successful).
    pub fn bn254_pairing_check(
        &self,
        lhs_1: Bn254G1AffinePoint,
        rhs_1: Bn254G2AffinePoint,
        lhs_2: Bn254G1AffinePoint,
        rhs_2: Bn254G2AffinePoint,
    ) -> CircuitValue {
        let fq_chip = self.bn254_fq_chip();
        let g1_chip = EccChip::new(&fq_chip);
        let mut builder = self.builder.borrow_mut();
        let ctx = builder.main(0);
        let neg_lhs_2 = g1_chip.negate(ctx, lhs_2.0);
        let pairing_chip = PairingChip::new(&fq_chip);

        let multi_paired =
            pairing_chip.multi_miller_loop(ctx, vec![(&lhs_1.0, &rhs_1.0), (&neg_lhs_2, &rhs_2.0)]);
        let fq12_chip = Bn254Fq12Chip::new(&fq_chip);
        let result = fq12_chip.final_exp(ctx, multi_paired);
        let fq12_one = fq12_chip.load_constant(ctx, Bn254Fq12::one());
        let verification_result = fq12_chip.is_equal(ctx, result, fq12_one);
        self.to_js_assigned_value(verification_result)
    }

    // private implementations to save recreating chips each time:
    fn unsafe_load_bn254_fq_impl(
        &self,
        fq_chip: &Bn254FqChip<Fr>,
        hi: CircuitValue,
        lo: CircuitValue,
    ) -> Bn254FqPoint {
        // easiest to just construct the raw bigint, load it as witness, and then constrain against provided circuit value
        let [hi, lo] = [hi, lo].map(|x| self.get_assigned_value(x));
        let [hi_val, lo_val] = [hi, lo].map(|x| fe_to_biguint(x.value()));
        let fq = (hi_val << 128) + lo_val;
        assert!(fq < modulus::<Bn254Fq>());
        let fq = biguint_to_fe::<Bn254Fq>(&fq);
        let mut builder = self.builder.borrow_mut();
        let ctx = builder.main(0);
        let fq = fq_chip.load_private(ctx, fq);
        // constrain fq actually equals hi << 128 + lo
        constrain_limbs_equality(ctx, &self.range, [hi, lo], fq.limbs(), fq_chip.limb_bits());
        Bn254FqPoint(fq)
    }
    /// Doesn't range check limbs of g2_point
    fn unsafe_load_bn254_g1_impl(
        &self,
        g1_chip: &EccChip<Fr, Bn254FqChip<Fr>>,
        point: CircuitBn254G1Affine,
    ) -> Bn254G1AffinePoint {
        let mut builder = self.builder.borrow_mut();
        let ctx = builder.main(0);
        let [x, y] = [point.x, point.y].map(|c| {
            let c = self.unsafe_load_bn254_fq_impl(g1_chip.field_chip(), c.hi, c.lo);
            c.0
        });
        let pt = EcPoint::new(x, y);
        g1_chip.assert_is_on_curve::<Bn254G1Affine>(ctx, &pt);
        Bn254G1AffinePoint(pt)
    }
    /// Doesn't range check limbs of g2_point
    fn unsafe_load_bn254_g2_impl(
        &self,
        g2_chip: &EccChip<Fr, Bn254Fq2Chip<Fr>>,
        point: CircuitBn254G2Affine,
    ) -> Bn254G2AffinePoint {
        let fq_chip = g2_chip.field_chip().fp_chip();
        let mut builder = self.builder.borrow_mut();
        let ctx = builder.main(0);
        let [x, y] = [point.x, point.y].map(|c| {
            let c0 = self.unsafe_load_bn254_fq_impl(fq_chip, c.c0.hi, c.c0.lo);
            let c1 = self.unsafe_load_bn254_fq_impl(fq_chip, c.c1.hi, c.c1.lo);
            FieldVector(vec![c0.0, c1.0])
        });
        let pt = EcPoint::new(x, y);
        g2_chip.assert_is_on_curve::<Bn254G2Affine>(ctx, &pt);
        Bn254G2AffinePoint(pt)
    }
}

// hardcoding for 3 limbs
fn constrain_limbs_equality<F: BigPrimeField>(
    ctx: &mut Context<F>,
    range: &RangeChip<F>,
    [hi, lo]: [AssignedValue<F>; 2],
    limbs: &[AssignedValue<F>],
    limb_bits: usize,
) {
    assert!(limb_bits <= 128);
    assert!(limb_bits > 64);
    // limb_bits, 128 - limb_bits
    let (limb0, tmp0) = range.div_mod(ctx, lo, BigUint::one() << limb_bits, 128);
    // limb_bits - (128 - limb_bits) = 2 * limb_bits - 128 > 0
    let rem_bits = limb_bits - (128 - limb_bits);
    let (limb2, tmp1) = range.div_mod(ctx, hi, BigUint::one() << rem_bits, 128);
    let multiplier = biguint_to_fe(&(BigUint::one() << (128 - limb_bits)));
    let limb1 = range.gate.mul_add(ctx, tmp1, Constant(multiplier), tmp0);
    for (l0, l1) in limbs.iter().zip_eq([limb0, limb1, limb2]) {
        ctx.constrain_equal(l0, &l1);
    }
}

fn convert_3limbs88bits_to_hi_lo(
    lib_wasm: &Halo2LibWasm,
    limbs: &[AssignedValue<Fr>],
) -> [AssignedValue<Fr>; 2] {
    assert_eq!(limbs.len(), 3);
    let lo_bits = 128 - 88;
    let hi_bits = 88 - lo_bits;
    let mut builder = lib_wasm.builder.borrow_mut();
    let range = &lib_wasm.range;
    let gate = &range.gate;
    let ctx = builder.main(0);
    let (limb1_lo, limb1_hi) = range.div_mod(ctx, limbs[1], BigUint::one() << lo_bits, 88);
    let multiplier = biguint_to_fe(&(BigUint::one() << 88));
    let lo = gate.mul_add(ctx, limb1_lo, Constant(multiplier), limbs[0]);
    let multiplier = biguint_to_fe(&(BigUint::one() << hi_bits));
    let hi = gate.mul_add(ctx, limbs[2], Constant(multiplier), limb1_hi);
    [hi, lo]
}
