import { Tablet } from './types';

export interface FieldMetadata {
    fieldName: keyof Tablet;
    DisplayName: string; // Central user-facing name
    DisplayNameShort: string; // Shorter name for compact views
    DisplayNameTiny: string; // Tiniest name for very compact views
    legacyNames: string[];
    Category: string;
    ValueKind: 'String' | 'GUID' | 'DateTime' | 'NumberInt' | 'NumberFloat' | 'EnumYesNo' | 'Complex' | 'Complex2DArea' | 'Complex3DVolume'       // Initially set to String as requested
    isCalculated?: boolean;
    isSystem?: boolean; // For fields like id, CreateDate that should be prefixed with _ on export
    unit?: string;
    type?: 'string' | 'number' | 'boolean' | 'date'; // Basic type hint
}

export const TABLET_FIELDS: FieldMetadata[] = [
    // --- Meta / System ---
    { fieldName: 'id', DisplayName: 'System ID', DisplayNameShort: 'System ID', DisplayNameTiny: 'SysID', legacyNames: ['_id'], Category: 'System', ValueKind: 'String', isSystem: true },
    { fieldName: 'CreateDate', DisplayName: 'Created Date', DisplayNameShort: 'Created Date', DisplayNameTiny: 'SysCreateDate', legacyNames: ['_CreateDate'], Category: 'System', ValueKind: 'DateTime', isSystem: true },
    { fieldName: 'ModifiedDate', DisplayName: 'Modified Date', DisplayNameShort: 'Modified Date', DisplayNameTiny: 'SysLastMode', legacyNames: ['_ModifiedDate'], Category: 'System', ValueKind: 'DateTime', isSystem: true },

    // --- Core Model Info ---
    { fieldName: 'ModelId', DisplayName: 'Model ID', DisplayNameShort: 'ID', DisplayNameTiny: 'ModelID', legacyNames: ['ModelID'], Category: 'Model', ValueKind: 'GUID' },
    { fieldName: 'ModelName', DisplayName: 'Model Name', DisplayNameShort: 'Name', DisplayNameTiny: 'ModelName', legacyNames: [], Category: 'Model', ValueKind: 'String' },
    { fieldName: 'ModelFamily', DisplayName: 'Model Family', DisplayNameShort: 'Family', DisplayNameTiny: 'ModelFamily', legacyNames: ['Family'], Category: 'Model', ValueKind: 'String' },
    { fieldName: 'ModelBrand', DisplayName: 'Model Brand', DisplayNameShort: 'Brand', DisplayNameTiny: 'ModelBrand', legacyNames: ['Brand'], Category: 'Model', ValueKind: 'String' },
    { fieldName: 'ModelType', DisplayName: 'Model Type', DisplayNameShort: 'Type', DisplayNameTiny: 'ModelType', legacyNames: ['Type'], Category: 'Model', ValueKind: 'String' },
    { fieldName: 'ModelStatus', DisplayName: 'Model Status', DisplayNameShort: 'Status', DisplayNameTiny: 'ModelStatus', legacyNames: ['Status'], Category: 'Model', ValueKind: 'String' },
    { fieldName: 'ModelAudience', DisplayName: 'Model Audience', DisplayNameShort: 'Audience', DisplayNameTiny: 'ModelAudience', legacyNames: ['Audience'], Category: 'Model', ValueKind: 'String' },
    { fieldName: 'ModelLaunchYear', DisplayName: 'Model Launch Year', DisplayNameShort: 'Launch Year', DisplayNameTiny: 'ModelYear', legacyNames: ['LaunchYear'], Category: 'Model', ValueKind: 'NumberInt' },
    { fieldName: 'ModelProductLink', DisplayName: 'Model Product Link', DisplayNameShort: 'Product Link', DisplayNameTiny: 'ModelLink', legacyNames: ['Link'], Category: 'Model', ValueKind: 'String' },
    { fieldName: 'ModelIncludedPen', DisplayName: 'Model Included Pen', DisplayNameShort: 'Included Pen', DisplayNameTiny: 'ModelPen', legacyNames: ['IncludedPen'], Category: 'Model', ValueKind: 'EnumYesNo' },
    { fieldName: 'ModelAge', DisplayName: 'Model Age', DisplayNameShort: 'Age', DisplayNameTiny: 'ModelAge', legacyNames: ['Age'], Category: 'Model', ValueKind: 'NumberInt', isCalculated: true, unit: 'yrs' },

    // --- Physical ---
    { fieldName: 'PhysicalDimensions', DisplayName: 'Physical Dimensions', DisplayNameShort: 'Dimensions', DisplayNameTiny: 'PhysDim', legacyNames: ['DevSize'], Category: 'Physical', ValueKind: 'Complex3DVolume', unit: 'mm' },
    { fieldName: 'PhysicalWeight', DisplayName: 'Physical Weight', DisplayNameShort: 'Weight', DisplayNameTiny: 'PhysWeight', legacyNames: ['DevWeight'], Category: 'Physical', ValueKind: 'NumberInt', unit: 'g' },
    { fieldName: 'PhysicalWeightInclStand', DisplayName: 'Physical Weight includes stand', DisplayNameShort: 'Weight includes stand', DisplayNameTiny: 'PhysWeightIncStand', legacyNames: ['DevWeightInclStand'], Category: 'Physical', ValueKind: 'String', unit: 'g' },

    // --- Digitizer ---
    { fieldName: 'DigitizerDimensions', DisplayName: 'Digitizer Dimensions', DisplayNameShort: 'Dimensions', DisplayNameTiny: 'DigitizerDim', legacyNames: ['DigitizerSize'], Category: 'Digitizer', ValueKind: 'Complex2DArea', unit: 'mm' },
    { fieldName: 'DigitizerDiagonal', DisplayName: 'Digitizer Diagonal', DisplayNameShort: 'Diagonal', DisplayNameTiny: 'DigitizerDiag', legacyNames: ['DigitizerDiag'], Category: 'Digitizer', ValueKind: 'NumberFloat', isCalculated: true, unit: 'mm' },
    { fieldName: 'DigitizerArea', DisplayName: 'Digitizer Area', DisplayNameShort: 'Area', DisplayNameTiny: 'DigitizerArea', legacyNames: [], Category: 'Digitizer', ValueKind: 'NumberFloat', isCalculated: true, unit: 'cm²' },
    { fieldName: 'DigitizerResolution', DisplayName: 'Digitizer Resolution', DisplayNameShort: 'Resolution', DisplayNameTiny: 'DigitizerRes', legacyNames: [], Category: 'Digitizer', ValueKind: 'Complex2DArea', unit: 'LPmm' },
    { fieldName: 'DigitizerPressureLevels', DisplayName: 'Digitizer Pressure Levels', DisplayNameShort: 'Pressure Levels', DisplayNameTiny: 'DigitizerPressureLevels', legacyNames: ['PressureLevels'], Category: 'Digitizer', ValueKind: 'NumberInt', unit: 'Lvl' },
    { fieldName: 'DigitizerReportRate', DisplayName: 'Digitizer Report Rate', DisplayNameShort: 'Report Rate', DisplayNameTiny: 'DigitizerReportRate', legacyNames: ['ReportRate'], Category: 'Digitizer', ValueKind: 'NumberInt', unit: 'RPS' },
    { fieldName: 'DigitizerType', DisplayName: 'Digitizer Type', DisplayNameShort: 'Type', DisplayNameTiny: 'DigitizerType', legacyNames: ['PenTech'], Category: 'Digitizer', ValueKind: 'String' },
    { fieldName: 'DigitizerTilt', DisplayName: 'Digitizer Tilt Range', DisplayNameShort: 'Tilt Range', DisplayNameTiny: 'DigitizerTiltRange', legacyNames: ['Tilt'], Category: 'Digitizer', ValueKind: 'NumberInt', unit: '°' },
    { fieldName: 'DigitizerMaxHover', DisplayName: 'Digitizer Max Hover Distance', DisplayNameShort: 'Max Hover Distance', DisplayNameTiny: 'DigitizerHover', legacyNames: ['MaxHover'], Category: 'Digitizer', ValueKind: 'NumberFloat', unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCenter', DisplayName: 'Digitizer Accuracy (Center)', DisplayNameShort: 'Accuracy (Center)', DisplayNameTiny: 'DigitizerAcc(ctr)', legacyNames: ['AccCenter'], Category: 'Digitizer', ValueKind: 'NumberFloat', unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCorner', DisplayName: 'Digitizer Accuracy (Corner)', DisplayNameShort: 'Accuracy (Corner)', DisplayNameTiny: 'DigitizerAcc(crn)', legacyNames: ['AccCorner'], Category: 'Digitizer', ValueKind: 'NumberFloat', unit: 'mm' },
    { fieldName: 'DigitizerSupportsTouch', DisplayName: 'Digitizer Touch Support', DisplayNameShort: 'Touch Support', DisplayNameTiny: 'DigitizerTouch', legacyNames: ['SupportsTouch', 'DisplayTouchCapability'], Category: 'Digitizer', ValueKind: 'EnumYesNo' },
    { fieldName: 'DigitizerAspectRatio', DisplayName: 'Digitizer Aspect Ratio', DisplayNameShort: 'Aspect Ratio', DisplayNameTiny: 'DigitizerAspectRatio', legacyNames: ['AspectRatio'], Category: 'Digitizer', ValueKind: 'String', isCalculated: true },

    // --- Display ---
    { fieldName: 'DisplayResolution', DisplayName: 'Display Resolution', DisplayNameShort: 'Resolution', DisplayNameTiny: 'DispRes', legacyNames: [], Category: 'Display', ValueKind: 'Complex2DArea', unit: 'LPmm' },
    { fieldName: 'DisplayDimensions', DisplayName: 'Display Dimensions', DisplayNameShort: 'Dimensions', DisplayNameTiny: 'DispDim', legacyNames: ['DisplaySize'], Category: 'Display', ValueKind: 'Complex2DArea', unit: '"' },
    { fieldName: 'DisplayPixelDensity', DisplayName: 'Display Pixel Density', DisplayNameShort: 'Pixel Density', DisplayNameTiny: 'DispDensity', legacyNames: ['PixelDensity', 'DisplayXPPI'], Category: 'Display', ValueKind: 'NumberInt', isCalculated: true, unit: 'PPI' },
    { fieldName: 'DisplayRefreshRate', DisplayName: 'Display Refresh Rate', DisplayNameShort: 'Refresh Rate', DisplayNameTiny: 'DispRefresh', legacyNames: [], Category: 'Display', ValueKind: 'NumberInt', unit: 'Hz' },
    { fieldName: 'DisplayResponseTime', DisplayName: 'Display Response Time', DisplayNameShort: 'Response Time', DisplayNameTiny: 'DispResp', legacyNames: [], Category: 'Display', ValueKind: 'NumberInt', unit: 'ms' },
    { fieldName: 'DisplayBrightness', DisplayName: 'Display Brightness', DisplayNameShort: 'Brightness', DisplayNameTiny: 'DispBrightness', legacyNames: [], Category: 'Display', ValueKind: 'NumberInt', unit: 'nits' },
    { fieldName: 'DisplayContrast', DisplayName: 'Display Contrast Ratio', DisplayNameShort: 'Contrast Ratio', DisplayNameTiny: 'DispContrast', legacyNames: [], Category: 'Display', ValueKind: 'NumberInt' },
    { fieldName: 'DisplayColorGamuts', DisplayName: 'Display Color Gamuts', DisplayNameShort: 'Color Gamuts', DisplayNameTiny: 'DispColor', legacyNames: [], Category: 'Display', ValueKind: 'String' },
    { fieldName: 'DisplayColorBitDepth', DisplayName: 'Display Color Bit Depth', DisplayNameShort: 'Color Bit Depth', DisplayNameTiny: 'DispColorDepth', legacyNames: [], Category: 'Display', ValueKind: 'NumberInt' },
    { fieldName: 'DisplayViewingAngleHorizontal', DisplayName: 'Display Viewing Angle (H)', DisplayNameShort: 'Viewing Angle (H)', DisplayNameTiny: 'DispVieAngle(H)', legacyNames: [], Category: 'Display', ValueKind: 'NumberInt', unit: 'deg' },
    { fieldName: 'DisplayViewingAngleVertical', DisplayName: 'Display Viewing Angle (V)', DisplayNameShort: 'Viewing Angle (V)', DisplayNameTiny: 'DispViewAngle(V)', legacyNames: [], Category: 'Display', ValueKind: 'NumberInt', unit: 'deg' },
    { fieldName: 'DisplayPanelTech', DisplayName: 'Display Panel Tech', DisplayNameShort: 'Panel Tech', DisplayNameTiny: 'DispTech', legacyNames: [], Category: 'Display', ValueKind: 'String' },
    { fieldName: 'DisplayAntiGlare', DisplayName: 'Display Anti-Glare', DisplayNameShort: 'Anti-Glare', DisplayNameTiny: 'DispAntiGlare', legacyNames: ['AntiGlare'], Category: 'Display', ValueKind: 'String' },
    { fieldName: 'DisplayLamination', DisplayName: 'Display Lamination', DisplayNameShort: 'Lamination', DisplayNameTiny: 'DispLamination', legacyNames: ['Lamination'], Category: 'Display', ValueKind: 'EnumYesNo' },

    // --- Calculated/Other ---

];
