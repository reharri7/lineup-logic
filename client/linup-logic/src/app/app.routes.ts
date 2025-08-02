import { Routes } from '@angular/router';
import { HomeComponent } from "./pages/home/home.component";
import { LoginComponent } from "./pages/login/login.component";
import { authGuard } from "./shared/guards/auth.guard";
import { DashboardComponent } from "./pages/fantasy-teams/dashboard/dashboard.component";
import { TeamDetailComponent } from "./pages/fantasy-teams/team-detail/team-detail.component";

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'fantasy-teams',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'fantasy-teams/:id',
    component: TeamDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard]
  }
];
