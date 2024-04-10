import { NgFor, NgIf } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AlternateState, QlikService } from '../../services/qlik.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatSliderModule } from '@angular/material/slider';
import {
  MatNativeDateModule,
  provideNativeDateAdapter,
} from '@angular/material/core';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import moment, { Moment } from 'moment';
import { QSDate } from '../../data/types/qs-date';
import {
  DEFAULT_SORT_ASCII,
  SortCriteria,
} from '../../data/types/sort-criteria-options';

export const OBJECTS_CONFIG = {
  T01: {
    fields: ['Year', 'Region'],
    expressions: ['Count([User ID])', 'Sum([Time Entry Duration (hr)])'],
  },
  T02: {
    fields: ['Year', 'Region'],
    expressions: ['Count([User ID])', 'Sum([Time Entry Duration (hr)])'],
    alternateState: 'bdp',
    sortCriteria: { Region: DEFAULT_SORT_ASCII },
  },
};

export interface ObjectConfig {
  fields: string[];
  expressions: string[];
  alternateState?: string;
  sortCriteria?: {
    [fieldName: string]: SortCriteria;
  };
}

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.css',
  // Encapsulation has to be disabled in order for the
  // component style to apply to the select panel.
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    NgFor,
    NgIf,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatSliderModule
  ],
})
export class FiltersComponent {
  regionData: any[] = [];
  yearData: any[] = [];
  quarterData: any[] = [];
  monthData: any[] = [];
  datesData: any[] = [];
  region = new FormControl();
  year = new FormControl();
  bookmarksList: any[] = [];
  bookmarkName: string;
  selectedBookmark: string | undefined;
  selectedQuarter: any;
  selectedMonth: any;
  selectedYear: number | undefined;
  selectedRegion: string | undefined;
  startDate1: Moment;
  endDate1: Date;
  startDate2: Date;
  endDate2: Date;
  startDate3: Date;
  endDate3: Date;
  singleDate: Date;
  thumbLabel = true;
  showTicks = true;
  regionDefaultFilter: any[] | undefined = [];
  regionBdpFilter: any[] | undefined = [];
  alternateState = AlternateState;

  t01: ObjectConfig = OBJECTS_CONFIG.T01;
  t02: ObjectConfig = OBJECTS_CONFIG.T02;
  t01Rows: any[] = [];
  t02Rows: any[] = [];

  qlikVarSliderStart: Number;
  qlikVarSliderEnd: Number;

  constructor(private qlikService: QlikService) {}

  async ngOnInit() {
    //Set App
    await this.qlikService.setCurrentApp(
      '7561607d-e381-46b8-ae92-9a3194597aaf'
    );

    //Clear all values
    await this.qlikService.clearAllFieldValues();

    //Get filters data to display in the dropdown
    try {
      [
        this.regionData,
        this.yearData,
        this.quarterData,
        this.monthData,
        this.datesData,
      ] = await Promise.all([
        this.qlikService.getGenericListData('Region'),
        this.qlikService.getGenericListData('Year'),
        this.qlikService.getGenericListData('Quarter'),
        this.qlikService.getGenericListData('Month'),
        this.qlikService.getGenericListData('Bookings Date'),
      ]);
    } catch (error) {
      console.error(error);
    }

    this.bookmarksList = await this.qlikService.getBookmarksList();

    console.log('is there region data?', { data: this.regionData });
    console.log('is there year data?', { data: this.yearData });
    console.log('is there quarter data?', { data: this.quarterData });
    console.log('is there month data?', { data: this.monthData });
    console.log('is there dates data?', { data: this.datesData });

    //variable content
    this.qlikVarSliderStart = await this.qlikService.getVariableContent(
      'vSliderStart'
    );
    this.qlikVarSliderEnd = await this.qlikService.getVariableContent(
      'vSliderEnd'
    );

    //Get table data
    await this.refreshData();
  }

  async onSliderChange(start, end) {
    // add method to service for setting variable content and call it once for each value
    this.qlikService.setVariableContent('vSliderStart', start);
    this.qlikService.setVariableContent('vSliderEnd', end);
  }

  async apply() {
    //Apply filters
    await this.applySelectedValues('Region', this.region.value, false);
    await this.applySelectedValues('Year', this.year.value, true);
    //Refresh data
    await this.refreshData();
  }

  async clear() {
    //Clear all values
    await this.qlikService.clearAllFieldValues();
    //clear visual selections
    this.clearAllVisualSelections();
    //Refresh data
    await this.refreshData();
    //Refresh filters from example 2
    this.quarterData = await this.qlikService.getGenericListData('Quarter');
    this.monthData = await this.qlikService.getGenericListData('Month');
  }

  async clearByField(fieldName: string) {
    //Clear by field name
    await this.qlikService.clearSelectionsByField(fieldName);
    this.clearDropdownSelectionsByField(fieldName);
    //Refresh data
    await this.refreshData();
  }

  async selectValueByField(
    fieldName: string,
    fieldValue: any,
    isNumeric: boolean,
    alternateState: AlternateState = AlternateState.DEFAULT
  ) {
    fieldName === 'Year'
      ? (this.selectedYear = fieldValue)
      : (this.selectedRegion = fieldValue);
    //collect field values to select
    let selectedValues = !isNumeric
      ? [fieldValue].map((selectedOption) => ({ qText: selectedOption }))
      : [fieldValue].map((selectedOption) => ({
          qIsNumeric: true,
          qNumber: selectedOption,
        }));
    //apply selected values by field
    await this.qlikService.selectMultipleValuesPerField(
      fieldName,
      selectedValues,
      alternateState
    );
    //Refresh data
    await this.refreshData();
  }

  async saveBookmark() {
    await this.qlikService.createBookmark(this.bookmarkName);
    // Update bookmarksList after deletion
    this.bookmarksList = await this.qlikService.getBookmarksList();
  }

  async applyBookmark() {
    await this.qlikService.applyBookmark(this.selectedBookmark);
    //Refresh data
    await this.refreshData();
  }

  async deleteBookmark() {
    await this.qlikService.deleteBookmark(this.selectedBookmark);
    //Refresh data
    await this.refreshData();
    // Update bookmarksList after deletion
    this.bookmarksList = await this.qlikService.getBookmarksList();
  }

  async onSelectionChange(
    fieldName: string,
    selectedValues: any,
    isNumeric: boolean
  ) {
    //apply values
    await this.applySelectedValues(fieldName, selectedValues, isNumeric);
    //Refresh filters from example 2 after selecting values
    this.quarterData = await this.qlikService.getGenericListData('Quarter');
    this.monthData = await this.qlikService.getGenericListData('Month');
    // Set selectedQuarter based on condition
    this.selectedQuarter = this.quarterData.filter(
      (quarter) => quarter[0].qState === 'S'
    );
    // Set selectedMonth based on condition
    this.selectedMonth = this.monthData.filter(
      (month) => month[0].qState === 'S'
    );
    //Refresh data
    await this.refreshData();
  }

  async getTableData(tableConfig: any) {
    const fields = tableConfig.fields;
    const expressions = tableConfig.expressions;
    const numColumns = fields.length + expressions.length;
    const hyperCubeDef =
      await this.qlikService.createHyperCubeForFieldsOrExpressions(
        fields,
        expressions,
        tableConfig?.sortCriteria
      );
    return await this.qlikService.getHyperCubeData(
      hyperCubeDef,
      numColumns,
      tableConfig.alternateState
    );
  }

  async onDateChange(from, to){
    const start = moment(from).format("YYYY-MM-DD");
    const end = moment(to).format("YYYY-MM-DD");
    //create the expression - the result from this expression gets the values that are between the selected dates
    const dateExpression = `=Concat({<[Bookings Date]={">${start} <${end}"}>} distinct [Bookings Date],',')`
    //evaluate expression to get the selected dates
    const expressionResult = await this.qlikService.evaluateExpression(dateExpression);
    console.log('expressionResult', expressionResult);
    // collect the values to select
    const selectedValues = expressionResult.split(',').map(val => ({qText: val, qIsNumeric: true, qNumber: new QSDate(moment(val)).getIntegerValue() }));
    console.log('selectedValues', selectedValues);
    //apply values
    await this.qlikService.selectMultipleValuesPerField('Bookings Date', selectedValues);
    //refresh data
    await this.refreshData();
  }

  async onSelectSingleDate(date){
    const myDate = moment(date).format("YYYY-MM-DD");
    console.log('myDate', myDate);
    //create the expression - the result from this expression gets the values that are between the selected dates
    const dateExpression = `=Concat({<[Bookings Date]={"${myDate}"}>} distinct [Bookings Date],',')`
    console.log('dateExpression', dateExpression);
    //evaluate expression to get the selected dates
    const expressionResult = await this.qlikService.evaluateExpression(dateExpression);
    console.log('expressionResult', expressionResult);
    // collect the values to select
    const selectedValues = [{qText: expressionResult, qIsNumeric: true, qNumber: new QSDate(moment(expressionResult)).getIntegerValue() }];
    console.log('selectedValues', selectedValues);
    //apply values
    await this.qlikService.selectMultipleValuesPerField('Bookings Date', selectedValues);
    //refresh data
    await this.refreshData();
  }

  // Currently we have two tables in this example. One is the default table and the other is the one who uses the alternate state, bdp.
  // the alternate state allow us to create different scenarios for the tables/charts
  // You can create multiple states within a Qlik Sense app and apply these states to specific objects within the app. Objects in a given state are not affected by user selections in the other states.
  // you can create an alternate state directly on Qlik by clicking on Edit Sheet -> Master Items -> Alternate State -> Create New
  // after being created you will have to define the alternate state in use for each chart/table in your web app (if the alternate state is not defined it will assume the default state).
  // in the getHypercube method on the Qlik Service I'm assigning qStateName to the alternate state in use
  // https://help.qlik.com/en-US/sense/February2024/Subsystems/Hub/Content/Sense_Hub/Visualizations/alternate-states-comparative-analysis.htm
  async onRegionDefaultChange(
    fieldName: string,
    selectedValues: any,
    isNumeric: boolean,
    alternateState: AlternateState = AlternateState.DEFAULT
  ) {
    //apply values
    await this.applySelectedValues(
      fieldName,
      selectedValues,
      isNumeric,
      alternateState
    );
    await this.refreshData();
  }

  async onRegionBdpChange(
    fieldName: string,
    selectedValues: any,
    isNumeric: boolean,
    alternateState: AlternateState = AlternateState.DEFAULT
  ) {
    //apply values
    await this.applySelectedValues(
      fieldName,
      selectedValues,
      isNumeric,
      alternateState
    );
    await this.refreshData();
  }

  exportData(dataRows) {
    //collect columns and rows to export to excel
    const columns = ['Year', 'Region', 'Count Users', 'Duration Time'];
    const rows = dataRows.map((data, index) => data.map((rows) => rows.qText));
    this.exportExcel([columns, ...rows]);
  }

  private async applySelectedValues(
    fieldName: string,
    fieldValue: any,
    isNumeric: boolean,
    alternateState: AlternateState = AlternateState.DEFAULT
  ) {
    if (fieldValue) {
      //collect all the selected values in the field
      let selectedValues = !isNumeric
        ? [].concat(fieldValue) &&
          fieldValue.map((selectedOption) => ({
            qText: selectedOption[0].qText,
          }))
        : [].concat(fieldValue) &&
          fieldValue.map((selectedOption) => ({
            qText: selectedOption[0].qText,
            qIsNumeric: true,
            qNumber: selectedOption[0].qNum,
          }));
      //apply selected values by field
      await this.qlikService.selectMultipleValuesPerField(
        fieldName,
        selectedValues,
        alternateState
      );
    }
  }

  private clearDropdownSelectionsByField(fieldName: string) {
    switch (fieldName) {
      case 'Region':
        this.region.reset();
        break;
      case 'Year':
        this.year.reset();
        break;
    }
  }

  private clearAllVisualSelections() {
    this.region.reset();
    this.year.reset();
    this.selectedBookmark = undefined;
    this.selectedMonth = undefined;
    this.selectedQuarter = undefined;
    this.selectedYear = undefined;
    this.selectedRegion = undefined;
    this.regionBdpFilter = undefined;
    this.regionDefaultFilter = undefined;
  }

  private async refreshData() {
    this.t01Rows = await this.getTableData(this.t01);
    this.t02Rows = await this.getTableData(this.t02);

    console.log('is there t01Rows?', { t01Rows: this.t01Rows });
    console.log('is there t02Rows?', { t02Rows: this.t02Rows });
  }

  //methods to export to an excel
  private exportExcel(rows: any[][]) {
    let workbook = this.createNewBook();
    let worksheet = this.createSheet(rows);

    this.appendSheet(workbook, worksheet, 'Sheet 1');
    this.exportWorkbook(uuidv4(), workbook);
  }

  private createNewBook() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    return wb;
  }

  private createSheet(rows: any[][]): XLSX.WorkSheet {
    return XLSX.utils.aoa_to_sheet(rows); // array of arrays
  }

  private exportWorkbook(fileName: string, wb: XLSX.WorkBook) {
    // save to file
    XLSX.writeFile(wb, fileName + '.xlsx');
  }

  private appendSheet(
    wb: XLSX.WorkBook,
    ws: XLSX.WorkSheet,
    sheetName: string
  ) {
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }
}
