import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const API_BASE = environment.apiBaseUrl;
/** Base URL for short links (redirect/view); may differ from API. */
const SHORT_LINK_BASE = environment.frontendBaseUrl;

export interface QrCodeItem {
  id: number;
  shortCode: string;
  fullUrl: string;
  userId: number;
  clickCount: number;
  createdAt: string;
  expiresAt: string | null;
  active: boolean;
}

/** Normalize one item (API may use camelCase or snake_case) */
function normalizeItem(raw: Record<string, unknown>): QrCodeItem {
  return {
    id: Number(raw['id'] ?? 0),
    shortCode: String(raw['shortCode'] ?? raw['short_code'] ?? ''),
    fullUrl: String(raw['fullUrl'] ?? raw['full_url'] ?? ''),
    userId: Number(raw['userId'] ?? raw['user_id'] ?? 0),
    clickCount: Number(raw['clickCount'] ?? raw['click_count'] ?? 0),
    createdAt: String(raw['createdAt'] ?? raw['created_at'] ?? ''),
    expiresAt: raw['expiresAt'] != null ? String(raw['expiresAt']) : raw['expires_at'] != null ? String(raw['expires_at']) : null,
    active: Boolean(raw['active']),
  };
}

/** API may return a raw array or { data: [...] }; items may be camelCase or snake_case */
function unwrapList(body: unknown): QrCodeItem[] {
  let arr: unknown[] = [];
  if (Array.isArray(body)) arr = body;
  else if (body && typeof body === 'object' && Array.isArray((body as { data?: unknown[] }).data)) {
    arr = (body as { data: unknown[] }).data;
  }
  return arr.map((item) => normalizeItem((item as Record<string, unknown>) || {}));
}

@Injectable({ providedIn: 'root' })
export class QrCodesService {
  constructor(private http: HttpClient) {}

  getList(): Observable<QrCodeItem[]> {
    return this.http.get<unknown>(`${API_BASE}/api/qr-codes`).pipe(map(unwrapList));
  }

  /** Base URL for short links (e.g. http://localhost:3000/s/abc123) */
  shortLinkUrl(shortCode: string): string {
    return `${SHORT_LINK_BASE}/s/${shortCode}`;
  }
}
