import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { GitCompare, X, Eye, EyeOff, Settings2, TrendingUp, TrendingDown, Pencil } from 'lucide-react';
import { Tablet } from '../types';
import TabletDetailsDialog from '../components/TabletDetailsDialog';

const parseNumeric = (val: any): number | null => {
    if (typeof val === 'number') return val;
    if (!val || typeof val !== 'string') return null;
    // Matches integer or float, handles negative, removes commas
    const match = val.match(/-?[\d,]+(\.\d+)?/);
    if (match) {
        return parseFloat(match[0].replace(/,/g, ''));
    }
    return null;
};

const Compare: React.FC = () => {
    const { tablets, flaggedIds, toggleFlag, clearFlags, updateTablet } = useData();

    // View Options State
    const [showDiffOnly, setShowDiffOnly] = useState(false);
    const [highlightMax, setHighlightMax] = useState(false);
    const [highlightMin, setHighlightMin] = useState(false);

    // Edit State - Uses internal ID
    const [editingTabletId, setEditingTabletId] = useState<string | null>(null);

    // Filter tablets based on flagged IDs
    const selectedTablets = useMemo(() =>
        tablets.filter(t => flaggedIds.includes(t.id)),
        [tablets, flaggedIds]);

    // Derived state for navigation
    const editingIndex = useMemo(() => {
        if (!editingTabletId) return -1;
        return selectedTablets.findIndex(t => t.id === editingTabletId);
    }, [editingTabletId, selectedTablets]);

    const editingTablet = editingIndex !== -1 ? selectedTablets[editingIndex] : null;
    const hasPrev = editingIndex > 0;
    const hasNext = editingIndex !== -1 && editingIndex < selectedTablets.length - 1;

    const handlePrev = () => {
        if (hasPrev) setEditingTabletId(selectedTablets[editingIndex - 1].id);
    };

    const handleNext = () => {
        if (hasNext) setEditingTabletId(selectedTablets[editingIndex + 1].id);
    };

    // Define comparison fields
    const fields: { key: keyof Tablet; label: string; unit?: string; isNumeric?: boolean }[] = [
        { key: 'ModelBrand', label: 'Brand' },
        { key: 'ModelFamily', label: 'Family' },
        { key: 'ModelName', label: 'Model Name' },
        { key: 'ModelLaunchYear', label: 'Released', isNumeric: true },
        { key: 'ModelAge', label: 'Age', unit: 'years', isNumeric: true },
        { key: 'ModelType', label: 'Type' },
        { key: 'ModelProductLink', label: 'Link' },
        { key: 'DigitizerDiagonal', label: 'Diagonal Size', unit: 'mm', isNumeric: true },
        { key: 'DigitizerDimensions', label: 'Active Area', unit: 'mm' },
        { key: 'AspectRatio', label: 'Aspect Ratio' },
        { key: 'DigitizerPressureLevels', label: 'Pressure Levels', isNumeric: true },
        { key: 'DigitizerReportRate', label: 'Report Rate', isNumeric: true },
        { key: 'DigitizerResolution', label: 'Digitizer Res', unit: 'LPmm', isNumeric: true },
        { key: 'ModelIncludedPen', label: 'Pen Model' },
        { key: 'DigitizerType', label: 'Pen Technology' },
        { key: 'DigitizerTilt', label: 'Tilt Support', isNumeric: true },
        { key: 'DigitizerSupportsTouch', label: 'Touch Support' },
        { key: 'DisplayResolution', label: 'Display Resolution' },
        { key: 'DisplaySize', label: 'Display Size', isNumeric: true },
        { key: "DisplayPixelDensity", label: 'PPI', isNumeric: true },
        { key: 'DisplayColorGamuts', label: 'Color Gamut' },
        { key: 'DisplayBrightness', label: 'Brightness', isNumeric: true },
        { key: 'DisplayContrast', label: 'Contrast', isNumeric: true },
        { key: 'DisplayLamination', label: 'Laminated' },
        { key: 'DisplayAntiGlare', label: 'Anti-Glare' },
        { key: 'PhysicalDimensions', label: 'Dimensions', unit: 'mm' },
        { key: 'PhysicalWeight', label: 'Weight', unit: 'g', isNumeric: true },
    ];

    if (selectedTablets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <GitCompare size={64} className="mb-4 opacity-50" />
                <h2 className="text-2xl font-bold text-slate-400 dark:text-slate-300">No Tablets Selected</h2>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Flag tablets in the Catalog to compare them side-by-side.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col space-y-4">
            <header className="flex flex-col gap-4 shrink-0 bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            Compare Models
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full">{selectedTablets.length} Selected</span>
                        </h2>
                    </div>
                    <button
                        onClick={clearFlags}
                        className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X size={16} />
                        Clear Selection
                    </button>
                </div>

                {/* Options Panel */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mr-1">
                        <Settings2 size={14} />
                        View Options
                    </span>

                    <button
                        onClick={() => setShowDiffOnly(!showDiffOnly)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${showDiffOnly ? 'bg-primary-50 dark:bg-primary-900/40 border-primary-200 dark:border-primary-500/50 text-primary-700 dark:text-primary-200' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                        {showDiffOnly ? <EyeOff size={14} /> : <Eye size={14} />}
                        <span>Differences Only</span>
                    </button>

                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    <button
                        onClick={() => setHighlightMax(!highlightMax)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${highlightMax ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        title="Highlight the largest numeric value in each row"
                    >
                        <TrendingUp size={14} />
                        <span>Highlight Max</span>
                    </button>

                    <button
                        onClick={() => setHighlightMin(!highlightMin)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${highlightMin ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-300' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        title="Highlight the smallest numeric value in each row"
                    >
                        <TrendingDown size={14} />
                        <span>Highlight Min</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-auto border border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900/40 relative custom-scrollbar shadow-sm">
                <table className="w-full border-collapse text-left min-w-[600px]">
                    <thead className="bg-white dark:bg-slate-900 sticky top-0 z-20 shadow-md">
                        <tr>
                            <th className="px-4 py-2 w-48 text-slate-600 dark:text-slate-400 font-medium text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sticky left-0 z-30">Specification</th>
                            {selectedTablets.map(tablet => (
                                <th key={tablet.id} className="px-4 py-2 w-64 min-w-[200px] border-b border-slate-200 dark:border-slate-700 relative group bg-white dark:bg-slate-900">
                                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-slate-900/80 rounded-lg p-0.5 backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 shadow-lg">
                                        <button
                                            onClick={() => setEditingTabletId(tablet.id)}
                                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                                            title="Edit Details"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <div className="w-px h-3 bg-slate-200 dark:bg-slate-700"></div>
                                        <button
                                            onClick={() => toggleFlag(tablet.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                                            title="Remove from comparison"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>

                                    <div className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">{tablet.ModelBrand}</div>
                                    <div className="font-bold text-slate-900 dark:text-white text-lg leading-tight">{tablet.ModelName}</div>
                                    <div className="text-xs text-slate-500 font-mono mt-1">{tablet.ModelId}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {fields.map((field) => {
                            // Calculate if all values in this row are identical
                            const rawValues = selectedTablets.map(t => (t as any)[field.key]);
                            const strValues = rawValues.map(v => String(v || '').trim().toLowerCase());
                            const isIdentical = strValues.every(val => val === strValues[0]);

                            // Check if row has any data at all
                            const hasData = strValues.some(val => val !== '' && val !== 'undefined' && val !== 'null');

                            if (!hasData) return null;
                            if (showDiffOnly && isIdentical) return null;

                            // Numeric Calculations for Highlighting
                            let maxVal = -Infinity;
                            let minVal = Infinity;
                            const numericValues: (number | null)[] = [];

                            if (field.isNumeric) {
                                rawValues.forEach(v => {
                                    const n = parseNumeric(v);
                                    numericValues.push(n);
                                    if (n !== null && !isNaN(n)) {
                                        if (n > maxVal) maxVal = n;
                                        if (n < minVal) minVal = n;
                                    }
                                });
                            }

                            // Determine if we should show highlights for this row
                            // Only highlight if there is a difference between max and min (avoid highlighting all if equal)
                            const canHighlight = field.isNumeric && maxVal !== -Infinity && minVal !== Infinity && maxVal !== minVal;

                            return (
                                <tr key={field.key} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${!isIdentical ? 'bg-primary-50/30 dark:bg-primary-900/5' : ''}`}>
                                    <td className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 border-r border-slate-100 dark:border-slate-800/50 bg-slate-50/80 dark:bg-slate-900/20 sticky left-0 z-10 backdrop-blur-sm">
                                        {field.label}
                                        {field.unit && <span className="text-[10px] text-slate-400 dark:text-slate-600 ml-1">({field.unit})</span>}
                                    </td>
                                    {selectedTablets.map((tablet, index) => {
                                        const val = (tablet as any)[field.key] || '-';
                                        const numVal = numericValues[index];

                                        const isMax = canHighlight && highlightMax && numVal === maxVal;
                                        const isMin = canHighlight && highlightMin && numVal === minVal;

                                        return (
                                            <td
                                                key={`${tablet.id}-${field.key}`}
                                                className={`px-4 py-2 text-sm border-r border-slate-100 dark:border-slate-800/50 last:border-r-0 relative ${isIdentical
                                                    ? 'text-slate-400 dark:text-slate-500'
                                                    : 'text-slate-900 dark:text-white font-medium bg-gradient-to-r from-primary-50/50 to-transparent dark:from-primary-500/5 dark:to-transparent'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {isMax && <TrendingUp size={14} className="text-emerald-500 dark:text-emerald-400 shrink-0" />}
                                                    {isMin && <TrendingDown size={14} className="text-red-500 dark:text-red-400 shrink-0" />}
                                                    <span className={`${isMax ? 'text-emerald-600 dark:text-emerald-300 font-bold' : ''} ${isMin ? 'text-red-600 dark:text-red-300 font-bold' : ''}`}>
                                                        {val}
                                                    </span>
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 px-2">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-primary-100 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-500/20 inline-block"></span>
                    <span>Differences highlighted</span>
                </div>
                {highlightMax && (
                    <div className="flex items-center gap-1">
                        <TrendingUp size={12} className="text-emerald-500" />
                        <span>Max value</span>
                    </div>
                )}
                {highlightMin && (
                    <div className="flex items-center gap-1">
                        <TrendingDown size={12} className="text-red-500" />
                        <span>Min value</span>
                    </div>
                )}
            </div>

            {editingTablet && (
                <TabletDetailsDialog
                    isOpen={true}
                    onClose={() => setEditingTabletId(null)}
                    tablet={editingTablet}
                    onSave={(updated) => {
                        updateTablet(updated);
                        setEditingTabletId(null);
                    }}
                    initialIsEditing={true}
                    onPrev={handlePrev}
                    onNext={handleNext}
                    hasPrev={hasPrev}
                    hasNext={hasNext}
                />
            )}
        </div>
    );
};

export default Compare;