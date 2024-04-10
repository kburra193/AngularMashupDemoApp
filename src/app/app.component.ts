import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HelloWorldComponent } from './hello-world/hello-world.component';
import { QlikVisualizationComponent } from './qlik-visualization/qlik-visualization.component';
import { SelectPanelClassExampleComponent } from './select-panel-class-example/select-panel-class-example.component';
import { NgFor } from '@angular/common';
import { HighchartsVisualizationComponent } from './highcharts-visualization/highcharts-visualization.component';
import { FiltersComponent } from './filters/filters.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HelloWorldComponent, QlikVisualizationComponent, SelectPanelClassExampleComponent, HighchartsVisualizationComponent, FiltersComponent, NgFor],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DemoApp';
}
