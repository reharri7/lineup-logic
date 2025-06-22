import { Routes } from '@angular/router';
import {TeamsSummaryComponent} from "./teams/teams-summary.component";
import {AdminComponent} from "./admin.component";
import {TeamComponent} from "./teams/team/team.component";

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminComponent,
  },
  {
    path: 'teams',
    component: TeamsSummaryComponent,
  },
  {
    path: 'teams/:teamId',
    component: TeamComponent,
  },
  {
    path: 'teams/new',
    component: TeamComponent,
  }
];
