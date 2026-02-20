import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const API_BASE = environment.apiBaseUrl;
/** Base URL for image view links (redirect/view); may differ from API. */
const IMAGE_VIEW_BASE = environment.frontendBaseUrl;

export interface ImageUploadRequest {
  base64: string;
  contentType?: string;
  originalFileName?: string;
}

export interface ImageUploadResponse {
  id: number;
  shortCode: string;
  imageUrl: string;
  contentType: string;
  originalFileName: string | null;
  userId: number;
  createdAt: string;
}

export interface ImageUploadApiResponse {
  success: boolean;
  message: string;
  data: ImageUploadResponse | null;
}

/** Normalize one item (API may use camelCase or snake_case) */
function normalizeImageItem(raw: Record<string, unknown>): ImageUploadResponse {
  return {
    id: Number(raw['id'] ?? 0),
    shortCode: String(raw['shortCode'] ?? raw['short_code'] ?? ''),
    imageUrl: String(raw['imageUrl'] ?? raw['image_url'] ?? ''),
    contentType: String(raw['contentType'] ?? raw['content_type'] ?? ''),
    originalFileName: raw['originalFileName'] != null ? String(raw['originalFileName']) : raw['original_file_name'] != null ? String(raw['original_file_name']) : null,
    userId: Number(raw['userId'] ?? raw['user_id'] ?? 0),
    createdAt: String(raw['createdAt'] ?? raw['created_at'] ?? ''),
  };
}

/** API may return a raw array or { data: [...] }; items may be camelCase or snake_case */
function unwrapImageList(body: unknown): ImageUploadResponse[] {
  let arr: unknown[] = [];
  if (Array.isArray(body)) arr = body;
  else if (body && typeof body === 'object' && Array.isArray((body as { data?: unknown[] }).data)) {
    arr = (body as { data: unknown[] }).data;
  }
  return arr.map((item) => normalizeImageItem((item as Record<string, unknown>) || {}));
}

@Injectable({ providedIn: 'root' })
export class ImageUploadsService {
  private readonly url = `${API_BASE}/api/image-uploads`;

  constructor(private http: HttpClient) {}

  upload(body: ImageUploadRequest): Observable<ImageUploadApiResponse> {
    return this.http.post<ImageUploadApiResponse>(this.url, body);
  }

  getList(): Observable<ImageUploadResponse[]> {
    return this.http.get<unknown>(this.url).pipe(map(unwrapImageList));
  }

  /** URL to view image: /i/{shortCode} (uses IMAGE_VIEW_BASE for redirect) */
  imageViewUrl(shortCode: string): string {
    return `${IMAGE_VIEW_BASE}/i/${shortCode}`;
  }
}
