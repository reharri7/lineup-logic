import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { PlayersService } from 'src/app/services/generated/api/players.service';
import { PositionsService } from 'src/app/services/generated/api/positions.service';
import { TeamsService } from 'src/app/services/generated/api/teams.service';
import { PlayerRankingsService } from 'src/app/services/player-rankings.service';

@Component({
  selector: 'app-player-rankings',
  templateUrl: './player-rankings.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DragDropModule]
})
export class PlayerRankingsComponent implements OnInit {
  positions: any[] = [];
  selectedPosition: string = '';
  availablePlayers: any[] = [];
  selectedPlayers: any[] = [];
  loading = false;
  error: string | null = null;

  playerNameFilter: string = '';
  selectedTeamId: number | null = null;
  teams: any[] = [];
  loadingTeams = false;

  exportedRankings: string = '';
  importRankings: string = '';
  showExportModal = false;
  showImportModal = false;
  importError: string | null = null;
  importSuccess = false;

  constructor(
    private playersService: PlayersService,
    private positionsService: PositionsService,
    private teamsService: TeamsService,
    private playerRankingsService: PlayerRankingsService
  ) {}

  ngOnInit(): void {
    this.loadPositions();
    this.loadTeams();
  }

  loadPositions(): void {
    this.positionsService.apiPositionsGet()
      .subscribe({
        next: (response) => {
          this.positions = response.positions || [];
        },
        error: (err) => {
          this.error = 'Failed to load positions. Please try again.';
          console.error('Error loading positions:', err);
        }
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

  onPositionChange(): void {
    this.loadPlayersByPosition();
  }

  loadPlayersByPosition(): void {
    if (!this.selectedPosition) return;

    this.loading = true;
    this.error = null;

    const position = this.positions.find(p => p.position_name === this.selectedPosition);
    const positionId = position?.id;

    this.playersService.apiPlayersGet(
      undefined,
      undefined,
      this.playerNameFilter || undefined,
      undefined,
      this.selectedTeamId || undefined,
      positionId !== undefined ? positionId : undefined
    ).subscribe({
      next: (response) => {
        const savedRankings = this.playerRankingsService.getRankings(this.selectedPosition);
        const allPlayers = response.players || [];

        const playerMap = new Map(allPlayers.map(p => [p.id, p]));

        if (savedRankings.length > 0) {
          this.selectedPlayers = savedRankings
            .filter(id => playerMap.has(id))
            .map(id => playerMap.get(id));

          const selectedPlayerIds = new Set(this.selectedPlayers.map(p => p.id));

          this.availablePlayers = allPlayers.filter(p => !selectedPlayerIds.has(p.id));
        } else {
          this.availablePlayers = [...allPlayers];
          this.selectedPlayers = [];
        }

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load players. Please try again.';
        console.error('Error loading players:', err);
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.refreshPlayerLists();
  }

  clearFilters(): void {
    this.playerNameFilter = '';
    this.selectedTeamId = null;
    this.refreshPlayerLists();
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.selectedPlayers, event.previousIndex, event.currentIndex);
    this.saveRankings();
  }

  movePlayerUp(index: number): void {
    if (index > 0) {
      // Swap with the player above
      [this.selectedPlayers[index - 1], this.selectedPlayers[index]] =
        [this.selectedPlayers[index], this.selectedPlayers[index - 1]];

      // Save the new rankings
      this.saveRankings();
    }
  }

  movePlayerDown(index: number): void {
    if (index < this.selectedPlayers.length - 1) {
      [this.selectedPlayers[index], this.selectedPlayers[index + 1]] =
        [this.selectedPlayers[index + 1], this.selectedPlayers[index]];

      this.saveRankings();
    }
  }

  saveRankings(): void {
    if (!this.selectedPosition) return;

    const playerIds = this.selectedPlayers.map(p => p.id).filter((id): id is number => id !== undefined);
    this.playerRankingsService.saveRankings(this.selectedPosition, playerIds);
  }

  addPlayerToRankings(player: any): void {
    const index = this.availablePlayers.findIndex(p => p.id === player.id);
    if (index !== -1) {
      this.availablePlayers.splice(index, 1);
      this.selectedPlayers.push(player);
      this.saveRankings();
    }
  }

  removePlayerFromRankings(player: any): void {
    const index = this.selectedPlayers.findIndex(p => p.id === player.id);
    if (index !== -1) {
      this.selectedPlayers.splice(index, 1);
      this.availablePlayers.push(player);
      this.saveRankings();
    }
  }

  clearCurrentRankings(): void {
    if (!this.selectedPosition) return;

    this.playerRankingsService.clearRankings(this.selectedPosition);

    this.availablePlayers = [...this.availablePlayers, ...this.selectedPlayers];
    this.selectedPlayers = [];
  }

  openExportModal(): void {
    this.exportedRankings = this.playerRankingsService.exportRankings();
    this.showExportModal = true;
  }

  closeExportModal(): void {
    this.showExportModal = false;
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.exportedRankings)
      .then(() => {
        // Success
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }

  openImportModal(): void {
    this.importRankings = '';
    this.importError = null;
    this.importSuccess = false;
    this.showImportModal = true;
  }

  closeImportModal(): void {
    this.showImportModal = false;
  }

  submitImport(): void {
    this.importError = null;
    this.importSuccess = false;

    if (!this.importRankings) {
      this.importError = 'Please enter rankings to import';
      return;
    }

    const success = this.playerRankingsService.importRankings(this.importRankings);

    if (success) {
      this.importSuccess = true;

      if (this.selectedPosition) {
        this.loadPlayersByPosition();
      }
    } else {
      this.importError = 'Failed to import rankings. Please check the format and try again.';
    }
  }

  refreshPlayerLists(): void {
    if (this.selectedPosition) {
      this.loadPlayersByPosition();
    }
  }
}
