import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Item } from '../../services/items.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { computed } from '@angular/core';

@Component({
  selector: 'app-item-leaf',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './item-leaf.component.html',
  styles: ``,
})
export class ItemLeafComponent implements OnInit {
  item = signal<Item | null>(null);
  categoryId = signal<string | null>(null);
  categoryName = signal<string>('');
  imageFailed = signal(false);
  showAddToCartModal = signal(false);
  eventDate = '';
  quantity = 1;
  cartSize = computed(() => this.cartService.getCartSize());

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    public cartService: CartService
  ) {}

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

  openAddToCartModal(): void {
    this.showAddToCartModal.set(true);
    const today = new Date();
    today.setDate(today.getDate() + 1);
    this.eventDate = today.toISOString().split('T')[0];
    this.quantity = 1;
  }

  closeAddToCartModal(): void {
    this.showAddToCartModal.set(false);
  }

  addToCart(): void {
    const it = this.item();
    if (!it || !this.eventDate) return;
    this.cartService.addToCart(it, this.quantity, this.eventDate);
    this.showAddToCartModal.set(false);
  }
}
