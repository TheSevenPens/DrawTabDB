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

// Helper to calculate PPI
const calculatePixelDensity = (tablet: Partial<Tablet>): string | undefined => {
  if (!tablet.DisplayResolution) return undefined;

  const resRegex = /(\d+)\s*[xX]\s*(\d+)/;
  const resMatch = tablet.DisplayResolution.match(resRegex);
  if (!resMatch) return undefined;

  const w = parseInt(resMatch[1]);
  const h = parseInt(resMatch[2]);
  const diagPx = Math.sqrt(w * w + h * h);

  let diagInches = 0;

  const diagSizeRegex = /^(\d+(?:\.\d+)?)\s*(?:"|'|inch|inches)?$/i;
  if (tablet.DisplaySize) {
     const match = tablet.DisplaySize.match(diagSizeRegex);
     if (match) {
        diagInches = parseFloat(match[1]);
     }
  }

  if (!diagInches && tablet.DigitizerSize) {
      const dimRegex = /(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/;
      const dimMatch = tablet.DigitizerSize.match(dimRegex);
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
const calculateDigitizerDiag = (tablet: Partial<Tablet>): string | undefined => {
  if (!tablet.DigitizerSize) return undefined;
  
  const dimRegex = /(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/;
  const match = tablet.DigitizerSize.match(dimRegex);
  
  if (match) {
    const w = parseFloat(match[1]);
    const h = parseFloat(match[2]);
    const diag = Math.sqrt(w * w + h * h);
    return diag.toFixed(2);
  }
  
  return undefined;
};

// Helper to calculate Aspect Ratio
const calculateAspectRatio = (tablet: Partial<Tablet>): string | undefined => {
  if (!tablet.DigitizerSize) return undefined;
  const match = tablet.DigitizerSize.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
  
  if (match) {
    const w = parseFloat(match[1]);
    const h = parseFloat(match[2]);
    if (h === 0) return undefined;
    
    const ratio = w / h;
    const tol = 0.05; 

    if (Math.abs(ratio - (16/9)) < tol) return '16:9';
    if (Math.abs(ratio - (16/10)) < tol) return '16:10';
    if (Math.abs(ratio - (4/3)) < tol) return '4:3';
    if (Math.abs(ratio - (3/2)) < tol) return '3:2';
    if (Math.abs(ratio - 1) < tol) return '1:1';
    if (Math.abs(ratio - (21/9)) < tol) return '21:9';
    
    return `${ratio.toFixed(2)}:1`;
  }
  return undefined;
};

// Helper to calculate Age based on LaunchYear
const calculateAge = (tablet: Partial<Tablet>): string | undefined => {
  if (!tablet.LaunchYear) return undefined;
  
  const launchYear = parseInt(tablet.LaunchYear);
  if (isNaN(launchYear)) return undefined;
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - launchYear;
  
  return age.toString();
};

// Helper to generate UUID
const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    // Fallback for older environments or non-secure contexts
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const enrichTablets = (data: Partial<Tablet>[]): Tablet[] => {
  const now = new Date().toISOString();
  return data.map(t => ({
    ...t,
    id: t.id || generateId(),
    CreateDate: t.CreateDate || now,
    ModifiedDate: t.ModifiedDate || now,
    // Sanitize common string fields
    Brand: t.Brand ? t.Brand.trim() : 'Unknown',
    Family: t.Family ? t.Family.trim() : undefined,
    Type: t.Type ? t.Type.trim() : 'Unknown',
    ModelName: t.ModelName ? t.ModelName.trim() : 'Unknown',
    ModelID: t.ModelID ? t.ModelID : '', // Ensure ModelID string exists
    PixelDensity: t.PixelDensity || calculatePixelDensity(t),
    DigitizerDiag: t.DigitizerDiag || calculateDigitizerDiag(t),
    Age: calculateAge(t),
    AspectRatio: calculateAspectRatio(t)
  } as Tablet));
};

const enrichSingleTablet = (t: Partial<Tablet>): Tablet => {
    const now = new Date().toISOString();
    return {
      ...t,
      id: t.id || generateId(),
      CreateDate: t.CreateDate || now,
      ModifiedDate: t.ModifiedDate || now, // Will be overridden on update
      Brand: t.Brand ? t.Brand.trim() : 'Unknown',
      Family: t.Family ? t.Family.trim() : undefined,
      Type: t.Type ? t.Type.trim() : 'Unknown',
      ModelName: t.ModelName ? t.ModelName.trim() : 'Unknown',
      ModelID: t.ModelID ? t.ModelID : '',
      PixelDensity: calculatePixelDensity(t) || t.PixelDensity,
      DigitizerDiag: calculateDigitizerDiag(t) || t.DigitizerDiag,
      Age: calculateAge(t),
      AspectRatio: calculateAspectRatio(t)
    } as Tablet;
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