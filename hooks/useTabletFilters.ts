import { useMemo } from 'react';
import { Tablet, Filter, TextCondition, NumericCondition, FilterFieldType } from '../types';
import { TABLET_FIELDS } from '../tabletFields';

const getFieldType = (field: keyof Tablet): FilterFieldType => {
    const meta = TABLET_FIELDS.find(f => f.fieldName === field);
    if (!meta) return 'text';

    // Treat explicit number types as numeric
    if (meta.ValueKind === 'NumberInt' || meta.ValueKind === 'NumberFloat') {
        return 'numeric';
    }

    return 'text';
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

const parseNumeric = (val: any): number | null => {
    if (typeof val === 'number') return val;
    if (!val || typeof val !== 'string') return null;
    // Matches integer or float, handles negative, removes commas
    // Extract the first valid number group
    const match = val.match(/-?[\d,]+(\.\d+)?/);
    if (match) {
        const clean = match[0].replace(/,/g, '');
        const num = parseFloat(clean);
        return isNaN(num) ? null : num;
    }
    return null;
};

export const useTabletFilters = (tablets: Tablet[], filters: Filter[], search: string) => {
    const searchTerms = useMemo(() => parseSearchQuery(search), [search]);

    const filteredTablets = useMemo(() => {
        return tablets.filter(tablet => {
            const modelName = (tablet.ModelName || '').toLowerCase();
            const modelId = (tablet.ModelId || '').toLowerCase();
            const brand = (tablet.ModelBrand || '').toLowerCase();

            const matchesSearch = searchTerms.length === 0 || searchTerms.every(term =>
                modelName.includes(term) || modelId.includes(term) || brand.includes(term)
            );

            if (!matchesSearch) return false;

            const matchesFilters = filters.every(filter => {
                const rawValue = (tablet as any)[filter.field];
                // Allow filtering on missing values if checking for 'equals' empty, but generally if missing, we exclude
                // unless the user specifically wants to match empty? Current logic excludes empty fields.
                if (rawValue === undefined || rawValue === null || rawValue === '') return false;

                const fieldType = getFieldType(filter.field);
                const valueStr = String(rawValue).toLowerCase();
                const filterValueStr = filter.value.toLowerCase();

                if (fieldType === 'text') {
                    const condition = filter.condition as TextCondition;
                    switch (condition) {
                        case 'equals':
                            return valueStr === filterValueStr;
                        case 'contains':
                            return valueStr.includes(filterValueStr);
                        case 'beginswith':
                            return valueStr.startsWith(filterValueStr);
                        case 'endswith':
                            return valueStr.endsWith(filterValueStr);
                        default:
                            return true;
                    }
                } else {
                    const numValue = parseNumeric(rawValue);
                    const numFilter = parseNumeric(filter.value);

                    if (numValue === null || numFilter === null) return false;

                    const condition = filter.condition as NumericCondition;
                    switch (condition) {
                        case 'equals':
                            return Math.abs(numValue - numFilter) < 0.0001;
                        case 'lt':
                            return numValue < numFilter;
                        case 'lte':
                            return numValue <= numFilter;
                        case 'gt':
                            return numValue > numFilter;
                        case 'gte':
                            return numValue >= numFilter;
                        case 'range':
                            const numFilter2 = filter.value2 ? parseNumeric(filter.value2) : numFilter;
                            if (numFilter2 === null) return numValue === numFilter;
                            return numValue >= Math.min(numFilter, numFilter2) && numValue <= Math.max(numFilter, numFilter2);
                        default:
                            return true;
                    }
                }
            });

            return matchesFilters;
        });
    }, [tablets, filters, searchTerms]);

    return { filteredTablets, getFieldType };
};
