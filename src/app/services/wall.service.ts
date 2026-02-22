import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  WALL_API,
  CreateWallPostRequest,
  CreateWallPostResponse,
  WallPostsPageResponse,
} from './wall-api.model';

@Injectable({ providedIn: 'root' })
export class WallService {
  constructor(private http: HttpClient) {}

  getPosts(page = 0, size = 20, limit = 100): Observable<WallPostsPageResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('size', String(size))
      .set('limit', String(limit));
    return this.http.get<WallPostsPageResponse>(WALL_API.posts, { params });
  }

  createPost(body: CreateWallPostRequest): Observable<CreateWallPostResponse> {
    return this.http.post<CreateWallPostResponse>(WALL_API.posts, body);
  }
}
