import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import {
  DirectShortenerService,
  DirectShortenData,
} from '../../services/direct-shortener.service';

@Component({
  selector: 'app-direct-shortener',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
  ],
  templateUrl: './direct-shortener.component.html',
  styles: ``,
})
export class DirectShortenerComponent {
  fullUrl = '';
  result = signal<DirectShortenData | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);
  copied = signal(false);

  constructor(private directShortener: DirectShortenerService) {}

  onSubmit(): void {
    this.error.set(null);
    this.result.set(null);
    if (!this.fullUrl.trim()) {
      this.error.set('Please enter a URL.');
      return;
    }
    this.loading.set(true);
    this.directShortener.shorten(this.fullUrl.trim()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message ||
            err?.message ||
            'Failed to shorten URL. Is the API running on port 5000?'
        );
        this.loading.set(false);
      },
    });
  }

  getShortLink(res: DirectShortenData): string {
    return this.directShortener.shortLinkUrl(res.shortCode);
  }

  copyShortLink(res: DirectShortenData): void {
    const link = this.getShortLink(res);
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
