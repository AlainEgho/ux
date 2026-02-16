import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../services/categories.service';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-card.component.html',
  styles: ``,
})
export class CategoryCardComponent {
  @Input() category!: Category;
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
}
