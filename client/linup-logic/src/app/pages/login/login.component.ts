import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from "../../shared/services/auth.service";
import { lastValueFrom } from 'rxjs';
import {NotificationService} from "../../shared/services/notification.service";
import {UsersService} from "../../services/generated";
import {passwordMatchValidator} from "../../shared/validators";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  standalone: true
})
export class LoginComponent implements OnInit {
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  createAccountForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    password_confirmation: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required])
  }, { validators: passwordMatchValidator() });

  constructor(
    private auth: AuthService,
    private userService: UsersService,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
  }

  async onLogin(): Promise<void> {
    this.loginForm.markAllAsTouched();
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      if(!!email && !!password) {
        try {
          const result = await lastValueFrom(this.auth.login(email, password));
          if(result && result.token) {
            this.notificationService.showNotification('Login successful', 'success');
            // Redirect to home page
            await this.router.navigate(['/']);
          }
        } catch (e) {
          console.error('Login failed:', e);
          this.notificationService.showNotification('Login failed', 'error');
        }
      }
    }
  }

  async onCreateAccount(): Promise<void> {
    this.createAccountForm.markAllAsTouched();
    if (this.createAccountForm.valid) {
      const formData = this.createAccountForm.value;
      try {
        // Use 'response' observe option to get the full HTTP response
        const response = await lastValueFrom(this.userService.apiSignupPost({
          email: formData.email || '',
          password: formData.password || '',
          password_confirmation: formData.password_confirmation || '',
          username: formData.username || ''
        }, 'response'));

        // Extract result from response body
        const result = response.body;
        // Access the token directly from the response body
        const token = result?.token;

        if (result) {
          // If token exists, set it in the auth service
          if (token) {
            this.auth.setToken(token);
          }

          // Close the dialog
          const dialog = document.querySelector('dialog');
          if (dialog) {
            dialog.close();
          }
          this.createAccountForm.reset();
          await this.router.navigate(['/']);
          this.notificationService.showNotification('Account created successfully', 'success');
        }
      } catch (e) {
        console.error('Account creation failed:', e);
        this.notificationService.showNotification('Account creation failed', 'error');
      }
    }
  }
}
