import React, { useMemo, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { AlertTriangle, AlertCircle, CheckCircle, FileWarning, Pencil } from 'lucide-react';
import TabletDetailsDialog from '../components/TabletDetailsDialog';
import { Tablet } from '../types';

interface Warning {
  id: string;
  type: 'CRITICAL' | 'WARNING';
  category: 'MISSING_FIELD' | 'DUPLICATE_ID' | 'WHITESPACE' | 'SCHEMA_MISMATCH' | 'INVALID_FORMAT';
  message: string;
  modelId?: string;
  modelName?: string;
  tabletIndex: number;
}

const Warnings: React.FC = () => {
  const { tablets, updateTabletAtIndex } = useData();
  const [editingTabletIndex, setEditingTabletIndex] = useState<number | null>(null);

  const warnings = useMemo(() => {
    const results: Warning[] = [];
    const idMap = new Map<string, number>();

    tablets.forEach((t, index) => {
      // Use index fallback if ID is completely missing
      const modelId = t.ModelID || `[INDEX_${index}]`;
      const modelName = t.ModelName === 'Unknown' ? '[Unknown Name]' : t.ModelName;
      // Use internal ID for warning uniqueness
      const internalId = t.id;

      // 1. Check for Missing Required Fields
      if (!t.ModelID) {
        results.push({
          id: `missing-id-${internalId}`,
          type: 'CRITICAL',
          category: 'MISSING_FIELD',
          message: `Record at index ${index} is missing a Model ID.`,
          modelName: t.ModelName,
          tabletIndex: index
        });
      }

      if (!t.ModelName || t.ModelName === 'Unknown') {
        results.push({
          id: `missing-name-${internalId}`,
          type: 'CRITICAL',
          category: 'MISSING_FIELD',
          message: `Missing Model Name.`,
          modelId,
          modelName: 'Unknown',
          tabletIndex: index
        });
      }

      if (!t.Brand || t.Brand === 'Unknown') {
        results.push({
          id: `missing-brand-${internalId}`,
          type: 'CRITICAL',
          category: 'MISSING_FIELD',
          message: `Missing Brand.`,
          modelId,
          modelName,
          tabletIndex: index
        });
      }

      if (!t.Type || t.Type === 'Unknown') {
        results.push({
          id: `missing-type-${internalId}`,
          type: 'CRITICAL',
          category: 'MISSING_FIELD',
          message: `Missing Type.`,
          modelId,
          modelName,
          tabletIndex: index
        });
      }

      // 2. Track Duplicates (using ModelID because that must be unique for user perspective)
      if (t.ModelID) {
        idMap.set(t.ModelID, (idMap.get(t.ModelID) || 0) + 1);
      }

      // 3. Check for Whitespace in all string fields
      Object.entries(t).forEach(([key, value]) => {
        if (typeof value === 'string') {
          if (value !== value.trim()) {
            results.push({
              id: `whitespace-${internalId}-${key}`,
              type: 'WARNING',
              category: 'WHITESPACE',
              message: `Field '${key}' has leading/trailing whitespace. Value: "${value}"`,
              modelId,
              modelName,
              tabletIndex: index
            });
          }
        }
      });

      // 4. Check for Display Specs on Pen Tablets
      if (t.Type === 'PENTABLET') {
        const displayFields: (keyof Tablet)[] = [
          'DisplayResolution',
          'DisplayDimensions',
          'DisplayViewingAngleHorizontal',
          'DisplayViewingAngleVertical',
          'DisplayColorBitDepth',
          'DisplayContrast',
          'DisplayResponseTime',
          'DisplayColorGamuts',
          'DisplayBrightness',
          'DisplayRefreshRate',
          'DisplayPanelTech'
        ];

        displayFields.forEach(field => {
          const val = t[field];
          // Check if value exists and is not just whitespace or common placeholders
          if (val && typeof val === 'string') {
            const normalized = val.trim().toLowerCase();
            if (normalized !== '' && normalized !== 'n/a' && normalized !== '-' && normalized !== 'none') {
              results.push({
                id: `schema-${internalId}-${field}`,
                type: 'WARNING',
                category: 'SCHEMA_MISMATCH',
                message: `Pen Tablet contains display spec '${field}': "${val}"`,
                modelId,
                modelName,
                tabletIndex: index
              });
            }
          }
        });
      }

      // 5. Check for Non-Numeric values in numeric fields
      const numericFields: (keyof Tablet)[] = [
        'ModelLaunchYear', 'DigitizerPressureLevels', 'DigitizerReportRate', 'DigitizerResolution',
        'DigitizerTilt', 'DisplayRefreshRate', 'DisplayBrightness', 'DisplayResponseTime',
        'PhysicalWeight', 'DigitizerMaxHover', 'DisplayPixelDensity', 'DisplayDimensions', 'DisplayContrast'
      ];

      const hasNumber = (str: string) => /\d/.test(str);

      numericFields.forEach(field => {
        const val = t[field];
        if (val && typeof val === 'string' && val.trim() !== '') {
          const normalized = val.trim().toLowerCase();
          // Ignore common non-numeric placeholders
          if (['n/a', 'unknown', '-', 'tbd', 'none'].includes(normalized)) return;

          // If it doesn't contain any digit, it's definitely not a number (e.g. "Yes")
          if (!hasNumber(val)) {
            results.push({
              id: `numeric-${internalId}-${field}`,
              type: 'WARNING',
              category: 'INVALID_FORMAT',
              message: `Field '${field}' should be numeric but contains: "${val}"`,
              modelId,
              modelName,
              tabletIndex: index
            });
          }
        }
      });
    });

    // Add duplicates to results (we need to find the indices again for duplicates)
    idMap.forEach((count, id) => {
      if (count > 1) {
        // Find all indices with this ModelID
        tablets.forEach((t, index) => {
          if (t.ModelID === id) {
            results.push({
              id: `dup-${t.id}-${index}`, // Unique warning ID using internal ID
              type: 'CRITICAL',
              category: 'DUPLICATE_ID',
              message: `Duplicate Model ID detected: "${id}".`,
              modelId: id,
              modelName: t.ModelName,
              tabletIndex: index
            });
          }
        });
      }
    });

    // Sort: Critical first, then by Model ID
    return results.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'CRITICAL' ? -1 : 1;
      }
      return (a.modelId || '').localeCompare(b.modelId || '');
    });
  }, [tablets]);

  const stats = {
    total: warnings.length,
    critical: warnings.filter(w => w.type === 'CRITICAL').length,
    warning: warnings.filter(w => w.type === 'WARNING').length
  };

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