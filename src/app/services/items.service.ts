import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const API_BASE = 'http://localhost:8081';

export interface ItemDetail {
  id: number;
  quantity: number;
  price: number;
}

export interface ItemAddress {
  id: number;
  addressName: string;
  longitude: number;
  latitude: number;
}

export interface ItemContact {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface Item {
  id: string;
  description: string;
  imageUrl: string | null;
  active: boolean;
  userId: number;
  categoryId: string;
  detail: ItemDetail | null;
  address: ItemAddress | null;
  contact: ItemContact | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface ItemsApiResponse {
  success: boolean;
  message: string;
  data: Item[];
}

export interface ItemBuyer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  cartEventDate?: string | null;
  cartCreatedAt?: string | null;
}

export interface ItemBuyersApiResponse {
  success: boolean;
  message: string;
  data: ItemBuyer[];
}

export interface CreateItemDetail {
  quantity: number;
  price: number;
}

export interface CreateItemAddress {
  addressName: string;
  longitude: number;
  latitude: number;
}

export interface CreateItemContact {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface CreateItemRequest {
  description: string;
  categoryId: string;
  imageBase64?: string;
  imageContentType?: string;
  active: boolean;
  detail?: CreateItemDetail | null;
  address?: CreateItemAddress | null;
  contact?: CreateItemContact | null;
}

export interface CreateItemResponse {
  success: boolean;
  message: string;
  data: Item | null;
}

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly baseUrl = `${API_BASE}/api/items`;

  constructor(private http: HttpClient) {}

  getByCategoryId(categoryId: string): Observable<Item[]> {
    return this.http
      .get<ItemsApiResponse>(`${this.baseUrl}/category/${encodeURIComponent(categoryId)}`)
      .pipe(map((res) => res.data || []));
  }

  create(body: CreateItemRequest): Observable<CreateItemResponse> {
    return this.http.post<CreateItemResponse>(this.baseUrl, body);
  }

  getBuyers(): Observable<ItemBuyer[]> {
    return this.http
      .get<ItemBuyersApiResponse>(`${this.baseUrl}/buyers`)
      .pipe(map((res) => res.data ?? []));
  }
}
