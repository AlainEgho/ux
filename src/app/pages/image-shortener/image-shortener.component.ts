import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import {
  ImageUploadsService,
  ImageUploadResponse,
} from '../../services/image-uploads.service';

@Component({
  selector: 'app-image-shortener',
  standalone: true,
  imports: [CommonModule, PageBreadcrumbComponent, ComponentCardComponent],
  templateUrl: './image-shortener.component.html',
  styles: ``,
})
export class ImageShortenerComponent {
  loading = signal(false);
  error = signal<string | null>(null);
  result = signal<ImageUploadResponse | null>(null);
  copied = signal(false);

  constructor(private imageUploads: ImageUploadsService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error.set('Please select an image file (e.g. PNG, JPEG).');
      return;
    }
    this.error.set(null);
    this.result.set(null);
    this.loading.set(true);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const contentType = file.type;
      const originalFileName = file.name;
      this.imageUploads
        .upload({
          base64: dataUrl,
          contentType,
          originalFileName,
        })
        .subscribe({
          next: (res) => {
            this.loading.set(false);
            if (res.success && res.data) {
              this.result.set(res.data);
            } else {
              this.error.set(res.message || 'Upload failed.');
            }
          },
          error: (err) => {
            this.loading.set(false);
            this.error.set(
              err?.error?.message ||
                err?.message ||
                'Failed to upload image. Are you signed in?'
            );
          },
        });
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  qrCodeImageUrl(url: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}`;
  }

  copyImageUrl(res: ImageUploadResponse): void {
    navigator.clipboard.writeText(res.imageUrl).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
