import { Tablet } from './types';

export interface FieldMetadata {
    fieldName: keyof Tablet;
    DisplayName: string; // Central user-facing name
    DisplayNameShort: string; // Shorter name for compact views
    DisplayNameTiny: string; // Tiniest name for very compact views
    legacyNames: string[];
    Category: string;
    isCalculated?: boolean;
    isSystem?: boolean; // For fields like id, CreateDate that should be prefixed with _ on export
    unit?: string;
    type?: 'string' | 'number' | 'boolean' | 'date'; // Basic type hint
}

export const TABLET_FIELDS: FieldMetadata[] = [
    // --- Meta / System ---
    { fieldName: 'id', DisplayName: 'System ID', DisplayNameShort: 'System ID', DisplayNameTiny: 'SysID', legacyNames: ['_id'], Category: 'System', isSystem: true },
    { fieldName: 'CreateDate', DisplayName: 'Created Date', DisplayNameShort: 'Created Date', DisplayNameTiny: 'SysCreateDate', legacyNames: ['_CreateDate'], Category: 'System', isSystem: true },
    { fieldName: 'ModifiedDate', DisplayName: 'Modified Date', DisplayNameShort: 'Modified Date', DisplayNameTiny: 'SysLastMode', legacyNames: ['_ModifiedDate'], Category: 'System', isSystem: true },

    // --- Core Model Info ---
    { fieldName: 'ModelId', DisplayName: 'Model ID', DisplayNameShort: 'ID', DisplayNameTiny: 'ModelID', legacyNames: ['ModelID'], Category: 'Model' },
    { fieldName: 'ModelName', DisplayName: 'Model Name', DisplayNameShort: 'Name', DisplayNameTiny: 'ModelName', legacyNames: [], Category: 'Model' },
    { fieldName: 'ModelFamily', DisplayName: 'Model Family', DisplayNameShort: 'Family', DisplayNameTiny: 'ModelFamily', legacyNames: ['Family'], Category: 'Model' },
    { fieldName: 'ModelBrand', DisplayName: 'Model Brand', DisplayNameShort: 'Brand', DisplayNameTiny: 'ModelBrand', legacyNames: ['Brand'], Category: 'Model' },
    { fieldName: 'ModelType', DisplayName: 'Model Type', DisplayNameShort: 'Type', DisplayNameTiny: 'ModelType', legacyNames: ['Type'], Category: 'Model' },
    { fieldName: 'ModelStatus', DisplayName: 'Model Status', DisplayNameShort: 'Status', DisplayNameTiny: 'ModelStatus', legacyNames: ['Status'], Category: 'Model' },
    { fieldName: 'ModelAudience', DisplayName: 'Model Audience', DisplayNameShort: 'Audience', DisplayNameTiny: 'ModelAudience', legacyNames: ['Audience'], Category: 'Model' },
    { fieldName: 'ModelLaunchYear', DisplayName: 'Model Launch Year', DisplayNameShort: 'Launch Year', DisplayNameTiny: 'ModelYear', legacyNames: ['LaunchYear'], Category: 'Model' },
    { fieldName: 'ModelProductLink', DisplayName: 'Model Product Link', DisplayNameShort: 'Product Link', DisplayNameTiny: 'ModelLink', legacyNames: ['Link'], Category: 'Model' },
    { fieldName: 'ModelIncludedPen', DisplayName: 'Model Included Pen', DisplayNameShort: 'Included Pen', DisplayNameTiny: 'ModelPen', legacyNames: ['IncludedPen'], Category: 'Model' },
    { fieldName: 'ModelAge', DisplayName: 'Model Age', DisplayNameShort: 'Age', DisplayNameTiny: 'ModelAge', legacyNames: ['Age'], Category: 'Model', isCalculated: true, unit: 'yrs' },

    // --- Physical ---
    { fieldName: 'PhysicalDimensions', DisplayName: 'Physical Dimensions', DisplayNameShort: 'Dimensions', DisplayNameTiny: 'PhysDim', legacyNames: ['DevSize'], Category: 'Physical', unit: 'mm' },
    { fieldName: 'PhysicalWeight', DisplayName: 'Physical Weight', DisplayNameShort: 'Weight', DisplayNameTiny: 'PhysWeight', legacyNames: ['DevWeight'], Category: 'Physical', unit: 'g' },
    { fieldName: 'PhysicalWeightInclStand', DisplayName: 'Physical Weight includes stand', DisplayNameShort: 'Weight includes stand', DisplayNameTiny: 'PhysWeightIncStand', legacyNames: ['DevWeightInclStand'], Category: 'Physical', unit: 'g' },

    // --- Digitizer ---
    { fieldName: 'DigitizerDimensions', DisplayName: 'Digitizer Dimensions', DisplayNameShort: 'Dimensions', DisplayNameTiny: 'DigitizerDim', legacyNames: ['DigitizerSize'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerDiagonal', DisplayName: 'Digitizer Diagonal', DisplayNameShort: 'Diagonal', DisplayNameTiny: 'DigitizerDiag', legacyNames: ['DigitizerDiag'], Category: 'Digitizer', isCalculated: true, unit: 'mm' },
    { fieldName: 'DigitizerArea', DisplayName: 'Digitizer Area', DisplayNameShort: 'Area', DisplayNameTiny: 'DigitizerArea', legacyNames: [], Category: 'Digitizer', isCalculated: true, unit: 'cm²' },
    { fieldName: 'DigitizerResolution', DisplayName: 'Digitizer Resolution', DisplayNameShort: 'Resolution', DisplayNameTiny: 'DigitizerRes', legacyNames: [], Category: 'Digitizer', unit: 'LPmm' },
    { fieldName: 'DigitizerPressureLevels', DisplayName: 'Digitizer Pressure Levels', DisplayNameShort: 'Pressure Levels', DisplayNameTiny: 'DigitizerPressureLevels', legacyNames: ['PressureLevels'], Category: 'Digitizer', unit: 'Lvl' },
    { fieldName: 'DigitizerReportRate', DisplayName: 'Digitizer Report Rate', DisplayNameShort: 'Report Rate', DisplayNameTiny: 'DigitizerReportRate', legacyNames: ['ReportRate'], Category: 'Digitizer', unit: 'RPS' },
    { fieldName: 'DigitizerType', DisplayName: 'Digitizer Type', DisplayNameShort: 'Type', DisplayNameTiny: 'DigitizerType', legacyNames: ['PenTech'], Category: 'Digitizer' },
    { fieldName: 'DigitizerTilt', DisplayName: 'Digitizer Tilt Range', DisplayNameShort: 'Tilt Range', DisplayNameTiny: 'DigitizerTiltRange', legacyNames: ['Tilt'], Category: 'Digitizer', unit: '°' },
    { fieldName: 'DigitizerMaxHover', DisplayName: 'Digitizer Max Hover Distance', DisplayNameShort: 'Max Hover Distance', DisplayNameTiny: 'DigitizerHover', legacyNames: ['MaxHover'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCenter', DisplayName: 'Digitizer Accuracy (Center)', DisplayNameShort: 'Accuracy (Center)', DisplayNameTiny: 'DigitizerAcc(ctr)', legacyNames: ['AccCenter'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerAccuracyCorner', DisplayName: 'Digitizer Accuracy (Corner)', DisplayNameShort: 'Accuracy (Corner)', DisplayNameTiny: 'DigitizerAcc(crn)', legacyNames: ['AccCorner'], Category: 'Digitizer', unit: 'mm' },
    { fieldName: 'DigitizerSupportsTouch', DisplayName: 'Digitizer Touch Support', DisplayNameShort: 'Touch Support', DisplayNameTiny: 'DigitizerTouch', legacyNames: ['SupportsTouch', 'DisplayTouchCapability'], Category: 'Digitizer' },
    { fieldName: 'DigitizerAspectRatio', DisplayName: 'Digitizer Aspect Ratio', DisplayNameShort: 'Aspect Ratio', DisplayNameTiny: 'DigitizerAspectRatio', legacyNames: ['AspectRatio'], Category: 'Digitizer', isCalculated: true },

    // --- Display ---
    { fieldName: 'DisplayResolution', DisplayName: 'Display Resolution', DisplayNameShort: 'Resolution', DisplayNameTiny: 'DispRes', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayDimensions', DisplayName: 'Display Dimensions', DisplayNameShort: 'Dimensions', DisplayNameTiny: 'DispDim', legacyNames: ['DisplaySize'], Category: 'Display', unit: '"' },
    { fieldName: 'DisplayPixelDensity', DisplayName: 'Display Pixel Density', DisplayNameShort: 'Pixel Density', DisplayNameTiny: 'DispDensity', legacyNames: ['PixelDensity', 'DisplayXPPI'], Category: 'Display', isCalculated: true, unit: 'PPI' },
    { fieldName: 'DisplayRefreshRate', DisplayName: 'Display Refresh Rate', DisplayNameShort: 'Refresh Rate', DisplayNameTiny: 'DispRefresh', legacyNames: [], Category: 'Display', unit: 'Hz' },
    { fieldName: 'DisplayResponseTime', DisplayName: 'Display Response Time', DisplayNameShort: 'Response Time', DisplayNameTiny: 'DispResp', legacyNames: [], Category: 'Display', unit: 'ms' },
    { fieldName: 'DisplayBrightness', DisplayName: 'Display Brightness', DisplayNameShort: 'Brightness', DisplayNameTiny: 'DispBrightness', legacyNames: [], Category: 'Display', unit: 'nits' },
    { fieldName: 'DisplayContrast', DisplayName: 'Display Contrast Ratio', DisplayNameShort: 'Contrast Ratio', DisplayNameTiny: 'DispContrast', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayColorGamuts', DisplayName: 'Display Color Gamuts', DisplayNameShort: 'Color Gamuts', DisplayNameTiny: 'DispColor', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayColorBitDepth', DisplayName: 'Display Color Bit Depth', DisplayNameShort: 'Color Bit Depth', DisplayNameTiny: 'DispColorDepth', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayViewingAngleHorizontal', DisplayName: 'Display Viewing Angle (H)', DisplayNameShort: 'Viewing Angle (H)', DisplayNameTiny: 'DispVieAngle(H)', legacyNames: [], Category: 'Display', unit: 'deg' },
    { fieldName: 'DisplayViewingAngleVertical', DisplayName: 'Display Viewing Angle (V)', DisplayNameShort: 'Viewing Angle (V)', DisplayNameTiny: 'DispViewAngle(V)', legacyNames: [], Category: 'Display', unit: 'deg' },
    { fieldName: 'DisplayPanelTech', DisplayName: 'Display Panel Tech', DisplayNameShort: 'Panel Tech', DisplayNameTiny: 'DispTech', legacyNames: [], Category: 'Display' },
    { fieldName: 'DisplayAntiGlare', DisplayName: 'Display Anti-Glare', DisplayNameShort: 'Anti-Glare', DisplayNameTiny: 'DispAntiGlare', legacyNames: ['AntiGlare'], Category: 'Display' },
    { fieldName: 'DisplayLamination', DisplayName: 'Display Lamination', DisplayNameShort: 'Lamination', DisplayNameTiny: 'DispLamination', legacyNames: ['Lamination'], Category: 'Display' },

    // --- Calculated/Other ---

];
