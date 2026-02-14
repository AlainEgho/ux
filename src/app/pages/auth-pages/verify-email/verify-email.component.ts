import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { AuthPageLayoutComponent } from '../../../shared/layout/auth-page-layout/auth-page-layout.component';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule, AuthPageLayoutComponent],
  template: `
    <app-auth-page-layout>
      <div class="flex flex-col flex-1 justify-center w-full max-w-md mx-auto">
        @if (status() === 'loading') {
          <p class="text-theme-sm text-gray-500 dark:text-gray-400">Verifying your email…</p>
        } @else if (status() === 'success') {
          <div class="rounded-xl border border-success-200 bg-success-50 p-6 dark:border-success-800 dark:bg-success-500/10">
            <h2 class="mb-2 text-lg font-semibold text-success-800 dark:text-success-400">Email verified</h2>
            <p class="text-theme-sm text-success-700 dark:text-success-300">{{ message() }}</p>
            <a
              routerLink="/signin"
              class="mt-4 inline-flex text-theme-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Sign in
            </a>
          </div>
        } @else {
          <div class="rounded-xl border border-error-200 bg-error-50 p-6 dark:border-error-800 dark:bg-error-500/10">
            <h2 class="mb-2 text-lg font-semibold text-error-800 dark:text-error-400">Verification failed</h2>
            <p class="text-theme-sm text-error-700 dark:text-error-300">{{ message() }}</p>
            <a
              routerLink="/signin"
              class="mt-4 inline-flex text-theme-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
            >
              Back to sign in
            </a>
          </div>
        }
      </div>
    </app-auth-page-layout>
  `,
})
export class VerifyEmailComponent implements OnInit {
  status = signal<'loading' | 'success' | 'error'>('loading');
  message = signal('');

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.status.set('error');
      this.message.set('Missing verification token.');
      return;
    }
    this.auth.verifyEmail(token).subscribe({
      next: (res) => {
        if (res.success) {
          this.status.set('success');
          this.message.set(res.message || 'Email verified successfully.');
        } else {
          this.status.set('error');
          this.message.set(res.message || 'Verification failed.');
        }
      },
      error: (err) => {
        this.status.set('error');
        const msg =
          err?.error?.message ||
          err?.message ||
          'Invalid or expired verification token.';
        this.message.set(msg);
      },
    });
  }
}
