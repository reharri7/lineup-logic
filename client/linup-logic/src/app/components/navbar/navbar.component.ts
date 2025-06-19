import {Component, computed, OnInit, Signal} from '@angular/core';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from "../../shared/services/auth.service";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [RouterModule],
  standalone: true
})
export class NavbarComponent implements OnInit {

  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  async logout() {
    this.auth.logout();
  }

  isAuthenticated: Signal<Boolean> = computed(() => {
    return this.auth.isAuthenticated();
  })

  ngOnInit(): void {
  }

  async handleLoginButtonClicked() {
    if(this.isAuthenticated()) {
      await this.logout();
    } else {
      await this.router.navigate(['/login']);
    }
  }
}
