import { Tablet } from './types';

export interface FieldMetadata {
    fieldName: keyof Tablet;
    DisplayName: string; // Central user-facing name
    DisplayNameShort: string; // Shorter name for compact views
    legacyNames: string[];
    Category: string;
    isCalculated?: boolean;
    isSystem?: boolean; // For fields like id, CreateDate that should be prefixed with _ on export
    unit?: string;
    type?: 'string' | 'number' | 'boolean' | 'date'; // Basic type hint
}

export const TABLET_FIELDS: FieldMetadata[] = [
    // --- Meta / System ---
    { fieldName: 'id', DisplayName: 'System ID', DisplayNameShort: 'System ID', legacyNames: ['_id'], Category: 'System', isSystem: true },
    { fieldName: 'CreateDate', DisplayName: 'Created Date', DisplayNameShort: 'Created Date', legacyNames: ['_CreateDate'], Category: 'System', isSystem: true },
    { fieldName: 'ModifiedDate', DisplayName: 'Modified Date', DisplayNameShort: 'Modified Date', legacyNames: ['_ModifiedDate'], Category: 'System', isSystem: true },

    // --- Core Model Info ---
    { fieldName: 'ModelId', DisplayName: 'Model ID', DisplayNameShort: 'ID', legacyNames: ['ModelID'], Category: 'General' },
    { fieldName: 'ModelName', DisplayName: 'Model Name', DisplayNameShort: 'Name', legacyNames: [], Category: 'General' },
    { fieldName: 'ModelFamily', DisplayName: 'Model Family', DisplayNameShort: 'Family', legacyNames: ['Family'], Category: 'General' },
    { fieldName: 'ModelBrand', DisplayName: 'Model Brand', DisplayNameShort: 'Brand', legacyNames: ['Brand'], Category: 'General' },
    { fieldName: 'ModelType', DisplayName: 'Model Type', DisplayNameShort: 'Type', legacyNames: ['Type'], Category: 'General' },
    { fieldName: 'ModelStatus', DisplayName: 'Model Status', DisplayNameShort: 'Status', legacyNames: ['Status'], Category: 'General' },
    { fieldName: 'ModelAudience', DisplayName: 'Model Audience', DisplayNameShort: 'Audience', legacyNames: ['Audience'], Category: 'General' },
    { fieldName: 'ModelLaunchYear', DisplayName: 'Model Launch Year', DisplayNameShort: 'Launch Year', legacyNames: ['LaunchYear'], Category: 'General' },
    { fieldName: 'ModelProductLink', DisplayName: 'Model Product Link', DisplayNameShort: 'Product Link', legacyNames: ['Link'], Category: 'General' },
    { fieldName: 'ModelIncludedPen', DisplayName: 'Model Included Pen', DisplayNameShort: 'Included Pen', legacyNames: ['IncludedPen'], Category: 'General' },
    { fieldName: 'ModelAge', DisplayName: 'Model Age', DisplayNameShort: 'Age', legacyNames: ['Age'], Category: 'General', isCalculated: true, unit: 'yrs' },

    // --- Physical ---
    { fieldName: 'PhysicalDimensions', DisplayName: 'Physical Dimensions', DisplayNameShort: 'Device Dimensions', legacyNames: ['DevSize'], Category: 'Physical', unit: 'mm' },
    { fieldName: 'PhysicalWeight', DisplayName: 'Physical Weight', DisplayNameShort: 'Device Weight', legacyNames: ['DevWeight'], Category: 'Physical', unit: 'g' },
    { fieldName: 'PhysicalWeightInclStand', DisplayName: 'Physical Weight includes stand', DisplayNameShort: 'Weight includes stand', legacyNames: ['DevWeightInclStand'], Category: 'Physical', unit: 'g' },

    // --- Digitizer ---
    { fieldName: 'DigitizerDimensions', DisplayName: 'Digitizer Dimensions', DisplayNameShort: 'Dimensions', legacyNames: ['DigitizerSize'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerDiagonal', DisplayName: 'Digitizer Diagonal', DisplayNameShort: 'Diagonal', legacyNames: ['DigitizerDiag'], Category: 'Digitizer', isCalculated: true, unit: 'mm' },
    { fieldName: 'DigitizerArea', DisplayName: 'Digitizer Area', DisplayNameShort: 'Area', legacyNames: [], Category: 'Digitizer', isCalculated: true, unit: 'cm²' },
    { fieldName: 'DigitizerResolution', DisplayName: 'Digitizer Resolution', DisplayNameShort: 'Resolution', legacyNames: [], Category: 'Digitizer', unit: 'LPmm' },
    { fieldName: 'DigitizerPressureLevels', DisplayName: 'Digitizer Pressure Levels', DisplayNameShort: 'Pressure Levels', legacyNames: ['PressureLevels'], Category: 'Digitizer', unit: 'Lvl' },
    { fieldName: 'DigitizerReportRate', DisplayName: 'Digitizer Report Rate', DisplayNameShort: 'Report Rate', legacyNames: ['ReportRate'], Category: 'Digitizer', unit: 'RPS' },
    { fieldName: 'DigitizerType', DisplayName: 'Digitizer Type', DisplayNameShort: 'Type', legacyNames: ['PenTech'], Category: 'Digitizer' },
    { fieldName: 'DigitizerTilt', DisplayName: 'Digitizer Tilt Range', DisplayNameShort: 'Tilt Range', legacyNames: ['Tilt'], Category: 'Digitizer', unit: '°' },
    { fieldName: 'DigitizerMaxHover', DisplayName: 'Digitizer Max Hover Distance', DisplayNameShort: 'Max Hover Distance', legacyNames: ['MaxHover'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCenter', DisplayName: 'Digitizer Accuracy (Center)', DisplayNameShort: 'Accuracy (Center)', legacyNames: ['AccCenter'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCorner', DisplayName: 'Digitizer Accuracy (Corner)', DisplayNameShort: 'Accuracy (Corner)', legacyNames: ['AccCorner'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerSupportsTouch', DisplayName: 'Digitizer Touch Support', DisplayNameShort: 'Touch Support', legacyNames: ['SupportsTouch', 'DisplayTouchCapability'], Category: 'Digitizer' },
    { fieldName: 'DigitizerAspectRatio', DisplayName: 'Digitizer Aspect Ratio', DisplayNameShort: 'Aspect Ratio', legacyNames: ['AspectRatio'], Category: 'Digitizer', isCalculated: true },

    // --- Display ---
    { fieldName: 'DisplayResolution', DisplayName: 'Display Resolution', DisplayNameShort: 'Resolution', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayDimensions', DisplayName: 'Display Dimensions', DisplayNameShort: 'Dimensions', legacyNames: ['DisplaySize'], Category: 'Display', unit: '"' },
    { fieldName: 'DisplayPixelDensity', DisplayName: 'Display Pixel Density', DisplayNameShort: 'Pixel Density', legacyNames: ['PixelDensity', 'DisplayXPPI'], Category: 'Display', isCalculated: true, unit: 'PPI' },
    { fieldName: 'DisplayRefreshRate', DisplayName: 'Display Refresh Rate', DisplayNameShort: 'Refresh Rate', legacyNames: [], Category: 'Display', unit: 'Hz' },
    { fieldName: 'DisplayResponseTime', DisplayName: 'Display Response Time', DisplayNameShort: 'Response Time', legacyNames: [], Category: 'Display', unit: 'ms' },
    { fieldName: 'DisplayBrightness', DisplayName: 'Display Brightness', DisplayNameShort: 'Brightness', legacyNames: [], Category: 'Display', unit: 'nits' },
    { fieldName: 'DisplayContrast', DisplayName: 'Display Contrast Ratio', DisplayNameShort: 'Contrast Ratio', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayColorGamuts', DisplayName: 'Display Color Gamuts', DisplayNameShort: 'Color Gamuts', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayColorBitDepth', DisplayName: 'Display Color Bit Depth', DisplayNameShort: 'Color Bit Depth', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayViewingAngleHorizontal', DisplayName: 'Display Viewing Angle (H)', DisplayNameShort: 'Viewing Angle (H)', legacyNames: [], Category: 'Display', unit: 'deg' },
    { fieldName: 'DisplayViewingAngleVertical', DisplayName: 'Display Viewing Angle (V)', DisplayNameShort: 'Viewing Angle (V)', legacyNames: [], Category: 'Display', unit: 'deg' },
    { fieldName: 'DisplayPanelTech', DisplayName: 'Display Panel Tech', DisplayNameShort: 'Panel Tech', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayAntiGlare', DisplayName: 'Display Anti-Glare', DisplayNameShort: 'Anti-Glare', legacyNames: ['AntiGlare'], Category: 'Display' },
    { fieldName: 'DisplayLamination', DisplayName: 'Display Lamination', DisplayNameShort: 'Lamination', legacyNames: ['Lamination'], Category: 'Display' },

    // --- Calculated/Other ---

];
