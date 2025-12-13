import { useMemo } from 'react';
import { Tablet, SortCriterion } from '../types';

export const useTabletSort = (tablets: Tablet[], sortCriteria: SortCriterion[]) => {
    const sortedTablets = useMemo(() => {
        return [...tablets].sort((a, b) => {
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
                    case 'DigitizerAspectRatio':
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
                        valA = (a[field as keyof Tablet] || '').toString().toLowerCase();
                        valB = (b[field as keyof Tablet] || '').toString().toLowerCase();
                }

                if (valA < valB) return criterion.order === 'asc' ? -1 : 1;
                if (valA > valB) return criterion.order === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [tablets, sortCriteria]);

    return sortedTablets;
};
