import React from 'react';
import { Tablet } from '../types';
import { ExternalLink, MoreHorizontal, Copy, Square, CheckSquare } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface TabletCardProps {
  tablet: Tablet;
  visibleColumns: string[];
  diagUnit: 'mm' | 'in';
  activeAreaUnit: 'mm' | 'in';
  digitizerResUnit: 'lpi' | 'lpmm';
  onViewDetails: (tablet: Tablet) => void;
}

const TabletCard: React.FC<TabletCardProps> = ({ tablet, visibleColumns, diagUnit, activeAreaUnit, digitizerResUnit, onViewDetails }) => {
  const { addTablet, flaggedIds, toggleFlag } = useData();
  const isDisplay = tablet.Type === 'PENDISPLAY';
  
  // Use internal id for flagging
  const isFlagged = flaggedIds.includes(tablet.id);

  const handleDuplicate = () => {
    // Create a unique ID and append (Copy) to name
    // Note: The context's addTablet will handle generating a fresh UUID for 'id'
    // We just want to ensure ModelID is unique-ish for the user visible field
    const timestamp = Date.now().toString().slice(-4);
    const newId = `${tablet.ModelID}_COPY_${timestamp}`;
    const newName = `${tablet.ModelName} (Copy)`;

    const duplicatedTablet: Partial<Tablet> = {
        ...tablet,
        id: undefined, // Clear ID so generator creates new one
        ModelID: newId,
        ModelName: newName,
        CreateDate: undefined, // Clear dates
        ModifiedDate: undefined 
    };

    addTablet(duplicatedTablet);
  };

  const getColumnContent = (colId: string) => {
    switch (colId) {
      case 'Family':
        return { label: 'Family', value: tablet.Family || '-' };
        
      case 'LaunchYear':
        return { label: 'Released', value: tablet.LaunchYear || '-' };
      
      case 'DigitizerDiag':
        const diagVal = tablet.DigitizerDiag ? parseFloat(tablet.DigitizerDiag) : null;
        if (!diagVal || isNaN(diagVal)) return { label: 'Diagonal', value: '-' };
        const displayVal = diagUnit === 'in' 
          ? `${(diagVal / 25.4).toFixed(1)}″` 
          : `${Math.round(diagVal)}mm`;
        return { label: `Diagonal (${diagUnit})`, value: displayVal };

      case 'IncludedPen':
        return { label: 'Pen', value: tablet.IncludedPen || 'N/A' };

      case 'DigitizerSize':
        const raw = tablet.DigitizerSize;
        if (!raw) return { label: 'Active Area', value: '-' };

        if (activeAreaUnit === 'in') {
             // Attempt to parse dimensions from standard format (e.g., 293 x 165 or 293.7 x 165.2)
             const dimRegex = /(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/;
             const match = raw.match(dimRegex);
             if (match) {
                 const w = parseFloat(match[1]);
                 const h = parseFloat(match[2]);
                 const wIn = (w / 25.4).toFixed(1);
                 const hIn = (h / 25.4).toFixed(1);
                 return { label: 'Active Area (in)', value: `${wIn}″ x ${hIn}″` };
             }
        }
        return { label: activeAreaUnit === 'mm' ? 'Active Area (mm)' : 'Active Area', value: raw };

      case 'AspectRatio':
        if (!tablet.DigitizerSize) return { label: 'Aspect Ratio', value: '-' };
        // Matches "293 x 165" or "293.7 x 165.2", allowing spaces
        const dimMatch = tablet.DigitizerSize.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
        
        if (dimMatch) {
            const w = parseFloat(dimMatch[1]);
            const h = parseFloat(dimMatch[2]);
            if (h === 0) return { label: 'Aspect Ratio', value: '-' };
            
            const ratio = w / h;
            // Tolerance for standard ratios
            const tol = 0.05; 
            let arDisplay = `${ratio.toFixed(2)}:1`;

            if (Math.abs(ratio - (16/9)) < tol) arDisplay = '16:9';
            else if (Math.abs(ratio - (16/10)) < tol) arDisplay = '16:10';
            else if (Math.abs(ratio - (4/3)) < tol) arDisplay = '4:3';
            else if (Math.abs(ratio - (3/2)) < tol) arDisplay = '3:2';
            else if (Math.abs(ratio - 1) < tol) arDisplay = '1:1';
            else if (Math.abs(ratio - (21/9)) < tol) arDisplay = '21:9';
            
            return { label: 'Aspect Ratio', value: arDisplay };
        }
        return { label: 'Aspect Ratio', value: '-' };

      case 'PressureLevels':
        return { label: 'Pressure', value: tablet.PressureLevels ? `${tablet.PressureLevels} Lvls` : '-' };

      case 'DisplayResolution':
        return { label: 'Display Res', value: isDisplay ? (tablet.DisplayResolution || 'N/A') : '-' };
      
      case 'PixelDensity':
        return { label: 'Pixel Density', value: tablet.PixelDensity ? `${tablet.PixelDensity} PPI` : '-' };

      case 'DigitizerResolution':
        const resVal = tablet.DigitizerResolution ? parseFloat(tablet.DigitizerResolution) : null;
        if (!resVal || isNaN(resVal)) return { label: 'Digitizer Res', value: '-' };
        
        // Raw value is in LPmm.
        // To show LPI, we multiply by 25.4 (1 mm = 0.03937 inch)
        if (digitizerResUnit === 'lpi') {
             const lpi = Math.round(resVal * 25.4);
             return { label: 'Digitizer Res (LPI)', value: `${lpi} LPI` };
        }
        
        // Return raw LPmm
        return { label: 'Digitizer Res (LPmm)', value: `${resVal} LPmm` };

      case 'DevWeight':
         const weight = tablet.DevWeight ? parseFloat(tablet.DevWeight) : null;
         // Assume raw data is in grams if numeric
         const weightVal = weight 
            ? (weight > 100 ? `${(weight/1000).toFixed(2)}kg` : `${weight}g`) // Simple heuristic, mostly just showing raw string is safer if unit is unknown
            : (tablet.DevWeight || '-');
         return { label: 'Weight', value: weightVal };
         
      case 'SupportsTouch':
         return { label: 'Touch', value: tablet.SupportsTouch || '-' };

      default:
        return { label: colId, value: '-' };
    }
  };

  return (
    <div className={`
      bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 border rounded-xl px-3 py-2 transition-all duration-200 group relative overflow-hidden
      ${isFlagged 
          ? 'border-primary-500 bg-slate-50 dark:bg-slate-800 ring-1 ring-primary-500/20' 
          : 'border-slate-200 dark:border-slate-700/50 hover:border-primary-500/30'
      }
    `}>
      
      <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
        
        {/* Header Section: Brand, Name, ID - ALWAYS VISIBLE */}
        <div className="w-full lg:w-64 shrink-0 flex items-center gap-3">
            {/* Flag Button */}
            <button 
              onClick={() => toggleFlag(tablet.id)}
              className={`shrink-0 transition-colors ${isFlagged ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400'}`}
              title={isFlagged ? "Unflag for comparison" : "Flag for comparison"}
            >
              {isFlagged ? <CheckSquare size={18} /> : <Square size={18} />}
            </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">{tablet.Brand}</span>
              {tablet.Status === 'DISCONTINUED' && (
                <span className="px-1.5 py-0 text-[8px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-950/40 rounded border border-red-200 dark:border-red-900/50">
                  Disc.
                </span>
              )}
            </div>
            
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors truncate leading-tight">
              {tablet.ModelName}
            </h3>
            
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-500 text-[9px] font-mono mt-0.5">
              <span>{tablet.ModelID}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-slate-400 dark:bg-slate-600"></span>
              <span>{isDisplay ? 'Display' : 'Tablet'}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Specs Grid */}
        <div className={`flex-shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:gap-6 gap-x-4 gap-y-2 lg:border-l border-slate-200 dark:border-slate-700/50 lg:pl-4`}>
          {visibleColumns.map(colId => {
            const { label, value } = getColumnContent(colId);
            return (
              <div key={colId} className="flex flex-col justify-center min-w-[80px]">
                <span className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">{label}</span>
                <div className="flex items-center text-slate-700 dark:text-slate-300 text-xs">
                  <span className="truncate max-w-[120px]" title={String(value)}>{value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 lg:pl-4 lg:border-l border-slate-200 dark:border-slate-700/50 lg:ml-auto">
            <button 
              onClick={handleDuplicate}
              title="Duplicate Record"
              className="flex items-center justify-center w-6 h-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all"
          >
              <Copy size={12} />
          </button>

          {tablet.Link && (
              <a 
              href={tablet.Link} 
              target="_blank" 
              rel="noreferrer"
              title="Open Manufacturer Page"
              className="flex items-center justify-center w-6 h-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all"
              >
                <ExternalLink size={12} />
              </a>
            )}
            
          <button 
            onClick={() => onViewDetails(tablet)}
            className="flex items-center justify-center gap-2 px-3 py-1 bg-primary-50 hover:bg-primary-100 dark:bg-primary-600/10 dark:hover:bg-primary-600 text-primary-600 dark:text-primary-400 dark:hover:text-white text-xs font-medium rounded-lg transition-all border border-primary-200 dark:border-primary-500/20 hover:border-primary-300 dark:hover:border-primary-500"
          >
            <span>Details</span>
            <MoreHorizontal size={14} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default TabletCard;