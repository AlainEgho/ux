import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { CategoriesService, Category } from '../../services/categories.service';

@Component({
  selector: 'app-create-category',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
  ],
  templateUrl: './create-category.component.html',
  styles: ``,
})
export class CreateCategoryComponent {
  description = '';
  imagePreview = signal<string | null>(null);
  imageFile: File | null = null;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<Category | null>(null);

  constructor(
    private categoriesService: CategoriesService,
    private router: Router
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error.set('Please select an image file (e.g. PNG, JPEG).');
      return;
    }
    this.error.set(null);
    this.imageFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
    input.value = '';
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.imageFile = null;
  }

  onSubmit(): void {
    this.error.set(null);
    if (!this.description.trim()) {
      this.error.set('Please enter a category description.');
      return;
    }
    if (this.description.trim().length > 500) {
      this.error.set('Description must be 500 characters or less.');
      return;
    }
    this.loading.set(true);
    const body: any = {
      description: this.description.trim(),
    };
    if (this.imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        body.imageBase64 = dataUrl;
        if (!dataUrl.startsWith('data:')) {
          body.imageContentType = this.imageFile!.type;
        }
        this.submitRequest(body);
      };
      reader.readAsDataURL(this.imageFile);
    } else {
      this.submitRequest(body);
    }
  }

  private submitRequest(body: any): void {
    this.categoriesService.create(body).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.success.set(res.data);
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        } else {
          this.error.set(res.message || 'Failed to create category.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.error?.message ||
            err?.message ||
            'Failed to create category. Please try again.'
        );
      },
    });
  }

  get remainingChars(): number {
    return 500 - this.description.length;
  }
}
