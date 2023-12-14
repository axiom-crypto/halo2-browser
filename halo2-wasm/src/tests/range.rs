#![allow(clippy::redundant_closure_call)]
use crate::halo2lib::Halo2LibWasm;
use crate::tests::utils::base_test;
use halo2_base::gates::{RangeChip, RangeInstructions};
use halo2_base::halo2_proofs::halo2curves::bn256::Fr;
use halo2_base::Context;
use snark_verifier::util::arithmetic::PrimeField;

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
    ("15141", 128),
    |ctx: &mut Context<Fr>, chip: &RangeChip<Fr>, inputs: (&str, usize)| {
        let a = ctx.load_witness(Fr::from_str_vartime(inputs.0).unwrap());
        chip.range_check(ctx, a, inputs.1);
    },
    |ctx: &mut Halo2LibWasm, inputs: (&str, usize)| {
        let a = ctx.witness(inputs.0);
        ctx.range_check(a, &inputs.1.to_string())
    }
);

//performs range check also since that's what halo2-lib-js does as well
//and `check_less_than` assumes that the inputs are already range checked
range_test!(
    test_check_less_than,
    ("10", "15", 8),
    |ctx: &mut Context<Fr>, chip: &RangeChip<Fr>, inputs: (&str, &str, usize)| {
        let a = ctx.load_witness(Fr::from_str_vartime(inputs.0).unwrap());
        let b = ctx.load_witness(Fr::from_str_vartime(inputs.1).unwrap());
        chip.range_check(ctx, a, inputs.2);
        chip.range_check(ctx, b, inputs.2);
        chip.check_less_than(ctx, a, b, inputs.2);
    },
    |ctx: &mut Halo2LibWasm, inputs: (&str, &str, usize)| {
        let a = ctx.witness(inputs.0);
        let b = ctx.witness(inputs.1);
        ctx.range_check(a, &inputs.2.to_string());
        ctx.range_check(b, &inputs.2.to_string());
        ctx.check_less_than(a, b, &inputs.2.to_string());
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

//performs range check also since that's what halo2-lib-js does as well
//and `is_less_than` assumes that the inputs are already range checked
range_test!(
    test_is_less_than,
    &["10", "15", "8"],
    |ctx: &mut Context<Fr>, chip: &RangeChip<Fr>, inputs: &[&str]| {
        let a = ctx.load_witness(Fr::from_str_vartime(inputs[0]).unwrap());
        let b = ctx.load_witness(Fr::from_str_vartime(inputs[1]).unwrap());
        chip.range_check(ctx, a, inputs[2].parse().unwrap());
        chip.range_check(ctx, b, inputs[2].parse().unwrap());
        chip.is_less_than(ctx, a, b, inputs[2].parse().unwrap());
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let a = ctx.witness(inputs[0]);
        let b = ctx.witness(inputs[1]);
        ctx.range_check(a, inputs[2]);
        ctx.range_check(b, inputs[2]);
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
        chip.div_mod_var(
            ctx,
            a,
            b,
            inputs[2].parse().unwrap(),
            inputs[3].parse().unwrap(),
        );
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let a = ctx.witness(inputs[0]);
        let b = ctx.witness(inputs[1]);
        ctx.div_mod_var(a, b, inputs[2], inputs[3]);
    }
);
