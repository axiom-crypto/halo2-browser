use halo2_base::{utils::BigPrimeField, QuantumCell::Constant};
use halo2_ecc::{
    bigint::ProperCrtUint,
    bn254::pairing::PairingChip,
    ecc::EcPoint,
    fields::{fp::FpChip, vector::FieldVector},
};
pub use halo2_ecc::{
    bn254::{Fp12Chip as Bn254Fq12Chip, Fp2Chip as Bn254Fq2Chip, FpChip as Bn254FqChip},
    ecc::{ecdsa::ecdsa_verify_no_pubkey_check, EccChip},
    fields::FieldChip,
    secp256k1::{FpChip as Secp256k1FpChip, FqChip as Secp256k1FqChip},
};
use num_bigint::BigUint;
use num_traits::One;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

pub use crate::halo2_proofs::halo2curves::{
    bn256::{
        Fq as Bn254Fq, Fq12 as Bn254Fq12, Fq2 as Bn254Fq2, Fr as Bn254Fr,
        G1Affine as Bn254G1Affine, G2Affine as Bn254G2Affine,
    },
    secp256k1::{Fp as Secp256k1Fp, Fq as Secp256k1Fq, Secp256k1Affine},
};

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
    pub fn to_circuit_value_256(&self, lib_wasm: &Halo2LibWasm) -> JsCircuitValue256 {
        let [hi, lo] = self.to_hi_lo(lib_wasm);
        let [hi, lo] = [hi, lo].map(|x| lib_wasm.to_js_assigned_value(x));
        JsCircuitValue256 { hi, lo }
    }
}

type Fq2Point = FieldVector<FqPoint>;
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Bn254Fq2Point(Fq2Point);
#[wasm_bindgen]
impl Bn254Fq2Point {
    pub fn c0(&self) -> Bn254FqPoint {
        Bn254FqPoint(self.0[0].clone())
    }
    pub fn c1(&self) -> Bn254FqPoint {
        Bn254FqPoint(self.0[1].clone())
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Bn254G1AffinePoint(EcPoint<Fr, FqPoint>);

#[wasm_bindgen]
impl Bn254G1AffinePoint {
    pub fn x(&self) -> Bn254FqPoint {
        Bn254FqPoint(self.0.x().clone())
    }
    pub fn y(&self) -> Bn254FqPoint {
        Bn254FqPoint(self.0.y().clone())
    }
}

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Bn254G2AffinePoint(EcPoint<Fr, Fq2Point>);

#[wasm_bindgen]
impl Bn254G2AffinePoint {
    pub fn x(&self) -> Bn254Fq2Point {
        Bn254Fq2Point(self.0.x().clone())
    }
    pub fn y(&self) -> Bn254Fq2Point {
        Bn254Fq2Point(self.0.y().clone())
    }
}

/// We use 3 limbs with 88 bits each.
/// NOT constrained to be less than the prime.
// This is the base = coordinate field
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Secp256k1FpPoint(ProperCrtUint<Fr>);
#[wasm_bindgen]
impl Secp256k1FpPoint {
    fn to_hi_lo(&self, lib_wasm: &Halo2LibWasm) -> [AssignedValue<Fr>; 2] {
        convert_3limbs88bits_to_hi_lo(lib_wasm, self.0.limbs())
    }
    pub fn to_circuit_value_256(&self, lib_wasm: &Halo2LibWasm) -> JsCircuitValue256 {
        let [hi, lo] = self.to_hi_lo(lib_wasm);
        let [hi, lo] = [hi, lo].map(|x| lib_wasm.to_js_assigned_value(x));
        JsCircuitValue256 { hi, lo }
    }
}

/// We use 3 limbs with 88 bits each.
/// NOT constrained to be less than the prime.
// This is the scalar field
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Secp256k1FqPoint(ProperCrtUint<Fr>);
#[wasm_bindgen]
impl Secp256k1FqPoint {
    fn to_hi_lo(&self, lib_wasm: &Halo2LibWasm) -> [AssignedValue<Fr>; 2] {
        convert_3limbs88bits_to_hi_lo(lib_wasm, self.0.limbs())
    }
    pub fn to_circuit_value_256(&self, lib_wasm: &Halo2LibWasm) -> JsCircuitValue256 {
        let [hi, lo] = self.to_hi_lo(lib_wasm);
        let [hi, lo] = [hi, lo].map(|x| lib_wasm.to_js_assigned_value(x));
        JsCircuitValue256 { hi, lo }
    }
}

type FpPoint = ProperCrtUint<Fr>;
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Secp256k1AffinePoint(EcPoint<Fr, FpPoint>);

#[wasm_bindgen]
impl Secp256k1AffinePoint {
    pub fn x(&self) -> Secp256k1FpPoint {
        Secp256k1FpPoint(self.0.x().clone())
    }
    pub fn y(&self) -> Secp256k1FpPoint {
        Secp256k1FpPoint(self.0.y().clone())
    }
}

/// When this type is used, it is **ASSUMED** that the corresponding `hi,lo` [AssignedValue]s have been range checked to be 128 bits each.
#[wasm_bindgen]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct JsCircuitValue256 {
    pub hi: JsCircuitValue,
    pub lo: JsCircuitValue,
}
#[wasm_bindgen]
impl JsCircuitValue256 {
    #[wasm_bindgen(constructor)]
    pub fn new(hi: JsCircuitValue, lo: JsCircuitValue) -> Self {
        Self { hi, lo }
    }
}

// following notation of https://github.com/paulmillr/noble-curves/tree/main
#[wasm_bindgen]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct JsCircuitBn254Fq2 {
    pub c0: JsCircuitValue256,
    pub c1: JsCircuitValue256,
}
#[wasm_bindgen]
impl JsCircuitBn254Fq2 {
    #[wasm_bindgen(constructor)]
    pub fn new(c0: JsCircuitValue256, c1: JsCircuitValue256) -> Self {
        Self { c0, c1 }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct JsCircuitBn254G1Affine {
    pub x: JsCircuitValue256,
    pub y: JsCircuitValue256,
}
#[wasm_bindgen]
impl JsCircuitBn254G1Affine {
    #[wasm_bindgen(constructor)]
    pub fn new(x: JsCircuitValue256, y: JsCircuitValue256) -> Self {
        Self { x, y }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct JsCircuitBn254G2Affine {
    pub x: JsCircuitBn254Fq2,
    pub y: JsCircuitBn254Fq2,
}
#[wasm_bindgen]
impl JsCircuitBn254G2Affine {
    #[wasm_bindgen(constructor)]
    pub fn new(x: JsCircuitBn254Fq2, y: JsCircuitBn254Fq2) -> Self {
        Self { x, y }
    }
}

#[wasm_bindgen(getter_with_clone)]
#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
pub struct JsCircuitSecp256k1Affine {
    pub x: JsCircuitValue256,
    pub y: JsCircuitValue256,
}
#[wasm_bindgen]
impl JsCircuitSecp256k1Affine {
    #[wasm_bindgen(constructor)]
    pub fn new(x: JsCircuitValue256, y: JsCircuitValue256) -> Self {
        Self { x, y }
    }
}

#[wasm_bindgen]
impl Halo2LibWasm {
    // TODO: this should not be recreated, but currently blocked by self-referential structs
    fn bn254_fq_chip(&self) -> Bn254FqChip<Fr> {
        let limb_bits = 88;
        let num_limbs = 3;
        Bn254FqChip::<Fr>::new(&self.range, limb_bits, num_limbs)
    }
    fn secp256k1_fp_chip(&self) -> Secp256k1FpChip<Fr> {
        let limb_bits = 88;
        let num_limbs = 3;
        Secp256k1FpChip::<Fr>::new(&self.range, limb_bits, num_limbs)
    }
    fn secp256k1_fq_chip(&self) -> Secp256k1FqChip<Fr> {
        let limb_bits = 88;
        let num_limbs = 3;
        Secp256k1FqChip::<Fr>::new(&self.range, limb_bits, num_limbs)
    }

    /// Takes in CircuitValue256 in hi-lo form and loads internal CircuitBn254Fq type (we use 3 limbs of 88 bits).
    /// This function does not range check `hi,lo` to be `uint128` in case it's already done elsewhere.
    pub fn load_bn254_fq(&self, val: JsCircuitValue256) -> Bn254FqPoint {
        let fq_chip = self.bn254_fq_chip();
        Bn254FqPoint(self.load_generic_fp_impl::<Bn254Fq>(&fq_chip, val))
    }
    /// Doesn't range check limbs of g1_point.
    /// Does not allow you to load identity point.
    pub fn load_bn254_g1(&self, point: JsCircuitBn254G1Affine) -> Bn254G1AffinePoint {
        let fq_chip = self.bn254_fq_chip();
        let g1_chip = EccChip::new(&fq_chip);
        self.load_bn254_g1_impl(&g1_chip, point)
    }
    /// `g1_points` should be array of `CircuitBn254G1Affine` in hi-lo form.
    /// This function does not range check `hi,lo` to be `uint128` in case it's already done elsewhere.
    /// Prevents any g1_points from being identity.
    pub fn bn254_g1_sum(&self, g1_points: js_sys::Array) -> Bn254G1AffinePoint {
        let fq_chip = self.bn254_fq_chip();
        let g1_chip = EccChip::new(&fq_chip);
        let g1_points: Vec<JsCircuitBn254G1Affine> = g1_points
            .iter()
            .map(|x| serde_wasm_bindgen::from_value(x).unwrap())
            .collect();
        let g1_points: Vec<_> = g1_points
            .into_iter()
            .map(|point| self.load_bn254_g1_impl(&g1_chip, point).0)
            .collect();
        let sum = g1_chip.sum::<Bn254G1Affine>(self.builder.borrow_mut().main(0), g1_points);
        Bn254G1AffinePoint(sum)
    }

    /// `g1_point_1` and `g1_point_2` are `CircuitBn254G1Affine` points in hi-lo form.
    /// This function does not range check `hi,lo` to be `uint128` in case it's already done elsewhere
    /// and also it constraints that g1_point_1.x != g1_point_2.x
    /// Prevents any g1_points from being identity.
    pub fn bn254_g1_sub_unequal(
        &self,
        g1_point_1: JsCircuitBn254G1Affine,
        g1_point_2: JsCircuitBn254G1Affine,
    ) -> Bn254G1AffinePoint {
        let fq_chip = self.bn254_fq_chip();
        let g1_chip = EccChip::new(&fq_chip);
        let g1_point_1_loaded: EcPoint<Fr, FqPoint> =
            self.load_bn254_g1_impl(&g1_chip, g1_point_1).0;
        let g1_point_2_loaded: EcPoint<Fr, FqPoint> =
            self.load_bn254_g1_impl(&g1_chip, g1_point_2).0;
        let diff = g1_chip.sub_unequal(
            self.builder.borrow_mut().main(0),
            g1_point_1_loaded,
            g1_point_2_loaded,
            true,
        );
        Bn254G1AffinePoint(diff)
    }

    /// Doesn't range check limbs of g2_point.
    /// Does not allow you to load identity point.
    pub fn load_bn254_g2(&self, point: JsCircuitBn254G2Affine) -> Bn254G2AffinePoint {
        let fq_chip = self.bn254_fq_chip();
        let fq2_chip = Bn254Fq2Chip::new(&fq_chip);
        let g2_chip = EccChip::new(&fq2_chip);
        self.load_bn254_g2_impl(&g2_chip, point)
    }
    /// `g2_points` should be array of `CircuitBn254G2Affine` in hi-lo form.
    /// This function does not range check `hi,lo` to be `uint128` in case it's already done elsewhere.
    /// Prevents any g2_points from being identity.
    pub fn bn254_g2_sum(&self, g2_points: js_sys::Array) -> Bn254G2AffinePoint {
        let fq_chip = self.bn254_fq_chip();
        let fq2_chip = Bn254Fq2Chip::new(&fq_chip);
        let g2_chip = EccChip::new(&fq2_chip);
        let g2_points: Vec<JsCircuitBn254G2Affine> = g2_points
            .iter()
            .map(|x| serde_wasm_bindgen::from_value(x).unwrap())
            .collect();
        let g2_points: Vec<_> = g2_points
            .into_iter()
            .map(|point| self.load_bn254_g2_impl(&g2_chip, point).0)
            .collect();
        let sum = g2_chip.sum::<Bn254G2Affine>(self.builder.borrow_mut().main(0), g2_points);
        Bn254G2AffinePoint(sum)
    }
    /// Verifies that e(lhs_g1, lhs_g2) = e(rhs_g1, rhs_g2) by checking e(lhs_g1, lhs_g2)*e(-rhs_g1, rhs_g2) === 1
    /// Returns [CircuitValue] for the result as a boolean (1 if signature verification is successful).
    /// None of the points should be identity.
    pub fn bn254_pairing_check(
        &self,
        lhs_g1: Bn254G1AffinePoint,
        lhs_g2: Bn254G2AffinePoint,
        rhs_g1: Bn254G1AffinePoint,
        rhs_g2: Bn254G2AffinePoint,
    ) -> JsCircuitValue {
        let fq_chip = self.bn254_fq_chip();
        let g1_chip = EccChip::new(&fq_chip);
        let mut builder = self.builder.borrow_mut();
        let ctx = builder.main(0);
        let neg_rhs_g1 = g1_chip.negate(ctx, rhs_g1.0);
        let pairing_chip = PairingChip::new(&fq_chip);

        let multi_paired = pairing_chip
            .multi_miller_loop(ctx, vec![(&lhs_g1.0, &lhs_g2.0), (&neg_rhs_g1, &rhs_g2.0)]);
        let fq12_chip = Bn254Fq12Chip::new(&fq_chip);
        let result = fq12_chip.final_exp(ctx, multi_paired);
        let fq12_one = fq12_chip.load_constant(ctx, Bn254Fq12::one());
        let verification_result = fq12_chip.is_equal(ctx, result, fq12_one);
        self.to_js_assigned_value(verification_result)
    }

    /// Doesn't range check limbs of point.
    /// Pubkey is a point on
    pub fn load_secp256k1_pubkey(&self, point: JsCircuitSecp256k1Affine) -> Secp256k1AffinePoint {
        let fp_chip = self.secp256k1_fp_chip();
        let [x, y] =
            [point.x, point.y].map(|c| self.load_generic_fp_impl::<Secp256k1Fp>(&fp_chip, c));
        let pt = EcPoint::new(x, y);
        let chip = EccChip::new(&fp_chip);
        // this prevents pubkey from being identity point:
        chip.assert_is_on_curve::<Secp256k1Affine>(self.builder.borrow_mut().main(0), &pt);
        Secp256k1AffinePoint(pt)
    }

    /// Assumes all `JsCircuitValue256` limbs have been range checked to be `u128`.
    pub fn verify_secp256k1_ecdsa_signature(
        &self,
        pubkey: Secp256k1AffinePoint,
        r: JsCircuitValue256,
        s: JsCircuitValue256,
        msg_hash: JsCircuitValue256,
    ) -> JsCircuitValue {
        let fq_chip = self.secp256k1_fq_chip();
        let fp_chip = self.secp256k1_fp_chip();
        let [r, s, msg_hash] = [r, s, msg_hash].map(|x| self.load_generic_fp_impl(&fq_chip, x));
        let ecc_chip = EccChip::new(&fp_chip);
        let mut builder = self.builder.borrow_mut();
        let ctx = builder.main(0);
        let verification_result =
            ecdsa_verify_no_pubkey_check::<Fr, Secp256k1Fp, Secp256k1Fq, Secp256k1Affine>(
                &ecc_chip, ctx, pubkey.0, r, s, msg_hash, 4, 4,
            );
        self.to_js_assigned_value(verification_result)
    }

    pub fn ecdsa_benchmark(&mut self, sk: u64, msg_hash: u64, k: u64) -> usize {
        // let pk = self.get_assigned_values(pk);
        // let r = self.get_assigned_value(r);
        // let s = self.get_assigned_value(s);
        // let msg_hash = self.get_assigned_value(msg_hash);

        let sk = <Secp256k1Affine as CurveAffine>::ScalarExt::from(sk);
        let pubkey = Secp256k1Affine::from(Secp256k1Affine::generator() * sk);
        let msg_hash = <Secp256k1Affine as CurveAffine>::ScalarExt::from(msg_hash);

        let k = <Secp256k1Affine as CurveAffine>::ScalarExt::from(k);
        let k_inv = k.invert().unwrap();

        let r_point = Secp256k1Affine::from(Secp256k1Affine::generator() * k)
            .coordinates()
            .unwrap();
        let x = r_point.x();
        let x_bigint = fe_to_biguint(x);

        let r = biguint_to_fe::<Secp256k1Fq>(&(x_bigint % modulus::<Secp256k1Fq>()));
        let s = k_inv * (msg_hash + (r * sk));

        let fp_chip = self.secp256k1_fp_chip();
        let fq_chip = self.secp256k1_fq_chip();

        let mut builder = self.builder.borrow_mut();
        let ctx = builder.main(0);
        let [m, r, s] = [msg_hash, r, s].map(|x| fq_chip.load_private(ctx, x));

        let ecc_chip = EccChip::new(&fp_chip);
        let pk = ecc_chip.load_private_unchecked(ctx, (pubkey.x, pubkey.y));

        let res = ecdsa_verify_no_pubkey_check::<Fr, Secp256k1Fp, Secp256k1Fq, Secp256k1Affine>(
            &ecc_chip, ctx, pk, r, s, m, 4, 4,
        );

        self.to_js_assigned_value(res)
    }

    pub fn to_js_circuit_value_256(&self, hi: usize, lo: usize) -> JsCircuitValue256 {
        JsCircuitValue256 {
            hi,
            lo
        }
    }

    pub fn to_js_circuit_bn254_g1_affine(&self, x: JsCircuitValue256, y: JsCircuitValue256) -> JsCircuitBn254G1Affine {
        JsCircuitBn254G1Affine {
            x,
            y
        }
    }

    pub fn to_js_circuit_bn254_fq2(&self, c0: JsCircuitValue256, c1: JsCircuitValue256) -> JsCircuitBn254Fq2 {
        JsCircuitBn254Fq2 {
            c0,
            c1
        }
    }

    pub fn to_js_circuit_bn254_g2_affine(&self, x: JsCircuitBn254Fq2, y: JsCircuitBn254Fq2) -> JsCircuitBn254G2Affine {
        JsCircuitBn254G2Affine {
            x,
            y
        }
    }

    pub fn to_js_circuit_secp256k1_affine(&self, x: JsCircuitValue256, y: JsCircuitValue256) -> JsCircuitSecp256k1Affine {
        JsCircuitSecp256k1Affine {
            x,
            y
        }
    }

    // private implementations to save recreating chips each time:

    // Doesn't range check hi,lo
    fn load_generic_fp_impl<Fp: BigPrimeField>(
        &self,
        fp_chip: &FpChip<Fr, Fp>,
        val: JsCircuitValue256,
    ) -> ProperCrtUint<Fr> {
        // easiest to just construct the raw bigint, load it as witness, and then constrain against provided circuit value
        let [hi, lo] = [val.hi, val.lo].map(|x| self.get_assigned_value(x));
        let [hi_val, lo_val] = [hi, lo].map(|x| fe_to_biguint(x.value()));
        let fp = (hi_val << 128) + lo_val;
        assert!(fp < modulus::<Fp>());
        let fp = biguint_to_fe::<Fp>(&fp);
        let mut builder = self.builder.borrow_mut();
        let ctx = builder.main(0);
        let fp = fp_chip.load_private(ctx, fp);
        // constrain fq actually equals hi << 128 + lo
        constrain_limbs_equality(ctx, &self.range, [hi, lo], fp.limbs(), fp_chip.limb_bits());
        fp
    }
    /// Doesn't range check limbs of g1_point
    fn load_bn254_g1_impl(
        &self,
        g1_chip: &EccChip<Fr, Bn254FqChip<Fr>>,
        point: JsCircuitBn254G1Affine,
    ) -> Bn254G1AffinePoint {
        let [x, y] = [point.x, point.y]
            .map(|c| self.load_generic_fp_impl::<Bn254Fq>(g1_chip.field_chip(), c));
        let pt = EcPoint::new(x, y);
        g1_chip.assert_is_on_curve::<Bn254G1Affine>(self.builder.borrow_mut().main(0), &pt);
        Bn254G1AffinePoint(pt)
    }
    /// Doesn't range check limbs of g2_point
    fn load_bn254_g2_impl(
        &self,
        g2_chip: &EccChip<Fr, Bn254Fq2Chip<Fr>>,
        point: JsCircuitBn254G2Affine,
    ) -> Bn254G2AffinePoint {
        let fq_chip = g2_chip.field_chip().fp_chip();
        let [x, y] = [point.x, point.y].map(|c| {
            let c0 = self.load_generic_fp_impl::<Bn254Fq>(fq_chip, c.c0);
            let c1 = self.load_generic_fp_impl::<Bn254Fq>(fq_chip, c.c1);
            FieldVector(vec![c0, c1])
        });
        let pt = EcPoint::new(x, y);
        g2_chip.assert_is_on_curve::<Bn254G2Affine>(self.builder.borrow_mut().main(0), &pt);
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
    let (tmp0, limb0) = range.div_mod(ctx, lo, BigUint::one() << limb_bits, 128);
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
    let (limb1_hi, limb1_lo) = range.div_mod(ctx, limbs[1], BigUint::one() << lo_bits, 88);
    let multiplier = biguint_to_fe(&(BigUint::one() << 88));
    let lo = gate.mul_add(ctx, limb1_lo, Constant(multiplier), limbs[0]);
    let multiplier = biguint_to_fe(&(BigUint::one() << hi_bits));
    let hi = gate.mul_add(ctx, limbs[2], Constant(multiplier), limb1_hi);
    [hi, lo]
}
