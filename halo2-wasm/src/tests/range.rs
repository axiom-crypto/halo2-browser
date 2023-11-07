use crate::halo2lib::{Halo2LibWasm, SECURE_MDS, R_P, R_F, RATE, T};
use crate::tests::utils::base_test;
use halo2_base::Context;
use halo2_base::gates::{RangeChip, RangeInstructions};
use halo2_base::halo2_proofs::halo2curves::bn256::Fr;
use halo2_base::poseidon::hasher::PoseidonHasher;
use num_traits::ToPrimitive;
use snark_verifier::util::arithmetic::PrimeField;
use snark_verifier_sdk::halo2::OptimizedPoseidonSpec;

macro_rules! range_test {
    ($name:ident, $inputs:expr, $base_closure:expr, $wasm_closure:expr) => {
        paste::item! {
            #[test]
            pub fn $name() {
                let base = base_test().run(|ctx, chip| {
                    $base_closure(ctx, chip, $inputs);
                });
                let wasm = base_test().run_wasm_builder(|ctx| {
                    $wasm_closure(ctx, $inputs)
                });
                assert_eq!(base, wasm);
            }
        }
    };
}

range_test!(
    test_range_check,
    &["15", "10"],
    |ctx: &mut Context<Fr>, chip: &RangeChip<Fr>, inputs: &[&str]| {
        let a = ctx.load_witness(Fr::from_str_vartime(inputs[0]).unwrap());
        chip.range_check(ctx, a, inputs[1].parse().unwrap());
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let a = ctx.witness(inputs[0]);
        ctx.range_check(a, inputs[1])
    }
);

range_test!(
    test_check_less_than,
    &["10", "15", "8"],
    |ctx: &mut Context<Fr>, chip: &RangeChip<Fr>, inputs: &[&str]| {
        let a = ctx.load_witness(Fr::from_str_vartime(inputs[0]).unwrap());
        let b = ctx.load_witness(Fr::from_str_vartime(inputs[1]).unwrap());
        chip.check_less_than(ctx, a, b, inputs[2].parse().unwrap());
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let a = ctx.witness(inputs[0]);
        let b = ctx.witness(inputs[1]);
        ctx.check_less_than(a, b, inputs[2]);
    }
);

range_test!(
    test_check_less_than_safe,
    &["300", "1000"],
    |ctx: &mut Context<Fr>, chip: &RangeChip<Fr>, inputs: &[&str]| {
        let a = ctx.load_witness(Fr::from_str_vartime(inputs[0]).unwrap());
        chip.check_less_than_safe(ctx, a, inputs[1].parse().unwrap());
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let a = ctx.witness(inputs[0]);
        ctx.check_less_than_safe(a, inputs[1]);
    }
);

range_test!(
    test_is_less_than,
    &["10", "15", "8"],
    |ctx: &mut Context<Fr>, chip: &RangeChip<Fr>, inputs: &[&str]| {
        let a = ctx.load_witness(Fr::from_str_vartime(inputs[0]).unwrap());
        let b = ctx.load_witness(Fr::from_str_vartime(inputs[1]).unwrap());
        chip.is_less_than(ctx, a, b, inputs[2].parse().unwrap());
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let a = ctx.witness(inputs[0]);
        let b = ctx.witness(inputs[1]);
        ctx.is_less_than(a, b, inputs[2]);
    }
);

range_test!(
    test_is_less_than_safe,
    &["300", "500"],
    |ctx: &mut Context<Fr>, chip: &RangeChip<Fr>, inputs: &[&str]| {
        let a = ctx.load_witness(Fr::from_str_vartime(inputs[0]).unwrap());
        chip.is_less_than_safe(ctx, a, inputs[1].parse().unwrap());
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let a = ctx.witness(inputs[0]);
        ctx.is_less_than_safe(a, inputs[1]);
    }
);

range_test!(
    test_div_mod,
    &["90", "50", "12"],
    |ctx: &mut Context<Fr>, chip: &RangeChip<Fr>, inputs: &[&str]| {
        let a = ctx.load_witness(Fr::from_str_vartime(inputs[0]).unwrap());
        let b: u64 = inputs[1].parse().unwrap();
        chip.div_mod(ctx, a, b, inputs[2].parse().unwrap());
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let a = ctx.witness(inputs[0]);
        ctx.div_mod(a, inputs[1], inputs[2]);
    }
);

range_test!(
    test_div_mod_var,
    &["90", "50", "12", "12"],
    |ctx: &mut Context<Fr>, chip: &RangeChip<Fr>, inputs: &[&str]| {
        let a = ctx.load_witness(Fr::from_str_vartime(inputs[0]).unwrap());
        let b = ctx.load_witness(Fr::from_str_vartime(inputs[1]).unwrap());
        chip.div_mod_var(ctx, a, b, inputs[2].parse().unwrap(), inputs[3].parse().unwrap());
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let a = ctx.witness(inputs[0]);
        let b = ctx.witness(inputs[1]);
        ctx.div_mod_var(a, b, inputs[2], inputs[3]);
    }
);

range_test!(
    test_poseidon,
    &["90", "50", "12", "12"],
    |ctx: &mut Context<Fr>, chip: &RangeChip<Fr>, inputs: &[&str]| {
        let inputs = inputs.iter().map(|x| ctx.load_witness(Fr::from_str_vartime(x).unwrap())).collect::<Vec<_>>();
        let spec = OptimizedPoseidonSpec::<Fr, T, RATE>::new::<R_F, R_P, SECURE_MDS>();
        let mut hasher = PoseidonHasher::new(spec);
        hasher.initialize_consts(ctx, chip.gate());
        hasher.hash_fix_len_array(ctx, chip.gate(), &inputs);
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let inputs = inputs.iter().map(|x| ctx.witness(x)).collect::<Vec<_>>();
        let inputs = inputs.iter().map(|x| x.to_u32().unwrap()).collect::<Vec<_>>();
        ctx.poseidon(inputs.as_slice());
    }
);
