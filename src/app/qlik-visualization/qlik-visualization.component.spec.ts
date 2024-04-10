import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QlikVisualizationComponent } from './qlik-visualization.component';

describe('QlikVisualizationComponent', () => {
  let component: QlikVisualizationComponent;
  let fixture: ComponentFixture<QlikVisualizationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QlikVisualizationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(QlikVisualizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
