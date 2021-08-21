import { TestBed } from '@angular/core/testing';

import { PerformancesService } from './performances.service';

describe('PerformancesService', () => {
  let service: PerformancesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PerformancesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
