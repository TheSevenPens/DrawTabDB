import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TABLET_FIELDS } from '../tabletFields';
import { Tablet } from '../types';
import { prepareTabletForExport } from '../contexts/DataContext';
import { Trash2, AlertTriangle, ArrowLeft, ArrowRight, X, Save, ExternalLink, ChevronDown, ChevronLeft, ChevronRight, LayoutGrid, Monitor, Info, FileJson, Copy, Check } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { parseDimensions, calculateArea } from '../utils/dimensionUtils';
import { mmToInches, lpmToLpi, kgsToLbs } from '../utils/unitUtils';

interface TabletDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tablet: Tablet;
  onSave: (tablet: Tablet) => void;
  initialIsEditing?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}


// Predefined Options
const BRAND_OPTIONS = ["WACOM", "HUION", "XPPEN", "XENCELABS", "UGEE", "SAMSUNG", "APPLE"];
const TYPE_OPTIONS = ["PENDISPLAY", "PENTABLET", "STANDALONE", ""];
const DIGITIZER_TYPE_OPTIONS = ["PASSIVE_EMR", "ACTIVE_EMR", "MPP", "AES", "APPLE", ""];
const LAMINATION_OPTIONS = ["YES", "NO", ""];
const ANTIGLARE_OPTIONS = ["ETCHEDGLASS", "AGFILM", ""];
const AUDIENCE_OPTIONS = ["CONSUMER", "PROFESSIONAL", ""];
const DISPLAY_PANEL_TECH_OPTIONS = ["IPS", "OLED", ""];
const SUPPORTSTOUCH_OPTIONS = ["YES", "NO", ""];
const DISPLAY_RESOLUTION_OPTIONS = [
  "1280 x 720",
  "1920 x 1080",
  "1920 x 1200",
  "2560 x 1440",
  "2560 x 1600",
  "3840 x 2160",
  "5120 x 2880",
  ""
];

type TabType = 'CORE' | 'DISPLAY' | 'META' | 'JSON';

const TabletDetailsDialog: React.FC<TabletDetailsDialogProps> = ({
  isOpen,
  onClose,
  tablet,
  onSave,
  initialIsEditing = false,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Tablet>(tablet);
  const [activeTab, setActiveTab] = useState<TabType>('CORE');

  // Dropdown states
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showDigitizerTypeDropdown, setShowDigitizerTypeDropdown] = useState(false);
  const [showLaminationDropdown, setShowLaminationDropdown] = useState(false);
  const [showAntiGlareDropdown, setShowAntiGlareDropdown] = useState(false);
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const [showDisplayPanelTechDropdown, setShowDisplayPanelTechDropdown] = useState(false);
  const [showDisplayResolutionDropdown, setShowDisplayResolutionDropdown] = useState(false);
  const [showSupportsTouchDropdown, setShowSupportsTouchDropdown] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [includeCalculated, setIncludeCalculated] = useState(false);
  const [includeEmpty, setIncludeEmpty] = useState(false);

  // Effect for handling dialog open/close state
  useEffect(() => {
    if (isOpen) {
      setIsEditing(initialIsEditing);
      setActiveTab('CORE'); // Reset to Core tab only when dialog opens
    } else {
      // Reset state when closed
      setIsEditing(false);
      setShowBrandDropdown(false);
      setShowTypeDropdown(false);
      setShowDigitizerTypeDropdown(false);
      setShowLaminationDropdown(false);
      setShowAntiGlareDropdown(false);
      setShowAudienceDropdown(false);
      setShowDisplayPanelTechDropdown(false);
      setShowDisplayResolutionDropdown(false);
      setShowSupportsTouchDropdown(false);
    }
  }, [isOpen]); // Only run when isOpen changes

  // Effect for updating form data when tablet changes (without resetting tab)
  useEffect(() => {
    if (isOpen) {
      setFormData(tablet);
    }
  }, [tablet]); // Only run when tablet data updates

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBrandSelect = (brand: string) => {
    setFormData(prev => ({ ...prev, ModelBrand: brand }));
    setShowBrandDropdown(false);
  };

  const handleTypeSelect = (typeVal: string) => {
    setFormData(prev => ({ ...prev, ModelType: typeVal }));
    setShowTypeDropdown(false);
  };

  const handleDigitizerTypeSelect = (val: string) => {
    setFormData(prev => ({ ...prev, DigitizerType: val }));
    setShowDigitizerTypeDropdown(false);
  };

  const handleLaminationSelect = (val: string) => {
    setFormData(prev => ({ ...prev, DisplayLamination: val }));
    setShowLaminationDropdown(false);
  };

  const handleAntiGlareSelect = (val: string) => {
    setFormData(prev => ({ ...prev, DisplayAntiGlare: val }));
    setShowAntiGlareDropdown(false);
  };

  const handleAudienceSelect = (val: string) => {
    setFormData(prev => ({ ...prev, ModelAudience: val }));
    setShowAudienceDropdown(false);
  };

  const handleDisplayPanelTechSelect = (val: string) => {
    setFormData(prev => ({ ...prev, DisplayPanelTech: val }));
    setShowDisplayPanelTechDropdown(false);
  };

  const handleDisplayResolutionSelect = (val: string) => {
    setFormData(prev => ({ ...prev, DisplayResolution: val }));
    setShowDisplayResolutionDropdown(false);
  };

  const handleSupportsTouchSelect = (val: string) => {
    setFormData(prev => ({ ...prev, DigitizerSupportsTouch: val }));
    setShowSupportsTouchDropdown(false);
  };

  const handleSave = () => {
    onSave(formData);
    // Prompt implies just enabling editing, so we'll exit edit mode on save.
    setIsEditing(false);
  };

  // Organize fields into tabs
  const tabConfig = {
    CORE: [
      {
        title: "Model",
        fields: ["ModelBrand", "ModelFamily", "ModelName", "ModelId", "ModelLaunchYear", "ModelAge", "ModelStatus", "ModelType", "ModelProductLink", "ModelIncludedPen", "ModelAudience"]
      },
      {
        title: "Physical",
        fields: ["PhysicalDimensions", "PhysicalWeight", "PhysicalWeightInclStand"]
      },
      {
        title: "Digitizer",
        fields: ["DigitizerDimensions", "DigitizerDiagonal", "DigitizerArea", "DigitizerPressureLevels", "DigitizerReportRate", "DigitizerResolution", "DigitizerType", "DigitizerTilt", "DigitizerMaxHover", "DigitizerAccuracyCenter", "DigitizerAccuracyCorner", "DigitizerSupportsTouch"]
      }
    ],
    DISPLAY: [
      {
        title: "Display",
        fields: ["DisplayResolution", "DisplayPixelDensity", "DisplayDimensions", "DisplayColorGamuts", "DisplayContrast", "DisplayBrightness", "DisplayResponseTime", "DisplayViewingAngleHorizontal", "DisplayViewingAngleVertical", "DisplayPanelTech", "DisplayColorBitDepth", "DisplayRefreshRate", "DisplayAntiGlare", "DisplayLamination"]
      }
    ],
    META: [
      {
        title: "System",
        fields: ["id", "CreateDate", "ModifiedDate"]
      }
    ]
  };

  // Derive units and read-only status from metadata
  const fieldUnits: Record<string, string> = {};
  const readOnlyFields: string[] = [];

  TABLET_FIELDS.forEach(field => {
    if (field.unit) {
      fieldUnits[field.fieldName] = field.unit;
    }
    if (field.isCalculated || field.isSystem) {
      readOnlyFields.push(field.fieldName);
    }
  });

  const getInputStyles = (fieldName: string, hasRightElement: boolean, isReadOnly: boolean) => {
    const originalValue = (tablet as any)[fieldName] || '';
    const currentValue = (formData as any)[fieldName] || '';
    const hasChanged = originalValue !== currentValue;

    // Add padding right if there's a unit or icon to prevent text overlap
    const baseStyles = `w-full rounded-lg px-2.5 py-1.5 text-sm transition-all focus:outline-none ${hasRightElement ? 'pr-10' : ''}`;

    // If we are not editing, OR if the field is specifically read-only (calculated), show as disabled/static
    if (!isEditing || isReadOnly) {
      return `${baseStyles} bg-slate-100 dark:bg-slate-800/50 border border-transparent text-slate-600 dark:text-white disabled:opacity-70 disabled:cursor-not-allowed`;
    }

    // Editable styles
    if (hasChanged) {
      return `${baseStyles} bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/50 text-amber-900 dark:text-amber-100 focus:border-amber-400 placeholder-amber-500/30`;
    }

    return `${baseStyles} bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary-500 text-slate-900 dark:text-white`;
  };

  const dialogContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {tablet.ModelName || "New Tablet"}
              {isEditing && <span className="text-xs bg-primary-600 px-2 py-0.5 rounded text-white font-medium">EDITING</span>}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-mono mt-0.5">{tablet.ModelId || "ID Not Set"}</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Navigation Buttons */}
            {(onPrev || onNext) && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 mr-2">
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-colors rounded-md"
                  title="Previous Tablet"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-0.5"></div>
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-30 disabled:hover:text-slate-500 transition-colors rounded-md"
                  title="Next Tablet"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {/* Edit Toggle Slider */}
            <label className="flex items-center cursor-pointer select-none gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isEditing}
                  onChange={() => setIsEditing(!isEditing)}
                />
                <div className="w-9 h-5 bg-slate-400 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
              </div>
              <span className={`text-xs font-medium ${isEditing ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                {isEditing ? 'Edit Mode' : 'Read Only'}
              </span>
            </label>

            <button onClick={onClose} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs Header */}
        <div className="flex items-center px-6 border-b border-slate-200 dark:border-slate-800 gap-8 bg-white dark:bg-slate-900 shrink-0">
          <button
            onClick={() => setActiveTab('CORE')}
            className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'CORE'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
          >
            <LayoutGrid size={16} />
            Core
          </button>
          <button
            onClick={() => setActiveTab('DISPLAY')}
            className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'DISPLAY'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
          >
            <Monitor size={16} />
            Display
          </button>
          <button
            onClick={() => setActiveTab('META')}
            className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'META'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
          >
            <Info size={16} />
            Metadata
          </button>
          <button
            onClick={() => setActiveTab('JSON')}
            className={`py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === 'JSON'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
          >
            <FileJson size={16} />
            JSON
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50/50 dark:bg-slate-900/50">
          {activeTab === 'JSON' ? (
            <div className="bg-white dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-full overflow-hidden flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-2 mb-4">
                <h3 className="text-primary-600 dark:text-primary-400 font-bold uppercase text-[10px] tracking-widest hidden sm:block">RAW DATA</h3>
                <div className="flex items-center gap-4 flex-1 sm:flex-none justify-end">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={includeCalculated}
                      onChange={e => setIncludeCalculated(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                    />
                    Include Calculated
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none hover:text-slate-900 dark:hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={includeEmpty}
                      onChange={e => setIncludeEmpty(e.target.checked)}
                      className="rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500 w-3.5 h-3.5"
                    />
                    Include Empty
                  </label>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                  <button
                    onClick={() => {
                      const jsonString = JSON.stringify(prepareTabletForExport(formData, { includeCalculated, includeEmpty }), null, 2);
                      navigator.clipboard.writeText(jsonString);
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors px-2 py-1 rounded bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
                  >
                    {isCopied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    <span>{isCopied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                </div>
              </div>
              <pre className="flex-1 overflow-auto text-xs font-mono text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
                {JSON.stringify(prepareTabletForExport(formData, { includeCalculated, includeEmpty }), null, 2)}
              </pre>
            </div>
          ) : (
            tabConfig[activeTab as keyof typeof tabConfig].map(group => (
              <div key={group.title} className="bg-white dark:bg-slate-800/40 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-primary-600 dark:text-primary-400 font-bold mb-4 uppercase text-[10px] tracking-widest border-b border-slate-100 dark:border-slate-700/50 pb-2">{group.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.fields.map(field => {
                    const unit = fieldUnits[field];
                    const isLink = field === 'ModelProductLink';
                    const isReadOnly = readOnlyFields.includes(field);

                    // Field Type flags
                    const isDigitizerDiagonal = field === 'DigitizerDiagonal';
                    const isDigitizerResolution = field === 'DigitizerResolution';
                    const isDigitizerDimensions = field === 'DigitizerDimensions';
                    const isBrand = field === 'ModelBrand';
                    const isType = field === 'ModelType';
                    const isDigitizerType = field === 'DigitizerType';
                    const isLamination = field === 'DisplayLamination';
                    const isAntiGlare = field === 'DisplayAntiGlare';
                    const isAudience = field === 'ModelAudience';
                    const isDisplayPanelTech = field === 'DisplayPanelTech';
                    const isDisplayResolution = field === 'DisplayResolution';
                    const isSupportsTouch = field === 'DigitizerSupportsTouch';
                    const isInternalId = field === 'id';
                    const isPhysicalDimensions = field === 'PhysicalDimensions';
                    const isPhysicalWeight = field === 'PhysicalWeight';


                    const hasDropdown = isBrand || isType || isDigitizerType || isLamination || isAntiGlare || isAudience || isDisplayPanelTech || isDisplayResolution || isSupportsTouch;

                    // Helper logic for DigitizerArea
                    let areaInSqInches: string | undefined = undefined;
                    if (field === 'DigitizerArea') {
                      // Use dimensions field to calculate (TabletDetailsDialog previously relied on parsing DigitizerDimensions inline)
                      const dims = parseDimensions((formData as any).DigitizerDimensions);
                      if (dims) {
                        const areaMm2 = calculateArea(dims);
                        if (areaMm2) {
                          areaInSqInches = (areaMm2 * 0.0015500031).toFixed(2);
                        }
                      }
                    }
                    // Compatibility for input field override if needed
                    const calculatedValue = field === 'DigitizerArea' ? areaInSqInches : undefined;

                    return (
                      <div
                        key={field}
                        className={`space-y-1 group ${isLink || isInternalId ? 'col-span-full md:col-span-2' : ''}`}
                      >
                        <label className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
                          {TABLET_FIELDS.find(f => f.fieldName === field)?.DisplayName || field}
                          {isReadOnly && <span className="ml-1 text-[9px] text-slate-400 dark:text-slate-600">(Calculated/System)</span>}
                        </label>

                        {isLink ? (
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type="text"
                                name={field}
                                value={(formData as any)[field] || ''}
                                onChange={handleChange}
                                disabled={!isEditing || isReadOnly}
                                className={getInputStyles(field, !!unit, isReadOnly)}
                              />
                            </div>
                            <a
                              href={(formData as any)[field]}
                              target="_blank"
                              rel="noreferrer"
                              className={`shrink-0 w-10 rounded-lg border flex items-center justify-center transition-colors ${(formData as any)[field]
                                ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:border-slate-500 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 text-slate-400 dark:text-slate-600 cursor-not-allowed pointer-events-none'
                                }`}
                              title="Open Link"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="text"
                              name={field}
                              value={calculatedValue ?? (formData as any)[field] ?? ''}
                              onChange={handleChange}
                              disabled={!isEditing || isReadOnly}
                              className={`${getInputStyles(field, !!unit || hasDropdown, isReadOnly)} ${isInternalId ? 'font-mono text-xs' : ''}`}
                              onFocus={() => {
                                if (isBrand && isEditing) setShowBrandDropdown(true);
                                if (isType && isEditing) setShowTypeDropdown(true);
                                if (isDigitizerType && isEditing) setShowDigitizerTypeDropdown(true);
                                if (isLamination && isEditing) setShowLaminationDropdown(true);
                                if (isAntiGlare && isEditing) setShowAntiGlareDropdown(true);
                                if (isAudience && isEditing) setShowAudienceDropdown(true);
                                if (isDisplayPanelTech && isEditing) setShowDisplayPanelTechDropdown(true);
                                if (isDisplayResolution && isEditing) setShowDisplayResolutionDropdown(true);
                                if (isSupportsTouch && isEditing) setShowSupportsTouchDropdown(true);
                              }}
                              onBlur={() => {
                                if (isBrand) setTimeout(() => setShowBrandDropdown(false), 200);
                                if (isType) setTimeout(() => setShowTypeDropdown(false), 200);
                                if (isDigitizerType) setTimeout(() => setShowDigitizerTypeDropdown(false), 200);
                                if (isLamination) setTimeout(() => setShowLaminationDropdown(false), 200);
                                if (isAntiGlare) setTimeout(() => setShowAntiGlareDropdown(false), 200);
                                if (isAudience) setTimeout(() => setShowAudienceDropdown(false), 200);
                                if (isDisplayPanelTech) setTimeout(() => setShowDisplayPanelTechDropdown(false), 200);
                                if (isDisplayResolution) setTimeout(() => setShowDisplayResolutionDropdown(false), 200);
                                if (isSupportsTouch) setTimeout(() => setShowSupportsTouchDropdown(false), 200);
                              }}
                              autoComplete={hasDropdown ? "off" : undefined}
                            />

                            {hasDropdown && isEditing && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                <ChevronDown size={14} />
                              </div>
                            )}

                            {/* Dropdowns */}
                            {isBrand && showBrandDropdown && isEditing && (
                              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {BRAND_OPTIONS.map(opt => (
                                  <div key={opt} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-600/20 hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors" onMouseDown={(e) => { e.preventDefault(); handleBrandSelect(opt); }}>{opt}</div>
                                ))}
                              </div>
                            )}
                            {isType && showTypeDropdown && isEditing && (
                              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {TYPE_OPTIONS.map(opt => (
                                  <div key={opt} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-600/20 hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors" onMouseDown={(e) => { e.preventDefault(); handleTypeSelect(opt); }}>{opt || '(None)'}</div>
                                ))}
                              </div>
                            )}
                            {isDigitizerType && showDigitizerTypeDropdown && isEditing && (
                              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {DIGITIZER_TYPE_OPTIONS.map(opt => (
                                  <div key={opt} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-600/20 hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors" onMouseDown={(e) => { e.preventDefault(); handleDigitizerTypeSelect(opt); }}>{opt || '(None)'}</div>
                                ))}
                              </div>
                            )}
                            {isLamination && showLaminationDropdown && isEditing && (
                              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {LAMINATION_OPTIONS.map(opt => (
                                  <div key={opt} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-600/20 hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors" onMouseDown={(e) => { e.preventDefault(); handleLaminationSelect(opt); }}>{opt || '(None)'}</div>
                                ))}
                              </div>
                            )}
                            {isAntiGlare && showAntiGlareDropdown && isEditing && (
                              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {ANTIGLARE_OPTIONS.map(opt => (
                                  <div key={opt} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-600/20 hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors" onMouseDown={(e) => { e.preventDefault(); handleAntiGlareSelect(opt); }}>{opt || '(None)'}</div>
                                ))}
                              </div>
                            )}
                            {isAudience && showAudienceDropdown && isEditing && (
                              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {AUDIENCE_OPTIONS.map(opt => (
                                  <div key={opt} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-600/20 hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors" onMouseDown={(e) => { e.preventDefault(); handleAudienceSelect(opt); }}>{opt || '(None)'}</div>
                                ))}
                              </div>
                            )}
                            {isDisplayPanelTech && showDisplayPanelTechDropdown && isEditing && (
                              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {DISPLAY_PANEL_TECH_OPTIONS.map(opt => (
                                  <div key={opt} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-600/20 hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors" onMouseDown={(e) => { e.preventDefault(); handleDisplayPanelTechSelect(opt); }}>{opt || '(None)'}</div>
                                ))}
                              </div>
                            )}
                            {isDisplayResolution && showDisplayResolutionDropdown && isEditing && (
                              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {DISPLAY_RESOLUTION_OPTIONS.map(opt => (
                                  <div key={opt} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-600/20 hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors" onMouseDown={(e) => { e.preventDefault(); handleDisplayResolutionSelect(opt); }}>{opt || '(None)'}</div>
                                ))}
                              </div>
                            )}
                            {isSupportsTouch && showSupportsTouchDropdown && isEditing && (
                              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                {SUPPORTSTOUCH_OPTIONS.map(opt => (
                                  <div key={opt} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-600/20 hover:text-primary-900 dark:hover:text-white cursor-pointer transition-colors" onMouseDown={(e) => { e.preventDefault(); handleSupportsTouchSelect(opt); }}>{opt || '(None)'}</div>
                                ))}
                              </div>
                            )}

                            {unit && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500 font-medium pointer-events-none select-none">
                                {unit}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Helpers */}
                        {isDigitizerDiagonal && (formData as any)[field] && !isNaN(parseFloat((formData as any)[field])) && (
                          <p className="text-[10px] text-slate-500 font-mono text-right pr-1">≈ {mmToInches(parseFloat((formData as any)[field])).toFixed(2)}″</p>
                        )}
                        {isDigitizerResolution && (formData as any)[field] && !isNaN(parseFloat((formData as any)[field])) && (
                          <p className="text-[10px] text-slate-500 font-mono text-right pr-1">≈ {Math.round(lpmToLpi(parseFloat((formData as any)[field])))} LPI</p>
                        )}
                        {isPhysicalWeight && (formData as any)[field] && !isNaN(parseFloat((formData as any)[field])) && (
                          <p className="text-[10px] text-slate-500 font-mono text-right pr-1">≈ {kgsToLbs(parseFloat((formData as any)[field]) / 1000).toFixed(2)} lbs</p>
                        )}
                        {field === 'DigitizerArea' && areaInSqInches && (
                          <p className="text-[10px] text-slate-500 font-mono text-right pr-1">≈ {areaInSqInches} in²</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            ))
          )}
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3 shrink-0 animate-in slide-in-from-bottom-2">
            <button
              onClick={() => {
                if (initialIsEditing) onClose();
                else {
                  setIsEditing(false);
                  setFormData(tablet);
                }
              }}
              className="px-4 py-2 text-slate-500 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg flex items-center gap-2 shadow-lg shadow-primary-900/20"
            >
              <Save size={16} />
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
};

export default TabletDetailsDialog;