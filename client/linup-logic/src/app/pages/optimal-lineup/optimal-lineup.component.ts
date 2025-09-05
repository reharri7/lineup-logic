import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

import { FantasyTeamsService } from 'src/app/services/generated/api/fantasyTeams.service';
import { TeamsService } from 'src/app/services/generated/api/teams.service';
import { PositionsService } from 'src/app/services/generated/api/positions.service';
import { LineupOptimizerService, OptimalLineup } from 'src/app/shared/services/lineup-optimizer.service';
import { ApiFantasyTeamsFantasyTeamIdPlayersPost201ResponsePlayer } from 'src/app/services/generated/model/apiFantasyTeamsFantasyTeamIdPlayersPost201ResponsePlayer';
import { SelectComponent } from '../../components/select/select.component';

// Define the Player interface to match what's expected by the LineupOptimizerService
interface Player {
  id: number;
  name: string;
  position: {
    id: number;
    position_name: string;
  };
  team: {
    id: number;
    name: string;
  };
}

@Component({
  selector: 'app-optimal-lineup',
  templateUrl: './optimal-lineup.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SelectComponent]
})
export class OptimalLineupComponent implements OnInit {
  fantasyTeams: any[] = [];
  selectedTeamId: number | null = null;
  optimalLineup: OptimalLineup | null = null;
  loading = false;
  loadingTeams = false;
  error: string | null = null;

  positions: any[] = [];
  teams: any[] = [];

  positionMap: Map<number, any> = new Map();
  teamMap: Map<number, any> = new Map();

  constructor(
    private fantasyTeamsService: FantasyTeamsService,
    private teamsService: TeamsService,
    private positionsService: PositionsService,
    private lineupOptimizerService: LineupOptimizerService
  ) {}

  ngOnInit(): void {
    this.loadFantasyTeams();
    this.loadPositions();
    this.loadTeams();
  }

  loadPositions(): void {
    this.positionsService.apiPositionsGet()
      .subscribe({
        next: (response) => {
          this.positions = response.positions || [];

          this.positions
            .filter(position => position.id !== undefined && position.id !== null)
            .forEach(position => {
              this.positionMap.set(position.id as number, position);
            });
        },
        error: (err) => {
          console.error('Error loading positions:', err);
        }
      });
  }

  loadTeams(): void {
    this.teamsService.apiTeamsGet()
      .subscribe({
        next: (response) => {
          this.teams = response.teams || [];

          this.teams
            .filter(team => team.id !== undefined && team.id !== null)
            .forEach(team => {
              this.teamMap.set(team.id as number, team);
            });
        },
        error: (err) => {
          console.error('Error loading teams:', err);
        }
      });
  }

  loadFantasyTeams(): void {
    this.loadingTeams = true;
    this.error = null;

    this.fantasyTeamsService.apiFantasyTeamsGet()
      .subscribe({
        next: (response) => {
          this.fantasyTeams = response.fantasy_teams || [];
          this.loadingTeams = false;
        },
        error: (err) => {
          this.error = 'Failed to load fantasy teams. Please try again.';
          console.error('Error loading fantasy teams:', err);
          this.loadingTeams = false;
        }
      });
  }

  onTeamChange(): void {
    if (this.selectedTeamId) {
      this.generateOptimalLineup();
    } else {
      this.optimalLineup = null;
    }
  }

  generateOptimalLineup(): void {
    if (!this.selectedTeamId) return;

    this.loading = true;
    this.error = null;

    this.fantasyTeamsService.apiFantasyTeamsIdGet(this.selectedTeamId)
      .subscribe({
        next: (response) => {
          const players: Player[] = [];

          (response.players || []).forEach(player => {
            if (player.position_id && player.team_id &&
                this.positionMap.has(player.position_id) &&
                this.teamMap.has(player.team_id)) {

              const position = this.positionMap.get(player.position_id)!;
              const team = this.teamMap.get(player.team_id)!;

              players.push({
                id: player.id || 0,
                name: player.name || '',
                position: {
                  id: position.id,
                  position_name: position.position_name
                },
                team: {
                  id: team.id,
                  name: team.name
                }
              });
            }
          });

          this.optimalLineup = this.lineupOptimizerService.generateOptimalLineup(players);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load team details. Please try again.';
          console.error('Error loading team details:', err);
          this.loading = false;
        }
      });
  }


  getSelectedTeamName(): string {
    const team = this.fantasyTeams.find(t => t.id === this.selectedTeamId);
    return team ? team.name : '';
  }

  checkForRunningBacks(): boolean {
    if (this.optimalLineup === null) {
      return false;
    }
    return this.optimalLineup.runningBacks.length > 0;
  }

  checkForWideReceivers(): boolean {
    if (this.optimalLineup === null) {
      return false;
    }
    return this.optimalLineup.wideReceivers.length > 0;
  }

  getPositionDisplayName(positionCode: string | undefined): string {
    if (positionCode === undefined) {
      return '';
    }

    const positionMap: Record<string, string> = {
      'QB': 'Quarterback',
      'RB': 'Running Back',
      'WR': 'Wide Receiver',
      'TE': 'Tight End',
      'K': 'Kicker',
      'DEF': 'Defense'
    };

    return positionMap[positionCode] || positionCode;
  }
}
