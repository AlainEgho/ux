import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ItemsService, Item } from '../../services/items.service';
import { ItemComponent } from '../../shared/components/item/item.component';

@Component({
  selector: 'app-category-items',
  standalone: true,
  imports: [CommonModule, RouterModule, ItemComponent],
  templateUrl: './category-items.component.html',
  styles: ``,
})
export class CategoryItemsComponent implements OnInit {
  categoryId = signal<string | null>(null);
  categoryName = signal<string>('');
  items = signal<Item[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private itemsService: ItemsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('categoryId');
    this.categoryId.set(id);
    const state = history.state as { categoryName?: string };
    if (state?.categoryName) {
      this.categoryName.set(state.categoryName);
    } else if (id) {
      this.categoryName.set('Category');
    }
    if (id) {
      this.itemsService.getByCategoryId(id).subscribe({
        next: (list) => {
          this.items.set(list);
          this.loading.set(false);
          this.error.set(null);
        },
        error: (err) => {
          this.error.set(
            err?.error?.message || err?.message || 'Failed to load items.'
          );
          this.loading.set(false);
          this.items.set([]);
        },
      });
    } else {
      this.error.set('Invalid category.');
      this.loading.set(false);
    }
  }
}
