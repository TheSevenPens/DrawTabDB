
export interface Tablet {
  id: string; // Internal GUID
  CreateDate: string; // ISO String
  ModifiedDate: string; // ISO String
  ModelId: string;
  ModelName: string;
  ModelFamily?: string;
  ModelAudience?: string;
  ModelStatus?: string;
  ModelLaunchYear?: string;
  ModelBrand: string;
  ModelType: string; // PENTABLET or PENDISPLAY
  ModelProductLink?: string;
  ModelIncludedPen?: string;

  PhysicalDimensions?: string;
  PhysicalWeight?: string;
  PhysicalWeightInclStand?: string;

  DigitizerDimensions?: string;
  DigitizerDiagonal?: string; // Calculated Diagonal mm
  DigitizerPressureLevels?: string;
  DigitizerReportRate?: string;
  DigitizerResolution?: string;
  DigitizerType?: string;
  DigitizerTilt?: string;
  DigitizerMaxHover?: string;
  DigitizerAccuracyCenter?: string;
  DigitizerAccuracyCorner?: string;
  DigitizerSupportsTouch?: string; // YES, NO, or empty
  DigitizerArea?: string; // Calculated Area cm² (Transient)

  DisplayResolution?: string;
  DisplayDimensions?: string;
  DisplayViewingAngleHorizontal?: string;
  DisplayViewingAngleVertical?: string;
  DisplayColorBitDepth?: string;
  DisplayContrast?: string;
  DisplayResponseTime?: string;
  DisplayColorGamuts?: string;
  DisplayBrightness?: string;
  DisplayRefreshRate?: string;
  DisplayPanelTech?: string;
  DisplayAntiGlare?: string;
  DisplayLamination?: string;
  DisplayPixelDensity?: string; // Calculated PPI

  ModelAge?: string; // Calculated Age in years
  DigitizerAspectRatio?: string; // Calculated Aspect Ratio
}

export interface TabletData {
  DrawingTablets: Tablet[];
}

export enum ViewMode {
  Grid = 'GRID',
  List = 'LIST'
}

export type FilterFieldType = 'text' | 'numeric';
export type TextCondition = 'equals' | 'contains' | 'beginswith' | 'endswith';
export type NumericCondition = 'equals' | 'lt' | 'lte' | 'gt' | 'gte' | 'range';

export interface Filter {
  id: string;
  field: keyof Tablet;
  condition: TextCondition | NumericCondition;
  value: string;
  value2?: string; // For range condition
}

export type SortCriterion = {
  id: string;
  field: string;
  order: 'asc' | 'desc';
};
