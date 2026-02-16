import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { CategoriesService, Category } from '../../services/categories.service';
import {
  ItemsService,
  CreateItemRequest,
  Item,
} from '../../services/items.service';

@Component({
  selector: 'app-create-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
  ],
  templateUrl: './create-item.component.html',
  styles: ``,
})
export class CreateItemComponent implements OnInit {
  categories = signal<Category[]>([]);
  description = '';
  categoryId = '';
  imagePreview = signal<string | null>(null);
  imageFile: File | null = null;
  active = true;
  // detail
  quantity = '';
  price = '';
  // address
  addressName = '';
  longitude = '';
  latitude = '';
  // contact
  firstName = '';
  lastName = '';
  phone = '';
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<Item | null>(null);

  constructor(
    private categoriesService: CategoriesService,
    private itemsService: ItemsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoriesService.getList().subscribe({
      next: (list) => this.categories.set(list),
      error: () => this.categories.set([]),
    });
  }

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
    reader.onload = () => this.imagePreview.set(reader.result as string);
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
      this.error.set('Please enter a description.');
      return;
    }
    if (!this.categoryId.trim()) {
      this.error.set('Please select a category.');
      return;
    }
    this.loading.set(true);
    const body: CreateItemRequest = {
      description: this.description.trim(),
      categoryId: this.categoryId.trim(),
      active: this.active,
    };
    if (this.imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        body.imageBase64 = dataUrl;
        if (!dataUrl.startsWith('data:')) {
          body.imageContentType = this.imageFile!.type;
        }
        this.addOptionalsAndSubmit(body);
      };
      reader.readAsDataURL(this.imageFile);
    } else {
      this.addOptionalsAndSubmit(body);
    }
  }

  private str(val: string | number | null | undefined): string {
    return val == null ? '' : String(val);
  }

  private addOptionalsAndSubmit(body: CreateItemRequest): void {
    const qStr = this.str(this.quantity);
    const pStr = this.str(this.price);
    if (qStr.trim() !== '' && pStr.trim() !== '') {
      const q = Number(this.quantity);
      const p = Number(this.price);
      if (!isNaN(q) && !isNaN(p)) {
        body.detail = { quantity: q, price: p };
      }
    }
    const lngStr = this.str(this.longitude);
    const latStr = this.str(this.latitude);
    if (this.addressName.trim() || lngStr.trim() !== '' || latStr.trim() !== '') {
      const lng = lngStr.trim() !== '' ? Number(this.longitude) : 0;
      const lat = latStr.trim() !== '' ? Number(this.latitude) : 0;
      body.address = {
        addressName: this.addressName.trim(),
        longitude: lngStr.trim() !== '' && !isNaN(lng) ? lng : 0,
        latitude: latStr.trim() !== '' && !isNaN(lat) ? lat : 0,
      };
    }
    if (this.firstName.trim() || this.lastName.trim() || this.phone.trim()) {
      body.contact = {
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        phone: this.phone.trim(),
      };
    }
    this.itemsService.create(body).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success && res.data) {
          this.success.set(res.data);
          setTimeout(() => this.router.navigate(['/category', res.data!.categoryId]), 2000);
        } else {
          this.error.set(res.message || 'Failed to create item.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err?.error?.message || err?.message || 'Failed to create item. Please try again.'
        );
      },
    });
  }
}
