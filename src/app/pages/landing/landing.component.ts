import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CategoriesService, Category } from '../../services/categories.service';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, CategoryCardComponent],
  templateUrl: './landing.component.html',
  styles: ``,
})
export class LandingComponent implements OnInit {
  categories = signal<Category[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.categoriesService.getList().subscribe({
      next: (list) => {
        this.categories.set(list);
        this.loading.set(false);
        this.error.set(null);
      },
      error: (err) => {
        this.error.set(
          err?.error?.message || err?.message || 'Failed to load categories.'
        );
        this.loading.set(false);
        this.categories.set([]);
      },
    });
  }

}
