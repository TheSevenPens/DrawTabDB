
export interface Dimensions {
    width: number;
    height: number;
    unit?: 'mm' | 'in';
}

/**
 * Parses a dimension string like "293 x 165" or "293.7 x 165.2".
 * Supports various separators and optional units in the string (though simpler is better).
 */
export const parseDimensions = (raw: string | undefined | null): Dimensions | null => {
    if (!raw) return null;

    const dimRegex = /(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/;
    const match = raw.match(dimRegex);

    if (match) {
        const w = parseFloat(match[1]);
        const h = parseFloat(match[2]);

        if (isNaN(w) || isNaN(h)) return null;

        return { width: w, height: h, unit: 'mm' }; // Default assumption is mm based on existing code
    }
    return null;
};

/**
 * Calculates aspect ratio string (e.g., "16:9") from dimensions.
 */
export const calculateAspectRatio = (dims: Dimensions | null): string | undefined => {
    if (!dims || dims.height === 0) return undefined;

    const ratio = dims.width / dims.height;
    const tol = 0.05;

    if (Math.abs(ratio - (16 / 9)) < tol) return '16:9';
    if (Math.abs(ratio - (16 / 10)) < tol) return '16:10';
    if (Math.abs(ratio - (4 / 3)) < tol) return '4:3';
    if (Math.abs(ratio - (3 / 2)) < tol) return '3:2';
    if (Math.abs(ratio - 1) < tol) return '1:1';
    if (Math.abs(ratio - (21 / 9)) < tol) return '21:9';

    return `${ratio.toFixed(2)}:1`;
};

/**
 * Calculates diagonal size from dimensions.
 * Returns value in same unit as dimensions.
 */
export const calculateDiagonal = (dims: Dimensions | null): number | undefined => {
    if (!dims) return undefined;
    return Math.sqrt(dims.width * dims.width + dims.height * dims.height);
};

/**
 * Calculates area from dimensions.
 */
export const calculateArea = (dims: Dimensions | null): number | undefined => {
    if (!dims) return undefined;
    return dims.width * dims.height;
};
