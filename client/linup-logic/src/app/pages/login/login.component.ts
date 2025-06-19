import {Component, OnInit, ViewChild} from '@angular/core';
import { NavbarComponent } from "../../components/navbar/navbar.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from "../../shared/services/auth.service";
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    NavbarComponent,
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

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      if(!!email && !!password) {
        try {
          await lastValueFrom(this.auth.login(email, password));
          // Redirect to home page
          await this.router.navigate(['/']);
        } catch (e) {
          console.error('Login failed:', e);
        }
      }
    }
  }
}
