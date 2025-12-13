import { Tablet } from './types';

export interface FieldMetadata {
    fieldName: keyof Tablet;
    DisplayName: string; // Central user-facing name
    legacyNames: string[];
    Category: string;
    isCalculated?: boolean;
    isSystem?: boolean; // For fields like id, CreateDate that should be prefixed with _ on export
    unit?: string;
    type?: 'string' | 'number' | 'boolean' | 'date'; // Basic type hint
}

export const TABLET_FIELDS: FieldMetadata[] = [
    // --- Meta / System ---
    { fieldName: 'id', DisplayName: 'System ID', legacyNames: ['_id'], Category: 'System', isSystem: true },
    { fieldName: 'CreateDate', DisplayName: 'Created Date', legacyNames: ['_CreateDate'], Category: 'System', isSystem: true },
    { fieldName: 'ModifiedDate', DisplayName: 'Modified Date', legacyNames: ['_ModifiedDate'], Category: 'System', isSystem: true },

    // --- Core Model Info ---
    { fieldName: 'ModelId', DisplayName: 'Model ID', legacyNames: ['ModelID'], Category: 'General' },
    { fieldName: 'ModelName', DisplayName: 'Model Name', legacyNames: [], Category: 'General' },
    { fieldName: 'ModelFamily', DisplayName: 'Family', legacyNames: ['Family'], Category: 'General' },
    { fieldName: 'ModelBrand', DisplayName: 'Brand', legacyNames: ['Brand'], Category: 'General' },
    { fieldName: 'ModelType', DisplayName: 'Type', legacyNames: ['Type'], Category: 'General' },
    { fieldName: 'ModelStatus', DisplayName: 'Status', legacyNames: ['Status'], Category: 'General' },
    { fieldName: 'ModelAudience', DisplayName: 'Audience', legacyNames: ['Audience'], Category: 'General' },
    { fieldName: 'ModelLaunchYear', DisplayName: 'Launch Year', legacyNames: ['LaunchYear'], Category: 'General' },
    { fieldName: 'ModelProductLink', DisplayName: 'Product Link', legacyNames: ['Link'], Category: 'General' },
    { fieldName: 'ModelIncludedPen', DisplayName: 'Included Pen', legacyNames: ['IncludedPen'], Category: 'General' },
    { fieldName: 'ModelAge', DisplayName: 'Age', legacyNames: ['Age'], Category: 'General', isCalculated: true, unit: 'yrs' },

    // --- Physical ---
    { fieldName: 'PhysicalDimensions', DisplayName: 'Dimensions', legacyNames: ['DevSize'], Category: 'Physical', unit: 'mm' },
    { fieldName: 'PhysicalWeight', DisplayName: 'Weight', legacyNames: ['DevWeight'], Category: 'Physical', unit: 'g' },
    { fieldName: 'PhysicalWeightInclStand', DisplayName: 'Weight (+Stand)', legacyNames: ['DevWeightInclStand'], Category: 'Physical', unit: 'g' },

    // --- Digitizer ---
    { fieldName: 'DigitizerDimensions', DisplayName: 'Active Area', legacyNames: ['DigitizerSize'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerDiagonal', DisplayName: 'Diagonal Size', legacyNames: ['DigitizerDiag'], Category: 'Digitizer', isCalculated: true, unit: 'mm' },
    { fieldName: 'DigitizerArea', DisplayName: 'Digitizer Area', legacyNames: [], Category: 'Digitizer', isCalculated: true, unit: 'cm²' },
    { fieldName: 'DigitizerResolution', DisplayName: 'Resolution', legacyNames: [], Category: 'Digitizer', unit: 'LPmm' },
    { fieldName: 'DigitizerPressureLevels', DisplayName: 'Pressure Levels', legacyNames: ['PressureLevels'], Category: 'Digitizer', unit: 'Lvl' },
    { fieldName: 'DigitizerReportRate', DisplayName: 'Report Rate', legacyNames: ['ReportRate'], Category: 'Digitizer', unit: 'RPS' },
    { fieldName: 'DigitizerType', DisplayName: 'Pen Tech', legacyNames: ['PenTech'], Category: 'Digitizer' },
    { fieldName: 'DigitizerTilt', DisplayName: 'Tilt', legacyNames: ['Tilt'], Category: 'Digitizer', unit: '°' },
    { fieldName: 'DigitizerMaxHover', DisplayName: 'Max Hover', legacyNames: ['MaxHover'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCenter', DisplayName: 'Accuracy (Center)', legacyNames: ['AccCenter'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCorner', DisplayName: 'Accuracy (Corner)', legacyNames: ['AccCorner'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerSupportsTouch', DisplayName: 'Touch Support', legacyNames: ['SupportsTouch', 'DisplayTouchCapability'], Category: 'Digitizer' },

    // --- Display ---
    { fieldName: 'DisplayResolution', DisplayName: 'Display Resolution', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplaySize', DisplayName: 'Display Size', legacyNames: [], Category: 'Display', unit: '"' },
    { fieldName: 'DisplayPixelDensity', DisplayName: 'Pixel Density', legacyNames: ['PixelDensity', 'DisplayXPPI'], Category: 'Display', isCalculated: true, unit: 'PPI' },
    { fieldName: 'DisplayRefreshRate', DisplayName: 'Refresh Rate', legacyNames: [], Category: 'Display', unit: 'Hz' },
    { fieldName: 'DisplayResponseTime', DisplayName: 'Response Time', legacyNames: [], Category: 'Display', unit: 'ms' },
    { fieldName: 'DisplayBrightness', DisplayName: 'Brightness', legacyNames: [], Category: 'Display', unit: 'nits' },
    { fieldName: 'DisplayContrast', DisplayName: 'Contrast Ratio', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayColorGamuts', DisplayName: 'Color Gamuts', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayColorBitDepth', DisplayName: 'Color Depth', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayViewingAngleHorizontal', DisplayName: 'Viewing Angle (H)', legacyNames: [], Category: 'Display', unit: 'deg' },
    { fieldName: 'DisplayViewingAngleVertical', DisplayName: 'Viewing Angle (V)', legacyNames: [], Category: 'Display', unit: 'deg' },
    { fieldName: 'DisplayPanelTech', DisplayName: 'Panel Tech', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayAntiGlare', DisplayName: 'Anti-Glare', legacyNames: ['AntiGlare'], Category: 'Display' },
    { fieldName: 'DisplayLamination', DisplayName: 'Lamination', legacyNames: ['Lamination'], Category: 'Display' },
    { fieldName: 'AspectRatio', DisplayName: 'Aspect Ratio', legacyNames: [], Category: 'Display', isCalculated: true },
];
