import { SeriesOptionsType } from "highcharts";

export interface VisualisationHighchartsData {
    dataTable: DataTable;
    series: SeriesOptionsType[];
    categories?: string[];
    ranges?: SeriesOptionsType[];
    xAxisCategories?: string[] | string[][];
    yAxisCategories?: string[] | string[][];
}

export interface HighchartsVisOptions {
    orientation?: "horizontal" | "vertical"; 
	stacked?: boolean;
    isShowValueLabels?: boolean;
    legend?: boolean; // Defaults to true if not specified
    reversedStacks?: boolean;
    yAxisOptions?: HighchartsAxisOptions[];
    xAxisOptions?:HighchartsAxisOptions[];
}

export interface HighchartsAxisOptions {
    format?: string;
    label?: string;
}

export interface DataTable {
    columns: DataTableColumn[];
    rows: any[];
    getCellValue?(cell: any): any;
    getCellRep?(cell: any): CellRepresentation;
}

export interface DataTableColumn {
    label: string;
    rowKey: any;
    disableSort?: boolean;
}

export interface CellRepresentation {
    fgColour?: string; // foreground colour class of row item
}