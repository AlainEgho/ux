import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ShortenerService } from './shortener.service';

describe('ShortenerService', () => {
  let service: ShortenerService;
  let httpMock: HttpTestingController;
  const API_URL = 'http://localhost:3000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ShortenerService],
    });
    service = TestBed.inject(ShortenerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('shorten should POST to /shorten with url in body', () => {
    const url = 'https://example.com/long';
    const response = {
      shortCode: 'abc123',
      shortUrl: '/abc123',
      originalUrl: url,
    };

    service.shorten(url).subscribe((res) => {
      expect(res.shortCode).toBe('abc123');
      expect(res.shortUrl).toBe('/abc123');
      expect(res.originalUrl).toBe(url);
    });

    const req = httpMock.expectOne(`${API_URL}/shorten`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ url });
    req.flush(response);
  });

  it('fullShortUrl should return base URL + path', () => {
    expect(service.fullShortUrl('/xyz')).toBe(`${API_URL}/xyz`);
    expect(service.fullShortUrl('/abc123')).toBe(`${API_URL}/abc123`);
  });
});
