import { Routes } from '@angular/router';
import {TeamsSummaryComponent} from "./teams/teams-summary.component";
import {AdminComponent} from "./admin.component";
import {TeamComponent} from "./teams/team/team.component";
import {PositionsSummaryComponent} from "./positions/positions-summary.component";
import {PositionComponent} from "./positions/position/position.component";
import {PlayersSummaryComponent} from "./players/players-summary.component";
import {PlayerComponent} from "./players/player/player.component";

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
  },
  {
    path: 'positions',
    component: PositionsSummaryComponent,
  },
  {
    path: 'positions/:positionId',
    component: PositionComponent,
  },
  {
    path: 'positions/new',
    component: PositionComponent,
  },
  {
    path: 'players',
    component: PlayersSummaryComponent,
  },
  {
    path: 'players/:playerId',
    component: PlayerComponent,
  },
  {
    path: 'players/new',
    component: PlayerComponent,
  }
];
