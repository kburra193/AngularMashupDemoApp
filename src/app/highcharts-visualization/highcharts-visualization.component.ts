import { NgFor, NgIf } from "@angular/common";
import { Component, Input, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { QlikService } from "../../services/qlik.service";
import * as Highcharts from 'highcharts';
import { Options } from "highcharts";
import more from 'highcharts/highcharts-more';
import exporting from 'highcharts/modules/exporting';
import seriesLabel from 'highcharts/modules/series-label';
import { HighchartsChartModule } from "highcharts-angular";
import { HighchartsService } from "../../services/highcharts.service";
import { VisualisationHighchartsData } from "../../data/types/highcharts-options";
/*
exporting(Highcharts);
more(Highcharts);
seriesLabel(Highcharts);
Highcharts.setOptions({
  chart: {
    style: {
      'fontFamily': 'Source Sans Pro',
      'fontWeight': 'light'
    }
  }
}) */

@Component({
    selector: 'app-highcharts-visualization',
    templateUrl: './highcharts-visualization.component.html',
    styleUrl: './highcharts-visualization.component.css',
    // Encapsulation has to be disabled in order for the
    // component style to apply to the select panel.
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgFor,
        NgIf,
        MatFormFieldModule,
        MatSelectModule,
        FormsModule,
        ReactiveFormsModule,
        HighchartsChartModule
    ],
})
export class HighchartsVisualizationComponent {
  @ViewChild('chart') componentRef;
  @Input() chartOptions: Options;
  hyperCubeDataRows: any;
  chart: any;
  updateFlag = false;
  Highcharts: typeof Highcharts = Highcharts;
  data: VisualisationHighchartsData;
  selectedOption: any;
  regionData: any[] = [];
  yearData: any[] = [];
  region = new FormControl();
  year = new FormControl();

  constructor(private qlikService: QlikService, private highchartsService: HighchartsService) {

  }

  async ngOnInit() {
    await this.qlikService.setCurrentApp(
      'ffd78510-ff1c-4cfc-a433-9f11b961259f'
    );

    try {
      this.regionData = await this.qlikService.getGenericListData('Region');
    } catch (error) {
      console.error(error);
    }

    try {
      this.yearData = await this.qlikService.getGenericListData('Year');
    } catch (error) {
      console.error(error);
    }

    console.log('is there region data?', {data: this.regionData});
    console.log('is there year data?', {data: this.yearData});

    await this.getTableData();
  }

  onSelectChange(event){
    const selectedValue = this.selectedOption;
    console.log(selectedValue)
  }

  saveInstance(chartInstance): void {
    if (!chartInstance.options.chart.forExport) this.chart = chartInstance;
  }

  async apply() {
    //Apply filters
    await this.applySelectedValues('Region', this.region.value, false);
    await this.applySelectedValues('Year', this.year.value, true);
    // refresh data
    await this.getTableData();
  }

  private async applySelectedValues(fieldName: string, fieldValue: any, isNumeric: boolean) {
    if(fieldValue){
        //collect all the selected values in the field
        let selectedValues = !isNumeric ? [].concat(fieldValue) && fieldValue.map(selectedOption => ({qText: selectedOption[0].qText})) :
                                          [].concat(fieldValue) && fieldValue.map(selectedOption => ({qText: selectedOption[0].qText, qIsNumeric: true, qNumber: selectedOption[0].qNum}));
        //apply selected values by field
        await this.qlikService.selectMultipleValuesPerField(fieldName, selectedValues);
    }
  }

  async clear(){
    await this.qlikService.clearAllFieldValues();
    await this.getTableData();
  }

  async getTableData(){
    const fields = ['Year','Region'];
    const expressions = ['Count([User ID])', 'Sum([Time Entry Duration (hr)])'];
    const numColumns = fields.length + expressions.length;
    const hyperCubeDef =
      await this.qlikService.createHyperCubeForFieldsOrExpressions(
        fields,
        expressions
      );
    this.hyperCubeDataRows = await this.qlikService.getHyperCubeData(
      hyperCubeDef, numColumns
    );
    console.log('is there hypercubeDataNew?', {
      hyperCubeDataRows: this.hyperCubeDataRows,
    });
  }

/*   processChart(){
    this.chartOptions = this.highchartsService.getBarchart(
      data.series,
      data.categories,
      options.highcharts.orientation !== 'horizontal',
      options.highcharts.stacked,
      options.highcharts.legend,
      options.highcharts.isShowValueLabels,
      options.highcharts.reversedStacks,
      options.highcharts.yAxisOptions,
      options.highcharts.xAxisOptions
    );
  }

  private mapQTableToChart(table, measureColumns: IqColumn[], isStackedDataPages: boolean = false) {
    const dataTable = isStackedDataPages ? this.mapStackedQTableToDataTable(table) : this.mapQTableToDataTable(table, measureColumns);
    let chartData = isStackedDataPages ? this.parseStackedDataToChart(table, measureColumns) : this.parseDataToChart(table, measureColumns);
    chartData.dataTable = dataTable;
    return chartData;
  } */
}
