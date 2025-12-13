import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import TabletCard from '../components/TabletCard';
import TabletDetailsDialog from '../components/TabletDetailsDialog';
import { Tablet } from '../types';
import { Search, Filter, ArrowUp, ArrowDown, Database, Settings, ChevronUp, ChevronDown, X, Plus, ArrowUpDown, GitCompare } from 'lucide-react';

type FilterFieldType = 'text' | 'numeric';
type TextCondition = 'equals' | 'contains' | 'beginswith' | 'endswith';
type NumericCondition = 'equals' | 'lt' | 'lte' | 'gt' | 'gte' | 'range';

interface Filter {
  id: string;
  field: keyof Tablet;
  condition: TextCondition | NumericCondition;
  value: string;
  value2?: string; // For range condition
}

const FILTERABLE_FIELDS: Array<{
  key: keyof Tablet;
  label: string;
  type: FilterFieldType;
}> = [
    { key: 'ModelBrand', label: 'Brand', type: 'text' },
    { key: 'ModelType', label: 'Type', type: 'text' },
    { key: 'ModelName', label: 'Model Name', type: 'text' },
    { key: 'ModelId', label: 'Model ID', type: 'text' },
    { key: 'ModelFamily', label: 'Family', type: 'text' },
    { key: 'ModelStatus', label: 'Status', type: 'text' },
    { key: 'ModelAudience', label: 'Audience', type: 'text' },
    { key: 'ModelLaunchYear', label: 'Launch Year', type: 'numeric' },
    { key: 'ModelAge', label: 'Age', type: 'numeric' },
    { key: 'DigitizerDiagonal', label: 'Diagonal Size', type: 'numeric' },
    { key: 'DigitizerPressureLevels', label: 'Pressure Levels', type: 'numeric' },
    { key: 'DigitizerReportRate', label: 'Report Rate', type: 'numeric' },
    { key: 'PhysicalWeight', label: 'Weight', type: 'numeric' },
    { key: 'DisplayPixelDensity', label: 'Pixel Density', type: 'numeric' },
    { key: 'AspectRatio', label: 'Aspect Ratio', type: 'numeric' },
    { key: 'DigitizerSupportsTouch', label: 'Touch Support', type: 'text' },
  ];
import { useNavigate } from 'react-router-dom';

const parseSearchQuery = (query: string): string[] => {
  const terms: string[] = [];
  // Regex matches: quoted strings (group 1) OR non-whitespace sequences (group 2)
  const regex = /"([^"]+)"|(\S+)/g;
  let match;
  while ((match = regex.exec(query)) !== null) {
    const term = match[1] || match[2];
    if (term) {
      terms.push(term.toLowerCase());
    }
  }
  return terms;
};

const AVAILABLE_COLUMNS = [
  { id: 'ModelFamily', label: 'Family' },
  { id: 'ModelLaunchYear', label: 'Released Year' },
  { id: 'DigitizerDiagonal', label: 'Diagonal Size' },
  { id: 'ModelIncludedPen', label: 'Included Pen' },
  { id: 'DigitizerDimensions', label: 'Active Area' },
  { id: 'AspectRatio', label: 'Aspect Ratio' },
  { id: 'DigitizerPressureLevels', label: 'Pressure Levels' },
  { id: "DisplayPixelDensity", label: "PPI" },
  { id: 'DigitizerResolution', label: 'Digitizer Res' },
  { id: 'PhysicalWeight', label: 'Weight' },
  { id: 'DigitizerSupportsTouch', label: 'Touch Support' }
];

const NEW_TABLET_TEMPLATE: Partial<Tablet> = {
  ModelId: '',
  ModelName: '',
  ModelBrand: 'WACOM',
  ModelType: 'PENTABLET',
  ModelLaunchYear: new Date().getFullYear().toString(),
  ModelStatus: 'AVAILABLE',
  ModelAudience: 'CONSUMER'
};

const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const { tablets, addTablet, updateTablet, flaggedIds, clearFlags } = useData();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filter[]>([]);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [editingFilterPillId, setEditingFilterPillId] = useState<string | null>(null);
  const [showFieldMenu, setShowFieldMenu] = useState(false);
  const [newFilterField, setNewFilterField] = useState<keyof Tablet | ''>('');
  const [newFilterCondition, setNewFilterCondition] = useState<TextCondition | NumericCondition>('contains');
  const [newFilterValue, setNewFilterValue] = useState('');
  const [newFilterValue2, setNewFilterValue2] = useState('');

  // Editing state for pill dropdown
  const [editingPillField, setEditingPillField] = useState<keyof Tablet | ''>('');
  const [editingPillCondition, setEditingPillCondition] = useState<TextCondition | NumericCondition>('contains');
  const [editingPillValue, setEditingPillValue] = useState('');
  const [editingPillValue2, setEditingPillValue2] = useState('');


  // Sorting State
  type SortCriterion = {
    id: string;
    field: string;
    order: 'asc' | 'desc';
  };

  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([
    { id: 'default', field: 'ModelName', order: 'asc' }
  ]);
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Column Menu State
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [openUnitMenuColId, setOpenUnitMenuColId] = useState<string | null>(null);

  // Create New Tablet State
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTabletData, setNewTabletData] = useState<Tablet | null>(null);

  // View Details State
  // We now use internal 'id' for tracking details
  const [detailTabletId, setDetailTabletId] = useState<string | null>(null);

  // Column Settings State
  interface ColumnSettings {
    customLabel?: string;
    textColor?: string;
    unit?: string;
  }

  const [columnSettings, setColumnSettings] = useState<Record<string, ColumnSettings>>({
    DigitizerDiagonal: { unit: 'in' },
    DigitizerDimensions: { unit: 'mm' },
    DigitizerResolution: { unit: 'lpi' }
  });

  const [openSettingsMenuColId, setOpenSettingsMenuColId] = useState<string | null>(null);

  const updateColumnSetting = (colId: string, updates: Partial<ColumnSettings>) => {
    setColumnSettings(prev => ({
      ...prev,
      [colId]: { ...(prev[colId] || {}), ...updates }
    }));
  };

  const getColumnLabel = (colId: string) => {
    return columnSettings[colId]?.customLabel || AVAILABLE_COLUMNS.find(c => c.id === colId)?.label || colId;
  };

  const TEXT_COLORS = [
    { label: 'Default', value: 'text-slate-700 dark:text-slate-300' },
    { label: 'Primary', value: 'text-primary-600 dark:text-primary-400' },
    { label: 'Red', value: 'text-red-600 dark:text-red-400' },
    { label: 'Green', value: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Blue', value: 'text-blue-600 dark:text-blue-400' },
    { label: 'Amber', value: 'text-amber-600 dark:text-amber-400' },
  ];

  // View Settings State
  const [visibleColumns, setVisibleColumns] = useState<string[]>(['ModelLaunchYear', 'DigitizerDiagonal']);
  const [showSettings, setShowSettings] = useState(false);

  // Pane Expansion State
  const [isFilteringExpanded, setIsFilteringExpanded] = useState(true);
  const [isSortingExpanded, setIsSortingExpanded] = useState(true);
  const [isColumnsExpanded, setIsColumnsExpanded] = useState(true);


  const handleCreateNew = () => {
    // Initialize with template. ID and dates will be handled by context if we save.
    // But for the dialog to work we need a valid object.
    // We'll rely on the dialog to return a full object on save.
    setNewTabletData({
      ...NEW_TABLET_TEMPLATE,
      id: '',
      CreateDate: '',
      ModifiedDate: ''
    } as Tablet);
    setShowCreateDialog(true);
  };

  const addColumn = (colId: string) => {
    setVisibleColumns(prev => {
      if (prev.includes(colId)) return prev;
      return [...prev, colId];
    });
  };

  const removeColumn = (colId: string) => {
    setVisibleColumns(prev => prev.filter(id => id !== colId));
  };

  const moveColumn = (index: number, direction: -1 | 1) => {
    setVisibleColumns(prev => {
      const newCols = [...prev];
      if (direction === -1 && index > 0) {
        [newCols[index - 1], newCols[index]] = [newCols[index], newCols[index - 1]];
      } else if (direction === 1 && index < newCols.length - 1) {
        [newCols[index + 1], newCols[index]] = [newCols[index], newCols[index + 1]];
      }
      return newCols;
    });
  };

  const addFilter = () => {
    if (!newFilterField || !newFilterValue) return;

    const fieldConfig = FILTERABLE_FIELDS.find(f => f.key === newFilterField);
    if (!fieldConfig) return;

    if (editingFilterId) {
      // Update existing filter in place
      setFilters(prev => prev.map(f =>
        f.id === editingFilterId
          ? {
            ...f,
            field: newFilterField,
            condition: newFilterCondition,
            value: newFilterValue,
            ...(newFilterCondition === 'range' && newFilterValue2 ? { value2: newFilterValue2 } : { value2: undefined })
          }
          : f
      ));
      setEditingFilterId(null);
    } else {
      // Add new filter
      const filter: Filter = {
        id: Date.now().toString(),
        field: newFilterField,
        condition: newFilterCondition,
        value: newFilterValue,
        ...(newFilterCondition === 'range' && newFilterValue2 ? { value2: newFilterValue2 } : {})
      };
      setFilters(prev => [...prev, filter]);
    }

    setNewFilterField('');
    setNewFilterCondition('contains');
    setNewFilterValue('');
    setNewFilterValue2('');
  };

  const removeFilter = (id: string) => {
    setFilters(prev => prev.filter(f => f.id !== id));
  };

  const editFilter = (filter: Filter) => {
    setEditingPillField(filter.field);
    setEditingPillCondition(filter.condition);
    setEditingPillValue(filter.value);
    setEditingPillValue2(filter.value2 || '');
    setEditingFilterPillId(filter.id);
  };

  const savePillEdit = () => {
    if (!editingFilterPillId || !editingPillField || !editingPillValue) return;

    if (editingFilterPillId === 'new') {
      // Creating new filter
      const filter: Filter = {
        id: Date.now().toString(),
        field: editingPillField,
        condition: editingPillCondition,
        value: editingPillValue,
        ...(editingPillCondition === 'range' && editingPillValue2 ? { value2: editingPillValue2 } : {})
      };
      setFilters(prev => [...prev, filter]);
    } else {
      // Updating existing filter
      setFilters(prev => prev.map(f =>
        f.id === editingFilterPillId
          ? {
            ...f,
            field: editingPillField,
            condition: editingPillCondition,
            value: editingPillValue,
            ...(editingPillCondition === 'range' && editingPillValue2 ? { value2: undefined } : { value2: undefined })
          }
          : f
      ));
    }

    setEditingFilterPillId(null);
    setEditingPillField('');
    setEditingPillCondition('contains');
    setEditingPillValue('');
    setEditingPillValue2('');
  };

  const cancelPillEdit = () => {
    setEditingFilterPillId(null);
    setEditingPillField('');
    setEditingPillCondition('contains');
    setEditingPillValue('');
    setEditingPillValue2('');
  };

  const selectField = (field: keyof Tablet) => {
    setEditingPillField(field);
    setEditingPillCondition('contains');
    const conditions = getAvailableConditions(field);
    if (conditions.length > 0) {
      setEditingPillCondition(conditions[0].value);
    }
    setEditingPillValue('');
    setEditingPillValue2('');
    setEditingFilterPillId('new'); // Use 'new' to indicate creating mode
    setShowFieldMenu(false);
  };

  const getAvailableConditions = (field: keyof Tablet): Array<{ value: TextCondition | NumericCondition; label: string }> => {
    const fieldConfig = FILTERABLE_FIELDS.find(f => f.key === field);
    if (!fieldConfig) return [];

    if (fieldConfig.type === 'text') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'beginswith', label: 'Begins With' },
        { value: 'endswith', label: 'Ends With' },
      ];
    } else {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'lt', label: 'Less Than' },
        { value: 'lte', label: 'Less Than or Equal' },
        { value: 'gt', label: 'Greater Than' },
        { value: 'gte', label: 'Greater Than or Equal' },
        { value: 'range', label: 'Within Range' },
      ];
    }
  };

  const getFieldType = (field: keyof Tablet): FilterFieldType => {
    const fieldConfig = FILTERABLE_FIELDS.find(f => f.key === field);
    return fieldConfig?.type || 'text';
  };

  const sortOptions = [
    { label: 'Name', value: 'ModelName' },
    { label: 'Brand', value: 'ModelBrand' },
    { label: 'Family', value: 'ModelFamily' },
    { label: 'Year', value: 'ModelLaunchYear' },
    { label: 'Age', value: 'ModelAge' },
    { label: 'Diagonal Size', value: 'DigitizerDiagonal' },
    { label: 'Aspect Ratio', value: 'AspectRatio' },
  ];

  const searchTerms = useMemo(() => parseSearchQuery(search), [search]);

  // Filtering & Sorting
  const filteredTablets = useMemo(() => {
    const filtered = tablets.filter(tablet => {
      const modelName = tablet.ModelName.toLowerCase();
      const modelId = tablet.ModelId.toLowerCase();
      const brand = tablet.ModelBrand.toLowerCase();

      const matchesSearch = searchTerms.length === 0 || searchTerms.every(term =>
        modelName.includes(term) || modelId.includes(term) || brand.includes(term)
      );

      const matchesFilters = filters.every(filter => {
        const fieldValue = tablet[filter.field];
        if (!fieldValue) return false;

        const fieldType = getFieldType(filter.field);
        const value = fieldValue.toString().toLowerCase();
        const filterValue = filter.value.toLowerCase();

        if (fieldType === 'text') {
          const condition = filter.condition as TextCondition;
          switch (condition) {
            case 'equals':
              return value === filterValue;
            case 'contains':
              return value.includes(filterValue);
            case 'beginswith':
              return value.startsWith(filterValue);
            case 'endswith':
              return value.endsWith(filterValue);
            default:
              return true;
          }
        } else {
          const numValue = parseFloat(value);
          const numFilter = parseFloat(filter.value);
          if (isNaN(numValue)) return false;

          const condition = filter.condition as NumericCondition;
          switch (condition) {
            case 'equals':
              return numValue === numFilter;
            case 'lt':
              return numValue < numFilter;
            case 'lte':
              return numValue <= numFilter;
            case 'gt':
              return numValue > numFilter;
            case 'gte':
              return numValue >= numFilter;
            case 'range':
              const numFilter2 = filter.value2 ? parseFloat(filter.value2) : numFilter;
              return numValue >= Math.min(numFilter, numFilter2) && numValue <= Math.max(numFilter, numFilter2);
            default:
              return true;
          }
        }
      });
      return matchesSearch && matchesFilters;
    });

    return filtered.sort((a, b) => {
      for (const criterion of sortCriteria) {
        let valA: string | number | number = '';
        let valB: string | number | number = '';
        const field = criterion.field;

        switch (field) {
          case 'ModelLaunchYear':
            valA = a.ModelLaunchYear ? parseInt(a.ModelLaunchYear) : -1;
            valB = b.ModelLaunchYear ? parseInt(b.ModelLaunchYear) : -1;
            break;
          case 'ModelAge':
            valA = a.ModelAge ? parseInt(a.ModelAge) : -1;
            valB = b.ModelAge ? parseInt(b.ModelAge) : -1;
            break;
          case 'DigitizerDiagonal':
            valA = a.DigitizerDiagonal ? parseFloat(a.DigitizerDiagonal) : -1;
            valB = b.DigitizerDiagonal ? parseFloat(b.DigitizerDiagonal) : -1;
            break;
          case 'AspectRatio':
            const getRatio = (size?: string) => {
              if (!size) return -1;
              const match = size.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)/);
              if (match) {
                const w = parseFloat(match[1]);
                const h = parseFloat(match[2]);
                return h > 0 ? w / h : -1;
              }
              return -1;
            };
            valA = getRatio(a.DigitizerDimensions);
            valB = getRatio(b.DigitizerDimensions);
            break;
          default:
            // Default string comparison for other fields
            // Use keyof Tablet assertion safely
            valA = (a[field as keyof Tablet] || '').toString().toLowerCase();
            valB = (b[field as keyof Tablet] || '').toString().toLowerCase();
        }

        if (valA < valB) return criterion.order === 'asc' ? -1 : 1;
        if (valA > valB) return criterion.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [searchTerms, filters, tablets, sortCriteria]);

  // Derived state for details navigation
  const detailIndex = useMemo(() => {
    if (!detailTabletId) return -1;
    return filteredTablets.findIndex(t => t.id === detailTabletId);
  }, [detailTabletId, filteredTablets]);

  const currentDetailTablet = detailIndex !== -1 ? filteredTablets[detailIndex] : null;
  const hasNext = detailIndex !== -1 && detailIndex < filteredTablets.length - 1;
  const hasPrev = detailIndex !== -1 && detailIndex > 0;

  const handleNextTablet = () => {
    if (hasNext) {
      setDetailTabletId(filteredTablets[detailIndex + 1].id);
    }
  };

  const handlePrevTablet = () => {
    if (hasPrev) {
      setDetailTabletId(filteredTablets[detailIndex - 1].id);
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <div className="flex flex-col gap-4">
        {/* Title & Search Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Catalog</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{filteredTablets.length} of {tablets.length} tablets</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 lg:w-96">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input
                type="text"
                placeholder='Search... (e.g. "Artist 12")'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-primary-500 w-full shadow-sm text-xs"
              />
            </div>

            <button
              onClick={handleCreateNew}
              className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-lg shadow-lg shadow-primary-900/20 flex items-center gap-1.5 text-xs font-medium transition-colors whitespace-nowrap"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">Add Tablet</span>
            </button>
          </div>
        </div>

        {/* Controls Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">

          {/* Filtering Section */}
          <div className="xl:col-span-4 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col p-2">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Filter size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">Filtering</h3>
              </div>

              {/* Active Filters as Pills with Add Field Button */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {filters.map(filter => {
                  const fieldConfig = FILTERABLE_FIELDS.find(f => f.key === filter.field);
                  const conditionLabel = getAvailableConditions(filter.field).find(c => c.value === filter.condition)?.label || filter.condition;
                  const isEditing = editingFilterPillId === filter.id;
                  return (
                    <div key={filter.id} className="relative">
                      <div
                        onDoubleClick={() => editFilter(filter)}
                        className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-xs cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
                        title="Double-click to edit"
                      >
                        <span className="font-medium text-slate-700 dark:text-slate-300">{fieldConfig?.label}</span>
                        <span className="text-slate-500 dark:text-slate-400">{conditionLabel}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {filter.condition === 'range' && filter.value2
                            ? `${filter.value} - ${filter.value2}`
                            : filter.value}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFilter(filter.id);
                          }}
                          className="ml-0.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          title="Remove filter"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {/* Edit Dropdown Menu */}
                      {isEditing && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={cancelPillEdit}
                          />
                          <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[280px] space-y-2">
                            {/* Field Select */}
                            <select
                              value={editingPillField}
                              onChange={(e) => {
                                const field = e.target.value as keyof Tablet;
                                setEditingPillField(field);
                                const conditions = getAvailableConditions(field);
                                if (conditions.length > 0) {
                                  setEditingPillCondition(conditions[0].value);
                                }
                              }}
                              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-primary-500"
                            >
                              {FILTERABLE_FIELDS.map(field => (
                                <option key={field.key} value={field.key}>{field.label}</option>
                              ))}
                            </select>

                            {/* Condition Select */}
                            {editingPillField && (
                              <select
                                value={editingPillCondition}
                                onChange={(e) => setEditingPillCondition(e.target.value as TextCondition | NumericCondition)}
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-primary-500"
                              >
                                {getAvailableConditions(editingPillField).map(cond => (
                                  <option key={cond.value} value={cond.value}>{cond.label}</option>
                                ))}
                              </select>
                            )}

                            {/* Value Input(s) */}
                            {editingPillField && (
                              <>
                                {editingPillCondition === 'range' ? (
                                  <div className="flex gap-2">
                                    <input
                                      type={getFieldType(editingPillField) === 'numeric' ? 'number' : 'text'}
                                      value={editingPillValue}
                                      onChange={(e) => setEditingPillValue(e.target.value)}
                                      placeholder="Min"
                                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-primary-500"
                                    />
                                    <input
                                      type={getFieldType(editingPillField) === 'numeric' ? 'number' : 'text'}
                                      value={editingPillValue2}
                                      onChange={(e) => setEditingPillValue2(e.target.value)}
                                      placeholder="Max"
                                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-primary-500"
                                    />
                                  </div>
                                ) : (
                                  <input
                                    type={getFieldType(editingPillField) === 'numeric' ? 'number' : 'text'}
                                    value={editingPillValue}
                                    onChange={(e) => setEditingPillValue(e.target.value)}
                                    placeholder="Value"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-primary-500"
                                  />
                                )}
                              </>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={savePillEdit}
                                disabled={!editingPillValue || (editingPillCondition === 'range' && !editingPillValue2)}
                                className="flex-1 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelPillEdit}
                                className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {/* Add Field Button */}
                {editingFilterPillId !== 'new' && (
                  <div className="relative">
                    <button
                      onClick={() => setShowFieldMenu(!showFieldMenu)}
                      className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      title="Add filter field"
                    >
                      <Plus size={12} />
                    </button>

                    {showFieldMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowFieldMenu(false)}
                        />
                        <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-64 overflow-y-auto min-w-[200px]">
                          {FILTERABLE_FIELDS.map(field => (
                            <button
                              key={field.key}
                              onClick={() => selectField(field.key)}
                              className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                            >
                              {field.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Create Dropdown Menu (only for new filters) */}
                {editingFilterPillId === 'new' && (
                  <div className="relative">
                    <div className="inline-flex items-center gap-1 bg-white dark:bg-slate-800 border border-primary-400 dark:border-primary-500 px-2 py-1 rounded-lg text-xs font-medium text-primary-600 dark:text-primary-400">
                      <Plus size={12} />
                      <span>New Filter</span>
                    </div>

                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={cancelPillEdit}
                      />
                      <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg p-3 min-w-[280px] space-y-2">
                        {/* Field Select */}
                        <select
                          value={editingPillField}
                          onChange={(e) => {
                            const field = e.target.value as keyof Tablet;
                            setEditingPillField(field);
                            const conditions = getAvailableConditions(field);
                            if (conditions.length > 0) {
                              setEditingPillCondition(conditions[0].value);
                            }
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-primary-500"
                        >
                          {FILTERABLE_FIELDS.map(field => (
                            <option key={field.key} value={field.key}>{field.label}</option>
                          ))}
                        </select>

                        {/* Condition Select */}
                        {editingPillField && (
                          <select
                            value={editingPillCondition}
                            onChange={(e) => setEditingPillCondition(e.target.value as TextCondition | NumericCondition)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-primary-500"
                          >
                            {getAvailableConditions(editingPillField).map(cond => (
                              <option key={cond.value} value={cond.value}>{cond.label}</option>
                            ))}
                          </select>
                        )}

                        {/* Value Input(s) */}
                        {editingPillField && (
                          <>
                            {editingPillCondition === 'range' ? (
                              <div className="flex gap-2">
                                <input
                                  type={getFieldType(editingPillField) === 'numeric' ? 'number' : 'text'}
                                  value={editingPillValue}
                                  onChange={(e) => setEditingPillValue(e.target.value)}
                                  placeholder="Min"
                                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-primary-500"
                                />
                                <input
                                  type={getFieldType(editingPillField) === 'numeric' ? 'number' : 'text'}
                                  value={editingPillValue2}
                                  onChange={(e) => setEditingPillValue2(e.target.value)}
                                  placeholder="Max"
                                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-primary-500"
                                />
                              </div>
                            ) : (
                              <input
                                type={getFieldType(editingPillField) === 'numeric' ? 'number' : 'text'}
                                value={editingPillValue}
                                onChange={(e) => setEditingPillValue(e.target.value)}
                                placeholder="Value"
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white px-2 py-1.5 rounded text-xs focus:outline-none focus:border-primary-500"
                              />
                            )}
                          </>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={savePillEdit}
                            disabled={!editingPillValue || (editingPillCondition === 'range' && !editingPillValue2)}
                            className="flex-1 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-300 disabled:dark:bg-slate-700 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Add
                          </button>
                          <button
                            onClick={cancelPillEdit}
                            className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sorting Section */}
          <div className="xl:col-span-4 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col p-2">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <ArrowUpDown size={16} />
                <h3 className="text-xs font-bold uppercase tracking-wider">Sorting</h3>
              </div>

              {/* Active Sort Criteria Pills */}
              <div className="flex flex-wrap gap-1.5 items-center">
                {sortCriteria.map((criterion, index) => {
                  const optionLabel = sortOptions.find(opt => opt.value === criterion.field)?.label || criterion.field;
                  return (
                    <div
                      key={criterion.id}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    >
                      <button
                        onClick={() => {
                          // Toggle order
                          setSortCriteria(prev => prev.map(c => c.id === criterion.id ? { ...c, order: c.order === 'asc' ? 'desc' : 'asc' } : c));
                        }}
                        className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        title="Toggle Order"
                      >
                        {optionLabel}
                        {criterion.order === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                      </button>

                      <button
                        onClick={() => {
                          setSortCriteria(prev => prev.filter(c => c.id !== criterion.id));
                        }}
                        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1"
                        title="Remove Sort"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  );
                })}

                {/* Add Sort Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    title="Add Sort"
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={12} />
                  </button>

                  {/* Add Sort Menu */}
                  {showSortMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                      <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 min-w-[180px] max-h-60 overflow-y-auto flex flex-col gap-0.5">
                        {sortOptions.filter(opt => !sortCriteria.find(sc => sc.field === opt.value)).length === 0 ? (
                          <div className="px-3 py-2 text-xs text-slate-400 text-center italic">
                            All sort options added
                          </div>
                        ) : (
                          sortOptions.filter(opt => !sortCriteria.find(sc => sc.field === opt.value)).map(opt => (
                            <button
                              key={opt.value}
                              onClick={() => {
                                setSortCriteria(prev => [...prev, { id: Date.now().toString(), field: opt.value, order: 'asc' }]);
                                setShowSortMenu(false);
                              }}
                              className="text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors flex items-center justify-between group"
                            >
                              {opt.label}
                              <Plus size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columns Section */}
          <div className="xl:col-span-4 bg-slate-100 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-wrap items-center gap-4 p-2">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Settings size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider">Columns</h3>
            </div>

            {/* Column Pills */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {/* Active Columns */}
              {visibleColumns.map(colId => {
                const col = AVAILABLE_COLUMNS.find(c => c.id === colId);
                if (!col) return null;

                const isOpen = openSettingsMenuColId === colId;
                const settings = columnSettings[colId] || {};
                const currentLabel = settings.customLabel || col.label;

                return (
                  <div
                    key={col.id}
                    className="relative"
                  >
                    <div
                      onClick={() => setOpenSettingsMenuColId(isOpen ? null : colId)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center gap-1.5 cursor-pointer select-none
                        ${isOpen
                          ? 'bg-primary-100 dark:bg-primary-900/40 border-primary-300 dark:border-primary-700 text-primary-800 dark:text-primary-200'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-primary-400 dark:hover:border-primary-500'
                        }`}
                    >
                      {currentLabel}

                      {/* Close button inside pill */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeColumn(col.id);
                        }}
                        className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1 px-1 -mr-1"
                      >
                        <X size={12} />
                      </button>
                    </div>

                    {/* Settings Submenu */}
                    {isOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenSettingsMenuColId(null)} />
                        <div className="absolute top-full left-0 mt-2 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-3 min-w-[240px] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-100">

                          {/* Header showing original field name */}
                          <div className="pb-2 border-b border-slate-100 dark:border-slate-700/50">
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Original Field</span>
                            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{col.label}</div>
                          </div>

                          {/* Label Override */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Label</label>
                            <input
                              type="text"
                              value={settings.customLabel || ''}
                              placeholder={col.label}
                              onChange={(e) => updateColumnSetting(colId, { customLabel: e.target.value })}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none"
                            />
                          </div>

                          {/* Text Color */}
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Color</label>
                            <div className="grid grid-cols-6 gap-1">
                              {TEXT_COLORS.map((color) => (
                                <button
                                  key={color.label}
                                  title={color.label}
                                  onClick={() => updateColumnSetting(colId, { textColor: color.value })}
                                  className={`w-6 h-6 rounded-full border-2 transition-all ${(settings.textColor === color.value) || (!settings.textColor && color.label === 'Default')
                                    ? 'border-slate-400 dark:border-slate-500 scale-110 shadow-sm'
                                    : 'border-transparent hover:scale-110'
                                    }`}
                                >
                                  <div className={`w-full h-full rounded-full ${color.value.replace('text-', 'bg-').split(' ')[0]}`} />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Unit Selection (Conditional) */}
                          {(colId === 'DigitizerDiagonal' || colId === 'DigitizerDimensions' || colId === 'DigitizerResolution') && (
                            <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                              <label className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Unit</label>
                              <div className="flex bg-slate-100 dark:bg-slate-900 rounded p-1">
                                {colId === 'DigitizerDiagonal' && (
                                  <>
                                    <button
                                      onClick={() => updateColumnSetting(colId, { unit: 'in' })}
                                      className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${!settings.unit || settings.unit === 'in' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                    >IN</button>
                                    <button
                                      onClick={() => updateColumnSetting(colId, { unit: 'mm' })}
                                      className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${settings.unit === 'mm' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                    >MM</button>
                                  </>
                                )}
                                {colId === 'DigitizerDimensions' && (
                                  <>
                                    <button
                                      onClick={() => updateColumnSetting(colId, { unit: 'mm' })}
                                      className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${!settings.unit || settings.unit === 'mm' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                    >MM</button>
                                    <button
                                      onClick={() => updateColumnSetting(colId, { unit: 'in' })}
                                      className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${settings.unit === 'in' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                    >IN</button>
                                  </>
                                )}
                                {colId === 'DigitizerResolution' && (
                                  <>
                                    <button
                                      onClick={() => updateColumnSetting(colId, { unit: 'lpi' })}
                                      className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${!settings.unit || settings.unit === 'lpi' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                    >LPI</button>
                                    <button
                                      onClick={() => updateColumnSetting(colId, { unit: 'lpmm' })}
                                      className={`flex-1 text-[10px] font-bold py-1 rounded transition-colors ${settings.unit === 'lpmm' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                                    >LPmm</button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {/* Add Column Button */}
              <div className="relative">
                <button
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  title="Add Column"
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-white dark:hover:bg-slate-800 transition-all flex items-center gap-1.5"
                >
                  <Plus size={12} />
                </button>

                {/* Add Menu Dropdown */}
                {showColumnMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowColumnMenu(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 min-w-[200px] max-h-60 overflow-y-auto flex flex-col gap-0.5">
                      {AVAILABLE_COLUMNS.filter(c => !visibleColumns.includes(c.id)).length === 0 ? (
                        <div className="px-3 py-2 text-xs text-slate-400 text-center italic">
                          All columns added
                        </div>
                      ) : (
                        AVAILABLE_COLUMNS.filter(c => !visibleColumns.includes(c.id)).map(col => (
                          <button
                            key={col.id}
                            onClick={() => {
                              addColumn(col.id);
                              setShowColumnMenu(false);
                            }}
                            className="text-left px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-900/10 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-colors flex items-center justify-between group"
                          >
                            {col.label}
                            <Plus size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Settings Drawer */}

      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2">
        {tablets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 animate-in fade-in duration-500">
            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-full mb-4 border border-dashed border-slate-300 dark:border-slate-700">
              <Database size={48} className="opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-300 mb-2">Database is Empty</h3>
            <p className="max-w-md text-center text-sm mb-6">
              Drag and drop a valid JSON file anywhere on the screen to populate the catalog.
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
            >
              <Plus size={20} />
              <span>Create First Entry</span>
            </button>
          </div>
        ) : filteredTablets.length > 0 ? (
          <div className="flex flex-col gap-2 pb-6">
            {filteredTablets.map(tablet => (
              <TabletCard
                key={tablet.id}
                tablet={tablet}
                visibleColumns={visibleColumns}
                columnSettings={columnSettings}
                onViewDetails={(t) => setDetailTabletId(t.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Filter size={48} className="mb-4 opacity-50" />
            <p className="text-lg">No tablets found matching your criteria.</p>
            <button
              onClick={() => { setSearch(''); setFilters([]); }}
              className="mt-4 text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 underline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button for Comparison */}
      {flaggedIds.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-4 duration-300 flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded-xl shadow-2xl">
            <button
              onClick={clearFlags}
              className="px-3 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => navigate('/compare')}
              className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 font-bold transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <GitCompare size={20} />
              <span>Compare ({flaggedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateDialog && newTabletData && (
        <TabletDetailsDialog
          isOpen={showCreateDialog}
          onClose={() => setShowCreateDialog(false)}
          tablet={newTabletData}
          onSave={(newTablet) => {
            addTablet(newTablet);
            setShowCreateDialog(false);
          }}
          initialIsEditing={true}
        />
      )}

      {/* View/Edit Details Modal */}
      {currentDetailTablet && (
        <TabletDetailsDialog
          isOpen={!!currentDetailTablet}
          onClose={() => setDetailTabletId(null)}
          tablet={currentDetailTablet}
          onSave={(updated) => {
            updateTablet(updated);
          }}
          onPrev={handlePrevTablet}
          onNext={handleNextTablet}
          hasPrev={hasPrev}
          hasNext={hasNext}
        />
      )}
    </div>
  );
};

export default Catalog;