import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { BadgeComponent } from '../../shared/components/ui/badge/badge.component';
import { QrCodesService, QrCodeItem } from '../../services/qr-codes.service';

@Component({
  selector: 'app-my-shortener-urls',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    BadgeComponent,
  ],
  templateUrl: './my-shortener-urls.component.html',
  styles: ``,
})
export class MyShortenerUrlsComponent implements OnInit {
  items = signal<QrCodeItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private qrCodes: QrCodesService) {}

  ngOnInit(): void {
    this.qrCodes.getList().subscribe({
      next: (list) => {
        const arr = Array.isArray(list) ? list : [];
        this.items.set(arr);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to load URLs.');
        this.items.set([]);
        this.loading.set(false);
      },
    });
  }

  shortLinkUrl(shortCode: string): string {
    return this.qrCodes.shortLinkUrl(shortCode);
  }

  qrImageUrl(shortCode: string): string {
    const url = this.qrCodes.shortLinkUrl(shortCode);
    return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(url)}`;
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { dateStyle: 'short' });
  }
}
