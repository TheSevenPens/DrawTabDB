import { Tablet } from './types';

export interface FieldMetadata {
    fieldName: keyof Tablet;
    legacyNames: string[];
    isCalculated?: boolean;
    isSystem?: boolean; // For fields like id, CreateDate that should be prefixed with _ on export
    unit?: string;
    type?: 'string' | 'number' | 'boolean' | 'date'; // Basic type hint
}

export const TABLET_FIELDS: FieldMetadata[] = [
    // --- Meta / System ---
    { fieldName: 'id', legacyNames: ['_id'], isSystem: true },
    { fieldName: 'CreateDate', legacyNames: ['_CreateDate'], isSystem: true },
    { fieldName: 'ModifiedDate', legacyNames: ['_ModifiedDate'], isSystem: true },

    // --- Core Model Info ---
    { fieldName: 'ModelId', legacyNames: ['ModelID'] },
    { fieldName: 'ModelName', legacyNames: [] },
    { fieldName: 'ModelFamily', legacyNames: ['Family'] },
    { fieldName: 'ModelBrand', legacyNames: ['Brand'] },
    { fieldName: 'ModelType', legacyNames: ['Type'] },
    { fieldName: 'ModelStatus', legacyNames: ['Status'] },
    { fieldName: 'ModelAudience', legacyNames: ['Audience'] },
    { fieldName: 'ModelLaunchYear', legacyNames: ['LaunchYear'] },
    { fieldName: 'ModelProductLink', legacyNames: ['Link'] },
    { fieldName: 'ModelIncludedPen', legacyNames: ['IncludedPen'] },
    { fieldName: 'ModelAge', legacyNames: ['Age'], isCalculated: true, unit: 'yrs' },

    // --- Physical ---
    { fieldName: 'PhysicalDimensions', legacyNames: ['DevSize'], unit: 'mm' },
    { fieldName: 'PhysicalWeight', legacyNames: ['DevWeight'], unit: 'g' },
    { fieldName: 'PhysicalWeightInclStand', legacyNames: ['DevWeightInclStand'], unit: 'g' },

    // --- Digitizer ---
    { fieldName: 'DigitizerDimensions', legacyNames: ['DigitizerSize'], unit: 'mm' },
    { fieldName: 'DigitizerDiagonal', legacyNames: ['DigitizerDiag'], isCalculated: true, unit: 'mm' },
    { fieldName: 'DigitizerArea', legacyNames: [], isCalculated: true, unit: 'cm²' },
    { fieldName: 'DigitizerResolution', legacyNames: [], unit: 'LPmm' },
    { fieldName: 'DigitizerPressureLevels', legacyNames: ['PressureLevels'], unit: 'Lvl' },
    { fieldName: 'DigitizerReportRate', legacyNames: ['ReportRate'], unit: 'RPS' },
    { fieldName: 'DigitizerType', legacyNames: ['PenTech'] },
    { fieldName: 'DigitizerTilt', legacyNames: ['Tilt'], unit: '°' },
    { fieldName: 'DigitizerMaxHover', legacyNames: ['MaxHover'], unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCenter', legacyNames: ['AccCenter'], unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCorner', legacyNames: ['AccCorner'], unit: 'mm' },
    { fieldName: 'DigitizerSupportsTouch', legacyNames: ['SupportsTouch', 'DisplayTouchCapability'] },

    // --- Display ---
    { fieldName: 'DisplayResolution', legacyNames: [] },
    { fieldName: 'DisplaySize', legacyNames: [], unit: '"' },
    { fieldName: 'DisplayPixelDensity', legacyNames: ['PixelDensity', 'DisplayXPPI'], isCalculated: true, unit: 'PPI' },
    { fieldName: 'DisplayRefreshRate', legacyNames: [], unit: 'Hz' },
    { fieldName: 'DisplayResponseTime', legacyNames: [], unit: 'ms' },
    { fieldName: 'DisplayBrightness', legacyNames: [], unit: 'nits' },
    { fieldName: 'DisplayContrast', legacyNames: [] },
    { fieldName: 'DisplayColorGamuts', legacyNames: [] },
    { fieldName: 'DisplayColorBitDepth', legacyNames: [] },
    { fieldName: 'DisplayViewingAngleHorizontal', legacyNames: [], unit: 'deg' },
    { fieldName: 'DisplayViewingAngleVertical', legacyNames: [], unit: 'deg' },
    { fieldName: 'DisplayPanelTech', legacyNames: [] },
    { fieldName: 'DisplayAntiGlare', legacyNames: ['AntiGlare'] },
    { fieldName: 'DisplayLamination', legacyNames: ['Lamination'] },
    { fieldName: 'AspectRatio', legacyNames: [], isCalculated: true },
];
