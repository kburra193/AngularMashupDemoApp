import { Component, OnInit } from '@angular/core';
import { QlikService } from '../../services/qlik.service';
@Component({
  selector: 'app-qlik-visualization',
  standalone: true,
  imports: [],
  templateUrl: './qlik-visualization.component.html',
  styleUrl: './qlik-visualization.component.css'
})
export class QlikVisualizationComponent {
  constructor(private qlikService: QlikService) {}
/*
  async ngOnInit() {
    try {
      const nebula = await this.qlikService.getNebulaInstance();

      // Example: Render a table visualization
      const vis = await nebula.render({
        element: document.querySelector('.visualization'),
        type: 'table',
        // fields, properties, etc.
      });
    } catch (error) {
      console.error("Failed to render visualization", error);
    }
  } */
}
