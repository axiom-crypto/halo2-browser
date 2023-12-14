#![allow(clippy::redundant_closure_call)]
use crate::halo2lib::{Halo2LibWasm, RATE, R_F, R_P, SECURE_MDS, T};
use crate::tests::utils::base_test;
use halo2_base::gates::{GateChip, GateInstructions};
use halo2_base::halo2_proofs::halo2curves::bn256::Fr;
use halo2_base::poseidon::hasher::PoseidonHasher;
use halo2_base::Context;
use halo2_base::QuantumCell::Existing;
use itertools::Itertools;
use num_traits::ToPrimitive;
use snark_verifier::util::arithmetic::PrimeField;
use snark_verifier_sdk::halo2::OptimizedPoseidonSpec;

macro_rules! gate_test {
    ([$a:expr], $op:ident) => {
        paste::item! {
            #[test]
            pub fn [<test_ $op>]() {
                let base = base_test().run_gate(|ctx, chip| {
                    let [a] = [$a].map(|x| ctx.load_constant(Fr::from_str_vartime(x).unwrap()));
                    chip.$op(ctx, a);
                });
                let wasm = base_test().run_wasm_builder(|ctx| {
                    let [a] = [$a].map(|x| ctx.constant(x));
                    ctx.$op(a)
                });
                assert_eq!(base, wasm);
            }
        }
    };
    ([$a:expr, $b:expr], $op:ident) => {
        paste::item! {
            #[test]
            pub fn [<test_ $op>]() {
                let base = base_test().run_gate(|ctx, chip| {
                    let [a, b] = [$a, $b].map(|x| ctx.load_constant(Fr::from_str_vartime(x).unwrap()));
                    chip.$op(ctx, a, b);
                });
                let wasm = base_test().run_wasm_builder(|ctx| {
                    let [a, b] = [$a, $b].map(|x| ctx.constant(x));
                    ctx.$op(a, b)
                });
                assert_eq!(base, wasm);
            }
        }
    };
    ([$a:expr, $b:expr, $c:expr], $op:ident) => {
        paste::item! {
            #[test]
            pub fn [<test_ $op>]() {
                let base = base_test().run_gate(|ctx, chip| {
                    let [a, b, c] = [$a, $b, $c].map(|x| ctx.load_constant(Fr::from_str_vartime(x).unwrap()));
                    chip.$op(ctx, a, b, c);
                });
                let wasm = base_test().run_wasm_builder(|ctx| {
                    let [a, b, c] = [$a, $b, $c].map(|x| ctx.constant(x));
                    ctx.$op(a, b, c)
                });
                assert_eq!(base, wasm);
            }
        }
    };
    ($name:ident, $inputs:expr, $base_closure:expr, $wasm_closure:expr) => {
        paste::item! {
            #[test]
            pub fn $name() {
                let base = base_test().run_gate(|ctx, chip| {
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

gate_test!(["15", "10"], add);
gate_test!(["15", "10"], sub);
gate_test!(["15"], neg);
gate_test!(["15", "10"], mul);
gate_test!(["15", "10", "10"], mul_add);
gate_test!(["15", "10"], mul_not);
gate_test!(["1"], assert_bit);
gate_test!(["15", "10"], div_unsafe);
gate_test!(["1", "1"], and);
gate_test!(["1", "0"], or);
gate_test!(["1"], not);
gate_test!(["100"], dec);
gate_test!(["1", "0", "1"], or_and);
gate_test!(["0"], is_zero);
gate_test!(["9", "5"], is_equal);
gate_test!(["10", "5", "0"], select);

gate_test!(
    test_assert_is_const,
    &["15"],
    |ctx: &mut Context<Fr>, chip: &GateChip<Fr>, inputs: &[&str]| {
        let fe = Fr::from_str_vartime(inputs[0]).unwrap();
        let a = ctx.load_constant(fe);
        chip.assert_is_const(ctx, &a, &fe);
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let a = ctx.constant(inputs[0]);
        ctx.assert_is_const(a, inputs[0]);
    }
);

gate_test!(
    test_inner_product,
    &["15", "10", "5"],
    |ctx: &mut Context<Fr>, chip: &GateChip<Fr>, inputs: &[&str]| {
        let inputs = inputs
            .iter()
            .map(|x| ctx.load_constant(Fr::from_str_vartime(x).unwrap()))
            .collect::<Vec<_>>();
        chip.inner_product(
            ctx,
            inputs.clone(),
            inputs.iter().map(|x| Existing(*x)).collect_vec(),
        );
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let inputs = inputs
            .iter()
            .map(|x| ctx.constant(x).to_u32().unwrap())
            .collect::<Vec<_>>();
        ctx.inner_product(inputs.clone().as_slice(), inputs.as_slice());
    }
);

gate_test!(
    test_pow_var,
    ("15", "10", 4),
    |ctx: &mut Context<Fr>, chip: &GateChip<Fr>, inputs: (&str, &str, usize)| {
        let a = ctx.load_constant(Fr::from_str_vartime(inputs.0).unwrap());
        let exp = ctx.load_constant(Fr::from_str_vartime(inputs.1).unwrap());
        chip.pow_var(ctx, a, exp, inputs.2);
    },
    |ctx: &mut Halo2LibWasm, inputs: (&str, &str, usize)| {
        let a = ctx.constant(inputs.0);
        let exp = ctx.constant(inputs.1);
        ctx.pow_var(a, exp, &inputs.2.to_string());
    }
);

gate_test!(
    test_sum,
    &["15", "10", "5"],
    |ctx: &mut Context<Fr>, chip: &GateChip<Fr>, inputs: &[&str]| {
        let inputs = inputs
            .iter()
            .map(|x| ctx.load_constant(Fr::from_str_vartime(x).unwrap()))
            .collect::<Vec<_>>();
        chip.sum(ctx, inputs);
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let inputs = inputs
            .iter()
            .map(|x| ctx.constant(x).to_u32().unwrap())
            .collect::<Vec<_>>();
        ctx.sum(inputs.as_slice());
    }
);

gate_test!(
    test_bits_to_indicator,
    &["1", "0", "0", "1", "0"],
    |ctx: &mut Context<Fr>, chip: &GateChip<Fr>, inputs: &[&str]| {
        let inputs = inputs
            .iter()
            .map(|x| ctx.load_constant(Fr::from_str_vartime(x).unwrap()))
            .collect::<Vec<_>>();
        chip.bits_to_indicator(ctx, &inputs);
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let inputs = inputs
            .iter()
            .map(|x| ctx.constant(x).to_u32().unwrap())
            .collect::<Vec<_>>();
        ctx.bits_to_indicator(inputs.as_slice());
    }
);

gate_test!(
    test_idx_to_indicator,
    &["8", "12"],
    |ctx: &mut Context<Fr>, chip: &GateChip<Fr>, inputs: &[&str]| {
        let idx = ctx.load_constant(Fr::from_str_vartime(inputs[0]).unwrap());
        chip.idx_to_indicator(ctx, idx, inputs[1].parse().unwrap());
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let idx = ctx.constant(inputs[0]);
        ctx.idx_to_indicator(idx, inputs[1]);
    }
);

gate_test!(
    test_select_by_indicator,
    &[&["1", "2", "3", "4"], &["0", "0", "1", "0"]],
    |ctx: &mut Context<Fr>, chip: &GateChip<Fr>, inputs: &[&[&str]]| {
        let a = inputs[0]
            .iter()
            .map(|x| ctx.load_constant(Fr::from_str_vartime(x).unwrap()))
            .collect::<Vec<_>>();
        let indicator = inputs[1]
            .iter()
            .map(|x| ctx.load_constant(Fr::from_str_vartime(x).unwrap()))
            .collect::<Vec<_>>();
        chip.select_by_indicator(ctx, a, indicator);
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&[&str]]| {
        let a = inputs[0]
            .iter()
            .map(|x| ctx.constant(x).to_u32().unwrap())
            .collect::<Vec<_>>();
        let indicator = inputs[1]
            .iter()
            .map(|x| ctx.constant(x).to_u32().unwrap())
            .collect::<Vec<_>>();
        ctx.select_by_indicator(a.as_slice(), indicator.as_slice());
    }
);

gate_test!(
    test_select_from_idx,
    (&["1", "2", "3", "4"], "2"),
    |ctx: &mut Context<Fr>, chip: &GateChip<Fr>, inputs: (&[&str; 4], &str)| {
        let a = inputs
            .0
            .iter()
            .map(|x| ctx.load_constant(Fr::from_str_vartime(x).unwrap()))
            .collect::<Vec<_>>();
        let idx = ctx.load_constant(Fr::from_str_vartime(inputs.1).unwrap());
        chip.select_from_idx(ctx, a, idx);
    },
    |ctx: &mut Halo2LibWasm, inputs: (&[&str; 4], &str)| {
        let a = inputs
            .0
            .iter()
            .map(|x| ctx.constant(x).to_u32().unwrap())
            .collect::<Vec<_>>();
        let idx = ctx.constant(inputs.1);
        ctx.select_from_idx(a.as_slice(), idx);
    }
);

gate_test!(
    test_num_to_bits,
    ("15", "5"),
    |ctx: &mut Context<Fr>, chip: &GateChip<Fr>, inputs: (&str, &str)| {
        let num = ctx.load_constant(Fr::from_str_vartime(inputs.0).unwrap());
        let num_bits = inputs.1.parse().unwrap();
        chip.num_to_bits(ctx, num, num_bits);
    },
    |ctx: &mut Halo2LibWasm, inputs: (&str, &str)| {
        let num = ctx.constant(inputs.0);
        ctx.num_to_bits(num, inputs.1);
    }
);

gate_test!(
    test_constrain_equal,
    ("15",),
    |ctx: &mut Context<Fr>, _, inputs: (&str,)| {
        let a = ctx.load_constant(Fr::from_str_vartime(inputs.0).unwrap());
        let b = ctx.load_constant(Fr::from_str_vartime(inputs.0).unwrap());
        ctx.constrain_equal(&a, &b);
    },
    |ctx: &mut Halo2LibWasm, inputs: (&str,)| {
        let a = ctx.constant(inputs.0);
        let b = ctx.constant(inputs.0);
        ctx.constrain_equal(a, b);
    }
);

gate_test!(
    test_witness,
    ("15",),
    |ctx: &mut Context<Fr>, _, inputs: (&str,)| {
        ctx.load_witness(Fr::from_str_vartime(inputs.0).unwrap());
    },
    |ctx: &mut Halo2LibWasm, inputs: (&str,)| {
        ctx.witness(inputs.0);
    }
);

gate_test!(
    test_constant,
    ("15",),
    |ctx: &mut Context<Fr>, _, inputs: (&str,)| {
        ctx.load_constant(Fr::from_str_vartime(inputs.0).unwrap());
    },
    |ctx: &mut Halo2LibWasm, inputs: (&str,)| {
        ctx.constant(inputs.0);
    }
);

gate_test!(
    test_poseidon,
    &["90", "50", "12", "12"],
    |ctx: &mut Context<Fr>, chip: &GateChip<Fr>, inputs: &[&str]| {
        let inputs = inputs
            .iter()
            .map(|x| ctx.load_constant(Fr::from_str_vartime(x).unwrap()))
            .collect::<Vec<_>>();
        let spec = OptimizedPoseidonSpec::<Fr, T, RATE>::new::<R_F, R_P, SECURE_MDS>();
        let mut hasher = PoseidonHasher::new(spec);
        hasher.initialize_consts(ctx, chip);
        hasher.hash_fix_len_array(ctx, chip, &inputs);
    },
    |ctx: &mut Halo2LibWasm, inputs: &[&str]| {
        let inputs = inputs.iter().map(|x| ctx.constant(x)).collect::<Vec<_>>();
        let inputs = inputs
            .iter()
            .map(|x| x.to_u32().unwrap())
            .collect::<Vec<_>>();
        ctx.poseidon(inputs.as_slice());
    }
);

#[test]
pub fn test_make_public() {
    let base = base_test().run_gate_with_instances(|ctx, _, make_public| {
        let a = ctx.load_constant(Fr::from_str_vartime("10").unwrap());
        make_public.push(a);
    });
    let wasm = base_test().run_wasm_builder_with_instances(|ctx, halo2_wasm| {
        let a = ctx.constant("10");
        ctx.make_public(halo2_wasm, a, 0);
    });
    assert_eq!(base, wasm);
}
