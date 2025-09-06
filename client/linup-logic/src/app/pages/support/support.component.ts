import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { NotificationService } from '../../shared/services/notification.service';
import { SupportTicketsService } from '../../services/generated';
import { ApiSupportTicketsPostRequest } from '../../services/generated/model/apiSupportTicketsPostRequest';
import { InputComponent } from '../../components/input/input.component';
import { TextareaComponent } from '../../components/textarea/textarea.component';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, TextareaComponent],
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent {
  loading = false;

  form = new FormGroup({
    reply_to: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    message: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10), Validators.maxLength(10000)] }),
    // Hidden honeypot field for spam mitigation. Must stay empty.
    honeypot: new FormControl<string>('')
  });

  constructor(
    private supportTickets: SupportTicketsService,
    private notifications: NotificationService
  ) {}

  get email() { return this.form.get('reply_to'); }
  get message() { return this.form.get('message'); }

  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.value as ApiSupportTicketsPostRequest;

    // If honeypot has content, simulate success but do not call API
    if (value.honeypot && value.honeypot.trim().length > 0) {
      this.notifications.showNotification('Thanks! We\'ll be in touch.', 'success');
      this.form.reset();
      return;
    }

    this.loading = true;
    try {
      await lastValueFrom(this.supportTickets.apiSupportTicketsPost({
        reply_to: value.reply_to || '',
        message: value.message || '',
        honeypot: value.honeypot || ''
      }));
      this.notifications.showNotification('Message sent! We\'ll be in touch shortly.', 'success');
      this.form.reset();
    } catch (e) {
      console.error('Failed to submit support ticket', e);
      this.notifications.showNotification('Failed to send message. Please try again later.', 'error');
    } finally {
      this.loading = false;
    }
  }
}
