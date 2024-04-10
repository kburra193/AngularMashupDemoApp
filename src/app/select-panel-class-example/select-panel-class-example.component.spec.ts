import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectPanelClassExampleComponent } from './select-panel-class-example.component';

describe('SelectPanelClassExampleComponent', () => {
  let component: SelectPanelClassExampleComponent;
  let fixture: ComponentFixture<SelectPanelClassExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectPanelClassExampleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectPanelClassExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
