use halo2_base::halo2_proofs::halo2curves::{ff::PrimeField, serde::SerdeObject, CurveAffine};
use halo2_base::utils::ScalarField;
use std::io::{self};
use std::io::{Result, Write};

pub trait Field = ScalarField<Repr = [u8; 32]>;

#[derive(Clone, Debug)]
pub struct PartialVerifyingKey<C: CurveAffine> {
    pub preprocessed: Vec<C>,
    pub transcript_initial_state: C::Scalar,
}

fn write_field_le<F: Field>(writer: &mut impl Write, fe: F) -> Result<()> {
    let repr = ScalarField::to_bytes_le(&fe);
    writer.write_all(&repr)?;
    Ok(())
}

fn write_curve_compressed<C: CurveAffine>(writer: &mut impl Write, point: C) -> Result<()> {
    let compressed = point.to_bytes();
    writer.write_all(compressed.as_ref())?;
    Ok(())
}

pub fn write_partial_vkey<C>(vkey: &PartialVerifyingKey<C>) -> io::Result<Vec<u8>>
where
    C: CurveAffine + SerdeObject,
    C::Scalar: Field + SerdeObject,
{
    let tmp = C::Repr::default();
    let compressed_curve_bytes = tmp.as_ref().len();
    let tmp = <C::Scalar as PrimeField>::Repr::default();
    let field_bytes = tmp.as_ref().len();
    let mut writer =
        Vec::with_capacity(field_bytes + vkey.preprocessed.len() * compressed_curve_bytes);
    write_field_le(&mut writer, vkey.transcript_initial_state)?;
    for &point in &vkey.preprocessed {
        write_curve_compressed(&mut writer, point)?;
    }
    Ok(writer)
}