import React from 'react';
import { Tablet } from '../types';
import { Plus } from 'lucide-react';

export interface FieldMenuProps {
    onClose: () => void;
    onSelect: (fieldValue: keyof Tablet) => void;
    options: Array<{ value: string; label: string; category?: string }>;
    excludeValues?: string[]; // To filter out already selected
    emptyMessage?: string;
    className?: string; // Add optional className for custom positioning
}

const FieldSelectionMenu: React.FC<FieldMenuProps> = ({
    onClose,
    onSelect,
    options,
    excludeValues = [],
    emptyMessage = "All options added",
    className = ""
}) => {
    const availableOptions = options.filter(o => !excludeValues.includes(o.value));

    // Group by category
    const CATEGORY_ORDER = ['Model', 'Physical', 'Digitizer', 'Display', 'System', 'Other'];
    const grouped = availableOptions.reduce((acc, opt) => {
        const cat = opt.category || 'Other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(opt);
        return acc;
    }, {} as Record<string, typeof options>);

    const activeCategories = CATEGORY_ORDER.filter(cat => grouped[cat] && grouped[cat].length > 0);
    const hasMultipleCategories = activeCategories.length > 1;

    return (
        <>
            <div className="fixed inset-0 z-10" onClick={onClose} />
            <div className={`
        bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 
        rounded-xl shadow-xl p-3 animate-in fade-in zoom-in-95 duration-100
        max-h-[80vh] overflow-y-auto
        ${className}
        ${hasMultipleCategories
                    ? 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 flex gap-4'
                    : !className.includes('absolute') ? 'absolute top-full left-0 z-20 mt-1 flex flex-col min-w-[200px]' : 'flex flex-col min-w-[200px]'}
      `}
                style={hasMultipleCategories ? { width: 'max-content', maxWidth: '90vw' } : {}}
            >
                {availableOptions.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-slate-400 text-center italic w-full">
                        {emptyMessage}
                    </div>
                ) : (
                    activeCategories.map(cat => (
                        <div key={cat} className={`${hasMultipleCategories ? 'w-40 flex-shrink-0' : 'w-full'}`}>
                            {hasMultipleCategories && (
                                <h4 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-2 border-b border-slate-100 dark:border-slate-800 pb-1 tracking-wider">
                                    {cat}
                                </h4>
                            )}
                            <div className="flex flex-col gap-0">
                                {grouped[cat].map(opt => (
                                    <button
                                        key={opt.value}
                                        onClick={() => onSelect(opt.value as keyof Tablet)}
                                        className="w-full text-left px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors flex items-center justify-between group"
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        <Plus size={12} className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default FieldSelectionMenu;
