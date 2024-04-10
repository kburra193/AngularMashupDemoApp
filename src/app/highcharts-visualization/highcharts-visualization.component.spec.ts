import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HighchartsVisualizationComponent } from './highcharts-visualization.component';

describe('HighchartsVisualizationComponent', () => {
  let component: HighchartsVisualizationComponent;
  let fixture: ComponentFixture<HighchartsVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HighchartsVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HighchartsVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
