import { TestBed } from '@angular/core/testing';

import { QlikFieldServiceTsService } from './qlik-field-service.ts.service';

describe('QlikFieldServiceTsService', () => {
  let service: QlikFieldServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QlikFieldServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
