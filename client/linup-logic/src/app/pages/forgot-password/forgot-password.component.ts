import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { PasswordResetsService } from '../../services/generated';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent {
  form = new FormGroup({
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] })
  });

  submitting = false;
  submitted = false;

  constructor(
    private passwordResets: PasswordResetsService,
    private notifications: NotificationService,
  ) {}

  async onSubmit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.submitting = true;
    try {
      const email = this.form.value.email as string;
      await lastValueFrom(this.passwordResets.apiPasswordResetsPost({ email }));
    } finally {
      this.notifications.showNotification('If that email exists, we have sent password reset instructions.', 'success');
      this.submitting = false;
    }
  }
}
