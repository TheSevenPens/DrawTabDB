import { Tablet } from './types';

export interface FieldMetadata {
    fieldName: keyof Tablet;
    DisplayName: string; // Central user-facing name
    legacyNames: string[];
    isCalculated?: boolean;
    isSystem?: boolean; // For fields like id, CreateDate that should be prefixed with _ on export
    unit?: string;
    type?: 'string' | 'number' | 'boolean' | 'date'; // Basic type hint
}

export const TABLET_FIELDS: FieldMetadata[] = [
    // --- Meta / System ---
    { fieldName: 'id', DisplayName: 'System ID', legacyNames: ['_id'], isSystem: true },
    { fieldName: 'CreateDate', DisplayName: 'Created Date', legacyNames: ['_CreateDate'], isSystem: true },
    { fieldName: 'ModifiedDate', DisplayName: 'Modified Date', legacyNames: ['_ModifiedDate'], isSystem: true },

    // --- Core Model Info ---
    { fieldName: 'ModelId', DisplayName: 'Model ID', legacyNames: ['ModelID'] },
    { fieldName: 'ModelName', DisplayName: 'Model Name', legacyNames: [] },
    { fieldName: 'ModelFamily', DisplayName: 'Family', legacyNames: ['Family'] },
    { fieldName: 'ModelBrand', DisplayName: 'Brand', legacyNames: ['Brand'] },
    { fieldName: 'ModelType', DisplayName: 'Type', legacyNames: ['Type'] },
    { fieldName: 'ModelStatus', DisplayName: 'Status', legacyNames: ['Status'] },
    { fieldName: 'ModelAudience', DisplayName: 'Audience', legacyNames: ['Audience'] },
    { fieldName: 'ModelLaunchYear', DisplayName: 'Launch Year', legacyNames: ['LaunchYear'] },
    { fieldName: 'ModelProductLink', DisplayName: 'Product Link', legacyNames: ['Link'] },
    { fieldName: 'ModelIncludedPen', DisplayName: 'Included Pen', legacyNames: ['IncludedPen'] },
    { fieldName: 'ModelAge', DisplayName: 'Age', legacyNames: ['Age'], isCalculated: true, unit: 'yrs' },

    // --- Physical ---
    { fieldName: 'PhysicalDimensions', DisplayName: 'Dimensions', legacyNames: ['DevSize'], unit: 'mm' },
    { fieldName: 'PhysicalWeight', DisplayName: 'Weight', legacyNames: ['DevWeight'], unit: 'g' },
    { fieldName: 'PhysicalWeightInclStand', DisplayName: 'Weight (+Stand)', legacyNames: ['DevWeightInclStand'], unit: 'g' },

    // --- Digitizer ---
    { fieldName: 'DigitizerDimensions', DisplayName: 'Active Area', legacyNames: ['DigitizerSize'], unit: 'mm' },
    { fieldName: 'DigitizerDiagonal', DisplayName: 'Diagonal Size', legacyNames: ['DigitizerDiag'], isCalculated: true, unit: 'mm' },
    { fieldName: 'DigitizerArea', DisplayName: 'Digitizer Area', legacyNames: [], isCalculated: true, unit: 'cm²' },
    { fieldName: 'DigitizerResolution', DisplayName: 'Resolution', legacyNames: [], unit: 'LPmm' },
    { fieldName: 'DigitizerPressureLevels', DisplayName: 'Pressure Levels', legacyNames: ['PressureLevels'], unit: 'Lvl' },
    { fieldName: 'DigitizerReportRate', DisplayName: 'Report Rate', legacyNames: ['ReportRate'], unit: 'RPS' },
    { fieldName: 'DigitizerType', DisplayName: 'Pen Tech', legacyNames: ['PenTech'] },
    { fieldName: 'DigitizerTilt', DisplayName: 'Tilt', legacyNames: ['Tilt'], unit: '°' },
    { fieldName: 'DigitizerMaxHover', DisplayName: 'Max Hover', legacyNames: ['MaxHover'], unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCenter', DisplayName: 'Accuracy (Center)', legacyNames: ['AccCenter'], unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCorner', DisplayName: 'Accuracy (Corner)', legacyNames: ['AccCorner'], unit: 'mm' },
    { fieldName: 'DigitizerSupportsTouch', DisplayName: 'Touch Support', legacyNames: ['SupportsTouch', 'DisplayTouchCapability'] },

    // --- Display ---
    { fieldName: 'DisplayResolution', DisplayName: 'Display Resolution', legacyNames: [] },
    { fieldName: 'DisplaySize', DisplayName: 'Display Size', legacyNames: [], unit: '"' },
    { fieldName: 'DisplayPixelDensity', DisplayName: 'Pixel Density', legacyNames: ['PixelDensity', 'DisplayXPPI'], isCalculated: true, unit: 'PPI' },
    { fieldName: 'DisplayRefreshRate', DisplayName: 'Refresh Rate', legacyNames: [], unit: 'Hz' },
    { fieldName: 'DisplayResponseTime', DisplayName: 'Response Time', legacyNames: [], unit: 'ms' },
    { fieldName: 'DisplayBrightness', DisplayName: 'Brightness', legacyNames: [], unit: 'nits' },
    { fieldName: 'DisplayContrast', DisplayName: 'Contrast Ratio', legacyNames: [] },
    { fieldName: 'DisplayColorGamuts', DisplayName: 'Color Gamuts', legacyNames: [] },
    { fieldName: 'DisplayColorBitDepth', DisplayName: 'Color Depth', legacyNames: [] },
    { fieldName: 'DisplayViewingAngleHorizontal', DisplayName: 'Viewing Angle (H)', legacyNames: [], unit: 'deg' },
    { fieldName: 'DisplayViewingAngleVertical', DisplayName: 'Viewing Angle (V)', legacyNames: [], unit: 'deg' },
    { fieldName: 'DisplayPanelTech', DisplayName: 'Panel Tech', legacyNames: [] },
    { fieldName: 'DisplayAntiGlare', DisplayName: 'Anti-Glare', legacyNames: ['AntiGlare'] },
    { fieldName: 'DisplayLamination', DisplayName: 'Lamination', legacyNames: ['Lamination'] },
    { fieldName: 'AspectRatio', DisplayName: 'Aspect Ratio', legacyNames: [], isCalculated: true },
];
