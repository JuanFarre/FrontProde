import { TestBed } from '@angular/core/testing';

import { PronosticoService } from './pronostico.service';

describe('PronosticoService', () => {
  let service: PronosticoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PronosticoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
