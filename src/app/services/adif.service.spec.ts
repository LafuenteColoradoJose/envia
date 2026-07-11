import { TestBed } from '@angular/core/testing';

import { Adif } from './adif';

describe('Adif', () => {
  let service: Adif;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Adif);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
