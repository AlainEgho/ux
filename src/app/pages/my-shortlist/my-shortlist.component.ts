import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { ItemsService, ItemBuyer } from '../../services/items.service';

@Component({
  selector: 'app-my-shortlist',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
  ],
  templateUrl: './my-shortlist.component.html',
  styles: ``,
})
export class MyShortlistComponent implements OnInit {
  buyers = signal<ItemBuyer[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private itemsService: ItemsService) {}

  ngOnInit(): void {
    this.itemsService.getBuyers().subscribe({
      next: (list) => {
        this.buyers.set(Array.isArray(list) ? list : []);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message || err?.message || 'Failed to load buyers.'
        );
        this.buyers.set([]);
        this.loading.set(false);
      },
    });
  }

  fullName(buyer: ItemBuyer): string {
    const first = (buyer.firstName ?? '').trim();
    const last = (buyer.lastName ?? '').trim();
    if (first && last) return `${first} ${last}`;
    return first || last || buyer.email || '—';
  }

  formatDate(value: string | null | undefined): string {
    if (value == null || value === '') return '—';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { dateStyle: 'short' });
  }
}
