import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { AlertTriangle, AlertCircle, CheckCircle, FileWarning, Pencil } from 'lucide-react';
import TabletDetailsDialog from '../components/TabletDetailsDialog';
import { Tablet } from '../types';
import { useTabletWarnings } from '../hooks/useTabletWarnings';

const Warnings: React.FC = () => {
  const { tablets, updateTabletAtIndex } = useData();
  const [editingTabletIndex, setEditingTabletIndex] = useState<number | null>(null);

  const { warnings, stats } = useTabletWarnings(tablets);

  const handleEdit = (index: number) => {
    setEditingTabletIndex(index);
  };

  const handleSave = (updatedTablet: Tablet) => {
    if (editingTabletIndex !== null) {
      updateTabletAtIndex(editingTabletIndex, updatedTablet);
      setEditingTabletIndex(null);
    }
  };

  const hasPrev = editingTabletIndex !== null && editingTabletIndex > 0;
  const hasNext = editingTabletIndex !== null && editingTabletIndex < tablets.length - 1;

  const handlePrev = () => {
    if (hasPrev && editingTabletIndex !== null) setEditingTabletIndex(editingTabletIndex - 1);
  };

  const handleNext = () => {
    if (hasNext && editingTabletIndex !== null) setEditingTabletIndex(editingTabletIndex + 1);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          Data Warnings
          {stats.total > 0 && (
            <span className="text-sm px-3 py-1 rounded-full bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-700/50 font-mono">
              {stats.total} Issues Found
            </span>
          )}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Audit report for data integrity issues in the loaded database.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className={`p-3 rounded-lg ${stats.total > 0 ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
            {stats.total > 0 ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Total Issues</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Critical Errors</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.critical}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-sm">
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <FileWarning size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">Warnings</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.warning}</p>
          </div>
        </div>
      </div>

      {/* Warnings List */}
      <div className="flex-1 overflow-hidden bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl flex flex-col shadow-sm">
        {warnings.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <CheckCircle size={64} className="text-emerald-500/20 mb-4" />
            <h3 className="text-xl font-medium text-slate-900 dark:text-slate-300">All Clear</h3>
            <p className="text-sm">No data integrity issues found.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-2">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-700">Severity</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-700">Issue Type</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-700">Model ID</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-700">Model Name</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-700">Details</th>
                  <th className="p-4 border-b border-slate-200 dark:border-slate-700 w-16 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {warnings.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="p-4">
                      {w.type === 'CRITICAL' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                          Critical
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50">
                          Warning
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-slate-700 dark:text-slate-300">
                      {w.category === 'MISSING_FIELD' && 'Missing Data'}
                      {w.category === 'DUPLICATE_ID' && 'Duplicate ID'}
                      {w.category === 'WHITESPACE' && 'Whitespace'}
                      {w.category === 'SCHEMA_MISMATCH' && 'Schema Mismatch'}
                      {w.category === 'INVALID_FORMAT' && 'Invalid Format'}
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-500 dark:text-slate-400">{w.modelId || '-'}</td>
                    <td className="p-4 text-sm text-slate-900 dark:text-white font-medium">{w.modelName || '-'}</td>
                    <td className="p-4 text-sm text-slate-600 dark:text-slate-400">{w.message}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleEdit(w.tabletIndex)}
                        className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-primary-600 dark:hover:bg-primary-600 text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-white rounded-lg transition-colors"
                        title="Edit Record"
                      >
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      {editingTabletIndex !== null && tablets[editingTabletIndex] && (
        <TabletDetailsDialog
          isOpen={true}
          onClose={() => setEditingTabletIndex(null)}
          tablet={tablets[editingTabletIndex]}
          onSave={handleSave}
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

export default Warnings;