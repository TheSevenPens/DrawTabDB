import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tablet } from '../types';

interface DataContextType {
  tablets: Tablet[];
  originalTablets: Tablet[];
  flaggedIds: string[]; // Now stores internal 'id'
  setTablets: (tablets: Partial<Tablet>[]) => void;
  updateTablet: (tablet: Tablet) => void;
  updateTabletAtIndex: (index: number, tablet: Tablet) => void;
  addTablet: (tablet: Partial<Tablet>) => void;
  revertTablet: (id: string) => void;
  toggleFlag: (id: string) => void;
  clearFlags: () => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper to prepare tablet data for export/preview (strip calculated, rename metadata, sort keys)
export const prepareTabletForExport = (tablet: Tablet | any): Partial<Tablet> => {
  const {
    // Calculated Fields
    DisplayXPPI,
    DigitizerDiagonal,
    ModelAge,
    AspectRatio,
    DigitizerArea,

    // Legacy Fields - Strip these to ensure clean JSON export
    Audience,
    Status,
    LaunchYear,
    Age,
    Brand,
    Type,
    Link,
    Family,
    ModelID, // Old case
    IncludedPen,
    DevSize,
    DevWeight,
    PixelDensity,
    DigitizerSize,
    DigitizerDiag,
    PressureLevels,
    ReportRate,
    PenTech,
    Tilt,
    MaxHover,
    AccCenter,
    AccCorner,
    SupportsTouch,
    AntiGlare,
    Lamination,

    // Strip internal metadata from rest
    id,
    CreateDate,
    ModifiedDate,

    ...rest
  } = tablet;

  // Create new object with underscores for metadata
  const withUnderscores: any = {
    _id: id,
    _CreateDate: CreateDate,
    _ModifiedDate: ModifiedDate,
    ...rest
  };

  // Sort keys alphabetically
  const sorted: Partial<Tablet> = {};
  Object.keys(withUnderscores).sort().forEach(key => {
    (sorted as any)[key] = withUnderscores[key];
  });

  return sorted;
};

// Helper to calculate PPI
const calculatePixelDensity = (tablet: Partial<Tablet> | any): string | undefined => {
  if (!tablet.DisplayResolution) return undefined;

  const resRegex = /(\d+)\s*[xX]\s*(\d+)/;
  const resMatch = tablet.DisplayResolution.match(resRegex);
  if (!resMatch) return undefined;

  const w = parseInt(resMatch[1]);
  const h = parseInt(resMatch[2]);
  const diagPx = Math.sqrt(w * w + h * h);

  let diagInches = 0;

  const diagSizeRegex = /^(\d+(?:\.\d+)?)\s*(?:"|'|inch|inches)?$/i;
  // Use new name with fallback
  const displaySize = tablet.DisplaySize;
  if (displaySize) {
    const match = displaySize.match(diagSizeRegex);
    if (match) {
      diagInches = parseFloat(match[1]);
    }
  }

  // Use new name with fallback
  const digitizerDim = tablet.DigitizerDimensions || tablet.DigitizerSize;
  if (!diagInches && digitizerDim) {
    const dimRegex = /(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/;
    const dimMatch = digitizerDim.match(dimRegex);
    if (dimMatch) {
      const dw = parseFloat(dimMatch[1]);
      const dh = parseFloat(dimMatch[2]);
      const diagMm = Math.sqrt(dw * dw + dh * dh);
      diagInches = diagMm / 25.4;
    }
  }

  if (diagInches > 0) {
    return Math.round(diagPx / diagInches).toString();
  }

  return undefined;
};

// Helper to calculate Digitizer Diagonal in mm
const calculateDigitizerDiag = (tablet: Partial<Tablet> | any): string | undefined => {
  const digitizerDim = tablet.DigitizerDimensions || tablet.DigitizerSize;
  if (!digitizerDim) return undefined;

  const dimRegex = /(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/;
  const match = digitizerDim.match(dimRegex);

  if (match) {
    const w = parseFloat(match[1]);
    const h = parseFloat(match[2]);
    const diag = Math.sqrt(w * w + h * h);
    return diag.toFixed(2);
  }

  return undefined;
};

// Helper to calculate Aspect Ratio
const calculateAspectRatio = (tablet: Partial<Tablet> | any): string | undefined => {
  const digitizerDim = tablet.DigitizerDimensions || tablet.DigitizerSize;
  if (!digitizerDim) return undefined;
  const match = digitizerDim.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);

  if (match) {
    const w = parseFloat(match[1]);
    const h = parseFloat(match[2]);
    if (h === 0) return undefined;

    const ratio = w / h;
    const tol = 0.05;

    if (Math.abs(ratio - (16 / 9)) < tol) return '16:9';
    if (Math.abs(ratio - (16 / 10)) < tol) return '16:10';
    if (Math.abs(ratio - (4 / 3)) < tol) return '4:3';
    if (Math.abs(ratio - (3 / 2)) < tol) return '3:2';
    if (Math.abs(ratio - 1) < tol) return '1:1';
    if (Math.abs(ratio - (21 / 9)) < tol) return '21:9';

    return `${ratio.toFixed(2)}:1`;
  }
  return undefined;
};

// Helper to calculate Age based on LaunchYear
const calculateAge = (tablet: Partial<Tablet> | any): string | undefined => {
  const launchYear = tablet.ModelLaunchYear || tablet.LaunchYear;
  if (!launchYear) return undefined;

  const yearInt = parseInt(launchYear);
  if (isNaN(yearInt)) return undefined;

  const currentYear = new Date().getFullYear();
  const age = currentYear - yearInt;

  return age.toString();
};

// Helper to generate UUID
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments or non-secure contexts
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const mapLegacyFields = (t: any): Tablet => {
  return {
    ...t,
    // Model
    ModelId: t.ModelId || t.ModelID || '',
    ModelName: t.ModelName ? t.ModelName.trim() : 'Unknown',
    ModelFamily: t.ModelFamily || t.Family ? (t.ModelFamily || t.Family).trim() : undefined,
    ModelAudience: t.ModelAudience || t.Audience,
    ModelStatus: t.ModelStatus || t.Status,
    ModelLaunchYear: t.ModelLaunchYear || t.LaunchYear,
    ModelBrand: t.ModelBrand || t.Brand ? (t.ModelBrand || t.Brand).trim() : 'Unknown',
    ModelType: t.ModelType || t.Type ? (t.ModelType || t.Type).trim() : 'Unknown',
    ModelProductLink: t.ModelProductLink || t.Link,
    ModelIncludedPen: t.ModelIncludedPen || t.IncludedPen,

    // Physical
    PhysicalDimensions: t.PhysicalDimensions || t.DevSize,
    PhysicalWeight: t.PhysicalWeight || t.DevWeight,

    // Digitizer
    DigitizerDimensions: t.DigitizerDimensions || t.DigitizerSize,
    // DigitizerDiagonal -> Calculated
    DigitizerPressureLevels: t.DigitizerPressureLevels || t.PressureLevels,
    DigitizerReportRate: t.DigitizerReportRate || t.ReportRate,
    DigitizerResolution: t.DigitizerResolution,
    DigitizerType: t.DigitizerType || t.PenTech,
    DigitizerTilt: t.DigitizerTilt || t.Tilt,
    DigitizerMaxHover: t.DigitizerMaxHover || t.MaxHover,
    DigitizerAccuracyCenter: t.DigitizerAccuracyCenter || t.AccCenter,
    DigitizerAccuracyCorner: t.DigitizerAccuracyCorner || t.AccCorner,
    DigitizerSupportsTouch: t.DigitizerSupportsTouch || t.SupportsTouch || t.DisplayTouchCapability, // Fallback chain

    // Display
    DisplayResolution: t.DisplayResolution,
    DisplaySize: t.DisplaySize,
    DisplayViewingAngleHorizontal: t.DisplayViewingAngleHorizontal,
    DisplayViewingAngleVertical: t.DisplayViewingAngleVertical,
    DisplayColorBitDepth: t.DisplayColorBitDepth,
    DisplayContrast: t.DisplayContrast,
    DisplayResponseTime: t.DisplayResponseTime,
    DisplayColorGamuts: t.DisplayColorGamuts,
    DisplayBrightness: t.DisplayBrightness,
    DisplayRefreshRate: t.DisplayRefreshRate,
    DisplayPanelTech: t.DisplayPanelTech,
    DisplayAntiGlare: t.DisplayAntiGlare || t.AntiGlare,
    DisplayLamination: t.DisplayLamination || t.Lamination,

    id: t.id || t._id || generateId(),
    CreateDate: t.CreateDate || t._CreateDate || new Date().toISOString(),
    ModifiedDate: t.ModifiedDate || t._ModifiedDate || new Date().toISOString(),
  } as Tablet;
};


const enrichTablets = (data: Partial<Tablet>[]): Tablet[] => {
  const now = new Date().toISOString();
  return data.map(t => {
    const mapped = mapLegacyFields(t);
    return {
      ...mapped,
      DisplayXPPI: mapped.DisplayXPPI || calculatePixelDensity(mapped),
      DigitizerDiagonal: mapped.DigitizerDiagonal || calculateDigitizerDiag(mapped),
      ModelAge: calculateAge(mapped),
      AspectRatio: calculateAspectRatio(mapped),
    };
  });
};

const enrichSingleTablet = (t: Partial<Tablet>): Tablet => {
  const mapped = mapLegacyFields(t);
  return {
    ...mapped,
    DisplayXPPI: mapped.DisplayXPPI || calculatePixelDensity(mapped),
    DigitizerDiagonal: mapped.DigitizerDiagonal || calculateDigitizerDiag(mapped),
    ModelAge: calculateAge(mapped),
    AspectRatio: calculateAspectRatio(mapped),
  };
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tablets, setTabletsRaw] = useState<Tablet[]>([]);
  const [originalTablets, setOriginalTablets] = useState<Tablet[]>([]);
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);

  const setTablets = (newTablets: Partial<Tablet>[]) => {
    const enriched = enrichTablets(newTablets);
    setTabletsRaw(enriched);
    // Create a deep copy or just set the enriched list as the baseline snapshot
    setOriginalTablets(enriched);
  };

  const resetData = () => {
    setTabletsRaw([]);
    setOriginalTablets([]);
    setFlaggedIds([]);
  };

  const updateTablet = (updatedTablet: Tablet) => {
    const enriched = {
      ...enrichSingleTablet(updatedTablet),
      ModifiedDate: new Date().toISOString()
    };
    setTabletsRaw(prev => prev.map(t => t.id === enriched.id ? enriched : t));
  };

  const updateTabletAtIndex = (index: number, updatedTablet: Tablet) => {
    const enriched = {
      ...enrichSingleTablet(updatedTablet),
      ModifiedDate: new Date().toISOString()
    };
    setTabletsRaw(prev => {
      const next = [...prev];
      if (index >= 0 && index < next.length) {
        next[index] = enriched;
      }
      return next;
    });
  };

  const addTablet = (newTablet: Partial<Tablet>) => {
    const enrichedList = enrichTablets([newTablet]);
    if (enrichedList.length > 0) {
      setTabletsRaw(prev => [...prev, enrichedList[0]]);
    }
  };

  const revertTablet = (id: string) => {
    const original = originalTablets.find(t => t.id === id);
    if (original) {
      // Restore original
      setTabletsRaw(prev => prev.map(t => t.id === id ? original : t));
    } else {
      // Was added (not in original), so delete
      setTabletsRaw(prev => prev.filter(t => t.id !== id));
    }
  };

  const toggleFlag = (id: string) => {
    setFlaggedIds(prev =>
      prev.includes(id)
        ? prev.filter(flaggedId => flaggedId !== id)
        : [...prev, id]
    );
  };

  const clearFlags = () => {
    setFlaggedIds([]);
  };

  return (
    <DataContext.Provider value={{ tablets, originalTablets, flaggedIds, setTablets, updateTablet, updateTabletAtIndex, addTablet, revertTablet, toggleFlag, clearFlags, resetData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};