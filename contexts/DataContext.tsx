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
export const prepareTabletForExport = (tablet: Tablet | any): Partial<Tablet> => {
  const exportData: any = {};

  // Sort fields alphabetically by output name (which matches internal name except system fields)
  // We can just iterate our defined fields and construct the object
  // But to ensure alphabetical key order in JSON, we should sort the keys we are about to insert.

  // Create a map of what we want to export
  TABLET_FIELDS.forEach(field => {
    // Skip calculated fields
    if (field.isCalculated) return;

    // Get value
    let value = tablet[field.fieldName];

    // Handle system fields (prefix with _)
    let key = field.fieldName as string;
    if (field.isSystem) {
      key = `_${key}`;
    }

    // Only include if value is defined (or maybe we want to include nulls? 
    // The previous implementation utilized destructing which includes everything. 
    // Let's include if it exists in the tablet object.

    if (value !== undefined) {
      exportData[key] = value;
    }
  });

  // Now create a new object with sorted keys
  const sortedExportData: any = {};
  Object.keys(exportData).sort().forEach(key => {
    sortedExportData[key] = exportData[key];
  });

  return sortedExportData;
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
      AspectRatio: calculateAspectRatio(mapped),
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