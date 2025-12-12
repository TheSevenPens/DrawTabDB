
export interface Tablet {
  id: string; // Internal GUID
  CreateDate: string; // ISO String
  ModifiedDate: string; // ISO String
  ModelID: string;
  ModelName: string;
  Family?: string;
  Audience?: string;
  Status?: string;
  LaunchYear?: string;
  Brand: string;
  Type: string; // PENTABLET or PENDISPLAY
  Link?: string;
  DigitizerSize?: string;
  PressureLevels?: string;
  ReportRate?: string;
  DigitizerResolution?: string;
  IncludedPen?: string;
  AccCenter?: string;
  AccCorner?: string;
  DevSize?: string;
  DisplayResolution?: string;
  DisplaySize?: string;
  DisplayViewingAngleHorizontal?: string;
  DisplayViewingAngleVertical?: string;
  DisplayColorBitDepth?: string;
  DisplayContrast?: string;
  DisplayResponseTime?: string;
  DisplayColorGamuts?: string;
  PenTech?: string;
  Tilt?: string;
  DevWeight?: string;
  AntiGlare?: string;
  Lamination?: string;
  DisplayBrightness?: string;
  MaxHover?: string;
  DisplayRefreshRate?: string;
  DisplayPanelTech?: string;
  SupportsTouch?: string; // YES, NO, or empty
  PixelDensity?: string; // Calculated PPI
  DigitizerDiag?: string; // Calculated Diagonal mm
  Age?: string; // Calculated Age in years
  AspectRatio?: string; // Calculated Aspect Ratio
}

export interface TabletData {
  DrawingTablets: Tablet[];
}

export enum ViewMode {
  Grid = 'GRID',
  List = 'LIST'
}
