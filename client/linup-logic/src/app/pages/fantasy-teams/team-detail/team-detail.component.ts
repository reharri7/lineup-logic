import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FantasyTeamsService } from 'src/app/services/generated/api/fantasyTeams.service';
import { PlayersService } from 'src/app/services/generated/api/players.service';
import { FantasyTeamPlayersService } from 'src/app/services/generated/api/fantasyTeamPlayers.service';
import { TeamsService } from 'src/app/services/generated/api/teams.service';
import { PositionsService } from 'src/app/services/generated/api/positions.service';
import { ApiFantasyTeamsIdGet200Response } from 'src/app/services/generated/model/apiFantasyTeamsIdGet200Response';
import { ApiFantasyTeamsGet200ResponseFantasyTeamsInner } from 'src/app/services/generated/model/apiFantasyTeamsGet200ResponseFantasyTeamsInner';

@Component({
  selector: 'app-team-detail',
  templateUrl: './team-detail.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class TeamDetailComponent implements OnInit {
  fantasyTeam: ApiFantasyTeamsGet200ResponseFantasyTeamsInner | null = null;
  players: any[] = [];
  loading = false;
  error: string | null = null;

  showEditModal = false;
  showDeleteModal = false;
  showAddPlayerModal = false;
  showRemovePlayerModal = false;

  teamForm: FormGroup;

  loadingPlayers = false;
  availablePlayers: any[] = [];
  playerToRemove: any = null;

  playerNameFilter: string = '';
  selectedTeamId: number | null = null;
  selectedPositionId: number | null = null;
  teams: any[] = [];
  positions: any[] = [];
  loadingTeams = false;
  loadingPositions = false;

  private teamId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private fantasyTeamsService: FantasyTeamsService,
    private playersService: PlayersService,
    private fantasyTeamPlayersService: FantasyTeamPlayersService,
    private teamsService: TeamsService,
    private positionsService: PositionsService
  ) {
    this.teamForm = this.formBuilder.group({
      name: ['', Validators.required]
    });
  }

  loadTeams(): void {
    this.loadingTeams = true;

    this.teamsService.apiTeamsGet()
      .subscribe({
        next: (response) => {
          this.teams = response.teams || [];
          this.loadingTeams = false;
        },
        error: (err) => {
          console.error('Error loading teams:', err);
          this.loadingTeams = false;
        }
      });
  }

  loadPositions(): void {
    this.loadingPositions = true;

    this.positionsService.apiPositionsGet()
      .subscribe({
        next: (response) => {
          this.positions = response.positions || [];
          this.loadingPositions = false;
        },
        error: (err) => {
          console.error('Error loading positions:', err);
          this.loadingPositions = false;
        }
      });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.teamId = +id;
        this.loadTeamDetails();
        this.loadTeams();
        this.loadPositions();
      } else {
        this.error = 'Team ID not found';
      }
    });
  }

  loadTeamDetails(): void {
    if (!this.teamId) return;

    this.loading = true;
    this.error = null;

    this.fantasyTeamsService.apiFantasyTeamsIdGet(this.teamId)
      .subscribe({
        next: (response: ApiFantasyTeamsIdGet200Response) => {
          this.fantasyTeam = response.fantasy_team || null;
          this.players = response.players || [];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load team details. Please try again.';
          console.error('Error loading team details:', err);
          this.loading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/fantasy-teams']);
  }

  editTeam(): void {
    if (!this.fantasyTeam) return;

    this.teamForm.patchValue({
      name: this.fantasyTeam.name
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  saveTeam(): void {
    if (this.teamForm.invalid || !this.fantasyTeam || !this.teamId) return;

    const teamData = {
      fantasy_team: {
        name: this.teamForm.value.name
      }
    };

    this.fantasyTeamsService.apiFantasyTeamsIdPut(this.teamId, teamData)
      .subscribe({
        next: () => {
          this.closeEditModal();
          this.loadTeamDetails();
        },
        error: (err) => {
          this.error = 'Failed to update team. Please try again.';
          console.error('Error updating team:', err);
        }
      });
  }

  confirmDeleteTeam(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  deleteTeam(): void {
    if (!this.teamId) return;

    this.fantasyTeamsService.apiFantasyTeamsIdDelete(this.teamId)
      .subscribe({
        next: () => {
          this.router.navigate(['/fantasy-teams']);
        },
        error: (err) => {
          this.error = 'Failed to delete team. Please try again.';
          console.error('Error deleting team:', err);
          this.closeDeleteModal();
        }
      });
  }

  openAddPlayerModal(): void {
    this.loadingPlayers = true;
    this.availablePlayers = [];
    this.showAddPlayerModal = true;

    this.playerNameFilter = '';
    this.selectedTeamId = null;
    this.selectedPositionId = null;

    this.loadFilteredPlayers();
  }

  loadFilteredPlayers(): void {
    this.loadingPlayers = true;

    this.playersService.apiPlayersGet(
      undefined, // page
      undefined, // size
      this.playerNameFilter || undefined,
      undefined, // numberFilter
      this.selectedTeamId || undefined,
      this.selectedPositionId || undefined
    )
      .subscribe({
        next: (response) => {
          const currentPlayerIds = this.players.map(p => p.id);
          this.availablePlayers = (response.players || []).filter(p => !currentPlayerIds.includes(p.id));
          this.loadingPlayers = false;
        },
        error: (err) => {
          this.error = 'Failed to load available players. Please try again.';
          this.loadingPlayers = false;
        }
      });
  }

  applyFilters(): void {
    this.loadFilteredPlayers();
  }

  clearFilters(): void {
    this.playerNameFilter = '';
    this.selectedTeamId = null;
    this.selectedPositionId = null;
    this.loadFilteredPlayers();
  }

  closeAddPlayerModal(): void {
    this.showAddPlayerModal = false;
  }

  addPlayer(player: any): void {
    if (!this.teamId) return;

    const playerData = {
      player: {
        player_id: player.id
      }
    };

    this.fantasyTeamPlayersService.apiFantasyTeamsFantasyTeamIdPlayersPost(this.teamId, playerData)
      .subscribe({
        next: () => {
          this.closeAddPlayerModal();
          this.loadTeamDetails();
        },
        error: (err) => {
          this.error = 'Failed to add player to team. Please try again.';
        }
      });
  }

  removePlayer(player: any): void {
    this.playerToRemove = player;
    this.showRemovePlayerModal = true;
  }

  closeRemovePlayerModal(): void {
    this.showRemovePlayerModal = false;
    this.playerToRemove = null;
  }

  confirmRemovePlayer(): void {
    if (!this.teamId || !this.playerToRemove) return;

    const fantasyTeamPlayer = this.players.find(p => p.fantasy_team_player_id === this.playerToRemove.fantasy_team_player_id);
    if (!fantasyTeamPlayer || !fantasyTeamPlayer.fantasy_team_player_id) {
      this.error = 'Could not find player association. Please try again.';
      this.closeRemovePlayerModal();
      return;
    }

    this.fantasyTeamPlayersService.apiFantasyTeamsFantasyTeamIdPlayersIdDelete(
      this.teamId,
      fantasyTeamPlayer.fantasy_team_player_id
    )
      .subscribe({
        next: () => {
          this.closeRemovePlayerModal();
          this.loadTeamDetails();
        },
        error: (err) => {
          this.error = 'Failed to remove player from team. Please try again.';
          console.error('Error removing player:', err);
          this.closeRemovePlayerModal();
        }
      });
  }
}
