import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from './items.service';

const API_BASE = 'http://localhost:8081';

export interface CartItem {
  itemId: string;
  quantity: number;
}

export interface CreateCartRequest {
  status: string;
  eventDate: string;
  items: CartItem[];
}

export interface CreateCartResponse {
  success: boolean;
  message: string;
  data: any;
}

interface CartItemData {
  quantity: number;
  eventDate: string;
  item: Item | null;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly url = `${API_BASE}/api/carts`;
  private cartItems = new Map<string, CartItemData>();
  private cartEventDate: string | null = null;

  constructor(private http: HttpClient) {}

  addToCart(item: Item, quantity: number, eventDate: string): void {
    if (!this.cartEventDate) {
      this.cartEventDate = eventDate;
    }
    this.cartItems.set(item.id, { quantity, eventDate: this.cartEventDate, item });
  }

  getCartEventDate(): string | null {
    return this.cartEventDate;
  }

  setCartEventDate(date: string): void {
    this.cartEventDate = date;
    this.cartItems.forEach((data, itemId) => {
      this.cartItems.set(itemId, { ...data, eventDate: date });
    });
  }

  removeFromCart(itemId: string): void {
    this.cartItems.delete(itemId);
  }

  getCartItems(): Array<{ itemId: string; quantity: number; eventDate: string; item: Item | null }> {
    return Array.from(this.cartItems.entries()).map(([itemId, data]) => ({
      itemId,
      quantity: data.quantity,
      eventDate: data.eventDate,
      item: data.item,
    }));
  }

  clearCart(): void {
    this.cartItems.clear();
    this.cartEventDate = null;
  }

  getCartSize(): number {
    return this.cartItems.size;
  }

  create(body: CreateCartRequest): Observable<CreateCartResponse> {
    console.log('CartService.create called:', { url: this.url, body });
    return this.http.post<CreateCartResponse>(this.url, body);
  }
}
