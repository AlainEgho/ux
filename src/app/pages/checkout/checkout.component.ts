import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../shared/components/common/component-card/component-card.component';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
  ],
  templateUrl: './checkout.component.html',
  styles: ``,
})
export class CheckoutComponent implements OnInit {
  cartItems = signal<ReturnType<CartService['getCartItems']>>([]);
  eventDate = signal<string>('');
  error = signal<string | null>(null);
  submitting = signal(false);

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    const items = this.cartService.getCartItems();
    if (items.length === 0) {
      this.cartItems.set([]);
      return;
    }
    const eventDate = this.cartService.getCartEventDate() || items[0]?.eventDate || '';
    this.eventDate.set(eventDate);
    this.cartItems.set(items);
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId);
    this.cartItems.set(this.cartService.getCartItems());
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (quantity < 1) return;
    const item = this.cartItems().find((x) => x.itemId === itemId);
    if (item && item.item) {
      this.cartService.removeFromCart(itemId);
      this.cartService.addToCart(item.item, quantity, item.eventDate);
      this.cartItems.set(this.cartService.getCartItems());
    }
  }

  updateEventDate(date: string): void {
    this.eventDate.set(date);
    this.cartService.setCartEventDate(date);
    this.cartItems.set(this.cartService.getCartItems());
  }

  onSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    if (!this.eventDate().trim()) {
      this.error.set('Please select an event date.');
      return;
    }
    const items = this.cartItems();
    if (items.length === 0) {
      this.error.set('Cart is empty.');
      return;
    }
    this.submitting.set(true);
    this.error.set(null);
    const requestBody = {
      status: 'PENDING',
      eventDate: this.eventDate(),
      items: items.map((ci) => ({
        itemId: ci.itemId,
        quantity: ci.quantity,
      })),
    };
    console.log('Submitting cart:', requestBody);
    this.cartService
      .create(requestBody)
      .subscribe({
        next: (res) => {
          console.log('Cart create response:', res);
          this.submitting.set(false);
          if (res.success) {
            this.cartService.clearCart();
            this.router.navigate(['/app/shortener']);
          } else {
            this.error.set(res.message || 'Failed to submit cart.');
          }
        },
        error: (err) => {
          console.error('Cart create error:', err);
          this.submitting.set(false);
          this.error.set(
            err?.error?.message || err?.message || 'Failed to submit cart.'
          );
        },
      });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(price);
  }
}
