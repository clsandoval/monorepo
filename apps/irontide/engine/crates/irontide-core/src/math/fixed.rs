/// Q16.16 fixed-point number for deterministic simulation math.
/// All game simulation uses this type — f32/f64 are only allowed for rendering output.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash, Debug, Default)]
#[repr(transparent)]
pub struct Fixed(i32);

impl Fixed {
    pub const ZERO: Self = Fixed(0);
    pub const ONE: Self = Fixed(1 << 16);
    pub const HALF: Self = Fixed(1 << 15);
    pub const NEG_ONE: Self = Fixed(-(1 << 16));
    pub const MAX: Self = Fixed(i32::MAX);
    pub const MIN: Self = Fixed(i32::MIN);
    pub const FRAC_BITS: u32 = 16;

    pub const fn from_int(n: i32) -> Self {
        Fixed(n << 16)
    }

    pub const fn from_raw(raw: i32) -> Self {
        Fixed(raw)
    }

    pub const fn raw(self) -> i32 {
        self.0
    }

    /// Convert to f32 for rendering only. Never use in simulation.
    pub fn to_f32(self) -> f32 {
        self.0 as f32 / 65536.0
    }

    /// Create from f32. Only use for initialization, never in simulation loop.
    pub fn from_f32(f: f32) -> Self {
        Fixed((f * 65536.0) as i32)
    }

    pub const fn add(self, rhs: Self) -> Self {
        Fixed(self.0.wrapping_add(rhs.0))
    }

    pub const fn sub(self, rhs: Self) -> Self {
        Fixed(self.0.wrapping_sub(rhs.0))
    }

    pub const fn mul(self, rhs: Self) -> Self {
        Fixed(((self.0 as i64 * rhs.0 as i64) >> 16) as i32)
    }

    pub const fn div(self, rhs: Self) -> Self {
        Fixed((((self.0 as i64) << 16) / rhs.0 as i64) as i32)
    }

    pub const fn neg(self) -> Self {
        Fixed(-self.0)
    }

    pub fn abs(self) -> Self {
        Fixed(self.0.abs())
    }

    /// Integer square root via Newton's method (deterministic).
    pub fn sqrt(self) -> Self {
        if self.0 <= 0 {
            return Fixed::ZERO;
        }
        let val = self.0 as i64;
        // Scale up by 16 bits for precision, then Newton's method
        let mut x = (val << 16) as u64;
        let mut guess = x;
        // Initial guess: shift right by half the bit width
        let bits = 64 - x.leading_zeros();
        guess = 1u64 << (bits / 2);

        for _ in 0..32 {
            let next = (guess + x / guess) / 2;
            if next >= guess {
                break;
            }
            guess = next;
        }
        Fixed(guess as i32)
    }

    /// Distance squared (avoids sqrt). Uses i64 to avoid overflow.
    pub fn distance_squared(dx: Fixed, dy: Fixed) -> Fixed {
        dx.mul(dx).add(dy.mul(dy))
    }

    /// Manhattan distance (fast approximation).
    pub fn manhattan_distance(dx: Fixed, dy: Fixed) -> Fixed {
        dx.abs().add(dy.abs())
    }

    pub const fn min(self, other: Self) -> Self {
        if self.0 < other.0 {
            self
        } else {
            other
        }
    }

    pub const fn max(self, other: Self) -> Self {
        if self.0 > other.0 {
            self
        } else {
            other
        }
    }

    pub fn clamp(self, lo: Self, hi: Self) -> Self {
        self.max(lo).min(hi)
    }

    /// Floors to integer part.
    pub const fn floor_int(self) -> i32 {
        self.0 >> 16
    }
}

impl core::ops::Add for Fixed {
    type Output = Self;
    fn add(self, rhs: Self) -> Self {
        Fixed::add(self, rhs)
    }
}

impl core::ops::Sub for Fixed {
    type Output = Self;
    fn sub(self, rhs: Self) -> Self {
        Fixed::sub(self, rhs)
    }
}

impl core::ops::Mul for Fixed {
    type Output = Self;
    fn mul(self, rhs: Self) -> Self {
        Fixed::mul(self, rhs)
    }
}

impl core::ops::Div for Fixed {
    type Output = Self;
    fn div(self, rhs: Self) -> Self {
        Fixed::div(self, rhs)
    }
}

impl core::ops::Neg for Fixed {
    type Output = Self;
    fn neg(self) -> Self {
        Fixed::neg(self)
    }
}

impl core::ops::AddAssign for Fixed {
    fn add_assign(&mut self, rhs: Self) {
        *self = *self + rhs;
    }
}

impl core::ops::SubAssign for Fixed {
    fn sub_assign(&mut self, rhs: Self) {
        *self = *self - rhs;
    }
}

impl core::fmt::Display for Fixed {
    fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
        write!(f, "{:.4}", self.to_f32())
    }
}

impl serde::Serialize for Fixed {
    fn serialize<S: serde::Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        serializer.serialize_i32(self.0)
    }
}

impl<'de> serde::Deserialize<'de> for Fixed {
    fn deserialize<D: serde::Deserializer<'de>>(deserializer: D) -> Result<Self, D::Error> {
        let raw = i32::deserialize(deserializer)?;
        Ok(Fixed(raw))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic_arithmetic() {
        let a = Fixed::from_int(3);
        let b = Fixed::from_int(4);
        assert_eq!((a + b).floor_int(), 7);
        assert_eq!((a - b).floor_int(), -1);
        assert_eq!((a * b).floor_int(), 12);
        assert_eq!((b / a).floor_int(), 1); // 4/3 = 1.333, floor = 1
    }

    #[test]
    fn test_fractional_multiply() {
        let half = Fixed::HALF;
        let four = Fixed::from_int(4);
        let result = half * four;
        assert_eq!(result, Fixed::from_int(2));
    }

    #[test]
    fn test_neg() {
        let a = Fixed::from_int(5);
        assert_eq!((-a).floor_int(), -5);
    }

    #[test]
    fn test_abs() {
        let neg = Fixed::from_int(-7);
        assert_eq!(neg.abs(), Fixed::from_int(7));
        let pos = Fixed::from_int(7);
        assert_eq!(pos.abs(), Fixed::from_int(7));
    }

    #[test]
    fn test_sqrt() {
        let four = Fixed::from_int(4);
        let result = four.sqrt();
        // Should be close to 2.0
        let diff = (result - Fixed::from_int(2)).abs();
        assert!(diff.raw() < 100, "sqrt(4) should be ~2, got {}", result);

        let nine = Fixed::from_int(9);
        let result = nine.sqrt();
        let diff = (result - Fixed::from_int(3)).abs();
        assert!(diff.raw() < 100, "sqrt(9) should be ~3, got {}", result);
    }

    #[test]
    fn test_determinism() {
        // Same operations must always produce the same result
        let a = Fixed::from_raw(123456);
        let b = Fixed::from_raw(789012);
        let r1 = a * b + a - b;
        let r2 = a * b + a - b;
        assert_eq!(r1, r2);
    }

    #[test]
    fn test_to_from_f32() {
        let f = Fixed::from_f32(3.5);
        let back = f.to_f32();
        assert!((back - 3.5).abs() < 0.001);
    }

    #[test]
    fn test_distance_squared() {
        let dx = Fixed::from_int(3);
        let dy = Fixed::from_int(4);
        let dsq = Fixed::distance_squared(dx, dy);
        assert_eq!(dsq.floor_int(), 25); // 3^2 + 4^2 = 25
    }
}
