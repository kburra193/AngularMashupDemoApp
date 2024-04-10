export type SortCriteriaValue = undefined | -1 | 0 | 1;

export const DEFAULT_SORT_ASCII: SortCriteria = {
    qSortByAscii: 1
}

export const DEFAULT_SORT_NUMERIC: SortCriteria  = {
    qSortByNumeric: -1
}

export const ASCENDING_SORT_NUMERIC: SortCriteria  = {
    qSortByNumeric: 1
}

export const DEFAULT_SORT_DATE: SortCriteria  = {
    qSortByLoadOrder: 1
}

// https://help.qlik.com/en-US/sense-developer/June2020/apis/EngineAPI/definitions-SortCriteria.html
export interface SortCriteria
{
    qSortByAscii?: SortCriteriaValue, // Sorts the field by alphabetical order.
    qSortByLoadOrder?: SortCriteriaValue, // Sorts the field values by the initial load order.
    qSortByNumeric?: SortCriteriaValue, // Sorts the field values by numeric value.
    qSortByState?: SortCriteriaValue, // Sorts the field values according to their logical state (selected, optional, alternative or excluded).
    qSortByExpression?: SortCriteriaValue, // Sorts the field by expression.
    qExpression?: ValueExpr // Sort by expression.
}

export interface ValueExpr {
    qv: string; // Expression evaluated to dual
}