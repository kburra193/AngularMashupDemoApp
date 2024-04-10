import { Injectable } from "@angular/core";
import { Options } from "highcharts";

export interface HighchartsAxisOptions {
    format?: string;
    label?: string;
}

const DEFAULT_LEGEND_COLOUR = "#FFFFFF";

// The Injectable decorator marks it as a service that can be injected into other parts of the Angular application
@Injectable({
    providedIn: 'root', // This service is provided at the root level, meaning it's a singleton and can be injected anywhere in the app
})
export class HighchartsService {

    getBarchart(series: any[], categories: string[], columnMode: boolean, stacked: boolean, showLegend: boolean = true, showValueLabels: boolean = false, reversedStacks: boolean = false, yAxisOptions?:  HighchartsAxisOptions[], xAxisOptions?:  HighchartsAxisOptions[]) {
        const yAxisLabelFormat = yAxisOptions ? yAxisOptions[0].format : undefined;
        const xAxisLabel = xAxisOptions && xAxisOptions[0].label !== '' ? xAxisOptions[0].label : undefined;
        const yAxisLabel = yAxisOptions && yAxisOptions[0].label !== '' ? yAxisOptions[0].label : undefined;
    
        return {
          chart: {
            type: columnMode ? "column" : "bar",
            spacingTop: 0,
            renderTo: "chartContainer",
            marginRight: !columnMode ? 30 : undefined
          },
          title: {
            text: ""
          },
          credits: {
            enabled: false
          },
          xAxis: {
            categories,
            title: {
              text: xAxisLabel
            },
            gridLineWidth: 0
          },
          yAxis: {
            allowDecimals: false,
            title: {
              text: yAxisLabel
            },
            labels: {
              format: yAxisLabelFormat
            },
            gridLineWidth: 1,
            reversedStacks: reversedStacks
          },
          legend: {
            enabled: showLegend,
            align: 'left',
            verticalAlign: 'top',
            backgroundColor: DEFAULT_LEGEND_COLOUR,
            itemStyle: {
              cursor: 'default',
            },
            maxHeight: 85
          },
          plotOptions: {
            series: {
              label: {
                enabled: false
              },
              stacking: stacked ? 'normal' : undefined,
              dataLabels: {
                enabled: showValueLabels,
                format: `{point.index}`
              },
              events: {
                legendItemClick: () => false
              },
              tooltip: {
                pointFormatter: function () {
                  return `${this.series.name}: <b>${this.index}</b>`;
                }
              }
            },
            column: {
              borderWidth: 0,
            },
            bar: {
              borderWidth: 0,
            }
          },
          series,
          exporting: {
            enabled: false // hide menu button
          }
        } as Options;
      }
}