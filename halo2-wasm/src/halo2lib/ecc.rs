use halo2_base::{
    utils::{BigPrimeField, ScalarField},
    QuantumCell::Constant,
};
use halo2_ecc::{bigint::ProperCrtUint, ecc::EcPoint, fields::vector::FieldVector};
use num_bigint::BigUint;
use num_traits::One;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

use super::*;

/// We use 3 limbs with 88 bits each.
/// NOT constrained to be less than the prime.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Bn254FqPoint(ProperCrtUint<Fr>);

type Fq2Point = FieldVector<ProperCrtUint<Fr>>;
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Bn254Fq2Point(Fq2Point);

#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Bn254G2AffinePoint(EcPoint<Fr, Fq2Point>);

/// We use 3 limbs with 88 bits each.
/// NOT constrained to be less than the prime.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Secp256k1FpPoint(ProperCrtUint<Fr>);

/// We use 3 limbs with 88 bits each.
/// NOT constrained to be less than the prime.
#[wasm_bindgen]
#[derive(Clone, Debug)]
pub struct Secp256k1FqPoint(ProperCrtUint<Fr>);

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
        // easiest to just construct the raw bigint, load it as witness, and then constrain against provided circuit value
        let [hi, lo] = [hi, lo].map(|x| self.get_assigned_value(x));
        let [hi_val, lo_val] = [hi, lo].map(|x| fe_to_biguint(x.value()));
        let fq = (hi_val << 128) + lo_val;
        assert!(fq < modulus::<Bn254Fq>());
        let fq = biguint_to_fe::<Bn254Fq>(&fq);
        let fq_chip = self.bn254_fq_chip();
        let mut builder = self.builder.borrow_mut();
        let ctx = builder.main(0);
        let fq = fq_chip.load_private(ctx, fq);
        // constrain fq actually equals hi << 128 + lo
        constrain_limbs_equality(ctx, &self.range, [hi, lo], fq.limbs(), fq_chip.limb_bits());
        Bn254FqPoint(fq)
    }
    /// `g2_points` should be array of `CircuitValue256` in hi-lo form.
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
            .map(|point| {
                let [x, y] = [point.x, point.y].map(|c| {
                    let c0 = self.unsafe_load_bn254_fq(c.c0.hi, c.c0.lo);
                    let c1 = self.unsafe_load_bn254_fq(c.c1.hi, c.c1.lo);
                    FieldVector(vec![c0.0, c1.0])
                });
                let pt = EcPoint::new(x, y);
                g2_chip.assert_is_on_curve::<Bn254G2Affine>(ctx, &pt);
                pt
            })
            .collect();
        let sum = g2_chip.sum::<Bn254G2Affine>(ctx, g2_points);
        Bn254G2AffinePoint(sum)
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
