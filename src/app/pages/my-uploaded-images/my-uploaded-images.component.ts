import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import {
  ImageUploadsService,
  ImageUploadResponse,
} from '../../services/image-uploads.service';

@Component({
  selector: 'app-my-uploaded-images',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
  ],
  templateUrl: './my-uploaded-images.component.html',
  styles: ``,
})
export class MyUploadedImagesComponent implements OnInit {
  items = signal<ImageUploadResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private imageUploads: ImageUploadsService) {}

  ngOnInit(): void {
    this.imageUploads.getList().subscribe({
      next: (list) => {
        this.items.set(list);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message || err?.message || 'Failed to load uploaded images.'
        );
        this.items.set([]);
        this.loading.set(false);
      },
    });
  }

  imageViewUrl(shortCode: string): string {
    return this.imageUploads.imageViewUrl(shortCode);
  }

  qrImageUrl(url: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(url)}`;
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime())
      ? value
      : d.toLocaleDateString(undefined, { dateStyle: 'short' });
  }
}
