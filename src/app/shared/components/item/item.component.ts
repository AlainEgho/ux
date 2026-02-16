import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../../services/items.service';

@Component({
  selector: 'app-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './item.component.html',
  styles: ``,
})
export class ItemComponent {
  @Input() item!: Item;
  imageFailed = false;

  onImageError(): void {
    this.imageFailed = true;
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    return isNaN(d.getTime())
      ? value
      : d.toLocaleDateString(undefined, { dateStyle: 'short' });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(price);
  }
}
