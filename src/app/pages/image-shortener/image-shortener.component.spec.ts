import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ImageShortenerComponent } from './image-shortener.component';
import { ImageUploadsService } from '../../services/image-uploads.service';

const API_URL = 'http://localhost:8081/api/image-uploads';

describe('ImageShortenerComponent', () => {
  let component: ImageShortenerComponent;
  let fixture: ComponentFixture<ImageShortenerComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ImageShortenerComponent,
        HttpClientTestingModule,
      ],
      providers: [ImageUploadsService],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageShortenerComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have initial state', () => {
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
    expect(component.result()).toBeNull();
    expect(component.copied()).toBe(false);
  });

  it('onFileSelected with no file should do nothing', () => {
    const input = { files: [], value: '' } as unknown as HTMLInputElement;
    component.onFileSelected({ target: input } as Event);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('onFileSelected with non-image file should set error', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    const input = { files: [file], value: '' } as unknown as HTMLInputElement;
    component.onFileSelected({ target: input } as Event);
    expect(component.error()).toBe('Please select an image file (e.g. PNG, JPEG).');
    expect(component.loading()).toBe(false);
  });

  it('onFileSelected with image file should POST and set result on success', fakeAsync(() => {
    const dataUrl = 'data:image/png;base64,abc123';
    spyOn(FileReader.prototype, 'readAsDataURL').and.callFake(function (this: FileReader) {
      const r = this;
      setTimeout(() => {
        if (r.onload) r.onload({ target: { result: dataUrl } } as ProgressEvent<FileReader>);
      }, 0);
    });

    const file = new File(['x'], 'test.png', { type: 'image/png' });
    const input = { files: [file], value: '' } as unknown as HTMLInputElement;
    component.onFileSelected({ target: input } as Event);
    tick(0);

    expect(component.loading()).toBe(true);
    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      base64: dataUrl,
      contentType: 'image/png',
      originalFileName: 'test.png',
    });

    const responseData = {
      id: 1,
      shortCode: 'a1b2c3d4',
      imageUrl: 'http://localhost:8081/i/a1b2c3d4',
      contentType: 'image/png',
      originalFileName: 'test.png',
      userId: 1,
      createdAt: '2025-02-01T12:00:00Z',
    };
    req.flush({ success: true, message: 'OK', data: responseData });
    tick();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
    expect(component.result()).toEqual(responseData);
  }));

  it('onFileSelected should set error when API returns success: false', fakeAsync(() => {
    spyOn(FileReader.prototype, 'readAsDataURL').and.callFake(function (this: FileReader) {
      const r = this;
      setTimeout(() => {
        if (r.onload) r.onload({ target: { result: 'data:image/png;base64,x' } } as ProgressEvent<FileReader>);
      }, 0);
    });

    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const input = { files: [file], value: '' } as unknown as HTMLInputElement;
    component.onFileSelected({ target: input } as Event);
    tick(0);

    const req = httpMock.expectOne(API_URL);
    req.flush({ success: false, message: 'File too large', data: null });
    tick();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('File too large');
    expect(component.result()).toBeNull();
  }));

  it('onFileSelected should set error on HTTP error', fakeAsync(() => {
    spyOn(FileReader.prototype, 'readAsDataURL').and.callFake(function (this: FileReader) {
      const r = this;
      setTimeout(() => {
        if (r.onload) r.onload({ target: { result: 'data:image/png;base64,x' } } as ProgressEvent<FileReader>);
      }, 0);
    });

    const file = new File(['x'], 'a.png', { type: 'image/png' });
    const input = { files: [file], value: '' } as unknown as HTMLInputElement;
    component.onFileSelected({ target: input } as Event);
    tick(0);

    const req = httpMock.expectOne(API_URL);
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    tick();

    expect(component.loading()).toBe(false);
    expect(component.error()).toBeTruthy();
    expect(component.result()).toBeNull();
  }));

  it('qrCodeImageUrl should return QR server URL with encoded data', () => {
    const url = 'http://localhost:8081/i/abc123';
    const qr = component.qrCodeImageUrl(url);
    expect(qr).toContain('https://api.qrserver.com/v1/create-qr-code/');
    expect(qr).toContain('size=120x120');
    expect(qr).toContain(encodeURIComponent(url));
  });

  it('copyImageUrl should copy imageUrl to clipboard and set copied then clear', fakeAsync(() => {
    const res = {
      id: 1,
      shortCode: 'x',
      imageUrl: 'http://localhost:8081/i/x',
      contentType: 'image/png',
      originalFileName: 'f.png',
      userId: 1,
      createdAt: '2025-01-01T00:00:00Z',
    };
    const writeText = jasmine.createSpy('writeText').and.returnValue(Promise.resolve());
    spyOnProperty(navigator, 'clipboard', 'get').and.returnValue({ writeText } as Clipboard);

    component.copyImageUrl(res);
    tick(0); // run promise microtask
    expect(component.copied()).toBe(true);
    expect(writeText).toHaveBeenCalledWith('http://localhost:8081/i/x');

    tick(2500); // run setTimeout that clears copied
    expect(component.copied()).toBe(false);
  }));
});
