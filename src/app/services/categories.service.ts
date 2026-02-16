import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API_BASE = 'http://localhost:8081';

export interface Category {
  id: string;
  description: string;
  imageUrl: string;
  userId: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CategoriesApiResponse {
  success: boolean;
  message: string;
  data: Category[];
}

export interface CreateCategoryRequest {
  description: string;
  imageBase64?: string;
  imageContentType?: string;
}

export interface CreateCategoryResponse {
  success: boolean;
  message: string;
  data: Category | null;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly url = `${API_BASE}/api/categories`;

  constructor(private http: HttpClient) {}

  getList(): Observable<Category[]> {
    return this.http
      .get<CategoriesApiResponse>(this.url)
      .pipe(map((res) => res.data || []));
  }

  create(body: CreateCategoryRequest): Observable<CreateCategoryResponse> {
    return this.http.post<CreateCategoryResponse>(this.url, body);
  }
}
