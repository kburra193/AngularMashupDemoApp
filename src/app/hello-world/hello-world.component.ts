import { Component, OnInit } from '@angular/core';
import { QlikService } from '../../services/qlik.service';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-hello-world',
  standalone: true,
  imports: [
    NgFor,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './hello-world.component.html',
  styleUrl: './hello-world.component.css',
})
export class HelloWorldComponent implements OnInit {
  data: any[] = [];
  hyperCubeDef: any[] = [];
  hyperCubeData: any[] = [];
  totalSales: number | string = 0;
  data_temp: any[] = [];
  constructor(private qlikService: QlikService) {}
  async ngOnInit() {
    console.log('is there a qlik service?', {
      qlikService: this.qlikService,
    });
    await this.qlikService.setCurrentApp(
      'ffd78510-ff1c-4cfc-a433-9f11b961259f'
    );
    try {
      this.data = await this.qlikService.getDataForObject('kWpJPP');
    } catch (error) {
      console.error(error);
    }
    console.log('is there data?', {
      data: this.data,
    });
    this.totalSales = await this.qlikService.evaluateExpression(
      'Sum([Time Entry Duration (hr)])'
    );
    const hyperCubeDef =
      await this.qlikService.createHyperCubeForFieldsOrExpressions(
        ['Year'],
        ['Sum([Time Entry Duration (hr)])', 'Count([User ID])']
      );
    this.hyperCubeData = await this.qlikService.getHyperCubeData(hyperCubeDef);
    console.log('is there hypercubeData?', {
      hyperCubeData: this.hyperCubeData,
    });

    this.data_temp = [
      { id: 1, name: 'Oscar', age: 36 },
      { id: 2, name: 'Nina', age: 36 },
      { id: 3, name: 'Alex', age: 39 },
    ];
    console.log('data_temp', this.data_temp);
  }

  async selectValue(fieldName: string, valueToSelect: string) {
    await this.qlikService.selectFieldValue(fieldName, valueToSelect);
  }
}
