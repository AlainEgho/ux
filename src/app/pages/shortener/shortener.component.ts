import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ShortenerService, ShortenResponse } from '../../services/shortener.service';

@Component({
  selector: 'app-shortener',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './shortener.component.html',
  styleUrl: './shortener.component.css',
})
export class ShortenerComponent {
  protected readonly title = signal('URL Shortener');
  url = '';
  result = signal<ShortenResponse | null>(null);
  error = signal<string | null>(null);
  loading = signal(false);
  copied = signal(false);

  constructor(private shortener: ShortenerService) {}

  onSubmit(): void {
    this.error.set(null);
    this.result.set(null);
    if (!this.url.trim()) {
      this.error.set('Please enter a URL.');
      return;
    }
    this.loading.set(true);
    this.shortener.shorten(this.url.trim()).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        const msg =
          err?.error?.message ||
          err?.message ||
          'Failed to shorten URL. Is the API running on http://localhost:3000?';
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }

  getShortLink(res: ShortenResponse): string {
    return this.shortener.fullShortUrl(res.shortUrl);
  }

  copyShortLink(res: ShortenResponse): void {
    const link = this.getShortLink(res);
    navigator.clipboard.writeText(link).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
