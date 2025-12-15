import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Tablet } from '../types';
import { TABLET_FIELDS } from '../tabletFields';

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
export const prepareTabletForExport = (tablet: Tablet | any, options: { includeCalculated?: boolean; includeEmpty?: boolean } = {}): Partial<Tablet> => {
  const { includeCalculated = false, includeEmpty = false } = options;
  const exportData: any = {};

  // Sort fields alphabetically by output name (which matches internal name except system fields)
  // We can just iterate our defined fields and construct the object
  // But to ensure alphabetical key order in JSON, we should sort the keys we are about to insert.

  // Create a map of what we want to export
  TABLET_FIELDS.forEach(field => {
    // Skip calculated fields
    if (field.isCalculated && !includeCalculated) return;

    // Get value
    let value = tablet[field.fieldName];

    // Handle system fields (prefix with _)
    let key = field.fieldName as string;
    if (field.isSystem) {
      key = `_${key}`;
    }

    const hasValue = value !== undefined && value !== null && value !== '';

    if (hasValue || includeEmpty) {
      exportData[key] = (value === undefined || value === null) ? "" : value;
    }
  });

  // Now create a new object with sorted keys
  const sortedExportData: any = {};
  Object.keys(exportData).sort().forEach(key => {
    sortedExportData[key] = exportData[key];
  });

  return sortedExportData;
};

import { parseDimensions, calculateDiagonal, calculateAspectRatio as calcAspectRatioUtil } from '../utils/dimensionUtils';
import { mmToInches } from '../utils/unitUtils';

// Helper to calculate PPI
const calculatePixelDensity = (tablet: Partial<Tablet> | any): string | undefined => {
  if (!tablet.DisplayResolution) return undefined;

  // Utilize parseDimensions for resolution parsing as well (Width x Height pattern)
  const resDims = parseDimensions(tablet.DisplayResolution);
  if (!resDims) return undefined;

  const diagPx = calculateDiagonal(resDims);
  if (!diagPx) return undefined;

  let diagInches = 0;

  const diagSizeRegex = /^(\d+(?:\.\d+)?)\s*(?:"|'|inch|inches)?$/i;
  // Use new name with fallback
  const displaySize = tablet.DisplayDimensions || tablet.DisplaySize;
  if (displaySize) {
    const match = displaySize.match(diagSizeRegex);
    if (match) {
      diagInches = parseFloat(match[1]);
    }
  }

  // Use new name with fallback
  const digitizerDim = tablet.DigitizerDimensions || tablet.DigitizerSize;
  if (!diagInches && digitizerDim) {
    const dims = parseDimensions(digitizerDim);
    if (dims) {
      const diagMm = calculateDiagonal(dims);
      if (diagMm) diagInches = mmToInches(diagMm);
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
  const dims = parseDimensions(digitizerDim);

  if (dims) {
    const diag = calculateDiagonal(dims);
    return diag?.toFixed(2);
  }

  return undefined;
};

// Helper to calculate Aspect Ratio
const calculateAspectRatio = (tablet: Partial<Tablet> | any): string | undefined => {
  const digitizerDim = tablet.DigitizerDimensions || tablet.DigitizerSize;
  const dims = parseDimensions(digitizerDim);
  return calcAspectRatioUtil(dims);
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
  const mapped: any = {};

  // Iterate over all defined fields and try to find values in the input object 't'
  TABLET_FIELDS.forEach(field => {
    // 1. Try exact match
    let val = t[field.fieldName];

    // 2. Try legacy names if not found
    if (val === undefined && field.legacyNames) {
      for (const legacy of field.legacyNames) {
        if (t[legacy] !== undefined) {
          val = t[legacy];
          break;
        }
      }
    }

    // 3. Try system prefix version (e.g. _id) if not found and is system
    if (val === undefined && field.isSystem) {
      if (t[`_${field.fieldName}`] !== undefined) {
        val = t[`_${field.fieldName}`];
      }
    }

    // Assign if checking for this field
    // Note: We assign even if undefined, to match the shape, or arguably we only assign if defined.
    // The previous manual mapping handled this with `|| undefined` or defaults.
    // Let's assign if found.
    if (val !== undefined) {
      // Trim strings if needed
      if (typeof val === 'string') {
        // Special cases from original code?
        // ModelName, Family, Brand, Type were trimmed.
        if (['ModelName', 'ModelFamily', 'ModelBrand', 'ModelType'].includes(field.fieldName)) {
          mapped[field.fieldName] = val.trim();
        } else {
          mapped[field.fieldName] = val;
        }
      } else {
        mapped[field.fieldName] = val;
      }
    }
  });

  // Ensure required fields / defaults
  if (!mapped.id) mapped.id = generateId();
  if (!mapped.CreateDate) mapped.CreateDate = new Date().toISOString();
  if (!mapped.ModifiedDate) mapped.ModifiedDate = new Date().toISOString();

  // Fallback chain for SupportsTouch if not caught above
  // The generic loop tried 'SupportsTouch' and 'DisplayTouchCapability'. 
  // 'DigitizerSupportsTouch' is the main name.
  // The original code had: t.DigitizerSupportsTouch || t.SupportsTouch || t.DisplayTouchCapability
  // The tabletFields definition for DigitizerSupportsTouch should include these legacy names.
  // Checking tabletFields.ts... yes: legacyNames: ['SupportsTouch', 'DisplayTouchCapability']
  // So the loop handles it.

  // Any other special defaults? 
  // ModelName: 'Unknown'
  if (!mapped.ModelName) mapped.ModelName = 'Unknown';
  // ModelBrand: 'Unknown'
  if (!mapped.ModelBrand) mapped.ModelBrand = 'Unknown';
  // ModelType: 'Unknown'
  if (!mapped.ModelType) mapped.ModelType = 'Unknown';


  return mapped as Tablet;
};


const enrichTablets = (data: Partial<Tablet>[]): Tablet[] => {
  const now = new Date().toISOString();
  return data.map(t => {
    const mapped = mapLegacyFields(t);
    return {
      ...mapped,
      DisplayPixelDensity: mapped.DisplayPixelDensity || calculatePixelDensity(mapped),
      DigitizerDiagonal: mapped.DigitizerDiagonal || calculateDigitizerDiag(mapped),
      ModelAge: calculateAge(mapped),
      DigitizerAspectRatio: calculateAspectRatio(mapped),
    };
  });
};

const enrichSingleTablet = (t: Partial<Tablet>): Tablet => {
  const mapped = mapLegacyFields(t);
  return {
    ...mapped,
    DisplayPixelDensity: mapped.DisplayPixelDensity || calculatePixelDensity(mapped),
    DigitizerDiagonal: mapped.DigitizerDiagonal || calculateDigitizerDiag(mapped),
    ModelAge: calculateAge(mapped),
    DigitizerAspectRatio: calculateAspectRatio(mapped),
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