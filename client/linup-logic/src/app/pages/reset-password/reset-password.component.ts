import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { PasswordResetsService } from '../../services/generated';
import { NotificationService } from '../../shared/services/notification.service';
import { passwordMatchValidator } from '../../shared/validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html'
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  submitting = false;
  success = false;
  error: string | null = null;

  form = new FormGroup({
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] }),
    password_confirmation: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  }, { validators: passwordMatchValidator() });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private passwordResets: PasswordResetsService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');
    if (!this.token) {
      this.error = 'Invalid or missing password reset token.';
    }
  }

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.token) return;
    this.submitting = true;
    this.error = null;

    try {
      const password = this.form.value.password as string;
      const password_confirmation = this.form.value.password_confirmation as string;
      await lastValueFrom(this.passwordResets.apiPasswordResetsTokenPut(this.token, { password, password_confirmation }));
      this.success = true;
      this.notifications.showNotification('Password updated. Please sign in.', 'success');
      await this.router.navigate(['/login']);
    } catch (e: any) {
      this.error = 'Invalid or expired link. Please request a new reset email.';
      this.notifications.showNotification(this.error, 'error');
    } finally {
      this.submitting = false;
    }
  }
}
