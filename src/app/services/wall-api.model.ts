import { environment } from '../../environments/environment';
import type { ApiResponse } from './auth-api.model';

const API_BASE = environment.apiBaseUrl;

export const WALL_API = {
  posts: `${API_BASE}/api/wall/posts`,
} as const;

export interface WallPost {
  id: number;
  authorId: number;
  authorFirstName: string;
  authorLastName: string;
  authorEmail: string;
  content: string | null;
  imagePath: string | null;
  createdAt: string;
}

export interface CreateWallPostRequest {
  content?: string;
  imagePath?: string;
  imageBase64?: string;
}

/** Spring Page response for GET wall posts */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export type CreateWallPostResponse = ApiResponse<WallPost>;
export type WallPostsPageResponse = ApiResponse<SpringPage<WallPost>>;
