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
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password/:token',
    loadComponent: () => import('./pages/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
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
    path: 'player-rankings',
    loadComponent: () => import('./pages/player-rankings/player-rankings.component').then(m => m.PlayerRankingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'optimal-lineup',
    loadComponent: () => import('./pages/optimal-lineup/optimal-lineup.component').then(m => m.OptimalLineupComponent),
    canActivate: [authGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard]
  }
];
