import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const API_BASE = environment.shortenerApiBaseUrl;
const API_URL = `${API_BASE}/api/shorteners`;

export interface DirectShortenRequest {
  fullUrl: string;
}

/** Item returned inside data from POST /api/shorteners */
export interface DirectShortenData {
  id: number;
  shortCode: string;
  fullUrl: string;
  userId: number;
  clickCount: number;
  createdAt: string;
  expiresAt: string | null;
  active: boolean;
}

export interface DirectShortenApiResponse {
  success: boolean;
  message: string;
  data: DirectShortenData;
}

@Injectable({ providedIn: 'root' })
export class DirectShortenerService {
  constructor(private http: HttpClient) {}

  shorten(fullUrl: string): Observable<DirectShortenData> {
    return this.http
      .post<DirectShortenApiResponse>(API_URL, { fullUrl })
      .pipe(
        map((res) => {
          if (!res.success || !res.data) {
            throw new Error(res.message || 'Short link creation failed');
          }
          return res.data;
        })
      );
  }

  /** Full URL to open the short link (e.g. http://localhost:5000/s/mylink) */
  shortLinkUrl(shortCode: string): string {
    const path = shortCode.startsWith('/') ? shortCode : `/s/${shortCode}`;
    return `${API_BASE}${path}`;
  }
}
