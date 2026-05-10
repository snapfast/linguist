import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EtymologyService } from './etymology.service';

describe('EtymologyService', () => {
  let service: EtymologyService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        EtymologyService
      ]
    });
    service = TestBed.inject(EtymologyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch etymology and cache it (to be implemented)', () => {
    const word = 'test';
    const mockResponse = {
      query: {
        pages: {
          '123': {
            extract: '== English ==\n=== Etymology ===\nTest etymology.'
          }
        }
      }
    };

    // First call
    service.getEtymology(word).subscribe(res => {
      expect(res).toBe('Test etymology.');
    });

    const req1 = httpMock.expectOne(req => req.url === 'https://en.wiktionary.org/w/api.php' && req.params.get('titles') === word);
    expect(req1.request.method).toBe('GET');
    req1.flush(mockResponse);

    // Second call - should use cache
    service.getEtymology(word).subscribe(res => {
      expect(res).toBe('Test etymology.');
    });

    // If caching is NOT implemented, this will fail because httpMock.verify() will see an outstanding request
    // Or we can try to expectOne again and it should fail if we don't want a second request.
    httpMock.expectNone(req => req.url === 'https://en.wiktionary.org/w/api.php' && req.params.get('titles') === word);
  });
});
