import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Item } from '../../services/items.service';

@Component({
  selector: 'app-item-leaf',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './item-leaf.component.html',
  styles: ``,
})
export class ItemLeafComponent implements OnInit {
  item = signal<Item | null>(null);
  categoryId = signal<string | null>(null);
  categoryName = signal<string>('');
  imageFailed = signal(false);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const state = history.state as {
      item?: Item;
      categoryId?: string;
      categoryName?: string;
    };
    if (state?.item) {
      this.item.set(state.item);
      this.categoryId.set(state.categoryId ?? null);
      this.categoryName.set(state.categoryName ?? '');
    } else {
      this.item.set(null);
    }
  }

  onImageError(): void {
    this.imageFailed.set(true);
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime())
      ? value
      : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(price);
  }

  backLink(): string[] {
    const cid = this.categoryId();
    if (cid) return ['/category', cid];
    return ['/'];
  }

  backLabel(): string {
    return this.categoryName() || 'Back';
  }
}
