import { useMemo } from 'react';
import { Tablet, Filter, TextCondition, NumericCondition, FilterFieldType } from '../types';

const NUMERIC_FIELDS = new Set<keyof Tablet>([
    'ModelLaunchYear',
    'ModelAge',
    'DigitizerDiagonal',
    'DigitizerPressureLevels',
    'DigitizerReportRate',
    'PhysicalWeight',
    'DisplayPixelDensity',
    'DigitizerAspectRatio',
    'DigitizerResolution',
    'DisplayDimensions',
    'DisplayRefreshRate',
    'DisplayResponseTime',
    'DisplayBrightness',
    'DigitizerTilt',
    'DigitizerMaxHover'
]);

const getFieldType = (field: keyof Tablet): FilterFieldType => {
    return NUMERIC_FIELDS.has(field) ? 'numeric' : 'text';
};

const parseSearchQuery = (query: string): string[] => {
    const terms: string[] = [];
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

export const useTabletFilters = (tablets: Tablet[], filters: Filter[], search: string) => {
    const searchTerms = useMemo(() => parseSearchQuery(search), [search]);

    const filteredTablets = useMemo(() => {
        return tablets.filter(tablet => {
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
    }, [tablets, filters, searchTerms]);

    return { filteredTablets, getFieldType };
};
