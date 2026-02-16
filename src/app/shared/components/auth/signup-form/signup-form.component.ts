import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LabelComponent } from '../../form/label/label.component';
import { CheckboxComponent } from '../../form/input/checkbox.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-signup-form',
  imports: [
    LabelComponent,
    CheckboxComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './signup-form.component.html',
  styles: ``,
})
export class SignupFormComponent implements OnInit {
  showPassword = false;
  isChecked = false;
  fname = '';
  lname = '';
  email = '';
  password = '';
  address = '';
  phoneNumber = '';
  error = signal<string | null>(null);
  loading = signal(false);

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.router.navigate(['/app/shortener']);
    }
  }

  toStr(v: string | number): string {
    return typeof v === 'string' ? v : String(v);
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSignUp(): void {
    this.error.set(null);
    if (!this.fname.trim() || !this.lname.trim() || !this.email.trim() || !this.password) {
      this.error.set('Please fill in first name, last name, email and password.');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters.');
      return;
    }
    this.loading.set(true);
    const body = {
      firstName: this.fname.trim(),
      lastName: this.lname.trim(),
      email: this.email.trim(),
      password: this.password,
      ...(this.address.trim() && { address: this.address.trim() }),
      ...(this.phoneNumber.trim() && { phoneNumber: this.phoneNumber.trim() }),
    };
    this.auth.signup(body).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.success) {
          this.router.navigate(['/app/shortener']);
        } else {
          this.error.set(res.message || 'Registration failed.');
        }
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message ||
          err?.message ||
          'Registration failed. Please try again.';
        this.error.set(msg);
      },
    });
  }
}
