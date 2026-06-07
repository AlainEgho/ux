import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateShortUrlRequest, CreateShortUrlResponse } from '../models/shortener.model';
import { UploadImageResponse } from '../models/image.model';

@Injectable({ providedIn: 'root' })
export class ArchaApiService {
  private readonly base = environment.archaApiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  private authHeaders(): HttpHeaders | undefined {
    const token = localStorage.getItem('access_token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  createShortUrl(body: CreateShortUrlRequest): Observable<CreateShortUrlResponse> {
    return this.http.post<CreateShortUrlResponse>(`${this.base}/shorten`, body, {
      headers: this.authHeaders(),
    });
  }

  uploadImage(file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<UploadImageResponse>(`${this.base}/upload-image`, formData, {
      headers: this.authHeaders(),
    });
  }

  shortLinkUrl(shortUrl: string): string {
    return `${this.base}${shortUrl}`;
  }

  imageUrl(imageUrl: string): string {
    return `${this.base}${imageUrl}`;
  }
}
