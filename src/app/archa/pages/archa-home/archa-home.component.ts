import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArchaApiService } from '../../services/archa-api.service';
import { ArchaStorageService } from '../../services/archa-storage.service';
import { CreateShortUrlResponse } from '../../models/shortener.model';
import { UploadImageResponse } from '../../models/image.model';
import { ArchaStoredItem } from '../../models/archa-stored-item.model';

type ArchaTab = 'link' | 'image' | 'list';

@Component({
  selector: 'app-archa-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './archa-home.component.html',
  styles: ``,
})
export class ArchaHomeComponent implements OnDestroy {
  activeTab = signal<ArchaTab>('link');

  urlInput = '';
  urlResult = signal<CreateShortUrlResponse | null>(null);
  urlError = signal<string | null>(null);
  urlLoading = signal(false);
  urlCopied = signal(false);

  imageFile: File | null = null;
  imagePreview = signal<string | null>(null);
  imageResult = signal<UploadImageResponse | null>(null);
  imageError = signal<string | null>(null);
  imageLoading = signal(false);
  imageCopied = signal(false);

  listFilter = signal<'all' | 'url' | 'image'>('all');

  constructor(
    readonly api: ArchaApiService,
    readonly storage: ArchaStorageService,
  ) {}

  ngOnDestroy(): void {
    const preview = this.imagePreview();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  }

  setTab(tab: ArchaTab): void {
    this.activeTab.set(tab);
  }

  shortenUrl(): void {
    this.urlError.set(null);
    this.urlResult.set(null);
    if (!this.urlInput.trim()) {
      this.urlError.set('Please enter a URL.');
      return;
    }
    this.urlLoading.set(true);
    this.api.createShortUrl({ url: this.urlInput.trim() }).subscribe({
      next: (res) => {
        this.urlResult.set(res);
        this.urlLoading.set(false);
        this.storage.add({
          id: crypto.randomUUID(),
          type: 'url',
          shortCode: res.shortCode,
          shortPath: res.shortUrl,
          fullShortUrl: this.api.shortLinkUrl(res.shortUrl),
          originalUrl: res.originalUrl,
          createdAt: new Date().toISOString(),
        });
      },
      error: (err) => {
        this.urlError.set(this.extractError(err, 'Failed to shorten URL. Is the API running on port 3000?'));
        this.urlLoading.set(false);
      },
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    const previous = this.imagePreview();
    if (previous) {
      URL.revokeObjectURL(previous);
    }
    this.imageFile = file;
    this.imageResult.set(null);
    this.imageError.set(null);
    this.imagePreview.set(file ? URL.createObjectURL(file) : null);
  }

  uploadImage(): void {
    if (!this.imageFile) {
      this.imageError.set('Please select an image file.');
      return;
    }
    this.imageError.set(null);
    this.imageResult.set(null);
    this.imageLoading.set(true);
    this.api.uploadImage(this.imageFile).subscribe({
      next: (res) => {
        this.imageResult.set(res);
        this.imageLoading.set(false);
        this.storage.add({
          id: crypto.randomUUID(),
          type: 'image',
          shortCode: res.shortCode,
          shortPath: res.imageUrl,
          fullShortUrl: this.api.imageUrl(res.imageUrl),
          originalFileName: res.originalFileName,
          contentType: res.contentType,
          createdAt: new Date().toISOString(),
        });
      },
      error: (err) => {
        this.imageError.set(this.extractError(err, 'Failed to upload image. Is the API running on port 3000?'));
        this.imageLoading.set(false);
      },
    });
  }

  filteredItems(): ArchaStoredItem[] {
    const filter = this.listFilter();
    const items = this.storage.items();
    if (filter === 'all') return items;
    return items.filter((item) => item.type === filter);
  }

  removeItem(id: string): void {
    this.storage.remove(id);
  }

  clearAll(): void {
    this.storage.clear();
  }

  copyText(text: string, kind: 'url' | 'image'): void {
    navigator.clipboard.writeText(text).then(() => {
      if (kind === 'url') {
        this.urlCopied.set(true);
        setTimeout(() => this.urlCopied.set(false), 2000);
      } else {
        this.imageCopied.set(true);
        setTimeout(() => this.imageCopied.set(false), 2000);
      }
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  private extractError(err: unknown, fallback: string): string {
    const e = err as { error?: { message?: string | string[] }; message?: string };
    const msg = e?.error?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    return msg || e?.message || fallback;
  }
}
