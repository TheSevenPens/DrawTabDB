import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Tablet } from '../types';
import { History, PlusCircle, Pencil, ArrowRight, RotateCcw, Trash2 } from 'lucide-react';
import TabletDetailsDialog from '../components/TabletDetailsDialog';

interface Modification {
  tablet: Tablet;
  diffs: { field: string; oldVal: string; newVal: string }[];
}

const Changes: React.FC = () => {
  const { tablets, originalTablets, revertTablet, updateTablet } = useData();
  const [editingTabletId, setEditingTabletId] = useState<string | null>(null);

  const { added, modified } = useMemo(() => {
    // 1. Identify Added Records (Present in current, not in original)
    // Using internal ID as the unique key.
    const addedRecs = tablets.filter(t => !originalTablets.some(o => o.id === t.id));

    // 2. Identify Modified Records
    const modifiedRecs: Modification[] = [];

    tablets.forEach(t => {
      const original = originalTablets.find(o => o.id === t.id);
      if (original) {
        const diffs: { field: string; oldVal: string; newVal: string }[] = [];
        
        // Compare all keys present in either object
        const allKeys = Array.from(new Set([...Object.keys(t), ...Object.keys(original)]));
        
        allKeys.forEach(key => {
            // Skip internal comparison fields that shouldn't show as user modifications unless relevant
            if (key === 'ModifiedDate') return;

            const k = key as keyof Tablet;
            const valCurrent = String(t[k] || '').trim();
            const valOriginal = String(original[k] || '').trim();

            if (valCurrent !== valOriginal) {
                diffs.push({
                    field: k,
                    oldVal: valOriginal || '-',
                    newVal: valCurrent || '-'
                });
            }
        });

        if (diffs.length > 0) {
          modifiedRecs.push({ tablet: t, diffs });
        }
      }
    });

    return { added: addedRecs, modified: modifiedRecs };
  }, [tablets, originalTablets]);

  const hasChanges = added.length > 0 || modified.length > 0;

  const editingTablet = useMemo(() => {
      return tablets.find(t => t.id === editingTabletId);
  }, [tablets, editingTabletId]);

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          Session Changes
          {hasChanges && (
             <span className="text-sm px-3 py-1 rounded-full bg-primary-100 text-primary-700 border border-primary-200 dark:bg-primary-900/50 dark:text-primary-200 dark:border-primary-700/50 font-mono">
               {added.length + modified.length} Changes
             </span>
          )}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track records added or modified since the file was loaded.</p>
      </header>

      {!hasChanges ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <History size={64} className="text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="text-xl font-medium text-slate-900 dark:text-slate-300">No Changes Detected</h3>
          <p className="text-sm">Modifications made to the database will appear here.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-8 pr-2">
            
            {/* Added Records Section */}
            {added.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 border-b border-emerald-200 dark:border-emerald-900/30 pb-2">
                        <PlusCircle size={20} />
                        <h3 className="text-lg font-bold uppercase tracking-wider">Added Records ({added.length})</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {added.map(tablet => (
                            <div key={tablet.id} className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-emerald-500/20 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
                                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                                
                                <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => setEditingTabletId(tablet.id)}
                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                                        title="Edit Record"
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button 
                                        onClick={() => revertTablet(tablet.id)}
                                        className="p-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-md text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                        title="Delete Added Record"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{tablet.Brand}</p>
                                    <h4 className="font-bold text-slate-900 dark:text-white truncate pr-16" title={tablet.ModelName}>{tablet.ModelName}</h4>
                                    <p className="text-xs font-mono text-slate-500 mt-0.5">{tablet.ModelID}</p>
                                </div>
                                <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-700/50 flex gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <span className="bg-slate-100 dark:bg-slate-900/50 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{tablet.Type}</span>
                                    {tablet.LaunchYear && <span className="bg-slate-100 dark:bg-slate-900/50 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">{tablet.LaunchYear}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modified Records Section */}
            {modified.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 border-b border-amber-200 dark:border-amber-900/30 pb-2">
                        <Pencil size={20} />
                        <h3 className="text-lg font-bold uppercase tracking-wider">Modified Records ({modified.length})</h3>
                    </div>

                    <div className="space-y-4">
                        {modified.map(({ tablet, diffs }) => (
                            <div key={tablet.id} className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-amber-500/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {/* Card Header */}
                                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{tablet.Brand}</span>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{tablet.ModelName}</h4>
                                            </div>
                                            <p className="text-xs font-mono text-slate-500">{tablet.ModelID}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-end sm:self-auto">
                                        <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-2 py-1 rounded">
                                            {diffs.length} Field{diffs.length !== 1 ? 's' : ''} Changed
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button 
                                                onClick={() => setEditingTabletId(tablet.id)}
                                                className="p-1.5 bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                                                title="Edit Record"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button 
                                                onClick={() => revertTablet(tablet.id)}
                                                className="p-1.5 bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-md text-slate-500 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 transition-colors"
                                                title="Revert Changes"
                                            >
                                                <RotateCcw size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Diffs Table */}
                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700/30">
                                            <tr>
                                                <th className="px-4 py-2 font-medium w-1/4">Field</th>
                                                <th className="px-4 py-2 font-medium w-1/3 text-red-600/80 dark:text-red-400/80">Old Value</th>
                                                <th className="px-4 py-2 font-medium w-1/12 text-center"></th>
                                                <th className="px-4 py-2 font-medium w-1/3 text-emerald-600/80 dark:text-emerald-400/80">New Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                                            {diffs.map((diff, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/10">
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{diff.field}</td>
                                                    <td className="px-4 py-3 text-red-700 dark:text-red-300 break-all">{diff.oldVal}</td>
                                                    <td className="px-4 py-3 text-center text-slate-400 dark:text-slate-600">
                                                        <ArrowRight size={14} className="mx-auto" />
                                                    </td>
                                                    <td className="px-4 py-3 text-emerald-700 dark:text-emerald-300 font-medium break-all">{diff.newVal}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      )}

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
        />
      )}
    </div>
  );
};

export default Changes;