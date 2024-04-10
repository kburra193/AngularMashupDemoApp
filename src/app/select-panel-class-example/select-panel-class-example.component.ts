import { QlikService } from '../../services/qlik.service';
import { Component, Input, ViewEncapsulation, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor, NgIf } from '@angular/common';

interface FilterData {
  qText: any;
  qElemNumber: any;
}

@Component({
  selector: 'select-panel-class-example',
  templateUrl: './select-panel-class-example.component.html',
  styleUrl: './select-panel-class-example.component.css',
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
  ],
})
export class SelectPanelClassExampleComponent {
  selectedStates: any = [];
  selectedValue: string | undefined;
  data: any[] = [];
  hyperCubeDef: any[] = [];
  hyperCubeData: any[] = [];
  filterData: any;
  listData2: FilterData[] = [
    { qElemNumber: '1', qText: 'Agent' },
    { qElemNumber: '2', qText: 'Digital' },
    { qElemNumber: '3', qText: 'Inside Sales' },
  ];

  result: any[] = [];
  listData: any;
  hyperCubeDataNew: any;
  totalSales: any;
  selectedTeam = '';
  onSelected(value: string): void {
    this.selectedTeam = value;
  }

  constructor(private qlikService: QlikService) {}

  async ngOnInit() {
    console.log('is there a qlik service?', {
      qlikService: this.qlikService,
    });
    await this.qlikService.setCurrentApp(
      'ffd78510-ff1c-4cfc-a433-9f11b961259f'
    );
    try {
      this.data = await this.qlikService.getDataForObject('ALPTam');
    } catch (error) {
      console.error(error);
    }
    console.log('is there data?', {
      data: this.data,
    });

    var filterData = this.data.map((a) => a[0].qText);
    console.log('FilterData', filterData);

    const listData = await this.qlikService.getGenericListData('Region');
    console.log('listData', listData);
    const result = listData.map(function (row: any[]) {
      return {
        qText: row[0].qText,
        qElemNumber: row[0].qElemNumber,
      };
    });
    console.log('result', result);

    /*const hyperCubeDef =
      await this.qlikService.createHyperCubeForFieldsOrExpressions(
        ['Region'],
        ['Sum([Time Entry Duration (hr)])', 'Count([User ID])']
      );*/

    const fields = ['Client Name', 'Project Name', 'Project Code', 'Hourly Billing Mode', 'Budget Hours'];
    const expressions = ['=SOW Budget(USD) (based on Paymo)', 'Sum([Billable Hours])', 'Sum([Total Hours])', '=Remaining Hours (based on Paymo hours)', '=% Remaining Hours (based on Paymo hours)', '=SOW Used (USD) (based on Paymo hours)', '=SOW Used USD (based on Xero)'];
    const numColumns = fields.length + expressions.length;
    const hyperCubeDef =
      await this.qlikService.createHyperCubeForFieldsOrExpressions(
        fields,
        expressions
      );
    this.hyperCubeDataNew = await this.qlikService.getHyperCubeData(
      hyperCubeDef, numColumns
    );
    console.log('is there hypercubeDataNew?', {
      hyperCubeDataNew: this.hyperCubeDataNew,
    });

    this.totalSales = await this.qlikService.evaluateExpression(
      'Sum([Time Entry Duration (hr)])'
    );

    //const selectFieldValue = await this.qlikService.selectFieldValue('Channel','Agent');
    //console.log("selectedFieldValue",selectFieldValue);
  }

  async selectFieldValue(field: any, value: any){
    await this.qlikService.selectFieldValue(field,value);
  }
}
