pub fn fnv1a(bytes: &[u8]) -> String {
    let mut hash: u32 = 0x811c_9dc5;
    for &byte in bytes {
        hash ^= u32::from(byte);
        hash = hash.wrapping_mul(0x0100_0193);
    }
    format!("{hash:08x}")
}

#[cfg(test)]
mod tests {
    use super::fnv1a;

    #[test]
    fn matches_reference_vectors() {
        assert_eq!(fnv1a(b""), "811c9dc5");
        assert_eq!(fnv1a(b"a"), "e40c292c");
        assert_eq!(fnv1a(b"foobar"), "bf9cf968");
    }
}
