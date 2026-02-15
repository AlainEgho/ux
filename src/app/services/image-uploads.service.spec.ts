import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ImageUploadsService } from './image-uploads.service';

const API_BASE = 'http://localhost:8081';
const API_URL = `${API_BASE}/api/image-uploads`;

describe('ImageUploadsService', () => {
  let service: ImageUploadsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ImageUploadsService],
    });
    service = TestBed.inject(ImageUploadsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('upload should POST to /api/image-uploads with base64 and optional fields', () => {
    const body = {
      base64: 'data:image/png;base64,abc123',
      contentType: 'image/png',
      originalFileName: 'logo.png',
    };
    const response = {
      success: true,
      message: 'Image uploaded.',
      data: {
        id: 1,
        shortCode: 'a1b2c3d4',
        imageUrl: `${API_BASE}/i/a1b2c3d4`,
        contentType: 'image/png',
        originalFileName: 'logo.png',
        userId: 1,
        createdAt: '2025-02-01T12:00:00Z',
      },
    };

    service.upload(body).subscribe((res) => {
      expect(res.success).toBe(true);
      expect(res.data?.shortCode).toBe('a1b2c3d4');
      expect(res.data?.imageUrl).toBe(`${API_BASE}/i/a1b2c3d4`);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush(response);
  });

  it('upload should accept minimal body (base64 only)', () => {
    const body = { base64: 'rawbase64string' };
    const response = { success: true, message: 'OK', data: null };

    service.upload(body).subscribe((res) => {
      expect(res.success).toBe(true);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.body).toEqual(body);
    req.flush(response);
  });

  it('getList should GET /api/image-uploads and return array', () => {
    const response = [
      {
        id: 1,
        shortCode: 'code1',
        imageUrl: `${API_BASE}/i/code1`,
        contentType: 'image/png',
        originalFileName: 'a.png',
        userId: 1,
        createdAt: '2025-02-01T12:00:00Z',
      },
    ];

    service.getList().subscribe((list) => {
      expect(list.length).toBe(1);
      expect(list[0].shortCode).toBe('code1');
      expect(list[0].imageUrl).toBe(`${API_BASE}/i/code1`);
    });

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush(response);
  });

  it('getList should unwrap { data: [...] } and normalize to camelCase', () => {
    const response = {
      data: [
        {
          id: 2,
          short_code: 'snake1',
          image_url: `${API_BASE}/i/snake1`,
          content_type: 'image/jpeg',
          original_file_name: 'photo.jpg',
          user_id: 1,
          created_at: '2025-02-02T10:00:00Z',
        },
      ],
    };

    service.getList().subscribe((list) => {
      expect(list.length).toBe(1);
      expect(list[0].shortCode).toBe('snake1');
      expect(list[0].imageUrl).toBe(`${API_BASE}/i/snake1`);
      expect(list[0].contentType).toBe('image/jpeg');
      expect(list[0].originalFileName).toBe('photo.jpg');
      expect(list[0].userId).toBe(1);
      expect(list[0].createdAt).toBe('2025-02-02T10:00:00Z');
    });

    const req = httpMock.expectOne(API_URL);
    req.flush(response);
  });

  it('getList should return empty array when response is empty array', () => {
    service.getList().subscribe((list) => {
      expect(list).toEqual([]);
    });
    const req = httpMock.expectOne(API_URL);
    req.flush([]);
  });

  it('imageViewUrl should return base URL + /i/{shortCode}', () => {
    expect(service.imageViewUrl('a1b2c3d4')).toBe(`${API_BASE}/i/a1b2c3d4`);
    expect(service.imageViewUrl('xyz')).toBe(`${API_BASE}/i/xyz`);
  });
});
