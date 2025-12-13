
/**
 * Converts millimeters to inches.
 */
export const mmToInches = (mm: number): number => mm / 25.4;

/**
 * Converts inches to millimeters.
 */
export const inchesToMm = (inches: number): number => inches * 25.4;

/**
 * Converts Lines Per Millimeter (lpmm) to Lines Per Inch (lpi).
 */
export const lpmToLpi = (lpm: number): number => lpm * 25.4;

/**
 * Converts Kilograms to Pounds.
 */
export const kgsToLbs = (kg: number): number => kg * 2.20462;

/**
 * Parses a string to a float, returning null if invalid/empty.
 */
export const parseNumber = (val: string | undefined | null): number | null => {
    if (!val) return null;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
};
