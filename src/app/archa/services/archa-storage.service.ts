import { Injectable, signal } from '@angular/core';
import { ArchaStoredItem } from '../models/archa-stored-item.model';

const STORAGE_KEY = 'archa_shortened_items';

@Injectable({ providedIn: 'root' })
export class ArchaStorageService {
  readonly items = signal<ArchaStoredItem[]>(this.load());

  get urlItems(): ArchaStoredItem[] {
    return this.items().filter((item) => item.type === 'url');
  }

  get imageItems(): ArchaStoredItem[] {
    return this.items().filter((item) => item.type === 'image');
  }

  add(item: ArchaStoredItem): void {
    const next = [item, ...this.items()];
    this.persist(next);
  }

  remove(id: string): void {
    const next = this.items().filter((item) => item.id !== id);
    this.persist(next);
  }

  clear(): void {
    this.persist([]);
  }

  private load(): ArchaStoredItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as ArchaStoredItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(items: ArchaStoredItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    this.items.set(items);
  }
}
