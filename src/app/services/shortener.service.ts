import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000';

export interface ShortenResponse {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
}

@Injectable({ providedIn: 'root' })
export class ShortenerService {
  constructor(private http: HttpClient) {}

  shorten(url: string): Observable<ShortenResponse> {
    return this.http.post<ShortenResponse>(`${API_URL}/shorten`, { url });
  }

  fullShortUrl(shortUrlPath: string): string {
    return `${API_URL}${shortUrlPath}`;
  }
}
