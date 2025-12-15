
import { useMemo } from 'react';
import { Tablet } from '../types';

export interface Warning {
    id: string;
    type: 'CRITICAL' | 'WARNING';
    category: 'MISSING_FIELD' | 'DUPLICATE_ID' | 'WHITESPACE' | 'SCHEMA_MISMATCH' | 'INVALID_FORMAT';
    message: string;
    modelId?: string;
    modelName?: string;
    tabletIndex: number;
}

export const useTabletWarnings = (tablets: Tablet[]) => {
    const warnings = useMemo(() => {
        const results: Warning[] = [];
        const idMap = new Map<string, number>();

        tablets.forEach((t, index) => {
            // Use index fallback if ID is completely missing
            const modelId = t.ModelId || `[INDEX_${index}]`;
            const modelName = t.ModelName === 'Unknown' ? '[Unknown Name]' : t.ModelName;
            // Use internal ID for warning uniqueness
            const internalId = t.id;

            // 1. Check for Missing Required Fields
            if (!t.ModelId) {
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

            if (!t.ModelBrand || t.ModelBrand === 'Unknown') {
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

            if (!t.ModelType || t.ModelType === 'Unknown') {
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

            // 2. Track Duplicates (using ModelId because that must be unique for user perspective)
            if (t.ModelId) {
                idMap.set(t.ModelId, (idMap.get(t.ModelId) || 0) + 1);
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
            if (t.ModelType === 'PENTABLET') {
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
                const val = (t as any)[field];
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
                // Find all indices with this ModelId
                tablets.forEach((t, index) => {
                    if (t.ModelId === id) {
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

    return { warnings, stats };
};
